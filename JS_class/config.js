/**
 * @type {Number} - Default width of each cell in pixels.
 */
export const CELL_WIDTH = 80;

/**
 * @type {Number} - Default height of each cell in pixels.
 */
export const CELL_HEIGHT = 30;

/**
 * @type {Number} - Total number of columns in the grid.
 */
export const TOTAL_COLS = 5000;
/**
 * @type {Number} - Total number of rows in the grid.
 */
export const TOTAL_ROWS = 100000;

/**
 * Total number of rows and columns in the grid
 * @type {Object.<number, number>}
 */
export const gridConfig = {
  TOTAL_ROWS: 100000,
  TOTAL_COLS: 5000,
};

/**
 * @type {String} - Color used for the column/row reisze guide;
 */
export const RESIZE_COLOR = '#135c2e';
/**
 * @type {Number} - Width(in pixels) of the visual guide used when resizing columns or rows.
 */
export const RESIZE_GUIDE_WIDTH = 2;

/**
 * Inline CSS styles applied to the cell input element while editing.
 * @type {Object.<String, String>}
 */
export const CELL_EDITING_STYLE = {
    // padding: '5px',
    fontSize: '12px',
    fontFamily: 'sans-serif',
    outline: 'none',
    border: 'none',
    boxSizing: 'border-box',
};