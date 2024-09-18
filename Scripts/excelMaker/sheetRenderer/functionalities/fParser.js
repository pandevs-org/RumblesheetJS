export class FormulaParser {
    constructor(matrix) {
        this.matrix = matrix; // Reference to the SparseMatrix
    }

    // Function to parse and evaluate the formula
    evaluateFormula(formula) {
        if(!formula) return ;
        if (!formula.startsWith("=")) return formula; // Only process formulas that start with "="
        
        // Remove the "=" sign
        formula = formula.slice(1).toUpperCase().trim();
        
        if (formula.startsWith("SUM")) {
            return this.handleSum(formula);
        } else if (formula.startsWith("MIN")) {
            return this.handleMin(formula);
        } else if (formula.startsWith("MAX")) {
            return this.handleMax(formula);
        } else if (formula.startsWith("AVG")) {
            return this.handleAverage(formula);
        }
        
        throw new Error("Unsupported formula: " + formula);
    }

    // Utility function to convert a cell reference like A1 to row, col
    getCellPosition(cellRef) {
        const col = cellRef.charCodeAt(0) - 'A'.charCodeAt(0); // A = 0, B = 1, ...
        const row = parseInt(cellRef.slice(1)) - 1; // Row starts from 0
        return { row, col };
    }

    // Extract range from a formula like A1:B4
    getRange(range) {
        const [startCell, endCell] = range.split(":");
        const start = this.getCellPosition(startCell);
        const end = this.getCellPosition(endCell);
        return { start, end };
    }

    // Handle SUM function
    handleSum(formula) {
        console.log("hello12")
        const range = formula.match(/\((.*?)\)/)[1]; // Extract the range inside parentheses
        const { start, end } = this.getRange(range);

        let sum = 0;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row+1, col+1);
                sum += (value ? parseFloat(value) : 0);
            }
        }
        return sum;
    }

    // Handle MIN function
    handleMin(formula) {
        const range = formula.match(/\((.*?)\)/)[1];
        const { start, end } = this.getRange(range);

        let min = Infinity;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row, col);
                if (value !== null) {
                    min = Math.min(min, parseFloat(value));
                }
            }
        }
        return min === Infinity ? 0 : min;
    }

    // Handle MAX function
    handleMax(formula) {
        const range = formula.match(/\((.*?)\)/)[1];
        const { start, end } = this.getRange(range);

        let max = -Infinity;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row, col);
                if (value !== null) {
                    max = Math.max(max, parseFloat(value));
                }
            }
        }
        return max === -Infinity ? 0 : max;
    }

    // Handle AVERAGE function
    handleAverage(formula) {
        const range = formula.match(/\((.*?)\)/)[1];
        const { start, end } = this.getRange(range);

        let sum = 0, count = 0;
        for (let row = start.row; row <= end.row; row++) {
            for (let col = start.col; col <= end.col; col++) {
                const value = this.matrix.getCellvalue(row, col);
                if (value !== null) {
                    sum += parseFloat(value);
                    count++;
                }
            }
        }
        return count === 0 ? 0 : sum / count;
    }
}
