import { canvas,ctx, wrapper } from './dom-elements.js';
import { updateLayout, resizeCanvasToWrapper } from './dimensions.js';
import { drawGrid } from './rendering_.js';
import { setupEventListeners } from './events_.js';

console.log("main is working");
// Resize canvas to match wrapper and account for DPI
// function resizeCanvasToWrapper() {
//     const dpr = window.devicePixelRatio || 1;
//     const rect = wrapper.getBoundingClientRect();

//     canvas.width = rect.width * dpr;
//     canvas.height = rect.height * dpr;
//     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

//     canvas.style.width = `${rect.width}px`;
//     canvas.style.height = `${rect.height}px`;

//     ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity
//     ctx.scale(dpr, dpr);
//     ctx.translate(0.5, 0.5);
// }

// Initialize
function init() {
    resizeCanvasToWrapper();
    updateLayout();
    drawGrid();
    setupEventListeners();

    window.addEventListener('resize', () => {
        resizeCanvasToWrapper();
        drawGrid();
    });
}

init();