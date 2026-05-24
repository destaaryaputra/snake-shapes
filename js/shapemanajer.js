import { IResetable } from './interfaces.js';

export class ShapeManager extends IResetable {
    #sequence;
    #currentTarget;

    constructor() {
        super();
        // Daftar shape target.
        this.#sequence = ['lingkaran', 'segitiga', 'persegi'];
        this.#currentTarget = this.#getRandomShape();
    }

    reset() {
        // Reset target saat game ulang.
        this.#currentTarget = this.#getRandomShape();
    }

    getCurrentTarget() {
        // Ambil target yang sedang aktif.
        return this.#currentTarget;
    }

    setCurrentTarget(target) {
        const normalized = String(target).toLowerCase();
        if (this.#sequence.includes(normalized)) {
            this.#currentTarget = normalized;
        }
    }

    getSequence() {
        return [...this.#sequence];
    }

    advanceSequence() {
        // Setelah benar, pilih target baru.
        let nextTarget = this.#getRandomShape();
        if (this.#sequence.length > 1) {
            while (nextTarget === this.#currentTarget) {
                nextTarget = this.#getRandomShape();
            }
        }
        this.#currentTarget = nextTarget;
    }

    #getRandomShape() {
        // Ambil shape acak.
        const randomIndex = Math.floor(Math.random() * this.#sequence.length);
        return this.#sequence[randomIndex];
    }
}