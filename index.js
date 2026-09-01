#!/usr/bin/env node
const {program} = require('commander');
const scanDirectory = require("./Scanner");
const {sortBySizeA,sortBySizeD,getBottomN,getBiglN,calculateTotalSize} = require("./Analyzer");
const {formatBytes,formatSize,formatJSON,mkTable,colourSize} = require("./Formatter");

// console.log(scanDirectory);
const files = scanDirectory(".");

program
.description("Gets you the list of the Largest files in decending order")
.option("-j, --json", "Shows the file sizes in JSON format")
.option("-s, --sortAsc", "Sorts the file sizes in ascending order")
.option("-d, --sortDesc", "Sorts the file sizes in descending order")
.option("-l, --last [n]", "Shows the last N files")
.option("-f, --first [n]", "Shows the biggest N files")
.option("-t, --totSize", "Shows the total size of the folder excluding git and dependencies")
.action((options)=>{

    console.log("Loading...")
    let result;
    if(options.sortAsc){
        result = sortBySizeA(files)
    }else if(options.sortDesc){
        result = sortBySizeD(files)
    }else if(options.last !== undefined){
        const n = options.last === true ? files.length : Number(options.last);      
        result = getBottomN(files, n);
    }else if(options.first !== undefined){
        const n = options.first === true ? files.length : Number(options.first);
        result = getBiglN(files, n);
    }else if(options.totSize){
    result = calculateTotalSize(files);
    }
    if(options.json){
        console.log(formatJSON(files))
    }else if(options.totSize){
        result = calculateTotalSize(files);
    console.log(`TOTAL SIZE: ${formatBytes(result)}`);
    }else{
    console.log(mkTable(result));
    }
})


program.parse();