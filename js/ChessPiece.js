// Piece class

class ChessPiece{
    constructor(type, color, row=null, col=null){
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col
        this.allMoves=[];
        this.availableMoves = [];
        this.hasMoved = false;
    }
    getSymbol() {
        const symbols = {
            pawn: { white: '♙', black: '♟' },
            rook: { white: '♖', black: '♜' },
            knight: { white: '♘', black: '♞' },
            bishop: { white: '♗', black: '♝' },
            queen: { white: '♕', black: '♛' },
            king: { white: '♔', black: '♚' }
        };
        return symbols[this.type][this.color] || '?';
    }

    static moveDirections = {
        rook: [[1,0], [-1, 0], [0, 1], [0, -1]],
        knight: [[2,1], [2, -1], [1, 2], [1, -2], [-1, 2], [-1,-2], [-2,1], [-2,-1]],
        bishop: [[1,1], [1,-1], [-1,1], [-1,-1]],
        // king and queen move in all directions
        royalty: [[1,1], [1,-1], [-1,1], [-1,-1],[1,0], [-1, 0], [0, 1], [0, -1]],
    };

    // HANDLE Move calculateion
    // allMoves -> future -> legal



    calculateAvailableMoves(board){// old variable now calculating 'allMoves' will update naming once finalised

        this.allMoves =[];
        this.generateAllMoves(board);
        this.calculateLegalMoves(board);
    }

    getPotentialMoves(board){
        const potential = [];
        const originalFn = this.addMove;

        this.addMove = (row, col) => {
            potential.push({row,col});
        }
        this.generateAllMoves(board);

        this.addMove = originalFn;

        return potential;
    }

    generateAllMoves(board){
        switch(this.type){
            case 'pawn':
                this.pawnMoves(board);
                // pawn logic
                break;
            case 'rook':
                this.rookMoves(board);
                break;
            case 'knight':
                this.knightMoves(board);
                // 
                break;
            case 'bishop':
                this.bishopMoves(board);
                break;
            case 'queen':
                this.queenMoves(board);
                break;   
            case 'king':
                this.kingMoves(board)
                break; 
        }
    }

    addMove(row, col, board){
        this.allMoves.push({row,col});
    }

    calculateLegalMoves(board){
        this.availableMoves=[];

        for (const move of this.allMoves) {
            if (!board.wouldResultInCheck(this.row, this.col, move.row, move.col)) {
                this.availableMoves.push(move);
            }
        }
    }


// FUNCTIONS to work out available moves for pieces
    pawnMoves(board){
        const direction = this.color === 'white' ? +1 : -1;
        const startRow = this.color === 'white' ? 1 : 6;
        const curRow = this.row;
        const curCol = this.col;

        const promotionRow = this.color === 'white' ? 7 : 0;
        if (curRow === promotionRow) {
            return; // Pawn on promotion rank - no moves to generate
        }

        const oneStepRow = curRow + direction;
        
        // Move forward one square
        if(board.getPieceAt(oneStepRow, curCol) === null){
            this.addMove(oneStepRow, curCol, board);
            
            // Move forward two squares from starting position
            const twoStepRow = curRow + (direction * 2);
            if(board.getPieceAt(twoStepRow, curCol) === null && curRow === startRow){
                this.addMove(twoStepRow, curCol, board);
            }
        }

        // Diagonal captures
        const captureCols = [curCol + 1, curCol - 1];

        for(const capCol of captureCols){
            if(capCol >= 0 && capCol < 8){
                const targetPiece = board.getPieceAt(oneStepRow, capCol);

                // Regular capture
                if(targetPiece && targetPiece.color !== this.color){
                    this.addMove(oneStepRow, capCol, board);
                }
                
                // EN PASSANT CHECK
                const opponent = this.color === 'white' ? board.blackSide : board.whiteSide;
                const lastMove = opponent.getLastMove();
                
                // En Passant Conditions:
                // 1. Last move was a pawn
                // 2. That pawn started in this column (adjacent)
                // 3. That pawn ended on our current row
                // 4. That pawn moved 2 squares
                if(lastMove && 
                lastMove.pieceType === 'pawn' &&
                lastMove.fromCol === capCol && 
                lastMove.toRow === curRow &&
                Math.abs(lastMove.toRow - lastMove.fromRow) === 2) {
                    
                    console.log(`✅ EN PASSANT VALID at (${oneStepRow},${capCol})`);
                    // Add en passant move as an object with properties
                    this.allMoves.push({
                        row: oneStepRow,
                        col: capCol,
                        isEnPassant: true
                    });
                }
            }
        }
    }
    getPawnAttacks() {
        const attacks = [];
        const direction = this.color === 'white' ? 1 : -1;
        const attackRow = this.row + direction;
        const attackCols = [this.col - 1, this.col + 1];
        
        for (const attackCol of attackCols) {
            if (attackCol >= 0 && attackCol < 8 && attackRow >= 0 && attackRow < 8) {
                attacks.push({row: attackRow, col: attackCol});
            }
        }
        
        return attacks;
    }

    knightMoves(board){
       for(const [dr, dc] of ChessPiece.moveDirections.knight){
            this.addMovesInDirection(board, dr,dc, 1);
       }
    }

    bishopMoves(board){
        for(const [dr, dc] of ChessPiece.moveDirections.bishop){
            this.addMovesInDirection(board, dr, dc);
        }
    }

    rookMoves(board){
        for(const [ dr, dc] of ChessPiece.moveDirections.rook){
            this.addMovesInDirection(board, dr, dc);
        }
    }

    queenMoves(board){
        for(const [ dr, dc] of ChessPiece.moveDirections.royalty){
            this.addMovesInDirection(board, dr, dc);
        }
    }

    kingMoves(board){
        for(const [ dr, dc] of ChessPiece.moveDirections.royalty){
            this.addMovesInDirection(board, dr, dc, 1);
        }
        this.addCastlingMoves(board);
    }

    addCastlingMoves(board){
        if (!board.whiteSide || !board.blackSide) return;
        if(this.hasMoved) return;

        const side = this.color==='white'? board.whiteSide : board.blackSide;
        const opponent = this.color==='white'? board.blackSide : board.whiteSide;

        if(side.ableToCastleSide(opponent,'kingSide')){
            this.allMoves.push({
                row: this.row, col: this.col+2,
                isCastling: true,
                castlingSide: 'kingSide'
            });
        }
        if(side.ableToCastleSide(opponent,'queenSide')){
            this.allMoves.push({
                row: this.row, col: this.col-2,
                isCastling: true,
                castlingSide: 'queenSide'
            });
        }
    }

    // Abstracted move function
    addMovesInDirection(board,dr,dc, maxSteps=8){
        let newRow = this.row + dr;
        let newCol = this.col + dc;
        let steps= 0;
        while(steps < maxSteps){
            if(board.getPieceAt(newRow,newCol)!='Out of Bounds' ){
                //&& !board.wouldResultInCheck(this.row,this.col,newRow,newCol)
                    const targetPiece = board.getPieceAt(newRow,newCol);
                    if(targetPiece===null){
                        this.addMove(newRow,newCol, board);
                    }
                    else if(targetPiece.color !== this.color){
                        this.addMove(newRow, newCol, board);
                        break;
                    }else{
                        break;
                    }
                }else{
                    break;
            }
            steps++;
            newRow+=dr;
            newCol+=dc;
        }
    }

}
