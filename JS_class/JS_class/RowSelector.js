import { ctx, canvas } from './dom-elements.js';
import { CELL_HEIGHT, TOTAL_ROWS, CELL_WIDTH } from './config.js';

export class RowSelector {
    /**
     * Creates a RowSelector instance to manage row selection interactions.
     * @param {DimensionsManager} dimensionsManager - Manages row and column dimensions and scroll offsets.
     * @param {Renderer} renderer - Responsible for rendering the grid and selection highlights.
     * @param {SelectorManager} selectorManager - Coordinates exclusive selection state (cell/row/column).
     */
    constructor(dimensionsManager, selectorManager, renderer) {
        this.dimensions = dimensionsManager;
        this.selectorManager = selectorManager;
        this.renderer = renderer;

        this.selectedRows = new Set();
        this.firstSelectedRow = null;
        this.lastSelectedRow = null;
        this.isShiftPressed = false;
        this.isMouseDown = false;
        this.dragStartRow = null;

        this.hitTest = this.hitTest.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * Determines whether the row selector should become active based on pointer position.
     * Checks if the pointer is within the row selection area and not too close to the row boundary. 
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {boolean} - Returns true if the row selector should activate, false otherwise.
     */
    hitTest(e) {

        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top + this.dimensions.offsets.y;

        if ( e.clientX - rect.left > CELL_WIDTH ) return false;

        const row = this.findRow(y);
        const rowStart = this.dimensions.getRowY(row);
        const rowEnd = rowStart + this.dimensions.rowHeights[row];
        if(row !== null && row !== 0 && Math.abs( y - rowEnd ) >= 8) return true;
    }

    /**
     * Determines the appropriate cursor style based on pointer position.
     * Used to visually indicate row selection capability when hovering near row boundaries.
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {string | null} - Returns a custom cursor style string or null if no change is needed.
     */
    getCursor(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalHeight = canvas.height / dpr;

        const startRow = this.renderer.getStartRow(this.dimensions.offsets.y);
        const endRow = this.renderer.getEndRow(this.dimensions.offsets.y, logicalHeight);

        //Check for row select cursor
        for(let row = startRow; row < endRow; row++){
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if(e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) >= 8){
                return  'url(icons8-arrow-15.png) 15 15, grab';
            }
        }
        return null;
    }

    /**
     * Handles mouse down event on the row header to initiate row selection.
     * @param {MouseEvent} e - the mosue down event.
     */
    handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top + this.dimensions.offsets.y;
       
        // Only proceed if clicking within the row header area (first column)
        if (e.clientX - rect.left > CELL_WIDTH) return;

        const row = this.findRow(y);
        //  if (row === null || row === 0) return;
        if (row !== null) {
            this.firstSelectedRow = row;
            this.isMouseDown = true;
            this.dragStartRow = row;

            if (!e.ctrlKey && !e.metaKey) {
                this.clearSelection();
            }

            this.addRowToSelection(row);
            this.lastSelectedRow = row;
            this.renderer.drawGrid();
            //e.stopPropagation(); // Prevent other handlers from interfering
        }
    }
    /**
     * Handles mouse move event to update row selection during drag.
     * @param {MouseEvent} e The mouse move event
     */
    handleMouseMove(e) {
        if (!this.isMouseDown) return;

        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top + this.dimensions.offsets.y;
        const row = this.findRow(y);

        if (row !== null && row !== this.lastSelectedRow) {
            this.selectRowRange(this.dragStartRow, row);
            this.lastSelectedRow = row;
            this.renderer.drawGrid();
        }
    }

    /**
     * Handles mouse up event to finalize row selection.
     * @param {MouseEvent} e The mouse up event.
     */
    handleMouseUp(e) {
        this.isMouseDown = false;
        this.dragStartRow = null;
        this.renderer.drawGrid();
    }
    /**
     * Finds the row index based on the vertical position.
     * @param {number} y - The vertical position relative to the canvas.
     * @returns {number|null} The row index or null if not found.
     */
    findRow(y) {
        let left = 0;
        let right = TOTAL_ROWS - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const rowStart = this.dimensions.getRowY(mid);
            const rowEnd = rowStart + this.dimensions.rowHeights[mid];

            if (y >= rowStart && y < rowEnd) return mid;
            if (y < rowStart) right = mid - 1;
            else left = mid + 1;
        }
        return null;
    }
    /**
     * Selects a range of rows between startRow and endRow.
     * @param {number} startRow - The starting row index.
     * @param {number} endRow - The ending row index.
     */
    selectRowRange(startRow, endRow) {
        this.clearSelection();
        const [first, last] = [Math.min(startRow, endRow), Math.max(startRow, endRow)];
        for (let row = first; row <= last; row++) {
            this.addRowToSelection(row);
        }
    }
    /**
     * Adds a row to the current selection.
     * @param {number} row - The row index to add.
     */
    addRowToSelection(row) {
        this.selectedRows.add(row);

    }
    /**
     * Removes a row from the current selection.
     * @param {number} row - The row index to remove.
     */
    removeRowFromSelection(row) {
        this.selectedRows.delete(row);

    }
    /**
     * Clears all selected rows.
     */
    clearSelection() {
        this.selectedRows.clear();
    }
    /**
     * Returns the currently selected rows as a sorted array.
     * @returns {number[]} Array of selected row indices.
     */
    getSelectedRows() {
        return this.selectedRows; // Return the Set directly
}
    /**
     * Handles key down events to track Shift key state.
     * @param {KeyboardEvent} e - The key down event.
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
}