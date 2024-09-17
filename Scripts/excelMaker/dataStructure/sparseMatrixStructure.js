/**
 * Represents a single node in a sparse matrix.
 */
class Node {
    /**
     * @param {number} rowValue - The row index of the node.
     * @param {number} colValue - The column index of the node.
     * @param {any} value - The value stored in the node.
     * @param {Node|null} nextRow - Reference to the next node in the row.
     * @param {Node|null} nextCol - Reference to the next node in the column.
     * @param {Node|null} prevRow - Reference to the previous node in the row.
     * @param {Node|null} prevCol - Reference to the previous node in the column.
     */
    constructor(rowValue, colValue, value, nextRow = null, nextCol = null, prevRow = null, prevCol = null) {
        this.rowValue = rowValue;
        this.colValue = colValue;
        this.value = value;
        this.nextRow = nextRow;
        this.nextCol = nextCol;
        this.prevRow = prevRow;
        this.prevCol = prevCol;
        this.textAlign = "center";
        this.textBaseline = "middle";
        this.fontSize = 14;
        this.fontFamily = 'Arial';
        this.color = "black";
    }
}

/**
 * SparseMatrix class that represents a sparse matrix using linked lists for efficient storage and manipulation.
 */
export class SparseMatrix {
    constructor() {
        this.rowHeaders = {}; // Stores the head node of each row's linked list.
        this.colHeaders = {}; // Stores the head node of each column's linked list.
    }

    /**
     * Checks if a cell exists at the specified row and column.
     * @private
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @returns {boolean} - Returns true if the cell exists, false otherwise.
     */
    _cellExists(row, col) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) return true;
            current = current.nextCol;
        }
        return false;
    }

    /**
     * Shifts all nodes in a row to a new row index.
     * @private
     * @param {number} row - The current row index.
     * @param {number} newRow - The new row index to shift to.
     */
    _shiftRow(row, newRow) {
        let current = this.rowHeaders[row];
        while (current) {
            current.rowValue = newRow;
            current = current.nextCol;
        }
        this.rowHeaders[newRow] = this.rowHeaders[row];
        delete this.rowHeaders[row];
    }

    /**
     * Shifts all nodes in a column to a new column index.
     * @private
     * @param {number} col - The current column index.
     * @param {number} newCol - The new column index to shift to.
     */
    _shiftColumn(col, newCol) {
        let current = this.colHeaders[col];
        while (current) {
            current.colValue = newCol;
            current = current.nextRow;
        }
        this.colHeaders[newCol] = this.colHeaders[col];
        delete this.colHeaders[col];
    }

    /**
     * Inserts a new node into the correct position in a row's linked list.
     * @private
     * @param {number} row - The row index.
     * @param {Node} newNode - The node to insert.
     */
    _insertNodeInRow(row, newNode) {
        let current = this.rowHeaders[row];
        let prev = null;

        while (current && current.colValue < newNode.colValue) {
            prev = current;
            current = current.nextCol;
        }

        if (prev) {
            prev.nextCol = newNode;
            newNode.prevCol = prev;
        } else {
            this.rowHeaders[row] = newNode;
        }

        if (current) {
            newNode.nextCol = current;
            current.prevCol = newNode;
        }
    }

    /**
     * Inserts a new node into the correct position in a column's linked list.
     * @private
     * @param {number} col - The column index.
     * @param {Node} newNode - The node to insert.
     */
    _insertNodeInColumn(col, newNode) {
        let current = this.colHeaders[col];
        let prev = null;

        while (current && current.rowValue < newNode.rowValue) {
            prev = current;
            current = current.nextRow;
        }

        if (prev) {
            prev.nextRow = newNode;
            newNode.prevRow = prev;
        } else {
            this.colHeaders[col] = newNode;
        }

        if (current) {
            newNode.nextRow = current;
            current.prevRow = newNode;
        }

        console.log(`Inserted node at col ${col}, row ${newNode.rowValue}`);
    }

    /**
     * Shifts all cells to the right starting from the specified row and column.
     * @private
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     */
    _shiftCellsRight(row, col) {
        let current = this.rowHeaders[row];
        while (current && current.colValue < col) current = current.nextCol;

        while (current) {
            this._shiftColumn(current.colValue, current.colValue + 1);
            current = current.nextCol;
        }
    }

    /**
     * Shifts all cells down starting from the specified row and column.
     * @private
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     */
    _shiftCellsDown(row, col) {
        let current = this.colHeaders[col];
        while (current && current.rowValue < row) current = current.nextRow;

        while (current) {
            this._shiftRow(current.rowValue, current.rowValue + 1);
            current = current.nextRow;
        }
    }

    /**
     * Adds a new row in between existing rows by shifting rows down.
     * @param {number} newRow - The index of the new row to insert.
     */
    addRowInBetween(newRow) {
        Object.keys(this.rowHeaders)
            .map(Number)
            .sort((a, b) => b - a)
            .forEach(row => {
                if (row >= newRow) this._shiftRow(row, row + 1);
            });

        for (let col in this.colHeaders) {
            const newNode = new Node(newRow, parseInt(col), null);
            this._insertNodeInColumn(col, newNode);
        }
    }

    /**
     * Adds a new column in between existing columns by shifting columns to the right.
     * @param {number} newCol - The index of the new column to insert.
     */
    addColumnInBetween(newCol) {
        Object.keys(this.colHeaders)
            .map(Number)
            .sort((a, b) => b - a)
            .forEach(col => {
                if (col >= newCol) this._shiftColumn(col, col + 1);
            });

        for (let row in this.rowHeaders) {
            const newNode = new Node(parseInt(row), newCol, null);
            this._insertNodeInRow(row, newNode);
            this._insertNodeInColumn(newCol, newNode);
        }
    }

    /**
     * Deletes a row and shifts remaining rows up.
     * @param {number} rowToDelete - The index of the row to delete.
     */
    deleteRow(rowToDelete) {
        let current = this.rowHeaders[rowToDelete];
        while (current) {
            this._removeNodeFromColumn(current.colValue, rowToDelete);
            current = current.nextCol;
        }
        delete this.rowHeaders[rowToDelete];
        Object.keys(this.rowHeaders)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach(row => {
                if (row > rowToDelete) this._shiftRow(row, row - 1);
            });
    }

    /**
     * Deletes a column and shifts remaining columns left.
     * @param {number} colToDelete - The index of the column to delete.
     */
    deleteColumn(colToDelete) {
        let current = this.colHeaders[colToDelete];
        while (current) {
            this._removeNodeFromRow(current.rowValue, colToDelete);
            current = current.nextRow;
        }
        delete this.colHeaders[colToDelete];
        Object.keys(this.colHeaders)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach(col => {
                if (col > colToDelete) this._shiftColumn(col, col - 1);
            });
    }

    /**
     * Removes a node from a specific row.
     * @private
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     */
    _removeNodeFromRow(row, col) {
        let current = this.rowHeaders[row];
        let prev = null;

        while (current && current.colValue !== col) {
            prev = current;
            current = current.nextCol;
        }

        if (current) {
            if (prev) {
                prev.nextCol = current.nextCol;
            } else {
                this.rowHeaders[row] = current.nextCol;
            }

            if (current.nextCol) {
                current.nextCol.prevCol = prev;
            }
        }
    }

    /**
     * Removes a node from a specific column.
     * @private
     * @param {number} col - The column index.
     * @param {number} row - The row index.
     */
    _removeNodeFromColumn(col, row) {
        let current = this.colHeaders[col];
        let prev = null;

        while (current && current.rowValue !== row) {
            prev = current;
            current = current.nextRow;
        }

        if (current) {
            if (prev) {
                prev.nextRow = current.nextRow;
            } else {
                this.colHeaders[col] = current.nextRow;
            }

            if (current.nextRow) {
                current.nextRow.prevRow = prev;
            }
        }
    }

    /**
     * Creates a new cell at the specified row and column.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {any} value - The value to store in the cell.
     */
    createCell(row, col, value) {
        if (this._cellExists(row, col)) return;

        const newNode = new Node(row, col, value);
        if (!this.rowHeaders[row]) {
            this.rowHeaders[row] = newNode;
        } else {
            this._insertNodeInRow(row, newNode);
        }

        if (!this.colHeaders[col]) {
            this.colHeaders[col] = newNode;
        } else {
            this._insertNodeInColumn(col, newNode);
        }
    }

    /**
     * Inserts a cell with the specified value and shifts cells to the right.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {any} value - The value to store in the cell.
     */
    insertCellShiftRight(row, col, value) {
        this._shiftCellsRight(row, col);
        this.createCell(row, col, value);
    }

    /**
     * Inserts a cell with the specified value and shifts cells down.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {any} value - The value to store in the cell.
     */
    insertCellShiftDown(row, col, value) {
        this._shiftCellsDown(row, col);
        this.createCell(row, col, value);
    }

    /**
     * Gets the value of a cell at the specified row and column.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @returns {any|null} - The value of the cell, or null if the cell doesn't exist.
     */
    getCellvalue(row, col) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) return current.value;
            current = current.nextCol;
        }
        return null;
    }

    /**
     * Gets the node representing a cell at the specified row and column.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @returns {Node|null} - The node representing the cell, or null if the cell doesn't exist.
     */
    getCell(row, col) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) return current;
            current = current.nextCol;
        }
        return null;
    }

    /**
     * Sets the value of a cell. If the cell doesn't exist, it creates it.
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {any} value - The value to set in the cell.
     */
    setCell(row, col, value) {
        if (this._cellExists(row, col)) {
            this._updateCellValue(row, col, value);
        } else {
            this.createCell(row, col, value);
        }
    }

    /**
     * Updates the value of an existing cell.
     * @private
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {any} value - The value to set in the cell.
     */
    _updateCellValue(row, col, value) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) {
                current.value = value;
                return;
            }
            current = current.nextCol;
        }
    }

    /**
     * Prints the sparse matrix row by row.
     */
    printMatrixByRow() {
        for (let row in this.rowHeaders) {
            let current = this.rowHeaders[row];
            let rowValues = [];
            while (current) {
                rowValues.push(current.value || "null");
                current = current.nextCol;
            }
            console.log(`Row ${row}: ${rowValues.join(' -> ')}`);
        }
    }

    /**
     * Prints the sparse matrix column by column.
     */
    printMatrixByColumn() {
        for (let col in this.colHeaders) {
            let current = this.colHeaders[col];
            let colValues = [];
            while (current) {
                colValues.push(current.value || "null");
                current = current.nextRow;
            }
            console.log(`Column ${col}: ${colValues.join(' -> ')}`);
        }
    }
}
