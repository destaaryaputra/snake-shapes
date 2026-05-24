import { Game } from './js/game.js';
import { SoundManager } from './js/soundmanajer.js';
import { ShapeManager } from './js/shapemanajer.js';
import { UI } from './js/UI.js';
import { GameState } from './js/gameState.js';

let gameInstance;
let restartDialog, restartYes, restartNo;

// Dialog restart dipisah biar alurnya jelas.
function showRestartDialog() {
    restartDialog.style.display = 'flex';
}
function hideRestartDialog() {
    restartDialog.style.display = 'none';
}

// Sesuaikan ukuran board dengan layar.
function autoResizeGame() {
    if (!gameInstance) return;

    const gameBoard = document.getElementById('gameBoard');
    const canvas = document.getElementById('gameCanvas');

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isDesktop = viewportWidth >= 1024;
    const paddingX = isDesktop ? 16 : 32;
    const paddingY = isDesktop ? 140 : 180;
    const uiPanelReserve = viewportWidth >= 1440 ? 400 : viewportWidth >= 1024 ? 360 : 0;
    const availableWidth = Math.max(250, viewportWidth - paddingX - uiPanelReserve);
    const availableHeight = Math.max(250, viewportHeight - paddingY);

    const GRID_SIZE = 25;
    const borderTotal = 10;

    let canvasWidth;
    let canvasHeight;

    if (isDesktop) {
        canvasWidth = Math.max(250, Math.floor((availableWidth - borderTotal) / GRID_SIZE) * GRID_SIZE);
        canvasHeight = Math.max(250, Math.floor((availableHeight - borderTotal) / GRID_SIZE) * GRID_SIZE);
    } else {
        const targetSize = Math.max(250, Math.min(Math.min(800, availableWidth), Math.min(800, availableHeight)));
        canvasWidth = Math.max(250, Math.floor((targetSize - borderTotal) / GRID_SIZE) * GRID_SIZE);
        canvasHeight = canvasWidth;
    }

    gameBoard.style.minWidth = '0';
    gameBoard.style.minHeight = '0';
    gameBoard.style.maxWidth = 'none';
    gameBoard.style.maxHeight = 'none';
    
    gameBoard.style.width = (canvasWidth + borderTotal) + 'px';
    gameBoard.style.height = (canvasHeight + borderTotal) + 'px';

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';

    if (gameInstance) {
        gameInstance.resizeBoard(canvasWidth, canvasHeight, GRID_SIZE);
    }

    if (gameInstance && gameInstance.isRunning()) {
        gameInstance.redraw();
    }

    updateResponsiveVariables();
}

// Variabel CSS dipakai agar layout ikut layar.
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
    // Mulai game setelah halaman siap.
    const dependencies = {
        sound: new SoundManager(),
        shapeManager: new ShapeManager(),
        ui: new UI(),
        state: new GameState()
    };
    gameInstance = new Game('gameCanvas', showRestartDialog, dependencies);
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

    // Tampilkan menu awal dulu.
    menuRetro.style.display = 'flex';
    ui.style.display = 'none';
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
        // Tombol ini hanya ubah mute.
        soundToggle.addEventListener('click', () => {
            const muted = gameInstance.toggleMute();
            soundToggle.innerText = muted ? '🔇' : '🔊';
        });
    }

    // Mulai game dari menu.
    playBtn.addEventListener('click', () => {
        menuRetro.style.display = 'none';
        autoResizeGame();
        gameInstance.start();
        ui.style.display = 'flex';
        canvas.style.display = 'block';
    });
    // Kalau keluar tidak bisa, setidaknya hentikan audio.
    exitBtn.addEventListener('click', () => {
        if (gameInstance) gameInstance.stopAllSounds();
        window.close();
    });

    // Restart langsung mulai lagi.
    restartYes.addEventListener('click', () => {
        autoResizeGame();
        hideRestartDialog();
        gameInstance.start();
        ui.style.display = 'flex';
        canvas.style.display = 'block';
    });
    // Kalau tidak, balik ke menu.
    restartNo.addEventListener('click', () => {
        hideRestartDialog();
        menuRetro.style.display = 'flex';
        ui.style.display = 'none';
        message.style.display = 'none';
        canvas.style.display = 'none';
        
        if (gameInstance) gameInstance.stopAllSounds();
    });
});
