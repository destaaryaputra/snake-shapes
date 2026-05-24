import { Snake } from './snake.js';
import { FoodManager } from './food.js';
import { InputController } from './inputController.js';

export class Game {
    #canvas;
    #ctx;
    #gridSize;
    #sound;
    #shapeManager;
    #ui;
    #state;
    #inputController;
    #onGameOver;
    #lastTime;
    #moveInterval;
    #snake;
    #foodList;
    #gameLoopId;

    constructor(canvasId, onGameOver, dependencies) {
        // Ambil canvas utama.
        this.#canvas = document.getElementById(canvasId);
        this.#ctx = this.#canvas.getContext('2d');
        this.#gridSize = 32;
        // Siapkan sound, target, dan UI via dependency injection.
        this.#sound = dependencies.sound;
        this.#shapeManager = dependencies.shapeManager;
        this.#ui = dependencies.ui;
        this.#state = dependencies.state;
        this.#onGameOver = onGameOver;
        this.#ui.clearMessage();
        
        // Variabel utama untuk loop game.
        this.#lastTime = 0;
        this.#moveInterval = 125;
        this.#snake = new Snake(this.#gridSize, this.#canvas.width, this.#canvas.height);
        this.#foodList = new FoodManager(this.#gridSize, this.#canvas.width, this.#canvas.height, this.#snake.getBodySnapshot());
        this.#shapeManager.reset();
        if (this.#gameLoopId) cancelAnimationFrame(this.#gameLoopId);
        this.#gameLoopId = null;
    }

    async start() {
        // Reset game lalu update UI.
        this.reset();
        this.#state.startGame();
        this.#ui.updateScore(this.#state.getScore());
        this.#ui.updateHighScore(this.#state.getHighScore());
        this.#ui.updateTarget(this.#shapeManager.getCurrentTarget());
        this.#foodList.respawn(this.#snake.getBodySnapshot());
        await this.#sound.play('start');

        // Mulai loop game.
        this.#lastTime = performance.now();
        this.#gameLoopId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    loop(timestamp) {
        if (this.#state.isGameOver()) return;

        // Gerak snake dibuat tetap dan stabil.
        let deltaTime = timestamp - this.#lastTime;

        while (deltaTime >= this.#moveInterval) {
            this.update();
            this.#lastTime += this.#moveInterval;
            deltaTime = timestamp - this.#lastTime;
        }

        const alpha = deltaTime / this.#moveInterval;
        this.draw(alpha);

        this.#gameLoopId = requestAnimationFrame((t) => this.loop(t));
    }

    getGridSize() {
        return this.#gridSize;
    }

    setGridSize(gridSize) {
        const parsed = Number(gridSize);
        this.#gridSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
        this.#snake.setGridSize(this.#gridSize);
        this.#foodList.setGridSize(this.#gridSize);
        if (this.#inputController) {
            this.#inputController.setGridSize(this.#gridSize);
        }
    }

    resizeBoard(canvasWidth, canvasHeight, gridSize = this.#gridSize) {
        this.setGridSize(gridSize);
        this.#foodList.updateBoundaries(canvasWidth, canvasHeight, this.#snake.getBodySnapshot());
    }

    isRunning() {
        return !this.#state.isGameOver() && this.#gameLoopId !== null;
    }

    redraw(alpha = 1) {
        this.draw(alpha);
    }

    toggleMute() {
        return this.#sound.toggleMute();
    }

    stopAllSounds() {
        this.#sound.stopAll();
    }

    reset() {
        // Buat ulang state game.
        this.#snake = new Snake(this.#gridSize, this.#canvas.width, this.#canvas.height);
        this.#foodList = new FoodManager(this.#gridSize, this.#canvas.width, this.#canvas.height, this.#snake.getBodySnapshot());
        this.#shapeManager.reset();
        this.#state.reset();
        if (this.#inputController) {
            this.#inputController.setGridSize(this.#gridSize);
        }
        if (this.#gameLoopId) {
            cancelAnimationFrame(this.#gameLoopId);
            this.#gameLoopId = null;
        }
    }

    checkCollision() {
        // Cek tabrakan dengan pinggir canvas.
        const head = this.#snake.getHead();
        if (!head) return false;

        if (head.x < 0 || head.x >= this.#canvas.width || head.y < 0 || head.y > this.#canvas.height - this.#gridSize) {
            return 'wall';
        }

        // Cek apakah kepala kena badan sendiri.
        if (this.#snake.hasSelfCollision(2)) return 'self';
        return false;
    }

    #endGame(reason, message, soundKey = 'crash') {
        if (this.#state.isGameOver()) return;
        // Hentikan loop dan tampilkan game over.
        this.#state.endGame();
        if (this.#gameLoopId) {
            cancelAnimationFrame(this.#gameLoopId);
            this.#gameLoopId = null;
        }
        this.#sound.play(soundKey);
        this.#ui.setMessage(message, 'wrong');
        if (typeof this.#onGameOver === 'function') this.#onGameOver(reason);
    }

    update() {
        // Cek tabrakan sebelum snake bergerak.
        const collisionType = this.checkCollision();
        if (collisionType) {
            if (collisionType === 'wall') {
                this.#endGame('crash', 'Skor akhir: ' + this.#state.getScore(), 'crash');
            } else if (collisionType === 'self') {
                this.#endGame('crash', 'Menabrak diri! Skor akhir: ' + this.#state.getScore(), 'nabrakbadan');
            }
            return;
        }

        // Simpan posisi lama untuk animasi halus.
        this.#snake.capturePreviousBody();
        this.#snake.move();
        
        // Cek apakah kepala kena food.
        const head = this.#snake.getHead();
        if (!head) return;

        const eatenFood = this.#foodList.consumeFoodAt(head.x, head.y);
        const eaten = Boolean(eatenFood);
        if (eatenFood) {
            if (eatenFood.getType() === this.#shapeManager.getCurrentTarget()) {
                // Skor naik kalau shape cocok.
                this.#state.addScore(10);
                this.#shapeManager.advanceSequence();
                this.#sound.play('benar');
                this.#ui.setMessage('Benar! Pilihan tepat.', 'correct');
                this.#ui.updateScore(this.#state.getScore());
                const highScore = this.#state.updateHighScoreIfNeeded();
                this.#ui.updateHighScore(highScore);
                this.#ui.updateTarget(this.#shapeManager.getCurrentTarget());
                this.#foodList.respawn(this.#snake.getBodySnapshot());
            } else {
                this.#endGame('wrongFood', 'Salah makan! Skor akhir: ' + this.#state.getScore(), 'salah');
                return;
            }
        }
        if (!eaten) {
            // Kalau tidak makan, ekor dipotong.
            this.#snake.popTail();
        }
    }

    draw(alpha = 1) {
        if (!this.#ctx || !this.#canvas) return;

        // Bersihkan canvas lalu gambar ulang.
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#foodList.draw(this.#ctx);
        this.#snake.draw(this.#ctx, alpha);
    }

    setDirection(dx, dy) {
        this.#snake.setDirection(dx, dy);
    }

    handleFirstInput() {
        if (this.#state.isFirstInput()) {
            this.#ui.clearMessage();
            this.#state.clearFirstInput();
        }
    }

    setupInput() {
        if (!this.#inputController) {
            this.#inputController = new InputController(this, this.#gridSize);
        }
        this.#inputController.setGridSize(this.#gridSize);
        this.#inputController.attach();
    }
}