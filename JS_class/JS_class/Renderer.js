import { CELL_HEIGHT, CELL_WIDTH, RESIZE_COLOR, RESIZE_GUIDE_WIDTH, TOTAL_COLS, TOTAL_ROWS} from './config.js';
import { ctx, canvas } from './dom-elements.js';

/**
 * Responsible for drawing and updating the grid, including cells,
 * headers, selections, and visual cues for resizing.
 */
export class Renderer {
    /**Constructs the Renderer instance.
     * @param {DimensionsManager} dimensions - Manages grid dimensions and offsets
     * @param {cell_data} dataStore - Provides access to cell data values
     * @param {SelectorManager} selectorManager - Handles selection state
     * @param {EventManager} eventManager - Handles mouse events on the canvas
     */
    constructor(dimensions, dataStore, selectorManager, eventManager) {
        this.dimensions = dimensions;
        this.dataStore = dataStore;
        this.selectorManager = selectorManager;
        this.eventManager = eventManager;


        this.styles = {
            gridLine: '#ccc',
            headerBg: '#f5f5f5',
            selectedHeaderBg: '#107c41',
            selectedHeaderText: 'white',
            selectedCellBg: '#e8f2ec',
            selectionBorder: '#137e43',
            selectionBorderWidth: 2,
            highlightHeaderBg: '#caead8',
            highlightHeaderText: '#0f703b'
        };
    }

    /**
      * Renders the entire visible portion of the spreadsheet/grid.
      * Clears the canvas, draws grid lines, cell content, headers,
      * selections, and resize indicators.
     */
    drawGrid() {
        this.clearCanvas();
        this.setupCanvasStyles();
        
        const { startCol, endCol, startRow, endRow } = this.getVisibleRange();
        const selectedCell = this.selectorManager.cellSelector.selectedCell;
        const selectedRows = this.selectorManager.rowSelector.selectedRows;
        const selectedColumns = this.selectorManager.columnSelector.selectedColumns;

        this.drawCells(startCol, endCol, startRow, endRow, selectedCell, selectedRows, selectedColumns);

        
        if (this.dimensions.resizeState.col !== null || this.dimensions.resizeState.row !== null) {
            this.drawResizeGuides();
        }
        
        // Draw both single cell and range selections
        if (this.selectorManager.cellSelector.selectedRange) {
            this.drawCellSelectionRange();
        }

        if (selectedCell) {
            this.drawCellSelection(selectedCell);
        }


        this.drawColumnHeaders(startCol, endCol, selectedColumns);
        this.drawRowHeaders(startRow, endRow, selectedRows);

        this.drawSelectionBorders(selectedColumns, selectedRows);

        this.drawColumnHeaders(startCol, endCol, selectedColumns);
        this.drawRowHeaders(startRow, endRow, selectedRows);

        this.drawCornerCell();

    }

    /**
     * Clears the entire canvas using device pixel ratio scaling.
     */
    clearCanvas() {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }

    /**
     * Sets up canvas drawing styles such as stroke, font, and fill color.
     */
    setupCanvasStyles() {
        ctx.strokeStyle = this.styles.gridLine;
        ctx.lineWidth = 1;
        ctx.font = '12px sans-serif';
        ctx.fillStyle = "black";
    }

    /**
     * Calculates the visible range of rows and columns based on current scroll offsets.
     * @returns {{startCol: number, endCol: number, startRow: number, endRow: number}} Visible grid range.
     */
    getVisibleRange() {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;

        return {
            startCol: this.getStartCol(this.dimensions.offsets.x),
            endCol: this.getEndCol(this.dimensions.offsets.x, logicalWidth),
            startRow: this.getStartRow(this.dimensions.offsets.y),
            endRow: this.getEndRow(this.dimensions.offsets.y, logicalHeight)
        };
    }

    /**
     * Draws the content of each visible cell on the canvas,
     * based on the current scroll position and cell dimensions.
     * Uses `dataStore` to fetch cell values.
     * @param {number} startCol 
     * @param {number} endCol 
     * @param {number} startRow 
     * @param {number} endRow 
     * @param {number} selectedCell 
     * @param {number} selectedRows 
     * @param {number} selectedColumns 
     */
    drawCells(startCol, endCol, startRow, endRow, selectedCell, selectedRows, selectedColumns) {
        const cellSelector = this.selectorManager.cellSelector;

        // Determine the active cell (white background)
        let activeCell = this.selectorManager.lastActiveCell;

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {

                const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
                const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;

                // Check if cell is in any selection
                const isSelected = cellSelector.isCellSelected(col, row) ||
                    selectedRows.has(row) ||
                    selectedColumns.has(col);


                // Draw background 
                if (isSelected) {
                    if(activeCell && col === activeCell.col && row === activeCell.row) {
                        ctx.fillStyle = 'white';
                    } else {
                        ctx.fillStyle = this.styles.selectedCellBg;
                    }
                    ctx.fillRect(x, y, this.dimensions.colWidths[col], this.dimensions.rowHeights[row]);
                    
                }

                this.drawCellBorder(x, y, col, row);
                this.drawCellValue(col, row, x, y);
            }
        }
    }


    /**
     * Draws selection border around the entire range
     */
    drawCellSelectionRange() {
        const range = this.selectorManager.cellSelector.selectedRange;
        if (!range) return;

        const { startCol, startRow, endCol, endRow } = range;
        if (startCol === 0 || startRow === 0 || endCol === 0 || endRow === 0) return;

        const x = this.dimensions.getColX(startCol) - this.dimensions.offsets.x;
        const y = this.dimensions.getRowY(startRow) - this.dimensions.offsets.y;

        const width = this.dimensions.getColX(endCol) - this.dimensions.getColX(startCol) +
            this.dimensions.colWidths[endCol];
        const height = this.dimensions.getRowY(endRow) - this.dimensions.getRowY(startRow) +
            this.dimensions.rowHeights[endRow];

        ctx.strokeStyle = this.styles.selectionBorder;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, width, height);
        ctx.lineWidth = 1;
    }

    /**
     * get selectect row and column headers for cell range selection
     */
    getSelectedColHeadersFromCellSelection() {
        const selectedColHeaders = new Set();

        const range = this.selectorManager.cellSelector.selectedRange;
        const selectedCell = this.selectorManager.cellSelector.selectedCell;

        if (range) {
            for (let col = range.startCol; col <= range.endCol; col++) {
                selectedColHeaders.add(col);
            }

        } else if (selectedCell) {
            selectedColHeaders.add(selectedCell.col);

        }

        return  selectedColHeaders ;
    }

    getSelectedRowHeadersFromCellSelection() {

        const selectedRowHeaders = new Set();
        const range = this.selectorManager.cellSelector.selectedRange;
        const selectedCell = this.selectorManager.cellSelector.selectedCell;

        if (range) {

            for (let row = range.startRow; row <= range.endRow; row++) {
                selectedRowHeaders.add(row);
            }
        } else if (selectedCell) {

            selectedRowHeaders.add(selectedCell.row);
        }

        return selectedRowHeaders ;
    }


    /**
     * Draws the border around a cell.
     * @param {number} x - X position. 
     * @param {number} y - Y position.
     * @param {number} col - Column index. 
     * @param {number} row - Row index.
     */
    drawCellBorder(x, y, col, row) {
        ctx.strokeRect(x, y, this.dimensions.colWidths[col], this.dimensions.rowHeights[row]);
    }

    /**
     * Draws the value inside a cell.
     * @param {number} col - Column index. 
     * @param {number} row - Row index.
     * @param {number} x - X position.
     * @param {number} y - Y position. 
     */
    drawCellValue(col, row, x, y) {
        const value = this.dataStore.getCellValue(col, row);
        if (value) {
            ctx.fillStyle = 'black';
            ctx.fillText(value, x + 5, y + 20);
        }
    }

    /**
     * Draws column headers for the visible range.
     * @param {number} startCol - Starting column index.
     * @param {number} endCol - Ending column index.
     * @param {Set<number>} selectedColumns - Set of selected column indices.
     */
    drawColumnHeaders(startCol, endCol, selectedColumns) {
        const selectedHeaders = this.getSelectedColHeadersFromCellSelection();
        for (let col = startCol; col < endCol; col++) {
            const x = Math.max(0, this.dimensions.getColX(col) - this.dimensions.offsets.x);
            const y = 0;
            ctx.strokeStyle = this.styles.gridLine;
            ctx.lineWidth = 1;
            this.drawColumnHeaderBackground(x, y, col, selectedColumns, selectedHeaders);
            this.drawColumnHeaderText(x, y, col, selectedColumns, selectedHeaders);
            this.drawColumnHeaderBorder(x, y, col, selectedHeaders);
        }
    }

    /**
     * Draws the background of a column header.
     * @param {number} x - X position. 
     * @param {number} y - Y position. 
     * @param {number} col - Column index. 
     * @param {Set<number>} selectedColumns - Set of selected column indices.
     */
    drawColumnHeaderBackground(x, y, col, selectedColumns, selectedHeaders) {
        if (this.selectorManager.rowSelector.selectedRows.size > 0 || selectedHeaders.has(col)) {
            ctx.fillStyle = this.styles.highlightHeaderBg;
        } else if (selectedColumns.has(col)) {
            ctx.fillStyle = this.styles.selectedHeaderBg;
        } else{
            ctx.fillStyle = this.styles.headerBg;
        }
        ctx.fillRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);
    }

    /**
     * Draws the text inside a column header.
     * @param {number} x - X position. 
     * @param {number} y - Y position.
     * @param {number} col - Column index. 
     * @param {Set<number>} selectedColumns - Set of selected column indices.
     */
    drawColumnHeaderText(x, y, col, selectedColumns, selectedHeaders) {
        if(selectedColumns.has(col)) {
            ctx.font = 'bold 14px sans-serif';
        }
        if (selectedColumns.has(col)) {
            ctx.fillStyle = this.styles.selectedHeaderText;
        } else if (this.selectorManager.rowSelector.selectedRows.size > 0 || selectedHeaders.has(col)) {
            ctx.fillStyle = this.styles.highlightHeaderText;
        } else{
            ctx.fillStyle = 'black';
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.getColumnName(col), 
            x + this.dimensions.colWidths[col] / 2, 
            y + CELL_HEIGHT / 2
        );
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    /**
     * Draws the border around a column header.
     * @param {number} x - X position. 
     * @param {number} y - Y position. 
     * @param {number} col - Column index. 
     */
    drawColumnHeaderBorder(x, y, col, selectedHeaders) {
        ctx.strokeRect(x, y, this.dimensions.colWidths[col], CELL_HEIGHT);

        if (this.selectorManager.rowSelector.selectedRows.size > 0) {
            this.drawColumnHeaderBottomBorder();
        }

        if(selectedHeaders.has(col)) {
            const colHeaderX = this.dimensions.getColX(col) -  this.dimensions.offsets.x;
            const colHeaderY = CELL_HEIGHT - 1;
            const colHeaderRightX =  colHeaderX + this.dimensions.colWidths[col];

            ctx.strokeStyle = this.styles.selectionBorder;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(colHeaderX, colHeaderY);
            ctx.lineTo(colHeaderRightX, colHeaderY);
            ctx.stroke();

            ctx.strokeStyle = this.styles.gridLine;
            ctx.lineWidth = 1;
        }
    }

    /**
     * Draws row headers for the visible range.
     * @param {number} startRow - Starting row index.
     * @param {number} endRow - Ending row index. 
     * @param {Set<number>} selectedRows - Set of selected row indices.
     */
    drawRowHeaders(startRow, endRow, selectedRows) {
        const selectedHeaders = this.getSelectedRowHeadersFromCellSelection();
        for (let row = startRow; row < endRow; row++) {
            const x = 0;
            const y = Math.max(0, this.dimensions.getRowY(row) - this.dimensions.offsets.y);
            const rowHeight = this.dimensions.rowHeights[row];
            const selectedColumns = this.selectorManager.columnSelector.getSelectedColumns();

            this.drawRowHeaderBackground(x, y, row, rowHeight, selectedRows, selectedHeaders);
            this.drawRowHeaderText(x, y, row, selectedHeaders);
            this.drawRowHeaderBorder(x, y, row, rowHeight, selectedColumns, selectedHeaders);
        }
    }

    /**
     * Draws the background of a row header.
     * @param {number} x - X position. 
     * @param {number} y - Y position.
     * @param {number} row - Row index.
     * @param {number} rowHeight - Height of the row.
     * @param {Set<number>} selectedRows - Set of selected row indices.
     */
    drawRowHeaderBackground(x, y, row, rowHeight, selectedRows, selectedHeaders) {
        if( selectedRows.has(row)) {
            ctx.fillStyle = this.styles.selectedHeaderBg;
        } else if (this.selectorManager.columnSelector.selectedColumns.size > 0 || selectedHeaders.has(row)) {
            ctx.fillStyle = this.styles.highlightHeaderBg;
        } else {
            ctx.fillStyle = this.styles.headerBg;
        }
        ctx.fillRect(x, y, CELL_WIDTH, rowHeight);
    }

    /**
     * Draws the text inside a row header.
     * @param {number} x - X position. 
     * @param {number} y - Y position
     * @param {number} row - Row index.
     */
    drawRowHeaderText(x, y, row, selectedHeaders) {
        const selectedRows = this.selectorManager.rowSelector.selectedRows;
        if(selectedRows.has(row)) {
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = this.styles.selectedHeaderText;
        } else if (this.selectorManager.columnSelector.selectedColumns.size > 0 || selectedHeaders.has(row)) {
            ctx.fillStyle = this.styles.highlightHeaderText;
        } else {
            ctx.fillStyle = 'black';
        }

        ctx.textAlign = 'right';
        
        ctx.fillText(row.toString(), x + 75, y + this.dimensions.rowHeights[row] / 2);
        //ctx.fillText(row.toString(), x + 75, y + 20);
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    /**
     * Draws the border around a row header.
     * @param {number} x - X position. 
     * @param {number} y - Y position. 
     * @param {number} row - Row index. 
     * @param {number} rowHeight - Height of the row. 
     * @param {Set<number>} selectedColumns - Set of selected column indices. 
     */
    drawRowHeaderBorder(x, y, row, rowHeight, selectedColumns, selectedHeaders) {
        ctx.strokeRect(x, y, CELL_WIDTH, this.dimensions.rowHeights[row]);

        if (selectedColumns.size > 0) {
            this.drawRowHeaderRightBorder();
        }
        if(selectedHeaders.has(row)) {
            const rowHeaderRightX = CELL_WIDTH - 1;
            const rowHeaderTopY = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            const rowHeaderBottomY = rowHeaderTopY + this.dimensions.rowHeights[row];

            ctx.strokeStyle = this.styles.selectionBorder;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(rowHeaderRightX, rowHeaderTopY);
            ctx.lineTo(rowHeaderRightX, rowHeaderBottomY);
            ctx.stroke();

            ctx.strokeStyle = this.styles.gridLine;
            ctx.lineWidth = 1;
        }

    }

    /**
     * Draws selection borders for selected rows and columns.
     * @param {Set<number>} selectedColumns - Set of selected column indices.
     * @param {Set<number>} selectedRows - Set of selected row indices.
     */
    drawSelectionBorders(selectedColumns, selectedRows) {
        this.drawColumnSelectionBorder(selectedColumns);
        this.drawRowSelectionBorder(selectedRows);

        if (selectedColumns.size > 0) {
            this.drawRowHeaderRightBorder();
        }

        if (selectedRows.size > 0) {
            this.drawColumnHeaderBottomBorder();
        }
    }

    /**
     * Draws a border around selected columns.
     * @param {Set<number>} selectedColumns - Set of selected column indices.
     */
    drawColumnSelectionBorder(selectedColumns) {
        if (selectedColumns.size === 0) return;

        const startCol = Math.min(...Array.from(selectedColumns));
        const endCol = Math.max(...Array.from(selectedColumns));
        const firstCol = startCol === 0 ? 1 : startCol;

        const xStart = this.dimensions.getColX(firstCol) - this.dimensions.offsets.x;
        const xEnd = this.dimensions.getColX(endCol) - this.dimensions.offsets.x +
            this.dimensions.colWidths[endCol];
        const width = xEnd - xStart;

        const yStart = 0;
        const height = this.dimensions.getRowY(TOTAL_ROWS) - this.dimensions.offsets.y;

        this.drawSelectionBorder(xStart, yStart, width, height);
    }

    /**
     * Draws a border around selected rows.
     * @param {Set<number>} selectedRows - Set of selected row indices.
     */
    drawRowSelectionBorder(selectedRows) {
        if (selectedRows.size === 0) return;

        const startRow = Math.min(...Array.from(selectedRows));
        const endRow = Math.max(...Array.from(selectedRows));
        const firstRow = startRow === 0 ? 1 : startRow;

        const yStart = this.dimensions.getRowY(firstRow) - this.dimensions.offsets.y;
        const yEnd = this.dimensions.getRowY(endRow) - this.dimensions.offsets.y +
            this.dimensions.rowHeights[endRow];
        const height = yEnd - yStart;

        const xStart = 0;
        const width = this.dimensions.getColX(TOTAL_COLS) - this.dimensions.offsets.x;

        this.drawSelectionBorder(xStart, yStart, width, height);
    }

    /**
     * Draws a generic selection border rectangle.
     * @param {number} x - X position. 
     * @param {number} y - Y position.
     * @param {number} width - Width of the border. 
     * @param {number} height - Height of the border. 
     */
    drawSelectionBorder(x, y, width, height) {
        ctx.strokeStyle = this.styles.selectionBorder;
        ctx.lineWidth = this.styles.selectionBorderWidth;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, width, height);
        ctx.lineWidth = 1;
    }

    /**
     * Draws a right border for the row header when columns are selected.
     */
    drawRowHeaderRightBorder() {
        const rowHeaderRightX = CELL_WIDTH - 1;
        const rowHeaderTopY = CELL_HEIGHT;
        const rowHeaderBottomY = this.dimensions.getRowY(TOTAL_ROWS) - this.dimensions.offsets.y;

        ctx.strokeStyle = this.styles.selectionBorder;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(rowHeaderRightX, rowHeaderTopY);
        ctx.lineTo(rowHeaderRightX, rowHeaderBottomY);
        ctx.stroke();

        ctx.strokeStyle = this.styles.gridLine;
        ctx.lineWidth = 1;

    }
    /**
     * Draws a bottom border for the column header when rows are selected.
     */
    drawColumnHeaderBottomBorder() {
        const colHeaderX = CELL_WIDTH;
        const colHeaderY = CELL_HEIGHT - 1;
        const colHeaderRightX = this.dimensions.getColX(TOTAL_COLS) - this.dimensions.offsets.x;

        ctx.strokeStyle = this.styles.selectionBorder;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(colHeaderX, colHeaderY);
        ctx.lineTo(colHeaderRightX, colHeaderY);
        ctx.stroke();

        ctx.strokeStyle = this.styles.gridLine;
        ctx.lineWidth = 1;
    }
    /**
     * Draws the top-left corner cell (intersection of row and column headers).
     */
    drawCornerCell() {
        ctx.fillStyle = this.styles.headerBg;
        ctx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        ctx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
    }

    /**
     * Draws a border around the currently selected cell.
     * @param {{col: number, row: number}} selectedCell - The selected cell coordinates.
     */
    drawCellSelection(selectedCell) {
        //Only draw if there's no range selectin
        if (!selectedCell || this.selectorManager.cellSelector.selectedRange) return;

        const { col, row } = selectedCell;
        const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
        const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
        const width = this.dimensions.colWidths[col];
        const height = this.dimensions.rowHeights[row];

        if (x <= 0 || y <= 0) return;


        ctx.strokeStyle = this.styles.selectionBorder;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(x+1, y+1, width, height);
        ctx.lineWidth = 1;
    }


    /**
     * Draws visual guides during column or row resizing.
     * has solid rectangles and dashed lines to indicate resize boundaries.
     */
    drawResizeGuides() {
        if (this.dimensions.resizeState.col !== null) {
            
            const colLeft = this.dimensions.getColX(this.dimensions.resizeState.col) - this.dimensions.offsets.x;
            const totalGridHeight = this.dimensions.getRowY(TOTAL_ROWS);
            
            // Solid rectangle around column
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.lineWidth = RESIZE_GUIDE_WIDTH;
            ctx.setLineDash([]);
            ctx.strokeRect(colLeft, CELL_HEIGHT,this.selectorManager.columnResizing.originalColWidth, totalGridHeight);

            // Dashed line at resize position
            const currentX = this.dimensions.getColX(this.dimensions.resizeState.col) + this.dimensions.colWidths[this.dimensions.resizeState.col] - this.dimensions.offsets.x;
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(currentX, CELL_HEIGHT);
            ctx.lineTo(currentX, totalGridHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        }



        if (this.dimensions.resizeState.row !== null) {
            const rowTop = this.dimensions.getRowY(this.dimensions.resizeState.row) - this.dimensions.offsets.y;
            const totalGridWidth = this.dimensions.getColX(TOTAL_COLS);

            // Solid rectangle around row
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.lineWidth = RESIZE_GUIDE_WIDTH;
            ctx.setLineDash([]);
            ctx.strokeRect(CELL_WIDTH, rowTop, totalGridWidth, this.selectorManager.rowResizing.originalRowHeight);

            // Dashed line at resize position
            const currentY = this.dimensions.getRowY(this.dimensions.resizeState.row) + this.dimensions.rowHeights[this.dimensions.resizeState.row] - this.dimensions.offsets.y;
            ctx.strokeStyle = RESIZE_COLOR;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(CELL_WIDTH, currentY);
            ctx.lineTo(totalGridWidth, currentY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        }
    }

    /**
     * Finds the first visible column using binary search based on horizontal scroll offset.
     * Adds a buffer to ensure visibility during resizing.
     * @param {number} offsetX - Horizontal scroll offset.
     * @returns {number} Index of the first visible column
     */
    getStartCol(offsetX) {
        if (offsetX <= 0) return 0;

        let left = 0;
        let right = TOTAL_COLS;
        let result = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const x = this.dimensions.getColX(mid);
            if (x >= offsetX) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result - 1;   // add buffer 1 so that when column is resized and we scroll the resized column is still visible
    }

    /**
     * Finds the last visible column using binary search based on scroll offset and viewport width.
     * @param {number} offsetX - Horizontal scroll offset.
     * @param {number} viewWidth - Width of the visible viewport.
     * @returns {number} Index of the last visible column.
     */
    getEndCol(offsetX, viewWidth) {
        const target = offsetX + viewWidth;
        if (target >= this.dimensions.getColX(TOTAL_COLS)) return TOTAL_COLS;

        let left = this.getStartCol(offsetX);
        let right = TOTAL_COLS;
        let result = TOTAL_COLS;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if ((mid < TOTAL_COLS - 1 && this.dimensions.cumulativeColWidths[mid] >= target) ||
                (mid === TOTAL_COLS - 1 && this.dimensions.cumulativeColWidths[mid] >= target)) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        if (result < TOTAL_COLS - 1 && this.dimensions.cumulativeColWidths[result] < target) {
            result++;
        }

        return Math.min(result + 1, TOTAL_COLS);
    }

    /**
     * Finds the first visible row using binary search based on vertical scroll offset.
     * Adds a buffer to ensure visibility during resizing.
     * @param {number} offsetY - Vertical scroll offset.
     * @returns {number} Index of the first visible row.
     */
    getStartRow(offsetY) {
        if (offsetY <= 0) return 0;

        let left = 0;
        let right = TOTAL_ROWS;
        let result = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const y = this.dimensions.getRowY(mid);
            if (y >= offsetY) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result - 1; // add buffer 1 so that when row is resized and we scroll the resized row is still visible
    }

    /**
     * Finds the last visible row using binary search based on scroll offset and viewport height.
     * @param {number} offsetY - Vertical scroll offset.
     * @param {number} viewHeight - Height of the visible viewport.
     * @returns {number} Index of the last visible row.
     */
    getEndRow(offsetY, viewHeight) {
        const target = offsetY + viewHeight;
        if (target >= this.dimensions.getRowY(TOTAL_ROWS)) return TOTAL_ROWS;

        let left = this.getStartRow(offsetY);
        let right = TOTAL_ROWS;
        let result = TOTAL_ROWS;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if ((mid < TOTAL_ROWS - 1 && this.dimensions.cumulativeRowHeights[mid] >= target) ||
                (mid === TOTAL_ROWS - 1 && this.dimensions.cumulativeRowHeights[mid] >= target)) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        if (result < TOTAL_ROWS - 1 && this.dimensions.cumulativeRowHeights[result] < target) {
            result++;
        }

        return Math.min(result+1, TOTAL_ROWS - 1);
    }

    /**
     * Converts a numeric column index to a spreadsheet-style name (e.g., A, B, ..., Z, AA, AB, ...).
     * @param {number} index - Column index (1-based).
     * @returns {String} Spreadsheet-style column name.
     */
    getColumnName(index){
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
}