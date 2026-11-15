const test = require("node:test");
const assert = require("node:assert/strict");
const { formatBytes, mkTable } = require("..");

test("formatBytes", () => {
    assert.equal(formatBytes(0), "0 Bytes");
    assert.equal(formatBytes(1024), "1 KB");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(5 * 1024 * 1024), "5 MB");
});

test("mkTable does not cut off long paths", () => {
    const longPath = "a/".repeat(60) + "end.txt";
    const table = mkTable([{ path: longPath, size: 1 }], { width: 60 });
    const text = table.replace(/\x1b\[[0-9;]*m/g, "");
    assert.ok(!text.includes("…"));
    assert.ok(text.includes("end.txt"));
});

test("mkTable works with an empty list", () => {
    assert.equal(typeof mkTable([]), "string");
});

const { parseSize } = require("..");

test("parseSize reads plain bytes and units", () => {
    assert.equal(parseSize("200"), 200);
    assert.equal(parseSize("1KB"), 1024);
    assert.equal(parseSize("1.5mb"), 1572864);
    assert.equal(parseSize("2 GB"), 2 * 1024 ** 3);
    assert.equal(parseSize("10k"), 10240);
});

test("parseSize returns NaN for nonsense", () => {
    assert.ok(Number.isNaN(parseSize("big")));
    assert.ok(Number.isNaN(parseSize("-5MB")));
    assert.ok(Number.isNaN(parseSize("")));
});
