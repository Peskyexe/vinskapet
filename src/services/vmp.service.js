const scraper = require('./scraper.service')
const parser = require('./parser.service')

async function getWineDataFull(vmpId) {
    const rawData = await scraper.getRawWineData(vmpId)
    if (rawData === 'Rate limited') return rawData;
    return await parser.parseRawWineData(rawData);
}

module.exports = {
    getWineDataFull
}