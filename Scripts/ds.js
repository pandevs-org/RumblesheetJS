class Node {
    constructor(rowValue, colValue, value, nextRow = null, nextCol = null, prevRow = null, prevCol = null) {
        this.rowValue = rowValue;
        this.colValue = colValue;
        this.value = value;
        this.nextRow = nextRow;
        this.nextCol = nextCol;
        this.prevRow = prevRow;
        this.prevCol = prevCol;
    }
}

export class SparseMatrix {
    constructor() {
        this.rowHeaders = {}; // Stores the head of each row's linked list
        this.colHeaders = {}; // Stores the head of each column's linked list
    }

    _cellExists(row, col) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) return true;
            current = current.nextCol;
        }
        return false;
    }

    _shiftRow(row, newRow) {
        let current = this.rowHeaders[row];
        while (current) {
            current.rowValue = newRow;
            current = current.nextCol;
        }
        this.rowHeaders[newRow] = this.rowHeaders[row];
        delete this.rowHeaders[row];
    }

    _shiftColumn(col, newCol) {
        let current = this.colHeaders[col];
        while (current) {
            current.colValue = newCol;
            current = current.nextRow;
        }
        this.colHeaders[newCol] = this.colHeaders[col];
        delete this.colHeaders[col];
    }

    _insertNodeInRow(row, newNode) {
        let current = this.rowHeaders[row];
        let prev = null;

        while (current && current.colValue < newNode.colValue) {
            prev = current;
            current = current.nextCol;
        }

        // Insert node between `prev` and `current`
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

    _insertNodeInColumn(col, newNode) {
        let current = this.colHeaders[col];
        let prev = null;

        // Traverse the column and find the right position for the new node
        while (current && current.rowValue < newNode.rowValue) {
            prev = current;
            current = current.nextRow;
        }

        // Insert node between `prev` and `current` in the column
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

    _shiftCellsRight(row, col) {
        let current = this.rowHeaders[row];
        while (current && current.colValue < col) current = current.nextCol;

        while (current) {
            this._shiftColumn(current.colValue, current.colValue + 1);
            current = current.nextCol;
        }
    }

    _shiftCellsDown(row, col) {
        let current = this.colHeaders[col];
        while (current && current.rowValue < row) current = current.nextRow;

        while (current) {
            this._shiftRow(current.rowValue, current.rowValue + 1);
            current = current.nextRow;
        }
    }

    addRowInBetween(newRow) {
        Object.keys(this.rowHeaders).map(Number).sort((a, b) => b - a).forEach(row => {
            if (row >= newRow) this._shiftRow(row, row + 1);
        });

        for (let col in this.colHeaders) {
            const newNode = new Node(newRow, parseInt(col), null);
            this._insertNodeInColumn(col, newNode);
        }
    }

    addColumnInBetween(newCol) {
        console.log("Before shifting columns:", this.colHeaders);
        
        Object.keys(this.colHeaders).map(Number).sort((a, b) => b - a).forEach(col => {
            if (col >= newCol) this._shiftColumn(col, col + 1);
        });
    
        console.log("After shifting columns:", this.colHeaders);
        
        for (let row in this.rowHeaders) {
            const newNode = new Node(parseInt(row), newCol, null);
            this._insertNodeInRow(row, newNode);
            this._insertNodeInColumn(newCol, newNode); // Ensure node is added in both row and column
        }
    }
    
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

    insertCellShiftRight(row, col, value) {
        this._shiftCellsRight(row, col);
        this.createCell(row, col, value);
    }

    insertCellShiftDown(row, col, value) {
        this._shiftCellsDown(row, col);
        this.createCell(row, col, value);
    }

    getCell(row, col) {
        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) return current.value;
            current = current.nextCol;
        }
        return null;
    }

    setCell(row, col, value) {
        if (this._cellExists(row, col)) {
            this._updateCellValue(row, col, value);
        } else {
            this.createCell(row, col, value);
        }
    }

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

    async updateCellsInBackground(data, from) {
        const worker = new Worker('Scripts/cellworker.js');
        worker.onmessage = (event) => {
            const updates = event.data;
            updates.forEach(update => {
                this.setCell(update.row, update.col, update.value);
            });
        };
        worker.postMessage({ data, from });
    }
}
