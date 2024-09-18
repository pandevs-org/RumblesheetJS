export class CopyPasteManager {
    constructor(cellFunctionality, spreadsheetManager) {
        this.cellFunctionality = cellFunctionality;
        this.spreadsheetManager = spreadsheetManager;
        this.copiedData = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        if (event.ctrlKey && (event.key === 'x' || event.key === 'c')) {
            this.copySelectedCells();
        } else if (event.ctrlKey && event.key === 'v') {
            this.pasteSelectedCells();
        }
    }

    async copySelectedCells() {
        const selectedCells = this.cellFunctionality.selectedCells;
        if (selectedCells.length === 0) return;
    
        const minRow = Math.min(...selectedCells.map(cell => cell.row.value));
        const maxRow = Math.max(...selectedCells.map(cell => cell.row.value));
        const minCol = Math.min(...selectedCells.map(cell => this.cellFunctionality.cellUtility.letterToNumber(cell.column.value)));
        const maxCol = Math.max(...selectedCells.map(cell => this.cellFunctionality.cellUtility.letterToNumber(cell.column.value)));
    
        const copiedData = [];
        for (let row = minRow; row <= maxRow; row++) {
            const rowData = [];
            for (let col = minCol; col <= maxCol; col++) {
                const value = await this.spreadsheetManager.getValue(row, col);
                rowData.push(value !== null ? value : '');
            }
            copiedData.push(rowData);
        }
    
        const copiedText = copiedData.map(row => row.join('\t')).join('\n');
        this.copiedData = copiedData;
    
        try {
            await navigator.clipboard.writeText(copiedText);
            console.log('Cells copied to clipboard');
            this.cellFunctionality.startMarchingAnts();
        } catch (err) {
            console.error('Failed to copy cells:', err);
        }
    }
    

    async pasteSelectedCells() {
        const selectedCells = this.cellFunctionality.selectedCells;
        if (selectedCells.length === 0) {
            console.warn('No cells selected for pasting');
            return;
        }
    
        // Get clipboard data
        let clipboardData;
        try {
            clipboardData = await navigator.clipboard.readText();
        } catch (err) {
            console.error('Failed to read clipboard data: ', err);
            return;
        }
    
        if (!clipboardData || clipboardData.trim() === '') {
            console.warn('No data to paste from clipboard');
            return;
        }
    
        // Parse clipboard data
        const pastedData = clipboardData.split('\n').map(row => row.split('\t'));
    
        // Get the top-left cell of the selection as the starting point
        const startCell = selectedCells[0];
        const startRow = startCell.row.value;
        const startCol = this.cellFunctionality.cellUtility.letterToNumber(startCell.column.value);
    
        // Determine dimensions of pasted data
        const pastedRows = pastedData.length;
        const pastedCols = pastedData[0].length;
    
        // Validate parsed data
        if (pastedRows === 0 || pastedCols === 0) {
            console.error('Invalid pasted data');
            return;
        }
    
        // Use Web Worker for large data processing
        if (pastedRows * pastedCols > 10000) { // Example threshold for large data
            this.processLargeData(startRow, startCol, pastedData);
        } else {
            this.pastesmallData(startRow, startCol, pastedData);
        }
        console.log('Data pasted successfully');
    }
    
    async processLargeData(startRow, startCol, pastedData) {
        const CHUNK_SIZE = 1000; // Adjust as needed
        const totalRows = pastedData.length;
        
        for (let row = 0; row < totalRows; row += CHUNK_SIZE) {
            const chunk = pastedData.slice(row, row + CHUNK_SIZE);
            const worker = new Worker('Scripts/dataprocessor.js');
            
            worker.postMessage({ startRow: startRow + row, startCol, pastedData: chunk });
    
            worker.onmessage = (event) => {
                this.pastelargeData(event.data.startRow, event.data.startCol, event.data.processedData);
                worker.terminate();
            };
    
            worker.onerror = (error) => {
                console.error('Web Worker error:', error);
                worker.terminate();
            }
        }
    }
    
    pastesmallData(startRow, startCol, pastedData) {
        // Paste the clipboard data into cells
        for (let i = 0; i < pastedData.length; i++) {
            for (let j = 0; j < pastedData[i].length; j++) {
                const targetRow = startRow + i;
                const targetCol = startCol + j;
                const value = pastedData[i][j] !== undefined ? pastedData[i][j] : ''; // Ensure value is never undefined

                this.spreadsheetManager.sparseMatrix.setCell(targetRow, targetCol, value);
            }
        }

        // Redraw the sheet to reflect changes
        this.cellFunctionality.sheetRenderer.draw();
    }

    pastelargeData(startRow, startCol, pastedData) {
        for (let i = 0; i < pastedData.length; i++) {
            for (let j = 0; j < pastedData[i].length; j++) {
                const targetRow = startRow + i;
                const targetCol = startCol + j;
                // Ensure `value` is accessed correctly if pastedData contains objects
                const value = pastedData[i][j]?.value !== undefined ? pastedData[i][j].value : '';
    
                this.spreadsheetManager.sparseMatrix.setCell(targetRow, targetCol, value);
            }
        }
    
        this.cellFunctionality.sheetRenderer.draw();
    }
    
    

    getCopiedData() {
        return this.copiedData;
    }
}
