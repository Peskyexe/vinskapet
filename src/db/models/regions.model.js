const db = require('../db.js')

async function insertRegion(client, regionName, parentRegionName) {
    const findQuery = parentRegionName
        ? 'SELECT region_id FROM regions WHERE name = $1 AND parent_id = (SELECT region_id FROM regions WHERE name = $2 LIMIT 1) LIMIT 1'
        : 'SELECT region_id FROM regions WHERE name = $1 AND parent_id IS NULL LIMIT 1';
    const findValues = parentRegionName ? [regionName, parentRegionName] : [regionName];

    const findRes = await client.query(findQuery, findValues);
    if (findRes.rows.length > 0) {
        return findRes.rows[0];
    }

    const insertQuery = parentRegionName
        ? 'INSERT INTO regions(name, parent_id) VALUES ($1, (SELECT region_id FROM regions WHERE name = $2 LIMIT 1)) RETURNING *'
        : 'INSERT INTO regions(name) VALUES ($1) RETURNING *';
    const insertValues = parentRegionName ? [regionName, parentRegionName] : [regionName];

    const insertRes = await client.query(insertQuery, insertValues);
    return insertRes.rows[0];
}

async function insertRegionArray(client, regionsArray) {
    for (const [index, region] of regionsArray.entries()) {
        let regionRow = await insertRegion(client, region, regionsArray[index-1]);
        if (index === regionsArray.length - 1) return regionRow.region_id;
    }
}

async function getFullRegionPath(regionId) {
    try {
        const regionArray = [];

        const parentQuery = 'SELECT parent_id FROM regions WHERE region_id = $1 LIMIT 1';
        const nameQuery = 'SELECT name FROM regions WHERE region_id = $1 LIMIT 1';

        let currentId = regionId;

        let loopCount = 0;
        while (true) {
            const nameRes = await db.query(nameQuery, [currentId]);
            const name = nameRes.rows[0].name;

            regionArray.push(name);

            const parentRes = await db.query(parentQuery, [currentId])
            currentId = parentRes.rows[0].parent_id;

            if (!currentId) return regionArray.toReversed().join(', ');

            loopCount++;
        }        
    } catch (err) {
        console.error('Error getting full region path:', err.stack)
    }
}

module.exports = {
    insertRegion,
    insertRegionArray,
    getFullRegionPath
}