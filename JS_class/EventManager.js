import { canvas, wrapper } from './dom-elements.js';
import { CELL_HEIGHT, CELL_WIDTH } from './config.js';
import { ResizedColumnCommand, ResizedRowCommand } from './commands.js';

/**
 * Manages pointer and scroll events for grid interactions,
 * including resizing columns/rows and handling scroll offsets.
 */
export class EventManager {
    /**
     * Creates an EventManager to handle grid-related UI events.
     * 
     * @param {DimensionsManager} dimensionsManager - Manages cell dimensions and scroll offsets.
     * @param {Renderer} renderer - Responsible for rendering the visible grig.
     * @param {Commandmanager} commandManager - Executes and stores undoable commands.
     */
    constructor(dimensionsManager, renderer, commandManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.commandManager = commandManager;
        /**
         * @type {Number|null} - Stores original column width before resizing starts.
         */
        this.originalColWidth = null;
        /**
         * @type {Number|null} - Stores original row height before resizing starts.
         */
        this.originalRowHeight = null;
        /**
         * @type {Number|null} - Index of the column currently being resized. 
         */
        this.currentResizeCol = null;
        /**
         * @type {Number|null} - Index of the row currently being resized.
         */
        this.currentResizeRow = null;

        //bind methods to maintain 'this'context
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
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
        });

        canvas.addEventListener('pointermove', this.handleMouseMove);
        canvas.addEventListener('pointerdown', this.handleMouseDown);
        canvas.addEventListener('pointerup', this.handleMouseUp);
        canvas.addEventListener('pointerout', this.handleMouseUp);
    }

    /**
     * Handles pointer movement for resizing and cursor changes.
     * 
     * @param {PointerEvent} e - The pointer event.
     * 
     */
    handleMouseMove(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;
        const startCol = this.renderer.getStartCol(this.dimensions.offsets.x);
        const endCol = this.renderer.getEndCol(this.dimensions.offsets.x, logicalWidth);
        const startRow = this.renderer.getStartRow(this.dimensions.offsets.y);
        const endRow = this.renderer.getEndRow(this.dimensions.offsets.y, logicalHeight);

        //when column is being resized 
        if (this.dimensions.resizeState.col !== null) {
            const deltaX = e.clientX - this.dimensions.resizeState.startX;
            const newWidth = Math.max(60, this.dimensions.colWidths[this.dimensions.resizeState.col] + deltaX);

            //Temporarily update the widht for visual feedback
            this.dimensions.colWidths[this.dimensions.resizeState.col] = newWidth;
            this.dimensions.resizeState.startX = e.clientX;
            
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
            return;
        }

        //when row is being resized
        if (this.dimensions.resizeState.row !== null) {
            const deltaY = e.clientY - this.dimensions.resizeState.startY;
            const newHeight = Math.max(20, this.dimensions.rowHeights[this.dimensions.resizeState.row] + deltaY);
            this.dimensions.rowHeights[this.dimensions.resizeState.row] = newHeight;
            this.dimensions.resizeState.startY = e.clientY;
            
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
            return;
        }

        // Check for column resize cursor
        for (let col = startCol; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) < 5) {
                canvas.style.cursor = 'ew-resize';
                return;
            }
        }

        // Check for row resize cursor
        for (let row = startRow; row < endRow; row++) {
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) < 5) {
                canvas.style.cursor = 'ns-resize';
                return;
            }
        }

        // Check for column select cursor
        for (let col = startCol; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) > 5) {
                canvas.style.cursor = 'url(icons8-thick-arrow-pointing-down-15.png) 15 15 ,grab';
                return;
            }
        }

        // Check for row select cursor
        for(let row = startRow; row < endRow; row++){
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if(e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) > 5){
                canvas.style.cursor = 'url(icons8-arrow-15.png) 15 15, grab';
                return;
            }
        }

        canvas.style.cursor = 'default';
    }

    /**
     * Handles the beginning of a resize operation if the pointer is near a border.
     * @param {PointerEvent} e - The pointer event.
     * 
     */
    handleMouseDown(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;
        const logicalHeight = canvas.height / dpr;
        const startCol = this.renderer.getStartCol(this.dimensions.offsets.x);
        const endCol = this.renderer.getEndCol(this.dimensions.offsets.x, logicalWidth);
        const startRow = this.renderer.getStartRow(this.dimensions.offsets.y);
        const endRow = this.renderer.getEndRow(this.dimensions.offsets.y, logicalHeight);

        // Check for column resize
        for (let col = startCol; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) < 5) {
                if (col === 0) return;
                e.preventDefault();
                
                this.dimensions.resizeState.col = col;
                this.dimensions.resizeState.startX = e.clientX;
                this.currentResizeCol = col;
                this.originalColWidth = this.dimensions.colWidths[col]; //store original widht 
                wrapper.style.touchAction = "none";
                return;
            }
        }

        // Check for row resize
        for (let row = startRow; row < endRow; row++) {
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) < 5) {
                if (row === 0) return;
                e.preventDefault();
                
                this.dimensions.resizeState.row = row;
                this.dimensions.resizeState.startY = e.clientY;
                this.currentResizeRow = row;
                this.originalRowHeight = this.dimensions.rowHeights[row];
                wrapper.style.touchAction = "none";
                return;
            }
        }

    }

    /**
     * Finalizes a resize operation and pushes the appropriate command to history .
     */
    handleMouseUp() {
        // if (this.dimensions.resizeState.col !== null || this.dimensions.resizeState.row !== null) {
        //     this.dimensions.resizeState.col = null;
        //     this.dimensions.resizeState.row = null;
        //     wrapper.style.touchAction = "auto";
        //     this.dimensions.updateLayout();
        //     this.renderer.drawGrid();
        // }
        if(this.dimensions.resizeState.col !== null){
            //create and execute column resize command
            const finalWidth = this.dimensions.colWidths[this.currentResizeCol];
            if(finalWidth !== this.originalColWidth){
                const command = new ResizedColumnCommand(
                    this.dimensions,
                    this.currentResizeCol,
                    finalWidth
                );
                this.commandManager.execute(command);
            }

            //reset state
            this.dimensions.resizeState.col = null;
            this.currentResizeCol = null;
            this.originalColWidth = null;
            wrapper.style.touchAction = 'auto';
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
        }
        if (this.dimensions.resizeState.row !== null){
            //create and execute row resize command 
            const finalHeight = this.dimensions.rowHeights[this.currentResizeRow];
            if(finalHeight !== this.originalRowHeight){
                const command = new ResizedRowCommand(
                    this.dimensions,
                    this.currentResizeRow,
                    finalHeight
                );
                this.commandManager.execute(command);
            }

            //reset state
            this.dimensions.resizeState.row = null;
            this.currentResizeRow = null;
            this.originalRowHeight = null;
            wrapper.style.touchAction = 'auto';
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
        }
    }
}