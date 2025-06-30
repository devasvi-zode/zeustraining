export class ResizedColumnCommand {
    constructor(dimensionsManager, col, newWidth){
        this.dimensions = dimensionsManager;
        this.col = col;
        this.newWidth = newWidth;
        this.previousWidth = dimensionsManager.colWidths[col];
    }

    execute(){
        this.dimensions.colWidths[this.col] = this.newWidth;
        this.dimensions.updateLayout();
    }

    undo(){
        this.dimensions.colWidths[this.col] = this.previousWidth;
        this.dimensions.updateLayout();
    }
}

export class ResizedRowCommand {
    constructor(dimensionsManager, row, newHeight){
        this.dimensions = dimensionsManager;
        this.row = row;
        this.newHeight = newHeight;
        this.previousHeight = dimensionsManager.rowHeights[row];
    }

    execute(){
        this.dimensions.rowHeights[this.row] = this.newHeight;
        this.dimensions.updateLayout();
    }

    undo(){
        this.dimensions.rowHeights[this.row] = this.previousHeight;
        this.dimensions.updateLayout();
    }
}

export class CellEditCommand {
    constructor(cellData, col, row, newValue) {
        this.cellData = cellData;
        this.col = col;
        this.row = row;
        this.newValue = newValue;
        this.previousValue = cellData.getCellValue(col, row);
    }

    execute() {
        this.cellData.setCellValue(this.col, this.row, this.newValue);
    }

    undo() {
        this.cellData.setCellValue(this.col, this.row, this.previousValue);
    }
}

export class ColumnSelectCommand {
    constructor(selectionManager, prevSelection, newSelection) {
        this.selectionManager = selectionManager;
        this.prevSelection = prevSelection;
        this.newSelection = newSelection;
    }

    execute(){
        this.selectionManager.selectColumn(this.newSelection);
    }
    undo(){
        this.selectionManager.selectColumn(this.prevSelection);
    }
}