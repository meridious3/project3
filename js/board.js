var kBoardWidth = 8;
var kBoardHeight= 8;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;
var gPattern;

var playerTurn;

var gPieces;
var p1Pieces;
var p2Pieces;
var gNumPieces;
var p1NumPieces;
var p2NumPieces;
var gSelectedPieceIndex;
//Have the user click twice to place a piece
var p1SelectedPieceIndex;
var p2SelectedPieceIndex;
var gSelectedPieceHasMoved;
var p1SelectedPieceHasMoved;
var p2SelectedPieceHasMoved;
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
    var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
    return cell;
}

function halmaOnClick(e) {
    var cell = getCursorPosition(e);
    for (var i = 0; i < p1NumPieces; i++) {
    	if ((p1Pieces[i].row == cell.row) && 
    	    (p1Pieces[i].column == cell.column)) {
    	    clickOnPiece(i,0);
    	    return;
    	}
    }
    for (var i = 0; i < p2NumPieces; i++) {
        if ((p2Pieces[i].row == cell.row) && 
            (p2Pieces[i].column == cell.column)) {
            clickOnPiece(i,1);
            return;
        }
    }
    clickOnEmptyCell(cell);
}

function clickOnEmptyCell(cell) {
    if (p1SelectedPieceIndex == -1) { return; }
    var rowDiff = Math.abs(cell.row - p1Pieces[gSelectedPieceIndex].row);
    var columnDiff = Math.abs(cell.column - gPieces[p1SelectedPieceIndex].column);
    if ((rowDiff <= 1) &&
	(columnDiff <= 1)) {
	/* we already know that this click was on an empty square,
	   so that must mean this was a valid single-square move */
	p1Pieces[p1SelectedPieceIndex].row = cell.row;
	p1Pieces[p1SelectedPieceIndex].column = cell.column;
	gMoveCount += 1;
	gSelectedPieceIndex = -1;
	gSelectedPieceHasMoved = false;
	drawBoard();
	return;
    }
    if ((((rowDiff == 2) && (columnDiff == 0)) ||
	 ((rowDiff == 0) && (columnDiff == 2)) ||
	 ((rowDiff == 2) && (columnDiff == 2))) && 
	isThereAPieceBetween(gPieces[gSelectedPieceIndex], cell)) {
	/* this was a valid jump */
	if (!gSelectedPieceHasMoved) {
	    gMoveCount += 1;
	}
	gSelectedPieceHasMoved = true;
	gPieces[gSelectedPieceIndex].row = cell.row;
	gPieces[gSelectedPieceIndex].column = cell.column;
	drawBoard();
	return;
    }
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function clickOnPiece(pieceIndex,team) {
    if (gSelectedPieceIndex == pieceIndex) { return; }
    if(team == 0) {
        p1SelectedPieceIndex = pieceIndex;
    }
    if(team == 1) {
        p2SelectedPieceIndex = pieceIndex;
    }
    //gSelectedPieceIndex = pieceIndex;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function isThereAPieceBetween(cell1, cell2) {
    /* note: assumes cell1 and cell2 are 2 squares away
       either vertically, horizontally, or diagonally */
    var rowBetween = (cell1.row + cell2.row) / 2;
    var columnBetween = (cell1.column + cell2.column) / 2;
    for (var i = 0; i < p1NumPieces; i++) {
        if ((p1Pieces[i].row == rowBetween) &&
            (p1Pieces[i].column == columnBetween)) {
            return true;
        }
    }
    for (var i = 0; i < p2NumPieces; i++) {
        if ((p2Pieces[i].row == rowBetween) &&
            (p2Pieces[i].column == columnBetween)) {
            return true;
        }
    }
    return false;
}

// function isTheGameOver() {
//     for (var i = 0; i < gNumPieces; i++) {
// 	if (gPieces[i].row > 2) {
// 	    return false;
// 	}
// 	if (gPieces[i].column < (kBoardWidth - 3)) {
// 	    return false;
// 	}
//     }
//     return true;
// }

function isTheGameOver() {
    for (var i = 0; i < p1NumPieces; i++) {
        if (p1Pieces[i].row > 2) {
            return false;
        }
        if (p1Pieces[i].column < (kBoardWidth - 3)) {
            return false;
        }
    }

    for (var i = 0; i < p2NumPieces; i++) {
        if (p2Pieces[i].row > 2) {
            return false;
        }
        if (p2Pieces[i].column < (kBoardWidth - 3)) {
            return false;
        }
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

    for (var i = 0; i < 12; i++) {
       // drawP1Piece(p1Pieces[i], i == p1SelectedPieceIndex);
       drawP1Piece(p1Pieces[i], i == gSelectedPieceIndex, 0);
    }

    for (var i = 0; i < 12; i++) {
       // drawP2Piece(p2Pieces[i], i == p2SelectedPieceIndex);
       drawP2Piece(p2Pieces[i], i == gSelectedPieceIndex, 1);
    }

    gMoveCountElem.innerHTML = gMoveCount;

    saveGameState();
}

function drawPiece(p, selected) {
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth) + (kPieceWidth/2);
    var y = (row * kPieceHeight) + (kPieceHeight/2);
    var radius = (kPieceWidth/2) - (kPieceWidth/10);
    gDrawingContext.beginPath();
    gDrawingContext.arc(x, y, radius, 0, Math.PI*2, false);
    gDrawingContext.closePath();
    gDrawingContext.strokeStyle = "rgb(0,0,0)";
    gDrawingContext.stroke();
    if (selected) {
	   gDrawingContext.fillStyle = "rgb(150,150,150)";
	   gDrawingContext.fill();
    }
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
    gDrawingContext.strokeStyle = "rgb(0,0,0)";
    gDrawingContext.stroke();
    gDrawingContext.fillStyle = "rgb(255,0,0)"
    gDrawingContext.fill();
    if (selected) {
        gDrawingContext.fillStyle = "rgb(150,150,150)";
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
    gDrawingContext.fillStyle = "rgb(230,230,230)"
    gDrawingContext.fill();
    if (selected) {
        gDrawingContext.fillStyle = "rgb(150,150,150)";
        gDrawingContext.fill();
    }
}

if (typeof resumeGame != "function") {
    saveGameState = function() {
	   return false;
    }
    resumeGame = function() {
	   return false;
    }
}

function newGame() {
    // gPieces = [new Cell(kBoardHeight - 3, 0),
	   //     new Cell(kBoardHeight - 2, 0),
	   //     new Cell(kBoardHeight - 1, 0),
	   //     new Cell(kBoardHeight - 3, 1),
	   //     new Cell(kBoardHeight - 2, 1),
	   //     new Cell(kBoardHeight - 1, 1),
	   //     new Cell(kBoardHeight - 3, 2),
	   //     new Cell(kBoardHeight - 2, 2),
	   //     new Cell(kBoardHeight - 1, 2)];

       // gPieces = [new Cell(3, 3),
       //     new Cell(3, 4),
       //     new Cell(4, 3),
       //     new Cell(4, 4)];

    p1Pieces = [new Cell(0,1,0),
                new Cell(0,3,0),
                new Cell(0,5,0),
                new Cell(0,7,0),
                new Cell(1,0,0),
                new Cell(1,2,0),
                new Cell(1,4,0),
                new Cell(1,6,0),
                new Cell(2,1,0),
                new Cell(2,3,0),
                new Cell(2,5,0),
                new Cell(2,7,0)
                ];

    p2Pieces = [new Cell(5,0,1),
                new Cell(5,2,1),
                new Cell(5,4,1),
                new Cell(5,6,1),
                new Cell(6,1,1),
                new Cell(6,3,1),
                new Cell(6,5,1),
                new Cell(6,7,1),
                new Cell(7,0,1),
                new Cell(7,2,1),
                new Cell(7,4,1),
                new Cell(7,6,1)
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
    p1SelectedPieceIndex = -1;
    p2SelectedPieceIndex = -1;
    gGameInProgress = false;
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
    gCanvasElement.addEventListener("click", halmaOnClick, false);
    gMoveCountElem = moveCountElement;
    gDrawingContext = gCanvasElement.getContext("2d");
    if (!resumeGame()) {
	newGame();
    }
}
