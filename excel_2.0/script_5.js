const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('wrapper');
const scroller = document.getElementById('scroller');

const cellWidth = 80;
const cellHeight = 30;

const totalCols = 500;
const totalRows = 100000;

const colWidths = new Array(totalCols).fill(cellWidth);
const rowHeights = new Array(totalRows).fill(cellHeight);

// Initialize cumulative arrays
let cumulativeColWidths = new Array(totalCols);
let cumulativeRowHeights = new Array(totalRows);

const RESIZE_GUIDE_COLOR = '#135c2e'; // Bright green
const RESIZE_GUIDE_WIDTH = 2;
const RESIZE_DASHED_LINE_COLOR = '#135c2e';



// Update the cumulative arrays AND the scroller size
function updateLayout() {
  updateCumulativeDimensions();
  
  // Update scroller size
  scroller.style.width = getColX(totalCols) + 'px';
  scroller.style.height = getRowY(totalRows) + 'px';
  
  // Ensure we're not scrolled out of bounds after resize
  clampOffset();
}

function updateCumulativeDimensions() {
  // Update column cumulative widths
  let colSum = 0;
  for (let i = 0; i < totalCols; i++) {
    colSum += colWidths[i];
    cumulativeColWidths[i] = colSum;
  }

  // Update row cumulative heights
  let rowSum = 0;
  for (let i = 0; i < totalRows; i++) {
    rowSum += rowHeights[i];
    cumulativeRowHeights[i] = rowSum;
  }
}

// Initialize on startup
updateCumulativeDimensions();

// Resize canvas to match wrapper and account for DPI
function resizeCanvasToWrapper() {
  const dpr = window.devicePixelRatio || 1;
  const rect = wrapper.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity
  ctx.scale(dpr,dpr);
  ctx.translate(0.5,0.5);
}
resizeCanvasToWrapper();
window.addEventListener('resize', () => {
  resizeCanvasToWrapper();
  drawGrid();
});

// Set scroller size based on actual dimensions
scroller.style.width = getColX(totalCols) + 'px';
scroller.style.height = getRowY(totalRows) + 'px';

let offsetX = 0;
let offsetY = 0;

let resizingCol = null;
let resizingRow = null;
let startX = 0;
let startY = 0;

wrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  offsetX += e.deltaX;
  offsetY += e.deltaY;
  clampOffset();
  drawGrid();
}, { passive: false });

wrapper.addEventListener('scroll', () => {
  offsetX = wrapper.scrollLeft;
  offsetY = wrapper.scrollTop;
  clampOffset();
  drawGrid();
});


// Enhanced clampOffset to handle resizing cases
function clampOffset() {
  const maxOffsetX = Math.max(0, getColX(totalCols) - wrapper.clientWidth);
  const maxOffsetY = Math.max(0, getRowY(totalRows) - wrapper.clientHeight);

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

function drawGrid() {
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


    // for (let row = startRow; row < endRow; row++) {
    //     for (let col = startCol; col < endCol; col++) {
    //         const x = getColX(col) - offsetX;
    //         const y = getRowY(row) - offsetY;
    //         ctx.strokeRect(x, y, colWidths[col], rowHeights[row]);
    //         ctx.fillText(`${row}, ${col}`, x + 5, y + 20);
    //     }
    // }
    
    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const x = getColX(col) - offsetX;
            const y = getRowY(row) - offsetY;
            const width = colWidths[col];
            const height = rowHeights[row];

            ctx.beginPath();

            // Top border only for first visible row
            if (row === startRow) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + width, y);
            }

            // Left border only for first visible column
            if (col === startCol) {
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + height);
            }

            // Right border
            ctx.moveTo(x + width, y);
            ctx.lineTo(x + width, y + height);

            // Bottom border
            ctx.moveTo(x, y + height);
            ctx.lineTo(x + width, y + height);

            ctx.stroke();

            // Draw cell content
            ctx.fillText(`${row}, ${col}`, x + 5, y + 20);
        }
    }

    ctx.restore();
    // Draw column headers (top row)
    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsetX;
        const y = 0;
        const width = colWidths[col];

        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x, y, width, cellHeight);

        ctx.beginPath();
        // Top border (only once at top)
        if (col === startCol) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
        }

        // Left border (only for first column)
        if (col === startCol) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + cellHeight);
        }

        // Right border
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width, y + cellHeight);

        // Bottom border
        ctx.moveTo(x, y + cellHeight);
        ctx.lineTo(x + width, y + cellHeight);

        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.fillText(`${getColumnName(col)}`, x + 10, y + 20);
    }

    // Draw row headers (left column)
    for (let row = startRow; row < endRow; row++) {
        const x = 0;
        const y = getRowY(row) - offsetY;
        const height = rowHeights[row];

        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x, y, cellWidth, height);

        ctx.beginPath();
        // Left border (only once at left)
        if (row === startRow) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + height);
        }

        // Top border (only for first row)
        if (row === startRow) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellWidth, y);
        }

        // Right border
        ctx.moveTo(x + cellWidth, y);
        ctx.lineTo(x + cellWidth, y + height);

        // Bottom border
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + cellWidth, y + height);

        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.fillText(` ${row}`, x + 15, y + 20);
    }


    // for (let col = startCol; col < endCol; col++) {
    //     const x = getColX(col) - offsetX;
    //     const y = 0;
    //     ctx.fillStyle = '#f5f5f5';
    //     ctx.fillRect(x, y, colWidths[col], cellHeight);
    //     ctx.strokeRect(x, y, colWidths[col], cellHeight);
    //     ctx.fillStyle = 'black';
    //     ctx.fillText(`${getColumnName(col)}`, x + 10, y + 20);
    // }

    // for (let row = startRow; row < endRow; row++) {
    //     const x = 0;
    //     const y = getRowY(row) - offsetY;
    //     ctx.fillStyle = '#f5f5f5';
    //     ctx.fillRect(x, y, cellWidth, rowHeights[row]);
    //     ctx.strokeRect(x, y, cellWidth, rowHeights[row]);
    //     ctx.fillStyle = 'black';
    //     ctx.fillText(` ${row}`, x + 15, y + 20);
    // }

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, cellWidth, cellHeight);
    ctx.strokeRect(0, 0, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    ctx.fillText('', 5, 15);

    // Draw resize guides if resizing
    if (resizingCol !== null) {
        // 1. Draw solid rectangle around entire column
        const colLeft = getColX(resizingCol) - offsetX;
        const colRight = colLeft + colWidths[resizingCol];
        ctx.strokeStyle = RESIZE_GUIDE_COLOR;
        ctx.lineWidth = RESIZE_GUIDE_WIDTH;
        ctx.setLineDash([]); // Solid line
        ctx.strokeRect(
            colLeft,
            0,
            cellWidth, // Column width
            canvas.height // Full height
        );

        // 2. Draw dashed line at current resize position
        const currentX = getColX(resizingCol) + colWidths[resizingCol] - offsetX;
        ctx.strokeStyle = RESIZE_DASHED_LINE_COLOR;
        ctx.setLineDash([5, 3]); // Dashed pattern
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]); // Reset to solid
    }
    
    // if (resizingRow !== null) {
    //     const yy = getRowY(resizingRow) - offsetY;
    //     ctx.strokeStyle = RESIZE_DASHED_LINE_COLOR;
    //     ctx.lineWidth = RESIZE_GUIDE_WIDTH;
    //     const longy = (getRowY(resizingRow) - offsetY) * cellWidth;
    //     ctx.strokeRect(0,yy,longy,cellHeight);
    //     ctx.stroke();

        
    //     const y = getRowY(resizingRow) + rowHeights[resizingRow] - offsetY;
    //     ctx.strokeStyle = RESIZE_GUIDE_COLOR;
    //     ctx.lineWidth = RESIZE_GUIDE_WIDTH;
    //     ctx.beginPath();
    //     ctx.moveTo(0, y);
    //     ctx.lineTo(canvas.width, y);
    //     ctx.stroke();
    // }
    if (resizingRow !== null) {
    // 1. Draw solid rectangle around entire row
    const rowTop = getRowY(resizingRow) - offsetY;
    ctx.strokeStyle = RESIZE_GUIDE_COLOR;
    ctx.lineWidth = RESIZE_GUIDE_WIDTH;
    ctx.setLineDash([]); // Solid line
    ctx.strokeRect(
        0, 
        rowTop, 
        canvas.width, // Full width
        cellHeight// Row height
    );
    
    // 2. Draw dashed line at current resize position
    const currentY = getRowY(resizingRow) + rowHeights[resizingRow] - offsetY;
    ctx.strokeStyle = RESIZE_DASHED_LINE_COLOR;
    ctx.setLineDash([5, 3]); // Dashed pattern
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(canvas.width, currentY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset to solid
    ctx.restore();
}
}
drawGrid();

function getColumnName(index) {
  let result = "";
  let n = index;
  while (n > 0) {
    n--;
    let remainder = n % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor(n / 26);
  }
  return result;
}
function getColX(col) {
  return col === 0 ? 0 : cumulativeColWidths[col - 1];
}

function getRowY(row) {
  return row === 0 ? 0 : cumulativeRowHeights[row - 1];
}

// Resizing logic
canvas.addEventListener('mousemove', (e) => {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const startCol = getStartCol(offsetX);
    const endCol = getEndCol(offsetX, logicalWidth);

    const startRow = getStartRow(offsetY);
    const endRow = getEndRow(offsetY, logicalHeight);
    const MIN_COL_WIDTH = 60;
  if (resizingCol !== null) {
        // Existing resize logic
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
  // In your mousemove handler for resizing:
    if (resizingCol !== null || resizingRow !== null) {
        updateLayout()();
        drawGrid();
    }

  for (let col = startCol; col < endCol; col++) {
    const x = getColX(col) - offsetX;
    if (e.offsetY < cellHeight && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
      canvas.style.cursor = 'col-resize';
      return;
    }
  }

  for (let row = startRow; row < endRow; row++) {
    const y = getRowY(row) - offsetY;
    if (e.offsetX < cellWidth && Math.abs(e.offsetY - (y + rowHeights[row])) < 5) {
      canvas.style.cursor = 'row-resize';
      return;
    }
  }

  canvas.style.cursor = 'default';
});

canvas.addEventListener('mousedown', (e) => {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const startCol = getStartCol(offsetX);
    const endCol = getEndCol(offsetX, logicalWidth);

    const startRow = getStartRow(offsetY);
    const endRow = getEndRow(offsetY, logicalHeight);

  for (let col = startCol; col < endCol; col++) {
    const x = getColX(col) - offsetX;
    if (e.offsetY < cellHeight && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
      resizingCol = col;
      startX = e.clientX;
      return;
    }
  }

  for (let row = startRow; row < endRow; row++) {
    const y = getRowY(row) - offsetY;
    if (e.offsetX < cellWidth && Math.abs(e.offsetY - (y + rowHeights[row])) < 5) {
      resizingRow = row;
      startY = e.clientY;
      return;
    }
  }
});

canvas.addEventListener('mouseup', () => {
  resizingCol = null;
  resizingRow = null;
});

// Add mouseout handler
canvas.addEventListener('mouseout', () => {
    if (resizingCol !== null || resizingRow !== null) {
        resizingCol = null;
        resizingRow = null;
        //forceRedraw();
    }
});

// Modify mouseup handler
canvas.addEventListener('mouseup', () => {
    if (resizingCol !== null || resizingRow !== null) {
        resizingCol = null;
        resizingRow = null;
        //forceRedraw();
    }
});





// Optimized binary search functions
function getStartCol(offsetX) {
  if (offsetX <= 0) return 0;
  
  let left = 0;
  let right = totalCols;
  let result = 0;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const x = getColX(mid);
    if (x >= offsetX) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result-1;
}

// function getEndCol(offsetX, viewWidth) {
//   const target = offsetX + viewWidth;
//   if (target >= cumulativeColWidths[totalCols - 1]) return totalCols - 1;
  
//   let left = getStartCol(offsetX);
//   let right = totalCols - 1;
//   let result = totalCols - 1;
  
//   while (left <= right) {
//     const mid = Math.floor((left + right) / 2);
//     const x = getColX(mid + 1); // Check right edge of cell
//     if (x >= target) {
//       result = mid;
//       right = mid - 1;
//     } else {
//       left = mid + 1;
//     }
//   }
//   return result;
// }

function getEndCol(offsetX, viewWidth) {
  const target = offsetX + viewWidth;
  if (target >= cumulativeColWidths[totalCols - 1]) return totalCols ;
  
  let left = getStartCol(offsetX);
  let right = totalCols ;
  let result = totalCols ;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // Check if the LEFT edge of the next column is beyond our target
    if ((mid < totalCols - 1 && cumulativeColWidths[mid] >= target) || 
        (mid === totalCols - 1 && cumulativeColWidths[mid] >= target)) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  // Ensure we include the column that's partially visible at the end
  if (result < totalCols - 1 && cumulativeColWidths[result] < target) {
    result++;
  }
  
  return Math.min(result, totalCols - 1);
}

function getStartRow(offsetY) {
  if (offsetY <= 0) return 0;
  
  let left = 0;
  let right = totalRows;
  let result = 0;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const y = getRowY(mid);
    if (y >= offsetY) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result-1;
}

// function getEndRow(offsetY, viewHeight) {
//   const target = offsetY + viewHeight;
//   if (target >= cumulativeRowHeights[totalRows - 1]) return totalRows - 1;
  
//   let left = getStartRow(offsetY);
//   let right = totalRows - 1;
//   let result = totalRows - 1;
  
//   while (left <= right) {
//     const mid = Math.floor((left + right) / 2);
//     const y = getRowY(mid + 1); // Check bottom edge of cell
//     if (y >= target) {
//       result = mid;
//       right = mid - 1;
//     } else {
//       left = mid + 1;
//     }
//   }
//   return result;
// }
function getEndRow(offsetY, viewHeight) {
  const target = offsetY + viewHeight;
  if (target >= cumulativeRowHeights[totalRows - 1]) return totalRows;
  
  let left = getStartRow(offsetY);
  let right = totalRows ;
  let result = totalRows ;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    // Check if the TOP edge of the next row is beyond our target
    if ((mid < totalRows - 1 && cumulativeRowHeights[mid] >= target) ||
        (mid === totalRows - 1 && cumulativeRowHeights[mid] >= target)) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  // Ensure we include the row that's partially visible at the end
  if (result < totalRows - 1 && cumulativeRowHeights[result] < target) {
    result++;
  }
  
  return Math.min(result, totalRows - 1);
}

function rowResizing(row){
    //Drawn solid rectangular around entire row 
    const rowTop = getRowY(row) - offsetY;
    ctx.strokeStyle = RESIZE_GUIDE_COLOR;
    ctx.lineWidth = RESIZE_GUIDE_WIDTH;
    ctx.setLineDash([]); //solid line
    const rightEnd = (endCol - startCol)*cellWidth;
    ctx.strokeRect(
        0,
        rowTop,
        rightEnd,
        cellHeight
    )

    //Draw dashed line at current resize position
    const currentY = getRowY(row) + rowHeights[row] - offsetY;
    ctx.strokeStyle = RESIZE_DASHED_LINE_COLOR;
    ctx.setLineDash([5,3]);
    ctx.beginPath();
    ctx.moveTo(0,currentY);
    ctx.lineTo(rightEnd, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}