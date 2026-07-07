const jsonSerivce = require('./json.service.js');

const aromaKeywords = {
    røde_bær: ['røde bær', 'røde og mørke bær', 'tyttebær', 'bringebær', 'jordbær', 'villjordbær', 'kirsebær', 'rips', 'multer'],
    mørke_bær: ['mørke bær', 'bjørnebær', 'solbær', 'blåbær', 'blokkebær'],
    frukt: ['frukt', 'frukter', 'fruktig'],
    eple: ['eple', 'epler'],
    krydder: ['krydder', 'krydret', 'fatkrydder', 'koriander', 'balsam'],
    sitrus: ['sitrus'],
    fersk: ['fersk'],
    floral: ['floral', 'florale', 'fioler', 'rosenblad'],
    mineral: ['mineral', 'mineralsk', 'mineraler']
}

const tasteKeywords = {
    røde_bær: ['røde bær', 'røde og mørke bær', 'tyttebær', 'bringebær', 'jordbær', 'villjordbær', 'kirsebær', 'rips', 'multer'],
    mørke_bær: ['mørke bær', 'bjørnebær', 'solbær', 'blåbær', 'blokkebær'],
    balansert: ['balansert', 'balanse'],
    fyldig: ['fyldig', 'god fylde'],
    tørr: ['tørr'],
    frisk: ['frisk', 'friskt'],
    sitrus: ['sitrus'],
    lang: ['lang', 'lengde'],
    konsentrert: ['konsentrert', 'konsentrasjon'],
    mineralsk: ['mineralsk', 'mineral', 'mineraler'],
    floralsk: ['floral', 'blomster'],
    fruktig: ['frukt', 'fruktdreven']
}

// For aroma- and taste-text parsing
function loopKeywordsThroughString(keywordArray, string) {
    for (const keyword of keywordArray) {
        if (string.toLowerCase().includes(keyword)) {
            return keyword;
        }
    }
    return null;
}

// For aroma- and taste-text parsing
function parseStringBasedOnKeywords(string, keywords) {
    let matches = [];

    for (const key in keywords) {
        const match = loopKeywordsThroughString(keywords[key], string);

        if (match) {
            matches.push(key);
        }
    }

    return matches;
}

// Extracts the vintage year of the wine.
// Raw string example: "*2025* Vi tar forbehold om at varen som leveres kan ha en annen årgang/etikett enn oppgitt"
function parseVintageYear(rawYearString) {
    const matches = rawYearString.match(/\d{4}/);
    return matches ? parseInt(matches[0]) : null;
}

// Region here means any area, like a country, state, city, etc.
// Creates a structured array from a string. index n-1 is the parent region of the region at index n, if n=0 it doesn't have a parent region.
// Raw string example: "USA,  California,  Napa Valley"
function parseRegion(rawRegionString) {
    return rawRegionString.split(',  ')
}

// Extracts the volume of a bottle of wine.
// Raw string example: "75 cl"
function parseVolume(rawVolumeString) {
    const matches = rawVolumeString.match(/\d+/);
    return matches ? parseInt(matches[0]) : null;
}

// Extracts the price to buy a bottle of wine from vinmonopolet.
// Raw string example: "Kr 998,00"
function parsePrice(rawPriceString) {
    const matches = rawPriceString.match(/[^a-z][ \d,]+/g);
    return matches ? parseFloat(matches[0].trim().replace(',', '.').replace(' ', '')) : null;
}

// Extracts and creates an array of objects that contain information about the properties of a wine. e.g. how sweet or fulfilling the wine is.
// Raw string example: "Fylde, 9 av 12"
function parseProperties(rawPropertyStringsArray) {
    let parsedProperties = [];

    for (const rawString of rawPropertyStringsArray) {
        const splitResult = rawString.split(', ');
        const matchResult = splitResult[1].match(/\d+/);

        const name = splitResult[0];
        const value = parseInt(matchResult[0]);

        parsedProperties.push({ name, value });            
    }

    return parsedProperties;
}

function parseGrapes(rawStringsArray) {
    let parsedGrapes = [];

    for (const rawString of rawStringsArray) {
        const nameMatch = rawString.match(/[a-z A-Z]+/);
        const percentageMatch = rawString.match(/\d+/);

        const name = nameMatch ? nameMatch[0].trim() : null;
        const percentage = percentageMatch ? parseInt(percentageMatch[0]) : null;

        parsedGrapes.push({ name, percentage });
    }

    return parsedGrapes;
}

function parseContents(rawContentsArray) {
    let parsedContents = [];

    for (const rawContentObject of rawContentsArray) {
        const name = rawContentObject.label;

        const valueString = rawContentObject.value;

        const amountMatch = valueString.match(/[\d,]+/);
        const amount = amountMatch ? parseFloat(amountMatch[0].trim().replace(',', '.')) : null;

        const unitMatch = valueString.match(/\d\s?([^\d]+)$/);
        const unit = unitMatch ? unitMatch[1] : null;

        const lessThanMatch = valueString.match(/Under/);
        const lessThan = lessThanMatch ? true : false;

        let contentObject = {
            name,
            amount,
            unit,
            less_than: lessThan
        };

        parsedContents.push(contentObject);
    }

    return parsedContents;    
}


async function parseRawWineData(rawData) {
    let wineData = {
        vmp_id: null,
        name: null,
        vintage_year: null,
        wine_type: null,
        producer_name: null,
        region_array: [],
        color_name: null,
        volume_cl: null,
        price_kr: null,
        purchase_category_name: null,
        wine_descriptions_object: {},
        wine_foodtypes_array: [],
        wine_properties_array: [],
        wine_grapes_array: [],
        wine_contents_array: [],
        wine_aromas_array: [],
        wine_tastes_array: []
    };

    try {
        const infoMap = Object.fromEntries(
            rawData.infolist.value.map(item => [item.label, item.value])
        );

        wineData.vmp_id = parseInt(infoMap['Varenummer']);

        wineData.name = rawData.name.value;

        if (infoMap['Årgang']) wineData.vintage_year = parseVintageYear(infoMap['Årgang']);
        
        wineData.wine_type = rawData.wine_type.value;

        wineData.producer_name = infoMap['Produsent'];

        wineData.region_array = parseRegion(infoMap['Land, distrikt']);

        wineData.color_name = infoMap['Farge'].replace(/\.$/, '');

        wineData.volume_cl = parseVolume(rawData.volume_cl.value);

        wineData.price_kr = parsePrice(rawData.price.value);

        wineData.purchase_category_name = infoMap['Utvalg'];

        wineData.wine_descriptions_object = {
            aroma_text: infoMap['Lukt'],
            taste_text: infoMap['Smak']
        }

        if (rawData.foodtypes) wineData.wine_foodtypes_array = rawData.foodtypes.value;

        wineData.wine_properties_array = parseProperties(rawData.properties.value);

        wineData.wine_grapes_array = parseGrapes(rawData.grapes.value);

        wineData.wine_contents_array = parseContents(rawData.contents.value);

        wineData.wine_aromas_array = parseStringBasedOnKeywords(infoMap['Lukt'], aromaKeywords);

        wineData.wine_tastes_array = parseStringBasedOnKeywords(infoMap['Smak'], tasteKeywords);

        return wineData;        
    } catch (err) {
        await jsonSerivce.saveDataAsJSON(rawData, 'wine-error-data');

        const errors = await jsonSerivce.readDataFromJSON('errors');
        errors.push({desc: 'Data parsing error', vmpId: wineData.vmp_id, url: rawData.url, error: err, error_stack: err.stack});
        await jsonSerivce.saveDataAsJSON(errors, 'errors');

        console.error(err)
        return wineData;
    }
}

exports.parseRawWineData = (rawData) => parseRawWineData(rawData)