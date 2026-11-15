const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { makeTree } = require("./helpers");
const { version } = require("../package.json");

const CLI = path.join(__dirname, "..", "cli.js");
const root = makeTree({ "big.txt": "x".repeat(300), "mid.txt": "x".repeat(20), "small.txt": "x", "empty.txt": "" });

function gsize(...args) {
    const r = spawnSync(process.execPath, [CLI, ...args], { cwd: root, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
    return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}
const json = (...args) => JSON.parse(gsize(...args, "-j").stdout).map((f) => f.path);

test("runs with no flags and prints a largest-first table", () => {
    const r = gsize();
    assert.equal(r.code, 0, r.stderr);
    assert.ok(r.stdout.indexOf("big.txt") < r.stdout.indexOf("small.txt"));
});

test("--json prints only valid JSON on stdout", () => {
    assert.deepEqual(json(), ["big.txt", "mid.txt", "small.txt", "empty.txt"]);
});

test("--json respects -f", () => {
    assert.deepEqual(json("-f", "2"), ["big.txt", "mid.txt"]);
});

test("-l returns the smallest first", () => {
    assert.deepEqual(json("-l", "2"), ["empty.txt", "small.txt"]);
});

test("-f larger than the file count lists largest first and warns on stderr", () => {
    const r = gsize("-f", "10", "-j");
    assert.deepEqual(JSON.parse(r.stdout).map((f) => f.path), ["big.txt", "mid.txt", "small.txt", "empty.txt"]);
    assert.match(r.stderr, /Only 4 files/);
});

test("flags combine: -s -f 2 picks the largest two, smallest first", () => {
    assert.deepEqual(json("-s", "-f", "2"), ["mid.txt", "big.txt"]);
});

test("rejects a non-numeric N", () => {
    const r = gsize("-f", "abc");
    assert.notEqual(r.code, 0);
    assert.match(r.stderr, /positive whole number/);
});

test("rejects conflicting flags", () => {
    assert.notEqual(gsize("-s", "-d").code, 0);
    assert.notEqual(gsize("-f", "1", "-l", "1").code, 0);
});

test("-t prints the total size", () => {
    assert.match(gsize("-t").stdout, /TOTAL SIZE: 321 Bytes/);
    assert.deepEqual(JSON.parse(gsize("-t", "-j").stdout), { totalSize: 321, files: 4 });
});

test("accepts a folder argument", () => {
    const other = makeTree({ "only.txt": "x" });
    const r = gsize(other, "-j");
    assert.deepEqual(JSON.parse(r.stdout).map((f) => f.path), ["only.txt"]);
});

test("errors on a missing folder", () => {
    assert.notEqual(gsize(path.join(root, "nope")).code, 0);
});

test("--version prints the package version", () => {
    assert.equal(gsize("--version").stdout.trim(), version);
});

test("requiring the package does not run the CLI", () => {
    const r = spawnSync(process.execPath, ["-e", `require(${JSON.stringify(path.join(__dirname, ".."))})`], { encoding: "utf8" });
    assert.equal(r.stdout, "");
    assert.equal(r.status, 0);
});

const grouped = makeTree({ "src/a.js": "x".repeat(100), "src/b.js": "x".repeat(50), "docs/readme.md": "x".repeat(10), "top.txt": "x" });
function gsizeIn(cwd, ...args) {
    const r = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } });
    return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

test("--by-dir totals folders", () => {
    const out = JSON.parse(gsizeIn(grouped, "--by-dir", "-j").stdout);
    assert.deepEqual(out.map((g) => [g.name, g.size]), [["src/", 150], ["docs/", 10], [".", 1]]);
});

test("--by-type totals extensions and works with -f", () => {
    const out = JSON.parse(gsizeIn(grouped, "--by-type", "-f", "1", "-j").stdout);
    assert.deepEqual(out, [{ name: ".js", files: 2, size: 150 }]);
});

test("--by-dir and --by-type conflict", () => {
    assert.notEqual(gsizeIn(grouped, "--by-dir", "--by-type").code, 0);
});

test("--min-size hides small files", () => {
    const out = JSON.parse(gsizeIn(grouped, "--min-size", "50", "-j").stdout);
    assert.deepEqual(out.map((f) => f.size), [100, 50]);
    assert.notEqual(gsizeIn(grouped, "--min-size", "huge").code, 0);
});

test("--max-total exits 1 only when the project is over the limit", () => {
    const over = gsizeIn(grouped, "-t", "--max-total", "100");
    assert.equal(over.code, 1);
    assert.match(over.stderr, /over the 100 Bytes limit/);
    assert.equal(gsizeIn(grouped, "-t", "--max-total", "1KB").code, 0);
});
