// Modal loader utility
const ModalLoader = {
    // Load the promotion modal HTML
    loadPromotionModal: async function() {
        try {
            const response = await fetch('./modal/promotionModal.html');
            const html = await response.text();
            document.getElementById('modal-container').innerHTML = html;
            console.log('Promotion modal loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load promotion modal:', error);
            return false;
        }
    },
    
    // NEW: Load the game over modal HTML
    loadGameOverModal: async function() {
        try {
            const response = await fetch('./modal/gameOverModal.html');
            const html = await response.text();
            // Append to modal container instead of replacing
            const container = document.getElementById('modal-container');
            container.innerHTML += html;
            console.log('Game over modal loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game over modal:', error);
            return false;
        }
    },
    
    // Load both modals
    loadAllModals: async function() {
        await this.loadPromotionModal();
        await this.loadGameOverModal();
    },
    
    // Initialize modal event listeners
    initPromotionEvents: function(boardInstance) {
        const options = document.querySelectorAll('.piece-option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const pieceType = e.target.dataset.piece;
                if (boardInstance && boardInstance.promotionCallback) {
                    boardInstance.promotionCallback(pieceType);
                }
            });
        });
    },
    
    // NEW: Initialize game over modal events
    initGameOverEvents: function(boardInstance) {
        const newGameBtn = document.getElementById('gameover-newgame');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                if (boardInstance) {
                    boardInstance.hideGameOverModal();
                    boardInstance.reset();
                }
            });
        }
    }
};