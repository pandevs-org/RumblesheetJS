/**
 * Utility class for handling cell operations in a spreadsheet.
 */
export class CellUtility {
  /**
   * @param {Object} sheetRenderer - The renderer for the spreadsheet.
   * @param {Object} spreadsheetManager - The manager for spreadsheet data.
   */
  constructor(sheetRenderer, spreadsheetManager) {
    this.sheetRenderer = sheetRenderer;
    this.spreadsheetManager = spreadsheetManager;
  }

  /**
   * Get the cell corresponding to the given x and y coordinates.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @returns {Object|null} - The cell object containing column and row, or null if not found.
   */
  getCellFromCoordinates(x, y) {
    const { horizontalHeaderCells, verticalHeaderCells } = this.sheetRenderer.headerCellManager;

    const column = horizontalHeaderCells.find(cell => x >= cell.x && x < cell.x + cell.width);
    const row = verticalHeaderCells.find(cell => y >= cell.y && y < cell.y + cell.height);

    return column && row ? { column, row } : null;
  }

  /**
   * Get the canvas coordinates from the mouse event.
   * @param {MouseEvent} event - The mouse event.
   * @returns {Object} - The adjusted x and y coordinates.
   */
  getCanvasCoordinates(event) {
    const rect = this.sheetRenderer.canvases.spreadsheet.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: scrollX, y: scrollY } = this.sheetRenderer.scrollManager.getScroll();

    // Adjust for scaling and scrolling
    return {
      x: x + scrollX * this.sheetRenderer.scale,
      y: y + scrollY * this.sheetRenderer.scale
    };
  }

  /**
   * Convert a column letter to a column number.
   * @param {string} letter - The column letter (e.g., "A").
   * @returns {number} - The corresponding column number.
   */
  letterToNumber(letter) {
    return letter.split('').reduce((number, char) => number * 26 + (char.charCodeAt(0) - 'A'.charCodeAt(0) + 1), 0);
  }

  /**
   * Get all cells within a rectangular area defined by two points.
   * @param {Object} startPoint - The starting point with x and y coordinates.
   * @param {Object} endPoint - The ending point with x and y coordinates.
   * @returns {Array} - An array of cells within the specified rectangle.
   */
  getCellsFromRect(startPoint, endPoint) {
    const { horizontalHeaderCells, verticalHeaderCells } = this.sheetRenderer.headerCellManager;

    const left = Math.min(startPoint.x, endPoint.x);
    const right = Math.max(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const bottom = Math.max(startPoint.y, endPoint.y);

    const startColIndex = this.binarySearch(horizontalHeaderCells, left, 'x');
    const endColIndex = this.binarySearch(horizontalHeaderCells, right, 'x');
    const startRowIndex = this.binarySearch(verticalHeaderCells, top, 'y');
    const endRowIndex = this.binarySearch(verticalHeaderCells, bottom, 'y');

    const cells = [];
    for (let i = startColIndex; i <= endColIndex; i++) {
      for (let j = startRowIndex; j <= endRowIndex; j++) {
        const cellValue = this.spreadsheetManager.getValue(
          verticalHeaderCells[j].value,
          this.letterToNumber(horizontalHeaderCells[i].value)
        );

        cells.push({
          column: horizontalHeaderCells[i],
          row: verticalHeaderCells[j],
          linkedListValue: { value: cellValue },
          node: this.spreadsheetManager.getCell(
            verticalHeaderCells[j].value,
            this.letterToNumber(horizontalHeaderCells[i].value)
          )
        });
      }
    }

    return cells;
  }

  /**
   * Perform a binary search on the cells array.
   * @param {Array} cells - The array of cells to search.
   * @param {number} value - The value to search for.
   * @param {string} property - The property to compare (either 'x' or 'y').
   * @returns {number} - The index of the found cell or the next available index.
   */
  binarySearch(cells, value, property) {
    let low = 0;
    let high = cells.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cell = cells[mid];

      if (cell[property] <= value && value < cell[property] + (property === 'x' ? cell.width : cell.height)) {
        return mid;
      } else if (cell[property] > value) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return low;
  }
}
