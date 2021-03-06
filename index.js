"use strict";
var express = require('express');
var fs = require('fs');
var request = require('request');
var requestp = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');
var CONSTANTS = require('./constants');
var UTILS = require('./utils');
var app = express();
var PROXY = '';
//var PROXY = 'http://192.168.78.7:8888';

app.set('port', (process.env.PORT || 5000));

app.use(express.static('public'));

app.get('/test', function (req, res) {
    res.send('Hello2');
});

app.get('/scrapeItems', function (req, res) {
    scrapeItemIds();
    res.send('Doing....');
});

app.get('/scrapeItemDetails', function (req, res) {
    scrapeItemDetails();
    res.send('Doing....');
});

app.get('/merge', function (req, res) {
    mergeItemAndDetails(CONSTANTS.ITEMS_JSON_FILE_PATH, CONSTANTS.ITEM_DETAILS_JSON_FILE_PATH);
    res.send('Doing....');
});

app.get('/convertToCsv', function (req, res) {
    convertJsonToCsv(CONSTANTS.ITEMS_JSON_FILE_PATH, CONSTANTS.ITEMS_CSV_FILE_PATH);
    res.send('Doing....');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

function convertJsonToCsv(jsonFilePath, csvFilePath) {
    var itemsStr = fs.readFileSync(jsonFilePath).toString();
    var jsonItems = [];
    if (itemsStr != undefined && itemsStr.trim() != '') {
        jsonItems = JSON.parse(itemsStr);
        let headers = ['item_id', 'ico', 'iGrade', 'iName', 'itemLv', 'itemWearLv', 'iCategory', 'available_for', 'attributes', 'blue_info', 'red_info', 'white_info', 'gold_coin', 'silver_coin', 'bronze_coin', 'type', 'level', 'wearable_job', 'wearable_race', 'maximum_usage_count', 'possible_number', 'action_bar_text', 'acquisition_path'];
        UTILS.convertJSONArrayToCSVFile(jsonItems, csvFilePath, headers);
    }

    console.log('Finished!');
}

function mergeItemAndDetails(itemJsonFilePath, itemDetailsJsonFilePath) {
    let itemsStr = fs.readFileSync(itemJsonFilePath).toString();
    let itemDetailsStr = fs.readFileSync(itemDetailsJsonFilePath).toString();
    let jsonItems = JSON.parse(itemsStr);
    let jsonDetails = JSON.parse(itemDetailsStr);

    jsonItems.forEach(function (item) {
        let itemDetail = jsonDetails[item.item_id];
        if (itemDetail) {
            // Copy all props of item detail to item
            for (var prop in itemDetail) {
                item[prop] = itemDetail[prop];
            }
        } else {
            console.log(item.item_id + ': Item not found');
        }
    });

    // Save full info items
    UTILS.writeJSONToFile(jsonItems, itemJsonFilePath);

    console.log('Finished!');
}

async function scrapeItemIds() {
    let allItems = [];
    let itemsPerCategory = [];
    let items = [];
    let numOfPages = 1;

    // Create json file if it doesn't exist
    fs.appendFileSync(CONSTANTS.ITEMS_JSON_FILE_PATH, '');

    for (let catIndex = 1; catIndex <= CONSTANTS.CATEGORY_NUMBER; catIndex++) {
        numOfPages = 1;
        items = [];
        itemsPerCategory = [];
        for (let i = 1; i <= numOfPages; i++) {
            items = await getItems(catIndex, i);

            if (items instanceof Object) {
                if (items.total && numOfPages == 1) {
                    numOfPages = Math.round(items.total / CONSTANTS.ITEMS_PER_PAGE);
                }

                allItems = allItems.concat(items.data);
                itemsPerCategory = itemsPerCategory.concat(items.data);
                // Write log
                fs.appendFileSync(CONSTANTS.LOG_FILE_PATH, 'Category:' + catIndex + ', page:' + i + ', items:' + items.data.length + '\r\n');

                // output in console
                console.log('Category:' + catIndex + ', page:' + i + ', items:' + items.data.length);
            }
        }

        // Append items of current category to JSON file
        var itemsStr = fs.readFileSync(CONSTANTS.ITEMS_JSON_FILE_PATH).toString();
        var jsonItems = [];
        if (itemsStr != undefined && itemsStr.trim() != '') {
            jsonItems = JSON.parse(itemsStr);
            jsonItems.push(itemsPerCategory);
            fs.writeFileSync(CONSTANTS.ITEMS_JSON_FILE_PATH, JSON.stringify(jsonItems));
        }
    }

    // Write JSON file
    fs.writeFileSync(CONSTANTS.ITEMS_JSON_FILE_PATH, JSON.stringify(allItems));
    // Write CSV file
    UTILS.convertJSONArrayToCSVFile(allItems, CONSTANTS.ITEMS_CSV_FILE_PATH);
}

async function getItem(itemId, index) {
    let item = undefined,
        html = await fetchItemWebPage(itemId);

    if (html) {
        item = {item_id: itemId};
        let $ = cheerio.load(html);

        // Left panel
        let $leftPanel = $('.view_box_inner');
        item.available_for = $($leftPanel.find('table:nth-of-type(1) td')[1]).text().trim();
        item.attributes = [];
        $leftPanel.find('table:nth-of-type(2) td').each(function (index, el) {
            item.attributes.push($(el).text().trim());
        });

        // blue, red, white info
        $leftPanel.find('table:nth-of-type(3) td').each(function (index, el) {
            if (index == 0) item.blue_info = $(el).text().trim();
            if (index == 1) item.red_info = $(el).text().trim();
            if (index == 2) item.white_info = $(el).text().trim();
        });

        // coins
        $leftPanel.find('.coinbox p').each(function (index, el) {
            if (index == 0) item.gold_coin = $(el).text().trim();
            if (index == 1) item.silver_coin = $(el).text().trim();
            if (index == 2) item.bronze_coin = $(el).text().trim();
        });

        // Right panel
        let $rightPanel = $('.listbox');
        let rightProperties = [
           'type',
           'level',
           'wearable_job',
           'wearable_race',
           'maximum_usage_count',
           'possible_number',
           'action_bar_text',
           'acquisition_path'
        ];

        $rightPanel.find('table td').each(function (index, el) {
            item[rightProperties[index]] = $(el).text().trim();
        });
    }

    return item;
}

async function getItems(itemCategory, page) {
    try {
        return await requestp.post({
            url: CONSTANTS.ITEMs_URL,
            proxy: PROXY,
            form: {itemCategory: itemCategory, p: page},
            json: true
        });
    } catch (err) {
        // Write error log
        fs.appendFileSync(CONSTANTS.LOG_FILE_PATH, 'Category:' + itemCategory + ', page:' + page + ', error:' + err);
        return {data: []};
    }
}

async function fetchItemWebPage(itemId) {
    try {
        return await requestp.get({
            url: CONSTANTS.ITEM_DETAIL_URL + itemId,
            proxy: PROXY
        });
    } catch (err) {
        // Write error log
        fs.appendFileSync(CONSTANTS.LOG_FILE_PATH, 'Item ID:' + itemId + ', error:' + err);
        return undefined;
    }
}

async function scrapeItemDetails() {
    let itemIds = UTILS.getIdsFromFile(CONSTANTS.ITEMS_IDS_FILE_PATH);

    for (var index = 0; index < itemIds.length; index++) {
        let itemId = itemIds[index];
        let item = await getItem(itemId, index);

        // write item to JSON file
        if (item) {
            UTILS.writeJSON(itemId, item, CONSTANTS.ITEM_DETAILS_JSON_FILE_PATH);
            UTILS.writeLog(CONSTANTS.ITEM_DETAILS_LOG_FILE_PATH, itemId + ': OK');
            console.log('OK: ' + itemId);
        } else {
            UTILS.writeLog(CONSTANTS.ITEM_DETAILS_LOG_FILE_PATH, itemId + ': Error');
            console.log('Error: ' + itemId);
        }
    }
}