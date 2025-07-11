import { Grid } from './grid.js';

/**
 * Entry point for initializing the grid application.
 * Instantiates a new Grid, which sets up rendering, event handling,
 * editing, JSON loading, and command management.
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = new Grid(); // Your grid setup

    document.getElementById('undo').addEventListener('click', () => {
        grid.undo();
    });

    document.getElementById('redo').addEventListener('click', () => {
        grid.redo();
    });
});
