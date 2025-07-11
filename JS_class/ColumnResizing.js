import { canvas, wrapper } from './dom-elements.js';
import { CELL_HEIGHT } from './config.js';
import { ResizedColumnCommand} from './commands.js';

/**
 * Manages resizing columns/rows.
 */
export class ColumnResizing {
    /**
     * Creates an EventManager to handle grid-related UI events.
     * @param {DimensionsManager} dimensionsManager - Manages cell dimensions and scroll offsets.
     * @param {Renderer} renderer - Responsible for rendering the visible grig.
     * @param {Commandmanager} commandManager - Executes and stores undoable commands.
     * @param {SelectorManager} selectorManager - Manages touch action on the grid
     */
    constructor(dimensionsManager, renderer, commandManager,selectorManager) {
        this.dimensions = dimensionsManager;
        this.renderer = renderer;
        this.commandManager = commandManager;
        this.selectorManager = selectorManager;

        this.originalColWidth = null;
        this.currentResizeCol = null;
        this.previousWidths = new Map();
        this.originalWidths = new Map();

        this.hitTest = this.hitTest.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * Determines whether the column resizing should become active based on pointer position.
     * Checks if the pointer is close to the column boundary. 
     * @param {PointerEvent} e - The pointer event triggered by user interaction .
     * @returns {boolean} - Returns true if the column resizing should activate, false otherwise.
     */
    hitTest(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;

        const startCol = this.renderer.getStartCol(this.dimensions.offsets.x);
        const endCol = this.renderer.getEndCol(this.dimensions.offsets.x, logicalWidth);

        for (let col = startCol; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) < 8 && col !== 0) {
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
        const logicalWidth = canvas.width / dpr;

        const startCol = this.renderer.getStartCol(this.dimensions.offsets.x);
        const endCol = this.renderer.getEndCol(this.dimensions.offsets.x, logicalWidth);

        //check for column resize cursor
        for ( let col = startCol ; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) < 8 && col !== 0) {
                return 'ew-resize';
            }
        }
        return null;
    }

    /**
     * Handles pointer movement for resizing changes.
     * 
     * @param {PointerEvent} e - The pointer event.
     * 
     */
    handleMouseMove(e) {
        //when column is being resized 
        if (this.dimensions.resizeState.col !== null) {
            const deltaX = e.clientX - this.dimensions.resizeState.startX;
            const newWidth = Math.max(60, this.dimensions.colWidths[this.dimensions.resizeState.col] + deltaX);
            
            const selected = this.selectorManager.columnSelector.selectedColumns;
            const resizingMultiple = this.selectorManager.lastSelectionType === 'column' && 
                selected.has(this.currentResizeCol) && selected.size>1;
            if(resizingMultiple) {
                //Resize all selected columns
                for (const c of selected) {
                    this.dimensions.colWidths[c] = newWidth;
                }
            } else{
                //Resize just the current column
                this.dimensions.colWidths[this.currentResizeCol] = newWidth;
            }

            this.dimensions.resizeState.startX = e.clientX;
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
            return;
        }
    }

    /**
     * Handles the beginning of a resize operation if the pointer is near a border.
     * @param {PointerEvent} e - The pointer event.
     * 
     */
    handleMouseDown(e) {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = canvas.width / dpr;

        const startCol = this.renderer.getStartCol(this.dimensions.offsets.x);
        const endCol = this.renderer.getEndCol(this.dimensions.offsets.x, logicalWidth);

        console.log(`hit test col resize- ${this.hitTest(e)}`);

        // Check for column resize
        for (let col = startCol; col < endCol; col++) {
            const x = this.dimensions.getColX(col) - this.dimensions.offsets.x;
            if (e.offsetY < CELL_HEIGHT && Math.abs(e.offsetX - (x + this.dimensions.colWidths[col])) < 5) {
                if (col === 0) return;
                e.preventDefault();

                this.dimensions.resizeState.col = col;
                this.dimensions.resizeState.startX = e.clientX;
                this.currentResizeCol = col;
                this.originalColWidth = this.dimensions.colWidths[col]; //store original width 
                
                //Store original widths of all selected columns if multiple are selected
                const selected = this.selectorManager.columnSelector.selectedColumns;
                const resizingMultiple = this.selectorManager.lastSelectionType === 'column' &&
                    selected.has(col) && selected.size > 1;
                this.originalWidths.clear();
                if(resizingMultiple) {
                    for ( const c of selected) {
                        this.originalWidths.set(c, this.dimensions.colWidths[c]);
                    }
                } else {
                    this.originalWidths.set(col, this.dimensions.colWidths[col]);
                }

                wrapper.style.touchAction = "none";
                return;
            }
        }
    }

    /**
     * Finalizes a resize operation and pushes the appropriate command to history .
     */
    handleMouseUp() {
        if(this.dimensions.resizeState.col !== null){
            //create and execute column resize command
            const col = this.currentResizeCol;
            const finalWidth = this.dimensions.colWidths[col];

            const selected = this.selectorManager.columnSelector.selectedColumns;
            const resizingMultiple = this.selectorManager.lastSelectionType === 'column' &&
                selected.has(col) && selected.size > 1;

            const newWidths = new Map();
            const oldWidths = new Map();

            if (resizingMultiple) {
                // Record new widths for all selected columns
                for (const c of selected) {
                    newWidths.set(c, this.dimensions.colWidths[c]);
                    oldWidths.set(c, this.originalWidths.get(c));
                }
            } else {
                // Just record for the single column
                newWidths.set(col, finalWidth);
                oldWidths.set(col, this.originalColWidth);
            }

            // Only create command if widths actually changed
            let widthsChanged = false;
            for (const [c, width] of newWidths.entries()) {
                if (width !== oldWidths.get(c)) {
                    widthsChanged = true;
                    break;
                }
            }

            if (widthsChanged) {
                const command = new ResizedColumnCommand(
                    this.dimensions,
                    newWidths,
                    oldWidths
                );
                this.commandManager.execute(command);
            }

            //reset state
            this.dimensions.resizeState.col = null;
            this.currentResizeCol = null;
            this.originalColWidth = null;
            this.originalWidths.clear();
            wrapper.style.touchAction = 'auto';
            this.dimensions.updateLayout();
            this.renderer.drawGrid();
        }
    }



    /**
     * Clears all the states that were set up for resizing 
     */
    clearSelection() {
        if (this.dimensions.resizeState.col !== null) {
            this.dimensions.resizeState.col = null;
            this.dimensions.resizeState.startX = null;
            this.currentResizeCol = null;
            this.originalColWidth = null;
            this.originalWidths.clear();
            wrapper.style.touchAction = 'auto';
            
        }
    }
}