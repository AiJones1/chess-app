// Game initialization
class Game {
    constructor() {
        this.board = null;
    }
    
    async init() {
        // Load both modals
        await ModalLoader.loadAllModals();
        
        // Create chess board
        this.board = new ChessBoard();
        
        // Initialize modal events
        ModalLoader.initPromotionEvents(this.board);
        ModalLoader.initGameOverEvents(this.board);
        
        // Store board globally for easy access
        window.chessBoard = this.board;
        
        // Setup reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.board.reset();
        });
        
        // Setup undo button (you can implement this later)
        document.getElementById('undoBtn').addEventListener('click', () => {
            console.log('Undo not implemented yet');
        });
        
        // Initial render
        this.board.renderBoard();
    }
    
    reset() {
        this.board.reset();
        ModalLoader.initPromotionEvents(this.board);
        ModalLoader.initGameOverEvents(this.board);
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});