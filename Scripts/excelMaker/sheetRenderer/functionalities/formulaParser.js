/**
 * Class to parse and evaluate spreadsheet formulas.
 */
export class FormulaParser {
    /**
     * @param {Object} matrix - Reference to the SparseMatrix containing spreadsheet data.
     */
    constructor(matrix) {
        this.matrix = matrix;
    }

    /**
     * Parse and evaluate the formula.
     * @param {string} formula - The formula to evaluate.
     * @returns {number|string} - The result of the formula or the original string if not a formula.
     */
    evaluateFormula(formula) {
        if (!formula) return;
        if (!formula.startsWith("=")) return formula; // Only process formulas starting with "="
        
        formula = formula.slice(1).toUpperCase().trim(); // Remove "=" and trim spaces
        
        if (formula.startsWith("SUM")) {
            return this.handleSum(formula);
        } else if (formula.startsWith("MIN")) {
            return this.handleMin(formula);
        } else if (formula.startsWith("MAX")) {
            return this.handleMax(formula);
        } else if (formula.startsWith("AVG")) {
            return this.handleAverage(formula);
        }

        throw new Error(`Unsupported formula: ${formula}`);
    }

    /**
     * Convert a cell reference (e.g., A1) into row and column indices.
     * @param {string} cellRef - The cell reference (e.g., "A1").
     * @returns {Object} - The row and column index.
     */
    getCellPosition(cellRef) {
        const col = cellRef.charCodeAt(0) - 'A'.charCodeAt(0); // A = 0, B = 1, etc.
        const row = parseInt(cellRef.slice(1), 10) - 1; // Convert row number to zero-based index
        return { row, col };
    }

    /**
     * Utility function to extract the range from a formula (e.g., "A1:B4" from "SUM(A1:B4)").
     * @param {string} formula - The formula to extract the range from.
     * @returns {string} - The range string (e.g., "A1:B4").
     */
    extractRange(formula) {
        const match = formula.match(/\((.*?)\)/);
        if (!match) {
            throw new Error("Invalid formula: range not found.");
        }
        return match[1];
    }

    /**
     * Extract the start and end positions from a range (e.g., A1:B4).
     * @param {string} range - The range string (e.g., "A1:B4").
     * @returns {Object} - The start and end positions.
     */
    getRangePosition(range) {
        const [startCell, endCell] = range.split(":");
        return {
            start: this.getCellPosition(startCell),
            end: this.getCellPosition(endCell),
        };
    }

    /**
     * Handle SUM function by calculating the sum of values in a range.
     * @param {string} formula - The SUM formula (e.g., "SUM(A1:B4)").
     * @returns {number} - The sum of the values in the range.
     */
    handleSum(formula) {
        const range = this.extractRange(formula);
        const { start, end } = this.getRangePosition(range);

        let sum = 0;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row + 1, col + 1);
                sum += value ? parseFloat(value) : 0;
            }
        }
        return sum;
    }

    /**
     * Handle MIN function by finding the minimum value in a range.
     * @param {string} formula - The MIN formula (e.g., "MIN(A1:B4)").
     * @returns {number} - The minimum value in the range.
     */
    handleMin(formula) {
        const range = this.extractRange(formula);
        const { start, end } = this.getRangePosition(range);

        let min = Infinity;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row + 1, col + 1);
                if (value !== null) {
                    min = Math.min(min, parseFloat(value));
                }
            }
        }
        return min === Infinity ? 0 : min;
    }

    /**
     * Handle MAX function by finding the maximum value in a range.
     * @param {string} formula - The MAX formula (e.g., "MAX(A1:B4)").
     * @returns {number} - The maximum value in the range.
     */
    handleMax(formula) {
        const range = this.extractRange(formula);
        const { start, end } = this.getRangePosition(range);

        let max = -Infinity;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row + 1, col + 1);
                if (value !== null) {
                    max = Math.max(max, parseFloat(value));
                }
            }
        }
        return max === -Infinity ? 0 : max;
    }

    /**
     * Handle AVERAGE function by calculating the average of values in a range.
     * @param {string} formula - The AVERAGE formula (e.g., "AVG(A1:B4)").
     * @returns {number} - The average of the values in the range.
     */
    handleAverage(formula) {
        const range = this.extractRange(formula);
        const { start, end } = this.getRangePosition(range);

        let sum = 0, count = 0;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row + 1, col + 1);
                if (value !== null) {
                    sum += parseFloat(value);
                    count++;
                }
            }
        }
        return count === 0 ? 0 : sum / count;
    }
}
