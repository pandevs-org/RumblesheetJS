export class HeaderCellFunctionality {
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

    setupEventListeners() {
        const hCanvas = this.sheetRenderer.canvases.horizontal;
        const vCanvas = this.sheetRenderer.canvases.vertical;

        hCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this , 'horizontal'));
        vCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this , 'vertical'));

        hCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        vCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('mousemove', this.handleDrag.bind(this));
        
        // Add event listeners for right-click (context menu)
        hCanvas.addEventListener('contextmenu', this.handleRightClick.bind(this, 'horizontal'));
        vCanvas.addEventListener('contextmenu', this.handleRightClick.bind(this, 'vertical'));
    }


    handleRightClick(canvasType, event) {
        event.preventDefault(); // Prevent the default right-click menu from appearing
    
        // Get the mouse position
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
        const adjustedX = x + scrollOffset
        const adjustedY = y + scrollOffset
       
        const clickedcell = this.getfullClickedHeaderCell(cells, this.isHorizontal ? x + scrollOffset : y + scrollOffset, this.isHorizontal);
    
        // Remove any existing context menu before creating a new one
        const existingMenu = document.querySelector('.custom-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    
        // Create a context menu dynamically
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
        contextMenu.style.zIndex = '1000'; // Ensure it's on top of other elements
    
        // Add menu options based on whether it's horizontal or vertical
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
    
        // Append the context menu to the document body
        document.body.appendChild(contextMenu);
    
        // Add event listener to the options
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            this.handleContextMenuAction(action, canvasType ,clickedcell);
            document.body.removeChild(contextMenu); // Remove the menu after clicking
        });
    
        // Remove the context menu if clicked outside
        window.addEventListener('click', () => {
            if (document.body.contains(contextMenu)) {
                document.body.removeChild(contextMenu);
            }
        }, { once: true });
    }
    

    handleContextMenuAction(action, canvasType ,clickedcell) {
        if (action === 'add-row') {
            // Logic to add a new row
            console.log(this.cellFunctionality.sheetRenderer.sparseMatrix)
            this.cellFunctionality.sheetRenderer.sparseMatrix.printMatrixByColumn();
            console.log("----------------------------------------------------------------")
            this.cellFunctionality.sheetRenderer.sparseMatrix.printMatrixByRow()
            console.log("----------------------------------------------------------------")

            this.cellFunctionality.sheetRenderer.sparseMatrix.addRowInBetween(clickedcell.row)
            console.log(`Adding new row on ${canvasType} ${clickedcell.row} canvas`);
            this.cellFunctionality.sheetRenderer.sparseMatrix.printMatrixByRow()
            console.log("----------------------------------------------------------------")
            this.cellFunctionality.sheetRenderer.sparseMatrix.printMatrixByColumn();


            // Your logic for adding a row goes here
        } else if (action === 'delete-row') {
            // Logic to delete a row
            console.log(`Deleting row on ${canvasType} canvas`);
            // Your logic for deleting a row goes here
        } else if (action === 'add-column') {
            // Logic to add a new column
            console.log(clickedcell.col)
            this.cellFunctionality.sheetRenderer.sparseMatrix.printMatrixByColumn()
            this.cellFunctionality.sheetRenderer.sparseMatrix.addColumnInBetween(clickedcell.col)
            console.log(`Adding new column on ${canvasType} ${clickedcell.col} canvas`);
            this.cellFunctionality.sheetRenderer.sparseMatrix.printMatrixByColumn()
            // Your logic for adding a column goes here
        } else if (action === 'delete-column') {
            // Logic to delete a column
            console.log(`Deleting column on ${canvasType} canvas`);
            // Your logic for deleting a column goes here
        }
    }
    

    handleHeaderSelection(direction, event) {

        // const canvas = event.target;
        // const rect = canvas.getBoundingClientRect();
        // const x = event.clientX - rect.left;
        // const y = event.clientY - rect.top;
        // const isHorizontal = canvas === this.sheetRenderer.canvases.horizontal;
        // const scrollOffset = isHorizontal 
        //     ? this.sheetRenderer.scrollManager.getScroll().x 
        //     : this.sheetRenderer.scrollManager.getScroll().y;
        // const cells = isHorizontal 
        //     ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollOffset)
        //     : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollOffset);

        // const resizeEdge = this.getResizeEdge(cells, x + scrollOffset, y + scrollOffset, isHorizontal);



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
            this.isDraggingForSelection = true; // Start drag
            this.selectedCellsRange.start = clickedIndex; // Mark the start of selection
            this.selectedCellsRange.end = clickedIndex;
            if (this.isHorizontal) {
                this.selectedColIndex = clickedIndex; // Select column
                this.selectedRowIndex = null;
            } else {
                this.selectedRowIndex = clickedIndex; // Select row
                this.selectedColIndex = null;
            }
            this.drawHeaderSelection(); // Redraw to show selection
        }
    }

    handleDragForSelection(event) {
        if (!this.isDraggingForSelection){
            return
        }
        const canvas = event.target.closest('canvas');
        if (!canvas) return; // Ensure the mouse is still over a canvas
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
            this.selectedCellsRange.end = draggedIndex; // Mark the end of the drag selection
            this.drawHeaderSelection(); // Redraw to show updated selection
        }
    }

    handleMouseUp(event) {
        this.isDraggingForSelection = false; 
        this.isDragging = false;

        // Reset drag state
        this.dragStart = null;
        this.dragIndex = null;
        this.targetIndex = null;
        if (this.isResizing) {
            this.applyResize(event);
            this.isResizing = false;
        }
        this.sheetRenderer.moveRowOrColumn(this.dragIndex, this.targetIndex, this.dragType);
        this.sheetRenderer.draw();
    }

    drawHeaderSelection() {
        this.isheaderSelection = true;
        this.sheetRenderer.cellFunctionality.selectedCells = [];
        const ctxH = this.sheetRenderer.canvases.horizontal.getContext('2d');
        const ctxV = this.sheetRenderer.canvases.vertical.getContext('2d');

        ctxH.clearRect(0, 0, this.sheetRenderer.canvases.horizontal.width, this.sheetRenderer.canvases.horizontal.height);
        ctxV.clearRect(0, 0, this.sheetRenderer.canvases.vertical.width, this.sheetRenderer.canvases.vertical.height);
        this.sheetRenderer.draw();
        this.redrawHeaders(ctxH, ctxV);
    }

    redrawHeaders() {
        const ctxH = this.sheetRenderer.canvases.horizontal.getContext('2d');
        const ctxV = this.sheetRenderer.canvases.vertical.getContext('2d');
       
        if (this.selectedColIndex !== null) {
            this.highlightRange(ctxH, 'horizontal', this.selectedCellsRange);
        }
        if (this.selectedRowIndex !== null) {
            this.highlightRange(ctxV, 'vertical', this.selectedCellsRange);
        }
    }

    highlightRange(ctx, direction, range) {
        const spreadsheetCanvas = this.sheetRenderer.canvases.spreadsheet;
        const ctxS = spreadsheetCanvas.getContext('2d');
    
        // Get scroll positions
        const scrollX =  this.sheetRenderer.scrollManager.getScroll().x  // Horizontal scroll offset
        const scrollY = this.sheetRenderer.scrollManager.getScroll().y;   // Vertical scroll offset
   
        const startIdx = Math.min(range.start, range.end);
        const endIdx = Math.max(range.start, range.end);
        const headerCellManager = this.sheetRenderer.headerCellManager;
    
    
        for (let i = startIdx; i <= endIdx; i++) {
            const pos = headerCellManager.getCellpos(direction, i);
            const size = headerCellManager.getCellSize(direction, i);
            // Adjust for scrolling
            if (direction === 'horizontal') {
                const adjustedPos = pos - scrollX;  // Account for horizontal scrolling
                ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';  // Highlight color
                ctxS.fillStyle = 'rgba(0, 128, 0, 0.3)';
                ctx.fillRect(adjustedPos, 0, size, spreadsheetCanvas.height);
                ctxS.fillRect(adjustedPos, 0, size, spreadsheetCanvas.clientHeight);
            } else {
                const adjustedPos = pos - scrollY;  // Account for vertical scrolling
                ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';  // Highlight color
                ctxS.fillStyle = 'rgba(0, 128, 0, 0.3)';
                ctx.fillRect(0, adjustedPos, spreadsheetCanvas.width, size);
                ctxS.fillRect(0, adjustedPos, spreadsheetCanvas.clientWidth, size);
            }
        }
    }
    
    getfullClickedHeaderCell(cells, position, isHorizontal) {
        // console.log(cells,position)
        for (let i = 0; i <= cells.length; i++) {
            const cell = cells[i];
            const start = isHorizontal ? cell.x  : cell.y ;
            const end = isHorizontal ? cell.x + cell.width : cell.y + cell.height;
            if (position >= start  && position <= end  ) {
                return cell;
            }
        }
        return null;
    }


    getClickedHeaderCell(cells, position, isHorizontal) {
        // console.log(cells,position)
        for (let i = 0; i <= cells.length; i++) {
            const cell = cells[i];
            const start = isHorizontal ? cell.x  : cell.y ;
            const end = isHorizontal ? cell.x + cell.width : cell.y + cell.height;
            if (position >= start  && position <= end  ) {
                return i;
            }
        }
        return null;
    }

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

    handleDragForShifting(event) {
        const canvas = this.dragType === 'column'
            ? this.sheetRenderer.canvases.horizontal
            : this.sheetRenderer.canvases.vertical;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        // Get the current scroll position
        const scrollX = this.sheetRenderer.scrollManager.getScroll().x;
        const scrollY = this.sheetRenderer.scrollManager.getScroll().y;
    
        // Get visible cells, accounting for scroll position
        const cells = this.dragType === 'column'
            ? this.sheetRenderer.headerCellManager.getHorizontalHeaderCells(scrollX)
            : this.sheetRenderer.headerCellManager.getVerticalHeaderCells(scrollY);
    
        // Wrap the main logic in requestAnimationFrame for smooth updates
        const animateShift = () => {
            // Find the target index
            const newTargetIndex = this.getClickedHeaderCell(cells, this.isHorizontal ? x + scrollX : y + scrollY, this.dragType);
            console.log("this is target Index", this.targetIndex, this.dragIndex, newTargetIndex);
    
            for (let i = this.selectedCellsRange.start; i <= this.selectedCellsRange.end; i++) {
                // If the target index has changed, perform the swap
                this.draggedIndex = i;
                console.log(this.dragIndex, this.selectedCellsRange.start);
                
                if (newTargetIndex !== this.targetIndex && newTargetIndex !== this.dragIndex) {
                    this.sheetRenderer.swapRowOrColumn(i, newTargetIndex, this.dragType);
                    this.dragIndex = newTargetIndex;
                }
    
                this.targetIndex = newTargetIndex;
            }
    
            // Update the visual feedback
            this.sheetRenderer.updateDragPosition(this.dragIndex, this.targetIndex, this.dragType, { x, y });
    
            // Continue the animation if dragging
            if (this.isDragging) {
                requestAnimationFrame(animateShift);
            }
        };
    
        // Start the animation loop
        requestAnimationFrame(animateShift);
    }
    

    

    
    handleMouseMove(event) {
        if (this.isResizing){
            return;
        } 
        if (this.isDragging){
            //console.log(true)
            this.handleDragForShifting(event);
            return
        };
        //console.log(false)
        this.handleDragForSelection(event)

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

        canvas.style.cursor = resizeEdge ? (isHorizontal ? 'col-resize' : 'row-resize') : 'default';
    }

   

    handleMouseDown(direction , event) {
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

        if (this.isheaderSelection && event.shiftKey){
            for (let i = this.selectedCellsRange.start ; i <= this.selectedCellsRange.end ; i++){
                this.isDragging = true;
                this.dragType = isHorizontal ? 'column' : 'row';
                //console.log(direction,this.selectedCellsRange.start)
                const pos = headerCellManager.getCellpos(direction,  this.selectedCellsRange.start);
                this.dragIndex = i;
                this.dragStart = isHorizontal ? { x: pos, y: 0 } : { x: 0, y: pos };
                
                //console.log(this.dragStart)
                
                // Highlight the dragged cell
                this.sheetRenderer.highlightDraggedCell(this.dragIndex, this.dragType);
            }
        }
        else if (resizeEdge) {
            this.isResizing = true;
            this.isDraggingForSelection = false;
            this.resizeStart = isHorizontal ? x + scrollOffset : y + scrollOffset;
            this.resizeType = isHorizontal ? 'column' : 'row';
            
            // Adjust index calculation based on resize type
            if (this.resizeType === 'column') {
                this.resizeIndex = cells[resizeEdge.index].col - 1; // Use column index for resizing columns
            } else if (this.resizeType === 'row') {
                this.resizeIndex = cells[resizeEdge.index].row - 1; // Use row index for resizing rows
            }
            
            ////console.log(this.resizeIndex);
            event.preventDefault();
        }
        else{
            this.handleHeaderSelection(direction,event);
        }
        
    }


    handleDrag(event) {
        if (!this.isResizing){
            this.handleDragForSelection(event)
            return;
        }
        //console.log("hello")

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

        headerCellManager.setCustomCellSize(
            this.resizeType === 'column' ? 'horizontal' : 'vertical',
            this.resizeIndex,
            newSize
        );

        this.isResizing = false;
        this.currentResizePosition = null;
        this.sheetRenderer.draw(); // Redraw to apply the new sizes
    }

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
