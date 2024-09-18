import { CellUtility } from "./cellUtility.js"; // Import the CellUtility class

/**
 * Manages calculations such as sum and average for a set of selected cells in a spreadsheet.
 */
export class CalculationManager {
  /**
   * Creates an instance of CalculationManager.
   * @param {Object} cellFunctionality - An object containing spreadsheet functionality like renderer and selected cells.
   */
  constructor(cellFunctionality) {
    this.cellFunctionality = cellFunctionality;
    this.cellUtility = new CellUtility(
      this.cellFunctionality.sheetRenderer,
      this.cellFunctionality.spreadsheetManager
    );
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for sum and average calculation buttons.
   */
  setupEventListeners() {
    document.getElementById('sumBtn').addEventListener('click', () => this.showSum());
    document.getElementById('avgBtn').addEventListener('click', () => this.showAverage());
  }

  /**
   * Calculates the sum of the values in the given cells, grouped by row and column.
   * @param {Array} cells - The selected cells to calculate the sum for.
   * @returns {Object} An object containing row-wise and column-wise sums.
   */
  calculateSum(cells) {
    const rowSum = {};
    const colSum = {};

    cells.forEach(cell => {
      const cellValue = parseFloat(
        this.cellFunctionality.spreadsheetManager.getValue(
          cell.row.value,
          this.cellUtility.letterToNumber(cell.column.value)
        )
      ) || 0;

      // Update row sum
      rowSum[cell.row.value] = (rowSum[cell.row.value] || 0) + cellValue;

      // Update column sum
      colSum[cell.column.value] = (colSum[cell.column.value] || 0) + cellValue;
    });

    return { rowSum, colSum };
  }

  /**
   * Calculates the average of the values in the given cells, grouped by row and column.
   * @param {Array} cells - The selected cells to calculate the average for.
   * @returns {Object} An object containing row-wise and column-wise averages.
   */
  calculateAverage(cells) {
    const rowSum = {};
    const rowCount = {};
    const colSum = {};
    const colCount = {};

    cells.forEach(cell => {
      const cellValue = parseFloat(
        this.cellFunctionality.spreadsheetManager.getValue(
          cell.row.value,
          this.cellUtility.letterToNumber(cell.column.value)
        )
      ) || 0;

      // Update row sum and count
      rowSum[cell.row.value] = (rowSum[cell.row.value] || 0) + cellValue;
      rowCount[cell.row.value] = (rowCount[cell.row.value] || 0) + 1;

      // Update column sum and count
      colSum[cell.column.value] = (colSum[cell.column.value] || 0) + cellValue;
      colCount[cell.column.value] = (colCount[cell.column.value] || 0) + 1;
    });

    // Calculate averages
    const rowAvg = {};
    const colAvg = {};

    Object.keys(rowSum).forEach(row => {
      rowAvg[row] = rowSum[row] / rowCount[row];
    });

    Object.keys(colSum).forEach(col => {
      colAvg[col] = colSum[col] / colCount[col];
    });

    return { rowAvg, colAvg };
  }

  /**
   * Draws text on the canvas at the specified coordinates.
   * @param {string} text - The text to display.
   * @param {number} x - The x-coordinate for the text.
   * @param {number} y - The y-coordinate for the text.
   * @param {CanvasRenderingContext2D} context - The 2D drawing context of the canvas.
   */
  drawTextOnCanvas(text, x, y, context) {
    context.save();
    context.font = "14px Arial";
    context.fillStyle = "black";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(text, x, y);
    context.restore();
  }

  /**
   * Displays the sum of the selected cells on the spreadsheet canvas.
   */
  showSum() {
    const cells = this.cellFunctionality.selectedCells;
    const { rowSum, colSum } = this.calculateSum(cells);

    const canvas = this.cellFunctionality.sheetRenderer.contexts.spreadsheet;
    const ctx = canvas;

    // Clear previous results
    ctx.clearRect(0, canvas.height - 100, canvas.width, 100);

    // Position below the last selected row and column
    const lastCell = this.cellFunctionality.selectedCells[
      this.cellFunctionality.selectedCells.length - 1
    ];
    const { x: scrollX, y: scrollY } = this.cellFunctionality.sheetRenderer.scrollManager.getScroll();
    const startX = lastCell.column.x - scrollX;
    const startY = lastCell.row.y + lastCell.row.height - scrollY + 10; // Position below the last selected cell

    let textY = startY;

    // Display row sums
    Object.keys(rowSum).forEach(row => {
      this.drawTextOnCanvas(`Row ${row} Sum: ${rowSum[row]}`, startX, textY, ctx);
      textY += 20; // Adjust spacing as needed
    });

    textY = startY;

    // Display column sums
    Object.keys(colSum).forEach(col => {
      this.drawTextOnCanvas(`Column ${col} Sum: ${colSum[col]}`, startX + 150, textY, ctx); // Offset for column sums
      textY += 20; // Adjust spacing as needed
    });
  }

  /**
   * Displays the average of the selected cells on the spreadsheet canvas.
   */
  showAverage() {
    const cells = this.cellFunctionality.selectedCells;
    const { rowAvg, colAvg } = this.calculateAverage(cells);

    const canvas = this.cellFunctionality.sheetRenderer.contexts.spreadsheet;
    const ctx = canvas;

    // Clear previous results
    ctx.clearRect(0, canvas.height - 100, canvas.width, 100);

    // Position below the last selected row and column
    const lastCell = this.cellFunctionality.selectedCells[
      this.cellFunctionality.selectedCells.length - 1
    ];
    const { x: scrollX, y: scrollY } = this.cellFunctionality.sheetRenderer.scrollManager.getScroll();
    const startX = lastCell.column.x - scrollX;
    const startY = lastCell.row.y + lastCell.row.height - scrollY + 10; // Position below the last selected cell

    let textY = startY;

    // Display row averages
    Object.keys(rowAvg).forEach(row => {
      this.drawTextOnCanvas(`Row ${row} Avg: ${rowAvg[row]}`, startX, textY, ctx);
      textY += 20; // Adjust spacing as needed
    });

    textY = startY;

    // Display column averages
    Object.keys(colAvg).forEach(col => {
      this.drawTextOnCanvas(`Column ${col} Avg: ${colAvg[col]}`, startX + 150, textY, ctx); // Offset for column averages
      textY += 20; // Adjust spacing as needed
    });
  }
}
