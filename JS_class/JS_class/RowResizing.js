import { canvas, wrapper } from './dom-elements.js';
import { CELL_WIDTH } from './config.js';
import { ResizedRowCommand } from './commands.js';

/**
 * manages row resizing
 */
export class RowResizing {
    /**
     * Creates a class to handle row resizing
     * @param {DimensionsManager} dimensionsManager 
     * @param {Renderer} renderer 
     * @param {CommandManager} commandManager 
     * @param {SelectorManager} selectorManager 
     */
    constructor(dimensionsManager, renderer, commandManager, selectorManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.commandManager = commandManager;
        this.selectorManager = selectorManager;

        this.originalRowHeight = null;
        this.currentResizeRow = null;

        this.hitTest = this.hitTest.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * Determines whether the row resizing should become active based on pointer position.
     * Checks if the pointer is close to the row boundary. 
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {boolean} - Returns true if the row resizing should activate, false otherwise.
     */
    hitTest(e){
        const dpr = window.devicePixelRatio || 1;
        const logicalHeight = canvas.height / dpr;

        const startRow = this.renderer.getStartRow(this.dimensions.offsets.y);
        const endRow = this.renderer.getEndRow(this.dimensions.offsets.y , logicalHeight);

        for ( let row = startRow; row < endRow; row ++ ) {
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if ( e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - ( y + this.dimensions.rowHeights[row])) <8 && row !== 0){
                return true;
            }
        }
        return false;
    }

    /**
     * Determines the appropriate cursor style based on pointer position.
     * Used to visually indicate row selection capability when hovering near row boundaries.
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {string | null} - Returns a custom cursor style string or null if no change is needed.
     */
    getCursor(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalHeight = canvas.height / dpr;

        const startRow = this.renderer.getStartRow(this.dimensions.offsets.y);
        const endRow = this.renderer.getEndRow(this.dimensions.offsets.y, logicalHeight);

        // Check for row resize cursor
        for (let row = startRow; row < endRow; row++) {
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) < 8) {
                return 'ns-resize';
            }
        }
        return null;
    }
 
    /**
     * Handles the beginning of resize operation if the pointer is near row border
     * @param {PointerEvent} e - the pointer event.
     */
    handleMouseDown(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalHeight = canvas.height / dpr;

        const startRow = this.renderer.getStartRow(this.dimensions.offsets.y);
        const endRow = this.renderer.getEndRow(this.dimensions.offsets.y , logicalHeight);

        console.log(`hit test row resize- ${this.hitTest(e.offsetX, e.offsetY, e.clientX, e.clientY)}`);

        //check for row resize
        for (let row = startRow; row < endRow; row++) {
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) < 5) {
                if ( row === 0) return;

                this.dimensions.resizeState.row = row;
                this.dimensions.resizeState.startY = e.clientY;
                this.currentResizeRow = row;
                this.originalRowHeight = this.dimensions.rowHeights[row];
                wrapper.style.touchAction = 'none';
                return;
            }
        }

    }

    /**
     * Hanles pointer movement for resizng changes.
     * @param {PointerEvent} e 
     * @returns 
     */
    handleMouseMove(e) {
        //when row is being resized
        if ( this.dimensions.resizeState.row !== null ) {
            const deltaY = e.clientY - this.dimensions.resizeState.startY;
            const newHeight = Math.max(20, this.dimensions.rowHeights[this.dimensions.resizeState.row] + deltaY);
            this.dimensions.rowHeights[this.dimensions.resizeState.row] = newHeight;
            this.dimensions.resizeState.startY = e.clientY;
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
            return;
        }
    }
    handleMouseUp() {
        if ( this.dimensions.resizeState.row !== null ) {
            // create and execute row resize command
            const finalHeight = this.dimensions.rowHeights[this.currentResizeRow];
            if ( finalHeight !== this.originalRowHeight ) {
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

    clearSelection() {
        if (this.dimensions.resizeState.row !== null) {
            this.dimensions.resizeState.row = null;
            this.dimensions.resizeState.startY = null;
            this.currentResizeRow = null;
            this.originalRowHeight = null;
            wrapper.style.touchAction = 'auto';
            
        }
    }
}