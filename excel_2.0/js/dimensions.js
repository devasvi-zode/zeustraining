import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./config.js";
import { scroller, wrapper } from "./dom-elements.js";

export const colWidths = new Array(TOTAL_COLS).fill(CELL_WIDTH);
export const rowHeights = new Array(TOTAL_ROWS).fill(CELL_HEIGHT);

export let cumulativeColWidths = new Array(TOTAL_COLS);
export let cumulativeRowHeights = new Array(TOTAL_ROWS);

export let offsetX = 0;
export let offsetY = 0;

export let resizingCol = null;
export let resizingRow = null;
export let startX = 0;
export let startY = 0;

export function updateLayout(){
    updateCumulativeDimensions();

    // Update scroller size
    scroller.style.width = getColX(TOTAL_COLS) + 'px';
    scroller.style.height = getRowY(TOTAL_ROWS) + 'px';

    // Ensure we're not scrolled out of bounds after resize
    clampOffset();
}

function updateCumulativeDimensions() {
  // Update column cumulative widths
  let colSum = 0;
  for (let i = 0; i < TOTAL_COLS; i++) {
    colSum += colWidths[i];
    cumulativeColWidths[i] = colSum;
  }

  // Update row cumulative heights
  let rowSum = 0;
  for (let i = 0; i < TOTAL_ROWS; i++) {
    rowSum += rowHeights[i];
    cumulativeRowHeights[i] = rowSum;
  }
}

export function clampOffset() {
  const maxOffsetX = Math.max(0, getColX(TOTAL_COLS) - wrapper.clientWidth);
  const maxOffsetY = Math.max(0, getRowY(TOTAL_ROWS) - wrapper.clientHeight);

  // If we're resizing a column, try to keep it visible
  if (resizingCol !== null) {
    const colRightEdge = getColX(resizingCol + 1);
    const viewportRight = offsetX + wrapper.clientWidth;
    
    if (colRightEdge > viewportRight) {
      offsetX = Math.min(maxOffsetX, colRightEdge - wrapper.clientWidth);
    }
  }

  // If we're resizing a row, try to keep it visible
  if (resizingRow !== null) {
    const rowBottomEdge = getRowY(resizingRow + 1);
    const viewportBottom = offsetY + wrapper.clientHeight;
    
    if (rowBottomEdge > viewportBottom) {
      offsetY = Math.min(maxOffsetY, rowBottomEdge - wrapper.clientHeight);
    }
  }

  offsetX = Math.max(0, Math.min(offsetX, maxOffsetX));
  offsetY = Math.max(0, Math.min(offsetY, maxOffsetY));

  // Sync with wrapper scroll
  wrapper.scrollLeft = offsetX;
  wrapper.scrollTop = offsetY;
}

export function getColX(col) {
  return col === 0 ? 0 : cumulativeColWidths[col - 1];
}

export function getRowY(row) {
  return row === 0 ? 0 : cumulativeRowHeights[row - 1];
}

// Initialize on startup
updateCumulativeDimensions();