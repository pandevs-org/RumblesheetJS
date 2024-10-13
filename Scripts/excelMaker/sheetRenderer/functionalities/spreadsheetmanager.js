import { FormulaParser } from './formulaParser.js';

export class SpreadsheetManager {
    /**
     * Creates an instance of SpreadsheetManager.
     * @param {object} cellFunctionality - Object containing the cell functionality including sheet renderer and selected cell.
     */
    constructor(cellFunctionality) {
        this.cellFunctionality = cellFunctionality;
        this.sheetRenderer = this.cellFunctionality.sheetRenderer;
        this.sparseMatrix = this.sheetRenderer.sparseMatrix;
        this.FormulaParser = new FormulaParser(this.sparseMatrix);

        // Initialize input event listener
        this.setupInputEventListener();
    }

    /**
     * Sets up event listeners for the input element related to cell changes.
     * Attaches input, keydown, and blur event listeners to the current selected cell.
     */
    setupInputEventListener() {
        const { row, col, index } = this.sheetRenderer.sheet;
        const input = document.getElementById(`input_${row}_${col}_${index}`);
        
        if (input) {
            input.addEventListener('input', this.handleInputChange.bind(this));
            input.addEventListener('keydown', this.handleKeyDown.bind(this));
            input.addEventListener('blur', this.handleInputBlur.bind(this));
        } else {
            console.error('Input element not found');
        }
    }

    /**
     * Handles changes in the input value and updates the sparse matrix.
     * @param {Event} event - The input event triggered when the user types in the input field.
     */
    handleInputChange(event) {
        if (this.cellFunctionality?.selectedCell) {
            const { row, column } = this.cellFunctionality.selectedCell;
            const value = event.target.value;

            const rowNumber = parseInt(row.value, 10);
            const columnNumber = this.letterToNumber(column.value);

            // Update SparseMatrix with new value
            this.sparseMatrix.setCell(rowNumber, columnNumber, value);
        } else {
            console.warn('No cell is currently selected.');
        }
    }

    /**
     * Handles the keydown event, allowing the Enter key to finalize cell editing.
     * @param {Event} event - The keydown event.
     */
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.updateCellValue(event.target.value);
            this.cellFunctionality.selectedCell = null;
            this.sheetRenderer.draw();
        }
    }

    /**
     * Handles when the input loses focus (blur event) and finalizes the cell value.
     * @param {Event} event - The blur event.
     */
    handleInputBlur(event) {
        this.updateCellValue(event.target.value);
        this.cellFunctionality.selectedCell = null;
    }

    /**
     * Updates the value of the selected cell in the sparse matrix.
     * @param {string} value - The value to update the cell with.
     */
    updateCellValue(value) {
        if (this.cellFunctionality?.selectedCell) {
            const { row, column } = this.cellFunctionality.selectedCell;
            const rowNumber = parseInt(row.value, 10);
            const columnNumber = this.letterToNumber(column.value);
            this.sparseMatrix.setCell(rowNumber, columnNumber, value);
        }
    }

    /**
     * Retrieves the value of a cell and evaluates any formulas.
     * @param {number} row - The row number of the cell.
     * @param {number} column - The column number of the cell.
     * @returns {string|number} - The evaluated value of the cell.
     */
    getValue(row, column) {
        return this.FormulaParser.evaluateFormula(this.sparseMatrix.getCellvalue(row, column));
    }

    /**
     * Retrieves the raw cell data from the sparse matrix.
     * @param {number} row - The row number of the cell.
     * @param {number} column - The column number of the cell.
     * @returns {object} - The cell object from the sparse matrix.
     */
    getCell(row, column) {
        return this.sparseMatrix.getCell(row, column);
    }

    /**
     * Converts a column letter (e.g., 'A', 'B', 'AA') to a corresponding number.
     * @param {string} letter - The column letter.
     * @returns {number} - The column number (1-based).
     */
    letterToNumber(letter) {
        let number = 0;
        for (let i = 0; i < letter.length; i++) {
            number = number * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        }
        return number;
    }
}
