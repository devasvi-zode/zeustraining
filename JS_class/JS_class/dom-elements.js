// DOM element references
/**
 * The HTML canvas element used to render the grid.
 * @type {HTMLCanvasElement}
 */
export const canvas = document.getElementById('myCanvas');

/**
 * The 2D rendering context for the canvas.
 * Used to draw grid cells, text, and other graphics.
 * @type {CanvasRenderingContext2D}
 */
export const ctx = canvas.getContext('2d');

/**
 * The wrapper element that contains the canvas, scroller and other UI elements.
 * @type {HTMLElement}
 */
export const wrapper = document.getElementById('wrapper');

/**
 * The scrolling container used to enable scroll-based navigation throught the grid.
 * @type {HTMLElement}
 */
export const scroller = document.getElementById('scroller');