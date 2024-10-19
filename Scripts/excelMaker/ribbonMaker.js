/**
 * Represents a manager for a ribbon interface in an Excel-like application.
 */
export class RibbonMaker {
    /**
     * @param {HTMLElement} ribbon - The main container element for the ribbon interface.
     */
    constructor(ribbon) {
        this.ribbon = ribbon;
        this.createRibbon();
        this.handleEvents();
    }

    /**
     * Sets up event listeners for the ribbon buttons.
     */
    handleEvents() {
        this.addTabEventListeners(); // Add tab switch listeners
        this.addFontSizeEventListeners(); // Add Font Size listeners
        this.addFontFamilyListener; // Add Font Family listeners
        this.addTextFormatListeners(); // Add text format listeners
        this.addTextColorListener(); // Add text color listener
        this.addFillColorListener(); // Add fill color listener
        this.addHorizontalAlignmentListeners(); // Add horizontal alignment listeners
        this.addVerticalAlignmentListeners(); // Add vertical alignment listeners
    }

    /**
     * Creates the ribbon interface dynamically.
     */
    createRibbon() {
        // Clear existing content
        this.ribbon.innerHTML = '';

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', '75');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated"></div>`;
        this.ribbon.appendChild(progressBar);

        // Create tab list container
        const tabListContainer = document.createElement('div');
        tabListContainer.className = 'tab-list-container';
        tabListContainer.innerHTML = `
            <span class="tab-list-container-items format-tab-btn active">Format</span>
            <span class="tab-list-container-items file-tab-btn">File</span>
            <span class="tab-list-container-items operations-tab-btn">Operations</span>
            <span class="tab-list-container-items graph-tab-btn">Graph</span>
        `;
        this.ribbon.appendChild(tabListContainer);

        // Create focus zone
        const focusZone = document.createElement('div');
        focusZone.className = 'focus-zone';
        focusZone.innerHTML = `
            <div class="row focus-zone-inner">
                <div class="focus-zone-left">
                    ${this.createFormatSection()}
                    ${this.createFileSection()}
                    ${this.createOperationsSection()}
                    ${this.createGraphSection()}
                </div>
                <div class="focus-zone-right">
                    <button class="add-new-row focus-zone-inner-btn focus-zone-inner-btn-left">
                        <span class="iconify" data-icon="majesticons:add-row" data-width="23" data-height="23"></span>
                    </button>
                    <button class="delete-excel focus-zone-inner-btn focus-zone-inner-btn-middle">
                        <span class="iconify" data-icon="mdi:table-large-remove" data-width="23" data-height="23"></span>
                    </button>
                    <button class="add-new-col focus-zone-inner-btn focus-zone-inner-btn-right">
                        <span class="iconify" data-icon="majesticons:add-column" data-width="23" data-height="23"></span>
                    </button>
                </div>
            </div>
        `;
        this.ribbon.appendChild(focusZone);
    }

    /**
     * Creates the format section HTML.
     * @returns {string} The format section HTML.
     */
    createFormatSection() {
        return `
            <div class="focus-format active">
                <button class="focus-zone-inner-btn focus-zone-inner-btn-left font-bold-btn active">
                    <span class="iconify" data-icon="f7:bold" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-middle font-italic-btn">
                    <span class="iconify" data-icon="lucide:italic" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-middle font-strikethrough-btn">
                    <span class="iconify" data-icon="majesticons:strike-through-line" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right font-underline-btn">
                    <span class="iconify" data-icon="lucide:underline" data-width="23" data-height="23"></span>
                </button>

                <div class="focus-zone-inner-seperator"></div>

                <button class="focus-zone-inner-btn focus-zone-inner-btn-left horizontal-left-btn active">
                    <span class="iconify" data-icon="mingcute:align-left-line" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-middle horizontal-center-btn">
                    <span class="iconify" data-icon="mingcute:align-center-line" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right horizontal-right-btn">
                    <span class="iconify" data-icon="mingcute:align-right-line" data-width="23" data-height="23"></span>
                </button>

                <div class="focus-zone-inner-seperator"></div>

                <button class="focus-zone-inner-btn focus-zone-inner-btn-left vertical-top-btn">
                    <span class="iconify" data-icon="material-symbols:vertical-align-top-rounded" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-middle vertical-middle-btn active">
                    <span class="iconify" data-icon="material-symbols:vertical-align-center-rounded" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right vertical-bottom-btn">
                    <span class="iconify" data-icon="material-symbols:vertical-align-bottom-rounded" data-width="23" data-height="23"></span>
                </button>

                <div class="focus-zone-inner-seperator"></div>

                <button class="focus-zone-inner-btn focus-zone-inner-btn-left decrement-font-size-btn">
                    <span class="iconify" data-icon="ph:minus-bold" data-width="23" data-height="23"></span>
                </button>

                <input class="font-size-input" type="text" id="fontSize" value="14">

                <button class="focus-zone-inner-btn focus-zone-inner-btn-right increment-font-size-btn">
                    <span class="iconify" data-icon="ph:plus-bold" data-width="23" data-height="23"></span>
                </button>

                <div class="focus-zone-inner-seperator"></div>

                <select class="font-family-select" id="fontFamily">
                    <option class="font-family-option" value="Arial" style="font-family: Arial;">Arial</option>
                    <option class="font-family-option" value="Times New Roman" style="font-family: 'Times New Roman';">Times New Roman</option>
                    <option class="font-family-option" value="Verdana" style="font-family: Verdana;">Verdana</option>
                </select>

                <div class="focus-zone-inner-seperator"></div>

                <button class="focus-zone-inner-btn focus-zone-inner-btn-left">
                    <label for="text-color-picker">
                        <span class="iconify" data-icon="tabler:letter-a" data-width="23" data-height="23"></span>
                    </label>
                    <input id="text-color-picker" type="color" title="Text Color">
                </button>

                <button class="focus-zone-inner-btn focus-zone-inner-btn-right">
                    <label for="fill-color-picker">
                        <span class="iconify" data-icon="mdi:format-colour-fill" data-width="23" data-height="23"></span>
                    </label>
                    <input id="fill-color-picker" type="color" title="Fill Color">
                </button>
            </div>
        `;
    }

    /**
     * Creates the file section HTML.
     * @returns {string} The file section HTML.
     */
    createFileSection() {
        return `
            <div class="focus-file">
                <input class="focus-zone-input-btn focus-zone-inner-btn-left" type="file" name="file" accept=".csv">
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right" type="submit" value="Upload">
                    <span class="iconify" data-icon="material-symbols:upload" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
    }

    /**
     * Creates the operations section HTML.
     * @returns {string} The operations section HTML.
     */
    createOperationsSection() {
        return `
            <div class="focus-operations">
                <input class="focus-zone-input-btn focus-zone-inner-btn-left" type="text" id="search-input" placeholder="Search...">
                <button id="search" class="focus-zone-inner-btn focus-zone-inner-btn-right">
                    <span class="iconify" data-icon="material-symbols:search" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
    }

    /**
     * Creates the graph section HTML.
     * @returns {string} The graph section HTML.
     */
    createGraphSection() {
        return `
            <div class="focus-graph">
                <button class="focus-zone-inner-btn focus-zone-inner-btn-left" data-chart-type="bar">
                    <span class="iconify" data-icon="mdi:chart-bar" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right" data-chart-type="line">
                    <span class="iconify" data-icon="mdi:chart-line" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
    }

    /**
     * Adds event listeners for the tab buttons.
     */
    addTabEventListeners() {
        const tabButtons = {
            format: this.ribbon.querySelector(".format-tab-btn"),
            file: this.ribbon.querySelector(".file-tab-btn"),
            operations: this.ribbon.querySelector(".operations-tab-btn"),
            graph: this.ribbon.querySelector(".graph-tab-btn"),
        };

        const tabContents = {
            format: this.ribbon.querySelector('.focus-format'),
            file: this.ribbon.querySelector('.focus-file'),
            operations: this.ribbon.querySelector('.focus-operations'),
            graph: this.ribbon.querySelector('.focus-graph'),
        };

        Object.keys(tabButtons).forEach(tab => {
            tabButtons[tab].addEventListener("click", () => this.toggleTab(tab, tabButtons, tabContents));
        });
    }

    /**
     * Toggles the active state for tab buttons and their corresponding content.
     * @param {string} activeTab - The currently active tab's key.
     * @param {Object} tabButtons - The tab buttons.
     * @param {Object} tabContents - The corresponding tab contents.
     */
    toggleTab(activeTab, tabButtons, tabContents) {
        Object.keys(tabButtons).forEach(tab => {
            if (tab === activeTab) {
                tabButtons[tab].classList.add("active");
                tabContents[tab].classList.add("active");
            } else {
                tabButtons[tab].classList.remove("active");
                tabContents[tab].classList.remove("active");
            }
        });
    }

    /**
     * Adds event listeners for font size changes.
     */
    addFontSizeEventListeners() {
        const decrementBtn = this.ribbon.querySelector('.decrement-font-size-btn');
        const incrementBtn = this.ribbon.querySelector('.increment-font-size-btn');
        const fontSizeInput = this.ribbon.querySelector('#fontSize');

        // Function to update the font size
        const updateFontSize = (newSize) => {
            fontSizeInput.value = newSize;
            this.oldInput = newSize;
        };

        // Decrease font size
        decrementBtn.addEventListener('click', () => {
            let currentSize = parseInt(fontSizeInput.value);
            if (currentSize > 1) { // Prevent font size from becoming too small
                currentSize--;
                updateFontSize(currentSize);
            }
        });

        // Increase font size
        incrementBtn.addEventListener('click', () => {
            let currentSize = parseInt(fontSizeInput.value);
            currentSize++;
            updateFontSize(currentSize);
        });

        // Handle manual input changes
        fontSizeInput.addEventListener('input', (event) => {
            let newSize = parseInt(event.target.value);
            if (!isNaN(newSize) && newSize < 100 && newSize > 0) { // Valid font size range
                updateFontSize(newSize);
            } else {
                updateFontSize(this.oldInput); // Restore old valid input if invalid
            }
        });
    }

    /**
     * Adds event listener for font family selection.
     */
    addFontFamilyListener() {
        const fontSelect = document.getElementById('fontFamily');

        fontSelect.addEventListener('change', () => {
            const selectedFont = fontSelect.value;
            // Assuming you have a target element to apply the font to, like a text area
            const textArea = document.getElementById('textArea'); // Update with your actual target
            if (textArea) {
                textArea.style.fontFamily = selectedFont;
            }
        });
    }

    /**
     * Adds event listeners for text formatting buttons.
     */
    addTextFormatListeners() {
        const fontBoldBtn = document.querySelector(".font-bold-btn");
        const fontItalicBtn = document.querySelector('.font-italic-btn');
        const fontStrikethroughBtn = document.querySelector(".font-strikethrough-btn");
        const fontUnderlineBtn = document.querySelector('.font-underline-btn');

        fontBoldBtn.addEventListener("click", () => {
            this.toggleActiveState(fontBoldBtn, [fontItalicBtn, fontStrikethroughBtn, fontUnderlineBtn]);
        });

        fontItalicBtn.addEventListener("click", () => {
            this.toggleActiveState(fontItalicBtn, [fontBoldBtn, fontStrikethroughBtn, fontUnderlineBtn]);
        });

        fontStrikethroughBtn.addEventListener("click", () => {
            this.toggleActiveState(fontStrikethroughBtn, [fontBoldBtn, fontItalicBtn, fontUnderlineBtn]);
        });

        fontUnderlineBtn.addEventListener("click", () => {
            this.toggleActiveState(fontUnderlineBtn, [fontBoldBtn, fontItalicBtn, fontStrikethroughBtn]);
        });
    }

    /**
     * Toggles active state for formatting buttons.
     * @param {HTMLElement} activeBtn - The button to be activated.
     * @param {HTMLElement[]} otherBtns - Other buttons to be deactivated.
     */
    toggleActiveState(activeBtn, otherBtns) {
        activeBtn.classList.add("active");
        otherBtns.forEach(btn => btn.classList.remove("active"));
    }
    
    /**
     * Adds event listener for text color selection.
     */
    addTextColorListener() {
        const textColorPicker = this.ribbon.querySelector("#text-color-picker");

        textColorPicker.addEventListener("input", (event) => {
            const color = event.target.value;
            document.execCommand("foreColor", false, color);
        });
    }

    /**
     * Adds event listener for fill color selection.
     */
    addFillColorListener() {
        const fillColorPicker = document.getElementById('fill-color-picker');

        fillColorPicker.addEventListener('input', () => {
            const color = fillColorPicker.value;
            document.execCommand("backColor", false, color); // Change the fill color
        });
    }

    /**
     * Adds event listeners for horizontal alignment buttons.
     */
    addHorizontalAlignmentListeners() {
        const horizontalLeftBtn = this.ribbon.querySelector(".horizontal-left-btn");
        const horizontalCenterBtn = this.ribbon.querySelector(".horizontal-center-btn");
        const horizontalRightBtn = this.ribbon.querySelector(".horizontal-right-btn");

        horizontalLeftBtn.addEventListener("click", () => this.toggleActiveState(horizontalLeftBtn, [horizontalCenterBtn, horizontalRightBtn]));
        horizontalCenterBtn.addEventListener("click", () => this.toggleActiveState(horizontalCenterBtn, [horizontalLeftBtn, horizontalRightBtn]));
        horizontalRightBtn.addEventListener("click", () => this.toggleActiveState(horizontalRightBtn, [horizontalLeftBtn, horizontalCenterBtn]));
    }

    /**
     * Adds event listeners for vertical alignment buttons.
     */
    addVerticalAlignmentListeners() {
        const verticalTopBtn = this.ribbon.querySelector(".vertical-top-btn");
        const verticalMiddleBtn = this.ribbon.querySelector('.vertical-middle-btn');
        const verticalBottomBtn = this.ribbon.querySelector(".vertical-bottom-btn");

        verticalTopBtn.addEventListener("click", () => this.toggleActiveState(verticalTopBtn, [verticalMiddleBtn, verticalBottomBtn]));
        verticalMiddleBtn.addEventListener("click", () => this.toggleActiveState(verticalMiddleBtn, [verticalTopBtn, verticalBottomBtn]));
        verticalBottomBtn.addEventListener("click", () => this.toggleActiveState(verticalBottomBtn, [verticalTopBtn, verticalMiddleBtn]));
    }
}