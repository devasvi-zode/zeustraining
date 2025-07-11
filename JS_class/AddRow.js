import { gridConfig , CELL_WIDTH} from "./config.js";

export class AddRow {
    /**
     * 
     * @param {DimensionsManager} dimensionsManager 
     * @param {Renderer} renderer 
     * @param {SelectorManager} selectorManager 
     * @param {HTMLElement} buttonId - the button element that will trigger row adding
     */
    constructor(dimensionsManager, renderer ,selectorManager, buttonId) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.selectorManager = selectorManager;
        this.addRowButton = buttonId;

        this.initEventListeners();
    }

    initEventListeners() {
        this.addRowButton.addEventListener('click', () => {
            this.add();
        });
    }

    add(){
        console.log(`Add row button pressed`);
        gridConfig.TOTAL_ROWS += 1;
        this.dimensions.rowHeights.push(30);
        this.dimensions.cumulativeRowHeights.push(this.dimensions.cumulativeRowHeights[gridConfig.TOTAL_ROWS-2]+CELL_WIDTH)
        this.renderer.drawGrid();
        console.log(`total rows are ${gridConfig.TOTAL_ROWS}`);
    }
}