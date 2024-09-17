import { CellUtility } from "./cellutility.js"; // Import the CellUtility class

export class CalculationManager {
  constructor(cellFunctionality) {
    this.cellFunctionality = cellFunctionality;
    this.cellUtility = new CellUtility(this.cellFunctionality.sheetRenderer, this.cellFunctionality.spreadsheetManager);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Assuming you have buttons with ids 'sumBtn' and 'avgBtn'
    document.getElementById('sumBtn').addEventListener('click', () => this.showSum());
    document.getElementById('avgBtn').addEventListener('click', () => this.showAverage());
  }

  calculateSum(cells) {
    let rowSum = {};
    let colSum = {};

    cells.forEach(cell => {
      const cellValue = parseFloat(this.cellFunctionality.spreadsheetManager.getValue(cell.row.value, this.cellUtility.letterToNumber(cell.column.value))) || 0;

      // Update row sum
      if (!rowSum[cell.row.value]) rowSum[cell.row.value] = 0;
      rowSum[cell.row.value] += cellValue;

      // Update column sum
      if (!colSum[cell.column.value]) colSum[cell.column.value] = 0;
      colSum[cell.column.value] += cellValue;
    });

    return { rowSum, colSum };
  }

  calculateAverage(cells) {
    let rowSum = {};
    let rowCount = {};
    let colSum = {};
    let colCount = {};

    cells.forEach(cell => {
      const cellValue = parseFloat(this.cellFunctionality.spreadsheetManager.getValue(cell.row.value, this.cellUtility.letterToNumber(cell.column.value))) || 0;

      // Update row sum and count
      if (!rowSum[cell.row.value]) rowSum[cell.row.value] = 0;
      if (!rowCount[cell.row.value]) rowCount[cell.row.value] = 0;
      rowSum[cell.row.value] += cellValue;
      rowCount[cell.row.value]++;

      // Update column sum and count
      if (!colSum[cell.column.value]) colSum[cell.column.value] = 0;
      if (!colCount[cell.column.value]) colCount[cell.column.value] = 0;
      colSum[cell.column.value] += cellValue;
      colCount[cell.column.value]++;
    });

    // Calculate averages
    let rowAvg = {};
    let colAvg = {};

    for (let row in rowSum) {
      rowAvg[row] = rowSum[row] / rowCount[row];
    }

    for (let col in colSum) {
      colAvg[col] = colSum[col] / colCount[col];
    }

    return { rowAvg, colAvg };
  }

  drawTextOnCanvas(text, x, y, context) {
    context.save();
    context.font = "14px Arial";
    context.fillStyle = "black";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(text, x, y);
    context.restore();
  }

  showSum() {
    const cells = this.cellFunctionality.selectedCells;
    const { rowSum, colSum } = this.calculateSum(cells);

    const canvas = this.cellFunctionality.sheetRenderer.contexts.spreadsheet;
    const ctx = canvas;

    // Clear previous results
    ctx.clearRect(0, canvas.height - 100, canvas.width, 100);

    // Position below the last selected row and column
    const lastCell = this.cellFunctionality.selectedCells[this.cellFunctionality.selectedCells.length - 1];
    const { x: scrollX, y: scrollY } = this.cellFunctionality.sheetRenderer.scrollManager.getScroll();
    const scale = this.cellFunctionality.sheetRenderer.scale;

    const startX = lastCell.column.x - scrollX;
    const startY = lastCell.row.y + lastCell.row.height - scrollY + 10; // Position below the last selected cell

    let textY = startY;
    Object.keys(rowSum).forEach(row => {
      this.drawTextOnCanvas(`Row ${row} Sum: ${rowSum[row]}`, startX, textY, ctx);
      textY += 20; // Adjust spacing as needed
    });

    textY = startY;
    Object.keys(colSum).forEach(col => {
      this.drawTextOnCanvas(`Column ${col} Sum: ${colSum[col]}`, startX + 150, textY, ctx); // Offset for column sums
      textY += 20; // Adjust spacing as needed
    });
  }

  showAverage() {
    const cells = this.cellFunctionality.selectedCells;
    const { rowAvg, colAvg } = this.calculateAverage(cells);

    const canvas = this.cellFunctionality.sheetRenderer.contexts.spreadsheet;
    const ctx = canvas;

    // Clear previous results
    ctx.clearRect(0, canvas.height - 100, canvas.width, 100);

    // Position below the last selected row and column
    const lastCell = this.cellFunctionality.selectedCells[this.cellFunctionality.selectedCells.length - 1];
    const { x: scrollX, y: scrollY } = this.cellFunctionality.sheetRenderer.scrollManager.getScroll();
    const scale = this.cellFunctionality.sheetRenderer.scale;

    const startX = lastCell.column.x - scrollX;
    const startY = lastCell.row.y + lastCell.row.height - scrollY + 10; // Position below the last selected cell

    let textY = startY;
    Object.keys(rowAvg).forEach(row => {
      this.drawTextOnCanvas(`Row ${row} Avg: ${rowAvg[row]}`, startX, textY, ctx);
      textY += 20; // Adjust spacing as needed
    });

    textY = startY;
    Object.keys(colAvg).forEach(col => {
      this.drawTextOnCanvas(`Column ${col} Avg: ${colAvg[col]}`, startX + 150, textY, ctx); // Offset for column averages
      textY += 20; // Adjust spacing as needed
    });
  }
}
