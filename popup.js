// DOM Elements
const inputType = document.getElementById('input-type');
const outputType = document.getElementById('output-type');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const uploadBtn = document.getElementById('upload-btn');
const convertBtn = document.getElementById('convert-btn');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const fileInput = document.getElementById('file-input');
const statusDiv = document.getElementById('status');
const themeToggle = document.getElementById('theme-toggle');

// Theme Toggle Functions
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('light-theme');

    if (isDark) {
        body.classList.remove('light-theme');
        themeToggle.querySelector('.theme-icon').textContent = '🌙';
        themeToggle.title = 'Toggle Dark/Light Mode';
    } else {
        body.classList.add('light-theme');
        themeToggle.querySelector('.theme-icon').textContent = '☀️';
        themeToggle.title = 'Toggle Light/Dark Mode';
    }

    // Save preference
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
}

function loadThemePreference() {
    chrome.storage.local.get(['theme'], (result) => {
        const theme = result.theme || 'dark';
        const body = document.body;

        if (theme === 'light') {
            body.classList.add('light-theme');
            themeToggle.querySelector('.theme-icon').textContent = '☀️';
            themeToggle.title = 'Toggle Light/Dark Mode';
        } else {
            body.classList.remove('light-theme');
            themeToggle.querySelector('.theme-icon').textContent = '🌙';
            themeToggle.title = 'Toggle Dark/Light Mode';
        }
    });
}

// Conversion Functions
function csvToJson(csv) {
    try {
        const lines = csv.trim().split('\n');
        if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                result.push(obj);
            }
        }

        return JSON.stringify(result, null, 2);
    } catch (error) {
        throw new Error(`CSV to JSON conversion failed: ${error.message}`);
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

function jsonToCsv(json) {
    try {
        const data = JSON.parse(json);
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('JSON must be an array of objects');
        }

        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape quotes and wrap in quotes if contains comma or quote
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });

        return csv.trim();
    } catch (error) {
        throw new Error(`JSON to CSV conversion failed: ${error.message}`);
    }
}

function jsonBeautifier(json) {
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        throw new Error(`JSON beautification failed: ${error.message}`);
    }
}

function csvToSql(csv, tableName = 'converted_table') {
    try {
        const json = JSON.parse(csvToJson(csv));
        if (!Array.isArray(json) || json.length === 0) {
            throw new Error('No data to convert');
        }

        const headers = Object.keys(json[0]);
        const columns = headers.map(header => `"${header}" TEXT`).join(', ');

        let sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});\n\n`;

        json.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) {
                    return 'NULL';
                }
                return `'${String(value).replace(/'/g, "''")}'`;
            });
            sql += `INSERT INTO "${tableName}" (${headers.map(h => `"${h}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        });

        return sql.trim();
    } catch (error) {
        throw new Error(`CSV to SQL conversion failed: ${error.message}`);
    }
}

function jsonToSql(json, tableName = 'converted_table') {
    try {
        const data = JSON.parse(json);
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('JSON must be an array of objects');
        }

        const headers = Object.keys(data[0]);
        const columns = headers.map(header => `"${header}" TEXT`).join(', ');

        let sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});\n\n`;

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) {
                    return 'NULL';
                }
                return `'${String(value).replace(/'/g, "''")}'`;
            });
            sql += `INSERT INTO "${tableName}" (${headers.map(h => `"${h}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        });

        return sql.trim();
    } catch (error) {
        throw new Error(`JSON to SQL conversion failed: ${error.message}`);
    }
}

function sqlToJson(sql) {
    try {
        // Basic SQL parsing - this is a simplified implementation
        const insertRegex = /INSERT INTO ["`]?(\w+)["`]? \(([^)]+)\) VALUES \(([^)]+)\)/gi;
        const results = [];
        let match;

        while ((match = insertRegex.exec(sql)) !== null) {
            const [, tableName, columnsStr, valuesStr] = match;
            const columns = columnsStr.split(',').map(col => col.trim().replace(/["`]/g, ''));
            const values = parseSQLValues(valuesStr);

            if (columns.length === values.length) {
                const obj = {};
                columns.forEach((col, index) => {
                    obj[col] = values[index];
                });
                results.push(obj);
            }
        }

        if (results.length === 0) {
            throw new Error('No INSERT statements found in SQL');
        }

        return JSON.stringify(results, null, 2);
    } catch (error) {
        throw new Error(`SQL to JSON conversion failed: ${error.message}`);
    }
}

function parseSQLValues(valuesStr) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];

        if (!inQuotes && (char === "'" || char === '"')) {
            inQuotes = true;
            quoteChar = char;
        } else if (inQuotes && char === quoteChar) {
            if (valuesStr[i + 1] === quoteChar) {
                current += quoteChar;
                i++; // Skip escaped quote
            } else {
                inQuotes = false;
            }
        } else if (!inQuotes && char === ',') {
            values.push(current.trim() === 'NULL' ? null : current.trim().replace(/^["']|["']$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }

    // Add the last value
    values.push(current.trim() === 'NULL' ? null : current.trim().replace(/^["']|["']$/g, ''));
    return values;
}

function sqlToCsv(sql) {
    try {
        const json = sqlToJson(sql);
        return jsonToCsv(json);
    } catch (error) {
        throw new Error(`SQL to CSV conversion failed: ${error.message}`);
    }
}

// UI Functions
function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status-display ${type} show`;
    setTimeout(() => {
        statusDiv.classList.remove('show');
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status-display';
        }, 300); // Wait for fade out animation
    }, 5000);
}

function convert() {
    const input = inputText.value.trim();
    const inputFormat = inputType.value;
    const outputFormat = outputType.value;

    if (!input) {
        showStatus('Please enter some data to convert', 'error');
        return;
    }

    try {
        let result = '';

        if (outputFormat === 'beautify') {
            if (inputFormat !== 'json') {
                throw new Error('Beautify only works with JSON input');
            }
            result = jsonBeautifier(input);
        } else {
            // Convert to intermediate format first
            let jsonIntermediate = '';

            switch (inputFormat) {
                case 'csv':
                    jsonIntermediate = csvToJson(input);
                    break;
                case 'json':
                    jsonIntermediate = jsonBeautifier(input); // Validate JSON
                    break;
                case 'sql':
                    jsonIntermediate = sqlToJson(input);
                    break;
            }

            // Convert from intermediate to output
            switch (outputFormat) {
                case 'json':
                    result = jsonIntermediate;
                    break;
                case 'csv':
                    result = jsonToCsv(jsonIntermediate);
                    break;
                case 'sql':
                    result = jsonToSql(jsonIntermediate);
                    break;
            }
        }

        outputText.value = result;
        downloadBtn.disabled = false;
        copyBtn.disabled = false;
        showStatus('Conversion successful!', 'success');

    } catch (error) {
        outputText.value = '';
        downloadBtn.disabled = true;
        copyBtn.disabled = true;
        showStatus(error.message, 'error');
    }
}

function download() {
    const content = outputText.value;
    if (!content || !content.trim()) {
        showStatus('No content to download.', 'error');
        return;
    }

    const outputFormat = outputType.value;
    let filename = '';
    let mimeType = '';

    switch (outputFormat) {
        case 'json':
        case 'beautify':
            filename = `converted.json`;
            mimeType = 'application/json';
            break;
        case 'csv':
            filename = `converted.csv`;
            mimeType = 'text/csv';
            break;
        case 'sql':
            filename = `converted.sql`;
            mimeType = 'application/sql';
            break;
        default:
            filename = `converted.txt`;
            mimeType = 'text/plain';
    }

    // For Chrome extensions, open the full application in a new tab
    try {
        // Store the download data for the new tab to access
        chrome.storage.local.set({
            'downloadContent': content,
            'downloadFilename': filename,
            'downloadMimeType': mimeType,
            'downloadAction': 'download'
        }, () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL('converter.html')
            });
            showStatus('Opening full application for download functionality...', 'info');
        });
    } catch (error) {
        console.error('Download failed:', error);
        showStatus('Download not available in popup. Please use the web version.', 'error');
    }
}

function manualDownload(dataUrl, filename) {
    try {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showStatus(`✅ Downloaded as ${filename}`, 'success');
    } catch (error) {
        console.error('Manual download failed:', error);
        showStatus('Download failed. Please try copying the content instead.', 'error');
    }
}

function fallbackDownload(url, filename) {
    try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        a.target = '_blank';

        document.body.appendChild(a);

        // Force download by simulating click
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        a.dispatchEvent(clickEvent);

        // Clean up after a delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
        }, 100);

        showStatus(`✅ Downloaded as ${filename}`, 'success');
    } catch (error) {
        console.error('Fallback download failed:', error);
        showStatus('Download failed. Please try copying the content instead.', 'error');
    }
}

function copyToClipboard() {
    const content = outputText.value;
    if (!content || !content.trim()) {
        showStatus('No content to copy.', 'error');
        return;
    }

    // For Chrome extensions, open the full application in a new tab
    try {
        // Store the content temporarily for the new tab to access
        chrome.storage.local.set({
            'clipboardContent': content,
            'clipboardAction': 'copy'
        }, () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL('converter.html')
            });
            showStatus('Opening full application for copy functionality...', 'info');
        });
    } catch (error) {
        console.error('Copy failed:', error);
        showStatus('Copy not available in popup. Please use the web version.', 'error');
    }
}

function manualCopyFallback(content) {
    try {
        // Manual approach - select the text and instruct user
        outputText.focus();
        outputText.select();
        showStatus('✅ Text selected! Press Ctrl+C (Cmd+C on Mac) to copy.', 'success');
    } catch (error) {
        showStatus('Copy failed. Please select and copy the text manually.', 'error');
    }
}

function fallbackCopyTextToClipboard(text) {
    try {
        // Create a more reliable textarea for copying
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: 1px;
            height: 1px;
            opacity: 0;
            overflow: hidden;
            z-index: -1;
        `;

        document.body.appendChild(textArea);

        // Modern selection approach
        textArea.focus({ preventScroll: true });
        textArea.select();
        textArea.setSelectionRange(0, text.length);

        // Try the copy command
        const successful = document.execCommand('copy');

        document.body.removeChild(textArea);

        if (successful) {
            showStatus('✅ Copied to clipboard!', 'success');
        } else {
            // Manual fallback - select the output text for user to copy
            outputText.focus();
            outputText.select();
            showStatus('✅ Text selected! Press Ctrl+C (Cmd+C) to copy.', 'success');
        }
    } catch (error) {
        console.error('Copy failed:', error);
        // Manual fallback
        try {
            outputText.focus();
            outputText.select();
            showStatus('✅ Text selected! Press Ctrl+C (Cmd+C) to copy.', 'success');
        } catch (selectError) {
            showStatus('Copy failed. Please select and copy the text manually.', 'error');
        }
    }
}

function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Take the first file

    // Check file size (limit to 5MB for extension)
    if (file.size > 5 * 1024 * 1024) {
        showStatus('File too large. Please use a file smaller than 5MB.', 'error');
        return;
    }

    // Check file type
    const validTypes = ['text/csv', 'text/plain', 'application/json', 'application/sql'];
    const isValidType = validTypes.includes(file.type) ||
                       file.name.match(/\.(csv|json|sql|txt)$/i);

    if (!isValidType) {
        showStatus('Please select a valid file type: CSV, JSON, SQL, or TXT.', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const content = e.target.result;
            if (content && content.trim().length > 0) {
                inputText.value = content;
                inputText.focus();
                // Scroll to input area
                inputText.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showStatus(`File "${file.name}" loaded successfully!`, 'success');
            } else {
                showStatus('File appears to be empty or contains no readable content.', 'error');
            }
        } catch (error) {
            console.error('File read error:', error);
            showStatus('Error reading file content. Please try again or paste content directly.', 'error');
        }
    };

    reader.onerror = function() {
        showStatus('Error reading file. Please try again or paste content directly.', 'error');
    };

    reader.onabort = function() {
        showStatus('File reading was cancelled.', 'error');
    };

    try {
        // Use readAsText for all file types
        reader.readAsText(file, 'UTF-8');
    } catch (error) {
        console.error('FileReader error:', error);
        showStatus('Unable to read file. Please paste content directly or try a different file.', 'error');
    }
}

// Drag and Drop functionality
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    inputText.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    inputText.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    inputText.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        // Simulate file input change event
        const fakeEvent = { target: { files: files } };
        handleFileUpload(fakeEvent);
    }
}

// Event Listeners
convertBtn.addEventListener('click', convert);
downloadBtn.addEventListener('click', download);
copyBtn.addEventListener('click', copyToClipboard);
uploadBtn.addEventListener('click', () => {
    // For Chrome extensions, open a new tab with the full application
    try {
        chrome.tabs.create({
            url: chrome.runtime.getURL('converter.html')
        });
        showStatus('Opening full application in new tab for file upload...', 'info');
    } catch (error) {
        console.error('Failed to open tab:', error);
        showStatus('Please use the web version at the provided URL for full functionality.', 'error');
    }
});
fileInput.addEventListener('change', handleFileUpload);

// Drag and drop listeners
inputText.addEventListener('dragover', handleDragOver);
inputText.addEventListener('dragleave', handleDragLeave);
inputText.addEventListener('drop', handleDrop);

// Auto-convert on input change (debounced)
let convertTimeout;
inputText.addEventListener('input', () => {
    clearTimeout(convertTimeout);
    convertTimeout = setTimeout(() => {
        if (inputText.value.trim()) {
            convert();
        }
    }, 500);
});

// Update output type options based on input type
inputType.addEventListener('change', () => {
    const inputFormat = inputType.value;
    const options = outputType.querySelectorAll('option');

    // Enable/disable beautify option
    options.forEach(option => {
        if (option.value === 'beautify') {
            option.disabled = inputFormat !== 'json';
        }
    });

    // Reset to first available option if current is disabled
    if (outputType.value === 'beautify' && inputFormat !== 'json') {
        outputType.value = 'csv';
    }
});

// Initialize theme on load
loadThemePreference();

// Theme toggle event listener
themeToggle.addEventListener('click', toggleTheme);
