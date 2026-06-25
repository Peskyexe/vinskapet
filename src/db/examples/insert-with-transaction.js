// Method 2: Inserting Both Parent and Child Rows in One Transaction
// When you need to create a new parent record and use its newly generated ID
// immediately for a child record, use a PostgreSQL Transaction (BEGIN / COMMIT) along
// with the RETURNING id clause.
async function insertWithTransaction() {
	await client.connect();

	try {
		// Start transaction to maintain referential integrity
		await client.query('BEGIN');

		// 1. Insert into parent table (authors)
		const authorQuery = `
			INSERT INTO authors (name) 
			VALUES ($1) 
			RETURNING id;
		`;
		const authorRes = await client.query(authorQuery, ['Douglas Adams']);
		const newAuthorId = authorRes.rows[0].id; // Extract the new ID

		// 2. Insert into child table (books) using the retrieved ID
		const bookQuery = `
			INSERT INTO books (title, author_id) 
			VALUES ($1, $2) 
			RETURNING id;
		`;
		const bookRes = await client.query(bookQuery, ['The Restaurant at the End of the Universe', newAuthorId]);

		// Commit transaction if both succeeded
		await client.query('COMMIT');
		console.log('Successfully inserted book ID:', bookRes.rows[0].id);
	} catch (err) {
		// Rollback changes if any statement fails
		await client.query('ROLLBACK');
		console.error('Transaction rolled back due to error:', err);
	} finally {
		await client.end();
	}
}