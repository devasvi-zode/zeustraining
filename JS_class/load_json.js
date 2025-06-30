import { rowHeights } from "../js/dimensions.js";
import { TOTAL_COLS, TOTAL_ROWS } from "./config.js";

export class JsonGridLoader {
    constructor(buttonId, fileInputId, dataStore, renderer){
        this.jsonButton = buttonId;
        this.jsonFileInput = fileInputId;
        this.dataStore = dataStore;
        this.renderer = renderer;

        this.initEventListeners();
    }

    initEventListeners() {
        this.jsonButton.addEventListener('click', () => {
            this.jsonFileInput.click();
        });

        this.jsonFileInput.addEventListener('change', (event) => {
            this.handleFileSelect(event);
        });
    }

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

    loadJsonIntoGrid(jsonData){
        if (!Array.isArray(jsonData)){
            console.error('JSON data is not an array');
            return;
        }

        this.dataStore.cellValues.clear();

        if(jsonData.length > 0){
            const firstRecord = jsonData[0];
            const keys = Object.keys(firstRecord);

            //write headers
            keys.forEach((key, colIndex) => {
                this.dataStore.setCellValue(colIndex+1, 1, key);
            });

            //write data 
            jsonData.forEach((record, rowIndex) => {
                keys.forEach((key, colIndex) => {
                    this.dataStore.setCellValue(colIndex+1, rowIndex+2, record[key]);
                });
                if(rowIndex + 2 >= TOTAL_ROWS) return;
            });
        }

        this.renderer.drawGrid();
    }
}




