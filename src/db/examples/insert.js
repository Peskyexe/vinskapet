// Insert data
async function createUser(name, email) {
    const queryText = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *';
    const values = [name, email];

    try {
        const res = await db.query(queryText, values);
        console.log('User created:', res.rows[0]); // Returns the newly inserted user
    } catch (err) {
        console.error('Error inserting user', err.stack);
    }
}
createUser('Alice Smith', 'alice@example.com');