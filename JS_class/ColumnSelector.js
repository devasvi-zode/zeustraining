import { ctx, canvas } from './dom-elements.js';
import { CELL_HEIGHT , gridConfig} from './config.js';

/**
 * Manages column selection interactions within a grid.
 * Handles mouse and keyboard events to support single and range selection
 */
export class ColumnSelector {
    /**
     * Initializes the ColumnSelector.
     * @param {DimensionsManager} dimensionsManager 
     * @param {SelectorManager} selectorManager 
     * @param {Renderer} renderer 
     */
    constructor(dimensionsManager, selectorManager, renderer) {
        this.dimensions = dimensionsManager;
        this.selectorManager = selectorManager;
        this.renderer = renderer;

        this.selectedColumns = new Set();
        this.firstSelectedColumn = null;
        this.lastSelectedColumn = null;
        this.isShiftPressed = false;
        this.isMouseDown = false;
        this.dragStartColumn = null;

        this.hitTest = this.hitTest.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * Determines whether the column selector should become active based on pointer position.
     * Checks if the pointer is within the column selection area and not too close to the column boundary. 
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {boolean} - Returns true if the column selector should activate, false otherwise.
     */
    hitTest(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;

        if( e.clientY - rect.top > CELL_HEIGHT ) return false;
        const col = this.findColumn(x);
        const colStart = this.dimensions.getColX(col);
        const colEnd = colStart + this.dimensions.colWidths[col];
        if( col !== null && col !== 0 && Math.abs(x - colEnd) >= 8) return true;
    }

    /**
     * Determines the appropriate cursor style based on pointer position.
     * Used to visually indicate row selection capability when hovering near row boundaries.
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {string | null} - Returns a custom cursor style string or null if no change is needed.
     */
    getCursor(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;

        const startCol = this.renderer.getStartCol(this.dimensions.offsets.x);
        const endCol = this.renderer.getEndCol(this.dimensions.offsets.x , logicalWidth);

        // Check for column select cursor
        for (let col = startCol; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) >= 8) {
                return 'url(icons8-thick-arrow-pointing-down-15.png) 15 15 ,grab';
            }
        }
        return null;
    }

    /**
     * Handles mouse down event on the column header to initiate column selection.
     * @param {MouseEvent} e - The mouse down event.
     */
    handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;

        if (e.clientY - rect.top > CELL_HEIGHT) return;

        const col = this.findColumn(x);

        if (col !== null) {
            this.selectorManager.lastSelectionType = 'column';
            this.firstSelectedColumn = col;
            this.selectorManager.lastActiveCell = {row: 1, col: this.firstSelectedColumn};
            this.isMouseDown = true;
            this.dragStartColumn = col;

            if (!e.ctrlKey && !e.metaKey) {
                this.clearSelection();
            }

            this.addColumnToSelection(col);
            this.lastSelectedColumn = col;
            this.renderer.drawGrid();

        }
    }

    /**
     * Handles mouse move event to update column selection during drag.
     * @param {MouseEvent} e - The mouse move event.
     */
    handleMouseMove(e) {
        if (!this.isMouseDown) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        const col = this.findColumn(x);

        if (col !== null && col !== this.lastSelectedColumn) {
            this.selectColumnRange(this.dragStartColumn, col);
            this.lastSelectedColumn = col;
            // this.selectorManager.stats.updateStats();
            this.renderer.drawGrid();
        }
    }



    /**
     * Handles mouse up event to finalize column selection.
     */
    handleMouseUp() {
        this.isMouseDown = false;
        this.dragStartColumn = null;
        this.selectorManager.stats.updateStats();
        this.renderer.drawGrid();
    }

    /**
     * Handles key down events to track Shift key state.
     * @param KeyboardEvent} e - The key down event. 
     */
    // handleKeyDown(e) {
    //     if (e.key === 'Shift') {
    //         this.isShiftPressed = true;
    //     }
    // }

    /**
     * Handles key up events to reset Shift key state.
     * @param {KeyboardEvent} e - The key up event. 
     */
    // handleKeyUp(e) {
    //     if (e.key === 'Shift') {
    //         this.isShiftPressed = false;
    //     }
    // }

    /**
     * Finds the column index based on the horizontal position.
     * @param {number} x - The horizontal position relative to the canvas.
     * @returns {number|null} The column index or null if not found.
     */
    findColumn(x) {
        let left = 0;
        let right = gridConfig.TOTAL_COLS - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const colStart = this.dimensions.getColX(mid);
            const colEnd = colStart + this.dimensions.colWidths[mid];

            if (x >= colStart && x < colEnd) return mid;
            if (x < colStart) right = mid - 1;
            else left = mid + 1;
        }
        return null;
    }

    /**
     * Selects a range of columns between startCol and endCol.
     * @param {number} startCol - The starting column index.
     * @param {number} endCol - The ending column index.
     */
    selectColumnRange(startCol, endCol) {
        this.clearSelection();
        const [first, last] = [Math.min(startCol, endCol), Math.max(startCol, endCol)];
        for (let col = first; col <= last; col++) {
            this.addColumnToSelection(col);
        }
    }

    /**
     * Adds a column to the current selection.
     * @param {number} col - The column index to add. 
     */
    addColumnToSelection(col) {
        this.selectedColumns.add(col);
    }

    /**
     * Removes a column from the current selection.
     * @param {number} col - The column index to remove. 
     */
    removeColumnFromSelection(col) {
        this.selectedColumns.delete(col);

    }

    /**
     * Clears all selected columns.
     */
    clearSelection() {
        this.selectedColumns.clear();
    }

    /**
     * Returns the currently selected columns as a sorted array.
     * @returns {number[]} Array of selected column indices.
     */
    getSelectedColumns() {
        return this.selectedColumns; // Return the Set directly
    }
}
