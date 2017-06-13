"use strict";
var express = require('express');
var fs = require('fs');
var request = require('request');
var requestp = require('request-promise');
var cheerio = require('cheerio');
var _ = require('lodash');
var CONSTANTS = require('./constants');
var app = express();

var ITEMs_URL = "http://bless.gamemeca.com/item/getItem.php";

//var PROXY = '';
var PROXY = 'http://192.168.78.7:8888';

app.set('port', (process.env.PORT || 5000));

app.use(express.static('public'));

app.get('/test', function (req, res) {
    res.send('Hello');
});

app.get('/scrapeItemIds', function (req, res) {
    scrapeItemIds(res);
    res.send('Doing....');
});

app.get('/convertToCsv', function (req, res) {
    //convertJsonToCsv(CONVERT_JSON_INPUT_FILE, CONVERT_CSV_OUTPUT_FILE);
    res.send('Doing....');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

async function scrapeItemIds(res) {
    // request.post({
    //     url: ITEMs_URL,
    //     proxy: PROXY,
    //     form: {itemCategory: 20, p: 1}
    // }, function (error, response, html) {
    //     if (!error) {
    //         res.send(JSON.parse(response.body));
    //     } else {
    //         res.sendStatus(500);
    //     }
    // });
    var body = getItemIds(1);
    console.log('hi');
    console.log(body);
}

async function getItemIds(page) {
    return await requestp.post({
        url: ITEMs_URL,
        proxy: PROXY,
        form: {itemCategory: 20, p: page}
    });
};