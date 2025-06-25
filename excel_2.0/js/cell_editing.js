import {canvas, wrapper} from './dom-elements';
import { offsets, getColX, getRowY, colWidths, rowHeights} from './dimensions';
import { CELL_EDITING_STYLE } from './config';

let acitveCell = null;
let inputElement = null;

export function setupCellEditing(){
    inputElement = document.createElement9('input');
    Object.assign(inputElement.style, {
        position: 'absolute',
        display: 'none',
        ...CELL_EDITING_STYLE
    });

    wrapper.appendChild(inputElement);

    canvas.addEventListener('dblclick', handelCellDoubleClick);
    inputElement.addEventListener('blur', finishedEditing);
    inputElement.addEventListener('keydown', handelKeyDown);
}

function handelCellDoubleClick(e){
    const { col, row } = getCellFromEvent(e);
    if ( col === null || row === null ) return;

    startEditing(col,row);
}