import { AddRowCommand } from "./commands.js";
import { gridConfig , CELL_HEIGHT} from "./config.js";

/**
 * Class representing the functionality to add rows to a grid
 */
export class AddRow {
    /**
     * Initializes the AddRow with dimensions, rendere, a command manager and button.
     * @param {DimensionsManager} dimensionsManager - Manages the dimensions of the grid.
     * @param {Renderer} renderer - Responsible for rendering the grid.
     * @param {SelectorManager} selectorManager - Manages selection state (rows, columns, cells).
     * @param {HTMLElement} buttonId - the button element that will trigger row adding
     * @param {cell_data} cellData - The data structure holding cell value.
     * @param {CommandManager} commandManager - Manages undoable commands.
     */
    constructor(dimensionsManager, renderer ,selectorManager, buttonId, cellData, commandManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.selectorManager = selectorManager;
        this.addRowButton = buttonId;
        this.cellData = cellData;
        this.commandManager = commandManager;

        this.initEventListeners();
    }

    /**
     * Inintializes event listners for the add row button
     */
    initEventListeners() {
        this.addRowButton.addEventListener('click', () => {
            this.addRows();
        });
    }

    /**
     * Determines the number of row to add and the position to insert them based on the current selection
     * Creates and executes an AddRowCommand to perform the operation.
     */
    addRows(){
        const activeType = this.selectorManager.lastSelectionType;
        let n, insertAt;

        if(!activeType) {
            n = 1;
            insertAt = 0;
        } else {
            const {rowSelector, cellSelector} = this.selectorManager;
            const sortRange = (a,b) => [Math.min(a,b), Math.max(a,b)];

            if(activeType === 'row') {
                const [rowStart, rowEnd] = sortRange(rowSelector.firstSelectedRow, rowSelector.lastSelectedRow);
                n = rowEnd - rowStart + 1;
                insertAt = rowStart;

            } else if(activeType === 'cell') {
                const { selectionStart, selectionEnd } = cellSelector;
                const [rowStart, rowEnd] = sortRange(selectionStart.row, selectionEnd.row);
                n = rowEnd - rowStart + 1;
                insertAt = rowStart;
            } else if(activeType === 'column'){
                return;
            }
        }

        //Create and execute the command
        const command = new AddRowCommand(
            this.dimensions,
            this.cellData,
            n,
            insertAt,
            () => this.renderer.drawGrid()
        );

        this.commandManager.execute(command);

    }

    /**
     * Adds a specified number of rows at a given index in the grid.
     * Updates dimesnions, shifts cell data, and redraws the grid.
     * @param {number} n - Number of rows to add
     * @param {number} insertAt - Index at which to insert the new rows.
     */
    add(n, insertAt){
        console.log(`Add row button pressed`);
        gridConfig.TOTAL_ROWS += n;
        for(let i = 0; i < n; i++) {
            console.log(`insetAt is ${insertAt}`);
            this.dimensions.rowHeights.splice( insertAt , 0, CELL_HEIGHT );
        }
        this.cellData.shiftRowsDown(insertAt, n);
        this.dimensions.updateLayout();
        this.renderer.drawGrid();
        console.log(`total rows are ${gridConfig.TOTAL_ROWS}`);
    }
}