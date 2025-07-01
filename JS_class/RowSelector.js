import { ctx, canvas } from './dom-elements.js';
import { CELL_HEIGHT,  TOTAL_ROWS , CELL_WIDTH} from './config.js';

/**
 * Manages row selection logic in a grid interface.
 * Handles mouse interactions on the row headers to allow for
 * single and multi-row selections, including shift-click and drag.
 */
export class RowSelector {
    /**
     * 
     * @param {DimensionsManager} dimensionsManager - Manages row and column dimensions and scroll offsets.
     * @param {Renderer} renderer - Responsible for rendering the grid and selection highlights.
     * @param {CommandManager} commandManager - Manages undo/redo 
     */
    constructor(dimensionsManager, renderer, commandManager) {
        this.dimensions = dimensionsManager; // Make sure this is passed correctly
        this.renderer = renderer;
        this.commandManager = commandManager;
        this.selectedRows = new Set();
        this.lastSelectedRow = null;
        this.isShiftPressed = false;
        this.isMouseDown = false;
        this.dragStartRow = null;

        // Bind event handler methods to the instance
        this.handleRowHeaderMouseDown = this.handleRowHeaderMouseDown.bind(this);
        this.handleRowHeaderMouseMove = this.handleRowHeaderMouseMove.bind(this);
        this.handleRowHeaderMouseUp = this.handleRowHeaderMouseUp.bind(this);
    }

    /**
     * Attaches event listeners to handle row header interaction.
     */
    setupRowSelection() {
        canvas.addEventListener('mousedown', this.handleRowHeaderMouseDown, true);
        canvas.addEventListener('mousemove', this.handleRowHeaderMouseMove, true);
        canvas.addEventListener('mouseup', this.handleRowHeaderMouseUp, true);
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handles mouse down event on the row header.
     * Begins selection or drag operation depending on modifier keys.
     * @param {MouseEvent} e - The mouse down event.
     * @returns 
     */
    handleRowHeaderMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        // Make sure dimensions and offsets exist
        if (!this.dimensions || !this.dimensions.offsets) {
            console.error('Dimensions manager not properly initialized');
            return;
        }
        
        const y = e.clientY - rect.top + this.dimensions.offsets.y;
        
        // Check if click is in header area (first column)
        if (e.clientX - rect.left > CELL_WIDTH) return;

        const row = this.findRow(y);
        if (row !== null) {
            this.isMouseDown = true;
            this.dragStartRow = row;
            
            // Clear previous selection if not holding Ctrl/Cmd
            if (!e.ctrlKey && !e.metaKey) {
                this.clearSelection();
            }
            
            // Add the initial row to selection
            this.addRowToSelection(row);
            this.lastSelectedRow = row;
            this.renderer.drawGrid();
        }
    }

    /**
     * Handles mouse move event while selecting rows via drag.
     * @param {MouseEvent} e - The mouse move event.
     * @returns 
     */
    handleRowHeaderMouseMove(e) {
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
     * Handles mouse up event to complete the drag selection.
     * @param {MouseEvent} e - The mouse up event
     */
    handleRowHeaderMouseUp(e) {
        this.isMouseDown = false;
        this.dragStartRow = null;
    }

    /**
     * 
     * @param {number} y - The Y-coordinate in the canvas.
     * @returns {number|null} The row index or null if not found.
     */
    findRow(y) {
        // Binary search through cumulativeRowHeights
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
     * Selects a continous range of rows between tow indices.
     * @param {number} startRow - The start index of the selection.
     * @param {number} endRow - the end index of the selection.
     */
    selectRowRange(startRow, endRow) {
        this.clearSelection();
        const [first, last] = [Math.min(startRow, endRow), Math.max(startRow, endRow)];

        for (let row = first; row <= last; row++) {
            this.addRowToSelection(row);
        }
    }

    /**
     * Adds a row to the selection set and updates the renderer.
     * @param {number} row - The row index to select.
     */
    addRowToSelection(row) {
        this.selectedRows.add(row);
        this.renderer.addSelectedRow(row);
    }

    /**
     * Removes a row from the selection set and updates the renderer.
     * @param {number} row - The row index to deselect.
     */
    removeRowFromSelection(row) {
        this.selectedRows.delete(row);
        this.renderer.removeSelectedRow(row);
    }

    /**
     * Clears all selected rows and updates the renderer.
     */
    clearSelection() {
        this.selectedRows.clear();
        this.renderer.clearRowSelection();
    }

    /**
     * Handles key down event to detect when Shift is pressed.
     * @param {KeyboardEvent} e - The keydown event.
     */
    handleKeyDown(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = true;
        }
    }

    /**
     * Handles key up event to reset Shift key state.
     * @param {KeyboardEvent} e - The keyup event.
     */
    handleKeyUp(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = false;
        }
    }
}