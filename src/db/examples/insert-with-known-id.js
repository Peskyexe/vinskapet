// Method 1: Inserting When You Already Know the Foreign Key ID
// If you already have the parent ID from a previous workflow, pass it directly into a parameterized query as a standard variable.
const { Client } = require('pg');
const client = new Client({ /* your config */ });

async function insertWithKnownId() {
	await client.connect();

	// Parent ID is already available
	const authorId = 42; 
	const queryText = `
		INSERT INTO books (title, author_id) 
		VALUES ($1, $2) 
		RETURNING id;
	`;
	const values = ['The Hitchhiker\'s Guide to the Galaxy', authorId];

	try {
		const res = await client.query(queryText, values);
		console.log('Inserted Book ID:', res.rows[0].id);
	} catch (err) {
		console.error('Database error:', err.stack);
	} finally {
		await client.end();
	}
}

insertWithKnownId();