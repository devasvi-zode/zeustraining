export class cell_data{

    constructor(){
        this.cellValues = new Map();
    }

    getCellValue(col, row) {
        return this.cellValues.get(`${col},${row}`);
    }

    setCellValue(col, row, value) {
        this.cellValues.set(`${col},${row}`, value);
    }
}