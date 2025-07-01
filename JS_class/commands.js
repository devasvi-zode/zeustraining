/**
 * Represents a command to resize a column.
 * Supports execution and undoing via the Command pattern.
 */
export class ResizedColumnCommand {
    /**
     * Constructs a ResizedColumnCommand instance.
     * 
     * @param {DimensionsManager} dimensionsManager - Manages dimensions of the grid.
     * @param {Number} col - the index of the column to be resized.
     * @param {Array} newWidth - The new width to apply to the column
     */
    constructor(dimensionsManager, col, newWidth){
        this.dimensions = dimensionsManager;
        this.col = col;
        this.newWidth = newWidth;

        /**
         * @type {Number} - The previous width of the column before resizing (used for undo).
         */
        this.previousWidth = dimensionsManager.colWidths[col];
    }

    /**
     * Executes the column resize by setting the new width
     * and updating the layout.
     */
    execute(){
        this.dimensions.colWidths[this.col] = this.newWidth;
        this.dimensions.updateLayout();
    }

    /**
     * Undoes the column resize by restoring the previous width 
     * and updating the layout.
     */
    undo(){
        this.dimensions.colWidths[this.col] = this.previousWidth;
        this.dimensions.updateLayout();
    }
}

/**
 * Represents a command to resize a row.
 * Supports execution and undoing via the Command pattern.
 */
export class ResizedRowCommand {
    /**
     * 
     * @param {DimensionsManager} dimensionsManager - Manages dimensions of the grid.
     * @param {Number} row - The index of the row to be resized.
     * @param {Array} newHeight - The new height to apply to the row.
     */
    constructor(dimensionsManager, row, newHeight){
        this.dimensions = dimensionsManager;
        this.row = row;
        this.newHeight = newHeight;
        /**
         * @type {Number} - The previous height of the row before resizing (used for undo).
         */
        this.previousHeight = dimensionsManager.rowHeights[row];
    }

    /**
     * Executes the row resize by setting the new height
     * and updating the layout.
     */
    execute(){
        this.dimensions.rowHeights[this.row] = this.newHeight;
        this.dimensions.updateLayout();
    }

    /**
     * Undoes the row resize by restoring the previous height 
     * and updating the layout
     */
    undo(){
        this.dimensions.rowHeights[this.row] = this.previousHeight;
        this.dimensions.updateLayout();
    }
}

/**
 * Represents a command to edit a cell.
 * Supports execution and undoing via the Command pattern.
 */
export class CellEditCommand {
    /**
     * 
     * @param {cell_data} cellData - Manages the grid cells data.
     * @param {Number} col - the column index of the cell to be editied.
     * @param {Number} row - the row index of the cell to be editied.
     * @param {any} newValue - the new value of the cell (col, row) in the memory.
     */
    constructor(cellData, col, row, newValue) {
        this.cellData = cellData;
        this.col = col;
        this.row = row;
        this.newValue = newValue;

        /**
         * @type {Number} - the prvious value of the cell (col, row) before editing (used for undo).
         */
        this.previousValue = cellData.getCellValue(col, row);
    }

    /**
     * Executes cell edit by filling the value of the cell
     */
    execute() {
        this.cellData.setCellValue(this.col, this.row, this.newValue);
    }

    /**
     * Undoes the cell value by restoring the previous cell vaule
     */
    undo() {
        this.cellData.setCellValue(this.col, this.row, this.previousValue);
    }
}

/**
 * Represents a command to seleact column(s).
 * Supports execution and undoing via the Command pattern.
 */
//need to update 
export class ColumnSelectCommand {
    /**
     * 
     * @param {ColumnSelector} selectionManager 
     * @param {*} prevSelection 
     * @param {*} newSelection 
     */
    constructor(selectionManager, prevSelection, newSelection) {
        this.selectionManager = selectionManager;
        this.prevSelection = prevSelection;
        this.newSelection = newSelection;
    }

    /**
     * Executes column selection by selecting columns
     */
    execute(){
        this.selectionManager.selectColumn(this.newSelection);
    }

    /**
     * Undoes column selection
     */
    undo(){
        this.selectionManager.selectColumn(this.prevSelection);
    }
}