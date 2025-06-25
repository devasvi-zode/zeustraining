import { canvas, wrapper } from './dom-elements.js';
import { 
  resizeState,
  colWidths, rowHeights,
  clampOffset, updateLayout,
  getColX, getRowY,
  offsets
} from './dimensions.js';
import { drawGrid } from './rendering_.js';
import { getStartCol, getEndCol, getStartRow, getEndRow } from './utils_.js';
import { CELL_HEIGHT, CELL_WIDTH } from './config.js';


export function setupEventListeners() {
    // Wheel event for scrolling
    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        offsets.x += e.deltaX;
        offsets.y += e.deltaY;
        clampOffset();
        drawGrid();
    }, { passive: false });

    // Scroll event
    wrapper.addEventListener('scroll', () => {
        offsets.x = wrapper.scrollLeft;
        offsets.y = wrapper.scrollTop;
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
    const startCol = getStartCol(offsets.x);
    const endCol = getEndCol(offsets.x, logicalWidth);
    const startRow = getStartRow(offsets.y);
    const endRow = getEndRow(offsets.y, logicalHeight);
    const MIN_COL_WIDTH = 60;

    if (resizeState.col !== null) {
        const deltaX = e.clientX - resizeState.startX;
        colWidths[resizeState.col] = Math.max(30, colWidths[resizeState.col] + deltaX);
        resizeState.startX = e.clientX;
        updateLayout();
        drawGrid();
        return;
    }

    if (resizeState.row !== null) {
        const deltaY = e.clientY - resizeState.startY;
        rowHeights[resizeState.row] = Math.max(20, rowHeights[resizeState.row] + deltaY);
        resizeState.startY = e.clientY;
        updateLayout();
        drawGrid();
        return;
    }

    // Check for column resize cursor
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsets.x;
        if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
            canvas.style.cursor = 'ew-resize';
            return;
        }
    }

    // Check for row resize cursor
    for (let row = startRow; row < endRow; row++) {
        const y = getRowY(row) - offsets.y;
        if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + rowHeights[row])) < 5) {
            canvas.style.cursor = 'ns-resize';
            return;
        }
    }

    canvas.style.cursor = 'default';
}

function handleMouseDown(e) {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const startCol = getStartCol(offsets.x);
    const endCol = getEndCol(offsets.x, logicalWidth);
    const startRow = getStartRow(offsets.y);
    const endRow = getEndRow(offsets.y, logicalHeight);

    // Check for column resize
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsets.x;
        if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
            if(col === 0) return;
            resizeState.col = col;
            resizeState.startX = e.clientX;
            return;
        }
    }

    // Check for row resize
    for (let row = startRow; row < endRow; row++) {
        const y = getRowY(row) - offsets.y;
        if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + rowHeights[row])) < 5) {
            if(row === 0) return;
            resizeState.row = row;
            resizeState.startY = e.clientY;
            return;
        }
    }
}

function handleMouseUp() {
    if (resizeState.col !== null || resizeState.row !== null) {
        resizeState.col = null;
        resizeState.row = null;
        updateLayout();
        drawGrid();
    }
}
