// * * * * * * * * * * * * * * * * * * * * * * * * * * * //
// Export the data to CSV
// Written by Kristi Potter
// 8/25/2022
// * * * * * * * * * * * * * * * * * * * * * * * * * * * //

// Export data to CSV
var objectToCSVRow = function(dataObject) {
    var dataArray = new Array;
    for (var o in dataObject) {

        var innerValue = dataObject[o]===null?'':dataObject[o].toString();
        var result = innerValue.replace(/"/g, '""');
        result = '"' + result + '"';
        dataArray.push(result);
    }
    return dataArray.join(',') + '\r\n';
}
var exportToCSV = function(arrayOfObjects) {

    if (!arrayOfObjects.length) {
        return;
    }

    var csvContent = "data:text/csv;charset=utf-8,";

    // headers
    csvContent += objectToCSVRow(Object.keys(arrayOfObjects[0]));

    arrayOfObjects.forEach(function(item){
        csvContent += objectToCSVRow(item);
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prwData.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - //
