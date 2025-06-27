import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./config.js";
import { canvas, wrapper, scroller} from './dom-elements.js';

export class DimensionsManager{
    constructor(){
        this.colWidths = new Array(TOTAL_COLS).fill(Math.floor(CELL_WIDTH));
        this.rowHeights = new Array(TOTAL_ROWS).fill(Math.floor(CELL_HEIGHT));
        this.cumulativeColWidths = new Array(TOTAL_COLS);
        this.cumulativeRowHeights = new Array(TOTAL_ROWS);
        this.offsets = { x:0, y:0 };
        this.resizeState = {
            col: null,
            row: null,
            startX: 0,
            startY: 0
        };

        this.updateCumulativeDimensions();
    }

    updateLayout(){
        this.updateCumulativeDimensions();
        scroller.style.width = `${this.getColX(TOTAL_COLS) }px`;
        scroller.style.height = `${this.getRowY(TOTAL_ROWS) }px`;
        this.resizeCanvasToWrapper();
        this.clampOffset();
        console.log("Calculated total width:", this.getColX(TOTAL_COLS));
console.log("Scroller width:", scroller.offsetWidth);
        console.log("Calculated total height:", this.getRowY(TOTAL_ROWS));
console.log("Scroller height:", scroller.offsetHeight);
console.log("Last column width:", 
  this.colWidths[this.colWidths.length - 1],
  "Total drift:", 
  400000 - this.cumulativeColWidths[TOTAL_COLS - 1]
);
    }

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

    updateCumulativeDimensions(){
        let colSum = 0;
        for (let i=0; i<TOTAL_COLS; i++){
            this.colWidths[i] = Math.floor(this.colWidths[i]);
            colSum += this.colWidths[i];
            this.cumulativeColWidths[i] = colSum;
        }

        let rowSum = 0;
        for( let j=0; j<TOTAL_ROWS; j++){
            this.rowHeights[j] = Math.floor(this.rowHeights[j]);
            rowSum += this.rowHeights[j];
            this.cumulativeRowHeights[j] = rowSum;
        }
    }

    clampOffset(){
        const maxOffsetX = Math.max(0, this.getColX(TOTAL_COLS)- wrapper.clientWidth);
        const maxOffsetY = Math.max(0, this.getRowY(TOTAL_ROWS) - wrapper.clientHeight);

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
                this.offsets.y = Math.min(maxOffsetY, rowBottomEdge - wrappperHeight);
            }
        }

        this.offsets.x = Math.max(0, Math.min(this.offsets.x, maxOffsetX));
        this.offsets.y = Math.max(0, Math.min(this.offsets.y, maxOffsetY));

        wrapper.scrollLeft = this.offsets.x;
        wrapper.scrollTop = this.offsets.y;
    }

    getColX(col){
        return col === 0 ? 0 : this.cumulativeColWidths[col-1];
    }

    getRowY(row){
        return row === 0 ? 0 : this.cumulativeRowHeights[row-1];
    }
    getTotalWidth() {
    return this.cumulativeColWidths[TOTAL_COLS - 1]; // total grid width
    }

    getTotalHeight() {
        return this.cumulativeRowHeights[TOTAL_ROWS - 1]; // total grid height
    }
}