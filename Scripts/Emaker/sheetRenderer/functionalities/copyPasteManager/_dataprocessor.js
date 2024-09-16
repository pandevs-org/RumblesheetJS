// dataProcessor.js
self.onmessage = (event) => {
    const { startRow, startCol, pastedData } = event.data;
    const processedData = [];

    for (let i = 0; i < pastedData.length; i++) {
        const rowData = [];
        for (let j = 0; j < pastedData[i].length; j++) {
            const targetRow = startRow + i;
            const targetCol = startCol + j;
            rowData.push({ targetRow, targetCol, value: pastedData[i][j] });
        }
        processedData.push(rowData);
    }

    self.postMessage({ startRow, startCol, processedData });
};
