class ChessBoard{

    constructor(){
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.turn = 'white';
        this.selectedPiece = null;
        this.initialiseBoard();
        this.check = false;
        this.gameOver = this.isGameOver;
        this.result = 'pending';
    }
    getSquare(row, col){
        return this.board[row][col];
    }

    getPieceAt(row, col){
        if(row >=0 && row <8 && col >=0 && col <8){
            return this.board[row][col];
        }
        return 'Out of Bounds';
    }
    getKingSquare(){
        for(let row=0; row<8; row++){
            for(let col = 0;col<8;col++){
                const piece = this.board[row][col];
                if(piece && piece.type==='king' && piece.color===this.turn){
                    return {row,col};
                }
            }
        }
        // DANGER DANGER
        return null;
    }

    // ===========================================
    // ========USER INTERFACE FUNCTIONS===========
    // ===========================================
    updateInfoPanel(){
        const turnIndicator = document.getElementById('turnIndicator');
        turnIndicator.textContent = `${this.turn.charAt(0).toUpperCase() + this.turn.slice(1)}'s Turn`;
        turnIndicator.className = `turn-indicator ${this.turn}-turn`;

        const checkStatus = this.isCheck();
        if(checkStatus){
            turnIndicator.textContent += ' - CHECK!';
        }

        const selectedPieceDiv = document.getElementById('selectedPiece');
        if(this.selectedPiece){
            const piece = this.selectedPiece;
            selectedPieceDiv.innerHTML = `
            ${piece.getSymbol()} ${piece.color} ${piece.type}
            <span style="font-size: 12px; margin-left: 5px;">(${String.fromCharCode(97 + piece.col)}${piece.row + 1})</span>
            `;
        }else{
            selectedPieceDiv.textContent='None';
        }

        const availableMovesDiv = document.getElementById('availableMoves');
        if(this.selectedPiece){
            const moveCount = this.selectedPiece.availableMoves.length;
            availableMovesDiv.innerHTML=`${moveCount} move${moveCount !== 1 ? 's' : ''}`;
            // can add more details
        }
        // make collection of capture pieces for each side

    }


    initialiseBoard() {
        const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

        for (let i = 0; i < 8; i++) {
            // white pieces
            this.board[0][i] = new ChessPiece(backRank[i], 'white', 0, i);
            this.board[1][i] = new ChessPiece('pawn', 'white', 1, i);

            // black pieces
            this.board[6][i] = new ChessPiece('pawn', 'black', 6, i);
            this.board[7][i] = new ChessPiece(backRank[i], 'black', 7, i);
        }
        
        // Calculate initial legal moves for white
        this.calculateAllLegalMoves();
        this.updateInfoPanel();
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';
        
        for (let row = 7; row >= 0; row--) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                
                if (piece) {
                    square.textContent = piece.getSymbol();
                }
                
                square.addEventListener('click', () => {
                    if (this.selectedPiece) {
                        // Try to make the move
                        if (this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                            this.selectedPiece = null;
                            this.renderBoard();
                            return;
                        } else if (this.selectedPiece.row === row && this.selectedPiece.col === col) {
                            // Deselect if clicking same piece
                            this.selectedPiece = null;
                            this.renderBoard();
                            this.updateInfoPanel();
                            return;
                        }
                    }
                    
                    // Select new piece - use pre-calculated availableMoves
                    const piece = this.board[row][col];
                    if (piece && piece.color === this.turn && piece.availableMoves.length > 0) {
                        this.selectedPiece = piece;
                        this.showAvailableMoves(piece);
                    }
                });

                boardElement.appendChild(square);
            }
        }
    }
    showAvailableMoves(selectedPiece){
    // First clear any existing highlights
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('highlight', 'selected');
            const indicators = square.querySelectorAll('.possible-move', '.capture-move');
            indicators.forEach(indicator => indicator.remove());
        });
        this.selectedPiece = selectedPiece;
        this.updateInfoPanel();

        this.check = this.isCheck();



        // Highlight the selected piece
        const selectedSquare = document.querySelector(
            `.square[data-row="${selectedPiece.row}"][data-col="${selectedPiece.col}"]`
        );    

        selectedSquare.classList.add('selected');
     
        // Add visual indicators for each available move
        selectedPiece.availableMoves.forEach(move => {
            const square = document.querySelector(
                `.square[data-row="${move.row}"][data-col="${move.col}"]`
            );
            if (square) {
                square.classList.add('highlight');
                
                // Add a dot for empty squares, circle for captures
                const targetPiece = this.board[move.row][move.col];
                const indicator = document.createElement('div');
                indicator.className = targetPiece ? 'capture-move' : 'possible-move';
                square.appendChild(indicator);
            }
        });
    }

    // ==========================================
    // =========GAME PLAY FUNCTIONS==============
    // ===========================================
    isCheck() {
        const enemy = (this.turn === 'white') ? 'black' : 'white';
        const kingSquare = this.getKingSquare();       
        if (!kingSquare) return false;
        

        // Check if any enemy piece can capture the king using their pre-calculated moves
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];

                if (piece && piece.color === enemy) {
                    const potentMoves = piece.getPotentialMoves(this);


                    const kingCheck = potentMoves.some(move =>
                        move.row === kingSquare.row && move.col === kingSquare.col
                    );
                    if (kingCheck) return true;
                }
            }
        }
        return false;
    }
    // Calculating legal moves for all pieces  - Method is innefficient this is brute force method for now
    calculateAllLegalMoves() {
       
        // Calculate fresh moves for all pieces of current turn
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    piece.allMoves=[];
                    piece.calculateAvailableMoves(this);
                }
            }
        }
    }

    wouldResultInCheck(fromRow, fromCol, toRow, toCol){
        const movingPiece = this.board[fromRow][fromCol];
        if(!movingPiece) return false;


        const newSquare = this.board[toRow][toCol]; // in case another piece is here (capture)
        const movingColor = movingPiece.color;
        // make changes temporily to test w/out rendering

        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;

        // store original position
        const oldRow = movingPiece.row;
        const oldCol = movingPiece.col;
                // NEED SPECIAL HANDLING IF PIECE BEING MOVE IS THE KING
        movingPiece.row=toRow;
        movingPiece.col=toCol;

        const originalTurn = this.turn;
        this.turn = movingColor;

        const wouldBeInCheck = this.isCheck();
        
        // Undo temp move
        this.turn = originalTurn;
        movingPiece.row = oldRow;
        movingPiece.col = oldCol;
        this.board[toRow][toCol] = newSquare;
        this.board[fromRow][fromCol] = movingPiece;

        return wouldBeInCheck;

    }

    // MAKING A MOVE - thats the point of the game
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.availableMoves.length == 0) return false;

        const isValidMove = piece.availableMoves.some(move =>
            move.row === toRow && move.col === toCol
        );
        if (!isValidMove) return false;
        if (this.wouldResultInCheck(fromRow, fromCol, toRow, toCol)) return false;
        
        // Execute the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.hasMoved = true;
        piece.row = toRow;
        piece.col = toCol;
        
        // Switch turn
        this.turn = (this.turn === 'white') ? 'black' : 'white';
        
        // CRITICAL: Calculate all legal moves for the new turn
        this.calculateAllLegalMoves();
        
        // Now check if the new turn's king is in check
        this.selectedPiece=null;
        this.updateInfoPanel();

        
        
        return true;
    }
    isGameOver(){
        for(let row=0; row<8; row++){
            for(let col=0; col<8; col++){
                const piece = this.board[row][col];
                if(piece && piece.color === this.turn && piece.availableMoves.length>0){
                    return false;
                }
            }
        }
        return true;
    }
    gameResult(){
        if(gameOver){
            if(isCheck){
                this.gameResult='CheckMate';
            }else{
                this.gameResult='StaleMate';
            }
        }else{
            this.gameResult='pending';
        }
    }
}
