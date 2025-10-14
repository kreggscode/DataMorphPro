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
    if (!content) return;

    const outputFormat = outputType.value;
    let filename = `converted.${outputFormat === 'beautify' ? 'json' : outputFormat}`;
    let mimeType = '';

    switch (outputFormat) {
        case 'json':
        case 'beautify':
            mimeType = 'application/json';
            filename = `converted.json`;
            break;
        case 'csv':
            mimeType = 'text/csv';
            filename = `converted.csv`;
            break;
        case 'sql':
            mimeType = 'application/sql';
            filename = `converted.sql`;
            break;
        default:
            mimeType = 'text/plain';
            filename = `converted.txt`;
    }

    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus(`File downloaded as ${filename}`, 'success');
    } catch (error) {
        showStatus('Download failed. Please try copying the content instead.', 'error');
    }
}

function copyToClipboard() {
    const content = outputText.value;
    if (!content) return;

    try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content).then(() => {
                showStatus('Copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback to older method
                fallbackCopyTextToClipboard(content);
            });
        } else {
            // Fallback for older browsers
            fallbackCopyTextToClipboard(content);
        }
    } catch (error) {
        showStatus('Copy failed. Please select and copy manually.', 'error');
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showStatus('Copied to clipboard!', 'success');
    } catch (error) {
        showStatus('Copy failed. Please select and copy manually.', 'error');
    }

    document.body.removeChild(textArea);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 1MB for extension)
    if (file.size > 1024 * 1024) {
        showStatus('File too large. Please use a file smaller than 1MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            inputText.value = e.target.result;
            showStatus(`File "${file.name}" loaded successfully!`, 'success');
        } catch (error) {
            showStatus('Error reading file content', 'error');
        }
    };
    reader.onerror = function() {
        showStatus('Error reading file. Please try again.', 'error');
    };

    try {
        reader.readAsText(file);
    } catch (error) {
        showStatus('Unable to read file. Please paste content directly.', 'error');
    }
}

// Event Listeners
convertBtn.addEventListener('click', convert);
downloadBtn.addEventListener('click', download);
copyBtn.addEventListener('click', copyToClipboard);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);

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
