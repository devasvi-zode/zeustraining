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

// function clampOffset() {
//   const maxOffsetX = getColX(totalCols) - canvas.width / (window.devicePixelRatio || 1);
//   const maxOffsetY = getRowY(totalRows) - canvas.height / (window.devicePixelRatio || 1);

//   offsetX = Math.max(0, Math.min(offsetX, maxOffsetX));
//   offsetY = Math.max(0, Math.min(offsetY, maxOffsetY));

// }

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


    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            const x = getColX(col) - offsetX;
            const y = getRowY(row) - offsetY;
            ctx.strokeRect(x, y, colWidths[col], rowHeights[row]);
            ctx.fillText(`${row}, ${col}`, x + 5, y + 20);
        }
    }

    for (let col = startCol; col < endCol; col++) {
        const x = getColX(col) - offsetX;
        const y = 0;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x, y, colWidths[col], cellHeight);
        ctx.strokeRect(x, y, colWidths[col], cellHeight);
        ctx.fillStyle = 'black';
        ctx.fillText(`${getColumnName(col)}`, x + 10, y + 20);
    }

    for (let row = startRow; row < endRow; row++) {
        const x = 0;
        const y = getRowY(row) - offsetY;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x, y, cellWidth, rowHeights[row]);
        ctx.strokeRect(x, y, cellWidth, rowHeights[row]);
        ctx.fillStyle = 'black';
        ctx.fillText(` ${row}`, x + 15, y + 20);
    }

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, cellWidth, cellHeight);
    ctx.strokeRect(0, 0, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    ctx.fillText('', 5, 15);
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
// function getColX(col) {
//   let x = 0;
//   for (let i = 0; i < col; i++) {
//     x += colWidths[i];
//   }
//   return x;
// }

// function getRowY(row) {
//   let y = 0;
//   for (let j = 0; j < row; j++) {
//     y += rowHeights[j];
//   }
//   return y;
// }


// function getStartCol(offsetX) {
//   let x = 0;
//   for (let col = 0; col < totalCols; col++) {
//     x += colWidths[col];
//     if (x > offsetX) return col;
//   }
//   return totalCols - 1;
// }

// function getEndCol(offsetX, viewWidth) {
//   let x = 0;
//   for (let col = getStartCol(offsetX); col < totalCols; col++) {
//     x += colWidths[col];
//     if (x > viewWidth + offsetX) return col;
//   }
//   return totalCols - 1;
// }

// function getStartRow(offsetY) {
//   let y = 0;
//   for (let row = 0; row < totalRows; row++) {
//     y += rowHeights[row];
//     if (y > offsetY) return row;
//   }
//   return totalRows - 1;
// }

// function getEndRow(offsetY, viewHeight) {
//   let y = 0;
//   for (let row = getStartRow(offsetY); row < totalRows; row++) {
//     y += rowHeights[row];
//     if (y > viewHeight + offsetY) return row;
//   }
//   return totalRows - 1;
// }

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
    // const deltaX = e.clientX - startX;
    // colWidths[resizingCol] = Math.max(30, colWidths[resizingCol] + deltaX);
    // startX = e.clientX;
    // updateLayout();
    // drawGrid();
    // return;
      const deltaX = e.clientX - startX;
      const newWidth = colWidths[resizingCol] + deltaX;

      // Clamp the new width to the minimum allowed
      colWidths[resizingCol] = Math.max(MIN_COL_WIDTH, newWidth);

      // Update startX only if width was actually changed
      if (newWidth >= MIN_COL_WIDTH) {
          startX = e.clientX;
      }

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
  return result;
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
  return result;
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