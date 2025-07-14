import { gridConfig } from "./config.js";

/**
 * Stats class is responsible for calculating statistical data (count, min, max, sum, avg)
 * based on the user's selection in a grid-like interface.
 */
export class Stats {
    /**
     * Initializes the Stats class with required managers and data store.
     * @param {DimensionsManager} dimensionsManager - Manages grid dimensions.
     * @param {Renderer} renderer - Responsible for rendering UI components.
     * @param {SelectorManager} selectorManager - Manages selection of rows, columns, or cells.
     * @param {cell_data} dataStore - Stores and provides access to cell data.
     */
    constructor(dimensionsManager, renderer, selectorManager, dataStore) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.selectorManager = selectorManager;
        this.dataStore = dataStore;
    }

    /**
     * Updates the statistics displayed in the UI based on the current selection.
     * Determines the selected range and calculates count, min, max, sum, and average.
     */
    updateStats() {
        const activeType = this.selectorManager.lastSelectionType;
        if (!activeType) return;

        let rowStart, rowEnd, colStart, colEnd;

        const { rowSelector, columnSelector, cellSelector } = this.selectorManager;

        //Helper function to sort two values in ascending order
        const sortRange = (a,b) => [Math.min(a,b), Math.max(a,b)];

        if (activeType === 'row') {
            [rowStart, rowEnd] = sortRange(rowSelector.firstSelectedRow, rowSelector.lastSelectedRow);
            colStart = 1;
            colEnd = gridConfig.TOTAL_COLS;
        
        } else if (activeType === 'column') {
                rowStart = 1;
                rowEnd = gridConfig.TOTAL_ROWS;
                [colStart, colEnd] = sortRange(columnSelector.firstSelectedColumn, columnSelector.lastSelectedColumn);

        } else if (activeType === 'cell' && cellSelector.selectedRange) {
            const { selectionStart, selectionEnd } = cellSelector;
            [rowStart, rowEnd] = sortRange(selectionStart.row, selectionEnd.row);
            [colStart, colEnd] = sortRange(selectionStart.col, selectionEnd.col);
        }

        // Update UI elements with calculated statistics
        const count = document.getElementById('count');
        const min = document.getElementById('min');
        const max = document.getElementById('max');
        const sum = document.getElementById('sum');
        const avg = document.getElementById('avg');

        count.innerText = `${this.calculate_count(rowStart, rowEnd, colStart, colEnd)}`;
        if (this.hasNumericData(rowStart, rowEnd, colStart, colEnd)) {
            min.innerText = `${this.calculate_min(rowStart, rowEnd, colStart, colEnd)}`;
            max.innerText = `${this.calculate_max(rowStart, rowEnd, colStart, colEnd)}`;
            sum.innerText = `${this.calculate_sum(rowStart, rowEnd, colStart, colEnd)}`;
            avg.innerText = `${this.calculate_avg(rowStart, rowEnd, colStart, colEnd)}`;
        } else{
            min.innerText = max.innerText = sum.innerText = avg.innerText = '';
        }
    }

    /**
     * Counts the number of non-empty cells in the selected range.
     * @param {number} rowStart - The starting row index of the selection.
     * @param {number} rowEnd - The ending row index of the selection.
     * @param {number} colStart - The starting column index of the selection.
     * @param {number} colEnd - The ending column index of the selection.
     * @returns {number|string} - The count of non-empty cells. Returns an empty string if count is zero.
     */
    calculate_count(rowStart, rowEnd, colStart, colEnd){
        let count = 0;
        for(let row = rowStart; row <= rowEnd; row++) {
            for(let col = colStart; col <= colEnd; col++) {
                if(this.dataStore.getCellValue(col, row)){
                    count += 1;
                }
            }
        }
        return count === 0 ? '' : `Count : ${count}`;
    }

    /**
     * Finds the minimum numeric value in the selected range
     * @param {number} rowStart - The starting row index of the selection.
     * @param {number} rowEnd - The ending row index of the selection.
     * @param {number} colStart - The starting column index of the selection.
     * @param {number} colEnd - The ending column index of the selection.
     * @returns {number|string} - The minimum numeric value. Returns an empty string if minimum is zero.
     */
    calculate_min(rowStart, rowEnd, colStart, colEnd) {
        let mini = Infinity;
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                const value = this.dataStore.getCellValue(col, row);
                const num = parseFloat(value);

                if (!isNaN(num)) {
                    if (mini > num) {
                        mini = num;
                    }
                }
            }
        }
        return mini === Infinity ? '' : `Minimum : ${mini}`;
    }

    /**
     * Finds the maximum numeric value in the selected range
     * @param {number} rowStart - The starting row index of the selection.
     * @param {number} rowEnd - The ending row index of the selection.
     * @param {number} colStart - The starting column index of the selection.
     * @param {number} colEnd - The ending column index of the selection.
     * @returns {number|string} - The maximum numeric value. Returns an empty string if maximum is zero.
     */
    calculate_max(rowStart, rowEnd, colStart, colEnd) {
        let maxi = -1;
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                const value = this.dataStore.getCellValue(col, row);
                const num = parseFloat(value);

                if (!isNaN(num)) {
                    if (maxi < num) {
                        maxi = num;
                    }
                }
            }
        }
        return maxi === -1 ? '' : `Maximum : ${maxi}`;
    }

    /**
     * Calculates the sum of all numeric values in the selected range.
     * @param {number} rowStart - The starting row index of the selection.
     * @param {number} rowEnd - The ending row index of the selection.
     * @param {number} colStart - The starting column index of the selection.
     * @param {number} colEnd - The ending column index of the selection.
     * @returns {number|string} - The sum of non-empty cells. Returns an empty string if sum is zero.
     */
    calculate_sum(rowStart, rowEnd, colStart, colEnd) {
        let sum = 0;
        for(let row = rowStart; row <= rowEnd; row++) {
            for( let col = colStart; col <= colEnd; col++){
                const value = this.dataStore.getCellValue(col, row);
                const num = parseFloat(value);

                if (!isNaN(num)) {
                    sum += num;
                }
                }
            }
        
        return sum === 0 ? '' : `Sum : ${sum}`;
    }

    /**
     * Calculates the average of all numeric values in the selected range.
     * @param {number} rowStart - The starting row index of the selection.
     * @param {number} rowEnd - The ending row index of the selection.
     * @param {number} colStart - The starting column index of the selection.
     * @param {number} colEnd - The ending column index of the selection.
     * @returns {number|string} - The average of non-empty cells. Returns an empty string if average is zero.
     */
    calculate_avg(rowStart, rowEnd, colStart, colEnd) {
        let sum = 0;
        let n = 0;
        for(let row = rowStart; row <= rowEnd; row++) {
            for( let col = colStart; col <= colEnd; col++){
                const value = this.dataStore.getCellValue(col, row);
                const num = parseFloat(value);

                if (!isNaN(num)) {
                    sum += num;
                    n += 1;
                }
                }
            }
        
        return sum === 0 ? '' : `Average : ${sum/n}`;
    }

    /**
    * Checks whether the selected range has any numeric data.
    * @param {number} rowStart
    * @param {number} rowEnd
    * @param {number} colStart
    * @param {number} colEnd
    * @returns {boolean} - True if there's at least one numeric value, false otherwise.
    */
    hasNumericData(rowStart, rowEnd, colStart, colEnd) {
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                const value = this.dataStore.getCellValue(col, row);
                const num = parseFloat(value);
                if (!isNaN(num)) return true;
            }
        }
        return false;
    }

}