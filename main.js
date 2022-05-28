'use strict'
var cellClickedCount = 0
var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    shownMines: 0
}
var gIsHintOn = false
var glivesLeft = 3
var gFirstCell
var gMinesLocation
var gStartTime
var gIntervalId
var gIsSadImg
var gMinesRemain
var gSafeClicksLeft = 3
var gflashCellInt

var MINE_IMG = '<img src="img/mine.png" />'
var FLAG_IMG = '<img src="img/flag.png" />'
var HINT_IMG = '<img src="img/hint/hint.png" />'
var HINTON_IMG = '<img src="img/hint/hinton.png" />'

var gSmileies = {
    NORMAL: '<img src="img/smiley/normal.png" />',
    SAD: '<img src="img/smiley/sad.png" />',
    WIN: '<img src="img/smiley/win.png" />',
    DEAD: '<img src="img/smiley/dead.png" />'
}

function initGame(firstClick = false, elCell, i, j) {
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    if (firstClick) {
        cellClicked(elCell, i, j)
    }
    renderBoard(gBoard)
    gGame.isOn = true
}

function buildBoard() {
    glivesLeft = 3
    var elLivesCount = document.querySelector('.lives span')
    elLivesCount.innerHTML = glivesLeft
    var board = createMat(gLevel.SIZE, gLevel.SIZE)
    if (cellClickedCount > 0) {
        gMinesLocation = createMines(board)
        console.log('gMinesLocation: ', gMinesLocation)
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false

            }
            board[i][j] = cell
        }
    }
    if (cellClickedCount > 0) {

        for (var i = 0; i < gLevel.MINES; i++) {
            var currMine = gMinesLocation[i]
            board[currMine.i][currMine.j].isMine = true
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = gBoard[i][j]
            var cellClass = getClassName({ i: i, j: j })
            if (currCell.isShown) {
                cellClass += " showncell"
            }
            strHTML += `<td class="cell ${cellClass}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">`
            if (currCell.isShown) {
                strHTML += currCell.minesAroundCount
            }


            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

    gMinesRemain = gLevel.MINES
}

function createMines(board) {
    var minesLocs = []
    for (var i = 0; i < gLevel.MINES; i++) {
        var mine =
        {
            i: getRandomInt(0, board.length),
            j: getRandomInt(0, board[0].length)
        }
        while ((cellClickedCount > 0 && mine.i === gFirstCell[0] && mine.j === gFirstCell[1])) {
            var mine =
            {
                i: getRandomInt(0, board.length),
                j: getRandomInt(0, board[0].length)
            }
        }
        for (var d = 0; d < minesLocs.length; d++) {
            while (mine === minesLocs[d]) {
                var mine =
                {
                    i: getRandomInt(0, board.length),
                    j: getRandomInt(0, board[0].length)
                }
            }
        }
        minesLocs.push(mine)
    } return minesLocs
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function setMinesNegsCount(board) {
    for (var d = 0; d < board.length; d++) {
        for (var f = 0; f < board[0].length; f++) {
            var minesCount = 0
            for (var i = d - 1; i <= d + 1; i++) {
                if (i < 0 || i > board.length - 1) continue
                for (var j = f - 1; j <= f + 1; j++) {
                    if (j < 0 || j > board[0].length - 1) continue
                    if (i === d && j === f) continue

                    var currCell = board[i][j]
                    if (currCell.isMine) {
                        minesCount++
                    }

                }
            }
            board[d][f].minesAroundCount = minesCount === 0 ? "" : minesCount;
        }
    }
    return board
}

function cellClicked(elCell, i, j) {
    if (!gIntervalId) {
        startTimer()
    }
    if (cellClickedCount === 0) {
        cellClickedCount++
        gFirstCell = [i, j]
        initGame(true, elCell, i, j)
        return
    }

    if (gGame.isOn) {

        var currCell = gBoard[i][j]
        if (!currCell.isMarked && !currCell.isShown) {
            if (currCell.isMine) {
                elCell.innerHTML = MINE_IMG
                elCell.classList.add("showncell")
                currCell.isShown = true
                --glivesLeft
                var elLivesCount = document.querySelector('.lives span')
                elLivesCount.innerHTML = glivesLeft
                ++gGame.shownCount
                ++gGame.shownMines
                var elSmiley = document.querySelector(".smiley")
                elSmiley.innerHTML = gSmileies.SAD
                --gMinesRemain
                if (gGame.shownMines < 3) {
                    setTimeout(function () {
                        elSmiley.innerHTML = gSmileies.NORMAL
                    }, 2000)
                }
            } else {
                elCell.innerHTML = currCell.minesAroundCount;
                elCell.classList.add("showncell")
                currCell.isShown = true
                ++gGame.shownCount
                if (elCell.innerHTML === "")
                    expandShown(gBoard, elCell, i, j)
            }
        } else return
    }
}

function cellMarked(elCell, i, j) {
    if (gGame.secsPassed === 0) {
        startTimer()
    }
    var currCell = gBoard[i][j]
    if (!currCell.isShown) {
        elCell.classList.toggle("marked")
        currCell.isMarked = currCell.isMarked ? false : true;
        currCell.isMarked ? ++gGame.markedCount : --gGame.markedCount
        elCell.innerHTML = currCell.isMarked ?
            FLAG_IMG : '';

    }
}

function checkGameOver() {
    if ((gGame.shownCount === (gBoard.length * gBoard[0].length) - gMinesRemain) && gMinesRemain === gGame.markedCount) {
        resetVars()
        for (var i = 0; i < gMinesLocation.length; i++) {
            var currMine = gMinesLocation[i]
            var cellClass = getClassName(currMine)
            var cellSelector = '.' + cellClass
            var currElCell = document.querySelector(cellSelector)
            currElCell.innerHTML = MINE_IMG
            currElCell.classList.add("showncell")
            resetVars()

        }
        var elSmiley = document.querySelector(".smiley")
        elSmiley.innerHTML = gSmileies.WIN
    } else if (gGame.shownMines > 2) {
        var elSmiley = document.querySelector(".smiley")
        elSmiley.innerHTML = gSmileies.DEAD
        resetVars()
    }
}

function expandShown(board, elCell, i, j) {
    for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x > board.length - 1) continue
        for (var m = j - 1; m <= j + 1; m++) {
            if (m < 0 || m > board[0].length - 1) continue
            if (x === i && m === j) continue
            var currCell = board[x][m]
            if (!currCell.isMarked && !currCell.isShown) {
                var cellClass = getClassName({ i: x, j: m })
                var cellSelector = '.' + cellClass
                var currElCell = document.querySelector(cellSelector)
                currElCell.classList.add("showncell")
                currElCell.innerHTML = currCell.minesAroundCount;
                currCell.isShown = true
                ++gGame.shownCount
                if (currElCell.innerHTML === "")
                    expandShown(board, currElCell, x, m)
            } else continue
        }
    }
}

function startTimer() {
    gStartTime = Date.now()
    gIntervalId = setInterval(updateTime, 80)
}


function updateTime(time = gGame.secsPassed.toFixed(3)) {
    var now = Date.now()
    var diff = now - gStartTime
    gGame.secsPassed = diff / 1000
    checkGameOver()
    var elTimerSpan = document.querySelector('.timer')
    elTimerSpan.innerText = time

}

function changeLevel(level = gLevel.SIZE) {
    var elBody = document.querySelector('body')
    if (level === 4) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        elBody.style.zoom = 0.59
    } else if (level === 8) {
        gLevel.SIZE = 8
        gLevel.MINES = 12
        elBody.style.zoom = 0.5
    } else if (level === 12) {
        gLevel.SIZE = 12
        gLevel.MINES = 30
        elBody.style.zoom = 0.43
    }
    glivesLeft = 3
    var elLivesCount = document.querySelector('.lives span')
    elLivesCount.innerHTML = glivesLeft


    resetVars()
    initGame()
}

function resetVars() {
    clearInterval(gIntervalId)
    gIntervalId = false
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        shownMines: 0
    }

    cellClickedCount = 0
    glivesLeft = 3
    gSafeClicksLeft = 3
}

function smileyClicked(smiley) {
    smiley.innerHTML = gSmileies.NORMAL
    glivesLeft = 3
    var elLivesCount = document.querySelector('.lives span')
    elLivesCount.innerHTML = glivesLeft
    resetVars()
    initGame()
}

function createSafeClicks(elButton) {
    if (gSafeClicksLeft < 1) {
        return
    }
    if (gSafeClicksLeft === 1) {
        elButton.style.backgroundColor = "gray"
    }
    var i = getRandomInt(0, gBoard.length)
    var j = getRandomInt(0, gBoard[0].length)
    var res = gBoard[i][j]
    while (gBoard[i][j].isMine || gBoard[i][j].isShown) {
        i = getRandomInt(0, gBoard.length)
        j = getRandomInt(0, gBoard[0].length)
    }
    var elClass = getClassName({ i, j })
    console.log('elClass: ', elClass)
    var elCell = document.querySelector("." + elClass)

    gflashCellInt = setInterval(function () {
        elCell.style.backgroundColor = "red"
    }, 100)

    setTimeout(function () {
        clearInterval(gflashCellInt)
        elCell.style.backgroundColor = "rgba(45, 136, 215, 0.867)"
    }, 3000)
    --gSafeClicksLeft
    var elSpan = elButton.querySelector("span")
    elSpan.innerHTML = gSafeClicksLeft
}