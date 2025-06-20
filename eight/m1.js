const canvas = document.getElementById('excelCanvas');
const ctx = canvas.getContext('2d');
const gridSpace = document.querySelector('.gridSpace');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const fakeScroll = document.getElementById('fake-scroll');

const TOTAL_ROWS = 100000;
const TOTAL_COLS = 500;
const ROW_HEIGHT = 30;
const COL_WIDTH = 100;

// Instead of setting fixed dimensions, set them based on viewport
// fakeScroll.style.width = `${Math.min(TOTAL_COLS * COL_WIDTH, gridSpace.clientWidth)}px`;
// fakeScroll.style.height = `${Math.min(TOTAL_ROWS * ROW_HEIGHT, gridSpace.clientHeight)}px`;
// In your initialization code:
fakeScroll.style.width = `${TOTAL_COLS * COL_WIDTH }px`;
fakeScroll.style.height = `${TOTAL_ROWS * ROW_HEIGHT}px`;

let colWidths = Array(TOTAL_COLS).fill(COL_WIDTH);
let rowHeights = Array(TOTAL_ROWS).fill(ROW_HEIGHT);

// canvas.width = 500;
// canvas.height = 1200;
canvas.width = Math.min(
  gridSpace.clientWidth,
  TOTAL_COLS * COL_WIDTH
);
canvas.height = Math.min(
  gridSpace.clientHeight,
  TOTAL_ROWS * ROW_HEIGHT
);

// Add this to properly handle scroll limits
function updateScrollLimits() {
    const maxScrollX = TOTAL_COLS * COL_WIDTH - gridSpace.clientWidth;
    const maxScrollY = TOTAL_ROWS * ROW_HEIGHT - gridSpace.clientHeight;
    
    // Prevent scrolling beyond content
    if (gridSpace.scrollLeft > maxScrollX) {
        gridSpace.scrollLeft = maxScrollX;
    }
    if (gridSpace.scrollTop > maxScrollY) {
        gridSpace.scrollTop = maxScrollY;
    }
}

function updateVisibleRange(scrollX, scrollY) {
    visibleStartRow = Math.floor(scrollY / ROW_HEIGHT);
    visibleEndRow = Math.min(visibleStartRow + Math.ceil(canvas.height / ROW_HEIGHT), TOTAL_ROWS);

    visibleStartCol = Math.floor(scrollX / COL_WIDTH);
    visibleEndCol = Math.min(visibleStartCol + Math.ceil(canvas.width / COL_WIDTH), TOTAL_COLS);
}

function renderGrid(scrollX, scrollY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateVisibleRange(scrollX, scrollY);

    for (let row = visibleStartRow; row < visibleEndRow; row++) {
        for (let col = visibleStartCol; col < visibleEndCol; col++) {
            const x = col * COL_WIDTH - scrollX;
            const y = row * ROW_HEIGHT - scrollY;

            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(x, y, COL_WIDTH, ROW_HEIGHT);

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`R${row}C${col}`, x + 5, y + 15);
        }
    }
}

// Initial render
renderGrid(0, 0);

// gridSpace.addEventListener('scroll', () => {
//     const scrollX = gridSpace.scrollLeft;
//     const scrollY = gridSpace.scrollTop;

//     // Move canvas to match scroll
//     canvasWrapper.style.transform = `translate(${scrollX}px, ${scrollY}px)`;

//     renderGrid(scrollX, scrollY);
// });
// Replace your current scroll event listener with this:
gridSpace.addEventListener('scroll', () => {
    const scrollX = gridSpace.scrollLeft;
    const scrollY = gridSpace.scrollTop;
    
    // Calculate maximum allowed scroll positions
    const maxScrollX = TOTAL_COLS * COL_WIDTH - gridSpace.clientWidth;
    const maxScrollY = TOTAL_ROWS * ROW_HEIGHT - gridSpace.clientHeight;
    
    // Clamp scroll positions to prevent scrolling beyond content
    const clampedScrollX = Math.min(scrollX, maxScrollX);
    const clampedScrollY = Math.min(scrollY, maxScrollY);
    
    // If we needed to clamp, update the scroll position
    if (scrollX !== clampedScrollX || scrollY !== clampedScrollY) {
        gridSpace.scrollTo(clampedScrollX, clampedScrollY);
        return;
    }
    
    // Move canvas to match scroll
    canvasWrapper.style.transform = `translate(${scrollX}px, ${scrollY}px)`;
    renderGrid(scrollX, scrollY);
});

// function resizeCanvas() {
//     const colsVisible = Math.floor(window.innerWidth / COL_WIDTH);
//     const rowsVisible = Math.floor(window.innerHeight / ROW_HEIGHT);

//     canvas.width = colsVisible * COL_WIDTH;
//     canvas.height = rowsVisible * ROW_HEIGHT;

//     renderGrid(gridSpace.scrollLeft, gridSpace.scrollTop);
// }
// function resizeCanvas() {
//     const visibleWidth = Math.min(
//         gridSpace.clientWidth,
//         TOTAL_COLS * COL_WIDTH - gridSpace.scrollLeft
//     );
//     const visibleHeight = Math.min(
//         gridSpace.clientHeight,
//         TOTAL_ROWS * ROW_HEIGHT - gridSpace.scrollTop
//     );
    
//     canvas.width = visibleWidth;
//     canvas.height = visibleHeight;
    
//     renderGrid(gridSpace.scrollLeft, gridSpace.scrollTop);
// }

function resizeCanvas() {
    const newWidth = Math.min(gridSpace.clientWidth, TOTAL_COLS * COL_WIDTH - gridSpace.scrollLeft);
    const newHeight = Math.min(gridSpace.clientHeight, TOTAL_ROWS * ROW_HEIGHT - gridSpace.scrollTop);
    
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        renderGrid(gridSpace.scrollLeft, gridSpace.scrollTop);
    }
}


window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // call once at the start


