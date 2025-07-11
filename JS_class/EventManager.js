import { canvas, wrapper } from './dom-elements.js';
import { CELL_HEIGHT, CELL_WIDTH } from './config.js';

/**
 * Manages pointer and scroll events for grid interactions and handling scroll offsets.
 */
export class EventManager {
    /**
     * Creates an EventManager to handle grid-related UI events.
     * 
     * @param {DimensionsManager} dimensionsManager - Manages cell dimensions and scroll offsets.
     * @param {Renderer} renderer - Responsible for rendering the visible grig.
     * @param {Commandmanager} commandManager - Executes and stores undoable commands.
     * @param {CellEditor} - Responsible for editing of a cell 
     */
    constructor(dimensionsManager, renderer, commandManager, cellEditor) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.commandManager = commandManager;
        this.cellEditor = cellEditor;
    }

    /**
     * Sets up DOM event listeners for scroll, pointer, and wheel interactions.
     */
    setupEventListener() {
        //Wheel event for scrolling
        wrapper.addEventListener('wheel', (e) => {
            if (this.dimensions.resizeState.col !== null || this.dimensions.resizeState.row !== null){
                e.preventDefault();
                return;
            }
            e.preventDefault();
            this.dimensions.offsets.x += e.deltaX;
            this.dimensions.offsets.y += e.deltaY;
            this.dimensions.clampOffset();

            wrapper.scrollLeft = this.dimensions.offsets.x;
            wrapper.scrollTop = this.dimensions.offsets.y;
            this.cellEditor.updateInputBoxPosition();
            this.renderer.drawGrid();

        }, { passive: false });

        //scroll event
        wrapper.addEventListener('scroll', (e) => {
            if(this.dimensions.resizeState.col !== null || this.dimensions.resizeState.row !== null){
                e.preventDefault();
                return;
            }
            e.preventDefault();
            wrapper.style.touchAction = "auto";
            this.dimensions.offsets.x = wrapper.scrollLeft;
            this.dimensions.offsets.y = wrapper.scrollTop;
            this.dimensions.clampOffset();
            this.renderer.drawGrid();

            this.cellEditor.updateInputBoxPosition();
        });

    }

}