class ChessSide{
    constructor(color) { // Can add board input for alt configs in future

        this.color = color;         // 'black' | 'white'
        this.pieces = [];           // active piece
        this.capturedPieces = [];
        this.kingPosition = null;   // {row, col}
        this.king = null;           // king obj
        
        // Mapping squares this side attacks
        this.attacksSquares = new Set();

        // Pinned

        this.hasCastled = false;
        this.canCastleKingSide = true;
        this.canCastleQueenSide = true;

        this.inCheck = false;
        this.initialisePieces;
        // castle check as a variable??
        // move history
        // this.capturedPieces;
    }

    // 
    initialisePieces(board){
        const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        const startRow = (this.color==='white') ? 0 : 7;
        const pawnRow = (this.color==='white') ? 1 : 6;

        for(let i =0; i< 8; i++){
            const piece = new ChessPiece(backRank[i], this.color, startRow, i);
            const pawn = new ChessPiece('pawn', this.color, pawnRow, i);

            this.pieces.push(piece);
            this.pieces.push(pawn);

            if(backRank[i]==='king'){
                this.kingPosition = {row: piece.row, col: piece.col};
                this.king = piece;
            }
            board[startRow][i]=piece;
            board[pawnRow][i]=pawn;
        }
    }

    getPieceAt(row, col) {
        // Use find() instead of filter() to return a single piece
        return this.pieces.find(p => p.row === row && p.col === col);
    }

    updatePiecePosition(fromRow, fromCol, toRow, toCol){
        const piece = this.getPieceAt(fromRow, fromCol);
        // check if position is possible can be handled here

        // does this effect piece in this.pieces
        piece.row = toRow;
        piece.col = toCol;

        if(piece.type == 'king'){
            this.kingPosition = {row: piece.row, col: piece.col};
        }
    }

// FIX THIS:
    removePiece(piece){
        const index = this.pieces.indexOf(piece);
        if(index > -1){
            this.pieces.splice(index, 1);  // Was 'this.piece.splice' (missing 's')
            this.capturedPieces.push(piece);
            return true;
        }
        return false;
    }

    updateAttackedSquares(board){
        this.attacksSquares.clear(); 

        for(const piece of this.pieces){
            const tempMoves = [];
            const origAddMove = piece.addMove;

            piece.addMove = (row,col) =>{
                tempMoves.push({row,col});
            }
            piece.generateAllMoves(board);
            piece.addMove = origAddMove; 

            tempMoves.forEach(move => {
                this.attacksSquares.add(`${move.row}, ${move.col}`);
            });
        }
    }

    isSquareAttacked(row, col){
        return this.attacksSquares.has(`${row},${col}`);
    }

    isInCheck(opponentSide){
        return opponentSide.isSquareAttacked(this.kingPosition.row, this.kingPosition.col);
    }

}