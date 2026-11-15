const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const toIgnore = ['.git', '.gitignore', 'node_modules'];

// Lists files with `git ls-files` (tracked + untracked, minus anything
// .gitignore excludes), relative to `directory`. Returns null when the
// folder is not inside a git repository or git is not installed.
function listGitFiles(directory) {
    let output;
    try {
        output = execFileSync(
            "git",
            ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
            { cwd: directory, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1024 * 1024 * 512 }
        );
    } catch (err) {
        return null;
    }
    return [...new Set(output.split("\0").filter(Boolean))];
}

function statFile(fullPath) {
    try {
        const stats = fs.lstatSync(fullPath);
        return stats.isFile() ? stats : null; // skips symlinks, folders, deleted files
    } catch (err) {
        return null;
    }
}

function scanGit(directory, relPaths, maxDepth, out) {
    for (const rel of relPaths) {
        const parts = rel.split("/");
        if (parts.length > maxDepth || parts.some((p) => toIgnore.includes(p))) {
            continue;
        }
        const fullPath = path.join(directory, rel);
        const stats = statFile(fullPath);
        if (stats) {
            out.push({ path: fullPath, size: stats.size });
        }
    }
    return out;
}

function walk(directory, depth, maxDepth, out) {
    let items;
    try {
        items = fs.readdirSync(directory, { withFileTypes: true });
    } catch (err) {
        return out;
    }

    for (const item of items) {
        if (toIgnore.includes(item.name) || item.isSymbolicLink()) {
            continue;
        }
        const fullPath = path.join(directory, item.name);

        if (item.isDirectory()) {
            if (depth < maxDepth) {
                walk(fullPath, depth + 1, maxDepth, out);
            }
        } else if (item.isFile()) {
            const stats = statFile(fullPath);
            if (stats) {
                out.push({ path: fullPath, size: stats.size });
            }
        }
    }
    return out;
}

/**
 * Returns [{ path, size }] for every file under `directory`.
 *
 * Options:
 *   gitignore (default true) - inside a git repo, list files with
 *     `git ls-files` so .gitignore rules apply. Outside a repo, or when
 *     false, walk the folder and skip only .git, .gitignore, node_modules.
 *   maxDepth (default Infinity) - 1 means only files directly in `directory`.
 */
function scanDirectory(directory, options = {}) {
    // Backward compatibility with the old scanDirectory(dir, accumulatorArray).
    const out = Array.isArray(options) ? options : [];
    const { gitignore = true, maxDepth = Infinity } = Array.isArray(options) ? {} : options;

    const gitFiles = gitignore ? listGitFiles(directory) : null;
    if (gitFiles) {
        return scanGit(directory, gitFiles, maxDepth, out);
    }
    return walk(directory, 1, maxDepth, out);
}

module.exports = scanDirectory;
module.exports.scanDirectory = scanDirectory;
module.exports.toIgnore = toIgnore;
