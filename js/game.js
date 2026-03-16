import { Snake } from './snake.js';
import { FoodList } from './food.js';
import { SoundManager } from './soundmanajer.js';
import { ShapeManager } from './shapemanajer.js';
import { UI } from './UI.js';

export class Game {
    constructor(canvasId, onGameOver) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 32; 
        this.sound = new SoundManager();
        this.shapeManager = new ShapeManager();
        this.ui = new UI();
        this.onGameOver = onGameOver;
        this.highScore = 0;
        this.firstInput = true;
        this.ui.clearMessage();
        
        this.lastTime = 0;
        this.moveInterval = 180; 
        this.snake = new Snake(this.gridSize, this.canvas.width, this.canvas.height);
        this.foodList = new FoodList(this.gridSize, this.canvas.width, this.canvas.height);
        this.shapeManager.reset();
        this.score = 0;
        this.isGameOver = false;
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        this.gameLoopId = null;
    }

    async start() {
        this.reset();
        this.ui.updateScore(this.score);
        this.ui.updateHighScore(this.highScore);
        this.ui.updateTarget(this.shapeManager.getCurrentTarget());
        this.foodList.respawn();
        await this.sound.play('start');

        this.lastTime = performance.now();
        this.gameLoopId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    loop(timestamp) {
        if (this.isGameOver) return;

        const deltaTime = timestamp - this.lastTime;

        if (deltaTime >= this.moveInterval) {
            this.update();
            this.lastTime = timestamp - (deltaTime % this.moveInterval);
        }

        this.gameLoopId = requestAnimationFrame((t) => this.loop(t));
    }

    reset() {
        this.snake = new Snake(this.gridSize, this.canvas.width, this.canvas.height);
        this.foodList = new FoodList(this.gridSize, this.canvas.width, this.canvas.height);
        this.shapeManager.reset();
        this.score = 0;
        this.isGameOver = false;
        this.firstInput = true; 
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    checkCollision() {
        const head = this.snake.body[0];

        if (head.x < 0 || head.x >= this.canvas.width || head.y < 0 || head.y >= this.canvas.height) {
            return 'wall';
        }

        for (let i = 2; i < this.snake.body.length; i++) {
            if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) return 'self';
        }
        return false;
    }

    _endGame(reason, message, soundKey = 'crash') {
        if (this.isGameOver) return;
        this.isGameOver = true;
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        this.sound.play(soundKey);
        this.ui.setMessage(message, 'wrong');
        if (typeof this.onGameOver === 'function') this.onGameOver(reason);
    }

    update() {
        const collisionType = this.checkCollision();
        if (collisionType) {
            if (collisionType === 'wall') {
                this._endGame('crash', 'Skor akhir: ' + this.score, 'crash');
            } else if (collisionType === 'self') {
                this._endGame('crash', 'Menabrak diri! Skor akhir: ' + this.score, 'nabrakbadan');
            }
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.foodList.draw(this.ctx);
        
        this.snake.move();
        
        const head = this.snake.body[0];
        let eaten = false;
        for (const food of this.foodList.foods) {
            if (head.x === food.x && head.y === food.y) {
                eaten = true;
                if (food.type === this.shapeManager.getCurrentTarget()) {
                    this.score += 10;
                    this.shapeManager.advanceSequence();
                    this.sound.play('benar');
                    this.ui.setMessage('Benar! Pilihan tepat.', 'correct');
                    this.ui.updateScore(this.score);
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        this.ui.updateHighScore(this.highScore);
                    }
                    this.ui.updateTarget(this.shapeManager.getCurrentTarget());
                    this.foodList.respawn();
                } else {
                    this._endGame('wrongFood', 'Salah makan! Skor akhir: ' + this.score, 'salah');
                    return;
                }
                break;
            }
        }
        if (!eaten) {
            this.snake.popTail();
        }

        this.snake.draw(this.ctx);
    }

    draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.foodList.draw(this.ctx);
        this.snake.draw(this.ctx);
    }

    setupInput() {
        document.addEventListener('keydown', e => {
            if ([ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ].indexOf(e.code) > -1) {
                e.preventDefault();
            }
            if (e.code === 'ArrowUp') this.snake.setDirection(0, -this.gridSize);
            else if (e.code === 'ArrowDown') this.snake.setDirection(0, this.gridSize);
            else if (e.code === 'ArrowLeft') this.snake.setDirection(-this.gridSize, 0);
            else if (e.code === 'ArrowRight') this.snake.setDirection(this.gridSize, 0);

            if (this.firstInput) {
                this.ui.clearMessage();
                this.firstInput = false;
            }
        });
    }
}