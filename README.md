# LAPORAN PRAKTIKUM
**Implementasi Abstract Class dan Interface pada Game**

## 1. Cover
**(Silakan sesuaikan dengan format standar kampusmu)**
* **Mata Kuliah:** [Nama Mata Kuliah]
* **Judul Praktikum:** Implementasi Abstract Class dan Interface pada Game
* **Nama:** [Nama Kamu]
* **NPM / NIM:** [NPM Kamu]
* **Kelas:** [Kelas Kamu]
* **Program Studi:** [Program Studi Kamu]
* **Universitas:** [Nama Universitas]
* **Tahun:** 2026

---

## 2. Tujuan Praktikum
1. Memahami konsep dasar *Object-Oriented Programming* (OOP) khususnya *Abstract Class* dan *Interface*.
2. Mengimplementasikan *Abstract Class* dan *Interface* ke dalam bahasa pemrograman JavaScript (Vanilla JS).
3. Membangun struktur kode game yang lebih terorganisir, aman (*type-safe*), *modular*, dan mudah dikembangkan (*maintainable*).
4. Menganalisis perbedaan dan keuntungan arsitektur kode sebelum dan sesudah penerapan pola abstraksi.

---

## 3. Deskripsi Game
* **Nama Game:** Snake & Shapes
* **Konsep Game:** Sebuah modifikasi dari game klasik Snake. Pemain mengendalikan ular yang harus memakan makanan (food) di atas area permainan. Berbeda dengan game Snake biasa, makanan dalam game ini memiliki bentuk yang spesifik (Lingkaran, Segitiga, Persegi). Pemain harus memakan bentuk makanan yang sesuai dengan "Target" yang ditampilkan di layar agar mendapatkan poin.
* **Objek dalam Game:**
  1. **Snake:** Entitas ular yang bisa bergerak, bertambah panjang, dan menabrak.
  2. **Food:** Entitas makanan yang memiliki posisi dan tipe bentuk (Lingkaran, Segitiga, Persegi).
  3. **Managers:** Pengelola logika game seperti `FoodManager` (mengatur sebaran makanan), `ShapeManager` (mengatur urutan target bentuk), `GameState` (mengatur skor dan nyawa), dan `SoundManager`.
  4. **UI & Input:** Pengontrol tampilan antarmuka dan interaksi keyboard pemain.

---

## 4. Desain OOP

### 4.1 Abstract Class
* **Nama:** `Food`
* **Atribut:** `#type`, `#x`, `#y`, `#gridSize` (Seluruh atribut di-enkapsulasi menggunakan *private fields* `#`).
* **Method Abstract:** Menerapkan pengecekan `new.target === Food` pada *constructor* untuk mencegah instansiasi langsung, dan mewariskan kewajiban implementasi method `draw(ctx)` kepada *subclass*-nya.
* **Alasan:** Objek `Food` secara konseptual adalah entitas dasar yang belum memiliki bentuk visual nyata (bisa berupa lingkaran, segitiga, atau persegi). Dengan menjadikannya *Abstract Class*, program dipaksa agar hanya bisa membuat objek makanan dari kelas turunan yang bentuknya sudah spesifik. Selain itu, kelas ini berfungsi untuk mensentralisasi atribut umum (seperti koordinat `x`, `y`, dan setter/getter) agar tidak perlu ditulis ulang di setiap kelas turunannya.

### 4.2 Interface
Karena JavaScript (Vanilla JS) tidak memiliki *keyword* khusus untuk antarmuka, *Interface* disimulasikan menggunakan kelas yang akan melempar *Error* jika diinstansiasi langsung atau jika method-nya tidak di-*override*.

* **Interface 1:** `IDrawable`
  * **Method:** `draw(ctx)`
  * **Digunakan pada:** Kelas `Food` (termasuk semua turunannya), `FoodManager`, dan `Snake`. Digunakan sebagai kontrak bahwa setiap objek yang berwujud visual wajib memiliki logika untuk menggambar dirinya sendiri di atas *canvas*.

* **Interface 2:** `IResetable`
  * **Method:** `reset()`
  * **Digunakan pada:** Kelas `GameState` dan `ShapeManager`. Digunakan sebagai kontrak bahwa manajer status permainan ini harus bisa dikembalikan ke kondisi awal (misalnya ketika pemain memulai ulang permainan).

### 4.3 Class Turunan
Berikut adalah daftar *subclass* (kelas turunan) yang mengimplementasikan *Abstract Class* dan *Interface* di atas:
1. **`CircleFood`**: Turunan dari `Food`, mengimplementasikan bentuk makanan lingkaran.
2. **`TriangleFood`**: Turunan dari `Food`, mengimplementasikan bentuk makanan segitiga.
3. **`SquareFood`**: Turunan dari `Food`, mengimplementasikan bentuk makanan persegi.
4. **`Snake`**: Mengimplementasikan antarmuka `IDrawable`.
5. **`FoodManager`**: Mengimplementasikan antarmuka `IDrawable`.
6. **`GameState`**: Mengimplementasikan antarmuka `IResetable`.
7. **`ShapeManager`**: Mengimplementasikan antarmuka `IResetable`.

---

## 5. Implementasi Kode dan Output

Di bawah ini adalah potongan kode yang menjadi bukti implementasi dari desain OOP yang telah dijelaskan pada Bagian 4. Tanda komentar ditambahkan untuk mempermudah identifikasi.

**A. Implementasi Interface (Berdasarkan poin 4.2)**
File: `interfaces.js`
```javascript
// [4.2] Interface 1: IDrawable
export class IDrawable {
    constructor() {
        if (new.target === IDrawable) {
            throw new TypeError("Interface 'IDrawable' tidak dapat diinstansiasi secara langsung.");
        }
    }
    // Method Abstract yang wajib di-override
    draw(ctx) {
        throw new Error("Method 'draw(ctx)' wajib diimplementasikan oleh subclass.");
    }
}

// [4.2] Interface 2: IResetable
export class IResetable {
    // Method Abstract yang wajib di-override
    reset() {
        throw new Error("Method 'reset()' wajib diimplementasikan oleh subclass.");
    }
}
```

**Implementasi Abstract Class dan Subclass (`food.js`):**
```javascript
class Food extends IDrawable {
    #type; #x; #y; #gridSize;

    constructor(type, x, y, gridSize) {
        super();
        if (new.target === Food) {
            throw new TypeError("Abstract class 'Food' tidak dapat diinstansiasi secara langsung.");
        }
        this.setType(type);
        this.setGridSize(gridSize);
        this.setPosition(x, y);
    }
    // ... (getter dan setter)
}

export class CircleFood extends Food {
    constructor(x, y, gridSize) {
        super('lingkaran', x, y, gridSize);
    }

    draw(ctx) {
        const size = this.getGridSize();
        const x = this.getX();
        const y = this.getY();
        drawFoodVisual(ctx, this.getType(), x, y, size);
    }
}

export class TriangleFood extends Food {
    constructor(x, y, gridSize) {
        super('segitiga', x, y, gridSize);
    }
    draw(ctx) {
        // ... (memanggil fungsi gambar segitiga)
    }
}

export class SquareFood extends Food {
    constructor(x, y, gridSize) {
        super('persegi', x, y, gridSize);
    }
    draw(ctx) {
        // ... (memanggil fungsi gambar persegi)
    }
}

export class FoodManager extends IDrawable {
    // ... (atribut private lainnya)
    constructor(gridSize, canvasWidth, canvasHeight) {
        super(); // Memanggil constructor IDrawable
        // ...
    }
    draw(ctx) {
        // Menggambar semua tumpukan makanan (wajib ada dari IDrawable)
        this.#foods.forEach(food => food.draw(ctx));
    }
}
```

**Output Program:**
*(Silakan tempelkan screenshot game saat sedang dimainkan di sini)*

---

## 6. Analisis
**Bagaimana hasil program sebelum dan setelah diterapkan abstract class dan interface?**

* **Sebelum Penerapan:** 
  Sebelum menggunakan `IDrawable` dan class abstract secara ketat, metode untuk menggambar visual (misal: `draw()`) didefinisikan secara manual di masing-masing objek. Jika seorang *programmer* lupa mendefinisikan metode `draw()` pada objek baru (misalnya membuat objek Makanan Bintang), game akan langsung *crash* saat perulangan *render* berjalan. Selain itu, *programmer* bisa saja secara tidak sengaja mengeksekusi `new Food()`, yang menghasilkan entitas makanan kosong tanpa gambar di layar.
* **Setelah Penerapan:** 
  Struktur kode berubah menjadi sangat kokoh (*robust*). Dengan mengimplementasikan `IDrawable` dan kelas abstrak `Food`, program dijamin **tidak akan bisa salah**. Jika metode `draw()` lupa dibuat pada *subclass* baru, program akan melempar pesan *Error* yang sangat jelas. Begitu juga dengan instansiasi `new Food()` yang otomatis dicegah melalui mekanisme `new.target`. Hasil akhirnya, *codebase* game jauh lebih terstruktur, logikanya sangat jelas (*contract-driven*), dan potensi *bug* visual bisa ditekan hingga mendekati nol.

---

## 7. Kesimpulan
Bahasa pemrograman JavaScript Vanilla memang tidak memiliki fitur *Abstract Class* atau *Interface* secara *native* layaknya bahasa Java maupun C#. Namun, konsep *Object-Oriented Programming* (OOP) tersebut tetap dapat diimplementasikan menggunakan kombinasi kelas ES6, mekanisme `new.target` pada *constructor*, dan manipulasi *error handling*. 

Penerapan *Abstract Class* (`Food`) dan *Interface* (`IDrawable`, `IResetable`) pada game *Snake & Shapes* membuktikan bahwa pendekatan OOP yang baik mampu memisahkan tanggung jawab kelas dengan jelas (*Separation of Concerns*). Objek visual dipaksa mematuhi kontrak *rendering*, objek *state* dipaksa bisa di-reset, dan instansiasi entitas tanpa wujud konkret dapat dihindari. Hal ini menjadikan proyek lebih mudah untuk dikelola, dibaca, dan diperluas skalanya di masa depan.

---

## 8. Lampiran
### Logbook Praktikum

| Tanggal | Aktivitas / Pekerjaan | Hasil / Keterangan | Kendala |
| :--- | :--- | :--- | :--- |
| [Tanggal] | Menganalisis struktur file JS dan mendefinisikan OOP dasar. | Menemukan titik integrasi untuk *Interface*. | - |
| [Tanggal] | Membuat file `interfaces.js` untuk `IDrawable` dan `IResetable`. | *Interface* berhasil disimulasikan melalui *Error handling*. | JS tidak mendukung strict-typing native. |
| [Tanggal] | Menerapkan `new.target` pada *constructor* `Food`. | `Food` resmi menjadi *Abstract Class*. | Menyesuaikan pemanggilan `super()`. |
| [Tanggal] | Refactor `Snake`, `GameState`, dan `ShapeManager`. | Semua kelas turunan mematuhi kontrak masing-masing. | - |
| [Tanggal] | Menyusun dan menyelesaikan Laporan Praktikum. | Laporan berhasil dibuat. | - |

# snake-shapes
