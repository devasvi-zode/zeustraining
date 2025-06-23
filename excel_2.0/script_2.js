// const canvas = document.getElementById('myCanvas');
// const ctx = canvas.getContext('2d');
// const wrapper = document.querySelector(".wrapper")

// // Grid and virtual dimension settings
// const cellW = 80, cellH = 30;
// const totalCols = 50000, totalRows = 100000;
// const virtualW = totalCols * cellW, virtualH = totalRows * cellH;

// // Set the wrapper’s scrollable content size
// wrapper.scrollLeft = 0;
// wrapper.scrollTop = 0;
// canvas.style.width = virtualW + 'px';
// canvas.style.height = virtualH + 'px';

// // Define the drawGrid function
// function drawGrid() {
//   const offX = wrapper.scrollLeft;
//   const offY = wrapper.scrollTop;
//   const viewW = wrapper.clientWidth;
//   const viewH = wrapper.clientHeight;

//   canvas.width = viewW;
//   canvas.height = viewH;

//   ctx.clearRect(0, 0, viewW, viewH);
//   ctx.strokeStyle = '#ccc';
//   ctx.lineWidth = 1;

//   const startCol = Math.floor(offX / cellW);
//   const endCol = Math.min(startCol + Math.ceil(viewW / cellW), totalCols);

//   const startRow = Math.floor(offY / cellH);
//   const endRow = Math.min(startRow + Math.ceil(viewH / cellH), totalRows);

//   for (let col = startCol; col <= endCol; col++) {
//     const x = col * cellW - offX;
//     ctx.beginPath();
//     ctx.moveTo(x, 0);
//     ctx.lineTo(x, viewH);
//     ctx.stroke();
//   }

//   for (let row = startRow; row <= endRow; row++) {
//     const y = row * cellH - offY;
//     ctx.beginPath();
//     ctx.moveTo(0, y);
//     ctx.lineTo(viewW, y);
//     ctx.stroke();
//   }
// }

// // Hook drawing to scroll events
// wrapper.addEventListener('scroll', drawGrid);

// // Initial draw
// drawGrid();


const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('wrapper');
const scroller = document.getElementById('scroller');

const cellWidth = 80;
const cellHeight = 30;

const totalCols = 50000;
const totalRows = 100000;

const colWidths = new Array(totalCols).fill(cellWidth);
const rowHeights = new Array(totalRows).fill(cellHeight);

const scrollWidth = totalCols * cellWidth;
const scrollHeight = totalRows * cellHeight;

// Set the scroller size
scroller.style.width = scrollWidth + 'px';
scroller.style.height = scrollHeight + 'px';

let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let startX, startY;


// Mousewheel scroll
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

  // Clamp scroll positions
  // if (wrapper.scrollLeft > maxScrollX) wrapper.scrollLeft = maxScrollX;
  // if (wrapper.scrollTop > maxScrollY) wrapper.scrollTop = maxScrollY;
  wrapper.scrollLeft = Math.min(wrapper.scrollLeft, maxScrollX + cellWidth);
  wrapper.scrollTop = Math.min(wrapper.scrollTop, maxScrollY + cellHeight);


  offsetX = wrapper.scrollLeft;
  offsetY = wrapper.scrollTop;
  drawGrid();
});

// Clamp offset to grid bounds
function clampOffset() {
  offsetX = Math.max(0, Math.min(offsetX, totalCols * cellWidth - canvas.width));
  offsetY = Math.max(0, Math.min(offsetY, totalRows * cellHeight - canvas.height));
}

// Set the virtual scroll size
wrapper.scrollLeft = offsetX;
wrapper.scrollTop = offsetY;
wrapper.scrollTo(offsetX, offsetY);


// Draw grid logic 
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.font = '12px sans-serif';
  ctx.fillStyle = "black";

  const startCol = Math.floor(offsetX / cellWidth) +1 ; // skip headr col 0
  const endCol = Math.min(startCol + Math.ceil(canvas.width / cellWidth), totalCols);

  const startRow = Math.floor(offsetY / cellHeight) +1; //skip header row 0
  const endRow = Math.min(startRow + Math.ceil(canvas.height / cellHeight), totalRows);
  // const buffer = 30;

  // const startCol = Math.floor(offsetX / cellWidth);
  // const endCol = Math.min(startCol + Math.ceil(canvas.width / cellWidth) + buffer, totalCols);

  // const startRow = Math.floor(offsetY / cellHeight);
  // const endRow = Math.min(startRow + Math.ceil(canvas.height / cellHeight) + buffer, totalRows);

  // Vertical lines
  // for (let col = startCol; col <= endCol; col++) {
  //   const x = getColX(col) - offsetX;
  //   ctx.beginPath();
  //   ctx.moveTo(x, 0);
  //   ctx.lineTo(x, canvas.height);
  //   ctx.stroke();
  // }

  // // Horizontal lines
  // for (let row = startRow; row <= endRow; row++) {
  //   const y = getRowY(row) - offsetY;
  //   ctx.beginPath();
  //   ctx.moveTo(0, y);
  //   ctx.lineTo(canvas.width, y);
  //   ctx.stroke();
  // }

  // Draw text
  // for (let row = startRow; row < endRow; row++) {
  //   for (let col = startCol; col < endCol; col++) {
  //     const x = getColX(col) - offsetX + 5;
  //     const y = getRowY(row) - offsetY + 15;
  //     ctx.fillText(`${row},${col}`, x, y);
  //   }
  // }

    // 1. Draw main grid (excluding row 0 & col 0)
  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const x = getColX(col) - offsetX;
      const y = getRowY(row) - offsetY;
      ctx.strokeRect(x, y, cellWidth, cellHeight);
      ctx.fillText(`${row}, ${col}`, x + 5, y + 20);
    }
  }

  // 2. Draw header row (row 0), fixed vertical position 0, horizontal scroll offset by offsetX
  for (let col = startCol; col < endCol; col++) {
    const x = getColX(col) - offsetX;
    const y = 0;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    ctx.fillText(`${getColumnName(col)}`, x + 30, y + 20);
  }

  // 3. Draw header column (col 0), fixed horizontal position 0, vertical scroll offset by offsetY
  for (let row = startRow; row < endRow; row++) {
    const x = 0;
    const y = getRowY(row) - offsetY;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeRect(x, y, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    ctx.fillText(` ${row}`, x + 15, y + 20);
  }

  // 4. Draw corner cell (0,0), fixed at top-left
  ctx.fillStyle = '#bbb';
  ctx.fillRect(0, 0, cellWidth, cellHeight);
  ctx.strokeRect(0, 0, cellWidth, cellHeight);
  ctx.fillStyle = 'black';
  ctx.fillText('', 5, 15);

}

drawGrid();

//function to name the columns
function getColumnName(index) {
    let result = "";
    let n = index;
    while(n > 0){
        n--; // Decrement by 1 to make it 0-based
        let remainder = n % 26;
        result = String.fromCharCode(65 + remainder) + result; // 65 = 'A'
        n = Math.floor(n / 26);
    }
    return result;
}

function getColX(col){
  let x =0;
  for( let i =0; i < col; i++){
    x += colWidths[i];
  }
  return x;
}

function getRowY(row){
  let y = 0;
  for (let j=0; j< row; j++){
    y += rowHeights[j];
  }
  return y;
}
