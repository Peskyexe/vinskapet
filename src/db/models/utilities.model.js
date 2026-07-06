const db = require('../db.js');

// `client` is the pg Client/PoolClient for the transaction these inserts run inside.
async function getRowIdFromKey(client, table, keyName, keyValue, idKeyName) {
    const findQuery = `SELECT ${idKeyName} FROM ${table} WHERE ${keyName} = $1 LIMIT 1`;
    const findValues = [keyValue];

    const findRes = await client.query(findQuery, findValues);
    if (findRes.rows.length > 0) return findRes.rows[0][idKeyName];

    const insertQuery = `INSERT INTO ${table}(${keyName}) VALUES($1) RETURNING ${idKeyName}`;
    const insertValues = [keyValue];

    const insertRes = await client.query(insertQuery, insertValues);
    return insertRes.rows[0][idKeyName];
}

async function getRowIdsFromKey(client, table, keyName, keyValues, idKeyName) {
    const rowIds = [];
    for (const keyValue of keyValues) {
        rowIds.push(await getRowIdFromKey(client, table, keyName, keyValue, idKeyName));
    }
    return rowIds;
}

async function insertSimpleJunctionTable(client, baseTableName, baseKeyName, baseKeyValues, baseIdKeyName, wineId, junctionTableName) {
    const baseIds = await getRowIdsFromKey(client, baseTableName, baseKeyName, baseKeyValues, baseIdKeyName);

    const insertQuery = `INSERT INTO ${junctionTableName} (${baseIdKeyName}, wine_id) VALUES ($1, $2)`;

    for (const baseId of baseIds) {
        const insertValues = [baseId, wineId];
        await client.query(insertQuery, insertValues);
    }
}

async function readSimpleJunctionTable(wineId, junctionTable, baseTable, idKey, keyToRead) {
    const idsQuery = `
        SELECT jt.${idKey}
        FROM ${junctionTable} AS jt
        WHERE wine_id = $1
    `;
    const idsRes = await db.query(idsQuery, [wineId]); 
    const ids = idsRes.rows.map(row => row[idKey]);

    const getValuesQueryWhereConditons = (ids) => {
        let conditons = `${idKey} = $1`;
        for (let i = 0; i < ids.length - 1; i++) {
            conditons += ` OR ${idKey} = $${i+2}`;
        }
        return conditons;
    };

    const valuesQuery = `
        SELECT bt.${keyToRead}
        FROM ${baseTable} AS bt
        WHERE ${getValuesQueryWhereConditons(ids)}
    `;
    const valuesRes = await db.query(valuesQuery, ids);
    return valuesRes.rows.map(row => row.name);
}

module.exports = {
    getRowIdFromKey,
    getRowIdsFromKey,
    insertSimpleJunctionTable,
    readSimpleJunctionTable
}
