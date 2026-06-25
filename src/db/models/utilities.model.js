const db = require('../db.js');

async function getRowIdFromKey(table, keyName, keyValue, idKeyName) {
    const findQuery = `SELECT ${idKeyName} FROM ${table} WHERE ${keyName} = $1 LIMIT 1`;
    const findValues = [keyValue];

    const findRes = await db.query(findQuery, findValues);
    if (findRes.rows.length > 0) return findRes.rows[0][idKeyName];

    const insertQuery = `INSERT INTO ${table}(${keyName}) VALUES($1) RETURNING ${idKeyName}`;
    const insertValues = [keyValue];

    const insertRes = await db.query(insertQuery, insertValues);
    return insertRes.rows[0][idKeyName];
}

async function getRowIdsFromKey(table, keyName, keyValues, idKeyName) {
    const rowIds = [];
    for (const keyValue of keyValues) {
        rowIds.push(await getRowIdFromKey(table, keyName, keyValue, idKeyName));
    }
    return rowIds;
}

async function insertSimpleJunctionTable(baseTableName, baseKeyName, baseKeyValues, baseIdKeyName, wineId, junctionTableName) {
    const baseIds = await getRowIdsFromKey(baseTableName, baseKeyName, baseKeyValues, baseIdKeyName);

    const insertQuery = `INSERT INTO ${junctionTableName} (${baseIdKeyName}, wine_id) VALUES ($1, $2)`;

    for (const baseId of baseIds) {
        const insertValues = [baseId, wineId];
        await db.query(insertQuery, insertValues);
    }
}

module.exports = {
    getRowIdFromKey,
    getRowIdsFromKey,
    insertSimpleJunctionTable
}
