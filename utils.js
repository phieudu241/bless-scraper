var fs = require('fs');
module.exports = {
    convertJSONArrayToCSVFile: function (jsonArray, csvFilePath) {
        var header = false;

        for (var i = 0, j = jsonArray.length; i < j; i++) {
            var item = jsonArray[i];
            console.log(i);

            if (!header) {
                var headerRow = [];
                for (var property in item) {
                    headerRow.push(property);
                }

                // Mark file as UTF8-BOM
                fs.writeFileSync(csvFilePath, "\ufeff");
                // Append header
                fs.appendFileSync(csvFilePath, headerRow.join(',') + "\r\n");

                header = true;
            }

            var dataRow = [];
            for (var property in item) {
                if (item[property] instanceof Array) {
                    dataRow.push('"' + item[property].join(',') + '"');
                } else if (item[property] instanceof Object) {
                    var detailInfo = [];
                    for (var detailProp in item[property]) {
                        detailInfo.push(detailProp + '-' + item[property][detailProp]);
                    }
                    dataRow.push('"' + detailInfo.join(',') + '"');
                } else {
                    if (typeof(item[property]) == 'string') {
                        dataRow.push('"' + item[property] + '"');
                    } else {
                        dataRow.push(item[property]);
                    }
                }
            }

            fs.appendFileSync(csvFilePath, dataRow.join(',') + "\r\n");
        }
    },

    writeJSON: function (itemId, item, outputFilePath) {
        // Create json file if it doesn't exist
        fs.appendFileSync(outputFilePath, '');

        let itemsStr = fs.readFileSync(outputFilePath).toString();
        let items = {};

        if (itemsStr != undefined && itemsStr.trim() != '') {
            items = JSON.parse(itemsStr);
        }

        items[itemId] = item;

        fs.writeFileSync(outputFilePath, JSON.stringify(items));
    },

    getIdsFromFile: function (filePath) {
        var ids = fs.readFileSync(filePath).toString().split('\r\n');
        return ids;
    },
    
    writeLog: function (logFilePath, content) {
        fs.appendFileSync(logFilePath, content + "\r\n");
    }
};