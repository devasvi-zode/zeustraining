/**
 * Class responsible for storing and managing values of individual cells 
 * in a grid-like structure using a Map.
 */
export class cell_data{
    /**
     * Initializes an empty map to store cell values.
     * the key format is "col, row" (e.g., "2,3").
     */
    constructor(){
        this.cellValues = new Map();
    }
    /**
     * Retireves the value stored at a specific cell.
     * 
     * @param {Number} col - the column index of the cell.
     * @param {Number} row - the row index of the cell.
     * @returns {*} the value stored at the given cell,or undefined if not set
     */
    getCellValue(col, row) {
        return this.cellValues.get(`${col},${row}`);
    }
    /**
     * Sets or updates the value stored at a specific cell.
     * 
     * @param {Number} col - the column index of the cell.
     * @param {Number} row - the row index of the cell.
     * @param {*} value the value to be stored in cell
     */
    setCellValue(col, row, value) {
        this.cellValues.set(`${col},${row}`, value);
    }
}