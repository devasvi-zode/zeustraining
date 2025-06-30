import { CELL_WIDTH, CELL_HEIGHT, TOTAL_COLS, TOTAL_ROWS } from "./config.js";
import { DimensionsManager } from "./dimensions.js";
import { Renderer } from "./rendering_.js";
import { EventManager } from "./Events_.js";
import { CellEditor } from "./cell_editing.js";
import {cell_data} from './cell_data.js';
import { CommandManager } from './commandManager.js';
import { JsonGridLoader } from './load_json.js';
import { ColumnSelector } from "./column_selector.js";

export class Grid {
    constructor() {
        this.dimensions = new DimensionsManager();
        this.cell_data = new cell_data();
        this.commandManager = new CommandManager();
        this.renderer = new Renderer(this.dimensions,this.cell_data);
        this.eventManager = new EventManager(this.dimensions, this.renderer,this.commandManager);
        this.cellEditor = new CellEditor(
            this.dimensions, 
            this.renderer, 
            this.cell_data, 
            this.commandManager
        );
        this.JsonGridLoader = new JsonGridLoader(
            json_button,
            json_file_input,
            this.cell_data,
            this.renderer
        );
        this.columnSelector = new ColumnSelector(this.dimensions, this.renderer, this.commandManager);
        // Register components
        this.renderer.registerCellEditor(this.cellEditor);
        this.init();

    }

    init(){
        this.dimensions.resizeCanvasToWrapper();
        this.dimensions.updateLayout();
        this.renderer.drawGrid();
        this.eventManager.setupEventListener();
        this.cellEditor.setupCellEditing();
        this.columnSelector.setupColumnSelection();
        
        window.addEventListener('resize', () => {
            this.dimensions.resizeCanvasToWrapper();
            this.renderer.drawGrid();
        });
    }
    
    // Add these methods to expose undo/redo functionality to the outside
    undo() {
        this.commandManager.undo();
        this.renderer.drawGrid(); // Redraw after undo
    }

    redo() {
        this.commandManager.redo();
        this.renderer.drawGrid(); // Redraw after redo
    }
}