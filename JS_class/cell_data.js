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

    /**
     * Shifts all cell data below `insertAt` downward by `n` rows.
     * @param {number} insertAt - The row index where new rows are inserted.
     * @param {number} n - Number of rows inserted.
     */
    shiftRowsDown(insertAt, n) {
        const newMap = new Map();
        
        this.cellValues.forEach((value, key) => {
            const [col, row] = key.split(',').map(Number);
            if (row >= insertAt) {
                // Shift rows below insertion point down by `n`
                newMap.set(`${col},${row + n}`, value);
            } else {
                // Keep rows above insertion point unchanged
                newMap.set(key, value);
            }
        });
        
        this.cellValues = newMap;
    }

    /**
     * Shifts all cell data above `removeAt` upward by `n` rows.
     * @param {number} removeAt - The row index where rows were removed
     * @param {number} n - Number of rows removed
     */
    shiftRowsUp(removeAt, n) {
        const newMap = new Map();
        
        this.cellValues.forEach((value, key) => {
            const [col, row] = key.split(',').map(Number);
            if (row >= removeAt + n) {
                // Shift rows below removal point up by `n`
                newMap.set(`${col},${row - n}`, value);
            } else if (row < removeAt) {
                // Keep rows above removal point unchanged
                newMap.set(key, value);
            }
            // Rows in the removed range (removeAt to removeAt+n-1) are discarded
        });
        
        this.cellValues = newMap;
    }

    /**
     * Shifts all cell data after `insertAt` rightward by `n` columns.
     * @param {number} insertAt - The column index where new columnss are inserted.
     * @param {number} n - Number of columns inserted.
     */
    shiftColumnsRight(insertAt, n){
        const newMap = new Map();

        this.cellValues.forEach((value, key) => {
            const [col, row] = key.split(',').map(Number);
            if (col >= insertAt) {
                //Shift columns after insertion point by 'n'
                newMap.set(`${col+n},${row}`, value);
            } else {
                //Keep columns before insertion point unchanged
                newMap.set(key, value);
            }
        });

        this.cellValues = newMap;
    }

    /**
     * Shifts all cell data before `removeAt` leftward by `n` columnss.
     * @param {number} removeAt - The column index where columnss were removed
     * @param {number} n - Number of columns removed
     */
    shiftColumnsLeft(removeAt, n) {
        const newMap = new Map();

        this.cellValues.forEach((value, key) => {
            const [col, row] = key.split(',').map(Number);
            if(col >= removeAt+n){
                //Shift rows after removal point by `n`
                newMap.set(`${col-n},${row}`, value);
            } else if(col < removeAt) {
                //Keep columns before removal point unchanged
                newMap.set(key, value);
            }
        });

        this.cellValues = newMap;
    }    
}