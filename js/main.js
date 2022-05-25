'use strict'

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
var gMinesLocation
var gStartTime
var gIntervalId

var MINE_IMG = '<img src="img/mine.png" />'
var FLAG_IMG = '<img src="img/flag.png" />'

function initGame() {
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    console.log('gBoard: ', gBoard)
    renderBoard(gBoard)
    gGame.isOn = true
}

function startGame() {
    if (gGame.secsPassed < 0.01) {

        startTimer()
    }
}
function createMines(board) {
    var minesLocs = []
    for (var i = 0; i < gLevel.MINES; i++) {
        var mine =
        {
            i: getRandomInt(0, board.length),
            j: getRandomInt(0, board[0].length)
        }
        minesLocs.push(mine)
    } return minesLocs
}
function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function buildBoard() {

    var board = createMat(gLevel.SIZE, gLevel.SIZE)
    gMinesLocation = createMines(board)
    console.log('gMinesLocation: ', gMinesLocation)

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
    console.log('g: ', gMinesLocation)
    for (var i = 0; i < gLevel.MINES; i++) {
        var currMine = gMinesLocation[i]
        board[currMine.i][currMine.j].isMine = true
    }

    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            strHTML += `<td class="cell ${cellClass}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">`



            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board')
    console.log('elBoard: ', elBoard)
    elBoard.innerHTML = strHTML

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
    if (gGame.isOn) {
        var currCell = gBoard[i][j]
        if (!currCell.isMarked && !currCell.isShown) {
            if (currCell.isMine) {
                elCell.innerHTML = MINE_IMG
                elCell.classList.add("showncell")
                currCell.isShown = true
                ++gGame.shownCount
                ++gGame.shownMines
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
    if ((gGame.shownCount === (gBoard.length * gBoard[0].length) - gLevel.MINES) && gLevel.MINES === gGame.markedCount) {
        clearInterval(gIntervalId)
        gGame.isOn = false
        for (var i = 0; i < gMinesLocation.length; i++) {
            var currMine = gMinesLocation[i]
            var cellClass = getClassName(currMine)
            var cellSelector = '.' + cellClass
            var currElCell = document.querySelector(cellSelector)
            currElCell.innerHTML = MINE_IMG
            currElCell.classList.add("showncell")
            gGame.isOn = false
        }
    } else if (gGame.shownMines > 0) {
        clearInterval(gIntervalId)
        gGame.isOn = false
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


function updateTime() {
    var now = Date.now()
    var diff = now - gStartTime
    gGame.secsPassed = diff / 1000
    checkGameOver()
    var elTimerSpan = document.querySelector('.timer')
    elTimerSpan.innerText = gGame.secsPassed.toFixed(3)

}
