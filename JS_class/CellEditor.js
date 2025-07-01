import { canvas, wrapper } from './dom-elements.js';
import { CELL_EDITING_STYLE, TOTAL_COLS, TOTAL_ROWS } from './config.js';
import { CellEditCommand } from './commands.js';

/**
 * Manages cell editing in a grid interface. Handles input display,
 * user interactions, cel updates, and undo/redo via commands.
 */
export class CellEditor {
    /**
     * Creates a new CellEditor instance.
     * 
     * @param {DimensionsManager} dimensionsManager - Provides layout and position data for columns and rows.
     * @param {Renderer} renderer - Handles rendering and selection visualization.
     * @param {cell_data} cell_data - Manages the actual data stored in cells.
     * @param {CommandManager} commandManager - Manages command execution and history (undo/redo).
     */
    constructor(dimensionsManager, renderer, cell_data,commandManager) {
        this.dimension = dimensionsManager;
        this.renderer = renderer;
        this.cell_data = cell_data;
        this.commandManager = commandManager;

        this.activeCell = null;
        this.inputElement = null;
        this.c = null;
        this.r = null;

        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellDoubleClick = this.handleCellDoubleClick.bind(this);
        this.finishEditing = this.finishEditing.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.inputElement = document.createElement('input');
        this.setupCellEditing();

        this.renderer.registerCellEditor(this);
    }
    /**
     * Initializes the input element used for editing and attaches all necessary event listners.
     */
    setupCellEditing() {
        Object.assign(this.inputElement.style, {
            position: "absolute",
            display: 'none',
            ...CELL_EDITING_STYLE
        });

        wrapper.appendChild(this.inputElement);

        canvas.addEventListener('click', this.handleCellClick);
        canvas.addEventListener('dblclick', this.handleCellDoubleClick);
        this.inputElement.addEventListener('blur', this.finishEditing);
        this.inputElement.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Handles single click on a cell and starts editing it to change that now 
     * @param {MouseEvent} e - Mouse click event.
     * 
     */
    handleCellClick(e) {
        const { col, row } = this.getCellFromEvent(e);
        if (col === null || row === null) return;

            this.renderer.setSelectedCell(col, row); // ← highlight selection
    this.renderer.drawGrid(); 
    }
    
    /**
     * 
     * @param {MouseEvent} e - Mouse double-click event.
     * 
     */
    handleCellDoubleClick(e) {
        const { col, row } = this.getCellFromEvent(e);
        if (col === null || row === null) return;

        this.startEditing(col, row);
    }

    /**
     * Calculates the cell column and row based on mouse coordinates.
     * @param {MouseEvent} e - Mouse Event
     * @returns {{col: Number|null , row: Number|null}} the column and row indices, or null if not found
     */
    getCellFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.dimension.offsets.x;
        const y = e.clientY - rect.top +this.dimension.offsets.y;

        //find which cell was clicked
        return {
            col: this.findColumn(x),
            row: this.findRow(y)
        }
    }

    /**
     * Peforms a binary search to find the column index for a given x coordnate
     * 
     * @param {Number} x - the x position relative to the grid. 
     * @returns {Number | null} the column index, or null if not found
     */
    findColumn(x) {
        //Binary search throught cumulativeColWidths
        let left = 0;
        let right = TOTAL_COLS - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const colStart = this.dimension.getColX(mid);
            const colEnd = colStart + this.dimension.colWidths[mid];

            if (x >= colStart && x < colEnd) return mid;
            if (x < colStart) right = mid - 1;
            else left = mid + 1;
        }
        return null;
    }

    /**
     * Performs a binary search to find the row index for a given y coordinate.
     * 
     * @param {Number} y - the y position relative to the grid.
     * @returns {Number|null} the row index, or null if not found
     */
    findRow(y) {
        //Binary search throught cumulativeRowHeights
        let left = 0;
        let right = TOTAL_ROWS - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const rowStart = this.dimension.getRowY(mid);
            const rowEnd = rowStart + this.dimension.rowHeights[mid];

            if (y >= rowStart && y < rowEnd) return mid;
            if (y < rowStart) right = mid - 1;
            else left = mid + 1;
        }
        return null;
    }


    /**
     * Initiates editing for a specific cell by displaying the input element.
     * 
     * @param {Number} col - the colum index.
     * @param {*} row - the row index.
     */
    startEditing(col, row) {
        this.activeCell = { col, row };
        this.c = col;
        this.v = row;
        this.renderer.setSelectedCell(col, row);
        this.renderer.updateInputBoxPosition(); 

        //get current cell value 
        this.inputElement.value = this.cell_data.getCellValue(col, row) || '';
        this.inputElement.focus();
    }

    /**
     * Finalizes editing of the current acive cell.
     * If the value changed, a command is created and executed for undo/redo tracking
     */
    finishEditing() {
        if (!this.activeCell) return;

        const {col, row} = this.activeCell;
        const newValue = this.inputElement.value;
        const currentValue = this.cell_data.getCellValue(col, row) || '';
        
        //only create and execute command if value actually changed
        if(newValue !== currentValue){
            const command = new CellEditCommand(
                this.cell_data,
                col,
                row,
                newValue
            );
            this.commandManager.execute(command);
        }else {
            //just hide the input if no change 
            this.inputElement.style.display = 'none';
            this.activeCell = null;
            this.renderer.clearSelection();
        }
        //Save the value 
        this.cell_data.setCellValue(col, row, this.inputElement.value);

        this.inputElement.style.display = 'none';
        this.activeCell = null;
        this.renderer.clearSelection();

        //Redraw grid to show updated value
        this.dimension.updateLayout();
        this.renderer.drawGrid();
    }

    /**
     * Handles keyboard events during editing, including Enter, Escape, and arrow navigation.
     * @param {KeyboardEvent} e - Keyboard event 
     */
    handleKeyDown(e) {
        switch(e.key){
            case "Enter" :
                this.finishEditing();
                break;
            case "Escape":
                if(this.activeCell){
                    this.inputElement.value = this.cell_data.getCellValue(
                        this.activeCell.col, this.activeCell.row
                    ) || '';
                }
                this.finishEditing();
                break;
            case "ArrowUp":
                this.finishEditing();
                this.v = Math.max(1, this.v - 1);
                this.startEditing(this.c, this.v);
                break;
            case "ArrowDown":
                this.finishEditing();
                this.v = Math.min(TOTAL_ROWS - 1, this.v + 1);
                this.startEditing(this.c, this.v);
                break;
            case "ArrowLeft":
                this.finishEditing();
                this.c = Math.max(1, this.c - 1);
                this.startEditing(this.c, this.v);
                break;
            case "ArrowRight":
                this.finishEditing();
                this.c = Math.min(TOTAL_COLS - 1, this.c + 1);
                this.startEditing(this.c, this.v);
                break;
        }

    }


}