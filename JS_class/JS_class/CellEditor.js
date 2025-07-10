import { canvas, wrapper } from './dom-elements.js';
import { CELL_EDITING_STYLE, TOTAL_COLS, TOTAL_ROWS } from './config.js';
import { CellEditCommand } from './commands.js';

/**
 * Manages cell editing in a grid interface. Handles input display,
 * user interactions, cel updates, and undo/redo via commands.
 */
export class CellEditor {
    /**
     * Creates a new CellEditor instance.
     * 
     * @param {DimensionsManager} dimensionsManager - Provides layout and position data
     * @param {Renderer} renderer - Handles rendering
     * @param {cell_data} cell_data - Manages cell data
     * @param {CommandManager} commandManager - Manages undo/redo
     * @param {SelectorManager} selectorManager - Manages cell selection state
     */
    constructor(dimensionsManager, renderer, cell_data, commandManager, selectorManager) {
        this.dimension = dimensionsManager;
        this.renderer = renderer;
        this.cell_data = cell_data;
        this.commandManager = commandManager;
        this.selectorManager = selectorManager;

        // Access cellSelector through selectorManager
        this.cellSelector = this.selectorManager.cellSelector;
        
        if (!this.cellSelector) {
            console.warn("CellEditor: cellSelector not available yet.");
        }

         this.focusCheckInterval = setInterval(() => this.protectFocus(), 500);

        this.activeCell = null;     // The cell currently being edited
        this.inputElement = null;   // The input element for editing
        this.navigatingWithKeyboard = false;
        this.pendingCellClick = false;
        this.clickTimeout = null;

        this.setupCellEditing();

        // Bind methods
        this.handleCellDoubleClick = this.handleCellDoubleClick.bind(this);
        this.finishEditing = this.finishEditing.bind(this);
        //this.handleKeyDown = this.handleKeyDown.bind(this);

        // In CellEditor constructor:
        document.addEventListener('focusin', (e) => {
            console.log('Focus changed to:', e.target);
            if (e.target === this.inputElement) {
                console.log('Editor input gained focus');
            }
        });

        document.addEventListener('focusout', (e) => {
            console.log('Focus lost from:', e.target);
            if (e.target === this.inputElement) {
                console.log('Editor input lost focus');
            }
        });
    }

    /**
     * Initializes the input element and event listeners
     */
    setupCellEditing() {
        this.inputElement = document.createElement('input');
        Object.assign(this.inputElement.style, {
            position: "absolute",
            display: 'none',
            zIndex: 100,
            ...CELL_EDITING_STYLE
        });

        wrapper.appendChild(this.inputElement);
        console.log("Input element created and appended");

        // Event listeners

        this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.inputElement.addEventListener('blur', (e) => {
            // Only finish editing if the blur wasn't caused by clicking on another cell
            setTimeout(() => {
                if (!this.isInputFocused() && !this.isClickingOnAnotherCell()) {
                    this.finishEditing();
                }
            }, 100);
        });
    }

    isClickingOnAnotherCell() {
        return this.pendingCellClick;
    }

    /**
     * Handles double-click to start editing
     */
    handleCellDoubleClick = (e) => {
        const cell = this.selectorManager.cellSelector.getCellFromEvent(e);
        if (!cell || cell.col === null || cell.row === null) return;
        
        // Only start editing if not currently selecting
        if (!this.selectorManager.cellSelector.isSelecting) {
            this.startEditing(cell.col, cell.row);
        }
    }

    /**
     * Starts editing a specific cell
     */
    startEditing(col, row) {
        if (this.selectorManager.cellSelector.isSelecting) return;

        this.activeCell = { col, row };
        this.updateInputBoxPosition();

        const currentValue = this.cell_data.getCellValue(col, row) || '';
        this.inputElement.value = currentValue;
        this.inputElement.style.display = 'block';
        setTimeout(() => {
            this.inputElement.focus();
            this.inputElement.select();
        }, 50);
    }

    /**
     * Finalizes editing of the current active cell
     */
    finishEditing() {
        if (!this.activeCell) return;

        // Save value if changed
        const { col, row } = this.activeCell;
        const newValue = this.inputElement.value;
        const currentValue = this.cell_data.getCellValue(col, row) || '';

        if (newValue !== currentValue) {
            const command = new CellEditCommand(
                this.cell_data,
                col,
                row,
                newValue,
                currentValue
            );
            this.commandManager.execute(command);
        }

        this.activeCell = null;
        this.inputElement.style.display = 'none';
        this.renderer.drawGrid();
    }

    /**
     * Updates the input box position to match the active cell
     */
    updateInputBoxPosition() {
    if (!this.activeCell || !this.inputElement) {
        console.log('No active cell or input element');
        this.inputElement.style.display = 'none';
        return;
    }

    const { col, row } = this.activeCell;
    const padding = 3;

    try {
        const x = this.dimension.getColX(col);
        const y = this.dimension.getRowY(row);
        const width = this.dimension.colWidths[col];
        const height = this.dimension.rowHeights[row];

        if (x <= 0 || y <= 0) {
            this.inputElement.style.display = 'none';
            return;
        }
        
                // Convert to screen position (relative to canvas/view)
        const screenX = x - this.dimension.offsets.x;
        const screenY = y - this.dimension.offsets.y;

        // Constants for header sizes
        const ROW_HEADER_WIDTH = 80;
        const COLUMN_HEADER_HEIGHT = 30;

        // Hide if overlapping headers
        if ((screenX >= 0 && screenX < ROW_HEADER_WIDTH) || (screenY >= 0 && screenY < COLUMN_HEADER_HEIGHT)) {
            this.inputElement.style.display = 'none';
            return;
        }

        Object.assign(this.inputElement.style, {
            left: `${x + padding}px`,
            top: `${y + padding}px`,
            width: `${width - 2 * padding}px`,
            height: `${height - 2 * padding}px`,
            display: 'block'
        });

        console.log(`Input box positioned at ${x},${y}`);
    } catch (error) {
        console.error('Position update failed:', error);
        this.inputElement.style.display = 'none';
    }
}

//     handleKeyDown(e) {
//         if (!this.inputElement) {
//             console.error('Input element missing in key handler');
//             return;
//         }

//         // Focus restoration
//         if (!this.isInputFocused() && this.activeCell) {
//            console.log('Restoring focus in key handler');
//             this.inputElement.focus();
//             return;
//         }

//         if (!this.activeCell) {
//             console.warn('Key event with no active cell - checking state');
//             this.protectFocus();
//             if (!this.activeCell) return;
//         }
        

//     let { col, row } = this.activeCell;
//     let newCol = col;
//     let newRow = row;
//    console.log(`Current cell: col ${col}, row ${row}`);

//     switch(e.key) {
//         case 'Enter':
//            console.log('Enter key pressed');
//             this.navigatingWithKeyboard = true;
//             e.preventDefault();
//             this.finishEditing();
//             newRow = Math.min(TOTAL_ROWS - 1, row + (e.shiftKey ? -1 : 1));
//             this.navigatingWithKeyboard = false;
//             break;
            
//         case 'Escape':
//            console.log('Escape key pressed');
//             this.inputElement.value = this.cell_data.getCellValue(col, row) || '';
//             this.finishEditing();
//             return;
            
//         case 'Tab':
//            console.log('Tab key pressed');
//             e.preventDefault();
//             this.finishEditing();
//             newCol = Math.max(0, Math.min(TOTAL_COLS - 1, col + (e.shiftKey ? -1 : 1)));
//             break;
            
//         case 'ArrowUp': 
//             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
//                 e.preventDefault();
//                 this.finishEditing();
//                 newRow = Math.max(0, row - 1);
//             }
//             break;
            
//         case 'ArrowDown':
//             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
//                 e.preventDefault();
//                 this.finishEditing();
//                 newRow = Math.min(TOTAL_ROWS - 1, row + 1);
//             }
//             break;
            
//         case 'ArrowLeft':
//             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
//                 e.preventDefault();
//                 this.finishEditing();
//                 newCol = Math.max(0, col - 1);
//             }
//             break;
            
//         case 'ArrowRight':
//             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
//                 e.preventDefault();
//                 this.finishEditing();
//                 newCol = Math.min(TOTAL_COLS - 1, col + 1);
//             }
//             break;
            
//         default:
//            console.log('Other key pressed:', e.key);
//             return; // Don't prevent default for other keys
//     }

//     // Only start editing if we actually moved to a new cell
//     if (newCol !== col || newRow !== row) {
//        console.log(`Moving to new cell: col ${newCol}, row ${newRow}`);
//         this.selectorManager.cellSelector.setSelectedCell(newCol, newRow);
//         this.startEditing(newCol, newRow);
//         this.renderer.drawGrid();
//     }else{
//        // console.log('Staying in same cell');
//     }
// }
    /**
     * Handles keyboard events during editing
     */
    // handleKeyDown(e) {
    //     if (!this.activeCell) return;

    //     let { col, row } = this.activeCell;

    //     switch(e.key) {
    //         case 'Enter':
    //             e.preventDefault();
    //             this.finishEditing();
    //             newRow = Math.min(TOTAL_ROWS - 1, newRow + (e.shiftKey ? -1 : 1));
    //             break;
                
    //         case 'Escape':
    //             this.inputElement.value = this.cell_data.getCellValue(col, row) || '';
    //             this.finishEditing();
    //             return;
                
    //         case 'Tab':
    //             e.preventDefault();
    //             this.finishEditing();
    //             newCol = Math.max(0, Math.min(TOTAL_COLS - 1, newCol + (e.shiftKey ? -1 : 1)));
    //             break;
                
    //         case 'ArrowUp': 
    //             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
    //                 e.preventDefault();
    //                 this.finishEditing();
    //                 newRow = Math.max(0, newRow - 1);
    //             }
    //             break;
                
    //         case 'ArrowDown':
    //             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
    //                 e.preventDefault();
    //                 this.finishEditing();
    //                 newRow = Math.min(TOTAL_ROWS - 1, newRow + 1);
    //             }
    //             break;
                
    //         case 'ArrowLeft':
    //             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
    //                 e.preventDefault();
    //                 this.finishEditing();
    //                 newCol = Math.max(0, newCol - 1);
    //             }
    //             break;
                
    //         case 'ArrowRight':
    //             if (this.inputElement.selectionStart === this.inputElement.selectionEnd) {
    //                 e.preventDefault();
    //                 this.finishEditing();
    //                 newCol = Math.min(TOTAL_COLS - 1, newCol + 1);
    //             }
    //             break;
                
    //         default:
    //             return; // Don't prevent default for other keys
    //     }

    //     // Update selection and potentially start editing
    //     // this.selectorManager.cellSelector.setSelectedCell(newCol, newRow);
    //     // if (e.key !== 'Escape') {
    //     //     this.startEditing(newCol, newRow);
    //     //     this.renderer.drawGrid();
    //     // }
    //     this.selectorManager.cellSelector.setSelectedCell(col, row);
    //     this.startEditing(col,row);
    //     this.renderer.drawGrid();
        
        
    // }

    isInputFocused() {
        return document.activeElement === this.inputElement;
    }

    protectFocus() {
        if (this.isInputFocused()) {
            if (!this.activeCell) {
                const selected = this.selectorManager.cellSelector.getSelectedCell();
                if (selected) {
                   console.log('Restoring activeCell from selection');
                    this.activeCell = selected;
                }
            }
        } else if (this.activeCell) {
           // Only refocus if we're not in the middle of a selection
            if (!this.selectorManager.cellSelector.isSelecting) {
                this.inputElement.focus();
        }
    }

}
}