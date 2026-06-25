const scraper = require('./scraper.service')
const parser = require('./parser.service')
const jsonService = require('./json.service')

async function getRawWineData(vmpWineId) {
    await scraper.openVmpWinePage(vmpWineId);

    const { vmp_wine_data_full: selectors } = await jsonService.readDataFromJSON('./src/services/scraper-selectors');
    const data = await scraper.readSelectorsArray(selectors);

    await scraper.closeBrowser();

    return data;
}

async function getWineDataFull(vmpWineId) {
    return parser.parseRawWineData(await getRawWineData(vmpWineId));
}

module.exports = {
    getWineDataFull
}