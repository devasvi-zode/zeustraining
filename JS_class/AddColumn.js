import { AddColumnCommand } from "./commands.js";
import { gridConfig , CELL_WIDTH} from "./config.js";

/**
 * Class representing the functionality to add columns to a grid
 */
export class AddColumn {
    /**
     * Initializes the AddColumn with dimensions, rendere, a command manager and button.
     * @param {DimensionsManager} dimensionsManager - Manages the dimensions of the grid.
     * @param {Renderer} renderer - Responsible for rendering the grid.
     * @param {SelectorManager} selectorManager - Manages selection state (rows, columns, cells).
     * @param {HTMLElement} buttonId - the button element that will trigger column adding
     * @param {cell_data} cellData - The data structure holding cell value.
     * @param {CommandManager} commandManager - Manages undoable commands.
     */
    constructor(dimensionsManager, renderer ,selectorManager, buttonId, cellData, commandManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.selectorManager = selectorManager;
        this.addColumnButton = buttonId;
        this.cellData = cellData;
        this.commandManager = commandManager;

        this.initEventListeners();
    }

    /**
     * Inintializes event listners for the add column button
     */
    initEventListeners() {
        this.addColumnButton.addEventListener('click', () => {
            this.addColumns();
        });
    }

    /**
     * Determines the number of column to add and the position to insert them based on the current selection
     * Creates and executes an AddRowCommand to perform the operation.
     */
    addColumns(){
        const activeType = this.selectorManager.lastSelectionType;
        let n, insertAt;

        if(!activeType) {
            n = 1;
            insertAt = 0;
        } else {
            const {columnSelector, cellSelector} = this.selectorManager;
            const sortRange = (a,b) => [Math.min(a,b), Math.max(a,b)];

            if(activeType === 'column') {
                const [columnStart, columnEnd] = sortRange(columnSelector.firstSelectedColumn, columnSelector.lastSelectedColumn);
                n = columnEnd - columnStart + 1;
                insertAt = columnStart;

            } else if(activeType === 'cell') {
                const { selectionStart, selectionEnd } = cellSelector;
                const [columnStart, columnEnd] = sortRange(selectionStart.col, selectionEnd.col);
                n = columnEnd - columnStart + 1;
                insertAt = columnStart;
            } else if(activeType === 'row'){
                return;
            }
        }

        //Create and execute the command
        const command = new AddColumnCommand(
            this.dimensions,
            this.cellData,
            n,
            insertAt,
            () => this.renderer.drawGrid()
        );

        this.commandManager.execute(command);

    }

    /**
     * Adds a specified number of columns at a given index in the grid.
     * Updates dimesnions, shifts cell data, and redraws the grid.
     * @param {number} n - Number of columns to add
     * @param {number} insertAt - Index at which to insert the new columns.
     */
    add(n, insertAt){
        console.log(`Add Column button pressed`);
        gridConfig.TOTAL_COLS += n;
        for(let i = 0; i < n; i++) {
            console.log(`insetAt is ${insertAt}`);
            this.dimensions.colWidths.splice( insertAt , 0, CELL_WIDTH );
        }
        this.cellData.shiftColumnsRight(insertAt, n);
        this.dimensions.updateLayout();
        this.renderer.drawGrid();
        console.log(`total Columns are ${gridConfig.TOTAL_COLS}`);
    }
}