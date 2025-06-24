import { canvas, wrapper } from './dom-elements.js';
import { 
  offsetX, offsetY, 
  resizingCol, resizingRow, 
  startX, startY, 
  colWidths, rowHeights,
  clampOffset, updateLayout,
  getColX, getRowY
} from './dimensions.js';
import { drawGrid } from './rendering_.js';
import { getStartCol, getEndCol, getStartRow, getEndRow } from './utils_.js';



export function setupEventListeners() {
    // Wheel event for scrolling
    wrapper.addEventListener('wheel', (e) => {
        console.log('Type of offsetX:', typeof offsetX, 'is writable?', 
    Object.getOwnPropertyDescriptor(module, 'offsetX').writable);
        console.log('Before:', { offsetX, offsetY });
offsetX += e.deltaX;
offsetY += e.deltaY;
console.log('After:', { offsetX, offsetY });

        e.preventDefault();
        offsetX += e.deltaX;
        offsetY += e.deltaY;
        clampOffset();
        drawGrid();
    }, { passive: false });

    // Scroll event
    wrapper.addEventListener('scroll', () => {
        offsetX = wrapper.scrollLeft;
        offsetY = wrapper.scrollTop;
        clampOffset();
        drawGrid();
    });

    // Mouse move for resizing
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Mouse down for starting resize
    canvas.addEventListener('mousedown', handleMouseDown);
    
    // Mouse up for ending resize
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);
}

function handleMouseMove(e) {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const startCol = getStartCol(offsetX);
    const endCol = getEndCol(offsetX, logicalWidth);
    const startRow = getStartRow(offsetY);
    const endRow = getEndRow(offsetY, logicalHeight);
    const MIN_COL_WIDTH = 60;

    if (resizingCol !== null) {
        const deltaX = e.clientX - startX;
        colWidths[resizingCol] = Math.max(30, colWidths[resizingCol] + deltaX);
        startX = e.clientX;
        updateLayout();
        drawGrid();
        return;
    }

    if (resizingRow !== null) {
        const deltaY = e.clientY - startY;
        rowHeights[resizingRow] = Math.max(30, rowHeights[resizingRow] + deltaY);
        startY = e.clientY;
        updateLayout();
        drawGrid();
        return;
    }

    // Check for column resize cursor
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsetX;
        if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
            canvas.style.cursor = 'col-resize';
            return;
        }
    }

    // Check for row resize cursor
    for (let row = startRow; row < endRow; row++) {
        const y = getRowY(row) - offsetY;
        if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + rowHeights[row])) < 5) {
            canvas.style.cursor = 'row-resize';
            return;
        }
    }

    canvas.style.cursor = 'default';
}

function handleMouseDown(e) {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const startCol = getStartCol(offsetX);
    const endCol = getEndCol(offsetX, logicalWidth);
    const startRow = getStartRow(offsetY);
    const endRow = getEndRow(offsetY, logicalHeight);

    // Check for column resize
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsetX;
        if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
            resizingCol = col;
            startX = e.clientX;
            return;
        }
    }

    // Check for row resize
    for (let row = startRow; row < endRow; row++) {
        const y = getRowY(row) - offsetY;
        if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + rowHeights[row])) < 5) {
            resizingRow = row;
            startY = e.clientY;
            return;
        }
    }
}

function handleMouseUp() {
    if (resizingCol !== null || resizingRow !== null) {
        resizingCol = null;
        resizingRow = null;
        drawGrid();
    }
}