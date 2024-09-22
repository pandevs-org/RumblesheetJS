import { FormulaParser } from './formulaParser.js'

export class SpreadsheetManager {
    constructor(cellFunctionality) {
        this.cellFunctionality = cellFunctionality;
        this.sheetRenderer = this.cellFunctionality.sheetRenderer;
        this.sparseMatrix = this.cellFunctionality.sheetRenderer.sparseMatrix;

        this.FormulaParser = new FormulaParser(this.sparseMatrix);
      
        // Attach event listener to input element to update SparseMatrix on input change
        this.setupInputEventListener();
    }

    setupInputEventListener() {
        const input = document.getElementById(`input_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`);
        if (input) {
            input.addEventListener('input', this.handleInputChange.bind(this));
            input.addEventListener('keydown', this.handleKeyDown.bind(this));
            input.addEventListener('blur', this.handleInputBlur.bind(this));
        } else {
            console.error('Input element not found');
        }
    }

    handleInputChange(event) {
        // Defensive check to ensure cellFunctionality and selectedCell are defined
        if (this.cellFunctionality && this.cellFunctionality.selectedCell) {
            const { row, column } = this.cellFunctionality.selectedCell;
            const value = event.target.value;

            // Convert row and column to numbers
            const rowNumber = parseInt(row.value, 10);
            const columnNumber = this.letterToNumber(column.value);

            // Update SparseMatrix with new value
            // console.log(rowNumber,columnNumber)
            // console.log(this.sheetRenderer.sheet.UploadAndFetch.updateData(rowNumber-1,columnNumber-1,value))

            this.sparseMatrix.setCell(rowNumber, columnNumber, value);
        } else {
            console.warn('No cell is currently selected.');
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.updateCellValue(event.target.value);
            this.cellFunctionality.selectedCell = null;
            this.sheetRenderer.draw();
        }
    }

    handleInputBlur(event) {
        this.updateCellValue(event.target.value);
        this.cellFunctionality.selectedCell = null;
        // this.sheetRenderer.draw();
    }

    updateCellValue(value) {
        if (this.cellFunctionality && this.cellFunctionality.selectedCell) {
            const { row, column } = this.cellFunctionality.selectedCell;
            const rowNumber = parseInt(row.value, 10);
            const columnNumber = this.letterToNumber(column.value);
            this.sparseMatrix.setCell(rowNumber, columnNumber, value);
        }
    }

    getValue(row, column) {
        return this.FormulaParser.evaluateFormula(this.sparseMatrix.getCellvalue(row, column));
    }
    getCell(row, column) {
        return this.sparseMatrix.getCell(row, column);
    }

    letterToNumber(letter) {
        let number = 0;
        for (let i = 0; i < letter.length; i++) {
            number = number * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        }
        return number;
    }
}
