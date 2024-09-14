class Node {
    constructor(rowValue, colValue, value, nextRow = null, nextCol = null, prevCol = null, prevRow = null) {
        this.rowValue = rowValue; // Direct row value
        this.colValue = colValue; // Direct column value
        this.value = value;
        this.nextRow = nextRow;
        this.nextCol = nextCol;
        this.prevRow = prevRow;
        this.prevCol = prevCol;
    }
}

export class SparseMatrix {
    constructor() {
        this.rowHeaders = {}; // Stores the head of each row linked list
        this.colHeaders = {}; // Stores the head of each column linked list
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

    // Insert a cell into the sparse matrix
    createCell(row, col, value) {
        if (this._cellExists(row, col)) {
            return;
        }

        let newNode = new Node(row, col, value);

        // Insert into row list
        if (!this.rowHeaders[row]) {
            this.rowHeaders[row] = newNode;
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
            this.colHeaders[col] = newNode;
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
    }

    // Shift cells to the right
    _shiftCellsRight(row, col) {
        let current = this.rowHeaders[row];
        let prev = null;

        while (current && current.colValue < col) {
            prev = current;
            current = current.nextCol;
        }

        while (current) {
            let newColValue = current.colValue + 1;
            let newNode = new Node(current.rowValue, newColValue, current.value);

            newNode.nextCol = current.nextCol;
            newNode.prevCol = prev;
            if (current.nextCol) current.nextCol.prevCol = newNode;
            if (prev) prev.nextCol = newNode;
            else this.rowHeaders[row] = newNode;

            let currentInNewCol = this.colHeaders[newColValue];
            while (currentInNewCol.nextRow && currentInNewCol.nextRow.rowValue < row) {
                currentInNewCol = currentInNewCol.nextRow;
            }

            newNode.prevRow = currentInNewCol;
            newNode.nextRow = currentInNewCol.nextRow;
            currentInNewCol.nextRow = newNode;
            if (newNode.nextRow) newNode.nextRow.prevRow = newNode;

            if (current.prevRow) current.prevRow.nextRow = current.nextRow;
            if (current.nextRow) current.nextRow.prevRow = current.prevRow;

            prev = newNode;
            current = newNode.nextCol;
        }
    }

    // Shift cells down
    _shiftCellsDown(row, col) {
        let current = this.colHeaders[col];
        let prev = null;

        while (current && current.rowValue < row) {
            prev = current;
            current = current.nextRow;
        }

        while (current) {
            let newRowValue = current.rowValue + 1;
            let newNode = new Node(newRowValue, current.colValue, current.value);

            newNode.nextRow = current.nextRow;
            newNode.prevRow = prev;
            if (current.nextRow) current.nextRow.prevRow = newNode;
            if (prev) prev.nextRow = newNode;
            else this.colHeaders[col] = newNode;

            let currentInNewRow = this.rowHeaders[newRowValue];
            while (currentInNewRow.nextCol && currentInNewRow.nextCol.colValue < col) {
                currentInNewRow = currentInNewRow.nextCol;
            }

            newNode.prevCol = currentInNewRow;
            newNode.nextCol = currentInNewRow.nextCol;
            currentInNewRow.nextCol = newNode;
            if (newNode.nextCol) newNode.nextCol.prevCol = newNode;

            if (this.rowHeaders[current.rowValue] === current) {
                this.rowHeaders[current.rowValue] = current.nextCol;
                if (current.nextCol) current.nextCol.prevCol = null;
            } else {
                if (current.prevCol) current.prevCol.nextCol = current.nextCol;
                if (current.nextCol) current.nextCol.prevCol = current.prevCol;
            }

            prev = newNode;
            current = newNode.nextRow;
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



    // Getter function to retrieve the value at a specific row and column
    getCell(row, col) {
        if (!this.rowHeaders[row]) return null;

        let current = this.rowHeaders[row];
        while (current) {
            if (current.colValue === col) {
                return current.value;
            }
            current = current.nextCol;
        }
        return null;
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
    
    

    setCell(row, col, value) {
        if (!this.rowHeaders[row]) {
            this.createCell(row, col, value);
        } else {
            let current = this.rowHeaders[row];
            while (current) {
                if (current.colValue === col) {
                    current.value = value;
                    return;
                }
                if (!current.nextCol || current.nextCol.colValue > col) {
                    let newNode = new Node(row, col, value, null, current.nextCol, current);
                    if (current.nextCol) current.nextCol.prevCol = newNode;
                    current.nextCol = newNode;
                    break;
                }
                current = current.nextCol;
            }
        }

        if (!this.colHeaders[col]) {
            this.createCell(row, col, value);
        } else {
            let current = this.colHeaders[col];
            while (current) {
                if (current.rowValue === row) {
                    current.value = value;
                    return;
                }
                if (!current.nextRow || current.nextRow.rowValue > row) {
                    let newNode = new Node(row, col, value, current.nextRow, null, null, current);
                    if (current.nextRow) current.nextRow.prevRow = newNode;
                    current.nextRow = newNode;
                    break;
                }
                current = current.nextRow;
            }
        }
    }

    // Print the matrix by rows
    printMatrixbyrow() {
        for (let row in this.rowHeaders) {
            let current = this.rowHeaders[row];
            let rowValues = [];
            while (current) {
                rowValues.push(`${current.value}`);
                current = current.nextCol;
            }
            console.log(rowValues.join(' -> '));
        }
    }

    // Print the matrix by columns
    printMatrixbycol() {
        for (let col in this.colHeaders) {
            let current = this.colHeaders[col];
            let colValues = [];
            while (current) {
                colValues.push(`${current.value}`);
                current = current.nextRow;
            }
            console.log(colValues.join(' -> '));
        }
    }
}


