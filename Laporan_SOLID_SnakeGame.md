# Laporan Analisis dan Refactoring SOLID: Snake Game

## 1. Deskripsi Singkat Game
Game ini adalah variasi dari permainan klasik "Snake", di mana pemain mengendalikan seekor ular untuk memakan makanan yang muncul di layar. Keunikannya terletak pada mekanisme "Target Shape". Pemain tidak hanya harus memakan makanan secara acak, melainkan harus memakan bentuk makanan tertentu (Lingkaran, Segitiga, atau Persegi) sesuai dengan target yang diinstruksikan oleh sistem. Jika pemain memakan bentuk yang salah, permainan akan berakhir (Game Over).

## 2. Analisis Masalah (Pelanggaran Prinsip SOLID)
Berdasarkan hasil analisis arsitektur awal pada *codebase*, ditemukan beberapa pelanggaran prinsip SOLID:

### A. Pelanggaran Dependency Inversion Principle (DIP)
*   **Bagian Kode yang Bermasalah:** File `js/game.js` (Constructor kelas `Game`).
*   **Penjelasan:** Modul tingkat tinggi (`Game`) secara langsung melakukan instansiasi terhadap modul tingkat rendah atau dependensinya (seperti `SoundManager`, `ShapeManager`, `UI`, dan `GameState`) menggunakan keyword `new` di dalam *constructor*. Hal ini menyebabkan *tight coupling* (keterikatan yang kuat) antara kelas `Game` dengan implementasi spesifik dari dependensi tersebut. Jika kita ingin mengganti atau melakukan *mocking* terhadap `UI` untuk keperluan testing, kita harus memodifikasi kelas `Game`.

### B. Pelanggaran Open/Closed Principle (OCP)
*   **Bagian Kode yang Bermasalah:** File `js/food.js` (Fungsi `drawFallback` dan `FoodManager.#createFood`).
*   **Penjelasan:** Implementasi awal menggunakan struktur kontrol `if-else` atau *switch-case* secara implisit untuk menentukan cara menggambar objek (*rendering fallback*) berdasarkan tipe *string* ('lingkaran', 'segitiga', 'persegi'). Hal ini melanggar OCP karena jika ada penambahan jenis makanan baru di masa depan (misal: 'bintang'), kita **wajib** mengubah kode di dalam metode inti `drawFallback` dan `#createFood`. Kelas seharusnya "terbuka untuk perluasan, tetapi tertutup untuk modifikasi".

## 3. Penjelasan Perubahan

Untuk memperbaiki struktur kode agar lebih *maintainable* dan mematuhi prinsip SOLID, beberapa *refactoring* telah dilakukan:

### A. Penerapan Dependency Injection (Perbaikan DIP)
*   **Perubahan di `js/game.js`:** *Constructor* kelas `Game` diubah agar tidak lagi melakukan instansiasi sendiri. Alih-alih membuat objek, `Game` kini menerima objek `dependencies` melalui parameternya.
*   **Perubahan di `main.js`:** Semua dependensi (`SoundManager`, `ShapeManager`, `UI`, `GameState`) kini diinisialisasi di level komposisi aplikasi (dalam `main.js`) lalu disuntikkan (*injected*) ke dalam instans `Game`.

### B. Polimorfisme dan Registri Factory (Perbaikan OCP)
*   **Perubahan di `js/food.js`:** Rantai logika `if-else` di dalam `drawFallback` dihapus. Logika rendering spesifik dipindahkan ke dalam masing-masing subclass *Food* (`CircleFood`, `TriangleFood`, `SquareFood`) sebagai *static method* `drawFallback`.
*   Sebuah `FoodRegistry` (peta pemetaan) diperkenalkan. Setiap kali kelas tipe makanan baru dibuat, ia mendaftarkan dirinya ke *registry*. Fungsi utilitas dan `FoodManager` sekarang hanya perlu membaca dari *registry* tanpa harus menggunakan percabangan. Hal ini membuat modul `food.js` mematuhi OCP sepenuhnya.

## 4. Perbandingan Sebelum vs Sesudah (Screenshots / Code Snippets)

*(Catatan: Karena keterbatasan antarmuka CLI, perbandingan disajikan dalam bentuk cuplikan kode krusial yang setara dengan representasi arsitekturalnya).*

### Kasus 1: Dependency Inversion Principle (DIP) pada `game.js`

**SEBELUM (Pelanggaran):**
```javascript
// constructor di js/game.js
constructor(canvasId, onGameOver) {
    // ...
    // Game menciptakan dependensinya sendiri (Tight Coupling)
    this.#sound = new SoundManager();
    this.#shapeManager = new ShapeManager();
    this.#ui = new UI();
    this.#state = new GameState();
    // ...
}
```

**SESUDAH (Telah diperbaiki):**
```javascript
// constructor di js/game.js
constructor(canvasId, onGameOver, dependencies) {
    // ...
    // Game menerima dependensi dari luar (Dependency Injection)
    this.#sound = dependencies.sound;
    this.#shapeManager = dependencies.shapeManager;
    this.#ui = dependencies.ui;
    this.#state = dependencies.state;
    // ...
}

// Di dalam main.js (Komposisi / Wiring)
const dependencies = {
    sound: new SoundManager(),
    shapeManager: new ShapeManager(),
    ui: new UI(),
    state: new GameState()
};
gameInstance = new Game('gameCanvas', showRestartDialog, dependencies);
```

### Kasus 2: Open/Closed Principle (OCP) pada `food.js`

**SEBELUM (Pelanggaran):**
```javascript
// drawFallback di js/food.js
function drawFallback(ctx, type, x, y, size) {
    const normalizedType = String(type).toLowerCase();
    
    // Hardcoded if-else melanggar OCP
    if (normalizedType === 'lingkaran') {
        // ... logika gambar lingkaran ...
        return;
    }
    if (normalizedType === 'segitiga') {
        // ... logika gambar segitiga ...
        return;
    }
    // ... logika gambar persegi ...
}
```

**SESUDAH (Telah diperbaiki):**
```javascript
// js/food.js menggunakan Registry
export const FoodRegistry = new Map();

export function drawFoodVisual(ctx, type, x, y, size, paddingRatio = 0.02, scale = 1.08) {
    // ... (logic image loading) ...

    // Memanfaatkan polymorphism & registry, tidak perlu if-else
    const FoodClass = FoodRegistry.get(String(type).toLowerCase());
    if (FoodClass && FoodClass.drawFallback) {
        FoodClass.drawFallback(ctx, x, y, size);
    }
}

export class CircleFood extends Food {
    // Logika gambar berada pada kelasnya sendiri
    static drawFallback(ctx, x, y, size) { /* ... logika lingkaran ... */ }
    /* ... */
}
FoodRegistry.set('lingkaran', CircleFood); // Pendaftaran modular
```

## 5. Keterbatasan Sistem Terkait Format PDF dan Video
Sebagai asisten CLI AI, saya beroperasi di lingkungan teks dan **tidak dapat menghasilkan/mengekspor file PDF maupun merekam layar (video) secara langsung**.

*   **Untuk menghasilkan PDF:** Laporan ini telah saya tulis di dalam format Markdown (`Laporan_SOLID_SnakeGame.md`). Anda dapat membukanya di editor teks modern (seperti VS Code atau Typora) lalu mengekspornya ke bentuk PDF (`Export/Print to PDF`). Di dalamnya sudah mencakup perbandingan analisis yang setara dengan tangkapan layar fungsional.
*   **Untuk Video Demo:** Anda dapat menggunakan aplikasi *screen recorder* (misal: OBS Studio atau Xbox Game Bar) untuk merekam tampilan web (*browser*) Anda saat memainkan versi *game* yang sudah saya *refactor* kodenya ini, selama 2-5 menit sesuai kebutuhan tugas.
