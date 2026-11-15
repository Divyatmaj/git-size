const Table = require("cli-table3");
const chalk = require("chalk");

const NUM_WIDTH = 6;
const SIZE_WIDTH = 14;
const BORDERS = 4;
const MIN_FILE_WIDTH = 20;

// Could also use a dependency such as `bytes` or `filesize` for this.
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatSize(arr) {
    return arr.map((obj) => ({
        path: obj.path,
        size: formatBytes(obj.size),
    }));
}

function formatJSON(value) {
    return JSON.stringify(value, null, 2);
}

// Builds the results table. The file column fills the terminal width and
// long paths wrap instead of being cut off.
function mkTable(arr, { width = process.stdout.columns || 80 } = {}) {
    const fileWidth = Math.max(MIN_FILE_WIDTH, width - NUM_WIDTH - SIZE_WIDTH - BORDERS);
    const table = new Table({
        head: [chalk.bold("No."), chalk.bold("File"), chalk.bold("Size")],
        colWidths: [NUM_WIDTH, fileWidth, SIZE_WIDTH],
        wordWrap: true,
        wrapOnWordBoundary: false,
        style: { head: [] },
    });

    arr.forEach((obj, index) => {
        table.push([index + 1, obj.path, colourSize(obj.size)]);
    });
    return table.toString();
}

function colourSize(size) {
    const formattedSize = formatBytes(size);

    if (size < 1024 * 1024) {
        return chalk.green(formattedSize);
    }
    if (size < 10 * 1024 * 1024) {
        return chalk.yellow(formattedSize);
    }
    return chalk.red(formattedSize);
}

module.exports = { formatBytes, formatSize, formatJSON, mkTable, colourSize };
