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
        console.errro('Error reseting DB:', err.stack)
    }
}

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
    resetDB
};