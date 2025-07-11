import { ColumnSelector } from "./ColumnSelector.js";
import { RowSelector } from "./RowSelector.js";
import { CellSelector } from "./CellSelector.js";
import { ColumnResizing } from "./ColumnResizing.js";
import { RowResizing } from "./RowResizing.js";
import { canvas } from "./dom-elements.js";
/**
 * Manages selection states for cells, rows, and columns.
 * Handles cell, row, and column selection and resizing using various handlers
 * Ensures only one type of selection is active at a time.
 */
export class SelectorManager {
      /**
     * Initializes the SelectorManager with dimensions, a command manager, and a renderer.
     * @param {DimensionsManager} dimensions - The grid dimensions used for selection.
     * @param {CommandManager} commandManager - Manages undo/redo or command history.
     * @param {Renderer} renderer - Responsible for rendering the grid
     */
    constructor(dimensions, commandManager, renderer, stats) {
        this.dimensions = dimensions;
        this.commandManager = commandManager;
        this.renderer = renderer;
        this.stats = stats;

        this.handler = new Array();
        this.currentHandler = null;
        this.lastActiveCell = null;
        this.lastSelectionType = null; // 'row', 'column', or 'cell'

        this._columnResizing = new ColumnResizing(dimensions,this.renderer, this.commandManager, this);
        this.handler.push(this._columnResizing);

        this._rowResizing = new RowResizing(dimensions, this.renderer, this.commandManager, this);
        this.handler.push(this._rowResizing);

        this._rowSelector = new RowSelector(dimensions, this, this.renderer);
        this.handler.push(this._rowSelector);

        this._columnSelector = new ColumnSelector(dimensions, this, this.renderer);
        this.handler.push(this._columnSelector);
        
        this._cellSelector = new CellSelector(dimensions, this, this.renderer);
        this.handler.push(this._cellSelector);


        /**
         * @type {boolean} - Indicates if resizing is currently active.
         */
        this.activeResizing = false;

        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
    }
    
    /** @returns {CellSelector} */
    get cellSelector() {
        return this._cellSelector;
    }

    /** @param {CellSelector} value */
    set cellSelector(value) {
        this._cellSelector = value;
    }

    /** @returns {RowSelector} */
    get rowSelector(){
        return this._rowSelector;
    }

    /** @returns {ColumnSelector} */
    get columnSelector() {
        return this._columnSelector;
    }

    /** @returns {ColumnResizing} */
    get columnResizing() {
        return this._columnResizing;
    }

    /** @returns {RowResizing} */
    get rowResizing() {
        return this._rowResizing;
    }

    /**
     * Sets up pointer event listeners on the canvas for selection and resizing.
     */
    setupEventListners(){
        canvas.addEventListener('pointerdown', this.handlePointerDown);
        canvas.addEventListener('pointermove', this.handlePointerMove);
        canvas.addEventListener('pointerup', this.handlePointerUp);
    }

    /**
     * Handles pointer down events and delegates to the appropriate handler.
     * Clears other selections and sets the current handler.
     * @param {PointerEvent} e - The pointer down event.
     */
    handlePointerDown(e) {
        for(let i = 0; i < this.handler.length; i++) {
            const h = this.handler[i]
            if(h.hitTest(e)) {
                if (i > 1 ) {
                    for (let j = 0; j < this.handler.length; j++) {
                        if (this.handler[j] !== h && typeof this.handler[j].clearSelection === 'function') {
                            this.handler[j].clearSelection();
                        }
                    }
                }

                this.currentHandler = h;
                if ( typeof h.handleMouseDown === 'function') {
                    h.handleMouseDown(e);
                }

                console.log("Current handler:", this.currentHandler?.constructor.name);
                break;
            }
        }

    }

    /**
     * Handles pointer move events and updates cursor style based on handler.
     * @param {PointerEvent} e - The pointer move event.
     */
    handlePointerMove(e) {
        if (this.currentHandler && typeof this.currentHandler.handleMouseMove === 'function') {
            this.currentHandler.handleMouseMove(e);
        }

        if (this.currentHandler === null) {
            for (const handler of this.handler) {
                if (typeof handler.getCursor === 'function') {
                    const cursor = handler.getCursor(e);
                    if (cursor) {
                        canvas.style.cursor = cursor;
                        return;
                    }
                }
            }
            canvas.style.cursor = 'default';
        }

    }

    /**
     * Handles pointer up events and finalizes the current interaction.
     * @param {PointerEvent} e - The pointer up event.
     */
    handlePointerUp(e) {
        if (this.currentHandler && typeof this.currentHandler.handleMouseUp === 'function') {
            this.currentHandler.handleMouseUp(e);
        }
        this.currentHandler = null;
    }


}