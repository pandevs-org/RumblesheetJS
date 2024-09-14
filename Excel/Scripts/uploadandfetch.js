export class UploadAndFetch {
  constructor(sheet) {
    this.sheet = sheet;
    this.data = null;
    this.start = 0;
    this.from = 0;
    this.to = 500; // Initial batch size
    this.tableName = "vikas";
    this.columnDefinitions = null;
    this.columnName = []
  
    // this.fetchMoreData();
  }

  showTableCreationPopup(columns, tempFilePath) {
    ////console.log("hello");
    const popup = document.createElement("div");
    popup.className = "popup";

    const form = document.createElement("form");
    form.innerHTML = `
            <h2>Create Table</h2>
            <label for="tableName">Table Name:</label>
            <input type="text" id="tableName" required>
            <table>
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Type</th>
                        <th>Allow Null</th>
                        <th>Primary Key</th>
                    </tr>
                </thead>
                <tbody>
                    ${columns
                      .map(
                        (column, index) => `
                        <tr>
                            <td>${column}</td>
                            <td>
                                <select name="type_${index}" required>
                                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                                    <option value="BIGINT">BIGINT</option>
                                    <option value="INT">INT</option>
                                    <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                                </select>
                            </td>
                            <td>
                                <input type="checkbox" name="null_${index}" checked>
                            </td>
                            <td>
                                <input type="radio" name="primary_key" value="${index}">
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
            <button type="submit">Create Table and Upload Data</button>
        `;

    popup.appendChild(form);
    document.body.appendChild(popup);

    form.addEventListener("submit", (e) =>
      this.handleTableCreation(e, columns, tempFilePath, popup)
    );
  }

  async handleTableCreation(e, columns, tempFilePath, popup) {
    e.preventDefault();

    this.tableName = document.getElementById("tableName").value;

    this.columnDefinitions = columns.map((column, index) => ({
      name: column,
      type: document.querySelector(`[name="type_${index}"]`).value,
      allowNull: document.querySelector(`[name="null_${index}"]`).checked,
      isPrimaryKey:
        document.querySelector(`[name="primary_key"]:checked`)?.value == index,
    }));

    const response = await fetch(
      "http://localhost:5228/api/Data/createTableAndUpload1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableName: this.tableName,
          columns: this.columnDefinitions,
          tempFilePath,
        }),
      }
    );

    if (response.ok) {
      alert("Table created and data upload started");
      popup.remove();
      this.checkMiscellaneousRows(this.tableName);
    } else {
      alert("Error creating table and uploading data");
    }
  }

  async find () {
    this.search = document.getElementById('search-input').value;

    if (!search) {
      alert("Please enter a search term");
      return;
    }

  
    // Call the searchData function with the searchColumns
    this.find_data = await this.searchData(this.search);
    
  };
  



  async fetchMoreData(startIndex, endindex) {
    if (!this.tableName) {
      throw new Error("Table name is not set. Please create a table first.");
    }
    return;
    this.start = startIndex;

    try {
      const response = await fetch(`http://localhost:5228/api/Data/fetchData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TableName: this.tableName,
          Limit: this.to,
          Offset: this.start,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const newData = await response.json();
      this.data = this.data ? [...this.data, ...newData] : newData;
      if (this.from == 0) {
        Object.keys(this.data[0]).forEach((d, i) => {
          this.columnName.push(d);
          this.sheet.sparsematrix.setCell(1, i + 1, d);
        });
      }
      this.from = this.from + this.to;

      await this.sheet.sparsematrix.updateCellsInBackground(
        this.data,
        this.start
      );

      this.data = null;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async updateData(rowid,colid, value) {
    if (!this.tableName) {
      throw new Error("Table name is not set. Please create a table first.");
    }
    console.log(colid,this.columnName[colid])
    const updatedColumns = {
      [this.columnName[colid]]: value
    };
    console.log(rowid,this.tableName,updatedColumns)

    try {
      const response = await fetch(
        `http://localhost:5228/api/Data/updateData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            TableName: this.tableName,
            rowid: rowid, 
            Columns: updatedColumns,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      this.sheet.sparsematrix.setCell(rowid+1, colid+1, value);

      
    } catch (error) {
      console.error("Error:", error);
      this.sheet.sparsematrix.setCell(rowid+1, colid+1, value);
      alert("Error updating data");
    }
  }

  async searchData(search) {
    if (!this.tableName) {
      throw new Error("Table name is not set. Please create a table first.");
    }
  

  //   const formattedObject = {
  //     "columns": search.map(column => ({ "name": column }))
  // };
    // Log the columns that are being searched
    console.log("Searching columns:", search);
    const searchColumns = this.columnName.reduce((acc, column) => {
      acc[column] = search; // Set each column name as a key with 'abc' as its value
      return acc;
    }, {});    
    console.log(searchColumns)
  
    try {
      const response = await fetch(
        `http://localhost:5228/api/Data/searchData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            TableName: this.tableName,
            Columns: searchColumns,  // The columns and values for search
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const searchResults = await response.json();
      console.log("Search Results:", searchResults);
  
      // Example: Populate the UI with search results
      return (searchResults);
      this.populateSearchResults(searchResults);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error searching data");
    }
  }
  
  // Function to display search results in the UI (example)
  populateSearchResults(results) {
    const resultTable = document.getElementById("search-results");
    resultTable.innerHTML = "";  // Clear previous results
  
    // Create table headers dynamically
    if (results.length > 0) {
      const headerRow = document.createElement("tr");
      Object.keys(results[0]).forEach((key) => {
        const th = document.createElement("th");
        th.innerText = key;
        headerRow.appendChild(th);
      });
      resultTable.appendChild(headerRow);
    }
  
    // Populate each result row
    results.forEach((row) => {
      const rowElement = document.createElement("tr");
      Object.values(row).forEach((value) => {
        const td = document.createElement("td");
        td.innerText = value;
        rowElement.appendChild(td);
      });
      resultTable.appendChild(rowElement);
    });
  }
  

  // Call this function on edit
  handleCellEdit(rowId, columnName, newValue) {
    const updatedColumns = {
      [columnName]: newValue,
    };
    this.updateData(rowId, updatedColumns);
  }

  async checkMiscellaneousRows(tableName) {
    try {
      const response = await fetch("http://localhost:5228/api/Data/cmr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.hasMiscellaneousRows) {
        this.showMiscellaneousRowsPopup(tableName);
      } else {
        alert("Data upload completed successfully");
      }
    } catch (error) {
      console.error("Error checking for miscellaneous rows:", error);
      alert("Error checking for miscellaneous rows");
    }
  }

  showMiscellaneousRowsPopup(tableName) {
    const popup = document.createElement("div");
    popup.className = "popup";

    const form = document.createElement("form");
    form.innerHTML = `
            <h2>Miscellaneous Rows Detected</h2>
            <p>Some rows have more columns than expected. How would you like to handle them?</p>
            <select id="miscAction">
                <option value="delete">Delete these rows</option>
                <option value="alterTable">Alter table to add new columns</option>
                <option value="truncate">Add only up to specified columns</option>
            </select>
            <div id="newColumnsDiv" style="display:none;">
                <label for="newColumns">New Column Names (comma-separated):</label>
                <input type="text" id="newColumns">
            </div>
            <div id="columnCountDiv" style="display:none;">
                <label for="columnCount">Number of columns to keep:</label>
                <input type="number" id="columnCount">
            </div>
            <button type="submit">Process Miscellaneous Rows</button>
        `;

    popup.appendChild(form);
    document.body.appendChild(popup);

    const actionSelect = document.getElementById("miscAction");
    const newColumnsDiv = document.getElementById("newColumnsDiv");
    const columnCountDiv = document.getElementById("columnCountDiv");

    actionSelect.addEventListener("change", () => {
      newColumnsDiv.style.display =
        actionSelect.value === "alterTable" ? "block" : "none";
      columnCountDiv.style.display =
        actionSelect.value === "truncate" ? "block" : "none";
    });

    form.addEventListener("submit", (e) =>
      this.handleMiscellaneousRows(
        e,
        actionSelect,
        newColumnsDiv,
        columnCountDiv,
        tableName,
        popup
      )
    );
  }

  async handleMiscellaneousRows(
    e,
    actionSelect,
    newColumnsDiv,
    columnCountDiv,
    tableName,
    popup
  ) {
    e.preventDefault();

    const action = actionSelect.value;
    const newColumns =
      newColumnsDiv.style.display === "block"
        ? document
            .getElementById("newColumns")
            .value.split(",")
            .map((c) => c.trim())
        : [];
    const columnCount =
      columnCountDiv.style.display === "block"
        ? parseInt(document.getElementById("columnCount").value)
        : null;

    try {
      const response = await fetch(
        "http://localhost:5228/api/Data/handleMiscellaneousRows",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            tableName,
            newColumns,
            columnCount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Miscellaneous rows processed successfully");
      popup.remove();
    } catch (error) {
      console.error("Error processing miscellaneous rows:", error);
      alert("Error processing miscellaneous rows");
    }
  }
}
