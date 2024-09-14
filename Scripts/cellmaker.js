        class HeaderCell {
        constructor(x, y, width, height, value, row, col) {
            this.x = x;
            this.y = y;
            this.row = row;
            this.col = col;
            this.width = width;
            this.height = height;
            this.value = value;
            this.isfetched = false;

        }
        }

        export class HeaderCellManager {
        constructor(sheet, visibleWidth, visibleHeight, scale) {
            this.sheet = sheet;
            this.minCellSize = 30;
            this.baseCellWidth = 120;
            this.baseCellHeight = 40;
            this.scale = scale;
            this.visibleWidth = visibleWidth;
            this.visibleHeight = visibleHeight;
            this.horizontalHeaderCells = [];
            this.verticalHeaderCells = []; // Changed from Map to Array
            this.customHorizontalSizes = new Map();
            this.customVerticalSizes = new Map();
            this.totalWidth = 0;
            this.totalHeight = 0;
            this.fetchedRanges = [];
            this.fetchQueue = [];
            this.isFetching = false; // Indicates if a fetch is currently happening
            this.throttleDuration = 300;
            this.lastFetchTime = 0; // To store the timestamp of the last fetch request

            // Initialize cells
            this.update(visibleWidth, visibleHeight, scale);
        }

        update(visibleWidth, visibleHeight, scale) {
            const oldScale = this.scale;
            this.visibleWidth = visibleWidth;
            this.visibleHeight = visibleHeight;
            this.scale = scale;
            this.resizeAllCells(oldScale, scale);
            this.updateCells();
        }

        resizeAllCells(oldScale, newScale) {
            const scaleFactor = newScale / oldScale;

            // Resize horizontal cells
            for (let cell of this.horizontalHeaderCells) {
            if (!this.customHorizontalSizes.has(cell.col - 1)) {
                cell.width *= scaleFactor;
            }
            }

            // Resize vertical cells
            for (let cell of this.verticalHeaderCells) {
            if (!this.customVerticalSizes.has(cell.row - 1)) {
                cell.height *= scaleFactor;
            }
            }
        }

        updateCells() {
            const cellWidth = Math.max(
            this.minCellSize,
            this.baseCellWidth * this.scale
            );
            const cellHeight = Math.max(
            this.minCellSize,
            this.baseCellHeight * this.scale
            );

            // Update horizontal cells
            const horizontalCellCount = Math.ceil(this.visibleWidth / cellWidth) + 1;
            while (this.horizontalHeaderCells.length < horizontalCellCount) {
            const i = this.horizontalHeaderCells.length;
            const width = this.customHorizontalSizes.get(i) || cellWidth;
            this.horizontalHeaderCells.push(
                new HeaderCell(
                0,
                0,
                width,
                this.minCellSize,
                this.numberToColumnName(i + 1),
                0,
                i + 1
                )
            );
            }
            // Update vertical cells

            const verticalCellCount = Math.ceil(this.visibleHeight / cellHeight) + 1;

            while (this.verticalHeaderCells.length < verticalCellCount) {
            const i = this.verticalHeaderCells.length;
            const height = this.customVerticalSizes.get(i) || cellHeight;
            
            this.verticalHeaderCells.push(
                new HeaderCell(0, 0, this.minCellSize, height, i + 1, i + 1, 0)
            );
            }

            // Update positions
            this.updateCellPositions("horizontal");
            this.updateCellPositions("vertical");
        }

        numberToColumnName(num) {
            let columnName = "";
            while (num > 0) {
            num--;
            columnName = String.fromCharCode(65 + (num % 26)) + columnName;
            num = Math.floor(num / 26);
            }
            return columnName;
        }

        setCustomCellSize(type, index, size) {
            if (type === "horizontal") {
            this.customHorizontalSizes.set(index, Math.max(this.minCellSize, size));
            } else if (type === "vertical") {
            this.customVerticalSizes.set(index, Math.max(this.minCellSize, size));
            }
            this.updateCellPositions(type);
        }

        updateCellPositions(type) {
            if (type === "horizontal") {
            let position = 0;
            for (let i = 0; i < this.horizontalHeaderCells.length; i++) {
                const cell = this.horizontalHeaderCells[i];
                if (this.customHorizontalSizes.has(i)) {
                cell.width = this.customHorizontalSizes.get(i);
                }
                cell.x = position;
                position += cell.width;
            }
            } else {
            let position = 0;
            for (let i = 0; i < this.verticalHeaderCells.length; i++) {
                const cell = this.verticalHeaderCells[i];
                if (this.customVerticalSizes.has(i)) {
                cell.height = this.customVerticalSizes.get(i);
                }
                cell.y = position;
                position += cell.height;
            }
            }
        }

        findStartingIndex(type, scroll) {
            const cells =
            type === "horizontal"
                ? this.horizontalHeaderCells
                : this.verticalHeaderCells;
            let low = 0;
            let high = cells.length - 1;

            while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const cell = cells[mid];
            const position = type === "horizontal" ? cell.x : cell.y;
            const size = type === "horizontal" ? cell.width : cell.height;

            if (position + size > scroll) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
            }

            return low < cells.length ? low : cells.length;
        }

        getHorizontalHeaderCells(scrollX) {
            const startIndex = this.findStartingIndex("horizontal", scrollX);
            const visibleCells = [];
            let position = this.horizontalHeaderCells[startIndex]?.x || 0;

            for (let i = startIndex; position < scrollX + this.visibleWidth; i++) {
            if (i >= this.horizontalHeaderCells.length) {
                const width = this.getCellSize("horizontal", i);
                this.horizontalHeaderCells.push(
                new HeaderCell(position,0,width,this.minCellSize,this.numberToColumnName(i + 1),0,i + 1)
                );
            }
            const cell = this.horizontalHeaderCells[i];
            visibleCells.push(cell);
            position += cell.width;
            }

            return visibleCells;
        }

        getVerticalHeaderCells(scrollY) {
            const startIndex = this.findStartingIndex("vertical", scrollY);
            const visibleCells = [];
            // const buffer = this.sheet.UploadAndFetch.to; // Buffer size before and after the start index
            // const fetchStartIndex = Math.max(startIndex - buffer, 0);
            // const fetchEndIndex = startIndex + buffer;
        
            
        
            let position = this.verticalHeaderCells[startIndex]?.y || 0;
            for (let i = startIndex; position < scrollY + this.visibleHeight; i++) {
                if (i >= this.verticalHeaderCells.length) {
                    const height = this.getCellSize("vertical", i);
                    this.verticalHeaderCells.push(
                        new HeaderCell(0, position, this.minCellSize, height, i + 1, i + 1, 0)
                    );
                }
                const cell = this.verticalHeaderCells[i];
                visibleCells.push(cell);
                position += cell.height;
            }
            // Add the fetch request to the queue
            // let _ = this.addToFetchQueue(fetchStartIndex, fetchEndIndex);
            return visibleCells;
        }
        
        async addToFetchQueue(fetchStartIndex, fetchEndIndex) {
            const currentTime = Date.now();
        
            // Throttle: Ensure a minimum interval between fetch requests
            if (currentTime - this.lastFetchTime < this.throttleInterval) {
                //console.log("Throttled fetch request");
                return;
            }
        
            // Update the last fetch time
            this.lastFetchTime = currentTime;
        
            // Add the request to the queue
            this.fetchQueue.push({ fetchStartIndex, fetchEndIndex });
        
            // Ensure the queue only holds the latest 3 requests
            if (this.fetchQueue.length > 3) {
                this.fetchQueue.splice(0, this.fetchQueue.length - 3); // Keep the last 3 requests
                //console.log("Queue trimmed to latest 3 requests");
            }
        
            // If no fetch is happening, start the next one
            if (!this.isFetching) {
                //console.log(this.fetchQueue)

                this.processFetchQueue();
            }
        }
        
        processFetchQueue() {
            if (this.fetchQueue.length === 0) return;
        
            // Get the latest fetch request (removes from the queue)
            const { fetchStartIndex, fetchEndIndex } = this.fetchQueue.pop();
            //console.log(fetchStartIndex, fetchEndIndex);
            // console.log("hello",this.fetchQueue[0],this.fetchQueue[1],this.fetchQueue[2])

        
            // Set the fetching flag to true
            this.isFetching = true;
        
            // Fetch data
            this.fetchDataIfNecessary(fetchStartIndex, fetchEndIndex).then(() => {
                // Set fetching flag to false
                this.isFetching = false;
                //console.log("Fetching completed");
        
                // Process the next fetch request in the queue (if any)
                if (this.fetchQueue.length > 0) {
                    this.processFetchQueue();
                }
            }).catch((error) => {
                console.error("Fetch failed:", error);
                this.isFetching = false; // Reset flag on error
            });
        }
        
        fetchDataIfNecessary(fetchStartIndex, fetchEndIndex) {
            return new Promise((resolve, reject) => {
                // Check if the requested range has already been fetched
                if (!this.isRangeFetched(fetchStartIndex, fetchEndIndex)) {
                    this.sheet.UploadAndFetch.start = fetchStartIndex;
                    this.sheet.UploadAndFetch.to = fetchEndIndex - fetchStartIndex;
        
                    // Assuming fetchMoreData returns a promise
                    this.sheet.UploadAndFetch.fetchMoreData(fetchStartIndex, fetchEndIndex)
                        .then(() => {
                            // Mark this range as fetched
                            this.addFetchedRange(fetchStartIndex, fetchEndIndex);
                            resolve();
                        })
                        .catch(reject);
                } else {
                    resolve(); // Resolve immediately if the range has been fetched
                }
            });
        }
        

        isRangeFetched(start, end) {
            // Check if any part of the requested range is missing
            if (!this.fetchedRanges){
                return false;
            }
            if ((!this.fetchedRanges[start] || !this.fetchedRanges[end-1]) ) {
                console.log("falsere")
                return false;
            }
            
            return true;
        }

        addFetchedRange(start, end) {
            // Mark the range as fetched in the cache
            for (let i = start; i < end; i++) {
            this.fetchedRanges[i] = true;
            }
        }

        getTotalWidth() {
            return this.horizontalHeaderCells.reduce(
            (total, cell) => total + cell.width,
            0
            );
        }

        getTotalHeight() {
            return this.verticalHeaderCells.reduce(
            (total, cell) => total + cell.height,
            0
            );
        }

        getCellSize(type, index) {
            if (type === "horizontal") {
            return (
                this.customHorizontalSizes.get(index) ||
                this.horizontalHeaderCells[index]?.width ||
                this.baseCellWidth * this.scale
            );
            } else {
            return (
                this.customVerticalSizes.get(index) ||
                this.verticalHeaderCells[index]?.height ||
                this.baseCellHeight * this.scale
            );
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
