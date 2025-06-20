let activeCell = null;
let cellData = {}; // Store cell data { 'row,col': 'value' }

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + scrollX;
    const mouseY = e.clientY - rect.top + scrollY;
    
    const col = Math.floor(mouseX / COL_WIDTH);
    const row = Math.floor(mouseY / ROW_HEIGHT);
    
    if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < TOTAL_COLS) {
        activeCell = { row, col };
        showEditor(row, col);
    }
});

function showEditor(row, col) {
    const editor = document.createElement('input');
    editor.type = 'text';
    editor.style.position = 'absolute';
    editor.style.left = `${col * COL_WIDTH - scrollX}px`;
    editor.style.top = `${row * ROW_HEIGHT - scrollY}px`;
    editor.style.width = `${COL_WIDTH}px`;
    editor.style.height = `${ROW_HEIGHT}px`;
    editor.value = cellData[`${row},${col}`] || '';
    
    editor.addEventListener('blur', () => {
        cellData[`${row},${col}`] = editor.value;
        document.body.removeChild(editor);
        renderGrid();
    });
    
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            cellData[`${row},${col}`] = editor.value;
            document.body.removeChild(editor);
            renderGrid();
        }
    });
    
    document.body.appendChild(editor);
    editor.focus();
}