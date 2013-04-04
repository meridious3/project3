var kBoardWidth = 8;
var kBoardHeight= 8;
var kNumPieces = 5;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;
var gPattern;

var gPieces;
var gNumPieces;
var gSelectedPieceIndex;
var gSelectedPieceHasMoved;
var gMoveCount;
var gMoveCountElem;
var gGameInProgress;

function Cell(row, column) {
    this.row = row;
    this.column = column;
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
    for (var i = 0; i < gNumPieces; i++) {
	if ((gPieces[i].row == cell.row) && 
	    (gPieces[i].column == cell.column)) {
	    clickOnPiece(i);
	    return;
	}
    }
    clickOnEmptyCell(cell);
}

function clickOnEmptyCell(cell) {
    if (gSelectedPieceIndex == -1) { return; }
    var rowDiff = Math.abs(cell.row - gPieces[gSelectedPieceIndex].row);
    var columnDiff = Math.abs(cell.column - gPieces[gSelectedPieceIndex].column);
    if ((rowDiff <= 1) &&
	(columnDiff <= 1)) {
	/* we already know that this click was on an empty square,
	   so that must mean this was a valid single-square move */
	gPieces[gSelectedPieceIndex].row = cell.row;
	gPieces[gSelectedPieceIndex].column = cell.column;
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

function clickOnPiece(pieceIndex) {
    if (gSelectedPieceIndex == pieceIndex) { return; }
    gSelectedPieceIndex = pieceIndex;
    gSelectedPieceHasMoved = false;
    drawBoard();
}

function isThereAPieceBetween(cell1, cell2) {
    /* note: assumes cell1 and cell2 are 2 squares away
       either vertically, horizontally, or diagonally */
    var rowBetween = (cell1.row + cell2.row) / 2;
    var columnBetween = (cell1.column + cell2.column) / 2;
    for (var i = 0; i < gNumPieces; i++) {
	if ((gPieces[i].row == rowBetween) &&
	    (gPieces[i].column == columnBetween)) {
	    return true;
	}
    }
    return false;
}

function isTheGameOver() {
    for (var i = 0; i < gNumPieces; i++) {
	if (gPieces[i].row > 2) {
	    return false;
	}
	if (gPieces[i].column < (kBoardWidth - 3)) {
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
    
    for (var i = 0; i < 9; i++) {
	drawPiece(gPieces[i], i == gSelectedPieceIndex);
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

function supportsLocalStorage() {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

function saveGameState() {
    if (!supportsLocalStorage()) { return false; }
    localStorage["board.game.in.progress"] = gGameInProgress;
    for (var i = 0; i < kNumPieces; i++) {
	localStorage["board.piece." + i + ".row"] = gPieces[i].row;
	localStorage["board.piece." + i + ".column"] = gPieces[i].column;
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
    gPieces = new Array(kNumPieces);
    for (var i = 0; i < kNumPieces; i++) {
	var row = parseInt(localStorage["board.piece." + i + ".row"]);
	var column = parseInt(localStorage["board.piece." + i + ".column"]);
	gPieces[i] = new Cell(row, column);
    }
    gNumPieces = kNumPieces;
    gSelectedPieceIndex = parseInt(localStorage["board.selectedpiece"]);
    gSelectedPieceHasMoved = localStorage["board.selectedpiecehasmoved"] == "true";
    gMoveCount = parseInt(localStorage["board.movecount"]);
    drawBoard();
    return true;
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

       gPieces = [new Cell(3, 3),
           new Cell(3, 4),
           new Cell(4, 3),
           new Cell(4, 4)];
    
    gNumPieces = gPieces.length;
    gSelectedPieceIndex = -1;
    gSelectedPieceHasMoved = false;
    gMoveCount = 0;
    gGameInProgress = true;
    drawBoard();
}

function endGame() {
    gSelectedPieceIndex = -1;
    gGameInProgress = false;
}

function initGame(canvasElement, moveCountElement) {
    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
	canvasElement.id = "halma_canvas";
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