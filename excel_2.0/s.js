const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const cellWidth = 80;
const cellHeight = 30;

const totalCols = 50000;
const totalRows = 100000;

let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let startX, startY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    offsetX -= dx;
    offsetY -= dy;

    // Clamp offset
    offsetX = Math.max(0, Math.min(offsetX, totalCols * cellWidth - canvas.width));
    offsetY = Math.max(0, Math.min(offsetY, totalRows * cellHeight - canvas.height));

    startX = e.clientX;
    startY = e.clientY;

    drawGrid();
});

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    const startCol = Math.floor(offsetX / cellWidth);
    const endCol = Math.min(startCol + Math.ceil(canvas.width / cellWidth), totalCols);

    const startRow = Math.floor(offsetY / cellHeight);
    const endRow = Math.min(startRow + Math.ceil(canvas.height / cellHeight), totalRows);

    // Draw vertical lines
    for (let col = startCol; col <= endCol; col++) {
        const x = col * cellWidth - offsetX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let row = startRow; row <= endRow; row++) {
        const y = row * cellHeight - offsetY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Optional: draw cell indexes
    ctx.fillStyle = 'black';
    ctx.font = '12px sans-serif';
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const x = col * cellWidth - offsetX + 5;
            const y = row * cellHeight - offsetY + 15;
            ctx.fillText(`${row},${col}`, x, y);
        }
    }
}

drawGrid();
