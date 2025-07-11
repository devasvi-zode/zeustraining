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
        this.previousHeights = new Map();
        this.originalHeights = new Map();

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

        console.log(`hit test row resize- ${this.hitTest(e)}`);

        //check for row resize
        for (let row = startRow; row < endRow; row++) {
            const y = this.dimensions.getRowY(row) - this.dimensions.offsets.y;
            if (e.offsetX < CELL_WIDTH && Math.abs(e.offsetY - (y + this.dimensions.rowHeights[row])) < 5) {
                if ( row === 0) return;

                this.dimensions.resizeState.row = row;
                this.dimensions.resizeState.startY = e.clientY;
                this.currentResizeRow = row;
                this.originalRowHeight = this.dimensions.rowHeights[row];

                //Store original Height of all selected rowumns if multiple are selected
                const selected = this.selectorManager.rowSelector.selectedrows;
                const resizingMultiple = this.selectorManager.lastSelectionType === 'row' &&
                    selected.has(row) && selected.size > 1;
                this.originalHeights.clear();
                if(resizingMultiple) {
                    for ( const r of selected) {
                        this.originalHeights.set(r, this.dimensions.rowHeights[r]);
                    }
                } else {
                    this.originalHeights.set(row, this.dimensions.rowHeights[row]);
                }

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
            const newHeights = Math.max(20, this.dimensions.rowHeights[this.dimensions.resizeState.row] + deltaY);
            
            const selected = this.selectorManager.rowSelector.selectedrows;
            const resizingMultiple = this.selectorManager.lastSelectionType === 'row' && 
                selected.has(this.currentResizeRow) && selected.size>1;
            if(resizingMultiple) {
                //Resize all selected rowumns
                for (const c of selected) {
                    this.dimensions.rowlHeights[c] = newHeights;
                }
            } else{
                //Resize just the current rowumn
                this.dimensions.rowlHeights[this.currentResizeRow] = newHeights;
            }
            this.dimensions.resizeState.startY = e.clientY;
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
            return;
        }
    }
    handleMouseUp() {
        if ( this.dimensions.resizeState.row !== null ) {
            // create and execute row resize command
            const row = this.currentResizeRow;
            const finalHeight = this.dimensions.rowHeights[row];

            const selected = this.selectorManager.rowSelector.selectedrows;
            const resizingMultiple = this.selectorManager.lastSelectionType === 'row' && 
                selected.has(this.currentResizeRow) && selected.size>1;
            
            const newHeights = new Map();
            const oldHeights = new Map();

            if (resizingMultiple) {
                // Record new Heights for all selected rowumns
                for (const r of selected) {
                    newHeights.set(r, this.dimensions.rowHeights[r]);
                    oldHeights.set(r, this.originalHeights.get(r));
                }
            } else {
                // Just record for the single rowumn
                newHeights.set(row, finalWidth);
                oldHeights.set(row, this.originalrowWidth);
            }

            // Only create command if Heights actually changed
            let HeightsChanged = false;
            for (const [r, width] of newHeights.entries()) {
                if (width !== oldHeights.get(r)) {
                    HeightsChanged = true;
                    break;
                }
            }

            if (HeightsChanged) {
                const command = new ResizedRowCommand(
                    this.dimensions,
                    newHeights,
                    oldHeights
                );
                this.commandManager.execute(command);
            }

            //reset state
            this.dimensions.resizeState.row = null;
            this.currentResizeRow = null;
            this.originalRowHeight = null;
            this.originalHeights.clear();
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
            this.originalHeights.clear();
            wrapper.style.touchAction = 'auto';
            
        }
    }
}