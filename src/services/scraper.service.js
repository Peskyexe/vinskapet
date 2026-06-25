const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

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


async function openPage(url) {
    if (browserLaunched === false) await launchBrowser();

    const startTime = performance.now();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    try { await page.click('.MqTnNSaV.SstETDah .btn-secondary', { timeout: 1000 }); } catch(e) {}

    logExecution('Page opened', startTime);
}

async function openVmpWinePage(vmpWineId) {
    const wineUrl = `https://www.vinmonopolet.no/p/${vmpWineId}`;
    await openPage(wineUrl)
    if (page.isJavaScriptEnabled()) await page.setJavaScriptEnabled(false);
}


async function readSelectorText(selector) {
    await page.waitForSelector(selector, { visible: true, timeout: 7000 })
    const text = await page.$eval(selector, el => el.textContent.trim())
    return text
}

async function readSelectorAttr(selector, attr) {
    await page.waitForSelector(selector, { visible: true, timeout: 7000 })
    const text = await page.$eval(selector, el => el.getAttribute(attr))
    return text
}


async function readSelectorTextAll(selector) {
    await page.waitForSelector(selector, { visible: true, timeout: 7000 })
    const texts = await page.$$eval(selector, els => els.map(el => el.textContent.trim()))
    return texts
}

async function readSelectorAttrsAll(selector, attr) {
    await page.waitForSelector(selector, { visible: true, timeout: 7000 })
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


async function readSelectorsArray(selectors) {
    const startTime = performance.now()
    const returnObject = {}

    for (const selector of selectors) {
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
                } else if (selector.type != null) {
                    value = await readSelectorAttr(selector.selector, selector.type)
                }

                if (selector.doubled === true) {
                    doubled = true;
                    value = splitDoubledString(value)[0];
                }
            }

        } catch (e) {
            console.error(e)
        }

        selectorObject = { value: value, type: selector.type, multi: !!selector.multi, doubled: !!selector.doubled }
        returnObject[selector.name] = selectorObject
    }

    logExecution('Page read', startTime)

    return returnObject;
}


// Temp function
// For testing / dev
async function getWineIdsFromSearchURL(searchUrl) {
    await openPage(searchUrl)

    const wineBasicIdSelector = '#page .KI6uSqU0 #search-results .psEpICvo .qUiEt7Bj .cesCq991';
    const winesArray = await readSelectorTextAll(wineBasicIdSelector)

    await closeBrowser()
    return winesArray
}

module.exports = {
    launchBrowser,
    closeBrowser,
    openPage,
    openVmpWinePage,
    readSelectorsArray,
    getWineIdsFromSearchURL,
}
