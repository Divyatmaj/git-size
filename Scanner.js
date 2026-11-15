const fs = require("node:fs");
const path = require("node:path");
const toIgnore = ['.git', '.gitignore', 'node_modules'];

function scanDirectory(directory, filesPathSize=[]) {
    let items;
    try {
        items = fs.readdirSync(directory);
    } catch (err) {
        return filesPathSize;
    }

    for (const item of items) {
        if (toIgnore.includes(item)) {
            continue;
        }

        const fullPath = path.join(directory, item);
        let stats;
        try {
            stats = fs.lstatSync(fullPath);
        } catch (err) {
            continue;
        }

        if (stats.isSymbolicLink()) {
            continue;
        }

        if (stats.isDirectory()) {
            scanDirectory(fullPath, filesPathSize);
        } else if (stats.isFile()) {
            filesPathSize.push({
                path: fullPath,
                size: stats.size
            });
        }
    }
    return filesPathSize;
}

module.exports = scanDirectory;