var gameId = 1;
var whichPlayerAmI = 2;

/* 
    I have the PHP that populates the page generate this var.
    playerID
    challengerID
    myTurn

    whichPlayerAmI
*/



var kBoardWidth = 8;
var kBoardHeight= 8;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;
var gPattern;

/*  */
var playerTurn;

//no longer needed
/*var gPieces;*/

var p1Pieces;
var p2Pieces;

// no longer needed
var gNumPieces;

var p1NumPieces = 12;
var p2NumPieces = 12;
//Showing which team is selected
//var selectedTeam = null;
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

//Test vars
var pTestRow;
var pTestCol;

function Cell(row, column, team, king) {
    this.row = row;
    this.column = column;
    this.team = team;
    this.king = king;
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
    //Douglas, team '2' is the cursor
    var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth), 2);
    return cell;
}

function chipOnClick(e) {
    if(gMoveCount%2==0) {
        var cell = getCursorPosition(e);
        for (var i = 0; i < p1NumPieces; i++) {
            if ((p1Pieces[i].row == cell.row) && 
                (p1Pieces[i].column == cell.column)) {
                selectedTeam = 0;
                clickOnPiece(i,selectedTeam);
                return;
            }
        }
    }
    else if(gMoveCount%2==1) {
        var cell = getCursorPosition(e);
        for (var i = 0; i < p2NumPieces; i++) {
            if ((p2Pieces[i].row == cell.row) && 
                (p2Pieces[i].column == cell.column)) {
                selectedTeam = 1;
                clickOnPiece(i,selectedTeam);
                return;
            }
        }
    }
    clickOnEmptyCell(cell, selectedTeam);
}

function clickOnEmptyCell(cell, selectedTeam) {
    if (gSelectedPieceIndex == -1) { return; }
    if(selectedTeam == null || selectedTeam == 2) { return; }
    pTestRow = cell.row;
    pTestCol = cell.column;
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
            //rColumn = (p1Pieces[gSelectedPieceIndex].column + cell.column)/2;
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
            gSelectedPieceHasMoved = true;
            p2Pieces[gSelectedPieceIndex].row = cell.row;
            p2Pieces[gSelectedPieceIndex].column = cell.column;
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

    /*TODO build in this for kings*/

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
    }

    // 

    return true;
}

function isTheGameOver() {

    if(p1NumPieces!=0 || p2NumPieces!=0) {
        return false;
    }
    return true;
}

function drawBoard() {
    if (gGameInProgress && isTheGameOver()) {
       endGame();
    }

    // loadBoard();

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
    //reset p1SelectedPieceIndex;
    p1SelectedPieceIndex = null;
    //gSelectedPieceIndex = -1;

    for (var i = 0; i < p2NumPieces; i++) {
       // drawP2Piece(p2Pieces[i], i == gSelectedPieceIndex);
       drawP2Piece(p2Pieces[i], i == p2SelectedPieceIndex, 1);
       //drawP2Piece(p2Pieces[i], selectedTeam, 1);
    }
    //reset p2SelectedPieceIndex;
    p2SelectedPieceIndex = null;
    //gSelectedPieceIndex = -1;

    gMoveCountElem.innerHTML = gMoveCount;

    
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
    gDrawingContext.fillStyle = "rgb(0,0,0)"
    gDrawingContext.fill();
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
    gDrawingContext.fillStyle = "rgb(230,230,230)"
    gDrawingContext.fill();
    if (selected) {
        gDrawingContext.fillStyle = "rgb(255,255,51)";
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

function updateRemote(){
    /* Serializes the gameboard */
    var out1 = "";
    if(typeof(p1Pieces) != undefined && p2Pieces != null){
        
        for (var i = 0; i < p1Pieces.length-1; i++) {
            out1 = out1 + String(p1Pieces[i]['row']) + "," + String(p1Pieces[i]['column']) + "," + String(p1Pieces[i]['team']) + "," + String(p1Pieces[i]['king']) + ":";
        };
        out1 = out1 + String(p1Pieces[p1Pieces.length-1]['row']) + "," + String(p1Pieces[p1Pieces.length-1]['column']) + "," + String(p1Pieces[p1Pieces.length-1]['team']) + "," + String(p1Pieces[p1Pieces.length-1]['king']);
    }

    var out2 = "";
    if(typeof(p2Pieces) != undefined && p2Pieces != null){
        for (var i = 0; i < p2Pieces.length-1; i++) {
            out2 = out2 + String(p2Pieces[i]['row']) + "," + String(p2Pieces[i]['column']) + "," + String(p2Pieces[i]['team']) + "," + String(p2Pieces[i]['king']) + ":";
        }; 
        out2 = out2 + String(p2Pieces[p2Pieces.length-1]['row']) + "," + String(p2Pieces[p2Pieces.length-1]['column']) + "," + String(p2Pieces[p2Pieces.length-1]['team']) + "," + String(p2Pieces[p2Pieces.length-1]['king']);   
    }
    var out = out1 + "|" + out2;

    /* send board to server to update the DB */
    /* put stuff in gameId and gameState */

    //do ajax stuff to update.php
    // console.log(playerID);
    // console.log(challengerID);
    // console.log(out);
    // console.log(gMoveCount);
    if(out != "|"){
        $.ajax({
            type: "POST",
            url: "update.php",
            data: { player1: playerID, player2: challengerID, gameState: out, movecount: gMoveCount },
            success: function(){
                console.log("Successfully sent data. ");
            },
            error: function(){
                console.log("No transfer.");
            }
        });
    }
}

function newGame() {

    p1Pieces = [new Cell(0,1,0,0),
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
                new Cell(7,6,1,0)];


    p1NumPieces = p1Pieces.length;
    p2NumPieces = p2Pieces.length;
    
    gSelectedPieceIndex = -1;
    p1SelectedPieceIndex = -1;
    p2SelectedPieceIndex = -1;
    
    gSelectedPieceHasMoved = false;
    
    gMoveCount = 0;
    
    gGameInProgress = true;

    //creating a game is handled by links in the stat menu

    drawBoard();   
}

function endGame() {

    alert("challengerID: "+challengerID);
    alert("PlayerID: "+playerID);
    /* Remove this game's information from the database */
    

    gSelectedPieceIndex = -1;
    p1SelectedPieceIndex = -1;
    p2SelectedPieceIndex = -1;
    // gGameInProgress = false;
    if(gGameInProgress==true) {
        // localStorage.clear();
        // gGameInProgress = (localStorage["board.game.in.progress"] == "false");
        gGameInProgress = false;
        drawBoard();
    }


    $.ajax({
        type: "POST",
        url: "endgame.php",
        data: { player1: playerID, player2: challengerID},
        success: function(){
            console.log("Successfully sent data. ");
        },
        error: function(){
            console.log("No transfer...");
        }
    });


    if(p1NumPieces==0) {
        alert("Player 2 has won!");
    }
    else if(p2NumPieces==0) {
        alert("Player 1 has won!");
    }
    else {
        alert("The game was a draw!");
    }


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
    newGame();

}

(function poll() {
    setTimeout(function() {

        $.ajax({
            type: 'POST',
            url: 'assign.php',
            data: {p1: playerID, p2: challengerID },
            // datatype: 'json',
            success: function(data) {
                console.log("you are player "+data);
                var whichPlayerAmI = data;
            },
            error: function(data){
                console.log("");
            }
        });

        if(gMoveCount%2 == whichPlayerAmI){
            updateRemote();
        }
        


        $.ajax({      
         type: 'POST',                                
         url: 'getboard.php',                  //the script to call to get data          
         data: {p1: playerID, p2: challengerID },
         datatype: 'json',
         success: function(data)            //on recieve of reply
         {

            var data = jQuery.parseJSON(data);

            console.log(data.moves);
            console.log(data.game);
              

            var result = data.game;           //get name
            gMoveCount = Number(data.moves);

            console.log("Loading board");
            /*parse the string into */  

            var stuff = result.split("|");   // Split on pipe

            var p1string = stuff[0];
            var p2string = stuff[1];
            // console.log("1st split");
            // console.log(p1string);
            // console.log(p2string);
            /* p(1/2)stuff now is string[], with each index being an entire cell element */
            var p1stuff = p1string.split(":");
            var p2stuff = p2string.split(":");



            var oldp1Pieces = p1Pieces;
            var oldp2Pieces = p2Pieces;

            var newp1Pieces = [];
            // console.log("2nd splits");
            for (var i = 0; i <p1stuff.length; i++) {
                // console.log(p1stuff[i].split(","));
                var tmp = p1stuff[i].split(",");

                // console.log(parseInt(tmp[0]));
                // console.log(parseInt(tmp[1]));
                // console.log(parseInt(tmp[2]));
                // console.log(parseInt(tmp[3]));

                var x    = parseInt(tmp[0]);
                var y    = parseInt(tmp[1]);
                var team = parseInt(tmp[2]);
                var king = parseInt(tmp[3]);

                newp1Pieces[i] = new Cell(x,y,team,king);
            };
            
            var newp2Pieces = [];
            for (var i = 0; i <p2stuff.length; i++) {
                var tmp = p2stuff[i].split(",");
                var x    = parseInt(tmp[0]);
                var y    = parseInt(tmp[1]);
                var team = parseInt(tmp[2]);
                var king = parseInt(tmp[3]);
                newp2Pieces[i] = new Cell(x,y,team,king);
            };

            p1Pieces = newp1Pieces;
            p2Pieces = newp2Pieces;

         }, 
         error: function(data) {
            console.log("The ajax to load the board failed.");
         },
         complete: poll

        });
    },1000);
    drawBoard();
})();