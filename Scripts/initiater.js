import {Emaker} from './eMaker.js'


class ExcelBorderHighlighter {
    constructor(excelContainer) {
        this.excelContainer = excelContainer;
        this.selectedDiv = null;
        this.handleClick = this.handleClick.bind(this);
        this.addClickListener();
    }
  
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
  
    addClickListener() {
        this.excelContainer.addEventListener('click', this.handleClick);
    }
}

class Excel {
    constructor(rowContainer, row, col,Grid_maker) {
        this.rowContainer = rowContainer;
        this.col = col;
        this.row = row;
        this.Grid_maker = Grid_maker
        this.init();
    }

    init() {
        this.constructExcel();
        //document.querySelector('form').addEventListener('submit', (e) => this.handleFileUpload(e));
    }

    async handleFileUpload(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        console.log(formData);
        
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
 
    constructExcel() {
        const excel = document.createElement('div');
        excel.className = 'excel resizable';
        excel.setAttribute('id', `rowCol${this.row}_${this.col}`);
        excel.setAttribute('role', 'gridcell');
        excel.setAttribute('aria-rowindex', this.row);
        excel.setAttribute('aria-colindex', this.col);
        excel.style.flex = '1';
        this.rowContainer.appendChild(excel);
        this.element = excel;
        new Emaker(excel, this.row, this.col,this.Grid_maker);
        
    }

    updateCurrExcel(excelRow,excelCol,sheetObj){

        this.currExcelRow = excelRow;
        this.currExcelCol = excelCol;
        this.currSheetObj = sheetObj;
        console.log("updated row col as ",excelRow,excelCol,sheetObj);
        console.log(this.currSheetObj.instance);
    }
}

class Grid_maker {
    constructor(mainContainer, maxRow, maxCol) {
        this.mainContainer = mainContainer;
        this.maxRow = maxRow;
        this.maxCol = maxCol;
        this.currentRowCount = 0;
        this.rowArr = [];
        this.init();
    }

    

    init() {
        this.mainContainer.style.display = 'flex';
        this.mainContainer.style.flexDirection = 'column';
        this.addNewRow();       
        this.addResizeHandles();
        this.handleResize();
        this.borderHighlighter = new ExcelBorderHighlighter(this.mainContainer);
        document.querySelector('form').addEventListener('submit', (e) => this.handleFileUpload(e));
        // Add event listeners to buttons
        document.querySelector('.add-new-row').addEventListener('click', () => this.addNewRow());
        document.querySelector('.add-new-col').addEventListener('click', () => this.addNewCol(this.currExcelRow)); // Adjust as necessary

        // Handle file upload
        document.querySelector('form').addEventListener('submit', (e) => this.handleFileUpload(e));
    }

    async handleFileUpload(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        console.log(formData);
        
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

    updateCurrExcel(excelRow,excelCol,sheetObj){

        this.currExcelRow = excelRow;
        this.currExcelCol = excelCol;
        this.currSheetObj = sheetObj;
    }

    

    

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

        const excel = new Excel(row, this.currentRowCount, 1,this);
        this.rowArr[this.currentRowCount - 1] = [excel];
        this.mainContainer.appendChild(row);
    }

    addNewCol(rowNum) {
        if (rowNum > this.currentRowCount) return;
        let colCount = this.rowArr[rowNum - 1].length;
        if (colCount >= this.maxCol) {
            alert("No more columns can be added");
            return;
        }

        colCount += 1;
        const row = document.getElementById(`row_${rowNum}`);
        const excel = new Excel(row, rowNum, colCount,this);
        this.rowArr[rowNum - 1].push(excel);
    }

    addResizeHandles() {
        this.rowArr.forEach((row, rowIndex) => {
            const rowElement = document.getElementById(`row_${rowIndex + 1}`);

            // Add row resize handle
            if (rowIndex < this.rowArr.length - 1) {
                const rowResizeHandle = document.createElement('div');
                rowResizeHandle.className = 'row-resize-handle';
                rowElement.appendChild(rowResizeHandle);
            }

            row.forEach((cell, colIndex) => {
                // Add column resize handle
                if (colIndex < row.length - 1) {
                    const colResizeHandle = document.createElement('div');
                    colResizeHandle.className = 'col-resize-handle';
                    cell.element.appendChild(colResizeHandle);
                }
            });
        });
    }

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
                currentElement.style.flex = 'none'; // Override flex settings
            } else if (resizeType === 'row') {
                const height = startHeight + (e.clientY - startY);
                // Ensure the height does not go below a minimum value (e.g., 50px)
                const newHeight = Math.max(height, 50);
                currentElement.style.height = `${newHeight}px`;
                currentElement.style.flex = 'none'; // Override flex settings
            }

            // Force a reflow/repaint to make sure the changes are applied
            currentElement.style.display = 'none';
            currentElement.offsetHeight; // Trigger reflow
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

function init(mainContainer) {
    new Grid_maker(mainContainer, 3, 3);
}

document.addEventListener('DOMContentLoaded', () => {
    let mainContainer = document.getElementById("mainContainer");
    init(mainContainer);
});
