import { rowHeights } from "../js/dimensions.js";
import { TOTAL_COLS, TOTAL_ROWS, gridConfig } from "./config.js";

/**
 * Class responsible for loading JSON data into the grid.
 */
export class JsonGridLoader {
    /**
     * Creates a JSonGridLoader instance and binds necessary event listners.
     * @param {HTMLElement} buttonId - The button element that triggers file selection.
     * @param {HTMLElement} fileInputId - The file input element for selecting a JSON file.
     * @param {cell_data} dataStore - The data store where cell values are maintained.
     * @param {Renderer} renderer - The renderer responsible for drawing the grid.
     */
    constructor(buttonId, fileInputId, dataStore, renderer){
        this.jsonButton = buttonId;
        this.jsonFileInput = fileInputId;
        this.dataStore = dataStore;
        this.renderer = renderer;

        this.initEventListeners();
    }

    /**
     * Initializes event listeners for loading JSON files.
     */
    initEventListeners() {
        this.jsonButton.addEventListener('click', () => {
            this.jsonFileInput.click();
        });

        this.jsonFileInput.addEventListener('change', (event) => {
            this.handleFileSelect(event);
        });
    }

    /**
     * Handles the file selection event and initiates reading the file.
     * 
     * @param {Event} event - The file input change event.
     */
    handleFileSelect(event){
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try{
                const jsonData = JSON.parse(e.target.result);
                this.loadJsonIntoGrid(jsonData);
            }catch(error){
                console.error('Error parsing JSON:', error);
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Loads JSON data into the grid by writing headers and data values to corresponding cells.
     * 
     * @param {Array<Object>} jsonData - An array of objects representing rows in the grid.
     */
    loadJsonIntoGrid(jsonData){
        if (!Array.isArray(jsonData)){
            console.error('JSON data is not an array');
            return;
        }

        //Clear existing cell values
        this.dataStore.cellValues.clear();

        if(jsonData.length > 0){
            const firstRecord = jsonData[0];
            const keys = Object.keys(firstRecord);

            //write column headers
            keys.forEach((key, colIndex) => {
                this.dataStore.setCellValue(colIndex+1, 1, key);
            });

            //writer row data 
            jsonData.forEach((record, rowIndex) => {
                keys.forEach((key, colIndex) => {
                    this.dataStore.setCellValue(colIndex+1, rowIndex+2, record[key]);
                });
                if(rowIndex + 2 >= gridConfig.TOTAL_ROWS) return;
            });
        }

        //Trigger grid redraw
        this.renderer.drawGrid();
    }
}




