/**
 * Represents a single header cell in the spreadsheet.
 */
class HeaderCell {
    /**
     * @param {number} x - X position of the cell.
     * @param {number} y - Y position of the cell.
     * @param {number} width - Width of the cell.
     * @param {number} height - Height of the cell.
     * @param {string|number} value - The display value of the cell (column letter or row number).
     * @param {number} row - Row number of the cell.
     * @param {number} col - Column number of the cell.
     */
    constructor(x, y, width, height, value, row, col) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.value = value;
      this.row = row;
      this.col = col;
      this.isfetched = false; // Indicates whether the cell's data has been fetched.
    }
  }
  
  /**
   * Manages header cells (both horizontal and vertical) for a spreadsheet-like component.
   */
  export class HeaderCellManager {
    /**
     * @param {Object} sheet - Reference to the sheet.
     * @param {number} visibleWidth - Width of the visible area.
     * @param {number} visibleHeight - Height of the visible area.
     * @param {number} scale - The current zoom scale.
     */
    constructor(sheet, visibleWidth, visibleHeight, scale) {
      this.sheet = sheet;
      this.minCellSize = 30;
      this.baseCellWidth = 120;
      this.baseCellHeight = 40;
      this.scale = scale;
      this.visibleWidth = visibleWidth;
      this.visibleHeight = visibleHeight;
      this.horizontalHeaderCells = [];
      this.verticalHeaderCells = [];
      this.customHorizontalSizes = new Map();
      this.customVerticalSizes = new Map();
      
      this.update(visibleWidth, visibleHeight, scale); // Initialize the header cells.
    }
  
    /**
     * Updates the header cells based on the new visible dimensions and scale.
     * @param {number} visibleWidth - The new visible width.
     * @param {number} visibleHeight - The new visible height.
     * @param {number} scale - The new scale.
     */
    update(visibleWidth, visibleHeight, scale) {
      const oldScale = this.scale;
      this.visibleWidth = visibleWidth;
      this.visibleHeight = visibleHeight;
      this.scale = scale;
      this.resizeAllCells(oldScale, scale);
      this.updateCells();
    }
  
    /**
     * Resizes all cells based on the scale change.
     * @param {number} oldScale - The old scale before the update.
     * @param {number} newScale - The new scale after the update.
     */
    resizeAllCells(oldScale, newScale) {
      const scaleFactor = newScale / oldScale;
  
      // Resize horizontal cells
      this.horizontalHeaderCells.forEach(cell => {
        if (!this.customHorizontalSizes.has(cell.col - 1)) {
          cell.width *= scaleFactor;
        }
      });
  
      // Resize vertical cells
      this.verticalHeaderCells.forEach(cell => {
        if (!this.customVerticalSizes.has(cell.row - 1)) {
          cell.height *= scaleFactor;
        }
      });
    }
  
    /**
     * Updates the header cells' positions and dimensions.
     */
    updateCells() {
      const cellWidth = Math.max(this.minCellSize, this.baseCellWidth * this.scale);
      const cellHeight = Math.max(this.minCellSize, this.baseCellHeight * this.scale);
  
      this._updateHeaderCells('horizontal', cellWidth);
      this._updateHeaderCells('vertical', cellHeight);
    }
  
    /**
     * Updates either horizontal or vertical header cells.
     * @param {string} type - 'horizontal' or 'vertical'.
     * @param {number} size - Default size for cells (width or height).
     */
    _updateHeaderCells(type, size) {
      const isHorizontal = type === 'horizontal';
      const totalCells = Math.ceil((isHorizontal ? this.visibleWidth : this.visibleHeight) / size) + 1;
      const headerCells = isHorizontal ? this.horizontalHeaderCells : this.verticalHeaderCells;
  
      while (headerCells.length < totalCells) {
        const i = headerCells.length;
        const customSize = isHorizontal ? this.customHorizontalSizes.get(i) : this.customVerticalSizes.get(i);
        const dimension = customSize || size;
  
        const newCell = new HeaderCell(
          0, 0, // Default x, y positions; will be updated later
          isHorizontal ? dimension : this.minCellSize, // Width or height
          isHorizontal ? this.minCellSize : dimension, // Height or width
          isHorizontal ? this.numberToColumnName(i + 1) : i + 1, // Column letter or row number
          isHorizontal ? 0 : i + 1, // Row or column
          isHorizontal ? i + 1 : 0 // Column or row
        );
  
        headerCells.push(newCell);
      }
  
      this.updateCellPositions(type);
    }
  
    /**
     * Converts a number to a column name (e.g., 1 -> A, 27 -> AA).
     * @param {number} num - Column number.
     * @returns {string} - The corresponding column name.
     */
    numberToColumnName(num) {
      let columnName = '';
      while (num > 0) {
        num--;
        columnName = String.fromCharCode(65 + (num % 26)) + columnName;
        num = Math.floor(num / 26);
      }
      return columnName;
    }
  
    /**
     * Sets a custom size for a cell in either the horizontal or vertical header.
     * @param {string} type - 'horizontal' or 'vertical'.
     * @param {number} index - The cell index.
     * @param {number} size - The custom size for the cell.
     */
    setCustomCellSize(type, index, size) {
      const customSizes = type === 'horizontal' ? this.customHorizontalSizes : this.customVerticalSizes;
      customSizes.set(index, Math.max(this.minCellSize, size));
      this.updateCellPositions(type);
    }
  
    /**
     * Updates the positions of all cells in either horizontal or vertical headers.
     * @param {string} type - 'horizontal' or 'vertical'.
     */
    updateCellPositions(type) {
      const cells = type === 'horizontal' ? this.horizontalHeaderCells : this.verticalHeaderCells;
      let position = 0;
  
      cells.forEach((cell, index) => {
        if (type === 'horizontal') {
          cell.width = this.customHorizontalSizes.get(index) || cell.width;
          cell.x = position;
          position += cell.width;
        } else {
          cell.height = this.customVerticalSizes.get(index) || cell.height;
          cell.y = position;
          position += cell.height;
        }
      });
    }
  
    /**
     * Finds the starting index of the visible cells based on the scroll position.
     * @param {string} type - 'horizontal' or 'vertical'.
     * @param {number} scroll - The scroll position.
     * @returns {number} - The index of the first visible cell.
     */
    findStartingIndex(type, scroll) {
      const cells = type === 'horizontal' ? this.horizontalHeaderCells : this.verticalHeaderCells;
      let low = 0;
      let high = cells.length - 1;
  
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const cell = cells[mid];
        const position = type === 'horizontal' ? cell.x : cell.y;
        const size = type === 'horizontal' ? cell.width : cell.height;
  
        if (position + size > scroll) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
  
      return low < cells.length ? low : cells.length;
    }
  
    /**
     * Gets the visible horizontal header cells based on the scroll position.
     * @param {number} scrollX - Horizontal scroll position.
     * @returns {HeaderCell[]} - Array of visible horizontal header cells.
     */
    getHorizontalHeaderCells(scrollX) {
      return this._getVisibleHeaderCells('horizontal', scrollX, this.visibleWidth);
    }
  
    /**
     * Gets the visible vertical header cells based on the scroll position.
     * @param {number} scrollY - Vertical scroll position.
     * @returns {HeaderCell[]} - Array of visible vertical header cells.
     */
    getVerticalHeaderCells(scrollY) {
      return this._getVisibleHeaderCells('vertical', scrollY, this.visibleHeight);
    }
  
    /**
     * Gets visible header cells (horizontal or vertical) based on scroll position.
     * @param {string} type - 'horizontal' or 'vertical'.
     * @param {number} scroll - Scroll position (X or Y).
     * @param {number} visibleSize - Visible width or height.
     * @returns {HeaderCell[]} - Array of visible header cells.
     */
    _getVisibleHeaderCells(type, scroll, visibleSize) {
      const startIndex = this.findStartingIndex(type, scroll);
      const visibleCells = [];
      const cells = type === 'horizontal' ? this.horizontalHeaderCells : this.verticalHeaderCells;
  
      let position = cells[startIndex]?.[type === 'horizontal' ? 'x' : 'y'] || 0;
      for (let i = startIndex; position < scroll + visibleSize; i++) {
        if (i >= cells.length) {
          const size = this.getCellSize(type, i);
          cells.push(
            new HeaderCell(
              type === 'horizontal' ? position : 0,
              type === 'horizontal' ? 0 : position,
              type === 'horizontal' ? size : this.minCellSize,
              type === 'horizontal' ? this.minCellSize : size,
              type === 'horizontal' ? this.numberToColumnName(i + 1) : i + 1,
              type === 'horizontal' ? 0 : i + 1,
              type === 'horizontal' ? i + 1 : 0
            )
          );
        }
        const cell = cells[i];
        visibleCells.push(cell);
        position += type === 'horizontal' ? cell.width : cell.height;
      }
  
      return visibleCells;
    }
  
    /**
     * Gets the total width of all horizontal header cells.
     * @returns {number} - Total width of horizontal header cells.
     */
    getTotalWidth() {
      return this.horizontalHeaderCells.reduce((total, cell) => total + cell.width, 0);
    }
  
    /**
     * Gets the total height of all vertical header cells.
     * @returns {number} - Total height of vertical header cells.
     */
    getTotalHeight() {
      return this.verticalHeaderCells.reduce((total, cell) => total + cell.height, 0);
    }
  
    /**
     * Gets the size of a header cell.
     * @param {string} type - 'horizontal' or 'vertical'.
     * @param {number} index - Index of the cell.
     * @returns {number} - The size of the cell (width or height).
     */
    getCellSize(type, index) {
      if (type === 'horizontal') {
        return this.customHorizontalSizes.get(index) || this.baseCellWidth * this.scale;
      } else {
        return this.customVerticalSizes.get(index) || this.baseCellHeight * this.scale;
      }
    }

    getCellpos(type, index) {
      if (type === "horizontal") {
      return (
          this.horizontalHeaderCells[index]?.x
      );
      } else {
      return (
          this.verticalHeaderCells[index]?.y
      );
      }
    }
  }
  