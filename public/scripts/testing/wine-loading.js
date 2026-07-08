const parser = new DOMParser();

const wineBasicModifications = [
    {
        selector: '.wine-type',
        type: 'innerHTML',
        dataKey: 'type'
    },
    {
        selector: '.wine-name',
        type: 'innerHTML',
        dataKey: 'name'
    },
    {
        selector: '.wine-region',
        type: 'innerHTML',
        dataKey: 'fullRegion'
    },
    {
        selector: '.wine-producer',
        type: 'innerHTML',
        dataKey: 'producer'
    },
    {
        selector: '.wine-price',
        type: 'innerHTML',
        dataKey: 'formattedPrice'
    }
]

async function loadWineBasic(wineData, container) {
    try {
        wineData.formattedPrice = formatPrice(wineData.price);

        // Fetching base HTML
        const res = await fetch('components/wine-basic.html');
        const htmlText = await res.text();

        // Parse text into temporary DOM object
        const tempDoc = parser.parseFromString(htmlText, 'text/html');

        // Alter the HTML according to the predefined modifications
        for (const modification of wineBasicModifications) {
            const elemenet = tempDoc.querySelector(modification.selector);

            if (modification.type === 'innerHTML') elemenet.innerHTML = wineData[modification.dataKey];
        }

        container.appendChild(tempDoc.body.firstChild);
    } catch (err) {
        console.error('Failed to load basic wine,', err)
    }
}

function formatPrice(rawPrice) {
    let formattedPrice = rawPrice.toFixed(2);
    formattedPrice = formattedPrice.replace('.', ',')

    return `kr ${formattedPrice}`;
}

export { loadWineBasic };