const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Creates a temporary folder from { "relative/path": "contents" }.
function makeTree(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "gsize-test-"));
    for (const [rel, contents] of Object.entries(files)) {
        const full = path.join(root, rel);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, contents);
    }
    return root;
}

module.exports = { makeTree };
