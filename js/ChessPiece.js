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
        this.allMoves.push({row, col}); 
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
        // Need special handling for enpassant and diag captures
        // Double move

        // special handling if makes to last row
        let r = (this.color === 'white') ? this.row +1 : this.row -1;
        if(board.getPieceAt(r,this.col)===null){
            this.addMove(r, this.col, board);
            if(!this.hasMoved){
                r = (this.color==='white') ? this.row +2 : this.row -2;
                if(board.getPieceAt(r, this.col)===null){
                    this.addMove(r, this.col, board);
                }
            }
        }
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
