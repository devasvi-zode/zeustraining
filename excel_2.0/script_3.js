const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('wrapper');
const scroller = document.getElementById('scroller');

function accountForDPI(){
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width *dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
}
accountForDPI();

const cellWidth = 80;
const cellHeight = 30;

const totalCols = 50000;
const totalRows = 100000;

const colWidths = new Array(totalCols).fill(cellWidth);
const rowHeights = new Array(totalRows).fill(cellHeight);

const scrollWidth = totalCols * cellWidth;
const scrollHeight = totalRows * cellHeight;

scroller.style.width = scrollWidth + 'px';
scroller.style.height = scrollHeight + 'px';

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
  const maxScrollX = totalCols * cellWidth - canvas.width;
  const maxScrollY = totalRows * cellHeight - canvas.height + cellHeight;

  wrapper.scrollLeft = Math.min(wrapper.scrollLeft, maxScrollX + cellWidth);
  wrapper.scrollTop = Math.min(wrapper.scrollTop, maxScrollY + cellHeight);

  offsetX = wrapper.scrollLeft;
  offsetY = wrapper.scrollTop;
  drawGrid();
});

function clampOffset() {
  offsetX = Math.max(0, Math.min(offsetX, totalCols * cellWidth - canvas.width));
  offsetY = Math.max(0, Math.min(offsetY, totalRows * cellHeight - canvas.height));
}

wrapper.scrollLeft = offsetX;
wrapper.scrollTop = offsetY;
wrapper.scrollTo(offsetX, offsetY);


function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.font = '12px sans-serif';
  ctx.fillStyle = "black";

  const startCol = Math.floor(offsetX / cellWidth) + 1;
  const endCol = Math.min(startCol + Math.ceil(canvas.width / cellWidth), totalCols);

  const startRow = Math.floor(offsetY / cellHeight) + 1;
  const endRow = Math.min(startRow + Math.ceil(canvas.height / cellHeight), totalRows);

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
  let x = 0;
  for (let i = 0; i < col; i++) {
    x += colWidths[i];
  }
  return x;
}

function getRowY(row) {
  let y = 0;
  for (let j = 0; j < row; j++) {
    y += rowHeights[j];
  }
  return y;
}


canvas.addEventListener('mousemove', (e) => {

    const startCol = Math.floor(offsetX / cellWidth);
    const endCol = Math.min(startCol + Math.ceil(canvas.width / cellWidth), totalCols);

    const startRow = Math.floor(offsetY / cellHeight);
    const endRow = Math.min(startRow + Math.ceil(canvas.height / cellHeight), totalRows);


  if (resizingCol !== null) {
    const deltaX = e.clientX - startX;
    colWidths[resizingCol] = Math.max(30, colWidths[resizingCol] + deltaX);
    startX = e.clientX;
    drawGrid();
    return;
  }

  if (resizingRow !== null) {
    const deltaY = e.clientY - startY;
    rowHeights[resizingRow] = Math.max(30, rowHeights[resizingRow] + deltaY);
    startY = e.clientY;
    drawGrid();
    return;
  }

  // Check for column resize hover
  for (let col = startCol; col < endCol; col++) {
    const x = getColX(col) - offsetX;
    if (e.offsetY < cellHeight && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
      canvas.style.cursor = 'col-resize';
      return;
    }
  }

  // Check for row resize hover
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

    const startCol = Math.floor(offsetX / cellWidth);
    const endCol = Math.min(startCol + Math.ceil(canvas.width / cellWidth), totalCols);

    const startRow = Math.floor(offsetY / cellHeight);
    const endRow = Math.min(startRow + Math.ceil(canvas.height / cellHeight), totalRows);

  // Check for column resize start
  for (let col = startCol; col < endCol; col++) {
    const x = getColX(col) - offsetX;
    if (e.offsetY < cellHeight && Math.abs(e.offsetX - (x + colWidths[col])) < 5) {
      resizingCol = col;
      startX = e.clientX;
      return;
    }
  }

  // Check for row resize start
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

