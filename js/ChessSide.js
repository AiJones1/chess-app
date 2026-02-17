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

        this.kingSideRook = null;
        this.queenSideRook = null;

        this.inCheck = false;
        this.initialisePieces;

        this.moveHistory = [];
        this.lastMove = null;
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
            if(backRank[i]=='rook' && i===0){
                this.queenSideRook=piece;
            }
            if(backRank[i]=='rook' && i===7){
                this.kingSideRook=piece;
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
        if(piece.type == 'king'){
            this.kingPosition = {row: piece.row, col: piece.col};
            this.canCastleKingSide=false;
            this.canCastleQueenSide = false;
        }
        if(piece.type == 'rook'){
            if(piece.col==7){
                this.canCastleKingSide=false;
            }else if(piece.col==0){
                this.canCastleQueenSide=false;
            }
        }
        // does this effect piece in this.pieces
        piece.row = toRow;
        piece.col = toCol;


    }


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
            if(piece.type==='pawn'){
                const pawnAttacks = piece.getPawnAttacks();
                pawnAttacks.forEach(attack => {
                    this.attacksSquares.add(`${attack.row},${attack.col}`);
                })
            }else{
                const tempMoves = [];
                const origAddMove = piece.addMove;

                piece.addMove = (row,col) =>{
                    tempMoves.push({row,col});
                }
                piece.generateAllMoves(board);
                piece.addMove = origAddMove; 

                tempMoves.forEach(move => {
                    this.attacksSquares.add(`${move.row},${move.col}`);
                });
            }
        }
    }
    ableToCastleSide(opponentSide, side='kingSide'){
        if(side!=='kingSide' && side!=='queenSide'){
            console.log(`Castle Check side inp err side: ${side}`);
            return false;
        }
        if(!this.canCastleKingSide && side==='kingSide') return false;
        if(!this.canCastleQueenSide && side==='queenSide') return false;
        if(this.king.hasMoved) return false;

        const kingRow = this.kingPosition.row;
        const kingCol = this.kingPosition.col;
        const rookCol = side=='kingSide'? this.kingSideRook.col : this.queenSideRook.col;
        const direction = side==='kingSide' ? 1 : -1;

        for(let col = kingCol+direction; col!==rookCol; col+=direction){
            if(this.hasPieceAt(kingRow, col) || opponentSide.hasPieceAt(kingRow, col)) return false;
        }

        // // squares in between
        

        for(let step=0; step<=2; step++){
            const checkCol = kingCol + (direction*step);
            if(opponentSide.isSquareAttacked(kingRow,checkCol)) return false;
        }
        return true;        
    }

    handleCastlingMove(board, kingFromCol, kingToCol) {
        const row = this.kingPosition.row;  // FIXED: use 'this' not 'side'
        
        if (kingToCol > kingFromCol) {
            // Kingside castling
            const rook = this.kingSideRook;  // FIXED: use 'this'

            if (!rook) {
                console.error("Kingside rook not found");
                return false;
            }
            
            // Update rook's position
            rook.col = 5;  // f-file
            rook.hasMoved = true;
            
            // Update board: rook from h-file (7) to f-file (5)
            board[row][5] = rook;
            board[row][7] = null;
            
            console.log(`Kingside castling: rook moved to (${row},5)`);
            return true;
            
        } else {
            // Queenside castling
            const rook = this.queenSideRook;  // FIXED: use 'this'

            if (!rook) {
                console.error("Queenside rook not found");
                return false;
            }
            
            // Update rook's position
            rook.col = 3;  // d-file
            rook.hasMoved = true;
            
            // Update board: rook from a-file (0) to d-file (3)
            board[row][3] = rook;
            board[row][0] = null;
            
            console.log(`Queenside castling: rook moved to (${row},3)`);
            return true;
        }
    }

    recordMove(piece, fromRow, fromCol, toRow, toCol, capturedPiece =null, isCastling=false, pawnPromotion=false){
        const move = {
            piece: piece,
            pieceType: piece.type,
            pieceColor: this.color,
            fromRow: fromRow,
            fromCol: fromCol,
            toRow: toRow,
            toCol: toCol,
            capturedPiece: capturedPiece,
            isCastling: isCastling,
            moveNumber: this.moveHistory.length+1,
            pawnPromotion: pawnPromotion
        };
        this.moveHistory.push(move);
        this.lastMove=move;
    }
    getLastMove(){
        return this.lastMove;
    }

    // promotePawn function will be needed
    isPawnPromoting(piece){
        const promotionRow = this.color==='white'? 7:0;
        return piece.type==='pawn' && piece.row === promotionRow;
    }

    promotePawn(pawn, newType, board){
        if(!this.isPawnPromoting(pawn)) return null;

        const r = pawn.row;
        const c = pawn.col;

        this.removePiece(pawn);

        const newPiece = new ChessPiece(newType, this.color, r, c);
        board[r][c]=newPiece;

        this.pieces.push(newPiece);
        return newPiece;
    }
    // temp auto promote
    autoPromote(pawn, board){
        return this.promotePawn(pawn,'queen', board);
    }

    hasPieceAt(row, col){
        return this.pieces.some(piece => piece.row ===row && piece.col===col);
    }
    isSquareAttacked(row, col){
        return this.attacksSquares.has(`${row},${col}`);
    }

    isInCheck(opponentSide){
        return opponentSide.isSquareAttacked(this.kingPosition.row, this.kingPosition.col);
    }

}