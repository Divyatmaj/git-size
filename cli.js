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
    filterMinSize,
    groupByDir,
    groupByType,
    formatBytes,
    parseSize,
    formatJSON,
    mkTable,
    mkGroupTable,
} = require("./lib");

function parseCount(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) {
        throw new InvalidArgumentError("Must be a positive whole number.");
    }
    return n;
}

function parseSizeArg(value) {
    const bytes = parseSize(value);
    if (Number.isNaN(bytes)) {
        throw new InvalidArgumentError("Use a size like 500, 200KB, 1.5MB or 2GB.");
    }
    return bytes;
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
    const allFiles = scanDirectory(directory, scanOptions).map((f) => ({ ...f, path: path.relative(directory, f.path) }));
    const files = options.minSize === undefined ? allFiles : filterMinSize(allFiles, options.minSize);

    // --by-dir / --by-type turn files into groups; -f/-l/-s/-d/-t then apply to the groups.
    const grouping = options.byDir ? "folders" : options.byType ? "types" : null;
    const items = options.byDir ? groupByDir(files) : options.byType ? groupByType(files) : files;
    const result = selectFiles(items, options);

    const requested = options.first ?? options.last;
    if (typeof requested === "number" && requested > items.length) {
        console.error(`Only ${items.length} ${grouping || "files"} found; showing all of them.`);
    }

    if (options.totSize) {
        const total = calculateTotalSize(result);
        const fileCount = grouping ? result.reduce((n, g) => n + g.files, 0) : result.length;
        if (options.json) {
            console.log(formatJSON({ totalSize: total, files: fileCount }));
        } else {
            console.log(`TOTAL SIZE: ${formatBytes(total)} (${fileCount} files)`);
        }
    } else if (options.json) {
        console.log(formatJSON(result));
    } else if (result.length === 0) {
        console.error("No files found.");
    } else if (grouping) {
        console.log(mkGroupTable(result, { label: options.byDir ? "Folder" : "Type" }));
    } else {
        console.log(mkTable(result));
    }

    // --max-total: fail (exit code 1) when the whole project is over the limit.
    if (options.maxTotal !== undefined) {
        const total = calculateTotalSize(allFiles);
        if (total > options.maxTotal) {
            console.error(`Project is ${formatBytes(total)}, over the ${formatBytes(options.maxTotal)} limit.`);
            process.exitCode = 1;
        }
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
    .option("--by-dir", "show the total size of each top-level folder")
    .addOption(new Option("--by-type", "show the total size of each file type (.js, .png, ...)").conflicts("byDir"))
    .option("--min-size <size>", "only include files at least this big (e.g. 500KB, 1.5MB)", parseSizeArg)
    .option("--max-total <size>", "exit with code 1 if the project is bigger than this (for CI)", parseSizeArg)
    .action(run);

if (require.main === module) {
    program.parse();
}

module.exports = { selectFiles };
