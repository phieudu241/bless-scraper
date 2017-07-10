module.exports = Object.freeze({
    LOG_FILE_PATH: "./log.txt",

    // scrape config
    ITEMs_URL: "http://bless.gamemeca.com/item/getItem.php",
    ITEM_DETAIL_URL: "http://bless.gamemeca.com/item/?item_id=",

    // input/ output config
    ITEMS_JSON_FILE_PATH: "./items.json",
    ITEMS_CSV_FILE_PATH: "./items.csv",
    ITEMS_IDS_FILE_PATH: "./itemIds.txt",

    // scrape item details
    ITEM_DETAILS_JSON_FILE_PATH: "./itemDetails.json",
    ITEM_DETAILS_LOG_FILE_PATH: "./itemDetails.log",


    CATEGORY_NUMBER: 20,
    ITEMS_PER_PAGE: 20
});