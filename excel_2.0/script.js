let myCanvas = document.querySelector("#myCanvas");
const ctx = myCanvas.getContext("2d");

function accountForDPI(){
    const dpr = window.devicePixelRatio || 1;
    const rect = myCanvas.getBoundingClientRect();

    myCanvas.width = rect.width *dpr;
    myCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    myCanvas.style.width = `${rect.width}px`;
    myCanvas.style.height = `${rect.height}px`;
}
accountForDPI();
function drawGrid(lineWidth, cellWidth, cellHeight, color){

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    let width = myCanvas.width;
    let height = myCanvas.height;

    for(let x=0; x<= width; x +=cellWidth){
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,height);
        ctx.stroke();
    }

    for(let y=0; y<= height; y += cellHeight){
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(width,y);
        ctx.stroke();
    }

}
//drawGrid(1,80,30,"black");

let cellWidth = 80;
let cellHeight = 30;
let offsetX = 0;
let offsetY = 0;

function drawVirtualGrid(offsetX, offsetY){
    ctx.clearRect(0,0,myCanvas.width, myCanvas.height);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    let cols = Math.ceil(myCanvas.width / cellWidth);
    let rows = Math.ceil(myCanvas.height / cellHeight);

    for(let i=0; i<= cols; i++){
        let x = i * cellWidth - (offsetX % cellWidth);
        ctx.moveTo(x,0);
        ctx.lineTo(x, myCanvas.height);
    }

    for(let j=0; j<=rows; j++){
        let y = j * cellHeight - (offsetY % cellHeight);
        ctx.moveTo(0,y);
        ctx.lineTo(myCanvas.width,y);
    }
    ctx.stroke();
}

drawVirtualGrid(0,0);