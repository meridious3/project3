var kBoardWidth = 8;
var kBoardHeight= 8;
var kNumPieces = 24;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;
var gPattern;
var gPieces;
var p1Pieces;
var p2Pieces;
var gNumPieces;
var p1NumPieces = 12;
var p2NumPieces = 12;
//Showing which team is selected
var selectedTeam = null;
var gSelectedPieceIndex;
//Have the user click twice to place a piece
var p1SelectedPieceIndex;
var p2SelectedPieceIndex;
var gSelectedPieceHasMoved;
var p1SelectedPieceHasMoved;
var p2SelectedPieceHasMoved;
var rowDiff;
var columnDiff;
var rRow; // remove row at value
var rColumn // remove column at value
var gMoveCount;
var gMoveCountElem;
var gGameInProgress;

function Cell(row, column, team) {
    this.row = row;
    this.column = column;
    this.team = team;
}

function getCursorPosition(e) {
    /* returns Cell with .row and .column properties */
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
       x = e.pageX;
       y = e.pageY;
    }
    else {
       x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
       y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;
    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);
    //Douglas, Team '2' is the cursor.
    var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth) , 2);
    return cell;
}

function chipOnClick(e) {
    var cell = getCursorPosition(e);
    for (var i = 0; i < p1NumPieces; i++) {
        if ((p1Pieces[i].row == cell.row) && 
            (p1Pieces[i].column == cell.column)) {
            selectedTeam = 0;
            clickOnPiece(i,selectedTeam);
            return;
        }
    }

    for (var i = 0; i < p2NumPieces; i++) {
        if ((p2Pieces[i].row == cell.row) && 
            (p2Pieces[i].column == cell.column)) {
            selectedTeam = 1;
            clickOnPiece(i,selectedTeam);
            return;
        }
    }
    clickOnEmptyCell(cell, selectedTeam);
}

function clickOnEmptyCell(cell, selectedTeam) {
    if (gSelectedPieceIndex == -1) { return; }
    if(selectedTeam == null || selectedTeam == 2) { return; }
    //Math.abs --> Math.floor --> (null)
    if(selectedTeam == 0) {
        rowDiff = Math.ceil(cell.row - p1Pieces[gSelectedPieceIndex].row);
        columnDiff = Math.ceil(cell.column - p1Pieces[gSelectedPieceIndex].column);

        if ((rowDiff == 1) && (columnDiff == 1 || columnDiff == -1)) {
            /* this was a valid jump */
            if (!gSelectedPieceHasMoved) {
                gMoveCount += 1;
            }
            gSelectedPieceHasMoved = true;
            p1Pieces[gSelectedPieceIndex].row = cell.row;
            p1Pieces[gSelectedPieceIndex].column = cell.column;
            selectedTeam = null;
            drawBoard();
            return;
        }

        if (((rowDiff == 2) && (columnDiff == 2 || columnDiff == -2)) && pieceHop(cell, rowDiff, columnDiff, selectedTeam)) {
            /* this was a valid jump */
            if (!gSelectedPieceHasMoved) {
                gMoveCount += 1;
            }
            gSelectedPieceHasMoved = true;
            p1Pieces[gSelectedPieceIndex].row = cell.row;
            p1Pieces[gSelectedPieceIndex].column = cell.column;
            rRow = cell.row - 1;
            //rColumn = (p2Pieces[gSelectedPieceIndex].column + cell.column)/2;
            rColumn = cell.column - (columnDiff/2);
            for(var i = 0; i < p2NumPieces; i++) {
                if((p2Pieces[i].row == rRow) && (p2Pieces[i].column == rColumn)) {
                    p2Pieces.splice(i,1);
                    p2NumPieces -= 1;
                    kNumPieces -= 1;
                }
            }
            selectedTeam = null;
            drawBoard();
            return;
        }
    }
    if(selectedTeam == 1) {
        rowDiff = Math.ceil(cell.row - p2Pieces[gSelectedPieceIndex].row);
        columnDiff = Math.ceil(cell.column - p2Pieces[gSelectedPieceIndex].column);

        if ((rowDiff == -1) && (columnDiff == 1 || columnDiff == -1)) {
            /* this was a valid jump */
            if (!gSelectedPieceHasMoved) {
                gMoveCount += 1;
            }
            gSelectedPieceHasMoved = true;
            p2Pieces[gSelectedPieceIndex].row = cell.row;
            p2Pieces[gSelectedPieceIndex].column = cell.column;
            selectedTeam = null;
            drawBoard();
            return;
        }

        if (((rowDiff == -2) && (columnDiff == 2 || columnDiff == -2)) && pieceHop(cell, rowDiff, columnDiff, selectedTeam)) {
            /* this was a valid jump */
            if (!gSelectedPieceHasMoved) {
                gMoveCount += 1;
            }
            p2Pieces[gSelectedPieceIndex].row = cell.row;
            p2Pieces[gSelectedPieceIndex].column = cell.column;
            gSelectedPieceHasMoved = true;
            rRow = cell.row + 1;
            //rColumn = (p2Pieces[gSelectedPieceIndex].column + cell.column)/2;
            rColumn = cell.column - (columnDiff/2);
            for(var i = 0; i < p1NumPieces; i++) {
                if((p1Pieces[i].row == rRow) && (p1Pieces[i].column == rColumn)) {
                    p1Pieces.splice(i,1);
                    p1NumPieces -= 1;
                    kNumPieces -= 1;
                }
            }
            selectedTeam = null;
            drawBoard();
            return;
        }
        // selectedTeam = null;
        // drawBoard();
        // return;
    }
    //resetting the selected team
    //selectedTeam = null;
    //gSelectedPieceIndex = null;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function clickOnPiece(pieceIndex, team) {
    if (gSelectedPieceIndex == pieceIndex) { return; }
    if(team == 0) {
        p1SelectedPieceIndex = pieceIndex;
    }
    if(team == 1) {
        p2SelectedPieceIndex = pieceIndex;
    }
    gSelectedPieceIndex = pieceIndex;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function pieceHop(cell, rowDiff, columnDiff, selectedTeam) {
    if(selectedTeam == 0) {
        for(i=0; i<p1NumPieces; i++) {
            if(p1Pieces[i].row == (cell.row-1) && (p1Pieces[i].column == (cell.column - (columnDiff/2)))) {
                return false;
            }
        }

    }
    if(selectedTeam == 1) {
        for(i=0; i<p2NumPieces; i++) {
            if(p2Pieces[i].row == (cell.row+1) && (p2Pieces[i].column == (cell.column - (columnDiff/2)))) {
                return false;
            }
        }
        // if(!(p2Pieces[(cell.row+(rowDiff/2)),(cell.column+(columnDiff/2)),(1)])) {
        //     //p1Pieces.splice(i,1);
        //     // p1NumPieces -= 1;
        //     // kNumPieces -= 1;
        //     //p1Pieces[i].row = cell.row;
        //     //p1Pieces[i].column = cell.column;
        //     return true;
        // }
    }
    return true;
}

function isTheGameOver() {

    if(p1NumPieces!=0) {
        return false;
    }
    if(p2NumPieces!=0) {
        return false;
    }

    return true;
}

function drawBoard() {
    if (gGameInProgress && isTheGameOver()) {
       endGame();
    }

    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);

    gDrawingContext.beginPath();
    
    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
       gDrawingContext.moveTo(0.5 + x, 0);
       gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }
    
    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
       gDrawingContext.moveTo(0, 0.5 + y);
       gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }
    
    /* draw it! */
    gDrawingContext.strokeStyle = "rgb(204,204,204)";
    gDrawingContext.stroke();
    //gDrawingContext.fillStyle = "rgb(0,255,0)";
    //gDrawingContext.fill();
    
    // for (var i = 0; i < 9; i++) {
       // drawPiece(gPieces[i], i == gSelectedPieceIndex);
    // }

    for (var i = 0; i < p1NumPieces; i++) {
       // drawP1Piece(p1Pieces[i], i == gSelectedPieceIndex);
       drawP1Piece(p1Pieces[i], i == p1SelectedPieceIndex, 0);
       // drawP1Piece(p1Pieces[i], selectedTeam, 0);
    }
    p1SelectedPieceIndex = null;
    //gSelectedPieceIndex = -1;

    for (var i = 0; i < p2NumPieces; i++) {
       // drawP2Piece(p2Pieces[i], i == gSelectedPieceIndex);
       drawP2Piece(p2Pieces[i], i == p2SelectedPieceIndex, 1);
       // drawP2Piece(p2Pieces[i], selectedTeam, 1);
    }
    p2SelectedPieceIndex = null;
    //gSelectedPieceIndex = -1;

    gMoveCountElem.innerHTML = gMoveCount;

    saveGameState();
}

function drawP1Piece(p,selected,team) {
    var column = p.column;
    var row = p.row;
    var team = p.team;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = "rgb(255,255,255)";
    gDrawingContext.stroke();
    gDrawingContext.fillStyle = "rgb(0,0,0)";
    if (selected) {
        gDrawingContext.fillStyle = "rgb(255,255,51)";
        gDrawingContext.fill();
    }
}

function drawP2Piece(p,selected,team) {
    var column = p.column;
    var row = p.row;
    var team = p.team;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = "rgb(0,0,0)";
    gDrawingContext.stroke();
    gDrawingContext.fillStyle = "rgb(230,230,230)";
    gDrawingContext.fill();
    if (selected) {
        gDrawingContext.fillStyle = "rgb(255,255,51)";
        gDrawingContext.fill();
    }
}

function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

function saveGameState() {
    updateRemote();
    if (!supportsLocalStorage()) { return false; }
        localStorage["board.game.in.progress"] = gGameInProgress;
        localStorage.setItem('isSet', true);
    for (var i = 0; i < p1NumPieces; i++) {
       localStorage["board.p1Piece." + i + ".row"] = p1Pieces[i].row;
       localStorage["board.p1Piece." + i + ".column"] = p1Pieces[i].column;
       localStorage["board.p1Piece." + i + ".team"] = p1Pieces[i].team;
    }
    for(var i = 0; i < p2NumPieces; i++) {
        localStorage["board.p2Piece." + i + ".row"] = p2Pieces[i].row;
        localStorage["board.p2Piece." + i + ".column"] = p2Pieces[i].column;
        localStorage["board.p2Piece." + i + ".team"] = p2Pieces[i].team;
    }
    localStorage["board.selectedpiece"] = gSelectedPieceIndex;
    localStorage["board.selectedpiecehasmoved"] = gSelectedPieceHasMoved;
    localStorage["board.movecount"] = gMoveCount;
    return true;
}

function resumeGame() {
    if (!supportsLocalStorage()) { return false; }
        gGameInProgress = (localStorage["board.game.in.progress"] == "true");
    
    if (!gGameInProgress) { return false; }
    

        // gGameInProgress = (localStorage["board.game.in.progress"] == "true");
        //p1Pieces = new Array(kNumPieces/2);
    p1Pieces = new Array(p1NumPieces);
        //p2Pieces = new Array(kNumPieces/2);
    p2Pieces = new Array(p2NumPieces);
    for (var i = 0; i < p1NumPieces; i++) {
       var row = parseInt(localStorage["board.p1Piece." + i + ".row"]);
       var column = parseInt(localStorage["board.p1Piece." + i + ".column"]);
       var team = parseInt(localStorage["board.p1Piece." + i + ".team"]);
       p1Pieces[i] = new Cell(row, column, team);
    }
    for (var i = 0; i < p2NumPieces; i++) {
       var row = parseInt(localStorage["board.p2Piece." + i + ".row"]);
       var column = parseInt(localStorage["board.p2Piece." + i + ".column"]);
       var team = parseInt(localStorage["board.p2Piece." + i + ".team"]);
       p2Pieces[i] = new Cell(row, column, team);
    }
    
    loadBoard();

    gNumPieces = kNumPieces;
    gSelectedPieceIndex = parseInt(localStorage["board.selectedpiece"]);
    gSelectedPieceHasMoved = localStorage["board.selectedpiecehasmoved"] == "true";
    gMoveCount = parseInt(localStorage["board.movecount"]);
    drawBoard();
    return true;
}

function newGame() {

       p1Pieces = [ new Cell(0,1,0,0),
                    new Cell(0,3,0,0),
                    new Cell(0,5,0,0),
                    new Cell(0,7,0,0),
                    new Cell(1,0,0,0),
                    new Cell(1,2,0,0),
                    new Cell(1,4,0,0),
                    new Cell(1,6,0,0),
                    new Cell(2,1,0,0),
                    new Cell(2,3,0,0),
                    new Cell(2,5,0,0),
                    new Cell(2,7,0,0)
                    ];

        p2Pieces = [new Cell(5,0,1,0),
                    new Cell(5,2,1,0),
                    new Cell(5,4,1,0),
                    new Cell(5,6,1,0),
                    new Cell(6,1,1,0),
                    new Cell(6,3,1,0),
                    new Cell(6,5,1,0),
                    new Cell(6,7,1,0),
                    new Cell(7,0,1,0),
                    new Cell(7,2,1,0),
                    new Cell(7,4,1,0),
                    new Cell(7,6,1,0)
                    ];

    
    //gNumPieces = gPieces.length;
    p1NumPieces = p1Pieces.length;
    p2NumPieces = p2Pieces.length;
    gSelectedPieceIndex = -1;
    p1SelectedPieceIndex = -1;
    p2SelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
    gGameInProgress = true;
    drawBoard();
}

function endGame() {
    gSelectedPieceIndex = -1;
    p1SelectedIndex = -1;
    p2SelectedIndex = -1;
    if(gGameInProgress==true) {
        // localStorage.clear();
        gGameInProgress = (localStorage["board.game.in.progress"] == "false");
        gGameInProgress = false;
        drawBoard();
    }
    if(p1NumPieces==0) {
        alert("Player 2 has won!");
    }
    else if(p2NumPieces==0) {
        alert("Player 1 has won!");
    }
    else {
        alert("It was a draw!");
    }
    deleteGame();
}

function initGame(canvasElement, moveCountElement) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
    canvasElement.id = "checkers_canvas";
    document.body.appendChild(canvasElement);
    }
    if (!moveCountElement) {
        moveCountElement = document.createElement("p");
    document.body.appendChild(moveCountElement);
    }
    gCanvasElement = canvasElement;
    gCanvasElement.width = kPixelWidth;
    gCanvasElement.height = kPixelHeight;
    gCanvasElement.addEventListener("click", chipOnClick, false);
    gMoveCountElem = moveCountElement;
    gDrawingContext = gCanvasElement.getContext("2d");
    if (!resumeGame()) {
    newGame();
    }
}
