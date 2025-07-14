import { ctx, canvas } from "./dom-elements.js";
import { TOTAL_COLS, TOTAL_ROWS , gridConfig} from "./config.js";

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
        this.handleKeyDown = this.handleKeyDown.bind(this);

        document.addEventListener('keydown', this.handleKeyDown);
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
        this.manager.lastSelectionType = 'cell';
        this.selectionStart = { col, row };
        this.manager.lastActiveCell = {row : this.selectionStart.row, col : this.selectionStart.col};
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
        this.manager.stats.updateStats();
        // Trigger redraw (you'll need to modify your renderer)
        this.renderer.drawGrid();
    }
    
    /**
     * Handles mouse up event to finalize cell selection.
     */
    handleMouseUp() {
    if (this.isSelecting) {
        this.isSelecting = false;
        this.manager.stats.updateStats();

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
        this.selectedRange = null; // Clear any range selection
        this.isSelecting = false;
        
        // Update last active cell in manager
        if (this.manager) {
            this.manager.lastActiveCell = { col, row };
            this.manager.lastSelectionType = 'cell';
        }
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
        const col = Math.max(1, Math.min(gridConfig.TOTAL_COLS - 1, this.findColumn(x) || 1));
        const row = Math.max(1, Math.min(gridConfig.TOTAL_ROWS - 1, this.findRow(y) || 1));

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
     * Finds the row index based on vertical position.
     * @param {number} y Vertical position.
     * @returns number|null} Row index or null if not found.
     */
    findRow(y) {
        let left = 0;
        let right = gridConfig.TOTAL_ROWS - 1;
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
     * Handles keyboard navigation for cell selection
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        // console.log('[CellSelector] Key pressed:', e.key);
        // Only handle arrow keys when not editing and we have a selected cell
        if (!this.selectedCell || this.manager.isEditing) return;
        
        // Check if any input elements are focused
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
        }

        
        let { col, row } = this.selectedCell;
        let newCol = col;
        let newRow = row;
        let handled = false;
        
        switch (e.key) {
            case 'ArrowUp':
                if (row > 1) {
                    newRow = row - 1;
                    handled = true;
                }
                break;
                
            case 'ArrowDown':
                if (row < gridConfig.TOTAL_ROWS - 1) {
                    newRow = row + 1;
                    handled = true;
                }
                break;
                
            case 'ArrowLeft':
                if (col > 1) {
                    newCol = col - 1;
                    handled = true;
                }
                break;
                
            case 'ArrowRight':
                if (col < gridConfig.TOTAL_COLS - 1) {
                    newCol = col + 1;
                    handled = true;
                }
                break;
                
            case 'Home':
                if (e.ctrlKey) {
                    // Ctrl+Home: Go to cell A1
                    newCol = 1;
                    newRow = 1;
                } else {
                    // Home: Go to beginning of row
                    newCol = 1;
                }
                handled = true;
                break;
                
            case 'End':
                if (e.ctrlKey) {
                    // Ctrl+End: Go to last cell with data or bottom-right corner
                    newCol = gridConfig.TOTAL_COLS - 1;
                    newRow = gridConfig.TOTAL_ROWS - 1;
                } else {
                    // End: Go to end of row
                    newCol = gridConfig.TOTAL_COLS - 1;
                }
                handled = true;
                break;
                
            case 'PageUp':
                // Move up by visible rows (approximately)
                newRow = Math.max(1, row - 10);
                handled = true;
                break;
                
            case 'PageDown':
                // Move down by visible rows (approximately)
                newRow = Math.min(gridConfig.TOTAL_ROWS - 1, row + 10);
                handled = true;
                break;
        }
        
        if (handled) {
            e.preventDefault();
            
            // Handle range selection with Shift key
            if (e.shiftKey && this.selectionStart) {
                this.selectionEnd = { col: newCol, row: newRow };
                this.selectedRange = this.normalizeRange(this.selectionStart, this.selectionEnd);
                this.selectedCell = { col: newCol, row: newRow };
            } else {
                // Single cell selection
                this.setSelectedCell(newCol, newRow);
            }
            
            // Ensure the new cell is visible (you may need to implement scrolling)
            this.ensureCellVisible(newCol, newRow);
            
            // Update manager state
            this.manager.lastActiveCell = { col: newCol, row: newRow };
            this.manager.lastSelectionType = 'cell';
            
            // Redraw the grid
            this.renderer.drawGrid();
        }
    }
    
    /**
     * Ensures the specified cell is visible in the viewport
     * @param {number} col - Column index
     * @param {number} row - Row index
     */
    ensureCellVisible(col, row) {
        // This is a basic implementation - you may need to adjust based on your scrolling logic
        const cellX = this.dimensions.getColX(col);
        const cellY = this.dimensions.getRowY(row);
        const cellWidth = this.dimensions.colWidths[col];
        const cellHeight = this.dimensions.rowHeights[row];
        
        // Get viewport bounds (you'll need to adjust these based on your canvas size)
        const viewportWidth = canvas.width;
        const viewportHeight = canvas.height;
        
        // Calculate visible area considering current offsets
        const visibleLeft = this.dimensions.offsets.x;
        const visibleTop = this.dimensions.offsets.y;
        const visibleRight = visibleLeft + viewportWidth;
        const visibleBottom = visibleTop + viewportHeight;
        
        // Check if cell is outside visible area and adjust offsets
        if (cellX < visibleLeft) {
            this.dimensions.offsets.x = cellX;
        } else if (cellX + cellWidth > visibleRight) {
            this.dimensions.offsets.x = cellX + cellWidth - viewportWidth;
        }
        
        if (cellY < visibleTop) {
            this.dimensions.offsets.y = cellY;
        } else if (cellY + cellHeight > visibleBottom) {
            this.dimensions.offsets.y = cellY + cellHeight - viewportHeight;
        }
    }

    /**
     * Cleanup method to remove event listeners
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }
}