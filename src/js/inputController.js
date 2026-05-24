export class InputController {
    // Semua properti private agar akses input tetap terkontrol lewat method public.
    #game;
    #gridSize;
    #isAttached;
    #handleKeyDown;

    constructor(game, gridSize) {
        // Simpan referensi game dan ukuran langkah grid.
        this.#game = game;
        this.#gridSize = gridSize;
        this.#isAttached = false;
        this.#handleKeyDown = this.#onKeyDown.bind(this);
    }

    attach() {
        // Pasang listener keyboard sekali saja.
        if (this.#isAttached) return;
        document.addEventListener('keydown', this.#handleKeyDown);
        this.#isAttached = true;
    }

    detach() {
        // Lepas listener saat tidak dibutuhkan agar tidak dobel.
        if (!this.#isAttached) return;
        document.removeEventListener('keydown', this.#handleKeyDown);
        this.#isAttached = false;
    }

    setGridSize(gridSize) {
        // Update jarak langkah input saat ukuran board berubah.
        const value = Number(gridSize);
        if (Number.isFinite(value) && value > 0) {
            this.#gridSize = value;
        }
    }

    #onKeyDown(event) {
        // Handler private: memetakan tombol panah ke arah gerak snake.
        if (!this.#game) return;

        const allowedKeys = [ 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ];
        if (allowedKeys.includes(event.code)) {
            // Cegah browser scroll saat tombol panah ditekan.
            event.preventDefault();
        }

        // Ubah arah sesuai tombol yang ditekan.
        if (event.code === 'ArrowUp') this.#game.setDirection(0, -this.#gridSize);
        else if (event.code === 'ArrowDown') this.#game.setDirection(0, this.#gridSize);
        else if (event.code === 'ArrowLeft') this.#game.setDirection(-this.#gridSize, 0);
        else if (event.code === 'ArrowRight') this.#game.setDirection(this.#gridSize, 0);

        // Notifikasi ke game bahwa player sudah mulai memberi input.
        this.#game.handleFirstInput();
    }
}
