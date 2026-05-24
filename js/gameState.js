import { IResetable } from './interfaces.js';

export class GameState extends IResetable {
    // Data inti game disimpan private agar tidak diubah sembarangan dari luar class.
    #score;
    #highScore;
    #isGameOver;
    #firstInput;

    constructor() {
        super();
        // Nilai awal saat game pertama kali dibuat.
        this.#score = 0;
        this.#highScore = 0;
        this.#isGameOver = false;
        this.#firstInput = true;
    }

    reset() {
        // Reset nilai saat mulai game baru, high score tetap disimpan.
        this.#score = 0;
        this.#isGameOver = false;
        this.#firstInput = true;
    }

    getScore() {
        // Gate getter untuk membaca skor saat ini.
        return this.#score;
    }

    addScore(points) {
        // Tambah skor hanya jika input valid dan positif.
        const value = Number(points);
        if (Number.isFinite(value) && value > 0) {
            this.#score += value;
        }
        return this.#score;
    }

    getHighScore() {
        // Gate getter untuk high score.
        return this.#highScore;
    }

    updateHighScoreIfNeeded() {
        // High score diperbarui jika skor sekarang lebih tinggi.
        if (this.#score > this.#highScore) {
            this.#highScore = this.#score;
        }
        return this.#highScore;
    }

    setHighScore(highScore) {
        // Setter tetap divalidasi agar nilai tidak negatif.
        const value = Number(highScore);
        if (Number.isFinite(value) && value >= 0) {
            this.#highScore = value;
        }
    }

    isGameOver() {
        // Dipakai loop game untuk tahu apakah game harus berhenti.
        return this.#isGameOver;
    }

    endGame() {
        // Menandai state game over.
        this.#isGameOver = true;
    }

    startGame() {
        // Menandai game aktif kembali.
        this.#isGameOver = false;
    }

    isFirstInput() {
        // Flag ini dipakai untuk menghilangkan pesan awal saat player mulai gerak.
        return this.#firstInput;
    }

    clearFirstInput() {
        // Setelah input pertama diterima, flag dimatikan.
        this.#firstInput = false;
    }
}
