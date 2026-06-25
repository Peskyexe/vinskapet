const fs = require('fs/promises');

async function saveDataAsJSON(data, filename) {
    try {
        const jsonData = JSON.stringify(data, null, 4);
        await fs.writeFile(`${filename}.json`, jsonData)
    } catch (err) {
        console.error('Failed to write JSON:', err.stack)
    }
}

async function readDataFromJSON(filename) {
    try {
        const data = await fs.readFile(`${filename}.json`, 'utf8');
        return JSON.parse(data);       
    } catch (err) {
        console.error('Failed to read JSON:', err.stack)
    }
}

module.exports = {
    saveDataAsJSON,
    readDataFromJSON
}