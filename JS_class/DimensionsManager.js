import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS , gridConfig} from "./config.js";
import { canvas, wrapper, scroller} from './dom-elements.js';

/**
 * Manages dimensions and layout of a grid, including column widths, row heights,
 * scroll offsets, and canvas resizing. Also handles cumulative dimension calculations
 * for efficient coordinate mapping.
 */
export class DimensionsManager{
    /**
     * Initializes the DimensionsManager with default column and row sizes,
     * and computes cumulative dimensions.
     */
    constructor(){
        this.colWidths = new Array(gridConfig.TOTAL_COLS).fill(Math.floor(CELL_WIDTH));
        this.rowHeights = new Array(gridConfig.TOTAL_ROWS).fill(Math.floor(CELL_HEIGHT));
        this.cumulativeColWidths = new Array(gridConfig.TOTAL_COLS);
        this.cumulativeRowHeights = new Array(gridConfig.TOTAL_ROWS);
        this.offsets = { x:0, y:0 };
        this.resizeState = {
            col: null,
            row: null,
            startX: 0,
            startY: 0
        };

        this.updateCumulativeDimensions();
    }

    /**
     * Updates layout-related properties including cumulative dimensions,
     * canvas size, and scroll clamping.
     */
    updateLayout(){
        this.updateCumulativeDimensions();
        scroller.style.width = `${this.getColX(gridConfig.TOTAL_COLS) }px`;
        scroller.style.height = `${this.getRowY(gridConfig.TOTAL_ROWS) }px`;
        this.resizeCanvasToWrapper();
        this.clampOffset();
    }

    /**
     * Resizes the canvas to match the wrapper's dimensions and applies
     * device pixel ratio scaling for crisp rendering.
     * @returns {{dpr: number, wrapperWidth: number, wrappperHeight: number}} - Rendering context info.
     */
    resizeCanvasToWrapper(){
        const dpr = window.devicePixelRatio || 1;
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperWidth = wrapperRect.width;
        const wrappperHeight = wrapperRect.height;

        canvas.style.width = `${wrapperWidth}px`;
        canvas.style.height = `${wrappperHeight}px`;
        canvas.width = Math.floor(wrapperWidth * dpr);
        canvas.height = Math.floor(wrappperHeight * dpr);

        const ctx = canvas.getContext('2d');
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr, dpr);
        ctx.translate(0.5 ,0.5);
        //ctx.imageSmoothingEnabled = false;

        return { dpr, wrapperWidth, wrappperHeight};
    }

    /**
     * Recalculates cumulative column and row dimensions for fast lookup.
     */
    updateCumulativeDimensions(){
        let colSum = 0;
        for (let i=0; i<gridConfig.TOTAL_COLS; i++){
            this.colWidths[i] = Math.floor(this.colWidths[i]);
            colSum += this.colWidths[i];
            this.cumulativeColWidths[i] = colSum;
        }

        let rowSum = 0;
        for( let j=0; j<gridConfig.TOTAL_ROWS; j++){
            this.rowHeights[j] = Math.floor(this.rowHeights[j]);
            rowSum += this.rowHeights[j];
            this.cumulativeRowHeights[j] = rowSum;
        }
    }

    /**
     * Clamps the scroll offsets to ensure the viewport stays within bounds.
     * Adjusts offsets based on resize state if necessary.
     */
    clampOffset(){
        const maxOffsetX = Math.max(0, this.getColX(gridConfig.TOTAL_COLS)- wrapper.clientWidth);
        const maxOffsetY = Math.max(0, this.getRowY(gridConfig.TOTAL_ROWS) - wrapper.clientHeight);

        if(this.resizeState.col !== null){
            const colRightEdge = this.getColX(this.resizeState.col + 1);
            const viewportRight = this.offsets.x + wrapper.clientWidth;

            if(colRightEdge > viewportRight){
                this.offsets.x = Math.min(maxOffsetX, colRightEdge - wrapper.clientWidth);
            }
        }

        if(this.resizeState.row !== null){
            const rowBottomEdge = this.getRowY(this.resizeState.row + 1);
            const viewportBottom = this.offsets.y + wrapper.clientHeight;

            if(rowBottomEdge > viewportBottom){
                this.offsets.y = Math.min(maxOffsetY, rowBottomEdge - wrapper.clientHeight);
            }
        }

        this.offsets.x = Math.max(0, Math.min(this.offsets.x, maxOffsetX));
        this.offsets.y = Math.max(0, Math.min(this.offsets.y, maxOffsetY));

        wrapper.scrollLeft = this.offsets.x;
        wrapper.scrollTop = this.offsets.y;
    }

    /**
     * Returns the X coordinate (in pixels) of the left edge of a given column.
     * @param {number} col - Column index. 
     * @returns {number} X position in pixels.
     */
    getColX(col){
        return col === 0 ? 0 : this.cumulativeColWidths[col-1];
    }

    /**
     * Returns the Y coordinate (in pixels) of the top edge of a given row.
     * @param {number} row - Row index. 
     * @returns {number} Y position in pixels.
     */
    getRowY(row){
        return row === 0 ? 0 : this.cumulativeRowHeights[row-1];
    }

    /**
     * Returns the total width of all columns combined.
     * @returns {number} Total grid width in pixels.
     */
    getTotalWidth() {
    return this.cumulativeColWidths[gridConfig.TOTAL_COLS - 1]; // total grid width
    }

    /**
     * Returns the total height of all rows combined.
     * @returns {number} Total grid height in pixels.
     */
    getTotalHeight() {
        return this.cumulativeRowHeights[gridConfig.TOTAL_ROWS - 1]; // total grid height
    }
}