export class CellUtility {
  constructor(sheetRenderer, spreadsheetManager) {
    this.sheetRenderer = sheetRenderer;
    this.spreadsheetManager = spreadsheetManager;
  }

  getCellFromCoordinates(x, y) {
    const horizontalCells = this.sheetRenderer.headerCellManager.horizontalHeaderCells;
    const verticalCells = this.sheetRenderer.headerCellManager.verticalHeaderCells;

    const column = horizontalCells.find(
      (cell) => x >= cell.x && x < cell.x + cell.width
    );
    const row = verticalCells.find(
      (cell) => y >= cell.y && y < cell.y + cell.height
    );

    if (column && row) {
      return { column, row };
    }
    return null;
  }

  getCanvasCoordinates(event) {
    const rect =
      this.sheetRenderer.canvases.spreadsheet.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: scrollX, y: scrollY } =
      this.sheetRenderer.scrollManager.getScroll();
    const scale = this.sheetRenderer.scale;

    // Adjust for scaling and scrolling

    const adjustedX = x + scrollX;
    const adjustedY = y + scrollY;

    return { x: adjustedX, y: adjustedY };
  }

  letterToNumber(letter) {
    let number = 0;
    for (let i = 0; i < letter.length; i++) {
      number = number * 26 + (letter.charCodeAt(i) - "A".charCodeAt(0) + 1);
    }
    return number;
  }

  getCellsFromRect(startPoint, endPoint) {
    const horizontalCells = this.sheetRenderer.headerCellManager.horizontalHeaderCells;
    const verticalCells = this.sheetRenderer.headerCellManager.verticalHeaderCells;

    // Determine rectangle bounds
    const left = Math.min(startPoint.x, endPoint.x);
    const right = Math.max(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const bottom = Math.max(startPoint.y, endPoint.y);

    // Find start and end indices for columns and rows
    const startColIndex = this.binarySearch(horizontalCells, left, 'x');
    const endColIndex = this.binarySearch(horizontalCells, right, 'x');
    const startRowIndex = this.binarySearch(verticalCells, top, 'y');
    const endRowIndex = this.binarySearch(verticalCells, bottom, 'y');

    const cells = [];
    for (let i = startColIndex; i <= endColIndex; i++) {
      for (let j = startRowIndex; j <= endRowIndex; j++) {
        const cell = {
          column: horizontalCells[i],
          row: verticalCells[j],
          linkedListValue: {
            value: this.spreadsheetManager.getValue(
              verticalCells[j].value,
              this.letterToNumber(horizontalCells[i].value)
            )
          }
        };
        cells.push(cell);
      }
    }

    return cells;
  }

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
