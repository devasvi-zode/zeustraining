import { DimensionsManager } from "./DimensionsManager.js";
import { Renderer } from "./Renderer.js";
import { EventManager } from "./EventManager.js";
import { CellEditor } from "./CellEditor.js";
import {cell_data} from './cell_data.js';
import { CommandManager } from './CommandManager.js';
import { JsonGridLoader } from './JsonGridLoader.js';
import { ColumnSelector } from "./ColumnSelector.js";
import { RowSelector } from "./RowSelector.js";

export class Grid {
    /**
     * Initializes the Grid instance by setting up
     * dimensions, data, rendering, events, editing,
     * loading, and column selection components.
     */
    constructor() {
        /**
         * @type {DimensionsManager}
         */
        this.dimensions = new DimensionsManager();

        /**
         * @type {cell_data}
         */
        this.cell_data = new cell_data();

        /**
         * @type {CommandManager}
         */
        this.commandManager = new CommandManager();

        /**
         * @type {Renderer}
         */
        this.renderer = new Renderer(this.dimensions,this.cell_data);

        /**
         * @type {EventManager}
         */
        this.eventManager = new EventManager(this.dimensions, this.renderer,this.commandManager);

        /**
         * @type {CellEditor}
         */
        this.cellEditor = new CellEditor(
            this.dimensions, 
            this.renderer, 
            this.cell_data, 
            this.commandManager
        );

        /**
         * @type {JsonGridLoader}
         */
        this.JsonGridLoader = new JsonGridLoader(
            json_button,
            json_file_input,
            this.cell_data,
            this.renderer
        );

        /**
         * @type {ColumnSelector}
         */
        this.columnSelector = new ColumnSelector(this.dimensions, this.renderer, this.commandManager);
        /**
         * @type {RowSelector}
         */
        this.rowSelector = new RowSelector(this.dimensions, this.renderer, this.commandManager);

        // Register cell editor with renderer for editing support
        this.renderer.registerCellEditor(this.cellEditor);

        this.init();

    }

    /**
     * Performs initial setup including canvas resizing,
     * Layout updat , inital rendering, event listener setup,
     * and enabling cell editing and column selection.
     */
    init(){
        this.dimensions.resizeCanvasToWrapper();
        this.dimensions.updateLayout();
        this.renderer.drawGrid();
        this.eventManager.setupEventListener();
        this.cellEditor.setupCellEditing();
        this.columnSelector.setupColumnSelection();
        this.rowSelector.setupRowSelection();
        
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