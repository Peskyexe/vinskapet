// Method 3: Using a Subquery Lookup (When Knowing a Unique Property)
// If you do not have the primary ID but have a unique field belonging to the parent
// record (e.g., an author's unique name or email), look up the foreign key value
// dynamically within your INSERT statement.
async function insertWithSubquery() {
	await client.connect();

	// The insert statement embeds a SELECT block to pull the correct ID
	const queryText = `
		INSERT INTO books (title, author_id) 
		VALUES (
			$1, 
			(SELECT id FROM authors WHERE name = $2 LIMIT 1)
		) 
		RETURNING id;
	`;
	const values = ['Life, the Universe and Everything', 'Douglas Adams'];

	try {
		const res = await client.query(queryText, values);
		console.log('Inserted Book ID:', res.rows[0].id);
	} catch (err) {
		console.error('Error (Check if parent row exists):', err.stack);
	} finally {
		await client.end();
	}
}