import { 
  cumulativeColWidths, 
  cumulativeRowHeights, 
  getColX,
  getRowY
} from './dimensions.js';
import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./config.js";
export function getColumnName(index) {
    let result = "";
    let n = index;
    while (n > 0) {
        n--;
        let remainder = n % 26;
        result = String.fromCharCode(65 + remainder) + result;
        n = Math.floor(n / 26);
    }
    return result;
}

// Optimized binary search functions
export function getStartCol(offsetX) {
    if (offsetX <= 0) return 0;
    
    let left = 0;
    let right = TOTAL_COLS;
    let result = 0;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const x = getColX(mid);
        if (x >= offsetX) {
            result = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return result-1;
}

export function getEndCol(offsetX, viewWidth) {
    const target = offsetX + viewWidth;
    if (target >= cumulativeColWidths[TOTAL_COLS - 1]) return TOTAL_COLS;
    
    let left = getStartCol(offsetX);
    let right = TOTAL_COLS;
    let result = TOTAL_COLS;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if ((mid < TOTAL_COLS - 1 && cumulativeColWidths[mid] >= target) || 
            (mid === TOTAL_COLS - 1 && cumulativeColWidths[mid] >= target)) {
            result = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    if (result < TOTAL_COLS - 1 && cumulativeColWidths[result] < target) {
        result++;
    }
    
    return Math.min(result+1, TOTAL_COLS);
}

export function getStartRow(offsetY) {
    if (offsetY <= 0) return 0;
    
    let left = 0;
    let right = TOTAL_ROWS;
    let result = 0;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const y = getRowY(mid);
        if (y >= offsetY) {
            result = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return result-1;
}

export function getEndRow(offsetY, viewHeight) {
    const target = offsetY + viewHeight;
    if (target >= cumulativeRowHeights[TOTAL_ROWS - 1]) return TOTAL_ROWS;
    
    let left = getStartRow(offsetY);
    let right = TOTAL_ROWS;
    let result = TOTAL_ROWS;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if ((mid < TOTAL_ROWS - 1 && cumulativeRowHeights[mid] >= target) ||
            (mid === TOTAL_ROWS - 1 && cumulativeRowHeights[mid] >= target)) {
            result = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    if (result < TOTAL_ROWS - 1 && cumulativeRowHeights[result] < target) {
        result++;
    }
    
    return Math.min(result, TOTAL_ROWS - 1);
}

