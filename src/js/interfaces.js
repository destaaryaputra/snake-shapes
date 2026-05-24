/**
 * @interface
 * @classdesc Merepresentasikan objek yang bisa digambar di canvas.
 * Kelas ini dimaksudkan sebagai interface dan tidak untuk diinstansiasi langsung.
 */
export class IDrawable {
    constructor() {
        if (new.target === IDrawable) {
            throw new TypeError("Interface 'IDrawable' tidak dapat diinstansiasi secara langsung.");
        }
    }

    /**
     * Menggambar objek ke dalam konteks canvas.
     * @param {CanvasRenderingContext2D} ctx - Konteks rendering canvas.
     */
    draw(ctx) {
        throw new Error("Method 'draw(ctx)' wajib diimplementasikan oleh subclass.");
    }
}

/**
 * @interface
 * @classdesc Merepresentasikan objek yang state-nya bisa di-reset ke kondisi awal.
 */
export class IResetable {
    reset() {
        throw new Error("Method 'reset()' wajib diimplementasikan oleh subclass.");
    }
}