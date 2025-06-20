const canvas = document.getElementById("spreadsheet-canvas");
const ctx = canvas.getContext("2d");
const wrapper = document.querySelector('.canvas-wrapper');

const CELL_WIDTH = 80;
const CELL_HEIGHT = 30;
const ROWS = 100;
const COLS = 100;

const spreadsheet = [];

// Set canvas size large enough to allow scrolling
canvas.width = COLS * CELL_WIDTH;
canvas.height = ROWS * CELL_HEIGHT;

wrapper.addEventListener('scroll', draw);

class Cell {
    constructor(isHeader, disabled, data, row, col, rowName, colName, active = false) {
        this.isHeader = isHeader;
        this.disabled = disabled;
        this.data = data;
        this.row = row;
        this.col = col;
        this.rowName = rowName;
        this.colName = colName;
        this.active = active;
    }
}

function getColumnName(index) {
    let result = "";
    let n = index;
    while (n > 0) {
        n--;
        let remainder = n % 26;
        result = String.fromCharCode(65 + remainder) + result;
        n = Math.floor(n / 26);
    }
    return result;
}

function initSpreadsheet() {
    for (let i = 0; i < ROWS; i++) {
        let spreadsheetRow = [];
        for (let j = 0; j < COLS; j++) {
            let cellData = "";
            let isHeader = false;
            let disabled = false;
            if (j === 0) {
                cellData = i;
                isHeader = true;
                disabled = true;
            }
            if (i === 0) {
                cellData = getColumnName(j);
                isHeader = true;
                disabled = true;
            }
            const rowName = i;
            const colName = getColumnName(j);
            const cell = new Cell(isHeader, disabled, cellData, i, j, rowName, colName, false);
            spreadsheetRow.push(cell);
        }
        spreadsheet.push(spreadsheetRow);
    }
    // drawCanvasSheet();
}

let scrollX = 0;
let scrollY = 0;

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    scrollY += e.deltaY;
    scrollX += e.deltaX;

    scrollX = Math.max(0, scrollX);
    scrollY = Math.max(0, scrollY);

    draw();
});

function getColumnName(index) {
    let result = '';
    let n = index;
    while (n > 0) {
        n--;
        result = String.fromCharCode(65 + (n % 26)) + result;
        n = Math.floor(n / 26);
    }
    return result;
}

function draw() {
    const scrollX = wrapper.scrollLeft;
    const scrollY = wrapper.scrollTop;
    ctx.clearRect(0, 0, wrapper.clientWidth, wrapper.clientHeight);

    const startRow = Math.floor(scrollY / CELL_HEIGHT);
    const endRow = startRow + Math.ceil(wrapper.clientHeight / CELL_HEIGHT);

    const startCol = Math.floor(scrollX / CELL_WIDTH);
    const endCol = startCol + Math.ceil(wrapper.clientWidth / CELL_WIDTH);

    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            const x = j * CELL_WIDTH - scrollX;
            const y = i * CELL_HEIGHT - scrollY;

            ctx.fillStyle = (i === 0 || j === 0) ? '#eee' : '#fff';
            ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

            let text = `${i}-${j}`;
            if (i === 0 && j === 0) text = '';
            else if (i === 0) text = getColumnName(j);
            else if (j === 0) text = i;


            ctx.fillStyle = '#000';
            ctx.font = '12px sans-serif';
            ctx.fillText(text, x + 5, y + 18);
        }
    }
}

draw();

function getCellFromCoords(x, y) {
    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        return spreadsheet[row][col];
    }
    return null;
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = getCellFromCoords(x, y);
    if (!cell || cell.disabled) return;

    showInputOverlay(cell);
});

function showInputOverlay(cell) {
    removeInputOverlay();

    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.data;
    input.style.position = "absolute";
    input.style.left = `${cell.col * CELL_WIDTH}px`;
    input.style.top = `${cell.row * CELL_HEIGHT}px`;
    input.style.width = `${CELL_WIDTH - 2}px`;
    input.style.height = `${CELL_HEIGHT - 2}px`;
    input.style.border = "2px solid green";
    input.style.fontSize = "14px";
    input.style.padding = "0";
    input.style.margin = "0";
    input.style.boxSizing = "border-box";
    input.style.zIndex = "10";

    input.onblur = () => {
        cell.data = input.value;
        removeInputOverlay();
        drawCanvasSheet();
    };

    document.body.appendChild(input);
    input.focus();
}

function removeInputOverlay() {
    const existingInput = document.querySelector("body > input");
    if (existingInput) {
        existingInput.remove();
    }
}

initSpreadsheet();
