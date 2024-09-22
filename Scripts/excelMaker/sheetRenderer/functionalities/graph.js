/**
 * Class responsible for generating and managing graphs based on selected cells in a spreadsheet.
 */
export class Graph {
    /**
     * @param {Object} sheetRenderer - Reference to the sheet renderer, containing canvas and cell functionality.
     */
    constructor(sheetRenderer) {
        this.sheetRenderer = sheetRenderer;
        this.cellFunctionality = this.sheetRenderer.cellFunctionality;

        this.init(); // Initialize event listeners and graph functionalities
        this.handleEvents()
    }

    /**
     * Initialize event listeners for graph buttons and handle user interactions.
     */
    init() {

        this.graphCloseBtn = document.createElement('button');
        this.graphCloseBtn.innerText = 'X'; // Close button text
        this.graphCloseBtn.className = 'graph-close btn btn-sm btn-danger'; // Button classes

        this.graphCanvasElement = document.createElement('canvas');
        this.graphCanvasElement.id = 'myChart'; // Canvas element for the graph

        this.graph = document.querySelector(".graph");
        this.graph.appendChild(this.graphCloseBtn);
        this.graph.appendChild(this.graphCanvasElement);

        this.barGraphBtn = document.querySelector(".graph-bar-btn");
        this.lineGraphBtn = document.querySelector(".graph-line-btn");
        this.pieGraphBtn = document.querySelector(".graph-pie-btn");    
    }

    /**
     * Handles the events related to dragging and mouse interactions for the graph window.
     */
    handleEvents() {
        this.barGraphBtn.addEventListener("click", () => {
            this.graph.style.display = "inline-block";
            this.drawBarGraph();
        });

        this.lineGraphBtn.addEventListener("click", () => {
            this.graph.style.display = "inline-block";
            this.drawLineGraph();
        });

        this.pieGraphBtn.addEventListener("click", () => {
            this.graph.style.display = "inline-block";
            this.drawPieGraph();
        });

        this.graphCloseBtn.addEventListener("click", () => {
            this.graph.style.display = "none";
        });
        
        this.graph.addEventListener("mousedown", () => {
            this.draging = true;
        });

        window.addEventListener("mouseup", () => {
            this.draging = false;
        });

        window.addEventListener("mousemove", this.dragChart.bind(this));
    }

    /**
     * Collects and organizes selected cells from the spreadsheet for graphing.
     */
    print() {
        this.selectedCells = {};
        this.keys = null;

        for (let i = 0; i < this.cellFunctionality.selectedCells.length; i++) {
            const cell = this.cellFunctionality.selectedCells[i];
            const rowKey = cell.row.row;

            if (!this.selectedCells[rowKey]) {
                this.selectedCells[rowKey] = [];
            }

            this.selectedCells[rowKey].push([cell]);
        }

        this.keys = Object.keys(this.selectedCells);
    }

    /**
     * Generates the values and labels required to plot the graph based on selected cells.
     * @returns {Object} - Contains x-axis labels (xValues) and dataset information (dataSets).
     */
    getGraphValue() {
        let xValues = [];
        let dataSets = [];

        if (this.isHorizantalSizeBigger()) {
            for (let i = this.keys[0]; i <= this.keys[this.keys.length - 1]; i++) {
                let dataSet = {
                    label: i,
                    data: [],
                    borderWidth: 1,
                };

                for (let j = 0; j < this.selectedCells[this.keys[0]].length; j++) {
                    xValues[j] = ((this.selectedCells[i])[j])[0].column.value;
                    dataSet.data.push(((this.selectedCells[i])[j])[0].linkedListValue.value);
                }

                dataSets.push(dataSet);
            }
        } else {
            for (let i = 0; i < this.selectedCells[this.keys[0]].length; i++) {
                let dataSet = {
                    label: ((this.selectedCells[this.keys[0]])[i])[0].column.value,
                    data: [],
                    borderWidth: 1,
                };

                for (let j = this.keys[0]; j <= this.keys[this.keys.length - 1]; j++) {
                    xValues[parseInt(j) - parseInt(this.keys[0])] = parseInt(j);
                    dataSet.data.push(((this.selectedCells[j])[i])[0].linkedListValue.value);
                }

                dataSets.push(dataSet);
            }
        }

        return { xValues, dataSets };
    }

    /**
     * Determines whether the horizontal size (number of columns) is larger than the vertical size (number of rows).
     * @returns {boolean} - True if horizontal size is larger, false otherwise.
     */
    isHorizantalSizeBigger() {
        return this.selectedCells[this.keys[0]].length > this.keys.length;
    }

    /**
     * Destroys the current graph if it exists.
     */
    destroyGraph() {
        if (this.draw) {
            this.draw.destroy();
        }
    }

    /**
     * Draws a bar graph based on the selected cell data.
     */
    drawBarGraph() {
        this.destroyGraph();
        const { xValues, dataSets } = this.getGraphValue();
        this.draw = new Chart(this.graphCanvasElement, {
            type: "bar",
            data: {
                labels: xValues,
                datasets: dataSets,
            },
        });
    }

    /**
     * Draws a line graph based on the selected cell data.
     */
    drawLineGraph() {
        this.destroyGraph();
        const { xValues, dataSets } = this.getGraphValue();
        this.draw = new Chart(this.graphCanvasElement, {
            type: "line",
            data: {
                labels: xValues,
                datasets: dataSets,
            },
        });
    }

    /**
     * Draws a pie chart based on the selected cell data.
     */
    drawPieGraph() {
        this.destroyGraph();
        const { xValues, dataSets } = this.getGraphValue();
        this.draw = new Chart(this.graphCanvasElement, {
            type: "pie",
            data: {
                labels: xValues,
                datasets: dataSets,
            },
        });
    }

    /**
     * Handles dragging of the graph window.
     * @param {Event} evt - Mouse move event.
     */
    dragChart(evt) {
        if (this.draging) {
            const graphRect = this.graph.getBoundingClientRect();
            const newX = graphRect.x + evt.movementX;
            const newY = graphRect.y + evt.movementY;

            if (newX > 0) {
                this.graph.style.left = `${newX}px`;
            }
            if (newY > 0) {
                this.graph.style.top = `${newY}px`;
            }
        }
    }
}
