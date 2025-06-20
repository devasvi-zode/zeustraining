let isResizing = false;
let resizingCol = null;
let resizingRow = null;
let startX, startY;
let colWidths = Array(TOTAL_COLS).fill(COL_WIDTH);
let rowHeights = Array(TOTAL_ROWS).fill(ROW_HEIGHT);

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + scrollX;
    const mouseY = e.clientY - rect.top + scrollY;
    
    // Check if mouse is near column divider
    for (let col = visibleStartCol; col < visibleEndCol; col++) {
        const colRight = (col + 1) * colWidths[col];
        if (Math.abs(mouseX - colRight) < 5) {
            isResizing = true;
            resizingCol = col;
            startX = e.clientX;
            return;
        }
    }
    
    // Check if mouse is near row divider
    for (let row = visibleStartRow; row < visibleEndRow; row++) {
        const rowBottom = (row + 1) * rowHeights[row];
        if (Math.abs(mouseY - rowBottom) < 5) {
            isResizing = true;
            resizingRow = row;
            startY = e.clientY;
            return;
        }
    }
});

window.addEventListener('mousemove', (e) => {
    if (isResizing && resizingCol !== null) {
        const newWidth = colWidths[resizingCol] + (e.clientX - startX);
        if (newWidth > 20) { // Minimum width
            colWidths[resizingCol] = newWidth;
            startX = e.clientX;
            renderGrid();
        }
    }
    
    if (isResizing && resizingRow !== null) {
        const newHeight = rowHeights[resizingRow] + (e.clientY - startY);
        if (newHeight > 10) { // Minimum height
            rowHeights[resizingRow] = newHeight;
            startY = e.clientY;
            renderGrid();
        }
    }
});

window.addEventListener('mouseup', () => {
    isResizing = false;
    resizingCol = null;
    resizingRow = null;
});