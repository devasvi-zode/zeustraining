import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./config.js";
import { scroller,canvas, wrapper } from "./dom-elements.js";

export const colWidths = new Array(TOTAL_COLS).fill(CELL_WIDTH);
export const rowHeights = new Array(TOTAL_ROWS).fill(CELL_HEIGHT);

export let cumulativeColWidths = new Array(TOTAL_COLS);
export let cumulativeRowHeights = new Array(TOTAL_ROWS);

export const offsets = {
  x:0,
  y:0,
};
export const resizeState = {
  col: null,
  row: null,
  startX: 0,
  startY: 0,
};

export function updateLayout(){
    updateCumulativeDimensions();

    // Update scroller size
    scroller.style.width = getColX(TOTAL_COLS) + 'px';
    scroller.style.height = getRowY(TOTAL_ROWS) + 'px';

    //Update canvas size to match wrapper
    resizeCanvasToWrapper();
    
    // Ensure we're not scrolled out of bounds after resize
    clampOffset();
}

export function resizeCanvasToWrapper(){
  //get device pixel ration
  const dpr = window.devicePixelRatio || 1;

  //get wrapper's actula size in CSS pixels
  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperWidth = wrapperRect.width;
  const wrappperHeight = wrapperRect.height;

  //set canvas CSS size (logical pixels)
  canvas.style.width = `${wrapperWidth}px`;
  canvas.style.height = `${wrappperHeight}px`;

  //set canvas backing store size(physical pixels)
  canvas.width = Math.floor(wrapperWidth * dpr);
  canvas.height = Math.floor(wrappperHeight * dpr);

  //scale the context to account for DPR
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.translate(0.5, 0.5);

  return {dpr, wrapperWidth, wrappperHeight};
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
  if (resizeState.col !== null) {
    const colRightEdge = getColX(resizeState.col + 1);
    const viewportRight = offsets.x + wrapper.clientWidth;
    
    if (colRightEdge > viewportRight) {
      offsets.x = Math.min(maxOffsetX, colRightEdge - wrapper.clientWidth);
    }
  }

  // If we're resizing a row, try to keep it visible
  if (resizeState.row !== null) {
    const rowBottomEdge = getRowY(resizeState.row + 1);
    const viewportBottom = offsets.y + wrapper.clientHeight;
    
    if (rowBottomEdge > viewportBottom) {
      offsets.y = Math.min(maxOffsetY, rowBottomEdge - wrapper.clientHeight);
    }
  }

  offsets.x = Math.max(0, Math.min(offsets.x, maxOffsetX));
  offsets.y = Math.max(0, Math.min(offsets.y, maxOffsetY));

  // Sync with wrapper scroll
  wrapper.scrollLeft = offsets.x;
  wrapper.scrollTop = offsets.y;
}

export function getColX(col) {
  return col === 0 ? 0 : cumulativeColWidths[col - 1];
}

export function getRowY(row) {
  return row === 0 ? 0 : cumulativeRowHeights[row - 1];
}

// Initialize on startup
updateCumulativeDimensions();