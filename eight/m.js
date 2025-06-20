const canvas = document.getElementById('excelCanvas');
const ctx = canvas.getContext('2d');

// Constants
const TOTAL_ROWS = 100000;
const TOTAL_COLS = 50;
const ROW_HEIGHT = 25;
const COL_WIDTH = 100;
let scrollX = 0;
let scrollY = 0;
// let isResizing = false;
// let resizingCol = null;
// let resizingRow = null;
// let startX, startY;
let colWidths = Array(TOTAL_COLS).fill(COL_WIDTH);
let rowHeights = Array(TOTAL_ROWS).fill(ROW_HEIGHT);

function updateVisibleRange() {
    visibleStartRow = Math.floor(scrollY / ROW_HEIGHT);
    visibleEndRow = Math.min(visibleStartRow + Math.ceil(canvas.height / ROW_HEIGHT) + 1, TOTAL_ROWS);
    
    visibleStartCol = Math.floor(scrollX / COL_WIDTH);
    visibleEndCol = Math.min(visibleStartCol + Math.ceil(canvas.width / COL_WIDTH) + 1, TOTAL_COLS);
}

// Render visible grid
function renderGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateVisibleRange();

    for (let row = visibleStartRow; row < visibleEndRow; row++) {
        for (let col = visibleStartCol; col < visibleEndCol; col++) {
            const x = col * COL_WIDTH - scrollX;
            const y = row * ROW_HEIGHT - scrollY;

            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(x, y, COL_WIDTH, ROW_HEIGHT);

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`R${row}C${col}`, x + 5, y + 15);
        }
    }
}



canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    scrollY += e.deltaY;
    scrollX += e.deltaX;

    // Clamp scroll values to grid size
    scrollY = Math.max(0, Math.min(scrollY, TOTAL_ROWS * ROW_HEIGHT - canvas.height));
    scrollX = Math.max(0, Math.min(scrollX, TOTAL_COLS * COL_WIDTH - canvas.width));

    renderGrid();
});

renderGrid();