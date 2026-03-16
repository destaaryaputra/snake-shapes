export class Snake {
    constructor(gridSize, canvasWidth = 640, canvasHeight = 480) {
        this.gridSize = gridSize;

        const startX = Math.floor((canvasWidth / 2) / gridSize) * gridSize;
        const startY = Math.floor((canvasHeight / 2) / gridSize) * gridSize;

        this.body = [
            { x: startX, y: startY },
            { x: startX - gridSize, y: startY },
            { x: startX - gridSize * 2, y: startY }
        ];

        this.dx = gridSize;
        this.dy = 0;
        this.imgHead = new Image(); this.imgHead.src = 'assets/kepala.jpg';
        this.imgBody = new Image(); this.imgBody.src = 'assets/badan.png';
    }

    move() {
        const head = {x: this.body[0].x + this.dx, y: this.body[0].y + this.dy};
        this.body.unshift(head);
    }

    popTail() {
        this.body.pop();
    }

    setDirection(dx, dy) {
        if (this.dx === 0 && dx !== 0 || this.dy === 0 && dy !== 0) {
            this.dx = dx;
            this.dy = dy;
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            const isHead = i === 0;

            if (isHead) {
                if (this.imgHead.complete && this.imgHead.naturalHeight !== 0) {
                    ctx.drawImage(this.imgHead, segment.x, segment.y, this.gridSize, this.gridSize);
                } else {
                    ctx.fillStyle = '#10b981'; 
                    ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
                    ctx.strokeStyle = '#059669';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(segment.x, segment.y, this.gridSize, this.gridSize);

                    ctx.fillStyle = 'white';
                    ctx.fillRect(segment.x + 6, segment.y + 4, 4, 4);
                    ctx.fillRect(segment.x + 22, segment.y + 4, 4, 4);
                    ctx.fillStyle = 'black';
                    ctx.fillRect(segment.x + 7, segment.y + 5, 2, 2);
                    ctx.fillRect(segment.x + 23, segment.y + 5, 2, 2);
                }
            } else {
                if (this.imgBody.complete && this.imgBody.naturalHeight !== 0) {
                    ctx.drawImage(this.imgBody, segment.x, segment.y, this.gridSize, this.gridSize);
                } else {
                    ctx.fillStyle = '#34d399'; 
                    ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(segment.x, segment.y, this.gridSize, this.gridSize);
                }
            }
        }
    }
}