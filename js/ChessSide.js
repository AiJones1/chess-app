class ChessSide{
    constructor(color) {
        this.color = color;
        this.pieces = [];
        this.king = null;
        this.inCheck = false;
        // this.capturedPieces;
    }
}