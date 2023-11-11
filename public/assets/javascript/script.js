import Helpers from './helpers.js';


class ExcelHandler {
    constructor() {
        this.BASE_URL = document.querySelector('meta[name="base_url"]').getAttribute('content');
        this.ENDPOINTS = {
            'import': this.BASE_URL + '/import',
            'export': this.BASE_URL + '/export',
            'update': this.BASE_URL + '/update',
            'getSheet': this.BASE_URL + '/open-sheet',
            'recentFiles': this.BASE_URL + '/recent-files',
        };
        this.file = null;
        this.fileName = null;
        this.folderName = null;

        this.spreadsheet = new Handsontable(document.getElementById('spreadsheet'), {
            // make many empty rows and columns
            data: Handsontable.helper.createEmptySpreadsheetData(55, 50),
            licenseKey: 'non-commercial-and-evaluation',
            rowHeaders: true,
            colHeaders: true,
            height: 'auto',
            width: 'auto',
            filters: true,
            dropdownMenu: true,
            contextMenu: true,
            manualRowResize: true,
            manualColumnResize: true,
            manualRowMove: true,
            manualColumnMove: true,
            manualRowFreeze: true,
            manualColumnFreeze: true,
            copyPaste: true,
            search: true,
            undo: true,
            redo: true,
            comments: true,
            minSpareRows: 1,
            minSpareCols: 1,
        });
    }

    async loadFile() {
        Helpers.showLoading();
        try {
            const formData = new FormData();
            formData.append('file', this.file);

            const response = await Helpers.postFile(this.ENDPOINTS.import, formData);
            const data = await response.json();

            // Extract the 'data' array from the received JSON
            const jsonData = data.data;
            console.log("JSON Data: ", jsonData);

            this.folderName = data['folder_name']
            this.fileName = data['file_name']


            // Extract column headers from the first row of the data
            const columnHeaders = Object.keys(jsonData[0].data_values);
            console.log("Column Headers: ", columnHeaders);

            const sheetNames = jsonData[0].sheets;
            const sheetsNames = document.getElementById('sheetsNames');
            sheetsNames.innerHTML = '';

            sheetNames.forEach(sheetName => {
                const sheetNameElement = document.createElement('div');
                sheetNameElement.classList.add('col-1');
                sheetNameElement.classList.add('text-center');
                sheetNameElement.classList.add('text-light');
                sheetNameElement.classList.add('pointer');
                if (sheetName === jsonData[0].active_sheet) {
                    sheetNameElement.classList.add('highlight');
                }

                // Add click event listener to get the sheet data
                sheetNameElement.addEventListener('click', async (event) => {
                    const sheetName = event.target.innerHTML;
                    console.log("Sheet Name: ", sheetName);
                    console.log("File name: ", this.file.name);

                    await this.switchSheet(sheetName);
                });

                // append sheet name to the DOM
                sheetNameElement.innerHTML = sheetName;
                sheetsNames.appendChild(sheetNameElement);
            });

            // Get the active sheet
            const activeSheet = jsonData[0].active_sheet;
            console.log("Active Sheet: ", activeSheet);

            document.title = activeSheet ? activeSheet : 'Spreadsheet';

            // Check if the file has multiple sheets
            if (sheetNames.length > 1) {
                // Import all sheets and place them in the footer
                await this.importAllSheets(sheetNames, jsonData);
            } else {
                // Directly load the data if there's only one sheet or no sheets
                const columnHeaders = Object.keys(jsonData[0].data_values);
                console.log("Column Headers: ", columnHeaders);

                const rowData = jsonData.map(item => {
                    const rowObject = {};
                    columnHeaders.forEach(header => {
                        rowObject[header] = item.data_values[header];
                    });
                    return rowObject;
                });

                console.log("Initial file Row Data: ", rowData);

                // Load data into the spreadsheet or handle it as needed
                this.spreadsheet.loadData(rowData);

                this.spreadsheet.updateSettings({
                    colHeaders: columnHeaders, columns: columnHeaders.map(header => ({data: header})),
                });

                // Display the sheet name in the UI
                this.displaySheetName(jsonData[0].active_sheet);

                Helpers.toast('File Success', 'File ' + file['file_name'] + ' loaded successfully', 'success');

            }

        } catch (error) {
            console.log(JSON.stringify(error));
            Helpers.toast('Error', 'Error loading file. Check the file format and try again.', 'error');
        } finally {
            Helpers.hideLoading();
        }
    }


    async switchSheet(sheetName) {
        Helpers.showLoading();
        try {
            const sheetResponse = await Helpers.postJson(this.ENDPOINTS.getSheet, {
                sheetName: sheetName,
                fileName: this.fileName ?? this.file['file_name'],
                folderName: this.folderName ?? this.file['folder_name']
            });
            const responseData = await sheetResponse.json();

            console.log("Full Sheet Response Data: ", responseData); // Log the entire response

            // Extract the 'data' array from the received JSON
            const sheetData = responseData.data;
            console.log("Raw Sheet Data: ", sheetData);

            // Check if sheetData is not empty
            if (sheetData && Array.isArray(sheetData) && sheetData.length > 0) {
                // Continue processing the sheet data
                const firstRow = sheetData[0];
                if (firstRow && firstRow.data_values) {
                    const sheetColumnHeaders = Object.keys(firstRow.data_values);
                    console.log("Sheet Column Headers: ", sheetColumnHeaders);

                    // Extract row data
                    const sheetRowData = sheetData.map(item => {
                        const rowObject = {};
                        if (item.data_values) {
                            sheetColumnHeaders.forEach(header => {
                                if (item.data_values[header] !== undefined) {
                                    rowObject[header] = item.data_values[header];
                                } else {
                                    rowObject[header] = null;
                                }
                            });
                        } else {
                            console.log("Error: 'data_values' is undefined in sheetData item");
                        }
                        return rowObject;
                    });


                    // make the selected sheet name active and make the new sheet name inactive
                    const sheetNames = document.getElementById('sheetsNames');
                    const sheetNameElements = sheetNames.querySelectorAll('div');
                    sheetNameElements.forEach(element => {
                        element.classList.remove('highlight');
                        if (element.innerHTML === sheetName) {
                            element.classList.add('highlight');
                        }
                    });

                    // Update Handsontable with the extracted data
                    this.spreadsheet.loadData(sheetRowData);

                    // Update configuration
                    this.spreadsheet.updateSettings({
                        colHeaders: sheetColumnHeaders, columns: sheetColumnHeaders.map(header => ({data: header})),
                    });

                    this.updateSheetNames(sheetNames, sheetData);

                    // Render and update document title
                    this.spreadsheet.render();
                    document.title = sheetName ? sheetName : 'Spreadsheet';
                } else {
                    console.log("Error: 'data_values' is undefined in sheetData[0]");
                }
            } else {
                console.log("Error: sheetData is not an array or is empty");
            }
        } catch (error) {
            console.log("Error switching sheets: ", error);
        } finally {
            Helpers.hideLoading();
        }
    }

    async exportFile() {
        Helpers.showLoading();
        try {
            const fileName = this.file['file_name'] ?? this.fileName;
            const folderName = this.file['folder_name'] ?? this.folderName;

            const response = await fetch(this.ENDPOINTS.export, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf_token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    fileName: fileName,
                    folderName: folderName
                }),
            });

            if (response.ok) {
                const contentType = response.headers.get('Content-Type');

                if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
                    const blob = await response.blob();
                    this.downloadBlob(blob, fileName);
                } else if (contentType.includes('text/csv')) {
                    const text = await response.text();
                    this.downloadText(text, fileName);
                } else if (contentType.includes('application/vnd.ms-excel')) {
                    // Handle the older Excel format (XLS)
                    const blob = await response.blob();
                    this.downloadBlob(blob, fileName);
                } else {
                    console.error('Unsupported file format:', contentType);
                    Helpers.toast('Error', 'Unsupported file format. Check the console for details.', 'error');
                }

                Helpers.toast('File Success', 'File ' + fileName + ' exported successfully', 'success');
            } else {
                // Handle non-OK responses
                console.error('Failed to export file. Status:', response.status);
                Helpers.toast('Error', 'Failed to export file. Check the console for details.', 'error');
            }
        } catch (error) {
            console.error('Error exporting file:', error);
            Helpers.toast('Error', 'Error exporting file. Check the console for details.', 'error');
        } finally {
            Helpers.hideLoading();
        }
    }

    async importAllSheets(sheetNames, jsonData) {
        Helpers.showLoading();

        try {
            // Update the sheet names in the UI
            this.updateSheetNames(sheetNames, jsonData);

            // Iterate through each sheet
            for (const sheetName of sheetNames) {
                console.log("Importing sheet:", sheetName);

                // Placeholder: You may need to adjust this part based on your actual logic for importing a single sheet
                const sheetResponse = await Helpers.postJson(this.ENDPOINTS.getSheet, {
                    sheetName: sheetName,
                    fileName: this.file['file_name'] ?? this.fileName,
                    folderName: this.file['folder_name'] ?? this.folderName
                });
                const responseData = await sheetResponse.json();
                console.log("Raw Sheet Data for ", sheetName, ": ", responseData);

                // Check if responseData has a 'data' property and it is an array
                if (responseData && Array.isArray(responseData.data)) {
                    const sheetData = responseData.data;

                    const firstRow = sheetData[0];
                    if (firstRow && firstRow.data_values) {
                        const sheetColumnHeaders = Object.keys(firstRow.data_values);
                        console.log("Sheet Column Headers for ", sheetName, ": ", sheetColumnHeaders);

                        // Extract row data
                        const sheetRowData = sheetData.map(item => {
                            const rowObject = {};
                            if (item.data_values) {
                                sheetColumnHeaders.forEach(header => {
                                    // Ensure that item.data_values[header] is defined
                                    if (item.data_values[header] !== undefined) {
                                        rowObject[header] = item.data_values[header];
                                    } else {
                                        rowObject[header] = null; // or handle this case accordingly
                                    }
                                });
                            } else {
                                console.log("Error: 'data_values' is undefined in sheetData item");
                            }
                            return rowObject;
                        });

                        // Update Handsontable with the extracted data
                        this.spreadsheet.loadData(sheetRowData);

                        // Update configuration
                        this.spreadsheet.updateSettings({
                            colHeaders: sheetColumnHeaders, columns: sheetColumnHeaders.map(header => ({data: header})),
                        });

                        this.spreadsheet.render();

                    } else {
                        console.log("Error: 'data_values' is undefined in sheetData[0]");
                    }
                } else {
                    console.log("Error: responseData.data is not an array or is undefined");
                }
            }

            Helpers.toast('File Success', 'File ' + this.file['file_name'] + ' loaded successfully', 'success');
            console.log("All sheets imported successfully");


        } catch (error) {
            console.log("Error importing all sheets: ", error);
        } finally {
            Helpers.hideLoading();
        }
    }


    downloadBlob(blob, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }

    downloadText(text, fileName) {
        const blob = new Blob([text], { type: 'text/csv' });
        this.downloadBlob(blob, fileName);
    }

    updateSheetNames(sheetNames, jsonData) {
        const sheetsNames = document.getElementById('sheetsNames');
        sheetsNames.innerHTML = '';

        sheetNames.forEach(sheetName => {
            const sheetNameElement = document.createElement('div');
            sheetNameElement.classList.add('col-1');
            sheetNameElement.classList.add('text-center');
            sheetNameElement.classList.add('text-light');
            sheetNameElement.classList.add('pointer');
            if (sheetName === jsonData[0].active_sheet) {
                sheetNameElement.classList.add('highlight');
            }

            // Add click event listener to get the sheet data
            sheetNameElement.addEventListener('click', async (event) => {
                const sheetName = event.target.innerHTML;
                console.log("Sheet Name: ", sheetName);
                console.log("File name: ", this.file.name ?? this.file['file_name']);

                await this.switchSheet(sheetName);
            });

            // append sheet name to the DOM
            sheetNameElement.innerHTML = sheetName;
            sheetsNames.appendChild(sheetNameElement);
        });
    }


    initEventListeners() {
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', async (event) => {
            this.file = event.target.files[0];
            await this.loadFile();
        });

        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('keyup', (event) => {
            const searchValue = event.target.value.toLowerCase();
            const rows = this.spreadsheet.countRows();
            const columns = this.spreadsheet.countCols();

            for (let row = 0; row < rows; row++) {
                for (let column = 0; column < columns; column++) {
                    const cellValue = String(this.spreadsheet.getDataAtCell(row, column)).toLowerCase();
                    const cellLocation = this.spreadsheet.getCellMeta(row, column);

                    if (searchValue === '' || cellValue.includes(searchValue)) {
                        cellLocation.className = 'highlight';
                    } else {
                        cellLocation.className = '';
                    }
                }
            }

            if (searchValue === '') {
                this.spreadsheet.updateSettings({cell: null});
            }

            this.spreadsheet.render();
        });

        const saveButton = document.getElementById('saveButton');
        saveButton.addEventListener('click', async (event) => {
            Helpers.showLoading();
            const data = this.spreadsheet.getData();
            const fileName = this.file['file_name'] ?? this.fileName;
            const folderName = this.file['folder_name'] ?? this.folderName;

            const activeSheetElement = document.querySelector('#sheetsNames .highlight');
            const sheetName = activeSheetElement ? activeSheetElement.innerHTML : 'Sheet1';

            console.log("Sheet Name to be saved: ", sheetName);
            console.log("File Name to be saved: ", fileName);
            console.log("Data to be saved: ", data);

            try {
                const response = await Helpers.postJson(this.ENDPOINTS.update, {
                    data: data,
                    fileName: fileName,
                    folderName: folderName,
                    sheetName: sheetName
                });
                const responseData = await response.json();
                console.log("Response Data: ", responseData);
                Helpers.toast('File Saved', 'File saved successfully', 'success');
            } catch (error) {
                console.log("Error saving file: ", error);
                Helpers.toast('Error', 'Error saving file', 'error');
            } finally {
                Helpers.hideLoading();
            }
        });

        // if only exists
        const dropdownSubmenu = document.querySelector('.dropdown-submenu');
        if (dropdownSubmenu) {
            dropdownSubmenu.addEventListener('mouseenter', () => {
                this.handleDropdownMouseEnter();
            });

            dropdownSubmenu.addEventListener('mouseleave', () => {
                this.handleDropdownMouseLeave();
            });
        }


        this.spreadsheet.addHook('afterChange', (changes, source) => {
            if (source === 'edit') {
                document.getElementById('saveButton').classList.remove('hidden');
            }
        });
    }


    handleDropdownMouseLeave() {
        const dropdownMenu = document.querySelector('.dropdown-submenu .dropdown-menu');
        setTimeout(() => {
            dropdownMenu.style.display = 'none';
        }, 300);
    }

    handleDropdownMouseEnter() {
        const dropdownMenu = document.querySelector('.dropdown-submenu .dropdown-menu');
        clearTimeout(this.timeoutId);

        dropdownMenu.style.position = 'absolute';
        dropdownMenu.style.top = "1px";
        dropdownMenu.style.left = "186px";
        dropdownMenu.style.display = 'block';
        dropdownMenu.style.width = 'auto';
        dropdownMenu.innerHTML = '';

        // Assuming you have access to the recentFilesJson data
        const recentFiles = recentFilesJson;
        console.log("Recent Files: ", recentFiles);

        recentFiles.forEach(file => {

            const listItem = document.createElement('li');
            listItem.className = 'mb-2 float-left mt-1 pointer';

            const link = document.createElement('a');
            link.className = 'dropdown-item';
            link.setAttribute('data-toggle', 'tooltip');
            link.setAttribute('data-placement', 'top');
            link.setAttribute('title', file['file_name']);

            const icon = document.createElement('i');
            icon.className = `fa ${Helpers.iconHandler(file['file_name'])}`;

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file['file_name'].substring(0, 20);

            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'badge badge-info float-right';
            timestampSpan.textContent = Helpers.diffForHumans(file['timestamp']);

            link.appendChild(icon);
            link.appendChild(fileNameSpan);
            link.appendChild(timestampSpan);
            listItem.appendChild(link);
            dropdownMenu.appendChild(listItem);

            link.addEventListener('click', async () => {
                try {
                    this.file = file;
                    console.log("File: ", this.file);
                    Helpers.showLoading();
                    console.log('Before postFile - File clicked:', this.file['file_name']);
                    console.log('Before postFile - File clicked folder name:', this.file['folder_name']);

                    const form = new FormData();
                    form.append('fileName', this.file['file_name']);
                    form.append('folderName', this.file['folder_name']);

                    console.log('Before postJson - this.file:', this.file);

                    const formData = new FormData();
                    formData.append('fileName', this.file['file_name']);
                    formData.append('folderName', this.file['folder_name']);

                    const response = await Helpers.postFile(this.ENDPOINTS.recentFiles, formData);

                    console.log("Full Response Data: ", response);


                    console.log('After postJson - this.file:', this.file);
                    console.log('After postFile - File clicked:', this.file['file_name']);
                    console.log('After postFile - File clicked folder name:', this.file['folder_name']);


                    const data = await response.json();

                    const jsonData = data.data;
                    console.log("JSON Data: ", jsonData);

                    // Check if the file has multiple sheets
                    if (jsonData.length > 1 && jsonData[0].sheets.length > 1) {
                        const sheetNames = jsonData[0].sheets;

                        // Import all sheets and place them in the footer
                        await this.importAllSheets(sheetNames, jsonData);
                    } else {
                        // Directly load the data if there's only one sheet or no sheets
                        const columnHeaders = Object.keys(jsonData[0].data_values);
                        console.log("Column Headers: ", columnHeaders);

                        const rowData = jsonData.map(item => {
                            const rowObject = {};
                            columnHeaders.forEach(header => {
                                rowObject[header] = item.data_values[header];
                            });
                            return rowObject;
                        });

                        console.log("Initial file Row Data: ", rowData);

                        // Load data into the spreadsheet or handle it as needed
                        this.spreadsheet.loadData(rowData);

                        this.spreadsheet.updateSettings({
                            colHeaders: columnHeaders, columns: columnHeaders.map(header => ({data: header})),
                        });

                        searchInput.classList.remove('hidden');
                        Helpers.toast('File Success', 'File ' + file['file_name'] + ' loaded successfully', 'success');

                        // Manually call switchSheet for single-sheet files
                        await this.switchSheet(jsonData[0].active_sheet);
                    }

                } catch (error) {
                    console.log(JSON.stringify(error));
                } finally {
                    Helpers.hideLoading();
                }
            });
        });

        dropdownMenu.onclick = function (event) {
            event.stopPropagation();
            // Add logic if needed
        };

    }

    displaySheetName(sheetName) {
        // Update the UI to display the sheet name
        const sheetNames = document.getElementById('sheetsNames');
        const sheetNameElements = sheetNames.querySelectorAll('div');
        sheetNameElements.forEach(element => {
            element.classList.remove('highlight');
            if (element.innerHTML === sheetName) {
                element.classList.add('highlight');
            }
        });

        document.title = sheetName ? sheetName : 'Spreadsheet';
    }

}

// Instantiate the class and initialize event listeners
const excelHandler = new ExcelHandler();
excelHandler.initEventListeners();

document.getElementById("exportButton").addEventListener("click", async () => {
    await excelHandler.exportFile();
});

