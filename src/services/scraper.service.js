const puppeteer = require('puppeteer-extra');
const jsonService = require('./json.service.js');
const fs = require('fs/promises');
const paths = require('../config/paths.js');
const path = require('path');


const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

let browser;
let page;
let browserLaunched = false;


function calculateExecutionTime(startTime, endTime) {
    const executionTime = Math.round(endTime - startTime);
    return executionTime;
}

function logExecution(baseString, startTime) {
    console.log(baseString + ', took:', calculateExecutionTime(startTime, performance.now()), 'ms');
}


async function launchBrowser() {
    const startTime = performance.now();

    browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});

    // Use a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');

    // Make automation harder to detect before any navigation
    await page.evaluateOnNewDocument(() => {
        try { Object.defineProperty(navigator, 'webdriver', { get: () => false }); } catch (e) {}
        try { window.chrome = { runtime: {} } } catch (e) {}
        try { Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] }) } catch (e) {}
        try { Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3] }) } catch (e) {}
    });

    // Stops browser from loading things like css and images
    await page.setRequestInterception(true)
    page.on('request', (req) => {
        const type = req.resourceType()
        if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
            req.abort()
        } else {
            req.continue()
        }
    });

    // Enables caching
    await page.setCacheEnabled(true);

    if (browserLaunched === false) browserLaunched = true;

    logExecution('Browser launched', startTime);
}

function closeBrowser() {
    browser.close()
    if (browserLaunched === true) browserLaunched = false;
    console.log('Browser Closed.')
}

let currentUrl = '';
async function openPage(url) {
    if (browserLaunched === false) await launchBrowser();

    const startTime = performance.now();

    currentUrl = url;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    try { await page.click('.MqTnNSaV.SstETDah .btn-secondary', { timeout: 1000 }); } catch(e) {}

    logExecution('Page opened', startTime);
}

async function disableJS() {
    if (page.isJavaScriptEnabled()) await page.setJavaScriptEnabled(false);
}

async function enableJS() {
    if (!page.isJavaScriptEnabled()) await page.setJavaScriptEnabled(true);
}

const selectorArgs = { visible: true, timeout: 5000 }

async function readSelectorText(selector) {
    await page.waitForSelector(selector, selectorArgs)
    const text = await page.$eval(selector, el => el.textContent.trim())
    return text
}

async function readSelectorAttr(selector, attr) {
    await page.waitForSelector(selector, selectorArgs)
    const text = await page.$eval(selector, el => el.getAttribute(attr))
    return text
}

// Maps the image size we want to the width descriptor Vinmonopolet uses in its srcset.
const imageSizes = { basic: '300w', full: '900w' };

const extensionsByContentType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
};

// Turns a srcset string like "a.jpg 300w, b.jpg 900w" into [{ url: 'a.jpg', width: '300w' }, ...]
function parseSrcset(srcset) {
    return srcset.split(',').map(entry => {
        const [url, width] = entry.trim().split(/\s+/);
        return { url, width };
    });
}

function extractVmpIdFromUrl(url) {
    const match = url.match(/\/p\/(\d+)/);
    return match ? match[1] : null;
}

async function downloadImage(url, attempts = 2) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const response = await fetch(url);
            const contentType = response.headers.get('content-type') || '';

            if (!response.ok || !contentType.startsWith('image/')) {
                throw new Error(`Bad image response (status ${response.status}, content-type ${contentType})`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            const extension = extensionsByContentType[contentType] || path.extname(new URL(url).pathname) || '.jpg';

            return { buffer, extension };
        } catch (err) {
            if (attempt === attempts) throw err;
        }
    }
}

// Downloads the basic/full sized images referenced by an <img srcset> and saves them to disk as
// {wineImagesPath}/{vmpId}/{basic|full}{ext}. Returns the URL paths to store on the wine record.
async function readSelectorImage(selector) {
    await page.waitForSelector(selector, selectorArgs)
    const srcset = await page.$eval(selector, el => el.getAttribute('srcset'))

    const vmpId = extractVmpIdFromUrl(currentUrl);
    if (!vmpId) throw new Error(`Could not extract vmp_id from url '${currentUrl}'`);

    const entries = parseSrcset(srcset);
    const sizeNames = Object.keys(imageSizes);

    const downloads = await Promise.all(sizeNames.map(async (sizeName) => {
        const widthToken = imageSizes[sizeName];
        const entry = entries.find(e => e.width === widthToken);
        if (!entry) throw new Error(`No srcset entry found for width '${widthToken}'`);

        const { buffer, extension } = await downloadImage(entry.url);
        return { sizeName, buffer, extension };
    }));

    const wineImageDir = path.join(paths.wineImagesPath, vmpId);
    await fs.mkdir(wineImageDir, { recursive: true });

    const imagePaths = {};
    for (const { sizeName, buffer, extension } of downloads) {
        const fileName = `${sizeName}${extension}`;
        await fs.writeFile(path.join(wineImageDir, fileName), buffer);
        imagePaths[sizeName] = `${paths.wineImagesUrlPrefix}/${vmpId}/${fileName}`;
    }

    return imagePaths;
}


async function readSelectorTextAll(selector) {
    await page.waitForSelector(selector, selectorArgs)
    const texts = await page.$$eval(selector, els => els.map(el => el.textContent.trim()))
    return texts
}

async function readSelectorAttrsAll(selector, attr) {
    await page.waitForSelector(selector, selectorArgs)
    const attrs = await page.$$eval(selector, (els, a) => els.map(el => el.getAttribute(a)), attr)
    return attrs
}


// Splits a string like "Produsent Freemark Abbey Winery" into 
// {
//     label: "Produsent", 
//     value: "Freemark Abbey Winery"
// }
function splitDoubledString(input) {
    const matches = input.split(/(?=[A-Z]|[*]|[0-9])/);

    // Puts the label of the doubled string into index 0
    let result = [matches.shift().trim()];

    // Puts the value of the doubled string into index 1
    if (matches.length > 1) {
        result.push(matches.join("").trim());
    } else {
        result.push(matches[0].trim());
    }

    const labeledResult = {
        label: result[0].trim(),
        value: result[1].trim()
    }

    return [labeledResult, result];
}

// Does the same as the function above, just takes in an array and returns an array.
function splitDoubledStringsArray(inputsArray) {
    let results = [];

    for (const string of inputsArray) {
        results.push(splitDoubledString(string)[1])
    }

    let labeledResults = [];

    for (const pair of results) {
        labeledResults.push({
                label: pair[0],
                value: pair[1]
            }
        )
    }

    return labeledResults;
}


async function readSelector(selector) {
    let value;
    let type;
    let multi;
    let doubled;

    try {
        type = selector.type;

        if (selector.multi === true) {
            multi = true;

            if (selector.type === 'text') {
                value = await readSelectorTextAll(selector.selector)
            } else if (selector.type != null) {
                value = await readSelectorAttrsAll(selector.selector, selector.type)
            }

            if (selector.doubled === true) {
                doubled = true;
                value = splitDoubledStringsArray(value);
            }
        }
        
        else if (selector.multi == null) {
            if (selector.type === 'text') {
                value = await readSelectorText(selector.selector)
            } else if (selector.type === 'image') {
                value = await readSelectorImage(selector.selector)
            } else if (selector.type != null) {
                value = await readSelectorAttr(selector.selector, selector.type)
            }

            if (selector.doubled === true) {
                doubled = true;
                value = splitDoubledString(value)[0];
            }
        }

    } catch (err) {
        try {
            const { rate_limited_check: selector } = await jsonService.readDataFromJSON('scraper-selectors');
            const rateLimited = await readSelectorText(selector.selector)
            
            console.error('Being rate limited, canceling all scraping')
            if (rateLimited) return 'Rate limited';
        } catch (err) {
            console.error('Rate limit check failed,', err.stack)
        }

        const errors = await jsonService.readDataFromJSON('errors');
        errors.push({desc: 'Page reading error', url: currentUrl, error: err, error_stack: err.stack, selector: selector});
        await jsonService.saveDataAsJSON(errors, 'errors');

        console.error(`Error reading selector '${selector.name}',`, err.stack)
    }

    return { value: value, type: selector.type, multi: !!selector.multi, doubled: !!selector.doubled }
}


async function readSelectorsArray(selectors) {
    const startTime = performance.now()

    const data = {}
    data['url'] = currentUrl;

    for (const selector of selectors) {
        const result = await readSelector(selector);

        if (result === 'Rate limited') return 'Rate limited';

        data[selector.name] = result;
    }

    logExecution('Page read', startTime)

    return data;
}

module.exports = {
    launchBrowser,
    closeBrowser,
    openPage,
    disableJS,
    enableJS,
    readSelectorsArray
}
