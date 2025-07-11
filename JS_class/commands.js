/**
 * Represents a command to resize a column.
 * Supports execution and undoing via the Command pattern.
 */
export class ResizedColumnCommand {
    /**
     * Constructs a ResizedColumnCommand instance.
     * 
     * @param {DimensionsManager} dimensionsManager - Manages dimensions of the grid.
     * @param {Map<number, number>} newWidths - Map of colIndex → newWidth
     * @param {Map<number, number>} oldWidths - Map of colIndex → oldWidth
     */
    constructor(dimensionsManager, newWidths, oldWidths){
        this.dimensions = dimensionsManager;
        this.newWidths = newWidths;
        this.oldWidths = oldWidths;

    }

    /**
     * Executes the column resize by setting the new width
     * and updating the layout.
     */
    execute(){
        for (const [col, width] of this.newWidths.entries()) {
            this.dimensions.colWidths[col] = width;
        }
        this.dimensions.updateLayout();
    }

    /**
     * Undoes the column resize by restoring the old width 
     * and updating the layout.
     */
    undo(){
        for (const [col, width] of this.oldWidths.entries()) {
            this.dimensions.colWidths[col] = width;
        }
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
    constructor(dimensionsManager,  newHeights, oldHeights){
        this.dimensions = dimensionsManager;
        this.newHeights = newHeights;
        this.oldHeights = oldHeights;
    }

    /**
     * Executes the row resize by setting the new height
     * and updating the layout.
     */
    execute(){
        for (const [col, width] of this.newHeights.entries()) {
            this.dimensions.colWidths[col] = width;
        }
        this.dimensions.updateLayout();
    }

    /**
     * Undoes the row resize by restoring the old height 
     * and updating the layout
     */
    undo(){
        for (const [col, width] of this.oldHeights.entries()) {
            this.dimensions.colWidths[col] = width;
        }
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
        this.oldValue = cellData.getCellValue(col, row);
    }

    /**
     * Executes cell edit by filling the value of the cell
     */
    execute() {
        this.cellData.setCellValue(this.col, this.row, this.newValue);
    }

    /**
     * Undoes the cell value by restoring the old cell vaule
     */
    undo() {
        this.cellData.setCellValue(this.col, this.row, this.oldValue);
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