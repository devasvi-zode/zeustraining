const spreadSheetContainer = document.querySelector(".spreadsheet-container");
const ROWS = 100;
const COLS = 100;

const spreadsheet = []

class Cell{
    constructor(isHeader, disabled, data, row, col, rowName, colName, active = false){
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
    while(n > 0){
        n--; // Decrement by 1 to make it 0-based
        let remainder = n % 26;
        result = String.fromCharCode(65 + remainder) + result; // 65 = 'A'
        n = Math.floor(n / 26);
    }
    return result;
}

initSpreadsheet()
function initSpreadsheet(){
    for(let i=0; i<ROWS; i++){
        let spreadsheetRow = []
        for(let j=0; j<COLS; j++){ 
            let cellData = "";
            let isHeader = false;
            let disabled = false;
            if(j === 0){
                cellData = i;
                isHeader = true;
                disabled = true;
            }
            if(i === 0){
                cellData = getColumnName(j);
                isHeader = true;
                disabled = true;
            }
            const rowName = i;
            const colName = getColumnName(j);
            const cell = new Cell(isHeader, disabled ,cellData ,i ,j ,rowName ,colName ,false);
            spreadsheetRow.push(cell);
        }
        spreadsheet.push(spreadsheetRow)
    }
    console.log("spreadsheet", spreadsheet);
    drawSheet()
}

//functio for rendering cell
function drawSheet(){
    spreadSheetContainer.innerHTML = "";

    for(let i=0; i<spreadsheet.length; i++){
        const rowContainerEl = document.createElement("div");
        rowContainerEl.className = "cell-row"

        for(let j=0; j<spreadsheet[0].length; j++){
            const cell = spreadsheet[i][j];
            rowContainerEl.append(createCellEl(cell))
        }
        spreadSheetContainer.append(rowContainerEl);
    }
}

function createCellEl(cell){
    const cellEl = document.createElement("input");
    cellEl.className = "cell";
    cellEl.id = `cell_${cell.row}_${cell.col}`;
    cellEl.value = cell.data;
    cellEl.disabled = cell.disabled;

    if(cell.isHeader){
        cellEl.classList.add("header")
    }

    cellEl.onclick = () => handleCellClick(cell)
    cellEl.onchange = (e) =>handleOnChange(e.target.value, cell)
    return cellEl;
}

function handleCellClick(cell){
    clearHeaderActiveStates()
    const columnHeader = spreadsheet[0][cell.col];
    const rowHeader = spreadsheet[cell.row][0];
    const columnHeaderEl = getElFromRowCol(columnHeader.row,columnHeader.col)
    const rowHeaderEl = getElFromRowCol(rowHeader.row,rowHeader.col)
    columnHeaderEl.classList.add("active")
    rowHeaderEl.classList.add("active")
    console.log("click cell", cell, "columnHeaderEl", columnHeaderEl, "rowHeaderEl", rowHeaderEl);
}

function handleOnChange(data, cell){
    cell.data = data
}

function clearHeaderActiveStates(){
    for(let i =0; i<spreadsheet.length; i++){
        for (let j=0; j<spreadsheet[i].length; j++){
            const cell = spreadsheet[i][j]
            if(cell.isHeader){
                let cellEl = getElFromRowCol(cell.row, cell.col)
                cellEl.classList.remove("active")
            }
        }
    }
}

function getElFromRowCol(row, col){
   return document.querySelector(`#cell_${row}_${col}`)
}
