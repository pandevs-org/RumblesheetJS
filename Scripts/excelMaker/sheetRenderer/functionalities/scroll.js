export class Scroll {
    /**
     * Creates an instance of the Scroll class.
     * @param {SheetRenderer} sheetRenderer - The SheetRenderer instance used for rendering the spreadsheet.
     */
    constructor(sheetRenderer) {
        this.sheetRenderer = sheetRenderer;
        this.scrollX = 0;
        this.scrollY = 0;
        this.maxScrollX = 0;
        this.maxScrollY = 0;
        this.isDragging = false;
        this.isScrollbarDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for scrolling and resizing actions.
     * @returns {void}
     */
    setupEventListeners() {
        const canvas = this.sheetRenderer.canvases.spreadsheet;
        canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        const verticalScrollBar = document.getElementById(`verticalBar_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`);
        const horizontalScrollBar = document.getElementById(`horizontalBar_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`);

        if (verticalScrollBar) {
            verticalScrollBar.addEventListener('mousedown', this.handleScrollBarMouseDown.bind(this, 'vertical'));
        }
        if (horizontalScrollBar) {
            horizontalScrollBar.addEventListener('mousedown', this.handleScrollBarMouseDown.bind(this, 'horizontal'));
        }
    }

    /**
     * Handles the mousedown event on scroll bars to initiate dragging.
     * @param {'vertical' | 'horizontal'} direction - The direction of the scroll bar being dragged.
     * @param {MouseEvent} event - The mouse event object.
     * @returns {void}
     */
    handleScrollBarMouseDown(direction, event) {
        event.preventDefault();
        this.isScrollbarDragging = true;
        this.scrollbarDirection = direction;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    /**
     * Handles the mousemove event to perform scrolling or scroll bar dragging.
     * @param {MouseEvent} event - The mouse event object.
     * @returns {void}
     */
    handleMouseMove(event) {
        if (this.isDragging) {
            if (event.shiftKey) {
                const deltaX = this.lastMouseX - event.clientX;
                const deltaY = this.lastMouseY - event.clientY;
                this.scroll(deltaX, deltaY);
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
            }
        } else if (this.isScrollbarDragging) {
            const delta = this.scrollbarDirection === 'vertical'
                ? event.clientY - this.lastMouseY
                : event.clientX - this.lastMouseX;
            
            const scrollRatio = this.scrollbarDirection === 'vertical'
                ? this.sheetRenderer.getVerticalScrollRatio()
                : this.sheetRenderer.getHorizontalScrollRatio();

            const scrollDelta = delta / scrollRatio;
            
            if (this.scrollbarDirection === 'vertical') {
                this.scroll(0, scrollDelta);
            } else {
                this.scroll(scrollDelta, 0);
            }

            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }

    /**
     * Handles the mouseup event to end dragging actions.
     * @returns {void}
     */
    handleMouseUp() {
        this.isDragging = false;
        this.isScrollbarDragging = false;
        this.destroy();
    }

    /**
     * Handles the wheel event for zooming or scrolling.
     * @param {WheelEvent} event - The wheel event object.
     * @returns {void}
     */
    handleWheel(event) {
        if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const deltaX = event.deltaX;
            const deltaY = event.deltaY;
            this.scroll(deltaX, deltaY);
        }
    }

    /**
     * Handles the mousedown event to initiate dragging.
     * @param {MouseEvent} event - The mouse event object.
     * @returns {void}
     */
    handleMouseDown(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }
    
    /**
     * Updates the maximum scroll values based on content and viewport dimensions.
     * @param {number} totalWidth - The total width of the content.
     * @param {number} totalHeight - The total height of the content.
     * @param {number} viewportWidth - The width of the viewport.
     * @param {number} viewportHeight - The height of the viewport.
     * @returns {void}
     */
    updateMaxScroll(totalWidth, totalHeight, viewportWidth, viewportHeight) {
        this.maxScrollX = Math.max(0, totalWidth - viewportWidth);
        this.maxScrollY = Math.max(0, totalHeight - viewportHeight);
        
        // Adjust current scroll if it exceeds new maximum
        this.scrollX = Math.min(this.scrollX, this.maxScrollX);
        this.scrollY = Math.min(this.scrollY, this.maxScrollY);
    }

    /**
     * Updates the appearance of scroll bars based on current scroll position.
     * @returns {void}
     */
    updateScrollBars() {
        this.sheetRenderer.updateScrollBars(this.scrollX, this.scrollY, this.maxScrollX, this.maxScrollY);
    }

  /**
     * Scrolls the content by the given delta values.
     * @param {number} deltaX - The horizontal scroll delta.
     * @param {number} deltaY - The vertical scroll delta.
     * @returns {void}
     */
  scroll(deltaX, deltaY) {
    // Limit the maximum scroll speed
    const maxScrollSpeed = 10000; // Adjust this value to control the maximum scroll speed
    // console.log(deltaX,deltaY)
    if (deltaX>0 || deltaY>0){
        deltaX = Math.max(-maxScrollSpeed, Math.min(deltaX, maxScrollSpeed));
        deltaY = Math.max(-maxScrollSpeed, Math.min(deltaY, maxScrollSpeed));
    }
    
    this.scrollX = Math.max(0, Math.min(this.scrollX + deltaX, this.maxScrollX));
    this.scrollY = Math.max(0, Math.min(this.scrollY + deltaY, this.maxScrollY));

    this.updateScrollBars();
    this.checkScrollPosition();
    this.sheetRenderer.draw();
}

    
    /**
     * Checks if the scroll position has reached a threshold to expand content.
     * @returns {void}
     */
    checkScrollPosition() {
        // Horizontal scroll
        const horizontalRatio = this.scrollX / this.maxScrollX;
        if (horizontalRatio > 0.8) {
            this.expandContent('horizontal');
        }
    
        // Vertical scroll
        const verticalRatio = this.scrollY / this.maxScrollY;
        if (verticalRatio > 0.8) {
            this.expandContent('vertical');
        }
    }
    
    /**
     * Expands content based on the scroll direction and updates scroll bars.
     * @param {'horizontal' | 'vertical'} direction - The direction of the content expansion.
     * @returns {void}
     */
    expandContent(direction) {
        const scrollBar = direction === 'horizontal' 
            ? document.getElementById(`horizontalBar_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`)
            : document.getElementById(`verticalBar_${this.sheetRenderer.sheet.row}_${this.sheetRenderer.sheet.col}_${this.sheetRenderer.sheet.index}`);
    
        if (scrollBar) {
            const expandFactor = 1.2; // Factor to expand content
            const shrinkFactor = 0.8; // Factor to shrink content

            if (direction === 'horizontal') {
                if (this.scrollX >= 0.8 * (this.maxScrollX - this.sheetRenderer.canvases.spreadsheet.clientWidth)) {
                    this.sheetRenderer.headerCellManager.updateCells();
                    this.maxScrollX *= expandFactor;
                    this.scrollX = Math.min(this.scrollX, this.maxScrollX);
                }
            } else if (direction === 'vertical') {
                if (this.scrollY >= 0.8 * (this.maxScrollY - this.sheetRenderer.canvases.spreadsheet.clientHeight)) {
                    this.sheetRenderer.headerCellManager.updateCells();
                    this.maxScrollY *= expandFactor;
                    this.scrollY = Math.min(this.scrollY, this.maxScrollY);
                }
            }

            // Update scrollbar style
            this.updateScrollBars();
        }
    }
    
    /**
     * Gets the current scroll position.
     * @returns {{ x: number, y: number }} The current scroll position.
     */
    getScroll() {
        return { x: this.scrollX, y: this.scrollY };
    }
    
    /**
     * Cleans up resources and removes event listeners.
     * @returns {void}
     */
    destroy() {
        const canvas = this.sheetRenderer.canvases.spreadsheet;
        canvas.removeEventListener('wheel', this.handleWheel);
        canvas.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}
