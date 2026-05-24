import { IDrawable } from './interfaces.js';

const FOOD_IMAGE_SOURCES = {
    lingkaran: 'assets/lingkaran.png',
    segitiga: 'assets/segitiga.png',
    persegi: 'assets/persegi.png'
};

const imageCache = new Map();
const previewLoadSubscribed = new Set();

export const FoodRegistry = new Map();

function getImageForType(type) {
    const key = String(type).toLowerCase();
    if (!FOOD_IMAGE_SOURCES[key]) return null;

    if (!imageCache.has(key)) {
        const image = new Image();
        image.src = FOOD_IMAGE_SOURCES[key];
        imageCache.set(key, image);
    }

    return imageCache.get(key);
}

export function drawFoodVisual(ctx, type, x, y, size, paddingRatio = 0.02, scale = 1.08) {
    const image = getImageForType(type);
    const padding = Math.max(0, size * paddingRatio);
    const baseSize = Math.max(1, size - (padding * 2));
    const drawSize = Math.max(1, baseSize * scale);
    const offset = (baseSize - drawSize) / 2;

    if (image && image.complete && image.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, x + padding + offset, y + padding + offset, drawSize, drawSize);
        return;
    }

    const FoodClass = FoodRegistry.get(String(type).toLowerCase());
    if (FoodClass && FoodClass.drawFallback) {
        FoodClass.drawFallback(ctx, x, y, size);
    }
}

export function drawFoodPreview(ctx, type, canvasWidth, canvasHeight) {
    const side = Math.min(canvasWidth, canvasHeight) * 0.86;
    const x = (canvasWidth - side) / 2;
    const y = (canvasHeight - side) / 2;
    const image = getImageForType(type);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawFoodVisual(ctx, type, x, y, side, 0.06, 0.9);

    const key = String(type).toLowerCase();
    if (image && !image.complete && !previewLoadSubscribed.has(key)) {
        previewLoadSubscribed.add(key);
        image.addEventListener('load', () => {
            drawFoodPreview(ctx, type, canvasWidth, canvasHeight);
        }, { once: true });
    }
}

class Food extends IDrawable {
    #type;
    #x;
    #y;
    #gridSize;

    constructor(type, x, y, gridSize) {
        super();
        if (new.target === Food) {
            throw new TypeError("Abstract class 'Food' tidak dapat diinstansiasi secara langsung.");
        }
        this.setType(type);
        this.setGridSize(gridSize);
        this.setPosition(x, y);
    }

    getType() { return this.#type; }
    setType(type) { this.#type = String(type); }
    getX() { return this.#x; }
    setX(x) { this.#x = Number(x); }
    getY() { return this.#y; }
    setY(y) { this.#y = Number(y); }
    getGridSize() { return this.#gridSize; }
    setGridSize(gridSize) {
        const parsed = Number(gridSize);
        this.#gridSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
    getPosition() { return { x: this.#x, y: this.#y }; }
    setPosition(x, y) { this.setX(x); this.setY(y); }
}

export class CircleFood extends Food {
    constructor(x, y, gridSize) {
        super('lingkaran', x, y, gridSize);
    }
    static drawFallback(ctx, x, y, size) {
        const half = size / 2;
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + half, y + half, half - 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    draw(ctx) { drawFoodVisual(ctx, this.getType(), this.getX(), this.getY(), this.getGridSize()); }
}
FoodRegistry.set('lingkaran', CircleFood);

export class TriangleFood extends Food {
    constructor(x, y, gridSize) {
        super('segitiga', x, y, gridSize);
    }
    static drawFallback(ctx, x, y, size) {
        const half = size / 2;
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + half, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    draw(ctx) { drawFoodVisual(ctx, this.getType(), this.getX(), this.getY(), this.getGridSize()); }
}
FoodRegistry.set('segitiga', TriangleFood);

export class SquareFood extends Food {
    constructor(x, y, gridSize) {
        super('persegi', x, y, gridSize);
    }
    static drawFallback(ctx, x, y, size) {
        ctx.fillStyle = '#eab308';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.fill();
        ctx.stroke();
    }
    draw(ctx) { drawFoodVisual(ctx, this.getType(), this.getX(), this.getY(), this.getGridSize()); }
}
FoodRegistry.set('persegi', SquareFood);

export class FoodManager extends IDrawable {
    #gridSize;
    #canvasWidth;
    #canvasHeight;
    #types;
    #foods;
    #blockedPositions;

    constructor(gridSize, canvasWidth, canvasHeight, blockedPositions = []) {
        super();
        this.#types = Array.from(FoodRegistry.keys());
        this.#foods = [];
        this.#blockedPositions = Array.isArray(blockedPositions) ? blockedPositions : [];
        this.setGridSize(gridSize);
        this.setCanvasWidth(canvasWidth);
        this.setCanvasHeight(canvasHeight);
        this.respawn();
    }

    getGridSize() { return this.#gridSize; }
    setGridSize(gridSize) {
        const parsed = Number(gridSize);
        this.#gridSize = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
        this.#foods.forEach(f => f.setGridSize(this.#gridSize));
    }
    getCanvasWidth() { return this.#canvasWidth; }
    setCanvasWidth(canvasWidth) { this.#canvasWidth = Number(canvasWidth); }
    getCanvasHeight() { return this.#canvasHeight; }
    setCanvasHeight(canvasHeight) { this.#canvasHeight = Number(canvasHeight); }
    setBlockedPositions(blockedPositions) {
        this.#blockedPositions = Array.isArray(blockedPositions) ? blockedPositions : [];
    }

    getFoods() { return [...this.#foods]; }
    getFoodsSnapshot() {
        return this.#foods.map(f => ({ type: f.getType(), x: f.getX(), y: f.getY() }));
    }

    updateBoundaries(canvasWidth, canvasHeight, blockedPositions = this.#blockedPositions) {
        this.setCanvasWidth(canvasWidth);
        this.setCanvasHeight(canvasHeight);
        this.setBlockedPositions(blockedPositions);
        this.respawn();
    }

    respawn(blockedPositions = this.#blockedPositions) {
        this.#foods = [];
        const marginCells = this.#gridSize >= 20 ? 1 : 0;
        const margin = marginCells * this.#gridSize;
        const minX = margin;
        const minY = margin;
        const maxX = Math.max(minX, this.#canvasWidth - this.#gridSize - margin);
        const maxY = Math.max(minY, this.#canvasHeight - this.#gridSize - margin);
        const safeBlocked = Array.isArray(blockedPositions) ? blockedPositions : [];

        for (const type of this.#types) {
            let x = 0, y = 0, attempts = 0;
            do {
                const availableColumns = Math.floor((maxX - minX) / this.#gridSize) + 1;
                const availableRows = Math.floor((maxY - minY) / this.#gridSize) + 1;
                x = minX + Math.floor(Math.random() * Math.max(1, availableColumns)) * this.#gridSize;
                y = minY + Math.floor(Math.random() * Math.max(1, availableRows)) * this.#gridSize;
                attempts++;
            } while (this.#isOccupied(x, y, safeBlocked) && attempts < 50);

            const FoodClass = FoodRegistry.get(type);
            if (FoodClass) this.#foods.push(new FoodClass(x, y, this.#gridSize));
        }
    }

    consumeFoodAt(x, y) {
        const index = this.#foods.findIndex(food => food.getX() === x && food.getY() === y);
        if (index < 0) return null;
        return this.#foods[index];
    }

    draw(ctx) { this.#foods.forEach(f => f.draw(ctx)); }

    #isOccupied(x, y, blockedPositions) {
        const foodOccupied = this.#foods.some(food => food.getX() === x && food.getY() === y);
        const blockedOccupied = blockedPositions.some(position => position && position.x === x && position.y === y);
        return foodOccupied || blockedOccupied;
    }
}

export { FoodManager as FoodList };