import { ColumnSelectCommand } from './commands.js';
import { ctx, canvas } from './dom-elements.js';
import { CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from './config.js';

/**
 * Manages column selection logic in a grid interface.
 * Handles mouse interactions on the column headers to allow for
 * single and multi-column selections, including shift-click and drag.
 */
export class ColumnSelector {
    /**
     * 
     * @param {DimensionsManager} dimensionsManager - Provides access to column and row dimensions and scroll offsets.
     * @param {Renderer} renderer - Handles rendering of the grid and selection highlights.
     * @param {CommandManager} commandManager - Manages undo/redo commands (optional use).
     */
    constructor(dimensionsManager, renderer, commandManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.commandManager = commandManager;

        this.selectedColumns = new Set();       // Tracks selected column indices
        this.lastSelectedColumn = null;         // Last column interacted with
        this.isShiftPressed = false;            // True while Shift key is pressed
        this.isMouseDown = false;               // True during mouse drag selection
        this.dragStartColumn = null;            // Starting column index for drag selection

        // Bind handler methods to the instance
        this.handleColumnHeaderMouseDown = this.handleColumnHeaderMouseDown.bind(this);
        this.handleColumnHeaderMouseUp = this.handleColumnHeaderMouseUp.bind(this);
        this.handleColumnHeaderMouseMove = this.handleColumnHeaderMouseMove.bind(this);
        this.handleColumnHeaderClick = this.handleColumnHeaderClick.bind(this);
    }

    /**
     * Attaches event listeners to enable column selection functionality.
     */
    setupColumnSelection() {
        // Listen for mouse events on column headers
        canvas.addEventListener('mousedown', this.handleColumnHeaderMouseDown, true);
        window.addEventListener('mouseup', this.handleColumnHeaderMouseUp, true);
        window.addEventListener('mousemove', this.handleColumnHeaderMouseMove, true);
        canvas.addEventListener('click', this.handleColumnHeaderClick, true);
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handles mouse down event on a column header to initiate selection.
     * @param {MouseEvent} e - The mouse down event.
     * @returns 
     */
    handleColumnHeaderMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        
        // Check if click is in header area (first row)
        if (e.clientY - rect.top > CELL_HEIGHT) return;

        const col = this.findColumn(x);
        if (col !== null) {
            this.isMouseDown = true;
            this.dragStartColumn = col;
            
            // Clear previous selection if not holding Ctrl/Cmd
            if (!e.ctrlKey && !e.metaKey) {
                this.clearSelection();
            }
            
            // Add the initial column to selection
            this.addColumnToSelection(col);
            this.lastSelectedColumn = col;
            this.renderer.drawGrid();
        }
    }

    /**
     * Handles mouse move event for drag-based column selection.
     * @param {MouseEvent} e - The mouse move event.
     * @returns 
     */
    handleColumnHeaderMouseMove(e) {
        if (!this.isMouseDown) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        const col = this.findColumn(x);
        
        if (col !== null && col !== this.lastSelectedColumn) {
            this.selectColumnRange(this.dragStartColumn, col);
            this.lastSelectedColumn = col;
            this.renderer.drawGrid();
        }
    }

    /**
     * Handles mouse up event to end the column drag selection.
     * @param {MouseEvent} e - The mouse up event.
     */
    handleColumnHeaderMouseUp(e) {
        this.isMouseDown = false;
        this.dragStartColumn = null;
    }

    /**
     * Prevents click behavior if a drag selection just occurred.
     * @param {MouseEvent} e - The mouse click event.
     */
    handleColumnHeaderClick(e) {
        // Prevent click event from firing after drag operation
        if (this.lastSelectedColumn !== null && 
            this.selectedColumns.size > 1) {
                // Suppress single click behavior post drag
                return;
        }
    }

    /**
     * Finds the column index based on X-coordinate in the canvas.
     * Uses binary search for performance.
     * @param {number} x - The X-coordinate relative to the canvas.
     * @returns {number|null} - The column index or null if not found.
     */
    findColumn(x) {
        // Binary search through cumulativeColWidths
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
     * Selects a range of columns from startCol to endCol, inclusive.
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
     * Adds a column to the current selection and updates the view.
     * @param {number} col - The column index to add.
     */
    addColumnToSelection(col) {
        this.selectedColumns.add(col);
        this.renderer.addSelectedColumn(col);
    }

    /**
     * Removes a column from the selection and updates the view.
     * @param {number} col - The column index to remove.
     */
    removeColumnFromSelection(col) {
        this.selectedColumns.delete(col);
        this.renderer.removeSelectedColumn(col);
    }

    /**
     * Clears all selected columns and refreshes the renderer.
     */
    clearSelection() {
        this.selectedColumns.clear();
        this.renderer.clearColumnSelection();
    }

    /**
     * Sets internal flag when Shift key is pressed.
     * @param {KeyboardEvent} e - The keydown event.
     */
    handleKeyDown(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = true;
        }
    }

    /**
     * Unsets internal flag when Shift key is released.
     * @param {KeyboardEvent} e - The keyup event.
     */
    handleKeyUp(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = false;
        }
    }
}