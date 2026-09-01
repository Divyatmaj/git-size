const Table = require("cli-table3");
const chalk = require("chalk");

//or we can also import dependancies like bytes or filesize to calculate this part :)
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatSize(arr){
    return arr.map((obj)=>{
        return {
            path: obj.path,
            size:formatBytes(obj.size)
        }
    });
}


function formatJSON(arr){
    return JSON.stringify(arr,null,2);
}


function mkTable(arr) {
    const table = new Table({
        head: [
            chalk.bold("No."),
            chalk.bold("File"),
            chalk.bold("Size")
        ],
        colWidths: [6, 50, 15]
    });

    arr.forEach((obj, index) => {
        table.push([
            index + 1,
            obj.path,
            colourSize(obj.size)
        ]);
    });
    return table.toString();
}

function colourSize(size) {

    const formattedSize = formatBytes(size);

    if (size < 1024 * 1024) {
        return chalk.green(formattedSize);
    }

    if (size < 10 * 1024 * 1024) {
        return chalk.yellow(formattedSize);
    }

    return chalk.red(formattedSize);
}


module.exports = {formatBytes,formatSize,formatJSON,mkTable,colourSize}