import {
    CELL_HEIGHT, CELL_WIDTH,
    TOTAL_COLS, TOTAL_ROWS,
    RESIZE_COLOR, RESIZE_GUIDE_WIDTH
} from './config.js'
import { 
  ctx, canvas,
} from './dom-elements.js';
import { 
  offsets,
  getColX, getRowY, 
  colWidths, rowHeights, 
  resizeState
} from './dimensions.js';
import { getStartCol, getEndCol, getStartRow, getEndRow, getColumnName } from './utils_.js';

export function drawGrid() {
        if (!ctx) {
        console.error('Canvas context not initialized!');
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = "black";

    const startCol = getStartCol(offsets.x);
    const endCol = getEndCol(offsets.x, logicalWidth);
    const startRow = getStartRow(offsets.y);
    const endRow = getEndRow(offsets.y, logicalHeight);

    // Draw cells
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const x = getColX(col) - offsets.x;
            const y = getRowY(row) - offsets.y;
            ctx.strokeRect(x, y, colWidths[col], rowHeights[row]);
            ctx.fillText(`${row}, ${col}`, x + 5, y + 20);
        }
    }

    // Draw column headers
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsets.x;
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
        const y = getRowY(row) - offsets.y;
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
    if (resizeState.col !== null) {
        const colLeft = getColX(resizeState.col) - offsets.x;
        const totalGridHeight = getRowY(TOTAL_ROWS);

        // Solid rectangle around column
        ctx.strokeStyle = RESIZE_COLOR;
        ctx.lineWidth = RESIZE_GUIDE_WIDTH;
        ctx.setLineDash([]);
        ctx.strokeRect(colLeft, 0, CELL_WIDTH, totalGridHeight);

        // Dashed line at resize position
        const currentX = getColX(resizeState.col) + colWidths[resizeState.col] - offsets.x;
        ctx.strokeStyle = RESIZE_COLOR;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, totalGridHeight);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    if (resizeState.row !== null) {
        const rowTop = getRowY(resizeState.row) - offsets.y;
        const totalGridWidth = getColX(TOTAL_COLS);

        // Solid rectangle around row
        ctx.strokeStyle = RESIZE_COLOR;
        ctx.lineWidth = RESIZE_GUIDE_WIDTH;
        ctx.setLineDash([]);
        ctx.strokeRect(0, rowTop, totalGridWidth, CELL_HEIGHT);

        // Dashed line at resize position
        const currentY = getRowY(resizeState.row) + rowHeights[resizeState.row] - offsets.y;
        ctx.strokeStyle = RESIZE_COLOR;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(totalGridWidth, currentY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}



