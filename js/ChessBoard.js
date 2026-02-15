class ChessBoard{

    constructor(){
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.turn = 'white';
        this.whiteSide = new ChessSide('white');
        this.blackSide = new ChessSide('black');
        this.selectedPiece = null;
        this.initialiseBoard();
        
        // this.check = false;
        // this.gameOver = this.isGameOver;
        // this.result = 'pending';
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
        const currentSide = this.turn === 'white' ? this.whiteSide : this.blackSide;
        return currentSide.kingPosition;
    }

    // ===========================================
    // ========USER INTERFACE FUNCTIONS===========
    // ===========================================
    updateInfoPanel(){
        const turnIndicator = document.getElementById('turnIndicator');
        if(this.isGameOver){
            turnIndicator.className = `Game over ${this.gameResult} `;
            if(this.gameResult==='CheckMate'){
                const winner = (this.turn === 'white') ? 'black' : 'white';
                console.log(`Winner of this game is ${winner} by ${this.gameResult}`);
            }
        }

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
        this.whiteSide.initialisePieces(this.board);
        this.blackSide.initialisePieces(this.board);
        
        // Calculate attacked squares for both sides
        this.whiteSide.updateAttackedSquares(this);
        this.blackSide.updateAttackedSquares(this);
        
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
        const currentSide = this.turn === 'white' ? this.whiteSide : this.blackSide;
        const opponent = this.turn === 'white' ? this.blackSide : this.whiteSide;

        return currentSide.isInCheck(opponent);
    }

    // Calculating legal moves for all pieces  - Method is innefficient this is brute force method for now
    calculateAllLegalMoves() {
        // Calculate fresh moves for all pieces of current turn
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    piece.allMoves = [];
                    piece.calculateAvailableMoves(this);
                }
            }
        }
        
        // Update attacked squares for BOTH sides after moves are calculated
        this.whiteSide.updateAttackedSquares(this);
        this.blackSide.updateAttackedSquares(this);        
    }

    wouldResultInCheck(fromRow, fromCol, toRow, toCol) {
        const movingPiece = this.board[fromRow][fromCol];
        if (!movingPiece) return false;

        const movingColor = movingPiece.color;
        const movingSide = movingColor === 'white' ? this.whiteSide : this.blackSide;
        const opponentSide = movingColor === 'white' ? this.blackSide : this.whiteSide;

        // Special case: if moving the king, just check if destination is attacked
        if (movingPiece.type === 'king') {
            return opponentSide.isSquareAttacked(toRow, toCol);
        }

        // For non-king pieces: check if king would be in check after move
        const targetPiece = this.board[toRow][toCol];
        const oldRow = movingPiece.row;
        const oldCol = movingPiece.col;
        const oldKingPos = {...movingSide.kingPosition};

        // Simulate the move
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;
        movingPiece.row = toRow;
        movingPiece.col = toCol;

        // If we captured a piece, remove it temporarily
        if (targetPiece) {
            const targetSide = targetPiece.color === 'white' ? this.whiteSide : this.blackSide;
            const index = targetSide.pieces.indexOf(targetPiece);
            if (index > -1) targetSide.pieces.splice(index, 1);
        }

        // Update attacked squares for opponent (fast - just recalc their attacks)
        opponentSide.updateAttackedSquares(this);

        // Check if king is in check
        const wouldBeInCheck = opponentSide.isSquareAttacked(
            movingSide.kingPosition.row, 
            movingSide.kingPosition.col
        );

        // Undo the move
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = targetPiece;
        movingPiece.row = oldRow;
        movingPiece.col = oldCol;

        // Restore captured piece if any
        if (targetPiece) {
            const targetSide = targetPiece.color === 'white' ? this.whiteSide : this.blackSide;
            targetSide.pieces.push(targetPiece);
        }

        // Restore original attacked squares (recalc both sides)
        this.whiteSide.updateAttackedSquares(this);
        this.blackSide.updateAttackedSquares(this);

        return wouldBeInCheck;
    }

    // MAKING A MOVE - thats the point of the game
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.availableMoves.length === 0) return false;

        const isValidMove = piece.availableMoves.some(move =>
            move.row === toRow && move.col === toCol
        );
        if (!isValidMove) return false;
        if (this.wouldResultInCheck(fromRow, fromCol, toRow, toCol)) return false;
        
        // Get the sides
        const movingSide = piece.color === 'white' ? this.whiteSide : this.blackSide;
        const opponentSide = piece.color === 'white' ? this.blackSide : this.whiteSide;
        
        // Handle capture - remove captured piece from opponent's side
        const capturedPiece = this.board[toRow][toCol];
        if (capturedPiece) {
            opponentSide.removePiece(capturedPiece);
        }
        
        // Execute the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Update piece position in ChessSide
        movingSide.updatePiecePosition(fromRow, fromCol, toRow, toCol);
        piece.hasMoved = true;
        
        // Switch turn
        this.turn = this.turn === 'white' ? 'black' : 'white';
        
        // CRITICAL: Update ALL calculations for the new position
        this.calculateAllLegalMoves();  // This now updates attacked squares for both sides
        
        // Check game over conditions
        if (this.isGameOver()) {
            const gameResult = this.getGameResult();
            console.log(`Game Over: ${gameResult}`);
        }
        
        this.selectedPiece = null;
        this.updateInfoPanel();
        
        return true;
    }

    isGameOver() {
        const currentSide = this.turn === 'white' ? this.whiteSide : this.blackSide;
        
        // Check if current side has any legal moves
        for (const piece of currentSide.pieces) {
            if (piece.availableMoves && piece.availableMoves.length > 0) {
                return false;
            }
        }
        return true;
    }

    getGameResult() {
        const currentSide = this.turn === 'white' ? this.whiteSide : this.blackSide;
        const opponent = this.turn === 'white' ? this.blackSide : this.whiteSide;
        
        if (currentSide.isInCheck(opponent)) {
            return 'Checkmate';
        } else {
            return 'Stalemate';
        }
    }
}
