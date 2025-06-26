export class ResizedColumnCommand {
    constructor(dimensionsManager, col, newWidth){
        this.dimensions = dimensionsManager;
        this.col = col;
        this.newWidth = newWidth;
        this.previousWidth = dimensionsManager.colWidhts[col];
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