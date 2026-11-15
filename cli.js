#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { Command, Option, InvalidArgumentError } = require("commander");
const { version } = require("./package.json");
const {
    scanDirectory,
    sortBySizeA,
    sortBySizeD,
    getBottomN,
    getTopN,
    calculateTotalSize,
    formatBytes,
    formatJSON,
    mkTable,
} = require("./lib");

function parseCount(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) {
        throw new InvalidArgumentError("Must be a positive whole number.");
    }
    return n;
}

// Selects files (-f / -l), then orders them (-s / -d).
// -f defaults to largest-first, -l to smallest-first, no flag to largest-first.
function selectFiles(files, options) {
    let selected = files;
    let ascending = false;

    if (options.first !== undefined) {
        selected = getTopN(files, options.first === true ? files.length : options.first);
    } else if (options.last !== undefined) {
        selected = getBottomN(files, options.last === true ? files.length : options.last);
        ascending = true;
    }

    if (options.sortAsc) ascending = true;
    if (options.sortDesc) ascending = false;

    return ascending ? sortBySizeA(selected) : sortBySizeD(selected);
}

function run(directory, options) {
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
        program.error(`error: '${directory}' is not a directory`);
    }

    // Show paths relative to the folder being scanned.
    const scanOptions = { gitignore: options.gitignore, maxDepth: options.maxDepth };
    const files = scanDirectory(directory, scanOptions).map((f) => ({ ...f, path: path.relative(directory, f.path) }));
    const result = selectFiles(files, options);

    const requested = options.first ?? options.last;
    if (typeof requested === "number" && requested > files.length) {
        console.error(`Only ${files.length} files found; showing all of them.`);
    }

    if (options.totSize) {
        const total = calculateTotalSize(result);
        if (options.json) {
            console.log(formatJSON({ totalSize: total, files: result.length }));
        } else {
            console.log(`TOTAL SIZE: ${formatBytes(total)} (${result.length} files)`);
        }
        return;
    }

    if (options.json) {
        console.log(formatJSON(result));
    } else if (result.length === 0) {
        console.error("No files found.");
    } else {
        console.log(mkTable(result));
    }
}

const program = new Command();

program
    .name("gsize")
    .description(
        "List the files in a project by size, largest first.\n" +
        "In a git repo, files excluded by .gitignore are skipped.\n" +
        ".git, .gitignore and node_modules are always skipped."
    )
    .version(version, "-v, --version")
    .argument("[path]", "folder to scan", ".")
    .option("-f, --first [n]", "show the N largest files", parseCount)
    .addOption(new Option("-l, --last [n]", "show the N smallest files").argParser(parseCount).conflicts("first"))
    .option("-s, --sortAsc", "order the output smallest first")
    .addOption(new Option("-d, --sortDesc", "order the output largest first").conflicts("sortAsc"))
    .option("-t, --totSize", "show the total size of the selected files")
    .option("-j, --json", "print the output as JSON")
    .option("--max-depth <n>", "only look N folder levels deep (1 = top level only)", parseCount)
    .option("--no-gitignore", "scan every file, ignoring .gitignore rules")
    .action(run);

if (require.main === module) {
    program.parse();
}

module.exports = { selectFiles };
