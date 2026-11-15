const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const scanDirectory = require("../Scanner");
const { makeTree } = require("./helpers");

const relPaths = (root, files) => files.map((f) => path.relative(root, f.path)).sort();

test("skips .git, .gitignore and node_modules", () => {
    const root = makeTree({
        "a.txt": "a",
        ".gitignore": "x",
        "node_modules/dep/index.js": "x",
        ".git/HEAD": "x",
        "src/b.txt": "bb",
    });
    const files = scanDirectory(root, { gitignore: false });
    assert.deepEqual(relPaths(root, files), ["a.txt", path.join("src", "b.txt")]);
});

test("records file sizes", () => {
    const root = makeTree({ "a.txt": "12345" });
    assert.deepEqual(scanDirectory(root).map((f) => f.size), [5]);
});

test("skips symlinks", { skip: process.platform === "win32" }, () => {
    const root = makeTree({ "a.txt": "a" });
    fs.symlinkSync(path.join(root, "a.txt"), path.join(root, "link.txt"));
    assert.deepEqual(relPaths(root, scanDirectory(root, { gitignore: false })), ["a.txt"]);
});

test("returns an empty list for a missing folder", () => {
    assert.deepEqual(scanDirectory(path.join(makeTree({}), "missing")), []);
});

test("maxDepth limits recursion", () => {
    const root = makeTree({ "a.txt": "a", "one/b.txt": "b", "one/two/c.txt": "c" });
    assert.deepEqual(relPaths(root, scanDirectory(root, { maxDepth: 1 })), ["a.txt"]);
    assert.deepEqual(relPaths(root, scanDirectory(root, { maxDepth: 2 })), ["a.txt", path.join("one", "b.txt")]);
});

test("respects .gitignore inside a git repository", () => {
    const root = makeTree({ ".gitignore": "dist/\n*.log\n", "a.txt": "a", "dist/out.js": "x", "debug.log": "x" });
    execFileSync("git", ["init", "-q"], { cwd: root });
    assert.deepEqual(relPaths(root, scanDirectory(root)), ["a.txt"]);
    assert.equal(scanDirectory(root, { gitignore: false }).length, 3);
});

test("still accepts the old accumulator-array argument", () => {
    const root = makeTree({ "a.txt": "a" });
    const acc = [];
    assert.equal(scanDirectory(root, acc), acc);
    assert.equal(acc.length, 1);
});
