class Node {
    constructor(sharedRow, sharedCol, value, nextRow = null, nextCol = null, prevCol = null, prevRow = null) {
        this.sharedRow = sharedRow;
        this.sharedCol = sharedCol
        this.value = value;
        this.nextRow = nextRow;
        this.nextCol = nextCol;
        this.prevRow = prevRow;
        this.prevCol = prevCol;
    }
    // Getter and setter for row and column

    get rowValue() {
        return this.sharedRow.value;
    }
    set rowValue(newValue) {
        this.sharedRow.value = newValue;
    }
    get colValue() {
        return this.sharedCol.value;
    }
    set colValue(newValue) {
        this.sharedCol.value = newValue;
    }

}


class SparseMatrix {
    constructor() {
        this.rowHeaders = {}; // Stores the head of each row linked list
        this.colHeaders = {}; // Stores the head of each column linked list
        this.sharedRows = {}; // Stores shared row objects
        this.sharedCols = {}; // Stores shared column objects
    }

    // Helper function to ensure shared row and column objects exist
    _ensureSharedRefs(row, col) {
        if (!this.sharedRows[row]) {
            this.sharedRows[row] = { value: null }; // Create shared row object

        }
        if (!this.sharedCols[col]) {
            this.sharedCols[col] = { value: null }; // Create shared column object

        }
    }

    // Check if a cell already exists at the given row and column
    _cellExists(row, col) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) {
                return true;
            }
            current = current.nextCol;
        }
        return false;
    }

    // Insert a cell with shared row and column references
    createCell(row, col, rowValue, colValue , Value) {
        if (this._cellExists(row, col)) {
            console.log("try other location");
            return;
        }

        this._ensureSharedRefs(row, col);
        let newNode = new Node(this.sharedRows[row], this.sharedCols[col], Value);

        // Insert into row list
        if (!this.rowHeaders[row]) {
            this._ensureSharedRefs(row, 0);
            let tempNode = new Node(this.sharedRows[row], { value: 0 });
            this.sharedCols[0].value = colValue;
            this.rowHeaders[row] = tempNode;
            tempNode.nextCol = newNode;
            newNode.prevCol = tempNode;
        } else {
            let current = this.rowHeaders[row];
            let prev = null;
            while (current && current.colValue < col) {
                prev = current;
                current = current.nextCol;
            }
            if (prev) {
                prev.nextCol = newNode;
                newNode.prevCol = prev;
            } else {
                this.rowHeaders[row] = newNode;
            }
            newNode.nextCol = current;
            if (current) {
                current.prevCol = newNode;
            }
        }

        // Insert into column list
        if (!this.colHeaders[col]) {
            this._ensureSharedRefs(0, col);
            let tempNode = new Node({ value: 0 }, this.sharedCols[col]);
            this.sharedRows[0].value = rowValue;
            this.colHeaders[col] = tempNode;
            tempNode.nextRow = newNode;
            newNode.prevRow = tempNode;
        } else {
            let current = this.colHeaders[col];
            let prev = null;
            while (current && current.rowValue < row) {
                prev = current;
                current = current.nextRow;
            }
            if (prev) {
                prev.nextRow = newNode;
                newNode.prevRow = prev;
            } else {
                this.colHeaders[col] = newNode;
            }
            newNode.nextRow = current;
            if (current) {
                current.prevRow = newNode;
            }
        }

        // Set the initial values
        this.sharedRows[row].value = rowValue;
        this.sharedCols[col].value = colValue;
    }

    _shiftCellsRight(row, col) {
        let current = this.rowHeaders[row];
        let prev = null;
        while (current && current.colValue < col) {
            prev = current;
            current = current.nextCol;
        }
        current = prev;
        // Shift cells to the right
        while (current) {
            let nextCol = current.nextCol;
            let newColValue = current.colValue + 1;

            // Update the current node's column value
            current.colValue = newColValue;

            // Update the column headers if necessary
            if (this.colHeaders[current.colValue - 1] === current) {
                delete this.colHeaders[current.colValue - 1];
                this.colHeaders[newColValue] = current;
            }

            current = nextCol;
        }
    }

    insertCellShiftRight(row, col, rowValue, colValue) {
        this._ensureSharedRefs(row, col);

        // Shift cells to the right
        this._shiftCellsRight(row, col);

        // Insert the new cell
        this.createCell(row, col, rowValue, colValue);
    }

    // Print the matrix in row format
    printMatrixbyrow() {
        for (let row in this.rowHeaders) {
            let current = this.rowHeaders[row];
            let rowValues = [];
            while (current) {
                rowValues.push(`${row}(row: ${current.rowValue}, col: ${current.colValue})`);
                current = current.nextCol;
            }
            console.log(rowValues.join(' -> '));
        }
    }

    // Print the matrix in column format
    printMatrixbycol() {
        for (let col in this.colHeaders) {
            let current = this.colHeaders[col];
            let rowValues = [];
            while (current) {
                rowValues.push(`${col}(col: ${current.colValue}, row: ${current.rowValue})`);
                current = current.nextRow;
            }
            console.log(rowValues.join(' -> '));
        }
    }

    // Print the matrix in a traditional row-column format
    printMatrix() {
        // Find the maximum row and column indices
        let maxRow = Math.max(...Object.keys(this.sharedRows).map(Number));
        let maxCol = Math.max(...Object.keys(this.sharedCols).map(Number));

        // Initialize an empty matrix
        let matrix = [];
        for (let i = 0; i <= maxRow; i++) {
            matrix.push(new Array(maxCol + 1).fill(null));
        }

        // Fill the matrix with values
        for (let row in this.rowHeaders) {
            let current = this.rowHeaders[row];
            while (current) {
                matrix[row][current.colValue] = current.value;
                current = current.nextCol;
            }
        }

        // Print the matrix
        for (let i = 0; i <= maxRow; i++) {
            let rowStr = matrix[i].map(value => (value !== null ? value : '0')).join(' ');
            console.log(rowStr);
        }
    }

}

// Example usage
let matrix = new SparseMatrix();

console.log("Checking for insertion of row");
matrix.createCell(1, 1, 1, "a");
matrix.createCell(1, 2, 1, "b");
matrix.createCell(1, 3, 1, "c");
matrix.createCell(1, 10, 1, "d");
matrix.createCell(1, 4, 1, "e");
matrix.createCell(1, 6, 1, "f");

console.log("Checking for insertion of col");
matrix.createCell(2, 1, 2, "g");
matrix.createCell(3, 1, 3, "h");
matrix.createCell(4, 1, 4, "i");
matrix.createCell(4, 2, 4, "j");
matrix.createCell(4, 3, 4, "k");

console.log("Matrix format:");
matrix.printMatrix();

console.log("Checking for right shift insert");
matrix.insertCellShiftRight(1, 4, 1, "x");

console.log("Matrix format after right shift insert:");
matrix.printMatrix();
