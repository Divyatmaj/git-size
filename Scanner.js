const fs = require("node:fs");
const path = require("node:path");
const toIgnore=['.git','gitignore','node_modules']

function scanDirectory(directory, filesPathSize=[]) {
    const items = fs.readdirSync(directory);
    for (const item of items) {
        if (toIgnore.includes(item)) {
            continue;
        }

        const fullPath = path.join(directory, item); 
        const stats = fs.statSync(fullPath);

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