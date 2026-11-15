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

module.exports = {
    sortBySizeA,
    sortBySizeD,
    getBottomN,
    getTopN,
    /** @deprecated use getTopN */
    getBiglN: getTopN,
    calculateTotalSize,
};
