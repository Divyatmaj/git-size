// All functions return new arrays and never modify the array passed in.

const bySizeAsc = (a, b) => a.size - b.size;
const bySizeDesc = (a, b) => b.size - a.size;

// Sorts in ascending order (smallest first)
function sortBySizeA(arr) {
    return [...arr].sort(bySizeAsc);
}

// Sorts in descending order (largest first)
function sortBySizeD(arr) {
    return [...arr].sort(bySizeDesc);
}

// The N smallest files, smallest first. Returns every file if N exceeds the count.
function getBottomN(arr, n) {
    return sortBySizeA(arr).slice(0, n);
}

// The N largest files, largest first. Returns every file if N exceeds the count.
function getTopN(arr, n) {
    return sortBySizeD(arr).slice(0, n);
}

function calculateTotalSize(arr) {
    return arr.reduce((acc, elem) => acc + elem.size, 0);
}

// Files at least `minBytes` big.
function filterMinSize(arr, minBytes) {
    return arr.filter((f) => f.size >= minBytes);
}

// Groups files by a key and returns [{ name, files, size }], largest first.
function groupBy(arr, keyOf) {
    const groups = new Map();
    for (const f of arr) {
        const name = keyOf(f);
        const g = groups.get(name) || { name, files: 0, size: 0 };
        g.files += 1;
        g.size += f.size;
        groups.set(name, g);
    }
    return sortBySizeD([...groups.values()]);
}

// Totals per top-level folder; files directly in the root are grouped as ".".
function groupByDir(arr) {
    return groupBy(arr, (f) => {
        const parts = f.path.split(/[\\/]/);
        return parts.length > 1 ? parts[0] + "/" : ".";
    });
}

// Totals per file extension (".js", ".png", ...); files without one are "(none)".
// Dotfiles such as ".env" count as having no extension.
function groupByType(arr) {
    return groupBy(arr, (f) => {
        const base = f.path.split(/[\\/]/).pop();
        const dot = base.lastIndexOf(".");
        return dot > 0 ? base.slice(dot).toLowerCase() : "(none)";
    });
}

module.exports = {
    sortBySizeA,
    sortBySizeD,
    getBottomN,
    getTopN,
    /** @deprecated use getTopN */
    getBiglN: getTopN,
    calculateTotalSize,
    filterMinSize,
    groupByDir,
    groupByType,
};
