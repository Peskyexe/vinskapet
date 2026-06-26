const jsonSerivce = require('./services/json.service.js')
const vmpService = require('./services/vmp.service.js')
const wineModel = require('./db/models/wine.model.js')
const db = require('./db/db.js')

async function constructWineIdArray() {
    let wineIdArray = [];
    const pagesToSearch = 5;
    for (let i = 0; i < pagesToSearch; i++) {
        try {
            const urlToSearch = `https://www.vinmonopolet.no/search?currentPage=${i}&q=%3Arelevance`;
            const wineIds = await scraper.getWineIdsFromSearchURL(urlToSearch, i);
            wineIdArray = [...wineIdArray, ...wineIds];            
        } catch (err) {
            console.error(err);
        }
    }    
    await jsonSerivce.saveDataAsJSON(wineIdArray, 'json/wine-id-array');
    return wineIdArray;
}

async function createWineDataArray(wineIdArray) {
    let wineDataArray = [];
    for (const wineId of wineIdArray) {
        try {
            const data = await vmpService.getWineDataFull(wineId);
            wineDataArray.push(data);            
        } catch (err) {
            console.error(err.stack)
        }
    }
    await jsonSerivce.saveDataAsJSON(wineDataArray, 'json/wine-data-array');
    return wineDataArray;
}

async function testDataFetchTime() {
    const calculateFetchTime = (startTime) => {
        return Math.round(performance.now() - startTime);
    }

    const getDataFetchTime = async () => {
        try {
            const startTime = performance.now();
            const wineData = await vmpService.getWineDataFull('9929801');

            if (wineData) return calculateFetchTime(startTime); 
        } catch (err) {
            return false;
        }
    }

    const desiredSampleCount = 40;
    let achievedSampleCount = 0;
    const fetchTimes = [];

    for (let i = 0; i < desiredSampleCount; i++) {
        const fetchTime = await getDataFetchTime();

        if (fetchTime) {
            fetchTimes.push(fetchTime)
            achievedSampleCount += 1;
        }
    }

    const fastestTime = Math.min(...fetchTimes);
    const slowestTime = Math.max(...fetchTimes);
    const averageTime = Math.round(fetchTimes.reduce((a, b) => a + b) / fetchTimes.length);

    console.log('\n ------------------------ \n');

    console.log('Desired sample count:', desiredSampleCount);
    console.log('Achieved sample count:', achievedSampleCount);
    console.log('Fastest time:', fastestTime, 'ms');
    console.log('Slowest time:', slowestTime, 'ms');
    console.log('Average time:', averageTime, 'ms');

    console.log('\n ------------------------ \n');
}

async function populateDB() {
    await db.resetDB();

    let wines = await jsonSerivce.readDataFromJSON('json/wines')

    for (const wine of wines) {
        await wineModel.addWineToDB(wine);
    }

    console.log('DB populated.')
}

async function main() {
    const wineFull = await wineModel.getWineFull(897401);
    console.log(wineFull);
}

const functionName = process.argv[2];
if (functionName === "main") {
    main().catch(console.error);
} else if (functionName === "populate-db") {
    populateDB().catch(console.error);
}