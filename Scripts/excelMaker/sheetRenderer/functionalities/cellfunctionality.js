import { SpreadsheetManager } from "./spreadsheetmanager.js";
import { CopyPasteManager } from './copyPasteManager/copypastemanger.js';
import { CellUtility } from "./cellUtility.js"; // Import the CellUtility class
import { CalculationManager } from "./calculationManager.js";

/**
 * Class responsible for managing cell interactions and functionality in the spreadsheet.
 */
export class CellFunctionality {
  /**
   * @param {Object} sheetRenderer - The renderer responsible for rendering the spreadsheet.
   */
  constructor(sheetRenderer) {
    this.sheetRenderer = sheetRenderer;
    this.selectedCells = []; // Array to store selected cells
    this.isDragging = false; // Track if the user is dragging
    this.isScrolling = false; // Track if scrolling is in progress
    this.startPoint = null; // Starting point for drag selection
    
    // Marching ants properties
    this.marchingAntsActive = false;
    this.dashOffset = 0;
    this.animationFrameId = null;

    this.spreadsheetManager = new SpreadsheetManager(this);
    this.cellUtility = new CellUtility(sheetRenderer, this.spreadsheetManager); // Instantiate CellUtility
    this.copyPasteManager = new CopyPasteManager(this, this.spreadsheetManager);
    this.calculationManager = new CalculationManager(this);
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for user interactions with the spreadsheet.
   */
  setupEventListeners() {
    const canvas = this.sheetRenderer.canvases.spreadsheet;
    canvas.addEventListener("pointerdown", this.handlePointerDown.bind(this));
    document.addEventListener("pointerup", this.handlePointerUp.bind(this));
    document.addEventListener("pointermove", this.handlePointerMove.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    // document.addEventListener("mousedown", this.handleMouseDown.bind(this));
  }

  /**
   * Handle the pointer down event for cell selection and drag initiation.
   * @param {PointerEvent} event - The pointer event triggered on user action.
   */
  handlePointerDown(event) {
    event.preventDefault();
    this.handleCellClick(event);

    if (!this.isDragging) {
      this.isDragging = true;
      this.isScrolling = true; 

      this.startPoint = this.cellUtility.getCanvasCoordinates(event);
      this.selectedCells = []; // Reset selected cells on new drag
      this.updateSelectedCells(this.startPoint);
      this.stopMarchingAnts();
      this.sheetRenderer.draw();
      this.marchingAntsActive = false;
    }
  }

  /**
   * Handle pointer movement during drag operation.
   * @param {PointerEvent} event - The pointer event triggered on movement.
   */
  handlePointerMove(event) {
    if (this.isDragging) {
      const currentPoint = this.cellUtility.getCanvasCoordinates(event);
      this.updateSelectedCells(currentPoint);
      this.handleScrolling(event);
    }
  }

  /**
   * Handle the pointer up event when the drag operation ends.
   * @param {PointerEvent} event - The pointer event triggered on user action.
   */
  handlePointerUp(event) {
    this.isScrolling = false;
    this.removeEventListeners();
    if (this.isDragging) {
      this.isDragging = false;
     
    }
  }

  /**
   * Handle keyboard shortcuts for cut and deselection.
   * @param {KeyboardEvent} event - The keyboard event triggered on key press.
   */
  handleKeyDown(event) {
    if (event.ctrlKey && event.key === 'x' && this.selectedCell) {
      this.startMarchingAnts();
    }
    if (event.key === 'Enter' && this.selectedCells.length > 0) {
      this.deselectCurrentCells();
  }
  }

  /**
   * Deselect the currently selected cells and hide the input element.
   */
  deselectCurrentCells() {
    if (this.selectedCells.length > 0) {
        this.selectedCells = [];
        this.selectedCell = null; // Clear the individual selected cell
        this.hideInputElement(); // Hide the input element if it's visible
        console.log("deselect calling draw")
        this.sheetRenderer.draw(); // Redraw the sheet to remove any highlighting
    }
}
  
  /**
   * Handle a cell click event to select or deselect a cell.
   * @param {PointerEvent} event - The pointer event triggered on user action.
   */
  handleCellClick(event) {
    if (this.isDragging) return; // Prevent handling cell click if dragging
    const rect = this.sheetRenderer.canvases.spreadsheet.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: scrollX, y: scrollY } = this.sheetRenderer.scrollManager.getScroll();
    const scale = this.sheetRenderer.scale;

    const adjustedX = x + scrollX;
    const adjustedY = y + scrollY;

    this.clickedCell = this.cellUtility.getCellFromCoordinates(adjustedX, adjustedY);

    if (this.clickedCell) {
      if (this.selectedCells.length === 0) {
        this.selectCell(this.clickedCell);
      } else {
        this.deselectCurrentCells();
        this.updateInputElement(this.clickedCell);
        this.selectCell(this.clickedCell);
        this.drawHighlight();
      }
    }
  }

  /**
   * Update the selected cells during a drag selection.
   * @param {Object} endPoint - The coordinates of the end point of the selection.
   * @param {Boolean} [found=false] - Optional flag to indicate if the start point should be updated.
   */
  updateSelectedCells(endPoint,found = false) {
    if (found){
      this.startPoint = endPoint;
    }
   
    const cells = this.cellUtility.getCellsFromRect(this.startPoint, endPoint);
    this.selectedCells = cells;
    this.sheetRenderer.draw(); // Redraw the sheet to show cell highlight
  }

  isCellInRect(left, right, top, bottom, column, row) {
    return (
      column.x < right &&
      column.x + column.width > left &&
      row.y < bottom &&
      row.y + row.height > top
    );
  }

  /**
   * Handle scrolling when the pointer is near the edges of the canvas.
   * @param {PointerEvent} event - The pointer event triggered on movement.
   */
  handleScrolling(event) {
    const { x, y } = this.cellUtility.getCanvasCoordinates(event);
    const { x: scrollX, y: scrollY } =
      this.sheetRenderer.scrollManager.getScroll();

    // Check if the pointer is near the edges to trigger scrolling
    const edgeDistance = 30; // Distance from edge to start scrolling
    const canvas = this.sheetRenderer.canvases.spreadsheet;

    if (x - scrollX < 0 && event.movementX < 0) {
      this.sheetRenderer.scrollManager.scroll(-10, 0);
    } else if (
      x - scrollX > canvas.clientWidth - edgeDistance &&
      event.movementX > 0
    ) {
      this.sheetRenderer.scrollManager.scroll(10, 0);
    }

    if (y - scrollY < 0 && event.movementY < 0) {
      console.log(y - scrollY);
      this.sheetRenderer.scrollManager.scroll(0, -10); // Scroll up
    } else if (
      y - scrollY > canvas.clientHeight - edgeDistance &&
      event.movementY > 0
    ) {
      this.sheetRenderer.scrollManager.scroll(0, 10); // Scroll down
    }

    this.updateInputElement(this.clickedCell)
  }

  /**
   * Update the input element for the currently selected cell.
   * @param {Object} cell - The selected cell object.
   */
  updateInputElement(cell) {
    this.input = document.getElementById(
      `input_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`
    );
    this.input.addEventListener('blur', function() {
      this.style.display = 'none';
      // Your code for when the input loses focus
    });

    console.log(cell)
    // Recalculate input box position
    const { x: scrollX, y: scrollY } =
      this.sheetRenderer.scrollManager.getScroll();
    const scale = this.sheetRenderer.scale;
    const inputchange = 2;
    const node = this.spreadsheetManager.getCell(cell.row.value,
      this.cellUtility.letterToNumber(cell.column.value));
      console.log(node)
    const fontSize = node? node.fontSize : 14;
    
    this.input.style.position = "absolute";
    this.input.style.left = `${cell.column.x - scrollX +  inputchange}px`;
    this.input.style.top = `${cell.row.y - scrollY +  inputchange}px`;
    this.input.style.width = `${cell.column.width -  2*inputchange}px`;
    this.input.style.height = `${cell.row.height -  2*inputchange}px`;
    this.input.style.fontSize = `${fontSize * scale}px`; // Adjust font size based on scale
    this.input.style.textAlign = "center";
    // input.style.zIndex = 10;
    this.input.style.display = "block";
    this.input.focus(); // Optionally focus the input

    // Get the cell value from the sparse matrix and set it in the input box
    const cellValue = node ? node.value : ""
    this.input.value = cellValue !== null ? cellValue : ""; // Set the input value
  }


  deselectCurrentCells() {
    if (this.selectedCells.length > 0) {
      this.selectedCells = [];
      this.hideInputElement();

      this.sheetRenderer.draw();
    }
  }

  /**
   * Hide the input element on the spreadsheet.
   */
  hideInputElement() {
    const input =document.getElementById(
      `input_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`
    );
    if (input) {
      input.style.display = "none";
    }
  }

  /**
   * Start the marching ants animation around the selected cells.
   */
  startMarchingAnts() {
    this.marchingAntsActive = true;
    this.animateMarchingAnts();
  }

  /**
   * Stop the marching ants animation.
   */
  stopMarchingAnts() {
    this.marchingAntsActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Animate the marching ants effect.
   */
  animateMarchingAnts() {
    if (!this.marchingAntsActive) return;
  
    this.dashOffset++;
    if (this.dashOffset > 16) this.dashOffset = 0;
  
    this.sheetRenderer.draw();
  
    // Cancel any existing animation frame before requesting a new one
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => this.animateMarchingAnts());
  }

  drawMarchingAnts(x,y,width,height) {
    if (!this.selectedCells) return;
    const ctx = this.sheetRenderer.contexts.spreadsheet;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -this.dashOffset;
    ctx.strokeStyle = "rgba(0, 128, 0, 0.9)";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }


  /**
   * Draw a highlight or border around the selected cells.
   */
  drawHighlight() {
    const ctx = this.sheetRenderer.contexts.spreadsheet;
    const { x: scrollX, y: scrollY } =
      this.sheetRenderer.scrollManager.getScroll();
    const scale = this.sheetRenderer.scale;

    if (this.selectedCells.length === 0) return;

    let width = null;
    let height = null;
    ctx.strokeStyle = "green"; // Green border
    ctx.lineWidth = 4;

    // Get the boundary of the selected area
    const minX = Math.min(...this.selectedCells.map((cell) => cell.column.x));
    const maxX = Math.max(
      ...this.selectedCells.map((cell) => {
        width = cell.column.width;
        return cell.column.x + cell.column.width;
      })
    );
    const minY = Math.min(...this.selectedCells.map((cell) => cell.row.y));
    const maxY = Math.max(
      ...this.selectedCells.map((cell) => {
        height = cell.row.height;
        return cell.row.y + cell.row.height;
      })
    );

    // Use a single function to draw on both horizontal and vertical canvases
    this.drawRectangleOnHeaderCanvas(
      'horizontal', minX - scrollX, 0, maxX - minX, height, true
    );
    this.drawRectangleOnHeaderCanvas(
      'vertical', 0, minY - scrollY, width, maxY - minY, false
    );

    // Draw the border around the entire selection area
    ctx.fillStyle = "rgb(131,242,143,0.3)";
    ctx.fillRect(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);
    
    if (this.marchingAntsActive) {
      this.drawMarchingAnts(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);
    }
    else{
      ctx.strokeRect(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);
    }
  }

  drawRectangleOnHeaderCanvas(type, x, y, width, height, isHorizontal) {
    const ctx = this.sheetRenderer.contexts[type];
    ctx.strokeStyle = "black"; // Black border
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.fillStyle = "rgb(131,242,143,0.3)";
    ctx.fillRect(x, y, width, height);


    if (isHorizontal) {
      // Draw a solid green line at the bottom
      ctx.strokeStyle = "green";
      ctx.lineWidth = 4;
      ctx.moveTo(x, 20);
      ctx.lineTo(x + width, 20);
    } else {
      // Draw a solid green line on the right side
      ctx.strokeStyle = "green";
      ctx.lineWidth = 4;
      ctx.moveTo(30, y);
      ctx.lineTo(30, y + height);
    }

    ctx.stroke(); // Finalize the drawing
  }

  drawLine(ctx, color, lineWidth, x1, y1, x2, y2) {

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  selectCell(cell) {
    if (
      this.selectedCell &&
      this.selectedCell.column.value === cell.column.value &&
      this.selectedCell.row.value === cell.row.value
    ) {
      // If the same cell is clicked again, deselect it
      this.deselectCurrentCell();
    } else {
      this.selectedCell = cell;
      this.updateInputElement(cell); // Update and show input element
    }

    this.sheetRenderer.draw(); // Redraw the entire sheet to show/hide the highlight
  }

  /**
   * Remove event listeners to prevent memory leaks.
   */
  removeEventListeners() {
    const canvas = this.sheetRenderer.canvases.spreadsheet;
    canvas.removeEventListener("pointerdown", this.handlePointerDown);
    document.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("pointermove", this.handlePointerMove);
  }
}