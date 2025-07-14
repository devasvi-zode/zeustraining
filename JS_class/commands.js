import { gridConfig, CELL_HEIGHT, CELL_WIDTH } from "./config.js";
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
     * @param {Map<number, number>} newHeights - Map of rowIndex → newWidth
     * @param {Map<number, number>} oldHeights - Map of rowIndex → oldWidth
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
        for (const [row, height] of this.newHeights.entries()) {
            this.dimensions.rowHeights[row] = height;
        }
        this.dimensions.updateLayout();
    }

    /**
     * Undoes the row resize by restoring the old height 
     * and updating the layout
     */
    undo(){
        for (const [row, height] of this.oldHeights.entries()) {
            this.dimensions.rowHeights[row] = height;
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

export class AddRowCommand {
    /**
     * Represents a command for adding rows with undo/redo support
     * @param {DimensionsManager} dimensionsManager 
     * @param {cell_data} cellData 
     * @param {number} n - Number of rows to add
     * @param {number} insertAt - Position to insert rows
     * @param {Function} drawCallback - Function to redraw the grid
     */
    constructor(dimensionsManager, cellData, n, insertAt, drawCallback) {
        this.dimensions = dimensionsManager;
        this.cellData = cellData;
        this.n = n;
        this.insertAt = insertAt;
        this.drawCallback = drawCallback;
        
        // Store the original state for undo
        this.originalRowHeights = [...dimensionsManager.rowHeights];
    }

    execute() {
        // Add rows
        gridConfig.TOTAL_ROWS += this.n;
        for (let i = 0; i < this.n; i++) {
            this.dimensions.rowHeights.splice(this.insertAt, 0, CELL_HEIGHT);
        }
        
        // Shift cell data down
        this.cellData.shiftRowsDown(this.insertAt, this.n);
        
        this.dimensions.updateLayout();
        this.drawCallback();
    }

    undo() {
        // Remove the added rows
        gridConfig.TOTAL_ROWS -= this.n;
        this.dimensions.rowHeights.splice(this.insertAt, this.n);
        
        // Shift cell data back up
        this.cellData.shiftRowsUp(this.insertAt, this.n);
        
        // Restore original row heights
        this.dimensions.rowHeights = [...this.originalRowHeights];
        
        this.dimensions.updateLayout();
        this.drawCallback();
    }
}

export class AddColumnCommand {
    constructor(dimensionsManager, cellData, n, insertAt, drawCallback) {
        this.dimensions = dimensionsManager;
        this.cellData = cellData;
        this.n = n;
        this.insertAt = insertAt;
        this.drawCallback = drawCallback;
        
        // Store the original state for undo
        this.originalColumnWidths = [...dimensionsManager.colWidths];
    }

    execute() {
        // Add columns
        gridConfig.TOTAL_COLS += this.n;
        for (let i = 0; i < this.n; i++) {
            this.dimensions.colWidths.splice(this.insertAt, 0, CELL_WIDTH);
        }
        
        // Shift cell data down
        this.cellData.shiftColumnsRight(this.insertAt, this.n);
        
        this.dimensions.updateLayout();
        this.drawCallback();
    }

    undo() {
        // Remove the added rows
        gridConfig.TOTAL_COLS -= this.n;
        this.dimensions.colWidths.splice(this.insertAt, this.n);
        
        // Shift cell data back up
        this.cellData.shiftColumnsLeft(this.insertAt, this.n);
        
        // Restore original row heights
        this.dimensions.colWidths = [...this.originalColumnWidths];
        
        this.dimensions.updateLayout();
        this.drawCallback();
    }
}