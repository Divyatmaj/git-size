//sorts in ascending order
function sortBySizeA(arr){
    return arr.sort((elem1,elem2)=> elem1.size-elem2.size);
}

//sorts in descending order
function sortBySizeD(arr){
    return arr.sort((elem1,elem2)=> elem2.size-elem1.size);
}

//get the small n files in folder
function getBottomN(arr,n){
    let arr1 = sortBySizeA(arr);
    if(n<=arr1.length){
        return arr1.slice(0,n);
    }else{
        console.error(`The Folder contains less than ${n} values,these are the smallest files`)
        return arr1;
    }
}

//get the Big n files in files
function getBiglN(arr,n){
    let arr1 = sortBySizeA(arr);
    if(n<=arr1.length){
        return arr1.slice(-n).reverse();
    }else{
        console.error(`The Folder contains less than ${n} values,these are the largest files`)
        return arr1.slice().reverse();
    }
}

function calculateTotalSize(arr){
    return arr.reduce((acc,elem)=>{return acc+elem.size;},0);
}



module.exports = {
    sortBySizeA,
    sortBySizeD,
    getBottomN,
    getBiglN,
    calculateTotalSize
};