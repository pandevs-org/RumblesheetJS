/**
 * Handles the functionality of header cells, such as resizing, selecting, and context menu actions.
 * @class
 */
export class HeaderCellFunctionality {
    /**
     * @constructor
     * @param {Object} sheetRenderer - The sheet renderer object that manages canvas drawing and cell management.
     */
    constructor(sheetRenderer) {
        this.sheetRenderer = sheetRenderer;
        this.cellFunctionality = this.sheetRenderer.cellFunctionality;
        this.resizeThreshold = 5; // pixels from the edge to trigger resize
        this.isResizing = false;
        this.resizeStart = null;
        this.resizeType = null; // 'row' or 'column'
        this.resizeIndex = null;
        this.currentResizePosition = null;
        this.isheaderSelection = false;
        this.isSelecting = false; // Track if user is selecting
        this.selectedRowIndex = null; // Single selected row
        this.selectedColIndex = null; // Single selected column
        this.selectedCellsRange = { start: null, end: null }; // Range selection for drag
        this.isDraggingForSelection = false; // Track drag for multi-selection
        this.setupEventListeners();
    }

    /**
     * Sets up the event listeners for canvas and window interactions.
     */
    setupEventListeners() {
        const hCanvas = this.sheetRenderer.canvases.horizontal;
        const vCanvas = this.sheetRenderer.canvases.vertical;

        hCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this, 'horizontal'));
        vCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this, 'vertical'));

        hCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        vCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('mousemove', this.handleDrag.bind(this));

        hCanvas.addEventListener('contextmenu', this.handleRightClick.bind(this, 'horizontal'));
        vCanvas.addEventListener('contextmenu', this.handleRightClick.bind(this, 'vertical'));
    }


    /**
     * Handles right-click context menu actions for adding or deleting rows/columns.
     * @param {string} canvasType - Type of canvas ('horizontal' or 'vertical').
     * @param {MouseEvent} event - The mouse event.
     */
    handleRightClick(canvasType, event) {
        event.preventDefault(); // Prevent the default right-click menu

        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.isHorizontal = canvasType === 'horizontal';

        const scrollOffset = this.isHorizontal
            ? this.sheetRenderer.scrollManager.getScroll().x
            : this.sheetRenderer.scrollManager.getScroll().y;

        const cells = this.isHorizontal
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollOffset);

        const clickedCell = this.getfullClickedHeaderCell(
            cells,
            this.isHorizontal ? x + scrollOffset : y + scrollOffset,
            this.isHorizontal
        );

        // Create the context menu
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('custom-context-menu');
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = `${mouseY}px`;
        contextMenu.style.left = `${mouseX}px`;
        contextMenu.style.backgroundColor = '#fff';
        contextMenu.style.border = '1px solid #ccc';
        contextMenu.style.padding = '10px';
        contextMenu.style.borderRadius = '4px';
        contextMenu.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        contextMenu.style.zIndex = '1000';

        if (canvasType === 'vertical') {
            contextMenu.innerHTML = `
                <div class="context-menu-option" data-action="add-row">➕ Add New Row</div>
                <div class="context-menu-option" data-action="delete-row">🗑️ Delete Row</div>
            `;
        } else if (canvasType === 'horizontal') {
            contextMenu.innerHTML = `
                <div class="context-menu-option" data-action="add-column">➕ Add New Column</div>
                <div class="context-menu-option" data-action="delete-column">🗑️ Delete Column</div>
            `;
        }

        document.body.appendChild(contextMenu);

        // Handle context menu option selection
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            this.handleContextMenuAction(action, canvasType, clickedCell);
            document.body.removeChild(contextMenu);
        });

        // Remove context menu on outside click
        window.addEventListener(
            'click',
            () => {
                if (document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                }
            },
            { once: true }
        );
    }
    

    /**
     * Performs the action based on the selected context menu option.
     * @param {string} action - The action to perform (e.g., 'add-row', 'delete-row', etc.).
     * @param {string} canvasType - Type of canvas ('horizontal' or 'vertical').
     * @param {Object} clickedCell - The clicked header cell.
     */
    handleContextMenuAction(action, canvasType, clickedCell) {
        if (action === 'add-row') {
            this.cellFunctionality.sheetRenderer.sparseMatrix.addRowInBetween(clickedCell.row);
        } else if (action === 'delete-row') {
            this.cellFunctionality.sheetRenderer.sparseMatrix.deleteRow(clickedCell.row);
        } else if (action === 'add-column') {
            this.cellFunctionality.sheetRenderer.sparseMatrix.addColumnInBetween(clickedCell.col);
        } else if (action === 'delete-column') {
            this.cellFunctionality.sheetRenderer.sparseMatrix.deleteColumn(clickedCell.col);
        }
    }
    

    /**
     * Handles the header selection based on user clicks or drags.
     * @param {string} direction - The direction ('horizontal' or 'vertical').
     * @param {MouseEvent} event - The mouse event.
     */
    handleHeaderSelection(direction, event) {
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.isHorizontal = direction === 'horizontal';
        const scrollOffset = this.isHorizontal
            ? this.sheetRenderer.scrollManager.getScroll().x
            : this.sheetRenderer.scrollManager.getScroll().y;

        const cells = this.isHorizontal
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollOffset);

        const clickedIndex = this.getClickedHeaderCell(cells, this.isHorizontal ? x + scrollOffset : y + scrollOffset, this.isHorizontal);

        if (clickedIndex !== null) {
            this.isSelecting = true;
            this.isDraggingForSelection = true;
            this.selectedCellsRange.start = clickedIndex;
            this.selectedCellsRange.end = clickedIndex;

            if (this.isHorizontal) {
                this.selectedColIndex = clickedIndex;
                this.selectedRowIndex = null;
            } else {
                this.selectedRowIndex = clickedIndex;
                this.selectedColIndex = null;
            }
            this.drawHeaderSelection();
        }
    }

    /**
     * Handles mouse movement for drag-based header selection.
     * @param {MouseEvent} event - The mouse event.
     */
    handleDragForSelection(event) {
        if (!this.isDraggingForSelection) return;

        const canvas = event.target.closest('canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const scrollOffset = this.isHorizontal
            ? this.sheetRenderer.scrollManager.getScroll().x
            : this.sheetRenderer.scrollManager.getScroll().y;

        const cells = this.isHorizontal
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollOffset);

        const draggedIndex = this.getClickedHeaderCell(cells, this.isHorizontal ? x + scrollOffset : y + scrollOffset, this.isHorizontal);

        if (draggedIndex !== null) {
            this.selectedCellsRange.end = draggedIndex;
            this.drawHeaderSelection();
        }
    }

    /**
     * Handles mouse-up events, ending resizing or dragging operations.
     * @param {MouseEvent} event - The mouse event.
     */
    handleMouseUp(event) {
        this.isDraggingForSelection = false;
        this.isDragging = false;

        if (this.isResizing) {
            this.applyResize(event);
            this.isResizing = false;
        }

        this.sheetRenderer.moveRowOrColumn(this.dragIndex, this.targetIndex, this.dragType);
        this.sheetRenderer.draw();
    }

    /**
     * Draws the header selection and clears previously selected cells.
     * Redraws both horizontal and vertical headers.
     */
    drawHeaderSelection() {
        this.isheaderSelection = true;
        this.sheetRenderer.cellFunctionality.selectedCells = [];
        const ctxH = this.sheetRenderer.canvases.horizontal.getContext('2d');
        const ctxV = this.sheetRenderer.canvases.vertical.getContext('2d');

        // Clear the horizontal and vertical canvases
        ctxH.clearRect(0, 0, this.sheetRenderer.canvases.horizontal.width, this.sheetRenderer.canvases.horizontal.height);
        ctxV.clearRect(0, 0, this.sheetRenderer.canvases.vertical.width, this.sheetRenderer.canvases.vertical.height);
        
        // Redraw the entire sheet and headers
        this.sheetRenderer.draw();
        this.redrawHeaders(ctxH, ctxV);
    }

    /**
     * Redraws the headers for both horizontal and vertical axes.
     * Highlights selected columns and rows.
     */
    redrawHeaders() {
        const ctxH = this.sheetRenderer.canvases.horizontal.getContext('2d');
        const ctxV = this.sheetRenderer.canvases.vertical.getContext('2d');
    
        // Highlight selected columns
        if (this.selectedColIndex !== null) {
            this.highlightRange(ctxH, 'horizontal', this.selectedCellsRange);
        }
        
        // Highlight selected rows
        if (this.selectedRowIndex !== null) {
            this.highlightRange(ctxV, 'vertical', this.selectedCellsRange);
        }
    }

    /**
     * Highlights the selected range of header cells in either the horizontal or vertical direction.
     * 
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     * @param {string} direction - The direction of the selection ('horizontal' or 'vertical').
     * @param {Object} range - The selected range of cells, with properties `start` and `end`.
     */
    highlightRange(ctx, direction, range) {
        const spreadsheetCanvas = this.sheetRenderer.canvases.spreadsheet;
        const ctxS = spreadsheetCanvas.getContext('2d');
        
        // Get scroll positions for proper adjustment
        const scrollX = this.sheetRenderer.scrollManager.getScroll().x;  // Horizontal scroll offset
        const scrollY = this.sheetRenderer.scrollManager.getScroll().y;  // Vertical scroll offset

        const startIdx = Math.min(range.start, range.end);
        const endIdx = Math.max(range.start, range.end);
        const headerCellManager = this.sheetRenderer.headerCellManager;

        // Iterate through the selected range and apply highlights
        for (let i = startIdx; i <= endIdx; i++) {
            const pos = headerCellManager.getCellpos(direction, i);
            const size = headerCellManager.getCellSize(direction, i);

            // Adjust for scrolling and highlight the range
            if (direction === 'horizontal') {
                const adjustedPos = pos - scrollX;
                ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';  // Highlight color for header
                ctxS.fillStyle = 'rgba(0, 128, 0, 0.3)';  // Highlight color for sheet
                ctx.fillRect(adjustedPos, 0, size, spreadsheetCanvas.height);
                ctxS.fillRect(adjustedPos, 0, size, spreadsheetCanvas.clientHeight);
            } else {
                const adjustedPos = pos - scrollY;
                ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';  // Highlight color for header
                ctxS.fillStyle = 'rgba(0, 128, 0, 0.3)';  // Highlight color for sheet
                ctx.fillRect(0, adjustedPos, spreadsheetCanvas.width, size);
                ctxS.fillRect(0, adjustedPos, spreadsheetCanvas.clientWidth, size);
            }
        }
    }

    /**
     * Retrieves the full clicked header cell based on the provided position.
     * 
     * @param {Array<Object>} cells - Array of cell objects with properties `x`, `y`, `width`, `height`.
     * @param {number} position - The position clicked (either x or y depending on direction).
     * @param {boolean} isHorizontal - True if checking horizontal cells, false for vertical cells.
     * @returns {Object|null} - The cell object that was clicked, or null if none found.
     */
    getfullClickedHeaderCell(cells, position, isHorizontal) {
        for (let i = 0; i <= cells.length; i++) {
            const cell = cells[i];
            const start = isHorizontal ? cell.x : cell.y;
            const end = isHorizontal ? cell.x + cell.width : cell.y + cell.height;

            if (position >= start && position <= end) {
                return cell;
            }
        }
        return null;
    }

    /**
     * Returns the index of the clicked header cell based on position.
     * 
     * @param {Array<Object>} cells - Array of cell objects with properties `x`, `y`, `width`, and `height`.
     * @param {number} position - The position (either x or y) of the click.
     * @param {boolean} isHorizontal - True if checking horizontal cells, false for vertical cells.
     * @returns {number|null} - The index of the clicked header cell, or null if none is found.
     */
    getClickedHeaderCell(cells, position, isHorizontal) {
        for (let i = 0; i <= cells.length; i++) {
            const cell = cells[i];
            const start = isHorizontal ? cell.x : cell.y;
            const end = isHorizontal ? cell.x + cell.width : cell.y + cell.height;
            if (position >= start && position <= end) {
                return i;
            }
        }
        return null;
    }

    /**
     * Determines whether the mouse is near the edge of a header cell for resizing.
     * 
     * @param {Array<Object>} cells - Array of cell objects with properties `x`, `y`, `width`, and `height`.
     * @param {number} x - The x-coordinate of the mouse.
     * @param {number} y - The y-coordinate of the mouse.
     * @param {boolean} isHorizontal - True if checking horizontal cells, false for vertical cells.
     * @returns {Object|null} - An object containing the index and position of the edge, or null if no edge is near.
     */
    getResizeEdge(cells, x, y, isHorizontal) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const edge = isHorizontal ? cell.x + cell.width : cell.y + cell.height;
            if (Math.abs(edge - (isHorizontal ? x : y)) <= this.resizeThreshold) {
                return { index: i, position: edge };
            }
        }
        return null;
    }

    /**
     * Handles the dragging of rows or columns for shifting.
     * 
     * @param {MouseEvent} event - The mouse event associated with dragging.
     */
    handleDragForShifting(event) {
        const canvas = this.dragType === 'column'
            ? this.sheetRenderer.canvases.horizontal
            : this.sheetRenderer.canvases.vertical;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Get current scroll position
        const scrollX = this.sheetRenderer.scrollManager.getScroll().x;
        const scrollY = this.sheetRenderer.scrollManager.getScroll().y;

        // Get visible header cells based on scroll position
        const cells = this.dragType === 'column'
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollX)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollY);

        // Wrap the drag shift logic in requestAnimationFrame for smooth rendering
        const animateShift = () => {
            // Find the target index based on the dragged position
            const newTargetIndex = this.getClickedHeaderCell(
                cells, 
                this.isHorizontal ? x + scrollX : y + scrollY, 
                this.dragType
            );
            console.log("Target Index:", this.targetIndex, this.dragIndex, newTargetIndex);

            for (let i = this.selectedCellsRange.start; i <= this.selectedCellsRange.end; i++) {
                this.draggedIndex = i;
                console.log(this.dragIndex, this.selectedCellsRange.start);

                // Perform swap if target index changes
                if (newTargetIndex !== this.targetIndex && newTargetIndex !== this.dragIndex) {
                    this.sheetRenderer.swapRowOrColumn(i, newTargetIndex, this.dragType);
                    this.dragIndex = newTargetIndex;
                }

                this.targetIndex = newTargetIndex;
            }

            // Update visual feedback for dragging
            this.sheetRenderer.updateDragPosition(this.dragIndex, this.targetIndex, this.dragType, { x, y });

            // Continue animation while dragging
            if (this.isDragging) {
                requestAnimationFrame(animateShift);
            }
        };

        // Start the animation loop
        requestAnimationFrame(animateShift);
    }
    
    /**
     * Handles mouse movement to update the cursor for resizing or dragging.
     * 
     * @param {MouseEvent} event - The mouse event associated with movement.
     */
    handleMouseMove(event) {
        if (this.isResizing) {
            return;
        }
        
        if (this.isDragging) {
            this.handleDragForShifting(event);
            return;
        }

        this.handleDragForSelection(event);

        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const isHorizontal = canvas === this.sheetRenderer.canvases.horizontal;
        const scrollOffset = isHorizontal 
            ? this.sheetRenderer.scrollManager.getScroll().x 
            : this.sheetRenderer.scrollManager.getScroll().y;
        
        const cells = isHorizontal 
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollOffset);

        const resizeEdge = this.getResizeEdge(cells, x + scrollOffset, y + scrollOffset, isHorizontal);

        // Update cursor style based on whether a resize edge is near
        canvas.style.cursor = resizeEdge ? (isHorizontal ? 'col-resize' : 'row-resize') : 'default';
    }

    /**
     * Handles mouse down event on header cells to initiate dragging, resizing, or selection.
     * 
     * @param {string} direction - The direction ('horizontal' or 'vertical') of the header.
     * @param {MouseEvent} event - The mouse event associated with the action.
     */
    handleMouseDown(direction, event) {
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const isHorizontal = canvas === this.sheetRenderer.canvases.horizontal;
        const scrollOffset = isHorizontal 
            ? this.sheetRenderer.scrollManager.getScroll().x 
            : this.sheetRenderer.scrollManager.getScroll().y;
        const cells = isHorizontal 
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollOffset);
        const headerCellManager = this.sheetRenderer.headerCellManager;

        const resizeEdge = this.getResizeEdge(cells, x + scrollOffset, y + scrollOffset, isHorizontal);

        if (this.isheaderSelection && event.shiftKey) {
            for (let i = this.selectedCellsRange.start; i <= this.selectedCellsRange.end; i++) {
                this.isDragging = true;
                this.dragType = isHorizontal ? 'column' : 'row';
                const pos = headerCellManager.getCellpos(direction, this.selectedCellsRange.start);
                this.dragIndex = i;
                this.dragStart = isHorizontal ? { x: pos, y: 0 } : { x: 0, y: pos };
                
                // Highlight the dragged cell
                this.sheetRenderer.highlightDraggedCell(this.dragIndex, this.dragType);
            }
        } else if (resizeEdge) {
            this.isResizing = true;
            this.isDraggingForSelection = false;
            this.resizeStart = isHorizontal ? x + scrollOffset : y + scrollOffset;
            this.resizeType = isHorizontal ? 'column' : 'row';

            // Adjust index based on the resize type
            if (this.resizeType === 'column') {
                this.resizeIndex = cells[resizeEdge.index].col - 1; // Use column index for resizing columns
            } else if (this.resizeType === 'row') {
                this.resizeIndex = cells[resizeEdge.index].row - 1; // Use row index for resizing rows
            }
            event.preventDefault();
        } else {
            this.handleHeaderSelection(direction, event);
        }
    }


    /**
     * Handles dragging action during resize or selection.
     * 
     * @param {MouseEvent} event - The mouse event associated with dragging.
     */
    handleDrag(event) {
        if (!this.isResizing) {
            this.handleDragForSelection(event);
            return;
        }

        const canvas = this.resizeType === 'column' 
            ? this.sheetRenderer.canvases.horizontal 
            : this.sheetRenderer.canvases.vertical;
        const rect = canvas.getBoundingClientRect();
        const scrollOffset = this.resizeType === 'column' 
            ? this.sheetRenderer.scrollManager.getScroll().x 
            : this.sheetRenderer.scrollManager.getScroll().y;
        const currentPosition = this.resizeType === 'column' 
            ? event.clientX - rect.left + scrollOffset
            : event.clientY - rect.top + scrollOffset;

        this.currentResizePosition = currentPosition;
        this.sheetRenderer.draw(); // Redraw, potentially showing a resize line
    }

    /**
     * Applies the resize changes after the user has finished resizing a header cell.
     * 
     * @param {MouseEvent} event - The mouse event associated with resizing.
     */
    applyResize(event) {
        if (!this.isResizing) return;

        const canvas = this.resizeType === 'column' 
            ? this.sheetRenderer.canvases.horizontal 
            : this.sheetRenderer.canvases.vertical;
        const rect = canvas.getBoundingClientRect();
        const scrollOffset = this.resizeType === 'column' 
            ? this.sheetRenderer.scrollManager.getScroll().x 
            : this.sheetRenderer.scrollManager.getScroll().y;
        const currentPosition = this.resizeType === 'column' 
            ? event.clientX - rect.left + scrollOffset
            : event.clientY - rect.top + scrollOffset;

        const delta = currentPosition - this.resizeStart;
        const headerCellManager = this.sheetRenderer.headerCellManager;
        const currentSize = headerCellManager.getCellSize(
            this.resizeType === 'column' ? 'horizontal' : 'vertical',
            this.resizeIndex
        );
        const newSize = Math.max(headerCellManager.minCellSize, currentSize + delta);

        // Set the new size for the resized header cell
        headerCellManager.setCustomCellSize(
            this.resizeType === 'column' ? 'horizontal' : 'vertical',
            this.resizeIndex,
            newSize
        );

        this.isResizing = false;
        this.currentResizePosition = null;
        this.sheetRenderer.draw(); // Redraw to apply the new sizes
    }

    /**
     * Removes event listeners from the canvas and document to prevent memory leaks.
     */
    removeEventListeners() {
        const hCanvas = this.sheetRenderer.canvases.horizontal;
        const vCanvas = this.sheetRenderer.canvases.vertical;

        hCanvas.removeEventListener('mousemove', this.handleMouseMove);
        vCanvas.removeEventListener('mousemove', this.handleMouseMove);

        hCanvas.removeEventListener('mousedown', this.handleMouseDown);
        vCanvas.removeEventListener('mousedown', this.handleMouseDown);

        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleDrag);
    }
}
