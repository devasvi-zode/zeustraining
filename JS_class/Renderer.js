import { CELL_HEIGHT, CELL_WIDTH, RESIZE_COLOR, RESIZE_GUIDE_WIDTH, TOTAL_COLS, TOTAL_ROWS} from './config.js';
import { ctx, canvas } from './dom-elements.js';

/**
 * Responsible for drawing and updating the grid, including cells,
 * headers, selections, and visual cues for resizing.
 */
export class Renderer {
    /**
     * 
     * @param {DimensionsManager} dimensionsManager - Manages grid dimensions and offsets.
     * @param {cell_data} dataStore - Provides access to the cell data values.
     */
    constructor(dimensionsManager,dataStore) {
        this.dimensions = dimensionsManager;
        this.dataStore = dataStore;
        this.selectedCell = null;
        this.cellEditor = null;

        this.selectedColumns = new Set(); //track multiple columns
        this.selectedRows = new Set(); //track multiple rows

        // Colors and styles
        this.styles = {
            gridLine: '#ccc',
            headerBg: '#f5f5f5',
            selectedHeaderBg: '#107c41',
            selectedHeaderText: 'white',
            selectedCellBg: 'rgba(232,242,236,0.6)',
            selectionBorder: 'green',
            selectionBorderWidth: 2
        };
    }

    /**
     * Registers a cell editor for input positioning and interactions.
     * @param {CellEditor} cellEditor 
     */
    registerCellEditor(cellEditor){
        this.cellEditor = cellEditor;
    }

    /**
     * Adds a column to the current column selection.
     * @param {number} col 
     */
    addSelectedColumn(col) {
        this.selectedColumns.add(col);
        this.drawGrid();
    }

    /**
     * Removes a column form the current column selection.
     * @param {number} col 
     */
    removeSelectedColumn(col) {
        this.selectedColumns.delete(col);
        this.drawGrid();
    }

    /**
     * Clears all selected columns.
     */
    clearColumnSelection() {
        this.selectedColumns.clear();
        this.drawGrid();
    }

    /**
     * Adds a row to the current row selection.
     * @param {number} row 
     */
    addSelectedRow(row){
        this.selectedRows.add(row);
        this.drawGrid();
    }

    /**
     * Remove a row from the current row selection
     * @param {number} row 
     */
    removeSelectedRow(row){
        this.selectedRows.delete(row);
        this.drawGrid();
    }

    /**
     * Clears all selected rows.
     */
    clearRowSelection(){
        this.selectedRows.clear();
        this.drawGrid();
    }

    /**
     * Renders the entire visible grid including cells, headers, selections,
     * and resizing indicators.
     */
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
        // for (let row = startRow; row < endRow; row++) {
        //     for (let col = startCol; col < endCol; col++) {
        //         const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
        //         const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
        //         ctx.strokeRect(x, y, this.dimensions.colWidths[col], this.dimensions.rowHeights[row]);

                
        //         //Skip drawing text if this cell is being edited
        //         if (
        //             this.selectedCell &&
        //             this.selectedCell.col === col &&
        //             this.selectedCell.row === row
        //         ) {
        //             continue;
        //         }

        //         //Draw cell value if it exists
        //         const value = this.dataStore.getCellValue(col, row);
        //         ctx.fillText(value || ``, x + 5, y + 20);
        //     }
        // }
        this.drawCells(startCol, endCol, startRow, endRow);


        // Draw column headers
        // for (let col = startCol; col < endCol; col++) {
        //     const x = Math.max(0, this.dimensions.getColX(col) - this.dimensions.offsets.x);
        //     const y = 0;    //makes the column header is always visible

        //     // Highlight selected column headers
        //     if (this.selectedColumns.has(col)) {
        //         ctx.fillStyle = '#107c41'; // Green header
        //         ctx.fillRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
        //         ctx.fillStyle = 'white'; // White text
        //         // ctx.fillText(`${this.getColumnName(col)}`, x + 10, y + 20);
        //         const colName = this.getColumnName(col);
        //         ctx.textAlign = 'center';
        //         ctx.textBaseline = 'middle';
        //         ctx.fillText(colName, x + this.dimensions.colWidths[col] / 2, y + CELL_HEIGHT / 2);
        //         ctx.textAlign = 'start';
        //         ctx.textBaseline = 'alphabetic';
        //     } else {
        //         ctx.fillStyle = '#f5f5f5';
        //         ctx.fillRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
        //         ctx.fillStyle = 'black';
        //         //ctx.fillText(`${this.getColumnName(col)}`, x + 10, y + 20);
        //         const colName = this.getColumnName(col);
        //         ctx.textAlign = 'center';
        //         ctx.textBaseline = 'middle';
        //         ctx.fillText(colName, x + this.dimensions.colWidths[col] / 2, y + CELL_HEIGHT / 2);
        //         ctx.textAlign = 'start';
        //         ctx.textBaseline = 'alphabetic';
        //     }
        //     ctx.strokeRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
        // }
        this.drawColumnHeaders(startCol, endCol);

        // Draw border around selected Cell
        // if (this.selectedColumns !== null){
        // ctx.strokeStyle = 'green';
        // ctx.lineWidth = 2;
        // ctx.setLineDash([]);

        // const startCol = Math.min(...Array.from(this.selectedColumns));
        // const endCol = Math.max(...Array.from(this.selectedColumns));

        // // Skip column 0 for column selection border if you want
        // const firstCol = startCol === 0 ? 1 : startCol;

        // const xStart = this.dimensions.getColX(firstCol) - this.dimensions.offsets.x;
        // const xEnd = this.dimensions.getColX(endCol) - this.dimensions.offsets.x +
        //     this.dimensions.colWidths[endCol];
        // const width = xEnd - xStart;

        // const yStart = 0; // start at header top
        // const height = this.dimensions.getRowY(TOTAL_ROWS) - this.dimensions.offsets.y;

        // // Draw border around selected columns (including header)
        // ctx.strokeRect(xStart, yStart, width, height);
        // }
        this.drawColumnSelectionBorder();

        // Draw row headers with highlighting
        // for (let row = startRow; row < endRow; row++) {
        //     const x = 0;
        //     const y = Math.max(0, this.dimensions.getRowY(row) - this.dimensions.offsets.y);

        //     if (this.selectedColumns.size > 0) {
        //         ctx.fillStyle = 'rgb(202, 234, 216)';
        //         ctx.fillRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);
        //     } else {
        //         ctx.fillStyle = '#f5f5f5';
        //         ctx.fillRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);
        //     }

        //     ctx.strokeStyle = '#ccc';  // or default grid border color
        //     ctx.lineWidth = 1;
        //     ctx.strokeRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);

        //     ctx.fillStyle = 'black';
        //     ctx.fillText(` ${row}`, x + 15, y + 20);
        // }
        this.drawRowHeaders(startRow, endRow);
        this.drawRowSelectionBorder();

        this.drawCornerCell();

        // // Draw top-left corner
        // ctx.fillStyle = '#f5f5f5';
        // ctx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        // ctx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        // ctx.fillStyle = 'black';
        // ctx.fillText('', 5, 15);

        // Draw row headers border 
        if (this.selectedColumns.size > 0){
            // Draw right border on the row headers (the vertical line separating row headers from columns)
            // Right edge of row header column (usually col 0 width)

            const rowHeaderRightX = CELL_WIDTH - 1;
            const rowHeaderTopY = CELL_HEIGHT;  // Start below column header
            const rowHeaderBottomY = this.dimensions.getRowY(TOTAL_ROWS) - this.dimensions.offsets.y;

            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(rowHeaderRightX, rowHeaderTopY);
            ctx.lineTo(rowHeaderRightX, rowHeaderBottomY);
            ctx.stroke();
        }

        this.drawResizeGuides();

        if(this.selectedCell){
            this.drawCellSelection();
            this.updateInputBoxPosition();
        }

    }




    /**
     * Draw grid cells 
     * @param {number} startCol 
     * @param {number} endCol 
     * @param {number} startRow 
     * @param {number} endRow 
     */
    drawCells(startCol, endCol, startRow, endRow) {
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
                const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;

                //Skip if this is the cell being edited
                if (this.selectedCell && this.selectedCell.col === col && 
                    this.selectedCell.row === row) {
                        continue;
                    }
                
                //Draw cell background if selected
                if (this.selectedColumns.has(col) || this.selectedRows.has(row)) {
                    ctx.fillStyle = this.styles.selectedCellBg;
                    ctx.fillRect(x, y, this.dimensions.colWidths[col], this.dimensions.rowHeights[row]);
                }

                //Draw cell border
                ctx.strokeRect(x, y, this.dimensions.colWidths[col], this.dimensions.rowHeights[row]);

                //Draw cell value 
                const value = this.dataStore.getCellValue(col, row);
                if (value) {
                    ctx.fillStyle = 'black';
                    ctx.fillText(value, x + 5, y + 20);
                }
            }
        }
    }

    /**
     * 
     * @param {number} startCol 
     * @param {number} endCol 
     */
    drawColumnHeaders(startCol, endCol) {
        for (let col = startCol; col < endCol; col++) {
            const x = Math.max(0, this.dimensions.getColX(col) - this.dimensions.offsets.x);
            const y = 0;

            // Header background
            ctx.fillStyle = this.selectedColumns.has(col) ? 
                this.styles.selectedHeaderBg : this.styles.headerBg;
            ctx.fillRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);

            // Header text
            ctx.fillStyle = this.selectedColumns.has(col) ? 
                this.styles.selectedHeaderText : 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.getColumnName(col), 
                x + this.dimensions.colWidths[col] / 2, 
                y + CELL_HEIGHT / 2
            );
            ctx.textAlign = 'start';
            ctx.textBaseline = 'alphabetic';

            // Header border
            ctx.strokeRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
        }
    }

    /**
     * 
     * @param {number} startRow 
     * @param {number} endRow 
     */
    drawRowHeaders(startRow, endRow) {
        for (let row = startRow; row < endRow; row++) {
            const x = 0;
            const y = Math.max(0, this.dimensions.getRowY(row) - this.dimensions.offsets.y);

            // Row header background
            ctx.fillStyle = this.selectedRows.has(row) ? 
                this.styles.selectedHeaderBg : this.styles.headerBg;
            ctx.fillRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);

            // Row header text
            ctx.fillStyle = this.selectedRows.has(row) ? 
                this.styles.selectedHeaderText : 'black';
            ctx.fillText(row.toString(), x + 15, y + 20);

            // Row header border
            ctx.strokeRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);
        }
    }

    /**
     * Draws border around the selected columns
     */
    drawColumnSelectionBorder() {
        if (this.selectedColumns.size > 0) {
            const startCol = Math.min(...Array.from(this.selectedColumns));
            const endCol = Math.max(...Array.from(this.selectedColumns));
            const firstCol = startCol === 0 ? 1 : startCol;

            const xStart = this.dimensions.getColX(firstCol) - this.dimensions.offsets.x;
            const xEnd = this.dimensions.getColX(endCol) - this.dimensions.offsets.x +
                this.dimensions.colWidths[endCol];
            const width = xEnd - xStart;

            const yStart = 0;
            const height = this.dimensions.getRowY(TOTAL_ROWS) - this.dimensions.offsets.y;

            ctx.strokeStyle = this.styles.selectionBorder;
            ctx.lineWidth = this.styles.selectionBorderWidth;
            ctx.setLineDash([]);
            ctx.strokeRect(xStart, yStart, width, height);
        }
    }

    /**
     * Draws border around the selected rows
     */
    drawRowSelectionBorder() {
        if (this.selectedRows.size > 0) {
            const startRow = Math.min(...Array.from(this.selectedRows));
            const endRow = Math.max(...Array.from(this.selectedRows));
            const firstRow = startRow === 0 ? 1 : startRow;

            const yStart = this.dimensions.getRowY(firstRow) - this.dimensions.offsets.y;
            const yEnd = this.dimensions.getRowY(endRow) - this.dimensions.offsets.y +
                this.dimensions.rowHeights[endRow];
            const height = yEnd - yStart;

            const xStart = 0;
            const width = this.dimensions.getColX(TOTAL_COLS) - this.dimensions.offsets.x;

            ctx.strokeStyle = this.styles.selectionBorder;
            ctx.lineWidth = this.styles.selectionBorderWidth;
            ctx.setLineDash([]);
            ctx.strokeRect(xStart, yStart, width, height);
        }
    }

    /**
     * Draws the top-left header cell
     */
    drawCornerCell() {
        ctx.fillStyle = this.styles.headerBg;
        ctx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        ctx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
    }






    /**
     * Sets the currently selected cell.
     * @param {number} col 
     * @param {number} row 
     */
    setSelectedCell(col, row){
        //console.log("Setting selected cell:", this.getColumnName(col), row);
        this.selectedCell = {col, row};
        this.drawGrid();
    }

    /**
     * Clears cell selection and redraws the grid.
     */
    clearSelection(){
        this.selectedCell = null;
        this.drawGrid();
    }

    /**
     * Draws a border around the selected cells.
     */
    drawCellSelection(){
        if (!this.selectedCell) return;

        // console.log("Drawing selection for:", this.selectedCell);
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

    /**
     * Repositions the input box for editing the selected cell.
     */
    updateInputBoxPosition() {
        if (!this.cellEditor || !this.cellEditor.inputElement || !this.selectedCell) {
            return;
        }

        const { col, row } = this.selectedCell;
        const inputElement = this.cellEditor.inputElement;

        try {
            const x = this.dimensions.getColX(col);
            const y = this.dimensions.getRowY(row);
            const width = this.dimensions.colWidths[col];
            const height = this.dimensions.rowHeights[row];

            if (x <= 0 || y <= 0) {
                inputElement.style.display = 'none';
                return;
            }

            // Safely apply styles
            inputElement.style.left = `${x}px`;
            inputElement.style.top = `${y}px`;
            inputElement.style.width = `${width}px`;
            inputElement.style.height = `${height}px`;
            inputElement.style.display = 'block';
        } catch (error) {
            console.error('Error in updateInputBoxPosition:', error);
            if (inputElement) {
                inputElement.style.display = 'none';
            }
        }
    }

    /**
     * Draws visual resize indicators during column/row resizing.
     */
    drawResizeGuides() {
        if (this.dimensions.resizeState.col !== null) {
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

    /**
     * Binary search for finding the first visible column in virtual grid
     * @param {number} offsetX 
     * @returns {number} 
     */
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

    /**
     * Binary search for finding the last visible column 
     * @param {number} offsetX 
     * @param {number} viewWidth 
     * @returns {number}
     */
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

    /**
     * 
     * @param {number} offsetY 
     * @returns {number}
     */
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

    /**
     * 
     * @param {number} offsetY 
     * @param {number} viewHeight 
     * @returns {number}
     */
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

        return Math.min(result+1, TOTAL_ROWS - 1);
    }

    /**
     * Converts a numeric column index to a spreadsheet-style name 
     * @param {number} index 
     * @returns {String}
     */
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