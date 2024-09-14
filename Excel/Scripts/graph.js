export class Graph {

    constructor(sheetRenderer) {
        this.sheetRenderer = sheetRenderer;
        this.cellFunctionality = this.sheetRenderer.cellFunctionality;


        this.graphCloseBtn = document.createElement('button');
        this.graphCloseBtn.innerText = 'X'; // Text inside the button
        this.graphCloseBtn.className = 'graph-close btn btn-sm btn-danger'; // Assign classes to the button

        // Create a canvas element dynamically
        this.graphCanvasElement = document.createElement('canvas');
        this.graphCanvasElement.id = 'myChart'; // Set an ID to the canvas

        // Append button and canvas to the container div
        this.graph = document.querySelector(".graph");
        this.graph.appendChild(this.graphCloseBtn);
        this.graph.appendChild(this.graphCanvasElement);


        this.barGraphBtn = document.querySelector(".graph-bar-btn");
        this.lineGraphBtn = document.querySelector(".graph-line-btn");
        this.pieGraphBtn = document.querySelector(".graph-pie-btn");
        

        this.init()
    }


    init() {
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

          this.graphCloseBtn.addEventListener("click",() => {
            this.graph.style.display = "none";
          });
          this.handleEvents();
    }

    print(){
        this.selectedCells = new Object();
        this.keys = null;

        for (let i = 0; i < this.cellFunctionality.selectedCells.length ; i++){
            var key = this.cellFunctionality.selectedCells[i].row.row
            if(key in this.selectedCells){
                this.selectedCells[this.cellFunctionality.selectedCells[i].row.row].push([this.cellFunctionality.selectedCells[i]])
            }
            else{
                this.selectedCells[this.cellFunctionality.selectedCells[i].row.row] = []
                this.selectedCells[this.cellFunctionality.selectedCells[i].row.row].push([this.cellFunctionality.selectedCells[i]])
            }
        }

        this.keys  = Object.keys(this.selectedCells)
       

        if(this.keys.length >= 1) {

            // let xValues=[];
            // for(let i=keys[0]; i<= keys[keys.length-1]; i++){
            //     let dataSet={
            //         label: i,   // sticker or no. of colours
            //         data:[],
            //         borderWidth: 1,
            //     }
            //     for(let j= 0; j< this.selectedCells[keys[0]].length; j++){
            //         xValues[j] = ((this.selectedCells[i])[j])[0].row.row
            //         dataSet.data.push(((this.selectedCells[i])[j])[0].linkedListValue.value)
            //     }
    
            //     dataSets.push(dataSet)
            // }
        }



    }

    getGraphValue(){
        let xValues=[];
        let dataSets=[];
        console.log(this.keys)
        if(this.isHorizantalSizebigger()){
            console.log("Bigger")
            for(let i=this.keys[0]; i<= this.keys[this.keys.length-1]; i++){
                let dataSet={
                    label: i,   // sticker or no. of colours
                    data:[],
                    borderWidth: 1,
                }
                for(let j= 0; j< this.selectedCells[this.keys[0]].length; j++){
                    // console.log
                    xValues[j] = ((this.selectedCells[i])[j])[0].column.value

                    dataSet.data.push(((this.selectedCells[i])[j])[0].linkedListValue.value)
                }
    
                dataSets.push(dataSet)
            }
        }
        else{
            console.log("smaller",this.selectedCells[this.keys[0]].length)
            for(let i=0 ; i < this.selectedCells[this.keys[0]].length;i++){
                let dataSet={
                    label: ((this.selectedCells[this.keys[0]])[i])[0].column.value,
                    data:[],
                    borderWidth: 1,
                }
                // console.log("colors", ((this.selectedCells[this.keys[0]])[i])[0].column.value)
                // console.log(this.keys[0], this.keys[this.keys.length-1])
                console.log(this.keys,this.keys[0],this.keys[this.keys.length-1],this.keys[0] <=this.keys[this.keys.length-1])
                for(let j=this.keys[0]; j <=this.keys[this.keys.length-1]; j++){
                    console.log(j)
                    xValues[parseInt(j)-parseInt(this.keys[0])]= parseInt(j);
                    dataSet.data.push(((this.selectedCells[j])[i])[0].linkedListValue.value)
                    // console.log(j, ((this.selectedCells[j])[i])[0].linkedListValue.value)
                }
                dataSets.push(dataSet)
            }
        }
    
        return {xValues,dataSets};
    }
  
    isHorizantalSizebigger(){
      if(this.selectedCells[this.keys[0]].length > this.keys.length) return true;
      
      return false;
    }

    // destroy graph
    destroyGraph(){
        if(this.draw){
          this.draw.destroy()
        }
    }

    //  * Drawing Bar Graph
    drawBarGraph() {
        this.destroyGraph()
        let {xValues:xValues,dataSets:dataSets}=this.getGraphValue();
        this.draw = new Chart(this.graphCanvasElement, {
            type: "bar",
            data: {
            labels: xValues,
            datasets: dataSets
            }
        });
        }
    
        //  * Drawing Line Graph
        drawLineGraph() {
        this.destroyGraph()
        let {xValues:xValues,dataSets:dataSets}=this.getGraphValue();
        this.draw = new Chart(this.graphCanvasElement, {
            type : 'line',
            data: {
            labels: xValues,
            datasets: dataSets
            }
        });
        }
    
        //  * Drawing Pie Chart
        drawPieGraph(){
        this.destroyGraph()
        let {xValues:xValues,dataSets:dataSets}=this.getGraphValue();
        this.draw=new Chart(this.graphCanvasElement, {
            type : 'pie',
            data: {
            labels: xValues,
            datasets: dataSets
            }
        });
        }

        dragChart(evt) {
            if (this.draging) {
                let graphX = this.graph.getBoundingClientRect().x;
                let graphY = this.graph.getBoundingClientRect().y;
                let newX = graphX + evt.movementX;
                if (newX > 0) {
                    this.graph.style.left = newX + "px";
                }
                let newY = graphY + evt.movementY;
                if (newY > 0) {
                    this.graph.style.top = newY + "px";
                }
            }
        }
    
        handleEvents() {
    
            this.graph.addEventListener("mousedown", () => {
                this.draging = true;
            });
            window.addEventListener("mouseup", () => {
                this.draging = false;
            });
            window.addEventListener("mousemove", this.dragChart.bind(this));
        }
}