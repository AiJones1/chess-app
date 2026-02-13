// app.js - This is your main entry point
class Game {
    constructor() {
        this.chessBoard = new ChessBoard();
        this.initializeEventListeners();
        this.chessBoard.renderBoard();
        this.chessBoard.updateInfoPanel();

    }

    initializeEventListeners() {
        // Game controls, restart, etc.
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
    }

    restartGame() {
        this.chessBoard = new ChessBoard();
        this.chessBoard.renderBoard();
        this.chessBoard.updateInfoPanel();

    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});