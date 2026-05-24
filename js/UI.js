import { drawFoodPreview } from './food.js';

export class UI {
    #scoreEl;
    #targetEl;
    #messageEl;
    #shapeCanvas;
    #shapeCtx;
    #messageTimeout;

    constructor() {
        // Simpan elemen UI agar mudah dipakai lagi.
        this.#scoreEl = document.getElementById('score');
        this.#targetEl = document.getElementById('target');
        this.#messageEl = document.getElementById('message');
        this.#shapeCanvas = document.getElementById('shapePreview');
        this.#shapeCtx = this.#shapeCanvas ? this.#shapeCanvas.getContext('2d') : null;
        this.#messageTimeout = null;
    }

    updateScore(score) {
        // Update skor di dua tempat.
        if (this.#scoreEl) this.#scoreEl.innerText = score;
        const currentScore = document.getElementById('currentScore');
        if (currentScore) currentScore.innerText = score;
    }

    updateHighScore(highScore) {
        // Tampilkan high score.
        const headerScore = document.getElementById('highScoreHeader');
        if (headerScore) headerScore.innerText = highScore;
    }

    updateTarget(target) {
        // Update target dan warnanya.
        const normalizedTarget = target.toLowerCase();
        const targetColors = {
            lingkaran: '#ef4444',
            segitiga: '#22c55e',
            persegi: '#eab308'
        };

        if (this.#targetEl) {
            this.#targetEl.innerText = target.toUpperCase();
            this.#targetEl.style.color = targetColors[normalizedTarget] || '';
        }
        this.displayShapePreview(target);
    }

    displayShapePreview(shapeName) {
        if (!this.#shapeCanvas || !this.#shapeCtx) return;

        const ctx = this.#shapeCtx;
        const w = this.#shapeCanvas.width;
        const h = this.#shapeCanvas.height;
        drawFoodPreview(ctx, shapeName, w, h);
    }

    setMessage(text, className, duration = 0) {
        // Tampilkan pesan singkat.
        if (this.#messageTimeout) {
            clearTimeout(this.#messageTimeout);
            this.#messageTimeout = null;
        }

        if (this.#messageEl) {
            this.#messageEl.innerText = text;
            this.#messageEl.className = className;
            this.#messageEl.style.display = 'block';
        }

        if (duration > 0) {
            this.#messageTimeout = setTimeout(() => {
                this.clearMessage();
            }, duration);
        }
    }

    clearMessage() {
        // Hapus pesan dan timer lama.
        if (this.#messageTimeout) {
            clearTimeout(this.#messageTimeout);
            this.#messageTimeout = null;
        }
        if (this.#messageEl) {
            this.#messageEl.innerText = '';
            this.#messageEl.className = '';
            this.#messageEl.style.display = 'none';
        }
    }
}