const scraper = require('./scraper.service.js');
const parser = require('./parser.service.js');
const jsonService = require('./json.service.js');

async function openWinePage(vmpId) {
    const wineUrl = `https://www.vinmonopolet.no/p/${vmpId}`;

    await scraper.openPage(wineUrl);
    
    await scraper.disableJS();
}

async function getRawWineData(vmpId) {
    await openWinePage(vmpId);

    const { vmp_wine_data_full: selectors } = await jsonService.readDataFromJSON('scraper-selectors');
    const data = await scraper.readSelectorsArray(selectors);

    // Error handling incase no wine properties where found. Can happen if a wine doesn't have any foodtypes.
    if ( data !== 'Rate limited' && !data.properties.value[0]) {
        delete data.foodtypes;
        const { vmp_wine_data_properties_backup: propertiesSelector } = await jsonService.readDataFromJSON('scraper-selectors');
        data.properties = await scraper.readSelector(propertiesSelector)
    }

    await scraper.closeBrowser();

    return data;
}

async function getWineFull(vmpId) {
    const rawData = await getRawWineData(vmpId)
    if (rawData === 'Rate limited') return 'Rate limited';
    return await parser.parseRawWineData(rawData);
}

// Temp function
// For testing / dev
async function getWineIdsFromSearchURL(searchUrl) {
    await openPage(searchUrl)

    const wineBasicIdSelector = '#page .KI6uSqU0 #search-results .psEpICvo .qUiEt7Bj .cesCq991';
    const winesArray = await scraper.readSelectorTextAll(wineBasicIdSelector)

    await scraper.closeBrowser()
    return winesArray
}

module.exports = {
    getWineFull,
    getWineIdsFromSearchURL
}