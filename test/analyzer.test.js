const test = require("node:test");
const assert = require("node:assert/strict");
const { sortBySizeA, sortBySizeD, getTopN, getBottomN, getBiglN, calculateTotalSize } = require("..");

const files = () => [
    { path: "b", size: 20 },
    { path: "a", size: 10 },
    { path: "c", size: 30 },
];
const paths = (arr) => arr.map((f) => f.path);

test("sorts ascending and descending", () => {
    assert.deepEqual(paths(sortBySizeA(files())), ["a", "b", "c"]);
    assert.deepEqual(paths(sortBySizeD(files())), ["c", "b", "a"]);
});

test("does not mutate the input array", () => {
    const input = files();
    sortBySizeA(input);
    sortBySizeD(input);
    getTopN(input, 2);
    getBottomN(input, 2);
    assert.deepEqual(paths(input), ["b", "a", "c"]);
});

test("getTopN returns the largest first", () => {
    assert.deepEqual(paths(getTopN(files(), 2)), ["c", "b"]);
});

test("getTopN returns all files largest first when N is too large", () => {
    assert.deepEqual(paths(getTopN(files(), 10)), ["c", "b", "a"]);
});

test("getBottomN returns the smallest first", () => {
    assert.deepEqual(paths(getBottomN(files(), 2)), ["a", "b"]);
    assert.deepEqual(paths(getBottomN(files(), 10)), ["a", "b", "c"]);
});

test("getBiglN is kept as an alias of getTopN", () => {
    assert.equal(getBiglN, getTopN);
});

test("calculateTotalSize sums sizes", () => {
    assert.equal(calculateTotalSize(files()), 60);
    assert.equal(calculateTotalSize([]), 0);
});

const { filterMinSize, groupByDir, groupByType } = require("..");

const tree = [
    { path: "README.md", size: 5 },
    { path: "src/a.js", size: 10 },
    { path: "src/lib/b.JS", size: 20 },
    { path: "img/logo.png", size: 100 },
    { path: ".env", size: 1 },
];

test("filterMinSize keeps files at or above the limit", () => {
    assert.deepEqual(paths(filterMinSize(tree, 10)), ["src/a.js", "src/lib/b.JS", "img/logo.png"]);
});

test("groupByDir totals each top-level folder, largest first", () => {
    assert.deepEqual(groupByDir(tree), [
        { name: "img/", files: 1, size: 100 },
        { name: "src/", files: 2, size: 30 },
        { name: ".", files: 2, size: 6 },
    ]);
});

test("groupByType totals each extension, case-insensitively", () => {
    assert.deepEqual(groupByType(tree), [
        { name: ".png", files: 1, size: 100 },
        { name: ".js", files: 2, size: 30 },
        { name: ".md", files: 1, size: 5 },
        { name: "(none)", files: 1, size: 1 },
    ]);
});
