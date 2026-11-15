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
