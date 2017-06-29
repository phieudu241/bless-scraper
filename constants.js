module.exports = Object.freeze({
    // scrape config
    ITEMs_URL: "http://bless.gamemeca.com/item/getItem.php",
    ITEM_DETAIL_URL: "http://bless.gamemeca.com/item/?item_id=",

    // input/ output config
    ITEMS_JSON_FILE_PATH: "./items.json",
    ITEMS_CSV_FILE_PATH: "./items.csv",
    ITEMS_IDS_FILE_PATH: "./itemIds.txt",
    LOG_FILE_PATH: "./log.txt",

    CATEGORY_NUMBER: 20,
    ITEMS_PER_PAGE: 20
});