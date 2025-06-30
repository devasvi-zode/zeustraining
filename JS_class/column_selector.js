// column-selector.js
import { ColumnSelectCommand } from './commands.js';
import {ctx, canvas } from './dom-elements.js';
import { CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from './config.js';

export class ColumnSelector {
    constructor(dimensionsManager, renderer, commandManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.commandManager = commandManager;
        this.selectedColumn = null;
        this.prevSelectedColumn = null;
        this.lastSelectedColumn = null;
        this.isShiftPressed = false;

        // Bind methods
        this.handleColumnHeaderClick = this.handleColumnHeaderClick.bind(this);
    }

    setupColumnSelection() {
        // Listen for clicks on column headers
        canvas.addEventListener('click', this.handleColumnHeaderClick, true);
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleColumnHeaderClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        
        // Check if click is in header area (first row)
        if (e.clientY - rect.top > CELL_HEIGHT) return;

        const col = this.findColumn(x);
        if (col !== null) {
            this.selectColumn(col, true);
        }
    }

    selectColumn(col, trackCommand = false) {
    if (col === this.selectedColumn) return;

    this.prevSelectedColumn = this.selectedColumn;
    this.selectedColumn = col;

    if (trackCommand) {
        const command = new ColumnSelectCommand(
            this,
            this.prevSelectedColumn,
            this.selectedColumn
        );
        this.commandManager.execute(command);
    }

    // Update renderer's selected column directly
    this.renderer.selectedColumn = col;
    this.renderer.drawGrid();
    }

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

    selectColumnRange(startCol, endCol) {
        this.renderer.clearColumnSelection();
        const [first, last] = [Math.min(startCol, endCol), Math.max(startCol, endCol)];

        for (let col = first; col <= last; col++) {
            this.renderer.addSelectedColumn(col);
        }

        this.lastSelectedColumn = endCol;
    }



    handleKeyDown(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = true;
        }
    }

    handleKeyUp(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = false;
        }
    }

    handleColumnHeaderClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimensions.offsets.x;
        
        if (e.clientY - rect.top > CELL_HEIGHT) return;

        const col = this.findColumn(x);
        if (col === null) return;

        if (this.isShiftPressed && this.lastSelectedColumn !== null) {
            // Select range of columns
            this.selectColumnRange(this.lastSelectedColumn, col);
        } else {
            // Toggle single column selection
            if (this.renderer.selectedColumns.has(col)) {
                this.renderer.removeSelectedColumn(col);
            } else {
                this.renderer.addSelectedColumn(col);
            }
            this.lastSelectedColumn = col;
        }
    }

}