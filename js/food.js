export class FoodList {
    constructor(gridSize, canvasWidth, canvasHeight) {
        this.gridSize = gridSize;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.types = ['lingkaran', 'segitiga', 'persegi'];
        this.images = {
            lingkaran: new Image(),
            segitiga: new Image(),
            persegi: new Image()
        };
        this.images.lingkaran.src = 'assets/lingkaran.png';
        this.images.segitiga.src = 'assets/segitiga.png';
        this.images.persegi.src = 'assets/persegi.png';
        this.foods = [];
        this.respawn();
    }

    respawn() {
        this.foods = [];

        const maxX = this.canvasWidth - this.gridSize;
        const maxY = this.canvasHeight - this.gridSize;

        for (const type of this.types) {
            let x, y;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * ((maxX / this.gridSize) + 1)) * this.gridSize;
                y = Math.floor(Math.random() * ((maxY / this.gridSize) + 1)) * this.gridSize;
                attempts++;
            } while (this.isOverlapping(x, y) && attempts < 50);

            this.foods.push({ type, x, y });
        }
    }

    isOverlapping(x, y) {
        return this.foods.some(food => food.x === x && food.y === y);
    }

    updateBoundaries(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.respawn();
    }

    draw(ctx) {
        this.foods.forEach(food => {
            const currentImg = this.images[food.type];
            if (currentImg && currentImg.complete && currentImg.naturalHeight !== 0) {
                ctx.drawImage(currentImg, food.x, food.y, this.gridSize, this.gridSize);
            } else {
                const colors = {
                    lingkaran: { fill: '#ef4444', stroke: '#dc2626' },
                    segitiga: { fill: '#3b82f6', stroke: '#2563eb' },
                    persegi: { fill: '#eab308', stroke: '#ca8a04' }
                };

                const color = colors[food.type] || { fill: '#6b7280', stroke: '#4b5563' };

                ctx.fillStyle = color.fill;
                ctx.strokeStyle = color.stroke;
                ctx.lineWidth = 2;

                const halfGrid = this.gridSize / 2;
                const x = food.x;
                const y = food.y;
                const size = this.gridSize;

                ctx.beginPath();

                switch (food.type) {
                    case 'lingkaran':
                        ctx.arc(x + halfGrid, y + halfGrid, halfGrid - 1, 0, 2 * Math.PI);
                        break;
                    case 'segitiga':
                        ctx.moveTo(x + halfGrid, y);
                        ctx.lineTo(x + size, y + size);
                        ctx.lineTo(x, y + size);
                        ctx.closePath();
                        break;
                    case 'persegi':
                    default:
                        ctx.rect(x, y, size, size);
                        break;
                }

                ctx.fill();
                ctx.stroke();
            }
        });
    }
}