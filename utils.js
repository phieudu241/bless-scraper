var fs = require('fs');
module.exports = {
    convertJSONArrayToCSVFile: function (jsonArray, csvFilePath) {
        var header = false;

        for (var i = 0, j = jsonArray.length; i < j; i++) {
            var item = jsonArray[i];

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
    }
};