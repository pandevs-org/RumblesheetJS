<h2 align="center">
  RumblesheetJS<br/>
</h2>

## Table of Contents

- [Features](#-features)
- [Documentation](#-documentation)
- [Contributors](#-contributors)

<hr>

## 🚀 Features

- `Graph Support`
    -   Visualize your data with dynamic graphing capabilities
    -   Create various types of charts directly within the spreadsheet to better represent and analyze your data
- `Multiple Excel Files with Resizability`
    -   Open and manage multiple Excel files simultaneously
    -   Each spreadsheet is resizable, allowing you to adjust the view for a more convenient workflow
- `Marching Ant Selection`
    -   Highlight selected cells with a marching ants animation, making it easier to distinguish and work with selected areas
- `Formula Support`
    -   Leverage built-in formulas to perform automatic calculations
    -   Supports various formula types to enhance data analysis
- `Zoom In/Out Functionality`
    -   Zoom in and out within individual sheets to better view or edit data, offering a more flexible and adaptable interface
-   `Copy and Cut Features`
    -   Easily copy or cut cell contents and move data across different sections or sheets with familiar clipboard operations
-   `Layout Functionalities`
    -   Customize the layout of your sheets, including alignment, text formatting, and overall structure, ensuring your data looks well-organized
-   `Row and Column Shift`
    -   Shift rows and columns effortlessly, allowing quick rearrangements of your data without manual reentry
-   `Add and Delete Rows/Columns`
    -   Dynamically add or delete rows and columns as needed to accommodate growing or shrinking datasets
-   `Multiple Sheets`
    -   Work with multiple sheets within a single Excel file, enabling better data categorization and management
-   `Fill Values Based on Pattern`
    -   Automate repetitive data entry by filling cells based on a detected pattern, making workflows faster and more efficient
-   `CSV File Upload`
    -   Upload and import CSV files directly into the spreadsheet, allowing seamless integration of external data
-   `Search Functionality`
    -   Quickly search within the spreadsheet for specific data points or cell references, streamlining navigation through large datasets
-   `Find and Replace`
    -   Easily find and replace text or values within the spreadsheet, helping update or correct large amounts of data with minimal effort

## 📚 Documentation 

### Directory Structure
```
RumbleSheet/
├── index.html
├── assets/
│   ├── locales/
│   │   └── en-us.json
│   ├── styles/
│   │   └── main.css
│   └── images/
│       └── logo.png
├── src/
│   ├── core/
│   │   ├── initiator.ts
│   │   └── eventManager.ts
│   ├── excel/
│   │   ├── excel.ts
│   │   ├── components/
│   │   │   ├── sheetRenderer.ts
│   │   │   ├── helper.ts
│   │   │   └── scroll.ts
│   │   ├── feature/
│   │   │   ├── cellFunctionality/
│   │   │   │   └── *.ts
│   │   │   └── headerCellFunctionality/
│   │   │       └── *.ts
│   │   ├── plugins/
│   │   │   └── graph/
│   │   │   │   └── *.ts
│   │   │   └── file/
│   │   │       └── *.ts
│   │   ├── ribbon/
│   │   │   ├── ribbon.js
│   │   │   ├── tooltipManager.ts
│   │   │   └── customTooltip.ts
│   │   ├── theme/
│   │   │   └── themeManager.ts
│   │   └── dataStructures/
│   │       └── sparseMatrix.ts
│   └── tests/
│       ├── core/
│       └── excel/
│           ├── components/
│           ├── functionality/
│           ├── plugins/
│           ├── ribbon/
│           └── theme/
└── README.md
```

<details> <summary><b>expand</b></summary>


### `1.0 initiator.js`

<details> <summary><b>initiator.js</b></summary>

#### `class Excel` - Represents an Excel-like grid component


<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>rowContainer</td>
        <td>The container element for the row</td>
    </tr>
    <tr>
        <td>row</td>
        <td>The current row number</td>
    </tr>
    <tr>
        <td>col</td>
        <td>The current column number</td>
    </tr>
    <tr>
        <td>Grid_maker</td>
        <td>The Grid_maker instance for managing the grid</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description</th>
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>init()</td>
        <td>Initializes the Excel component by constructing it</td>
    </tr>
    <tr>
        <td>handleFileUpload()</td>
        <td>Handles file upload and sends it to the server for processing</td>
    </tr>
    <tr>
        <td>constructExcel()</td>
        <td>Constructs the individual Excel cell</td>
    </tr>
        <tr>
        <td>updateCurrExcel()</td>
        <td>Updates the current Excel instance with the new row, column, and sheet object</td>
    </tr>
  </tbody>
</table>

<hr>

#### `class Grid_maker` - Manages header cells (both horizontal and vertical) for a spreadsheet-like component


<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>mainContainer</td>
        <td> The main container to hold the grid</td>
    </tr>
    <tr>
        <td>maxRow</td>
        <td>Maximum number of rows</td>
    </tr>
    <tr>
        <td>maxCol</td>
        <td>Maximum number of columns</td>
    </tr>
    <tr>
        <td>selectedDiv</td>
        <td></td>
    </tr>
        <tr>
        <td>currentRowCount</td>
        <td></td>
    </tr>
    <tr>    
        <td>rowArr</td>
        <td></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description</th>
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>init()</td>
        <td>Initialize the grid maker and set up event listeners</td>
    </tr>
    <tr>
        <td>setupEventListeners()</td>
        <td>Set up the event listeners for various interactions in the grid</td>
    </tr>
    <tr>
        <td>handleClick()</td>
        <td>Handle click events to update the selected cell</td>
    </tr>
        <tr>
        <td>deleteExcel()</td>
        <td>Delete a specific Excel cell by row and column number</td>
    </tr>
    <tr>
        <td>deleteRow()</td>
        <td>Delete a specific row</td>
    </tr>
    <tr>
        <td>handleFileUpload()</td>
        <td>Handle the file upload event and send data to the server</td>
    </tr>
    <tr>
        <td>updateCurrExcel()</td>
        <td>Update the current active Excel cell</td>
    </tr>
    <tr>
        <td>addNewRow()</td>
        <td>Add a new row to the grid</td>
    </tr>
    <tr>
        <td>addNewCol()</td>
        <td>Add resize handles to rows and columns</td>
    </tr>
    <tr>
        <td>addResizeHandles()</td>
        <td>Gets the visible vertical header cells based on the scroll position</td>
    </tr>
    <tr>
        <td>handleResize()</td>
        <td>Handle the resize action for rows and columns</td>
    </tr>

  </tbody>
</table>

<hr>
</details>



### `2.1 eMaker.js`

<details> <summary><b>eMaker.js</b></summary>

#### `class Sheet` - Represents a spreadsheet sheet

<table open>
  <thead>
  <tr>
    <th>Properties</th>
    <th>Description
  </tr>  
  </thead>
  <tbody>

  <tr>
    <td>name</td>
    <td>The name of the sheet</td>
  </tr>
  <tr>
    <td>row</td>
    <td>The row index of the sheet</td>
  </tr>
  <tr>
    <td>col</td>
    <td>The column index of the sheet</td>
  </tr>
  <tr>
    <td>index</td>
    <td>The index of the sheet</td>
  </tr>
  </tbody>
</table>

<table open>
  <thead>
  <tr>
    <th>Methods</th>
    <th>Description</th>
  </tr>  
  </thead>
  <tbody>

  <tr>
    <td>createElements()</td>
    <td>Creates the DOM elements for the sheet</td>
  </tr>
  <tr>
    <td>createTopSection()</td>
    <td>Creates the top section of the sheet</td>
  </tr>
  <tr>
    <td>createMiddleSection()</td>
    <td>Creates the middle section of the sheet</td>
  </tr>
  <tr>
    <td>createScrollbar()</td>
    <td>Creates a scrollbar element</td>
  </tr>
  </tbody>
</table>

#### `class EMaker` - Represents a manager for an Excel-like sheet interface


<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>row</td>
        <td></td>
    </tr>
    <tr>
        <td>col</td>
        <td></td>
    </tr>
    <tr>
        <td>excel</td>
        <td></td>
    </tr>
    <tr>
        <td>sheets</td>
        <td></td>
    </tr>
        <tr>
        <td>Excel</td>
        <td></td>
    </tr>
    <tr>    
        <td>activeSheetIndex</td>
        <td></td>
    </tr>
    <tr>    
        <td>activeSheetIndex</td>
        <td></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description</th>
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>handleEvents()</td>
        <td>Sets up event listeners</td>
    </tr>
    <tr>
        <td>handleMouseDown()</td>
        <td>Handles the mouse down event</td>
    </tr>
    <tr>
        <td>createExcel()</td>
        <td>Creates the Excel interface</td>
    </tr>
        <tr>
        <td>updateContentArea()</td>
        <td>Updates the content area to display the active sheet</td>
    </tr>
    <tr>
        <td>createSheetBar()</td>
        <td>Creates the sheet bar with tabs and controls</td>
    </tr>
    <tr>
        <td>updateSheetTabs()</td>
        <td>Updates the sheet tabs in the sheet bar</td>
    </tr>
    <tr>
        <td>addSheet()</td>
        <td>Adds a new sheet to the Excel interface</td>
    </tr>
    <tr>
        <td>switchSheet()</td>
        <td>Switches to a different sheet</td>
    </tr>
    <tr>
        <td>removeSheet()</td>
        <td>Removes a sheet from the Excel interface</td>
    </tr>
  </tbody>
</table>

</details>

### `2.2 ribbonMaker.js`


### `3.1.1 headerCellStructure.js`

<details> <summary><b>cellMaker.js</b></summary>

#### `class HeaderCell` - Represents a single header cell in the spreadsheet

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>x</td>
        <td>X position of the cell</td>
    </tr>
    <tr>
        <td>y</td>
        <td>Y position of the cell</td>
    </tr>
    <tr>
        <td>width</td>
        <td>Width of the cell</td>
    </tr>
    <tr>
        <td>height</td>
        <td>Height of the cell</td>
    </tr>
        <tr>
        <td>value</td>
        <td>The display value of the cell (column letter or row number)</td>
    </tr>
    <tr>
        <td>row</td>
        <td>Row number of the cell</td>
    </tr>
    <tr>
        <td>col</td>
        <td>Column number of the cell</td>
    </tr>
    <tr>
        <td>isfetched</td>
        <td>Indicates whether the cell's data has been fetched</td>
    </tr>
  </tbody>
</table>


<hr>

#### `class HeaderCellManager` - Manages header cells (both horizontal and vertical) for a spreadsheet-like component


<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>sheet</td>
        <td></td>
    </tr>
    <tr>
        <td>minCellSize</td>
        <td></td>
    </tr>
    <tr>
        <td>baseCellWidth</td>
        <td></td>
    </tr>
    <tr>
        <td>baseCellHeight</td>
        <td></td>
    </tr>
        <tr>
        <td>scale</td>
        <td></td>
    </tr>
    <tr>    
        <td>visibleWidth</td>
        <td></td>
    </tr>
    <tr>    
        <td>visibleHeight</td>
        <td></td>
    </tr>
    <tr>
        <td>horizontalHeaderCells</td>
        <td></td>
    </tr>
    <tr>
        <td>verticalHeaderCells</td>
        <td></td>
    </tr>
        <tr>
        <td>customHorizontalSizes</td>
        <td></td>
    </tr>
    <tr>    
        <td>customVerticalSizes</td>
        <td></td>
    </tr>

  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description</th>
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>update()</td>
        <td>Updates the header cells based on the new visible dimensions and scale</td>
    </tr>
    <tr>
        <td>resizeAllCells()</td>
        <td>Resizes all cells based on the scale change</td>
    </tr>
    <tr>
        <td>updateCells()</td>
        <td>Updates the header cells' positions and dimensions</td>
    </tr>
        <tr>
        <td>_updateHeaderCells()</td>
        <td>Updates either horizontal or vertical header cells</td>
    </tr>
    <tr>
        <td>numberToColumnName()</td>
        <td>Converts a number to a column name (e.g., 1 -> A, 27 -> AA)</td>
    </tr>
    <tr>
        <td>setCustomCellSize()</td>
        <td>Sets a custom size for a cell in either the horizontal or vertical header</td>
    </tr>
    <tr>
        <td>updateCellPositions()</td>
        <td>Updates the positions of all cells in either horizontal or vertical headers</td>
    </tr>
    <tr>
        <td>findStartingIndex()</td>
        <td>Finds the starting index of the visible cells based on the scroll position</td>
    </tr>
    <tr>
        <td>getHorizontalHeaderCells()</td>
        <td>Gets the visible horizontal header cells based on the scroll position</td>
    </tr>
    <tr>
        <td>getVerticalHeaderCells()</td>
        <td>Gets the visible vertical header cells based on the scroll position</td>
    </tr>
    <tr>
        <td>_getVisibleHeaderCells()</td>
        <td>Gets visible header cells (horizontal or vertical) based on scroll position</td>
    </tr>
    <tr>
        <td>getTotalWidth()</td>
        <td>Gets the total width of all horizontal header cells</td>
    </tr>
    <tr>
        <td>getTotalHeight()</td>
        <td>Gets the total height of all vertical header cells</td>
    </tr>
    <tr>
        <td>getCellSize()</td>
        <td>Gets the size of a header cell</td>
    </tr>
  </tbody>
</table>

<hr>

</details>


### `3.1.2 sparseMatrixStructure.js`

<details> <summary><b>sparseMatrixStructure.js</b></summary>

#### `class Node` - Represents a single node in a sparse matrix

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>rowValue</td>
        <td>The row index of the node</td>
    </tr>
    <tr>
        <td>colValue</td>
        <td>The column index of the node</td>
    </tr>
    <tr>
        <td>value</td>
        <td>The value stored in the node</td>
    </tr>
    <tr>
        <td>nextRow</td>
        <td>Reference to the next node in the row</td>
    </tr>
        <tr>
        <td>nextCol</td>
        <td>Reference to the next node in the column</td>
    </tr>
    <tr>
        <td>prevRow</td>
        <td>Reference to the previous node in the row</td>
    </tr>
    <tr>
        <td>prevCol</td>
        <td>Reference to the previous node in the column</td>
    </tr>
    <tr>
        <td>textAlign</td>
        <td></td>
    </tr>
    <tr>
        <td>textBaseline</td>
        <td></td>
    </tr>
    <tr>
        <td>fontSize</td>
        <td></td>
    </tr>
    <tr>
        <td>fontFamily</td>
        <td></td>
    </tr>
    <tr>
        <td>color</td>
        <td></td>
    </tr>
  </tbody>
</table>

<hr>

#### `class SparseMatrix` - SparseMatrix class that represents a sparse matrix using linked lists for efficient storage and manipulation

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>rowHeaders</td>
        <td>Stores the head of each row's linked list</td>
    </tr>
    <tr>
        <td>colHeaders</td>
        <td>Stores the head of each column's linked list</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>_cellExists()</td>
        <td>Checks if a cell exists at the specified row and column</td>
    </tr>
    <tr>
        <td>_shiftRow()</td>
        <td>Shifts all nodes in a row to a new row index</td>
    </tr>
    <tr>
        <td>_shiftColumn()</td>
        <td>Shifts all nodes in a column to a new column index</td>
    </tr>
    <tr>
        <td>_insertNodeInRow()</td>
        <td>Inserts a new node into the correct position in a row's linked list</td>
    </tr>
        <tr>
        <td>_insertNodeInColumn()</td>
        <td>Inserts a new node into the correct position in a column's linked list</td>
    </tr>
    <tr>
        <td>_shiftCellsRight()</td>
        <td>Shifts all cells to the right starting from the specified row and column</td>
    </tr>
    <tr>
        <td>_shiftCellsDown()</td>
        <td>Shifts all cells down starting from the specified row and column</td>
    </tr>
    <tr>
        <td>addRowInBetween()</td>
        <td>Adds a new row in between existing rows by shifting rows down</td>
    </tr>
    <tr>
        <td>addColumnInBetween()</td>
        <td>Adds a new column in between existing columns by shifting columns to the right</td>
    </tr>
    <tr>
        <td>deleteRow()</td>
        <td>Deletes a row and shifts remaining rows up</td>
    </tr>
    <tr>
        <td>deleteColumn()</td>
        <td>Deletes a column and shifts remaining columns left</td>
    </tr>
    <tr>
        <td>_removeNodeFromRow()</td>
        <td>Removes a node from a specific row</td>
    </tr>
    <tr>
        <td>_removeNodeFromColumn()</td>
        <td>Removes a node from a specific column</td>
    </tr>
    <tr>
        <td>createCell()</td>
        <td>Creates a new cell at the specified row and column</td>
    </tr>
    <tr>
        <td>insertCellShiftRight()</td>
        <td>Inserts a cell with the specified value and shifts cells to the right</td>
    </tr>
    <tr>
        <td>insertCellShiftDown()</td>
        <td>Inserts a cell with the specified value and shifts cells down</td>
    </tr>
        <tr>
        <td>getCellvalue()</td>
        <td>Gets the value of a cell at the specified row and column</td>
    </tr>
    <tr>
        <td>getCell()</td>
        <td>Gets the node representing a cell at the specified row and column</td>
    </tr>
    <tr>
        <td>setCell()</td>
        <td>Sets the value of a cell. If the cell doesn't exist, it creates it</td>
    </tr>
    <tr>
        <td>_updateCellValue()</td>
        <td>Updates the value of an existing cell</td>
    </tr>
    <tr>
        <td>printMatrixByRow()</td>
        <td>Prints the sparse matrix row by row</td>
    </tr>
    <tr>
        <td>printMatrixByColumn()</td>
        <td>Prints the sparse matrix column by column</td>
    </tr>
  </tbody>
</table>

</details>

### `3.2.1 sheetRenderer.js`

### `4.1 calculationManager.js`

<details> <summary><b>calculationManager.js</b></summary>

#### `class CalculationManager` - Manages calculations such as sum and average for a set of selected cells in a spreadsheet

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>cellFunctionality</td>
        <td>An object containing spreadsheet functionality like renderer and selected cells</td>
    </tr>
    <tr>
        <td>cellUtility</td>
        <td></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>setupEventListeners()</td>
        <td>Sets up event listeners for sum and average calculation buttons</td>
    </tr>
    <tr>
        <td>calculateSum()</td>
        <td>Calculates the sum of the values in the given cells, grouped by row and column</td>
    </tr>
    <tr>
        <td>calculateAverage()</td>
        <td>Calculates the average of the values in the given cells, grouped by row and column</td>
    </tr>
    <tr>
        <td>drawTextOnCanvas()</td>
        <td>Draws text on the canvas at the specified coordinates</td>
    </tr>
        <tr>
        <td>showSum()</td>
        <td>Displays the sum of the selected cells on the spreadsheet canvas</td>
    </tr>
    <tr>
        <td>showAverage()</td>
        <td>Displays the average of the selected cells on the spreadsheet canvas</td>
    </tr>
  </tbody>
</table>

</details>


### `4.2 cellFunctionality.js`

<details> <summary><b>cellFunctionality.js</b></summary>

#### `class CellFunctionality` - Class responsible for managing cell interactions and functionality in the spreadsheet

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>sheetRenderer</td>
        <td>The renderer responsible for rendering the spreadsheet</td>
    </tr>
    <tr>
        <td>selectedCells</td>
        <td>Array to store selected cells</td>
    </tr>
    <tr>
        <td>isDragging</td>
        <td>Track if the user is dragging</td>
    </tr>
    <tr>
        <td>isScrolling</td>
        <td>Track if scrolling is in progress</td>
    </tr>
    <tr>
        <td>startPoint</td>
        <td>Starting point for drag selection</td>
    </tr>
    <tr>
        <td>marchingAntsActive</td>
        <td></td>
    </tr>
    <tr>
        <td>dashOffset</td>
        <td></td>
    </tr>
    <tr>
        <td>animationFrameId</td>
        <td></td>
    </tr>
    <tr>
        <td>spreadsheetManager</td>
        <td>Instantiate spreadsheetManager</td>
    </tr>
    <tr>
        <td>cellUtility</td>
        <td>Instantiate cellUtility</td>
    </tr>
    <tr>
        <td>copyPasteManager</td>
        <td>Instantiate copyPasteManager</td>
    </tr>
    <tr>
        <td>calculationManager</td>
        <td>Instantiate calculationManager</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>setupEventListeners()</td>
        <td>Set up event listeners for user interactions with the spreadsheet</td>
    </tr>
    <tr>
        <td>handlePointerDown()</td>
        <td>Handle the pointer down event for cell selection and drag initiation</td>
    </tr>
    <tr>
        <td>handlePointerMove()</td>
        <td>Handle pointer movement during drag operation</td>
    </tr>
    <tr>
        <td>handlePointerUp()</td>
        <td>Handle the pointer up event when the drag operation ends</td>
    </tr>
        <tr>
        <td>handleKeyDown()</td>
        <td>Handle keyboard shortcuts for cut and deselection</td>
    </tr>
    <tr>
        <td>deselectCurrentCells()</td>
        <td>Deselect the currently selected cells and hide the input element</td>
    </tr>
    <tr>
        <td>handleCellClick()</td>
        <td>Handle a cell click event to select or deselect a cell</td>
    </tr>
    <tr>
        <td>updateSelectedCells()</td>
        <td>Update the selected cells during a drag selection</td>
    </tr>
        <tr>
        <td>handleKeyDown()</td>
        <td>Handle keyboard shortcuts for cut and deselection</td>
    </tr>
    <tr>
        <td>isCellInRect()</td>
        <td></td>
    </tr>
    <tr>
        <td>handleScrolling()</td>
        <td>Handle scrolling when the pointer is near the edges of the canvas</td>
    </tr>
    <tr>
        <td>updateInputElement()</td>
        <td>Update the input element for the currently selected cell</td>
    </tr>
        <tr>
        <td>deselectCurrentCells()</td>
        <td>Handle keyboard shortcuts for cut and deselection</td>
    </tr>
    <tr>
        <td>hideInputElement()</td>
        <td>Hide the input element on the spreadsheet</td>
    </tr>
    <tr>
        <td>startMarchingAnts()</td>
        <td>Start the marching ants animation around the selected cells</td>
    </tr>
    <tr>
        <td>stopMarchingAnts()</td>
        <td>Stop the marching ants animation</td>
    </tr>
    <tr>
        <td>animateMarchingAnts()</td>
        <td>Animate the marching ants effect</td>
    </tr>
    <tr>
        <td>drawMarchingAnts()</td>
        <td></td>
    </tr>
    <tr>
        <td>drawHighlight()</td>
        <td>Draw a highlight or border around the selected cells</td>
    </tr>
    <tr>
        <td>drawRectangleOnHeaderCanvas()</td>
        <td></td>
    </tr>
    <tr>
        <td>drawLine()</td>
        <td>Animate the marching ants effect</td>
    </tr>
    <tr>
        <td>selectCell()</td>
        <td></td>
    </tr>
    <tr>
        <td>removeEventListeners()</td>
        <td>Remove event listeners to prevent memory leaks</td>
    </tr>
  </tbody>
</table>

</details>


### `4.3 cellUtlity.js`

<details> <summary><b>cellUtility.js</b></summary>

#### `class CellUtility` - Utility class for handling cell operations in a spreadsheet

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>sheetRenderer</td>
        <td>The renderer responsible for rendering the spreadsheet</td>
    </tr>
    <tr>
        <td>spreadsheetManager</td>
        <td>The manager for spreadsheet data</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>getCellFromCoordinates()</td>
        <td>Get the cell corresponding to the given x and y coordinates</td>
    </tr>
    <tr>
        <td>getCanvasCoordinates()</td>
        <td>Get the canvas coordinates from the mouse event</td>
    </tr>
    <tr>
        <td>letterToNumber()</td>
        <td>Convert a column letter to a column number</td>
    </tr>
    <tr>
        <td>getCellsFromRect()</td>
        <td>Get all cells within a rectangular area defined by two points</td>
    </tr>
        <tr>
        <td>binarySearch()</td>
        <td>Perform a binary search on the cells array</td>
    </tr>
  </tbody>
</table>

</details>


### `4.4 forumulaParser.js`

<details> <summary><b>formulaParser.js</b></summary>

#### `class FormulaParser` - Class to parse and evaluate spreadsheet formulas

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>matrix</td>
        <td>Reference to the SparseMatrix containing spreadsheet data</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>evaluateFormula()</td>
        <td>Parse and evaluate the formula</td>
    </tr>
    <tr>
        <td>getCellPosition()</td>
        <td>Convert a cell reference (e.g., A1) into row and column indices</td>
    </tr>
    <tr>
        <td>extractRange()</td>
        <td>Utility function to extract the range from a formula (e.g., "A1:B4" from "SUM(A1:B4)")</td>
    </tr>
    <tr>
        <td>getRangePosition()</td>
        <td>Extract the start and end positions from a range (e.g., A1:B4)</td>
    </tr>
    <tr>
        <td>handleSum()</td>
        <td>Handle SUM function by calculating the sum of values in a range</td>
    </tr>
    <tr>
        <td>handleMin()</td>
        <td>Handle MIN function by finding the minimum value in a range</td>
    </tr>
    <tr>
        <td>handleMax()</td>
        <td>Handle MAX function by finding the maximum value in a range</td>
    </tr>
    <tr>
        <td>handleAverage()</td>
        <td>Handle AVERAGE function by calculating the average of values in a range</td>
    </tr>
  </tbody>
</table>

</details>


### `4.5 graph.js`

<details> <summary><b>graph.js</b></summary>

#### `class Graph` - Class responsible for generating and managing graphs based on selected cells in a spreadsheet

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>sheetRenderer</td>
        <td>Reference to the sheet renderer, containing canvas and cell functionality</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>init()</td>
        <td>Initialize event listeners for graph buttons and handle user interactions</td>
    </tr>
    <tr>
        <td>handleEvents()</td>
        <td>Handles the events related to dragging and mouse interactions for the graph window</td>
    </tr>
    <tr>
        <td>print()</td>
        <td>Collects and organizes selected cells from the spreadsheet for graphing</td>
    </tr>
    <tr>
        <td>getGraphValue()</td>
        <td>Generates the values and labels required to plot the graph based on selected cells</td>
    </tr>
    <tr>
        <td>isHorizantalSizeBigger()</td>
        <td>Determines whether the horizontal size (number of columns) is larger than the vertical size (number of rows)</td>
    </tr>
    <tr>
        <td>destroyGraph()</td>
        <td>Destroys the current graph if it exists</td>
    </tr>
    <tr>
        <td>drawBarGraph()</td>
        <td>Draws a bar graph based on the selected cell data</td>
    </tr>
    <tr>
        <td>drawLineGraph()</td>
        <td>Draws a line graph based on the selected cell data</td>
    </tr>
    <tr>
        <td>drawPieGraph()</td>
        <td>Draws a pie chart based on the selected cell data</td>
    </tr>
        <tr>
        <td>dragChart()</td>
        <td>Handles dragging of the graph window</td>
    </tr>
  </tbody>
</table>

</details>


### `4.6 headerCellFunctionality.js`

<details> <summary><b>headerCellFuctionalities.js</b></summary>

#### `class HeaderCellFunctionality` - Handles the functionality of header cells, such as resizing, selecting, and context menu actions

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>sheetRenderer</td>
        <td>Reference to the sheet renderer, containing canvas and cell functionality</td>
    </tr>
        <tr>
        <td>cellFunctionality</td>
        <td></td>
    </tr>
    <tr>
        <td>resizeThreshold</td>
        <td>pixels from the edge to trigger resize</td>
    </tr>
    <tr>
        <td>isResizing</td>
        <td></td>
    </tr>
    <tr>
        <td>resizeStart</td>
        <td></td>
    </tr>
    <tr>
        <td>resizeType</td>
        <td>'row' or 'column'</td>
    </tr>
    <tr>
        <td>resizeIndex</td>
        <td></td>
    </tr>
    <tr>
        <td>currentResizePosition</td>
        <td></td>
    </tr>
    <tr>
        <td>isheaderSelection</td>
        <td></td>
    </tr>
    <tr>
        <td>isSelecting</td>
        <td>Track if user is selecting</td>
    </tr>
    <tr>
        <td>selectedRowIndex</td>
        <td>Single selected row</td>
    </tr>
    <tr>
        <td>selectedColIndex</td>
        <td>Single selected column</td>
    </tr>
    <tr>
        <td>selectedCellsRange</td>
        <td>Range selection for drag</td>
    </tr>
    <tr>
        <td>isDraggingForSelection</td>
        <td>Track drag for multi-selection</td>
    </tr>

  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>setupEventListeners()</td>
        <td>Sets up the event listeners for canvas and window interactions</td>
    </tr>
    <tr>
        <td>handleRightClick()</td>
        <td>Handles right-click context menu actions for adding or deleting rows/columns</td>
    </tr>
    <tr>
        <td>handleContextMenuAction()</td>
        <td>Performs the action based on the selected context menu option</td>
    </tr>
    <tr>
        <td>handleHeaderSelection()</td>
        <td>Handles the header selection based on user clicks or drags</td>
    </tr>
    <tr>
        <td>handleDragForSelection()</td>
        <td>Handles mouse movement for drag-based header selection</td>
    </tr>
    <tr>
        <td>handleMouseUp()</td>
        <td>Handles mouse-up events, ending resizing or dragging operations</td>
    </tr>
    <tr>
        <td>drawHeaderSelection()</td>
        <td>Draws the header selection and clears previously selected cells</td>
    </tr>
    <tr>
        <td>redrawHeaders()</td>
        <td>Redraws the headers for both horizontal and vertical axes</td>
    </tr>
    <tr>
        <td>highlightRange()</td>
        <td>Highlights the selected range of header cells in either the horizontal or vertical direction</td>
    </tr>
        <tr>
        <td>getfullClickedHeaderCell()</td>
        <td>Retrieves the full clicked header cell based on the provided position</td>
    </tr>
    <tr>
        <td>getClickedHeaderCell()</td>
        <td>Returns the index of the clicked header cell based on position</td>
    </tr>
    <tr>
        <td>getResizeEdge()</td>
        <td>Determines whether the mouse is near the edge of a header cell for resizing</td>
    </tr>
        <tr>
        <td>handleDragForShifting()</td>
        <td>Handles the dragging of rows or columns for shifting</td>
    </tr>
    <tr>
        <td>handleMouseMove()</td>
        <td>Handles mouse movement to update the cursor for resizing or dragging</td>
    </tr>
    <tr>
        <td>handleMouseDown()</td>
        <td>Handles mouse down event on header cells to initiate dragging, resizing, or selection</td>
    </tr>
        <tr>
        <td>handleDrag()</td>
        <td>Handles dragging action during resize or selection</td>
    </tr>
    <tr>
        <td>applyResize()</td>
        <td>Applies the resize changes after the user has finished resizing a header cell</td>
    </tr>
        <tr>
        <td>removeEventListeners()</td>
        <td>Removes event listeners from the canvas and document to prevent memory leaks</td>
    </tr>
  </tbody>
</table>

</details>


### `4.7 scroll.js`

<details> <summary><b>scroll.js</b></summary>

#### `class Scroll` - The Scroll class handles scrolling functionality within a spreadsheet

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>sheetRenderer</td>
        <td>Reference to the sheet renderer, containing canvas and cell functionality</td>
    </tr>
        <tr>
        <td>scrollX</td>
        <td></td>
    </tr>
    <tr>
        <td>scrollY</td>
        <td></td>
    </tr>
    <tr>
        <td>maxScrollX</td>
        <td></td>
    </tr>
    <tr>
        <td>maxScrollY</td>
        <td></td>
    </tr>
    <tr>
        <td>isDragging</td>
        <td>'row' or 'column'</td>
    </tr>
    <tr>
        <td>isScrollbarDragging</td>
        <td></td>
    </tr>
    <tr>
        <td>lastMouseX</td>
        <td></td>
    </tr>
    <tr>
        <td>lastMouseY</td>
        <td></td>
    </tr>

  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>setupEventListeners()</td>
        <td>Sets up event listeners for scrolling and resizing actions</td>
    </tr>
    <tr>
        <td>handleScrollBarMouseDown()</td>
        <td>Handles the mousedown event on scroll bars to initiate dragging</td>
    </tr>
    <tr>
        <td>handleMouseMove()</td>
        <td>Handles the mousemove event to perform scrolling or scroll bar dragging</td>
    </tr>
    <tr>
        <td>handleMouseUp()</td>
        <td>Handles the mouseup event to end dragging actions</td>
    </tr>
    <tr>
        <td>handleWheel()</td>
        <td>Handles the wheel event for zooming or scrolling</td>
    </tr>
    <tr>
        <td>handleMouseDown()</td>
        <td>Handles the mousedown event to initiate dragging</td>
    </tr>
    <tr>
        <td>updateMaxScroll()</td>
        <td>Updates the maximum scroll values based on content and viewport dimensions</td>
    </tr>
    <tr>
        <td>updateScrollBars()</td>
        <td>Updates the appearance of scroll bars based on current scroll position</td>
    </tr>
    <tr>
        <td>scroll()</td>
        <td>Scrolls the content by the given delta values</td>
    </tr>
    <tr>
        <td>checkScrollPosition()</td>
        <td>Checks if the scroll position has reached a threshold to expand content</td>
    </tr>
    <tr>
        <td>expandContent()</td>
        <td>Expands content based on the scroll direction and updates scroll bars</td>
    </tr>
    <tr>
        <td>getScroll()</td>
        <td>Gets the current scroll position</td>
    </tr>
    <tr>
        <td>destroy()</td>
        <td>Cleans up resources and removes event listener</td>
    </tr>
    <tr>
        <td>handleMouseDown()</td>
        <td>Handles mouse down event on header cells to initiate dragging, resizing, or selection</td>
    </tr>
        <tr>
        <td>handleDrag()</td>
        <td>Handles dragging action during resize or selection</td>
    </tr>
    <tr>
        <td>applyResize()</td>
        <td>
    </tr>
  </tbody>
</table>

</details>

### `4.8 spreadsheetManager.js`

<details> <summary><b>spreadsheetManager.js</b></summary>

#### `class SpreadsheetManager` - Manages spreadsheet operations such as handling cell input, updating the sparse matrix, and evaluating formulas within a grid

<table>
  <thead>
    <tr>
        <th>Properties</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>cellFunctionality</td>
        <td>Object containing the cell functionality including sheet renderer and selected cell</td>
    </tr>
        <tr>
        <td>sheetRenderer</td>
        <td></td>
    </tr>
    <tr>
        <td>sparseMatrix</td>
        <td></td>
    </tr>
    <tr>
        <td>FormulaParser</td>
        <td></td>
    </tr>

  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th>Methods</th>
        <th>Description
    </tr>  
  </thead>
  <tbody>
    <tr>
        <td>setupInputEventListener()</td>
        <td>Sets up event listeners for the input element related to cell changes</td>
    </tr>
    <tr>
        <td>handleInputChange()</td>
        <td>Handles changes in the input value and updates the sparse matrix</td>
    </tr>
    <tr>
        <td>handleKeyDown()</td>
        <td>Handles the keydown event, allowing the Enter key to finalize cell editing</td>
    </tr>
    <tr>
        <td>handleInputBlur()</td>
        <td>Handles when the input loses focus (blur event) and finalizes the cell value</td>
    </tr>
    <tr>
        <td>updateCellValue()</td>
        <td>Updates the value of the selected cell in the sparse matrix</td>
    </tr>
    <tr>
        <td>getValue()</td>
        <td>Retrieves the value of a cell and evaluates any formulas</td>
    </tr>
    <tr>
        <td>getCell()</td>
        <td>Retrieves the raw cell data from the sparse matrix</td>
    </tr>
    <tr>
        <td>letterToNumber()</td>
        <td>Converts a column letter (e.g., 'A', 'B', 'AA') to a corresponding number</td>
    </tr>
    
  </tbody>
</table>

</details>

</details>

## 🖋 Contributors

We love contributions! To get started, please follow these simple steps to contribute to the project.

## Steps to Contribute:

### 1. **Create a Feature Branch**
Create a new branch to work on your feature or bug fix. This helps us keep track of different contributions.

```bash
git checkout -b dev/name
```

### 2. **Track all your files**
Add all the changed files.

```bash
git add .
```

### 2. **Commit your Changes**
Commit your changes with some meaningful messages.

```bash
git commit -m 'Add some AmazingFeature'
```

### 3. **Push to the Branch** 
Push the code changes in your branch.

```bash
git push origin dev/name
```

### 4. **Open a Pull Request**
Open a PR against the ```stage``` branch.