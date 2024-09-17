<h2 align="center">
  Rumblestrip<br/>
</h2>

## Table of Contents

- [Features](#-features)
- [Documentation](#-documentation)
- [Contributors](#-contributors)

<hr>

## 📚 Documentation 

### Directory Structure
```
exceljs/
├── index.html
├── Styles
│   └── style.scss
└── Scripts
    │── initiator.js
    └── Emaker
        │── cellMaker.js
        │── ds.js
        │── eMaker.js
        │── ribbonMaker.js
        └── sheetRenderer
            │── sheetRenderer.js
            └── functionalities
                │── calculationManager.js
                │── cellFunctionality.js
                │── cellUtility.js
                │── fParser.js
                │── graph.js
                │── headerCellFunctionalities.js
                │── scroll.js
                │── spreadsheetManager.js
                └── copyPasteManager
                    │── _dataProcessor(worker)
                    └── copyPasteManager.js

```

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


### `2.1 cellMaker.js`

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

### `2.2 eMaker.js`

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