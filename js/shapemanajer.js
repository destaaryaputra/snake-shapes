export class ShapeManager {
    constructor() {
        this.sequence = ['lingkaran', 'segitiga', 'persegi'];
        this.currentIndex = 0;
    }

    reset() {
        this.currentIndex = 0;
    }

    getCurrentTarget() {
        return this.sequence[this.currentIndex];
    }

    advanceSequence() {
        this.currentIndex = (this.currentIndex + 1) % this.sequence.length;
    }

    getRandomShape() {
        const randomIndex = Math.floor(Math.random() * this.sequence.length);
        return this.sequence[randomIndex];
    }
}