// Constants for grid dimensions
const TOTAL_ROWS = 100000;
const TOTAL_COLS = 500;
const DEFAULT_ROW_HEIGHT = 20;
const DEFAULT_COL_WIDTH = 64;

// Canvas setup
const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');

// Track scroll position
let scrollX = 0;
let scrollY = 0;

// Store column widths and row heights
const colWidths = Array(TOTAL_COLS).fill(DEFAULT_COL_WIDTH);
const rowHeights = Array(TOTAL_ROWS).fill(DEFAULT_ROW_HEIGHT);

/**
 * Represents the main grid and handles rendering.
 */
// class Grid {
//   /**
//    * Initializes the grid with canvas context and dimensions.
//    * @param {CanvasRenderingContext2D} ctx - The canvas context.
//    */
//   constructor(ctx) {
//     this.ctx = ctx;
//   }

//   /**
//    * Renders the visible portion of the grid.
//    */
//   render() {
//     this.ctx.clearRect(0, 0, canvas.width, canvas.height);

//     let y = 0;
//     for (let row = 0; row < 100; row++) { // Render only first 100 rows for now
//       let x = 0;
//       for (let col = 0; col < 50; col++) { // Render only first 20 columns for now
//         this.ctx.strokeStyle = '#ccc';
//         this.ctx.strokeRect(x, y, colWidths[col], rowHeights[row]);

//         this.ctx.fillStyle = '#000';
//         this.ctx.font = '12px Arial';
//         this.ctx.fillText(`R${row}C${col}`, x + 5, y + 15);

//         x += colWidths[col];
//       }
//       y += rowHeights[row];
//     }
//   }
// }

// const grid = new Grid(ctx);
// grid.render();

class Grid {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.visibleRows = 0;
    this.visibleCols = 0;
    this.scrollTop = 0;
    this.scrollLeft = 0;
  }

  /**
   * Updates scroll position and re-renders grid.
   * @param {number} scrollX Horizontal scroll offset
   * @param {number} scrollY Vertical scroll offset
   */
  updateScroll(scrollX, scrollY) {
    this.scrollLeft = scrollX;
    this.scrollTop = scrollY;
    this.render();
  }

  /**
   * Renders only the visible portion of the grid.
   */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let startRow = Math.floor(this.scrollTop / DEFAULT_ROW_HEIGHT);
    let endRow = startRow + Math.ceil(this.canvas.height / DEFAULT_ROW_HEIGHT);

    let startCol = Math.floor(this.scrollLeft / DEFAULT_COL_WIDTH);
    let endCol = startCol + Math.ceil(this.canvas.width / DEFAULT_COL_WIDTH);

    let y = 0;
    for (let row = startRow; row < endRow && row < TOTAL_ROWS; row++) {
      let x = 0;
      for (let col = startCol; col < endCol && col < TOTAL_COLS; col++) {
        this.ctx.strokeStyle = '#ccc';
        this.ctx.strokeRect(x, y, colWidths[col], rowHeights[row]);

        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`R${row}C${col}`, x + 5, y + 15);

        x += colWidths[col];
      }
      y += rowHeights[row];
    }
  }
}

const gridContainer = document.getElementById('grid-container');
const grid = new Grid(ctx, canvas);

gridContainer.addEventListener('scroll', () => {
  const scrollX = gridContainer.scrollLeft;
  const scrollY = gridContainer.scrollTop;
  grid.updateScroll(scrollX, scrollY);
});

// Initial render
grid.render();
