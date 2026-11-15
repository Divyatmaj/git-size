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

// The reverse of formatBytes: "1.5MB", "500 kb", "200" (bytes) -> number of bytes.
// Returns NaN for anything it cannot read.
function parseSize(text) {
    const match = /^\s*(\d+(?:\.\d+)?)\s*(b|bytes?|kb?|mb?|gb?|tb?)?\s*$/i.exec(String(text));
    if (!match) return NaN;
    const unit = (match[2] || "b").toLowerCase()[0];
    const power = { b: 0, k: 1, m: 2, g: 3, t: 4 }[unit];
    return Math.round(parseFloat(match[1]) * Math.pow(1024, power));
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

// Table for --by-dir / --by-type results: [{ name, files, size }].
function mkGroupTable(groups, { label = "Name", width = process.stdout.columns || 80 } = {}) {
    const filesWidth = 9;
    const nameWidth = Math.max(MIN_FILE_WIDTH, width - NUM_WIDTH - filesWidth - SIZE_WIDTH - BORDERS - 1);
    const table = new Table({
        head: [chalk.bold("No."), chalk.bold(label), chalk.bold("Files"), chalk.bold("Size")],
        colWidths: [NUM_WIDTH, nameWidth, filesWidth, SIZE_WIDTH],
        wordWrap: true,
        wrapOnWordBoundary: false,
        style: { head: [] },
    });

    groups.forEach((g, index) => {
        table.push([index + 1, g.name, g.files, colourSize(g.size)]);
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

module.exports = { formatBytes, parseSize, formatSize, formatJSON, mkTable, mkGroupTable, colourSize };
