require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'yff_wineapp',
    password: process.env.PGPASSWORD || '',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
});

pool.connect()
    .then(() => console.log('Database connection successful'))
    .catch(err => console.error('Database connection error', err));


async function resetDB() {
    try {
        const filePath = path.join(__dirname, 'scripts', 'create-script.pgsql');
        const sqlQueries = fs.readFileSync(filePath, 'utf8');

        await pool.query(sqlQueries);

        console.log('Reset DB')

    } catch (err) {
        console.error('Error reseting DB:', err.stack)
    }
}

// Runs `callback(client)` inside a single BEGIN/COMMIT transaction, rolling back on error.
// Use this whenever multiple related inserts must all succeed or all fail together.
async function withTransaction(callback) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
    resetDB,
    withTransaction
};