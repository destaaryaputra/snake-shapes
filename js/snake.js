import { IDrawable } from './interfaces.js';

export class Snake extends IDrawable {
    #gridSize;
    #body;
    #prevBody;
    #dx;
    #dy;
    #headLoaded;
    #bodyLoaded;
    #imgHead;
    #imgBody;

    constructor(gridSize, canvasWidth = 640, canvasHeight = 480) {
        super();
        // Simpan ukuran grid.
        this.#gridSize = gridSize;

        // Posisi awal di tengah canvas.
        const startX = Math.floor((canvasWidth / 2) / gridSize) * gridSize;
        const startY = Math.floor((canvasHeight / 2) / gridSize) * gridSize;

        // Body awal ada tiga bagian.
        this.#body = [
            { x: startX, y: startY },
            { x: startX - gridSize, y: startY },
            { x: startX - gridSize * 2, y: startY }
        ];
        // prevBody dipakai untuk animasi halus.
        this.#prevBody = this.#body.map(segment => ({ x: segment.x, y: segment.y }));

        // Arah awal ke kanan.
        this.#dx = gridSize;
        this.#dy = 0;
        
        // Penanda sprite sudah siap.
        this.#headLoaded = false;
        this.#bodyLoaded = false;
        
        // Muat gambar kepala.
        this.#imgHead = new Image();
        this.#imgHead.src = 'assets/kepala.png';
        this.#imgHead.onload = () => { this.#headLoaded = true; };
        this.#imgHead.onerror = () => { console.error('Gagal load kepala.png'); };
        
        // Muat gambar badan.
        this.#imgBody = new Image();
        this.#imgBody.src = 'assets/badan.png';
        this.#imgBody.onload = () => { this.#bodyLoaded = true; };
        this.#imgBody.onerror = () => { console.error('Gagal load badan.png'); };
    }

    getGridSize() {
        return this.#gridSize;
    }

    setGridSize(gridSize) {
        const parsed = Number(gridSize);
        this.#gridSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }

    getBodySnapshot() {
        return this.#body.map(segment => ({ x: segment.x, y: segment.y }));
    }

    getHead() {
        const head = this.#body[0];
        return head ? { x: head.x, y: head.y } : null;
    }

    hasSelfCollision(startIndex = 2) {
        const head = this.#body[0];
        if (!head) return false;

        for (let i = startIndex; i < this.#body.length; i++) {
            if (head.x === this.#body[i].x && head.y === this.#body[i].y) {
                return true;
            }
        }
        return false;
    }

    move() {
        // Tambah kepala baru.
        const head = { x: this.#body[0].x + this.#dx, y: this.#body[0].y + this.#dy };
        this.#body.unshift(head);
    }

    capturePreviousBody() {
        // Simpan posisi badan sebelum update.
        this.#prevBody = this.#body.map(segment => ({ x: segment.x, y: segment.y }));
    }

    popTail() {
        // Hapus ekor saat tidak makan.
        this.#body.pop();
    }

    setDirection(dx, dy) {
        // Cegah ular langsung balik arah.
        if (this.#dx === 0 && dx !== 0 || this.#dy === 0 && dy !== 0) {
            this.#dx = dx;
            this.#dy = dy;
        }
    }

    #getRotationFromDelta(dx, dy) {
        // Arah dasar gambar menghadap atas.
        if (dx > 0) return Math.PI / 2;
        if (dx < 0) return -Math.PI / 2;
        if (dy > 0) return Math.PI;
        return 0;
    }

    #drawRotatedSprite(ctx, img, x, y, size, rotation) {
        // Helper untuk gambar sprite yang diputar.
        ctx.save();
        ctx.translate(x + this.#gridSize / 2, y + this.#gridSize / 2);
        ctx.rotate(rotation);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
    }

    #drawRotatedSpriteAtCenter(ctx, img, centerX, centerY, size, rotation) {
        // Helper dengan titik tengah.
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
    }

    #normalizeAngle(angle) {
        // Batas sudut tetap rapi.
        let a = angle;
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    }

    #lerpAngle(from, to, t) {
        // Bikin putaran lebih halus.
        const diff = this.#normalizeAngle(to - from);
        return from + diff * t;
    }

    #getInterpolatedBody(alpha) {
        // Alpha dipakai untuk animasi di tengah langkah.
        const linearT = Math.max(0, Math.min(1, alpha));
        // Transisi dibuat lebih halus.
        const t = linearT * linearT * linearT * (linearT * (linearT * 6 - 15) + 10);

        return this.#body.map((segment, index) => {
            const prev = this.#prevBody[index] || segment;
            return {
                x: prev.x + (segment.x - prev.x) * t,
                y: prev.y + (segment.y - prev.y) * t
            };
        });
    }

    #getHeadRotation(renderBody) {
        // Rotasi kepala ikut arah badan.
        const head = renderBody[0];
        const neck = renderBody[1];

        if (head && neck) {
            return Math.atan2(head.y - neck.y, head.x - neck.x) + Math.PI / 2;
        }

        return this.#getRotationFromDelta(this.#dx, this.#dy);
    }

    #createSmoothPoints(points) {
        if (points.length < 2) return points;

        // Haluskan garis badan.
        let refined = points.slice();
        const iterations = 4;

        for (let k = 0; k < iterations; k++) {
            if (refined.length < 2) break;

            const next = [refined[0]];
            for (let i = 0; i < refined.length - 1; i++) {
                const p0 = refined[i];
                const p1 = refined[i + 1];

                const q = {
                    x: 0.75 * p0.x + 0.25 * p1.x,
                    y: 0.75 * p0.y + 0.25 * p1.y
                };
                const r = {
                    x: 0.25 * p0.x + 0.75 * p1.x,
                    y: 0.25 * p0.y + 0.75 * p1.y
                };

                next.push(q, r);
            }
            next.push(refined[refined.length - 1]);
            refined = next;
        }

        return refined;
    }

    #resamplePoints(points, minDistance) {
        if (points.length < 2) return points;

        // Buang titik yang terlalu rapat.
        const result = [points[0]];
        let last = points[0];

        for (let i = 1; i < points.length; i++) {
            const current = points[i];
            const dx = current.x - last.x;
            const dy = current.y - last.y;
            const dist = Math.hypot(dx, dy);

            if (dist >= minDistance || i === points.length - 1) {
                result.push(current);
                last = current;
            }
        }

        return result;
    }

    #drawCurvedBody(ctx, renderBody) {
        if (renderBody.length < 2) return;

        // Buat titik jalur dari ekor ke kepala.
        const points = [];
        for (let i = renderBody.length - 1; i >= 1; i--) {
            points.push({
                x: renderBody[i].x + this.#gridSize / 2,
                y: renderBody[i].y + this.#gridSize / 2
            });
        }

        // Tambah titik di ekor.
        if (points.length >= 2) {
            const tail = points[0];
            const tailNext = points[1];

            const tailHingeT = 0.62;
            points.splice(1, 0, {
                x: tail.x + (tailNext.x - tail.x) * tailHingeT,
                y: tail.y + (tailNext.y - tail.y) * tailHingeT
            });

            const tailExtend = 0.62;
            points.unshift({
                x: tail.x + (tail.x - tailNext.x) * tailExtend,
                y: tail.y + (tail.y - tailNext.y) * tailExtend
            });
        }

        // Tambah titik penghubung di leher.
        const headCenter = {
            x: renderBody[0].x + this.#gridSize / 2,
            y: renderBody[0].y + this.#gridSize / 2
        };
        const firstBodyCenter = {
            x: renderBody[1].x + this.#gridSize / 2,
            y: renderBody[1].y + this.#gridSize / 2
        };
        const neckT = 0.62;
        points.push({
            x: firstBodyCenter.x + (headCenter.x - firstBodyCenter.x) * neckT,
            y: firstBodyCenter.y + (headCenter.y - firstBodyCenter.y) * neckT
        });

        if (points.length < 2) return;

        if (!this.#bodyLoaded) {
            // Pakai bentuk sederhana kalau gambar belum siap.
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = this.#gridSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.restore();
            return;
        }

        const smoothPoints = this.#createSmoothPoints(points);
        const stablePoints = this.#resamplePoints(smoothPoints, this.#gridSize * 0.08);
        // Body digambar lebih besar.
        const bodySize = this.#gridSize * 2.6;
        const spacing = this.#gridSize * 0.22;

        let carry = 0;
        let lastRotation = null;
        const totalSegments = Math.max(1, stablePoints.length - 1);
        for (let i = 1; i < stablePoints.length; i++) {
            const a = stablePoints[i - 1];
            const b = stablePoints[i];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const segLen = Math.hypot(dx, dy);

            if (segLen === 0) continue;

            const baseRotation = Math.atan2(dy, dx) + Math.PI / 2;
            let dist = carry;
            while (dist <= segLen) {
                const t = dist / segLen;
                const px = a.x + dx * t;
                const py = a.y + dy * t;

                // Ekor lebih halus, dekat kepala lebih tegas.
                const pathProgress = i / totalSegments;
                let blendFactor = 0.26 + (0.42 - 0.26) * pathProgress;
                if (lastRotation !== null) {
                    const turnDelta = Math.abs(this.#normalizeAngle(baseRotation - lastRotation));
                    if (turnDelta > 1.1) {
                        // Belokan tajam diberi halus ekstra.
                        blendFactor = 0.18;
                    }
                }
                const drawRotation = lastRotation === null
                    ? baseRotation
                    : this.#lerpAngle(lastRotation, baseRotation, blendFactor);
                this.#drawRotatedSpriteAtCenter(ctx, this.#imgBody, px, py, bodySize, drawRotation);
                lastRotation = drawRotation;
                dist += spacing;
            }

            carry = dist - segLen;
        }
    }

    draw(ctx, alpha = 1) {
        // Matikan smoothing agar gambar tetap tajam.
        ctx.imageSmoothingEnabled = false;
        const interpolatedBody = this.#getInterpolatedBody(alpha);
        const renderBody = interpolatedBody;

        this.#drawCurvedBody(ctx, renderBody);

        const head = renderBody[0];
        if (!head) return;

        if (this.#headLoaded) {
            const rotation = this.#getHeadRotation(renderBody);
            const headSize = this.#gridSize * 1.85;
            this.#drawRotatedSprite(ctx, this.#imgHead, head.x, head.y, headSize, rotation);
        } else {
            // Pakai kotak hijau kalau gambar belum siap.
            ctx.fillStyle = '#10b981';
            ctx.fillRect(head.x, head.y, this.#gridSize, this.#gridSize);
        }
    }
}