import { canvas, wrapper } from './dom-elements.js';
import { CELL_EDITING_STYLE, TOTAL_COLS, TOTAL_ROWS } from './config.js';
import { CellEditCommand } from './commands.js';

export class CellEditor {
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
    }

    setupCellEditing() {
        this.inputElement = document.createElement('input');
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

    handleCellClick(e) {
        const { col, row } = this.getCellFromEvent(e);
        if (col === null || row === null) return;

        this.startEditing(col, row);
    }
    handleCellDoubleClick(e) {
        const { col, row } = this.getCellFromEvent(e);
        if (col === null || row === null) return;

        this.startEditing(col, row);
    }

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

    startEditing(col, row) {
        this.activeCell = { col, row };
        this.c = col;
        this.v = row;
        this.renderer.setSelectedCell(col, row);
        //Position the input element over the cell
        const x = this.dimension.getColX(col);
        const y = this.dimension.getRowY(row);
        const width = this.dimension.colWidths[col];
        const height = this.dimension.rowHeights[row];

        if(x === 0 || y === 0) return;
        Object.assign(this.inputElement.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            display: `block`
        });

        //get current cell value 
        this.inputElement.value = this.cell_data.getCellValue(col, row) || '';
        this.inputElement.focus();
    }

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
        this.cell_data.setCellValue(this.activeCell.col, this.activeCell.row, this.inputElement.value);

        this.inputElement.style.display = 'none';
        this.activeCell = null;
        this.renderer.clearSelection();

        //Redraw grid to show updated value
        this.dimension.updateLayout();
        this.renderer.drawGrid();
    }

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
            // case "ArrowUp":
            //     console.log("Arrow Up");
            //    let {col_up, row_up} = this.activeCell;
            //    console.log("Active cell is :"+this.activeCell.col, this.activeCell.row);
            //     this.finishEditing();
            //     row_up = Math.max(0, row_up -1); //prevent going above first row
            //     this.startEditing(col_up, row_up);
            //     console.log("Active cell is :"+this.activeCell.col, this.activeCell.row);
            //     break;
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