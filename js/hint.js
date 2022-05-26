function toggleHint(currHint) {
    gIsHintOn = gIsHintOn ? false : true;
    if (gIsHintOn) {
        currHint.innerHTML = HINTON_IMG
    } else currHint.innerHTML = HINT_IMG

}

function showHint(){
    
}