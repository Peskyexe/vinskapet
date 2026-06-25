const db = require('../db.js')

async function insertRegion(regionName, parentRegionName) {
    const findQuery = parentRegionName
        ? 'SELECT region_id FROM regions WHERE name = $1 AND parent_id = (SELECT region_id FROM regions WHERE name = $2 LIMIT 1) LIMIT 1'
        : 'SELECT region_id FROM regions WHERE name = $1 AND parent_id IS NULL LIMIT 1';
    const findValues = parentRegionName ? [regionName, parentRegionName] : [regionName];

    const findRes = await db.query(findQuery, findValues);
    if (findRes.rows.length > 0) {
        return findRes.rows[0];
    }

    const insertQuery = parentRegionName
        ? 'INSERT INTO regions(name, parent_id) VALUES ($1, (SELECT region_id FROM regions WHERE name = $2 LIMIT 1)) RETURNING *'
        : 'INSERT INTO regions(name) VALUES ($1) RETURNING *';
    const insertValues = parentRegionName ? [regionName, parentRegionName] : [regionName];

    const insertRes = await db.query(insertQuery, insertValues);
    return insertRes.rows[0];
}

async function addWineRegionsArrayToDB(regionsArray) {
    for (const [index, region] of regionsArray.entries()) {
        let regionRow = await insertRegion(region, regionsArray[index-1]);
        if (index === regionsArray.length - 1) return regionRow.region_id;
    }
}

module.exports = {
    insertRegion,
    addWineRegionsArrayToDB
}