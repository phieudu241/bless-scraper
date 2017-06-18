"use strict";
var express = require('express');
var fs = require('fs');
var request = require('request');
var requestp = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');
var CONSTANTS = require('./constants');
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

app.get('/convertToCsv', function (req, res) {
    //convertJsonToCsv(CONVERT_JSON_INPUT_FILE, CONVERT_CSV_OUTPUT_FILE);
    res.send('Doing....');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

async function scrapeItemIds() {
    let allItems = [];
    let items = [];
    let numOfPages = 1;

    for (var i = 1; i <= numOfPages; i++) {
        items = await getItems(1, i);
        allItems = allItems.concat(items.data);
    }

    fs.writeFileSync(CONSTANTS.ITEMS_JSON_FILE_PATH, JSON.stringify(allItems));
}

async function getItems(itemCategory, page) {
    try {
        return await requestp.post({
            url: ITEMs_URL,
            proxy: PROXY,
            form: {itemCategory: itemCategory, p: page},
            json: true
        });
    } catch (err) {
        return {data: []};
    }
};