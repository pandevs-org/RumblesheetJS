class Node{
    constructor(sharedRow, sharedCol, value, nextRow = null, nextCol = null, prevCol = null, prevRow = null){
        this.sharedRow = sharedRow;
        this.sharedCol = sharedCol
        this.value = value;
        this.nextRow = nextRow;
        this.nextCol = nextCol;
        this.prevRow = prevRow;
        this.prevCol = prevCol;
    }
    // Getter and setter for row and column

    get rowValue(){
        return this.sharedRow.value;
    }
    set rowValue(newValue){
        this.sharedRow.value = newValue;
    }
    get colValue(){
        return this.sharedCol.value;
    }
    set colValue(newValue){
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
            console.log(this.sharedRows)
        }
        if (!this.sharedCols[col]) {
            this.sharedCols[col] = { value: null }; // Create shared column object
            console.log(this.sharedCols)
        }
    }

    // Insert a cell with shared row and column references
    createCell(row, col, rowValue, colValue) {
        this._ensureSharedRefs(row, col);
        let newNode = new Node(this.sharedRows[row], this.sharedCols[col]);

        // Insert into row list
        if (!this.rowHeaders[row]) {
            this._ensureSharedRefs(row,0)
            let tempNode = new Node(this.sharedRows[row], {value:0})
            this.sharedCols[0].value = colValue;
            this.rowHeaders[row] = tempNode;
            tempNode.nextCol = newNode;
            newNode.prevCol = tempNode;
        } else {
            let current = this.rowHeaders[row];
            while (current.nextCol && current.colValue < col) {
                current = current.nextCol;
                if (col == 6 || col == 4){
                    console.log(current.colValue,col-1)
                }
            }
            let temp = current.prevcol;
            temp.nextCol = newNode;
            newNode.nextCol = current;
            newNode.prevCol = temp;
            console.log("This is from insert into row")
            console.log(current,newNode,temp)
            if (current){
                current.prevCol = newNode;
            }
            

        }

        // Insert into column list
        if (!this.colHeaders[col]) {
            this._ensureSharedRefs(0,col)
            let tempNode = new Node({value: 0}, this.sharedCols[col])
            this.sharedRows[0].value = rowValue
            this.colHeaders[col] = tempNode;
            tempNode.nextRow = newNode;
            newNode.prevRow = tempNode;
        } else {
            let current = this.colHeaders[col];
            console.log(current.rowValue,row)
            while (current.nextRow && current.rowValue < row-1) {
                current = current.nextRow;
            }
            let temp = current.nextRow
            console.log(current.colValue,col)
            current.nextRow = newNode;
            newNode.nextRow = temp;
            newNode.prevRow = current;
            temp.prevRow = newNode;
        }

        // Set the initial values
        this.sharedRows[row].value = rowValue;
        this.sharedCols[col].value = colValue;
    }
    // Insert a cell by shifting each cell right
    insertCellShiftRight(row,col){
        
    }
    // Change the value of a specific row
    changeRowValue(row, newValue) {
        if (!this.sharedRows[row]) {
            throw new Error("Row does not exist");
        }
        this.sharedRows[row].value = newValue;
    }

    // Change the value of a specific column
    changeColValue(col, newValue) {
        if (!this.sharedCols[col]) {
            throw new Error("Column does not exist");
        }
        this.sharedCols[col].value = newValue;
    }

    // Print the matrix
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
}

let matrix = new SparseMatrix();

matrix.createCell(1,1,1,1)
matrix.createCell(1,2,1,2)
matrix.createCell(1,3,1,3)
matrix.createCell(1,10,1,10)
matrix.createCell(1,4,1,4)
matrix.createCell(1,6,1,6)
console.log("Print original matrix by row (1,1,1,1) (1,2,1,2) (1,3,1,3) ")
matrix.printMatrixbyrow()

console.log("Print original matrix by col (1,0,1,0) ")
matrix.printMatrixbycol()

// matrix.createCell(1,1,1,1)
// console.log("Print original matrix by row (1,1,1,1) ")
// matrix.printMatrixbyrow()

// console.log("Print original matrix by col (1,1,1,1) ")
// matrix.printMatrixbycol()
// matrix.createCell(1,2,1,2)
// console.log("Print original matrix by row (1,2,1,2) ")
// matrix.printMatrixbyrow()

// console.log("Print original matrix by col (1,2,1,2)")
// matrix.printMatrixbycol()
// matrix.createCell(1,3,1,3)
// console.log("Print original matrix by row (1,3,1,3) ")
// matrix.printMatrixbyrow()

// console.log("Print original matrix by col(1,3,1,3) ")
// matrix.printMatrixbycol()
// matrix.createCell(3,3,3,3)
// console.log("Print original matrix by row (3,3,3,3) ")
// matrix.printMatrixbyrow()

// console.log("Print original matrix by col (3,3,3,3)")
// matrix.printMatrixbycol()

// matrix.createCell(2,2,2,2)

// console.log("Print original matrix by row (2,2,2,2) ")
// matrix.printMatrixbyrow()

// console.log("Print original matrix by col (2,2,2,2) ")
// matrix.printMatrixbycol()

// matrix.createCell(4,8,4,8)

// console.log("Print original matrix by row (4,8,4,8) ")
// matrix.printMatrixbyrow()

// console.log("Print original matrix by col (4,8,4,8)")
// matrix.printMatrixbycol()