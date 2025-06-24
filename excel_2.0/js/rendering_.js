import {
    CELL_HEIGHT, CELL_WIDTH,
    TOTAL_COLS, TOTAL_ROWS,
    RESIZE_COLOR, RESIZE_GUIDE_WIDTH
} from './config.js'
import { 
  ctx, canvas,
} from './dom-elements.js';
import { 
  offsetX, offsetY, 
  getColX, getRowY, 
  colWidths, rowHeights, 
  resizingCol, resizingRow,
} from './dimensions.js';
import { getStartCol, getEndCol, getStartRow, getEndRow, getColumnName } from './utils_.js';

export function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = "black";

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;

    const startCol = getStartCol(offsetX);
    const endCol = getEndCol(offsetX, logicalWidth);
    const startRow = getStartRow(offsetY);
    const endRow = getEndRow(offsetY, logicalHeight);

    // Draw cells
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const x = getColX(col) - offsetX;
            const y = getRowY(row) - offsetY;
            ctx.strokeRect(x, y, colWidths[col], rowHeights[row]);
            ctx.fillText(`${row}, ${col}`, x + 5, y + 20);
        }
    }

    // Draw column headers
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsetX;
        const y = 0;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x, y, colWidths[col], CELL_HEIGHT);
        ctx.strokeRect(x, y, colWidths[col], CELL_HEIGHT);
        ctx.fillStyle = 'black';
        ctx.fillText(`${getColumnName(col)}`, x + 10, y + 20);
    }

    // Draw row headers
    for (let row = startRow; row < endRow; row++) {
        const x = 0;
        const y = getRowY(row) - offsetY;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x, y, CELL_WIDTH, rowHeights[row]);
        ctx.strokeRect(x, y, CELL_WIDTH, rowHeights[row]);
        ctx.fillStyle = 'black';
        ctx.fillText(` ${row}`, x + 15, y + 20);
    }

    // Draw top-left corner
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
    ctx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
    ctx.fillStyle = 'black';
    ctx.fillText('', 5, 15);

    // Draw resize guides if resizing
    if (resizingCol !== null) {
        drawColumnResizeGuide(resizingCol);
    }
    
    if (resizingRow !== null) {
        drawRowResizeGuide(resizingRow);
    }
}

function drawColumnResizeGuide(col) {
    const colLeft = getColX(col) - offsetX;
    const colRight = colLeft + colWidths[col];
    
    // Solid rectangle around column
    ctx.strokeStyle = RESIZE_COLOR;
    ctx.lineWidth = RESIZE_GUIDE_WIDTH;
    ctx.setLineDash([]);
    ctx.strokeRect(colLeft, 0, colWidths[col], canvas.height);
    
    // Dashed line at resize position
    const currentX = getColX(col) + colWidths[col] - offsetX;
    ctx.strokeStyle = RESIZE_COLOR;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawRowResizeGuide(row) {
    const rowTop = getRowY(row) - offsetY;
    
    // Solid rectangle around row
    ctx.strokeStyle = RESIZE_COLOR;
    ctx.lineWidth = RESIZE_GUIDE_WIDTH;
    ctx.setLineDash([]);
    ctx.strokeRect(0, rowTop, canvas.width, rowHeights[row]);
    
    // Dashed line at resize position
    const currentY = getRowY(row) + rowHeights[row] - offsetY;
    ctx.strokeStyle = RESIZE_COLOR;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(canvas.width, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}