import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./config.js";
import { DimensionsManager } from "./dimensions.js";
import { Renderer } from "./rendering_.js";
import { EventManager } from "./events_.js";
//import { CellEditor } from "./cell_editing.js";
import { resizeCanvasToWrapper } from "../js/dimensions.js";

export class Grid {
    constructor() {
        this.dimensions = new DimensionsManager();
        this.renderer = new Renderer(this.dimensions);
        this.eventManager = new EventManager(this.dimensions, this.renderer);
        //this.CellEditor = new CellEditor(this.dimensions, this.renderer);

        this.init();
    }

    init(){
        this.dimensions.resizeCanvasToWrapper();
        this.dimensions.updateLayout();
        this.renderer.drawGrid();
        this.eventManager.setupEventListener();
        //this.CellEditor.setupCellEditing();
        
        window.addEventListener('resize', () => {
            this.dimensions.resizeCanvasToWrapper();
            this.renderer.drawGrid();
        });
    }
}