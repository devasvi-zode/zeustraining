import { CELL_HEIGHT, CELL_WIDTH, RESIZE_COLOR, RESIZE_GUIDE_WIDTH, TOTAL_COLS, TOTAL_ROWS} from './config.js';
import { ctx, canvas } from './dom-elements.js';

export class Renderer {
    constructor(dimensionsManager,dataStore) {
        this.dimensions = dimensionsManager;
        this.dataStore = dataStore;
        this.selectedCell = null;
    }

    drawGrid() {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;

        ctx.clearRect(0, 0, logicalWidth, logicalHeight);

        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.font = '12px sans-serif';
        ctx.fillStyle = "black";

        const startCol = this.getStartCol(this.dimensions.offsets.x);
        const endCol = this.getEndCol(this.dimensions.offsets.x, logicalWidth);
        const startRow = this.getStartRow(this.dimensions.offsets.y);
        const endRow = this.getEndRow(this.dimensions.offsets.y, logicalHeight);

        // Draw cells
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
                const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
                ctx.strokeRect(x, y, this.dimensions.colWidths[col], this.dimensions.rowHeights[row]);

                
                //Skip drawing text if this cell is being edited
                if (
                    this.selectedCell &&
                    this.selectedCell.col === col &&
                    this.selectedCell.row === row
                ) {
                    continue;
                }

                //Draw cell value if it exists
                const value = this.dataStore.getCellValue(col, row);
                ctx.fillText(value || ``, x + 5, y + 20);
            }
        }

        // Draw column headers
        for (let col = startCol; col < endCol; col++) {
            const x = Math.max(0, this.dimensions.getColX(col) - this.dimensions.offsets.x);
            const y = 0;    //makes the column header is always visible
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
            ctx.strokeRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
            ctx.fillStyle = 'black';
            ctx.fillText(`${this.getColumnName(col)}`, x + 10, y + 20);
        }

        // Draw row headers
        for (let row = startRow; row < endRow; row++) {
            const x = 0;  //makes the row header always visible
            const y = Math.max(0, this.dimensions.getRowY(row) - this.dimensions.offsets.y);
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);
            ctx.strokeRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);
            ctx.fillStyle = 'black';
            ctx.fillText(` ${row}`, x + 15, y + 20);
        }

        // Draw top-left corner
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        ctx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        ctx.fillStyle = 'black';
        ctx.fillText('', 5, 15);

        this.drawResizeGuides();

        if(this.selectedCell){
            this.drawCellSelection();
        }
    }

    setSelectedCell(col, row){
        console.log("Setting selected cell:", this.getColumnName(col), row);
        this.selectedCell = {col, row};
        this.drawGrid();
    }
    clearSelection(){
        this.selectedCell = null;
        this.drawGrid();
    }
    drawCellSelection(){
        console.log("Drawing selection for:", this.selectedCell);
        const {col,row} = this.selectedCell;
        const x = this.dimensions.getColX(col)-this.dimensions.offsets.x;
        const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
        const width = this.dimensions.colWidths[col];
        const height = this.dimensions.rowHeights[row];
        if(x === 0 || y === 0) return;
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(x,y,width,height);
    }

    drawResizeGuides() {
        if (this.dimensions.resizeState.col !== null) {
            //ctx.clearRect(0, 0, logicalWidth, logicalHeight);
            const colLeft = this.dimensions.getColX(this.dimensions.resizeState.col) - this.dimensions.offsets.x;
            const totalGridHeight = this.dimensions.getRowY(TOTAL_ROWS);

            // Solid rectangle around column
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.lineWidth = RESIZE_GUIDE_WIDTH;
            ctx.setLineDash([]);
            ctx.strokeRect(colLeft, 0, CELL_WIDTH, totalGridHeight);

            // Dashed line at resize position
            const currentX = this.dimensions.getColX(this.dimensions.resizeState.col) + this.dimensions.colWidths[this.dimensions.resizeState.col] - this.dimensions.offsets.x;
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(currentX, 0);
            ctx.lineTo(currentX, totalGridHeight);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (this.dimensions.resizeState.row !== null) {
            const rowTop = this.dimensions.getRowY(this.dimensions.resizeState.row) - this.dimensions.offsets.y;
            const totalGridWidth = this.dimensions.getColX(TOTAL_COLS);

            // Solid rectangle around row
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.lineWidth = RESIZE_GUIDE_WIDTH;
            ctx.setLineDash([]);
            ctx.strokeRect(0, rowTop, totalGridWidth, CELL_HEIGHT);

            // Dashed line at resize position
            const currentY = this.dimensions.getRowY(this.dimensions.resizeState.row) + this.dimensions.rowHeights[this.dimensions.resizeState.row] - this.dimensions.offsets.y;
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(0, currentY);
            ctx.lineTo(totalGridWidth, currentY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    getStartCol(offsetX) {
        if (offsetX <= 0) return 0;

        let left = 0;
        let right = TOTAL_COLS;
        let result = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const x = this.dimensions.getColX(mid);
            if (x >= offsetX) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result - 1;   // add buffer 1 so that when column is resized and we scroll the resized column is still visible
    }
    getEndCol(offsetX, viewWidth) {
        const target = offsetX + viewWidth;
        if (target >= this.dimensions.getColX(TOTAL_COLS)) return TOTAL_COLS;

        let left = this.getStartCol(offsetX);
        let right = TOTAL_COLS;
        let result = TOTAL_COLS;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if ((mid < TOTAL_COLS - 1 && this.dimensions.cumulativeColWidths[mid] >= target) ||
                (mid === TOTAL_COLS - 1 && this.dimensions.cumulativeColWidths[mid] >= target)) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        if (result < TOTAL_COLS - 1 && this.dimensions.cumulativeColWidths[result] < target) {
            result++;
        }

        return Math.min(result + 1, TOTAL_COLS);
    }
    getStartRow(offsetY) {
        if (offsetY <= 0) return 0;

        let left = 0;
        let right = TOTAL_ROWS;
        let result = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const y = this.dimensions.getRowY(mid);
            if (y >= offsetY) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result - 1; // add buffer 1 so that when row is resized and we scroll the resized row is still visible
    }
    getEndRow(offsetY, viewHeight) {
        const target = offsetY + viewHeight;
        if (target >= this.dimensions.getRowY(TOTAL_ROWS)) return TOTAL_ROWS;

        let left = this.getStartRow(offsetY);
        let right = TOTAL_ROWS;
        let result = TOTAL_ROWS;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if ((mid < TOTAL_ROWS - 1 && this.dimensions.cumulativeRowHeights[mid] >= target) ||
                (mid === TOTAL_ROWS - 1 && this.dimensions.cumulativeRowHeights[mid] >= target)) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        if (result < TOTAL_ROWS - 1 && this.dimensions.cumulativeRowHeights[result] < target) {
            result++;
        }

        return Math.min(result, TOTAL_ROWS - 1);
    }
    getColumnName(index){
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
}