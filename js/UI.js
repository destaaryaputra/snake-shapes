export class UI {
    constructor() {
        this.scoreEl = document.getElementById('score');
        this.targetEl = document.getElementById('target');
        this.messageEl = document.getElementById('message');
        this.messageTimeout = null;
    }

    updateScore(score) {
        this.scoreEl.innerText = score;
        const currentScore = document.getElementById('currentScore');
        if (currentScore) currentScore.innerText = score;
    }

    updateHighScore(highScore) {
        const headerScore = document.getElementById('highScoreHeader');
        if (headerScore) headerScore.innerText = highScore;
    }

    updateTarget(target) {
        this.targetEl.innerText = target.toUpperCase();
    }

    setMessage(text, className, duration = 0) {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }

        this.messageEl.innerText = text;
        this.messageEl.className = className;
        this.messageEl.style.display = 'block'; 

        if (duration > 0) {
            this.messageTimeout = setTimeout(() => {
                this.clearMessage();
            }, duration);
        }
    }

    clearMessage() {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        this.messageEl.innerText = '';
        this.messageEl.className = '';
        this.messageEl.style.display = 'none'; 
    }
}