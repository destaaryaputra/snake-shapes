import { Game } from './js/game.js';
let gameInstance;
let restartDialog, restartYes, restartNo;

function showRestartDialog() {
    restartDialog.style.display = 'flex';
}
function hideRestartDialog() {
    restartDialog.style.display = 'none';
}

function autoResizeGame() {
    if (!gameInstance) return;

    const gameBoard = document.getElementById('gameBoard');
    const canvas = document.getElementById('gameCanvas');

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const maxSize = 800; 
    const paddingX = 32; 
    const paddingY = 180;
    const availableWidth = Math.min(maxSize, viewportWidth - paddingX);
    const availableHeight = Math.min(maxSize, viewportHeight - paddingY);

    const targetSize = Math.max(250, Math.min(availableWidth, availableHeight));

    const GRID_RESOLUTION = 25; 
    const borderTotal = 6;
    
    const newGridSize = Math.floor((targetSize - borderTotal) / GRID_RESOLUTION);
    const canvasSize = newGridSize * GRID_RESOLUTION;

    gameBoard.style.minWidth = '0';
    gameBoard.style.minHeight = '0';
    gameBoard.style.maxWidth = 'none';
    gameBoard.style.maxHeight = 'none';
    
    gameBoard.style.width = (canvasSize + borderTotal) + 'px';
    gameBoard.style.height = (canvasSize + borderTotal) + 'px';

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';

    if (gameInstance) {
        gameInstance.gridSize = newGridSize;
        if (gameInstance.foodList) gameInstance.foodList.gridSize = newGridSize;
    }

    if (gameInstance.foodList) {
        gameInstance.foodList.updateBoundaries(canvasSize, canvasSize);
    }

    if (!gameInstance.isGameOver && gameInstance.gameLoopId) {
        gameInstance.draw();
    }

    updateResponsiveVariables();
}

function updateResponsiveVariables() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spacingBase = Math.max(4, Math.min(16, viewportWidth * 0.01));
    const headerHeight = Math.max(50, Math.min(90, viewportHeight * 0.08));

    document.documentElement.style.setProperty('--dynamic-spacing-base', spacingBase + 'px');
    document.documentElement.style.setProperty('--dynamic-header-height', headerHeight + 'px');

    const fontScale = Math.max(0.8, Math.min(1.2, viewportWidth / 1200));
    document.documentElement.style.setProperty('--font-scale', fontScale);
}

document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new Game('gameCanvas', showRestartDialog);
    gameInstance.setupInput();
    restartDialog = document.getElementById('restartDialog');
    restartYes = document.getElementById('restartYes');
    restartNo = document.getElementById('restartNo');
    const ui = document.getElementById('ui');
    const message = document.getElementById('message');
    const canvas = document.getElementById('gameCanvas');
    const menuRetro = document.getElementById('menuRetro');
    const playBtn = document.getElementById('playBtn');
    const exitBtn = document.getElementById('exitBtn');
    const soundToggle = document.getElementById('soundToggle');

    menuRetro.style.display = 'flex';
    ui.style.display = 'none';
    message.style.display = 'none';
    canvas.style.display = 'none';
    hideRestartDialog();
    message.style.display = 'none';
    canvas.style.display = 'none';
    hideRestartDialog();

    updateResponsiveVariables();
    autoResizeGame();

    window.addEventListener('resize', () => {
        updateResponsiveVariables();
        autoResizeGame();
    });

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const muted = gameInstance.sound.toggleMute();
            soundToggle.innerText = muted ? '🔇' : '🔊';
        });
    }

    playBtn.addEventListener('click', () => {
        menuRetro.style.display = 'none';
        autoResizeGame();
        gameInstance.start();
        ui.style.display = 'flex';
        canvas.style.display = 'block';
    });
    exitBtn.addEventListener('click', () => {
        if (gameInstance) gameInstance.sound.stopAll();
        window.close();
    });

    restartYes.addEventListener('click', () => {
        autoResizeGame();
        hideRestartDialog();
        gameInstance.start();
        ui.style.display = 'flex';
        canvas.style.display = 'block';
    });
    restartNo.addEventListener('click', () => {
        hideRestartDialog();
        menuRetro.style.display = 'flex';
        ui.style.display = 'none';
        message.style.display = 'none';
        canvas.style.display = 'none';
        
        if (gameInstance) gameInstance.sound.stopAll();
    });
});
