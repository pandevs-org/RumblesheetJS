import { Emaker } from './Emaker/eMaker.js';

/**
 * Represents an Excel-like grid component.
 */
class Excel {
    /**
     * Constructs an Excel instance.
     * @param {HTMLElement} rowContainer - The container element for the row.
     * @param {number} row - The current row number.
     * @param {number} col - The current column number.
     * @param {Grid_maker} Grid_maker - The Grid_maker instance for managing the grid.
     */
    constructor(rowContainer, row, col, Grid_maker) {
        this.rowContainer = rowContainer;
        this.col = col;
        this.row = row;
        this.Grid_maker = Grid_maker;
        this.init();
    }

    /**
     * Initializes the Excel component by constructing it.
     */
    init() {
        this.constructExcel();
    }

    /**
     * Handles file upload and sends it to the server for processing.
     * @param {Event} e - The event triggered on form submission.
     */
    async handleFileUpload(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const response = await fetch('http://localhost:5228/api/Data/uploadAndCreateTable', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            this.currSheetObj.instance.UploadAndFetch.showTableCreationPopup(data.columns, data.tempFilePath);
        } else {
            alert('Error uploading file');
        }
    }

    /**
     * Constructs the individual Excel cell.
     */
    constructExcel() {
        const excel = document.createElement('div');
        excel.className = 'excel resizable';
        excel.id = `rowCol${this.row}_${this.col}`;
        excel.role = 'gridcell';
        excel.ariaRowIndex = this.row;
        excel.ariaColIndex = this.col;
        excel.style.flex = '1';
        this.rowContainer.appendChild(excel);
        this.element = excel;
        new Emaker(excel, this.row, this.col, this.Grid_maker);
    }

    /**
     * Updates the current Excel instance with the new row, column, and sheet object.
     * @param {number} excelRow - The current row index.
     * @param {number} excelCol - The current column index.
     * @param {Object} sheetObj - The current sheet object.
     */
    updateCurrExcel(excelRow, excelCol, sheetObj) {
        this.currExcelRow = excelRow;
        this.currExcelCol = excelCol;
        this.currSheetObj = sheetObj;
    }
}
/**
 * Class representing a grid maker.
 */
class GridMaker {
    /**
     * Create a grid maker.
     * @param {HTMLElement} mainContainer - The main container to hold the grid.
     * @param {number} maxRow - Maximum number of rows.
     * @param {number} maxCol - Maximum number of columns.
     */
    constructor(mainContainer, maxRow, maxCol) {
        this.mainContainer = mainContainer;
        this.maxRow = maxRow;
        this.maxCol = maxCol;
        this.selectedDiv = null;
        this.currentRowCount = 0;
        this.rowArr = [];
        this.init();
    }

    /**
     * Initialize the grid maker and set up event listeners.
     */
    init() {
        this.mainContainer.style.display = 'flex';
        this.mainContainer.style.flexDirection = 'column';
        this.addNewRow();
        this.handleClick = this.handleClick.bind(this);
        this.setupEventListeners();
    }

    /**
     * Set up the event listeners for various interactions in the grid.
     */
    setupEventListeners() {
        document.querySelector('form').addEventListener('submit', (e) => this.handleFileUpload(e));
        document.querySelector('.add-new-row').addEventListener('click', () => this.addNewRow());
        document.querySelector('.add-new-col').addEventListener('click', () => this.addNewCol(this.currExcelRow));
        document.querySelector('.delete-excel').addEventListener('click', () => this.deleteExcel(this.currExcelRow, this.currExcelCol));
        this.mainContainer.addEventListener('click', this.handleClick);
    }

    /**
     * Handle click events to update the selected cell.
     * @param {MouseEvent} event - The click event.
     */
    handleClick(event) {
        if (this.selectedDiv) {
            this.selectedDiv.style.border = '1px solid black';
        }

        const targetDiv = event.target.closest('div[aria-rowindex][aria-colindex]');
        
        if (targetDiv) {
            targetDiv.style.border = '1px solid red';
            this.selectedDiv = targetDiv;
        }
    }

    /**
     * Delete a specific Excel cell by row and column number.
     * @param {number} rowNum - The row number to delete from.
     * @param {number} colNum - The column number to delete.
     */
    deleteExcel(rowNum, colNum) {
        const rowElement = document.getElementById(`row_${rowNum}`);
        if (rowElement) {
            const cells = rowElement.querySelectorAll('.excel');
            if (cells[colNum - 1]) {
                rowElement.removeChild(cells[colNum - 1]);
            }
        }

        this.rowArr[rowNum - 1].splice(colNum - 1, 1);

        if (this.rowArr[rowNum - 1].length === 0) {
            this.deleteRow(rowNum);
            return;
        }

        this.rowArr.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const updatedColNum = colIndex + 1;
                if (updatedColNum >= colNum) {
                    cell.element.style.gridColumn = updatedColNum;
                    cell.element.dataset.col = updatedColNum;
                }
            });
        });

        this.addResizeHandles();
    }

    /**
     * Delete a specific row.
     * @param {number} rowNum - The row number to delete.
     */
    deleteRow(rowNum) {
        const rowElement = document.getElementById(`row_${rowNum}`);
        if (rowElement) {
            this.mainContainer.removeChild(rowElement);
        }

        this.rowArr.splice(rowNum - 1, 1);

        for (let i = rowNum; i <= this.currentRowCount; i++) {
            const rowElement = document.getElementById(`row_${i}`);
            if (rowElement) {
                rowElement.id = `row_${i - 1}`;
                const cells = rowElement.querySelectorAll('.excel');
                cells.forEach((cell) => {
                    cell.dataset.row = i - 1;
                });
            }
        }

        this.currentRowCount--;
        this.addResizeHandles();
    }

    /**
     * Handle the file upload event and send data to the server.
     * @param {Event} e - The form submit event.
     */
    async handleFileUpload(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const response = await fetch('http://localhost:5228/api/Data/uploadAndCreateTable', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            this.currSheetObj.instance.UploadAndFetch.showTableCreationPopup(data.columns, data.tempFilePath);
        } else {
            alert('Error uploading file');
        }
    }

    /**
     * Update the current active Excel cell.
     * @param {number} excelRow - The Excel row number.
     * @param {number} excelCol - The Excel column number.
     * @param {Object} sheetObj - The sheet object reference.
     */
    updateCurrExcel(excelRow, excelCol, sheetObj) {
        this.currExcelRow = excelRow;
        this.currExcelCol = excelCol;
        this.currSheetObj = sheetObj;
    }

    /**
     * Add a new row to the grid.
     */
    addNewRow() {
        if (this.currentRowCount >= this.maxRow) {
            alert("No more rows can be added");
            return;
        }

        this.currentRowCount += 1;
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row_${this.currentRowCount}`;
        row.style.flex = '1';

        const excel = new Excel(row, this.currentRowCount, 1, this);
        this.rowArr[this.currentRowCount - 1] = [excel];
        this.mainContainer.appendChild(row);
        this.addResizeHandles();
        this.handleResize();
    }

    /**
     * Add a new column to the specified row.
     * @param {number} rowNum - The row number to add a column to.
     */
    addNewCol(rowNum) {
        if (rowNum > this.currentRowCount) return;
        let colCount = this.rowArr[rowNum - 1].length;
        if (colCount >= this.maxCol) {
            alert("No more columns can be added");
            return;
        }

        colCount += 1;
        const row = document.getElementById(`row_${rowNum}`);
        const excel = new Excel(row, rowNum, colCount, this);
        this.rowArr[rowNum - 1].push(excel);
        this.addResizeHandles();
        this.handleResize();
    }

    /**
     * Add resize handles to rows and columns.
     */
    addResizeHandles() {
        this.rowArr.forEach((row, rowIndex) => {
            const rowElement = document.getElementById(`row_${rowIndex + 1}`);

            if (rowIndex < this.rowArr.length - 1) {
                const rowResizeHandle = document.createElement('div');
                rowResizeHandle.className = 'row-resize-handle';
                rowElement.appendChild(rowResizeHandle);
            }

            row.forEach((cell, colIndex) => {
                if (colIndex < row.length - 1) {
                    const colResizeHandle = document.createElement('div');
                    colResizeHandle.className = 'col-resize-handle';
                    cell.element.appendChild(colResizeHandle);
                }
            });
        });
    }

    /**
     * Handle the resize action for rows and columns.
     */
    handleResize() {
        let isResizing = false;
        let currentElement = null;
        let startX, startY, startWidth, startHeight;
        let resizeType = '';

        const startResize = (e) => {
            if (e.target.classList.contains('col-resize-handle')) {
                currentElement = e.target.closest('.excel');
                resizeType = 'column';
            } else if (e.target.classList.contains('row-resize-handle')) {
                currentElement = e.target.closest('.row');
                resizeType = 'row';
            } else {
                return;
            }

            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = currentElement.offsetWidth;
            startHeight = currentElement.offsetHeight;

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        };

        const resize = (e) => {
            if (!isResizing) return;

            if (resizeType === 'column') {
                const width = startWidth + (e.clientX - startX);
                currentElement.style.width = `${width}px`;
                currentElement.style.flex = 'none';
            } else if (resizeType === 'row') {
                const height = startHeight + (e.clientY - startY);
                const newHeight = Math.max(height, 50);
                currentElement.style.height = `${newHeight}px`;
                currentElement.style.flex = 'none';
            }

            currentElement.style.display = 'none';
            currentElement.offsetHeight;
            currentElement.style.display = '';
        };

        const stopResize = () => {
            isResizing = false;
            currentElement = null;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };

        this.mainContainer.addEventListener('mousedown', startResize);
    }
}

/**
 * Initialize the grid maker.
 * @param {HTMLElement} mainContainer - The main container for the grid.
 */
function init(mainContainer) {
    new GridMaker(mainContainer, 3, 3);
}

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById("mainContainer");
    init(mainContainer);
});
