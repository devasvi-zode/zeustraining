import { ctx, canvas } from "./dom-elements.js";
import { TOTAL_COLS, TOTAL_ROWS } from "./config.js";

/**
 * Manages cell selection interactions within a grid.
 * Supports single cell selection and drag-based range selection.
 */
export class CellSelector {
    /**
     * Initializes the CellSelector.
     * @param {DimensionsManager} dimensions - Manages cell dimensions and scroll offsets
     * @param {SelectorManager} selectorManager - Coordinates exclusive selection state (cell/row/column).
     */
    constructor(dimensions, selectorManager, renderer) {
        this.dimensions = dimensions;
        this.manager = selectorManager;
        this.renderer = renderer;
        
        this.selectedCell = null;       // Currently focused cell (for editing)
        this.selectionStart = null;     // Start of selection range
        this.selectionEnd = null;       // End of selection range
        this.isSelecting = false;       // Whether we're actively dragging
        this.selectedRange = null;      // {startCol, startRow, endCol, endRow}
        
        this.hitTest = this.hitTest.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    /**
     * Determines whether the cell selector should become active based on pointer position.
     * Checks if the pointer is within the cell selection area. 
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {boolean} - Returns true if the cell selector should activate, false otherwise.
     */
    hitTest(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        const y = e.clientY - rect.top + this.dimensions.offsets.y;

        const col = this.findColumn(x);
        const row = this.findRow(y);

        if(col == null || col === 0 || row === null || row === 0) return false;

        return true;

    }

    /**
     * Handles mouse down event to initiate cell selection.
     * @param {MouseEvent} e - The mouse down event.
     * @returns 
     */
    handleMouseDown(e) {
        const { col, row } = this.getCellFromEvent(e);
        if (col === null || row === null || col === 0 || row === 0) return;
        
        console.log(`Cell selected at ${col},${row}`);

        this.isSelecting = true;
        this.selectionStart = { col, row };
        this.selectionEnd = { col, row };
        this.selectedCell = { col, row };
        this.selectedRange = null;
        this.renderer.drawGrid();
    }
    /**
     * Handles mouse move event to update cell selection range.
     * @param {MouseEvent} e - The mouse move event.
     */
    handleMouseMove(e) {
        if (!this.isSelecting) return;
        
        const { col, row } = this.getCellFromEvent(e);
        if (col === null || row === null || col === 0 || row === 0) return;
        
        this.selectionEnd = { col, row };
        this.selectedRange = this.normalizeRange(this.selectionStart, this.selectionEnd);

        //Keep the original cell as the selected cell even when the dragging starts
        this.selectedCell = this.selectionStart;

        // Trigger redraw (you'll need to modify your renderer)
        this.renderer.drawGrid();
    }
    
    /**
     * Handles mouse up event to finalize cell selection.
     */
    handleMouseUp() {
    if (this.isSelecting) {
        this.isSelecting = false;
        
        // Only create a range if we actually dragged
        if (this.selectionStart.col !== this.selectionEnd.col || 
            this.selectionStart.row !== this.selectionEnd.row) {
            this.selectedRange = this.normalizeRange(this.selectionStart, this.selectionEnd);
        } else {
            //clear range if just a click
            this.selectedRange = null;
        }
        this.selectedCell = this.selectionStart;
        
        this.renderer.drawGrid();
    }
    }
    /**
     * Sets a single selected cell.
     * @param {number} col - Column index.
     * @param {number} row - Row index.
     */
    setSelectedCell(col, row) {
        if (col === 0 || row === 0) return;

        this.selectedCell = { col, row };
        this.selectionStart = { col, row };
        this.selectionEnd = { col, row };
    }
    /**
     * 
     * @param {number} startCol - Starting column index.
     * @param {number} startRow - Starting row index.
     * @param {number} endCol - Ending column index.
     * @param {number} endRow - Ending row index.
     */
    setSelectedCellRange(startCol, startRow, endCol, endRow) {
        if (startCol === 0 || startRow === 0 || endCol === 0 || endRow === 0) return;

        this.selectionStart = { col: startCol, row: startRow };
        this.selectionEnd = { col: endCol, row: endRow };
        this.selectedCell = { col: endCol, row: endRow };
    }
    /**
     * Normalizes the selection range to always have start <= end
     * @param {number} start 
     * @param {number} end 
     * @returns 
     */
    normalizeRange(start, end) {
        return {
            startCol: Math.min(start.col, end.col),
            startRow: Math.min(start.row, end.row),
            endCol: Math.max(start.col, end.col),
            endRow: Math.max(start.row, end.row)
        };
    }
    
    /**
     * Checks if a cell is within the current selection range
     */
    isCellSelected(col, row) {
       //Check single cell selection
    if (this.selectedCell?.col === col && this.selectedCell?.row === row) {
        return true;
    }

    // Check range selection
    if (this.selectedRange) {
        const { startCol, startRow, endCol, endRow } = this.selectedRange;
        return col >= startCol && col <= endCol && 
               row >= startRow && row <= endRow;
    }
    
    return false
    }   

    /**
     * Clears the current cell selection.
     */
    clearSelection() {
        this.selectedCell = null;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectedRange = null;
        this.isSelecting = false;
        this.pendingClick = false;
    }
    /**
     * Gets the cell coordinates from a mouse event.
     * @param {EventListener} e - The mouse event.
     * @returns {{col: number|null, row: number|null}} The cell coordinates or null if not found.
     */
    getCellFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        const y = e.clientY - rect.top + this.dimensions.offsets.y;

        // Add bounds checking
        const col = Math.max(1, Math.min(TOTAL_COLS - 1, this.findColumn(x) || 1));
        const row = Math.max(1, Math.min(TOTAL_ROWS - 1, this.findRow(y) || 1));

        return { col, row };
    }
    /**
     * Returns the currently selected cell.
     * @returns {{col: number, row: number}|null} The selected cell or null.
     */
    getSelectedCell() {
        return this.selectedCell;
    }

    /**
     * Finds the column index based on horizontal position.
     * @param {number} x - Horizontal position.
     * @returns {number|null} Column index or null if not found.
     */
    findColumn(x) {
        let left = 0;
        let right = TOTAL_COLS - 1;
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
     * Finds the row index based on vertical position.
     * @param {number} y Vertical position.
     * @returns number|null} Row index or null if not found.
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
}