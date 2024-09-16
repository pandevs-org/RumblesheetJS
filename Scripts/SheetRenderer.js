// sheetrenderer.js
import { HeaderCellManager } from "./cellmaker.js";
import { Scroll } from "./scroll.js";
import { CellFunctionality } from "./cellfunctionality.js";
import { Graph } from "./graph.js";
import { HeaderCellFunctionality } from "./headercellfunctionality.js";

export class SheetRenderer {
  constructor(sheet) {
    this.sheet = sheet;
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 2;
    this.baseGridSize = 20;
    this.headerCellManager = null;
    this.canvases = {};
    this.contexts = {};
    this.lastDevicePixelRatio = window.devicePixelRatio;

    // Initialize the SparseMatrix instance
    this.sparseMatrix = this.sheet.sparsematrix;
    this.fetch = this.sheet.UploadAndFetch;
    // this.sparseMatrix.createCell(1,1,1,1,12)

    this.initCanvases();
    this.setupEventListeners();
    this.monitorDevicePixelRatio();
  }

  initCanvases() {
    ["spreadsheet", "vertical", "horizontal"].forEach((type) => {
      const canvas = document.getElementById(
        `${type}Canvas_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
      );
      if (!canvas) {
        throw new Error(
          `Canvas not found: ${type}Canvas_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
        );
      }
      this.canvases[type] = canvas;
      this.contexts[type] = canvas.getContext("2d");
    });

    // Set up the ResizeObserver
    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(this.canvases.spreadsheet);
    this.scrollManager = new Scroll(this);
    this.cellFunctionality = new CellFunctionality(this);
    this.headerCellFunctionality = new HeaderCellFunctionality(this);
    this.graph = new Graph(this);
    this.search = document.getElementById('search');
    this.search.addEventListener('click', (e) => {
      this.performSearch();  // Call another method to handle the search
    });
        this.resizeCanvases();
  }

 
  async performSearch() {
    await this.fetch.find();  
    this.search_result = this.fetch.find_data;  // Fetched result
    this.search_data = this.fetch.search.toLowerCase();  // Convert search term to lowercase
    
    let rowColumnData = [];  // Array to store rowid and corresponding column index
  
    // Iterate over each row
    this.search_result.forEach((row) => {
      let foundInColumnIndex = null;
  
      // Get all the column names of the current row and iterate over them with their index
      Object.keys(row).forEach((columnName, index) => {
        if (this.isMatch(row[columnName])) {
          foundInColumnIndex = index;  // Store the index of the column where the match is found
        }
      });
  
      // If a match is found, store the rowid and column index info
      if (foundInColumnIndex !== null) {
        rowColumnData.push({
          rowid: row.rowid+1,  // Store the rowid
          columnIndex: foundInColumnIndex+2  // Store the column index where match was found
        });
      }
    });
  
    // Sort the results by rowid in ascending order
    rowColumnData.sort((a, b) => {
      return a.rowid - b.rowid;
    });
  
    // Log the first row-column pair
    //console.log(rowColumnData);
    //console.log(this.verticalCells[0].row, this.horizontalCells[0].col);
  
    // Start the row scroll loop

    this.scrollUntilRowTarget(rowColumnData[1].rowid, rowColumnData[1].columnIndex);

  }
  
  // Helper function to check if the search term is a substring (case-insensitive)
  isMatch(value) {
    if (value) {
      return value.toString().toLowerCase().includes(this.search_data);
    }
    return false;
  }
  
// Recursive function that scrolls rows until the target row is reached
scrollUntilRowTarget(targetRow, targetColumnIndex, speed = 500) {
  // Check if any of the visible vertical cells have reached or passed the target row
  const reachedTargetRow = this.verticalCells.some(cell => cell.row === targetRow || cell.row > targetRow);

  if (reachedTargetRow) {
      //console.log("Target row reached or exceeded:", targetRow);
      // Start scrolling columns once the row is reached
      this.adjustRowPosition(targetRow,targetColumnIndex);
      return;
  }

  // Calculate the distance to the target row from the closest cell
  const minDistance = Math.min(...this.verticalCells.map(cell => Math.abs(cell.row - targetRow)));

  // Adjust speed based on distance (increase speed when far, decrease when near)
  const scrollSpeed = Math.min(speed * (1 + minDistance / 100), 1000); // Adjust multiplier as needed

  // Perform the row scroll action
  if (this.verticalCells[0].row < targetRow) {
      this.scrollManager.scroll(0, scrollSpeed);
  } else {
      this.scrollManager.scroll(0, -scrollSpeed);
  }

  // Continue scrolling rows until the target row is reached
  requestAnimationFrame(() => 
    this.scrollUntilRowTarget(targetRow, targetColumnIndex, speed)
);
}


// Recursive function that scrolls columns until the target column is reached
scrollUntilColumnTarget(targetColumnIndex, speed = 500) {
  // Check if any of the visible horizontal cells have reached or passed the target column
  const reachedTargetColumn = this.horizontalCells.some(cell => cell.col === targetColumnIndex || cell.col > targetColumnIndex);

  if (reachedTargetColumn) {
      //console.log("Target column reached or exceeded:", targetColumnIndex);
      // If the column has been reached, adjust the scroll position back to the target column
      this.adjustColumnPosition(targetColumnIndex);
      return; // Stop the animation loop when the target column is reached
  }

  // Calculate the distance to the target column from the closest cell
  const minDistance = Math.min(...this.horizontalCells.map(cell => Math.abs(cell.col - targetColumnIndex)));

  // Adjust speed based on distance (increase speed when far, decrease when near)
  const scrollSpeed = Math.min(speed * (1 + minDistance / 100), 1000); // Adjust multiplier as needed

  // Perform the column scroll action
  if (this.horizontalCells[0].col < targetColumnIndex) {
      this.scrollManager.scroll(scrollSpeed, 0);
  } else {
      this.scrollManager.scroll(-scrollSpeed, 0);
  }

  // Continue scrolling columns until the target column is reached
  requestAnimationFrame(() => 
    this.scrollUntilColumnTarget(targetColumnIndex, speed)
);
}

// Helper function to adjust column position back to target after reaching/exceeding it
adjustColumnPosition(targetColumnIndex) {
  // Determine if we need to scroll back to the exact target column
  if (this.horizontalCells.some(cell => cell.col !== targetColumnIndex)) {
      const currentColumn = this.horizontalCells[0].col;
      const scrollAdjustment = targetColumnIndex - currentColumn;
      //console.log(targetColumnIndex)
      if (scrollAdjustment === 0){
        //console.log("hello")
        //console.log(this.verticalCells[0],this.horizontalCells[0])
        this.cellFunctionality.updateSelectedCells({x:this.horizontalCells[0].x , y:this.verticalCells[0].y},true)
        return 
      }
      // Perform a fine-tuned scroll adjustment to correct column position
      this.scrollManager.scroll(scrollAdjustment, 0);
      
      // Continue adjusting until the exact target column is reached
      // requestAnimationFrame(() => 
        this.adjustColumnPosition(targetColumnIndex)
    // );
  } else {
      //console.log("Exact target column position reached:", targetColumnIndex);
  }
}

// Helper function to adjust row position back to target after reaching/exceeding it
adjustRowPosition(targetRow,targetColumnIndex) {
  // Determine if we need to scroll back to the exact target row
  if (this.verticalCells.some(cell => cell.row !== targetRow)) {
      const currentRow = this.verticalCells[0].row;
      const scrollAdjustment = targetRow - currentRow;
      if (scrollAdjustment === 0){
        this.scrollUntilColumnTarget(targetColumnIndex);

        return 
      }
      // Perform a fine-tuned scroll adjustment to correct row position
      this.scrollManager.scroll(0, scrollAdjustment);

      // Continue adjusting until the exact target row is reached
      // requestAnimationFrame(() => 
        this.adjustRowPosition(targetRow,targetColumnIndex)
    // );
  } else {
      //console.log("Exact target row position reached:", targetRow);
      // Optionally start scrolling columns if needed
      // this.scrollUntilColumnTarget(targetColumnIndex);
  }
}


  resizeCanvases() {
    const dpr = window.devicePixelRatio;
    Object.values(this.canvases).forEach((canvas) =>
      this.updateCanvasDimensions(canvas, dpr)
    );
    this.updateHeaderCells();
    this.draw();    
  }

  updateCanvasDimensions(canvas, dpr) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
  }

  setupEventListeners() {
    window.addEventListener("resize", this.handleResize.bind(this));
    this.canvases.spreadsheet.addEventListener(
      "wheel",
      this.handleWheel.bind(this),
      { passive: false }
    );

    // document.querySelector('font-bold-btn').addEventListener('click', this.updateTextStyles.bind(this, 'bold'))
    // document.querySelector('font-italic-btn').addEventListener('click', this.updateTextStyles.bind(this, 'italic'))
    // document.querySelector('font-strikethrough-btn').addEventListener('click', this.updateTextStyles.bind(this, 'strikethrough'))
    // document.querySelector('font-underline-btn').addEventListener('click', this.updateTextStyles.bind(this, 'underline'))

    document.getElementById('fontSize').addEventListener('input', this.updateTextStyles.bind(this));

    document.querySelector('.horizontal-left-btn').addEventListener('click', this.updateHorizontalAlignment.bind(this, 'left'))
    document.querySelector('.horizontal-center-btn').addEventListener('click', this.updateHorizontalAlignment.bind(this, 'center'))
    document.querySelector('.horizontal-right-btn').addEventListener('click', this.updateHorizontalAlignment.bind(this, 'right'))

    document.querySelector('.vertical-top-btn').addEventListener('click', this.updateVerticalAlignment.bind(this, 'top'))
    document.querySelector('.vertical-middle-btn').addEventListener('click', this.updateVerticalAlignment.bind(this, 'middle'))
    document.querySelector('.vertical-bottom-btn').addEventListener('click', this.updateVerticalAlignment.bind(this, 'bottom'))

    document.getElementById('fontFamily').addEventListener('change', this.updateTextStyles.bind(this));
    document.getElementById('text-color-picker').addEventListener('input', this.updateTextStyles.bind(this));
    // document.getElementById('fill-color.picker').addEventListener('input', this.updateTextStyles.bind(this))
  }

  handleResize() {
    this.resizeCanvases();
  }

  handleWheel(event) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY || event.detail || event.wheelDelta;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;

      const rect = this.canvases.spreadsheet.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.zoom(zoomFactor, mouseX, mouseY);
    }
  }

  zoom(factor, centerX, centerY) {
    const newScale = Math.min(
      Math.max(this.scale * factor, this.minScale),
      this.maxScale
    );
    if (newScale !== this.scale) {
      this.scale = newScale;
      this.updateHeaderCells();
      this.updateMaxScroll(); 

      this.draw();
    }
  }

  monitorDevicePixelRatio() {
    const checkDevicePixelRatio = () => {
      const currentDevicePixelRatio = window.devicePixelRatio;
      if (currentDevicePixelRatio !== this.lastDevicePixelRatio) {
        this.lastDevicePixelRatio = currentDevicePixelRatio;
        this.resizeCanvases();
      }
      requestAnimationFrame(checkDevicePixelRatio);
    };

    requestAnimationFrame(checkDevicePixelRatio);
  }

  setScroll(scrollX, scrollY) {
    // Update the scroll position
    // You may need to adjust this based on your grid logic
    this.headerCellManager.setScroll(scrollX, scrollY);
  }

  clearCanvases() {
    Object.entries(this.contexts).forEach(([type, ctx]) => {
      const canvas = this.canvases[type];
      ctx.clearRect(
        0,
        0,
        canvas.width / window.devicePixelRatio,
        canvas.height / window.devicePixelRatio
      );
    });
  }

  // ... (other methods remain the same)

  updateHeaderCells() {
    const visibleWidth = this.canvases.spreadsheet.clientWidth;
    const visibleHeight = this.canvases.spreadsheet.clientHeight;

    if (!this.headerCellManager) {
      this.headerCellManager = new HeaderCellManager(
        this.sheet,
        visibleWidth,
        visibleHeight,
        this.scale
      );
    } else {
      this.headerCellManager.update(visibleWidth, visibleHeight, this.scale);
    }

    this.updateMaxScroll();
  }

  updateMaxScroll() {
    const totalWidth = this.headerCellManager.getTotalWidth();
    const totalHeight = this.headerCellManager.getTotalHeight();
    const visibleWidth = this.canvases.spreadsheet.clientWidth;
    const visibleHeight = this.canvases.spreadsheet.clientHeight;
    this.scrollManager.updateMaxScroll(
      totalWidth,
      totalHeight,
      visibleWidth,
      visibleHeight
    );
  }

  updateScrollBars(scrollX, scrollY, maxScrollX, maxScrollY) {
    this.updateVerticalScrollBar(scrollY, maxScrollY);
    this.updateHorizontalScrollBar(scrollX, maxScrollX);
  }

  updateVerticalScrollBar(scrollY, maxScrollY) {
    const verticalScroll = document.getElementById(
      `verticalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );
    const verticalBar = document.getElementById(
      `verticalBar_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );

    const scrollHeight = verticalScroll.clientHeight;
    const contentHeight = scrollHeight + maxScrollY;
    const barHeight = Math.max(
      20,
      (scrollHeight / contentHeight) * scrollHeight
    );
    const barTop = (scrollY / maxScrollY) * (scrollHeight - barHeight);

    verticalBar.style.height = `${barHeight}px`;
    verticalBar.style.top = `${barTop}px`;
  }

  updateHorizontalScrollBar(scrollX, maxScrollX) {
    const horizontalScroll = document.getElementById(
      `horizontalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );
    const horizontalBar = document.getElementById(
      `horizontalBar_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );

    const scrollWidth = horizontalScroll.clientWidth;
    const contentWidth = scrollWidth + maxScrollX;
    const barWidth = Math.max(20, (scrollWidth / contentWidth) * scrollWidth);
    const barLeft = (scrollX / maxScrollX) * (scrollWidth - barWidth);

    horizontalBar.style.width = `${barWidth}px`;
    horizontalBar.style.left = `${barLeft}px`;
  }

  getVerticalScrollRatio() {
    const verticalScroll = document.getElementById(
      `verticalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );
    return (
      verticalScroll.clientHeight /
      (verticalScroll.clientHeight + this.scrollManager.maxScrollY)
    );
  }

  getHorizontalScrollRatio() {
    const horizontalScroll = document.getElementById(
      `horizontalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );
    return (
      horizontalScroll.clientWidth /
      (horizontalScroll.clientWidth + this.scrollManager.maxScrollX)
    );
  }

  draw() {
    this.clearCanvases();
    const { x: scrollX, y: scrollY } = this.scrollManager.getScroll();

    // Check if more content needs to be loaded
     
    this.drawHeaders(scrollX, scrollY);
    this.drawGrid(scrollX, scrollY);
    this.drawSparseMatrixValues(scrollX, scrollY);
    this.cellFunctionality.drawHighlight();

    // Update input box position
    if (this.cellFunctionality.selectedCell) {
      this.headerCellFunctionality.isheaderSelection = false;
      this.cellFunctionality.updateInputElement(
        this.cellFunctionality.selectedCell
      );
    }

    // Draw resize line if resizing
    if(this.headerCellFunctionality.isheaderSelection){
      this.headerCellFunctionality.redrawHeaders();
    }
    if (this.headerCellFunctionality.isResizing) {
      this.drawResizeLine();
    }
  }

  drawResizeLine() {
    const { isResizing, resizeType, currentResizePosition } =
      this.headerCellFunctionality;
    if (!isResizing || currentResizePosition === null) return;

    const ctx = this.contexts.spreadsheet;
    const { x: scrollX, y: scrollY } = this.scrollManager.getScroll();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 120, 215, 0.8)";
    ctx.lineWidth = 2;

    if (resizeType === "column") {
      const x = currentResizePosition - scrollX;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.clientHeight);
    } else {
      const y = currentResizePosition - scrollY;
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.clientWidth, y);
    }

    ctx.stroke();
  }

  drawHeaders(scrollX, scrollY) {
    this.verticalCells = this.headerCellManager.getVerticalHeaderCells(scrollY);
    this.horizontalCells =this.headerCellManager.getHorizontalHeaderCells(scrollX);

    this.drawHeaderCells(
      this.contexts.vertical,
      this.verticalCells,
      true,
      scrollY
    );
    this.drawHeaderCells(
      this.contexts.horizontal,
      this.horizontalCells,
      false,
      scrollX
    );
  }

  drawHeaderCells(ctx, cells, isVertical, scroll) {
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "black";

    const canvasWidth =
      this.canvases[isVertical ? "vertical" : "horizontal"].width /
      window.devicePixelRatio;
    const canvasHeight =
      this.canvases[isVertical ? "vertical" : "horizontal"].height /
      window.devicePixelRatio;

    cells.forEach((cell) => {
      const drawCell =
        (isVertical &&
          cell.y - scroll < canvasHeight &&
          cell.y + cell.height - scroll > 0) ||
        (!isVertical &&
          cell.x - scroll < canvasWidth &&
          cell.x + cell.width - scroll > 0);

      if (drawCell) {
        ctx.beginPath();
        if (isVertical) {
          const y = cell.y - scroll;
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();

          this.drawCenteredText(
            ctx,
            cell.value.toString(),
            canvasWidth / 2,
            y + cell.height / 2,
            canvasWidth,
            cell.height
          );
        } else {
          const x = cell.x - scroll;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();

          this.drawCenteredText(
            ctx,
            cell.value,
            x + cell.width / 2,
            canvasHeight / 2,
            cell.width,
            canvasHeight
          );
        }
      }
    });
  }


  
  drawGrid(scrollX, scrollY) {
    const ctx = this.contexts.spreadsheet;
    const verticalCells = this.verticalCells;
    const horizontalCells = this.horizontalCells;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    const canvasWidth =
      this.canvases.spreadsheet.width / window.devicePixelRatio;
    const canvasHeight =
      this.canvases.spreadsheet.height / window.devicePixelRatio;

    verticalCells.forEach((cell) => {
      const y = cell.y - scrollY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    });

    horizontalCells.forEach((cell) => {
      const x = cell.x - scrollX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    });
  }


  drawSparseMatrixValues(scrollX, scrollY) {
    // Print the graph (assuming this is for debugging purposes)
    this.graph.print();
  
    const ctx = this.contexts.spreadsheet;
    const visibleWidth = this.canvases.spreadsheet.width / window.devicePixelRatio;
    const visibleHeight = this.canvases.spreadsheet.height / window.devicePixelRatio;
  
    // Map vertical and horizontal cells for faster lookup
    const verticalCellMap = new Map(
      this.verticalCells.map((cell) => [cell.value, cell])
    );
    const horizontalCellMap = new Map(
      this.horizontalCells.map((cell) => [cell.value, cell])
    );
  
    // Iterate through the sparse matrix rows
    for (let row in this.sparseMatrix.rowHeaders) {
      let current = this.sparseMatrix.rowHeaders[row];
 
      while (current) {
        // Find corresponding header cells
        const vCell = verticalCellMap.get(current.rowValue);
        const hCell = horizontalCellMap.get(
          this.headerCellManager.numberToColumnName(current.colValue)
        );
  
        // If both header cells are found (i.e., the cell is visible)
        if (vCell && hCell) {
          const cellX = hCell.x - scrollX;
          const cellY = vCell.y - scrollY;
  
          // Only render cells within the visible area
          if (cellX < visibleWidth && cellY < visibleHeight && cellX + hCell.width > 0 && cellY + vCell.height > 0) {
            // Save context and set text styles
            ctx.save();
            ctx.fillStyle = "#000000";
  
            // Clip the rendering area to the cell's rectangle
            ctx.beginPath();
            ctx.rect(cellX, cellY, hCell.width, vCell.height);
            ctx.clip();
  
            // Draw the text if it exists
            if (current.value !== undefined && current.value !== null) {
             
  
              // Draw centered text in the cell
              this.drawCenteredTextforsparse(ctx,current, this.sparseMatrix.FormulaParser.evaluateFormula(current.value),
                cellX + hCell.width / 2, cellY + vCell.height / 2,
                hCell.width, vCell.height
              );
            }
  
            // Restore the context state after rendering the cell
            ctx.restore();
          }
        }
  
        // Move to the next column in the current row
        current = current.nextCol;
      }
      // break;
    }
  }
  
  updateHorizontalAlignment(alignment) {
    console.log(alignment)
    if (this.cellFunctionality.selectedCells) {
      this.cellFunctionality.selectedCells.forEach(cell => {
        // Apply styles to each selected cell
        console.log(cell.node)
        cell.node.textAlign = alignment;
      });
    }
  }

  updateVerticalAlignment(alignment) {
    if (this.cellFunctionality.selectedCells) {
      this.cellFunctionality.selectedCells.forEach(cell => {
        // Apply styles to each selected cell
        console.log(cell.node)
        cell.node.textBaseline = alignment;
      });
    }
  }

  updateTextStyles(fontWeight) {
    // const fontSize = document.getElementById('fontSize').value;
    const fontFamily = document.getElementById('fontFamily').value;
    const fontColor = document.getElementById('text-color-picker').value;
  
    console.log(fontColor)
    // Assuming `sheetRenderer` is your instance of SheetRenderer and `selectedCells` is an array of selected cells
    if (this.cellFunctionality.selectedCells) {
      this.cellFunctionality.selectedCells.forEach(cell => {
        // Apply styles to each selected cell
        console.log(cell.node)
        // cell.node.fontSize = `${fontSize}`;
        cell.node.fontFamily = `${fontFamily}`;
        cell.node.color = fontColor;
      });
    }
  }

  drawCenteredTextforsparse(ctx, cell, text, x, y, maxWidth, maxHeight) {
    const fontSize = cell.fontSize || 14; // Default to 14 if not specified
    const fontFamily = cell.fontFamily || 'Arial'; // Default to Arial if not specified
    const fontColor = cell.color || '#000000'; // Default to black if not specified

    // Set text styles
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = cell.textAlign || 'center'; // Center alignment
    ctx.textBaseline = 'middle'; // Middle alignment

    // Calculate text size and adjust fontSize if needed
    let textWidth = ctx.measureText(text).width;
    if (textWidth > maxWidth * 0.9) {
        let adjustedFontSize = fontSize * (maxWidth * 0.9) / textWidth;
        ctx.font = `${Math.max(adjustedFontSize, 14)}px ${fontFamily}`; // Ensure minimum font size
    }

    // Draw text
    ctx.fillText(text, x, y, maxWidth);
}


  drawCenteredText(ctx, text, x, y, maxWidth, maxHeight) {
    const baseFontSize = this.baseGridSize * this.scale;
    let fontSize = Math.min(baseFontSize, maxHeight * 0.8);

    // Adjust font size if text is too wide
    // ctx.font = `${fontSize}px Arial`;

    let textWidth = ctx.measureText(text).width;
    if (textWidth > maxWidth * 0.9) {
      fontSize *= (maxWidth * 0.9) / textWidth;
    }

    // Ensure minimum font size
    fontSize = 14;

    ctx.font = `${fontSize}px Arial`;
    ctx.strokeStyle = "black";
    ctx.fillText(text, x, y, maxWidth);
  }


  highlightDraggedCell(index, type) {
    const canvas = type === 'column' ? this.canvases.horizontal : this.canvases.vertical;
    const ctx = canvas.getContext('2d');
    const cell = type === 'column'
        ? this.headerCellManager.horizontalHeaderCells[index]
        : this.headerCellManager.verticalHeaderCells[index];

    //console.log(cell);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
}

clearDragHighlight() {
    this.draw(); // Re-render the entire sheet to clear highlights
}

updateDragPosition(dragIndex, targetIndex, type, position) {

this.draw(); // Re-render the sheet

const canvas = type === 'column' ? this.canvases.horizontal : this.canvases.vertical;
const ctx = canvas.getContext('2d');

// Clear previous drawings
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Draw a line where the column/row will be inserted
ctx.beginPath();
ctx.strokeStyle = 'blue';
ctx.lineWidth = 2;

if (type === 'column') {
    const x = this.headerCellManager.horizontalHeaderCells[targetIndex].x;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);

    // Update the x positions of columns
    this.updateColumnPositionsOnDrag(dragIndex, targetIndex, position);
} else {
    const y = this.headerCellManager.verticalHeaderCells[targetIndex].y;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);

    // Update the y positions of rows
    this.updateRowPositionsOnDrag(dragIndex, targetIndex, position);
}
ctx.stroke();
}

updateColumnPositionsOnDrag(dragIndex, targetIndex, position) {
// Adjust x positions of columns being dragged
if (this.headerCellFunctionality.isDragging){

    //console.log("txt")
    const dragColumn = this.headerCellManager.horizontalHeaderCells[dragIndex];
    const targetColumn = this.headerCellManager.horizontalHeaderCells[targetIndex];

// Calculate the new x position of the dragged column
dragColumn.x = position.x;

// Reposition affected columns
const columns = this.headerCellManager.horizontalHeaderCells;
for (let i = Math.min(dragIndex, targetIndex); i <= Math.max(dragIndex, targetIndex); i++) {
    columns[i].x = columns[i].x + (position.x - columns[dragIndex].x);
}

// Re-render the sheet
this.draw();
}
}

updateRowPositionsOnDrag(dragIndex, targetIndex, position) {
// Adjust y positions of rows being dragged

const dragRow = this.headerCellManager.verticalHeaderCells[dragIndex];
const targetRow = this.headerCellManager.verticalHeaderCells[targetIndex];

// Calculate the new y position of the dragged row
dragRow.y = position.y;

// Reposition affected rows
const rows = this.headerCellManager.verticalHeaderCells;
for (let i = Math.min(dragIndex, targetIndex); i <= Math.max(dragIndex, targetIndex); i++) {
    rows[i].y = rows[i].y + (position.y - rows[dragIndex].y);
}

// Re-render the sheet
this.draw();
}


swapRowOrColumn(fromIndex, toIndex, type) {
    if (type === 'column') {
        // Swap columns in the header cell manager
        [this.headerCellManager.horizontalHeaderCells[fromIndex], this.headerCellManager.horizontalHeaderCells[toIndex]] = 
        [this.headerCellManager.horizontalHeaderCells[toIndex], this.headerCellManager.horizontalHeaderCells[fromIndex]];

        // Swap column data in the actual data structure
        if (this.data && this.data.columns) {
            [this.data.columns[fromIndex], this.data.columns[toIndex]] = 
            [this.data.columns[toIndex], this.data.columns[fromIndex]];
        }

        // Update x positions of affected columns
        this.updateColumnPositions(fromIndex, toIndex);
    } else if (type === 'row') {
        // Swap rows in the header cell manager
        [this.headerCellManager.verticalHeaderCells[fromIndex], this.headerCellManager.verticalHeaderCells[toIndex]] = 
        [this.headerCellManager.verticalHeaderCells[toIndex], this.headerCellManager.verticalHeaderCells[fromIndex]];

        // Swap row data in the actual data structure
        if (this.data && this.data.rows) {
            [this.data.rows[fromIndex], this.data.rows[toIndex]] = 
            [this.data.rows[toIndex], this.data.rows[fromIndex]];
        }

        // Update y positions of affected rows
        this.updateRowPositions(Math.min(fromIndex, toIndex));
    }

    // Re-render the sheet
    this.draw();
}

moveRowOrColumn(fromIndex, toIndex, type) {
    if (fromIndex === toIndex) return; // No need to move if indices are the same

    if (type === 'column') {
        // Move column in the header cell manager
        const column = this.headerCellManager.horizontalHeaderCells.splice(fromIndex, 1)[0];
        this.headerCellManager.horizontalHeaderCells.splice(toIndex, 0, column);

        // Move column data in the actual data structure
        if (this.data && this.data.columns) {
            const columnData = this.data.columns.splice(fromIndex, 1)[0];
            this.data.columns.splice(toIndex, 0, columnData);
        }

        // Update x positions of affected columns
        this.updateColumnPositions(fromIndex, toIndex);
    } else if (type === 'row') {
        // Move row in the header cell manager
        const row = this.headerCellManager.verticalHeaderCells.splice(fromIndex, 1)[0];
        this.headerCellManager.verticalHeaderCells.splice(toIndex, 0, row);

        // Move row data in the actual data structure
        if (this.data && this.data.rows) {
            const rowData = this.data.rows.splice(fromIndex, 1)[0];
            this.data.rows.splice(toIndex, 0, rowData);
        }

        // Update y positions of affected rows
        this.updateRowPositions(Math.min(fromIndex, toIndex));
    }

    // Re-render the sheet
    this.draw();
}



updateColumnPositions(startIndex, toIndex) {
  let currentX = startIndex > 0 ? this.headerCellManager.horizontalHeaderCells[startIndex - 1].x + this.headerCellManager.horizontalHeaderCells[startIndex - 1].width : 0;
  for (let i = startIndex; i < toIndex + 1; i++) {
      const cell = this.headerCellManager.horizontalHeaderCells[i];
      
      // Update the cell's x position
      cell.x = currentX;
      
      // Update the cell's column index (assuming i is the new column index for each cell)
      cell.col = i;
      
      currentX += cell.width;
  }
}


updateRowPositions(startIndex) {
    let currentY = startIndex > 0 ? this.headerCellManager.verticalHeaderCells[startIndex - 1].y + this.headerCellManager.verticalHeaderCells[startIndex - 1].height : 0;

    for (let i = startIndex; i < this.headerCellManager.verticalHeaderCells.length; i++) {
        const cell = this.headerCellManager.verticalHeaderCells[i];
        cell.y = currentY;
        currentY += cell.height;
    }
}



  destroy() {
    window.removeEventListener("resize", this.handleResize);
    this.canvases.spreadsheet.removeEventListener("wheel", this.handleWheel);
    this.scrollManager.destroy(); // Clean up the Scroll manager
    this.cellFunctionality.removeEventListeners(); // Clean up the cell functionality
    this.headerCellFunctionality.removeEventListeners(); // Clean up the header functionality
  }
}
