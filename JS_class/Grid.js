import { DimensionsManager } from "./DimensionsManager.js";
import { Renderer } from "./Renderer.js";
import { EventManager } from "./EventManager.js";
import { CellEditor } from "./CellEditor.js";
import {cell_data} from './cell_data.js';
import { CommandManager } from './CommandManager.js';
import { JsonGridLoader } from './JsonGridLoader.js';
import { SelectorManager } from "./SelectorManager.js";
import { AddRow } from "./AddRow.js";
import { AddColumn } from "./AddColumn.js";
import { Stats } from './Stats.js';
import { canvas } from "./dom-elements.js";

export class Grid {
    /**
     * Initializes the Grid instance by setting up
     * dimensions, data, rendering, events, editing,
     * loading, and column selection components.
     */
    constructor() {
        this.dimensions = new DimensionsManager();
        this.cell_data = new cell_data();
        this.commandManager = new CommandManager();
        this.renderer = new Renderer(this.dimensions,this.cell_data, null,null);
        this.eventManager = new EventManager(this.dimensions, this.renderer,this.commandManager, null);
        
        this.SelectorManager = new SelectorManager(this.dimensions, this.commandManager,this.renderer);
        this.renderer.selectorManager = this.SelectorManager;
        this.renderer.eventManager = this.eventManager;

        this.cellEditor = new CellEditor(
            this.dimensions, 
            this.renderer, 
            this.cell_data, 
            this.commandManager,
            this.SelectorManager
        );
        this.eventManager.cellEditor = this.cellEditor;

        this.JsonGridLoader = new JsonGridLoader(
            json_button,
            json_file_input,
            this.cell_data,
            this.renderer
        );

        this.stats = new Stats(
            this.dimensions,
            this.renderer,
            this.SelectorManager,
            this.cell_data
        );
        this.SelectorManager.stats = this.stats;

        this.AddRow = new AddRow(
            this.dimensions, 
            this.renderer, 
            this.SelectorManager, 
            add_row, 
            this.cell_data, 
            this.commandManager
        );

        this.AddColumn = new AddColumn(
            this.dimensions, 
            this.renderer, 
            this.SelectorManager, 
            add_column, 
            this.cell_data, 
            this.commandManager
        );

        this.init();
        this.initEventListneres();
    }

    /**
     * Performs initial setup including Layout update, and inital rendering
     */
    init(){
        this.dimensions.resizeCanvasToWrapper();
        this.dimensions.updateLayout();
        this.renderer.drawGrid();
    }

    /**
     * Performs initial setup including canvas resizing, event listener setup
     */
    initEventListneres() {
        this.eventManager.setupEventListener();
        this.SelectorManager.setupEventListners();

        canvas.addEventListener('dblclick', (e) => {
            this.cellEditor.handleCellDoubleClick(e);
        });

        window.addEventListener('resize', () => {
            this.dimensions.resizeCanvasToWrapper();
            this.renderer.drawGrid();
        });
    }
    
    /**
     * Undo the last command and redraw the grid.
     */
    undo() {
        this.commandManager.undo();
        this.renderer.drawGrid(); // Redraw after undo
    }

    /**
     * Redot eh last undone command and redraw the grid.
     */
    redo() {
        this.commandManager.redo();
        this.renderer.drawGrid(); // Redraw after redo
    }
}