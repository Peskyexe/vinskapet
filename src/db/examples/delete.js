// Deleting data
async function deleteUser(id) {
    const queryText = 'DELETE FROM users WHERE id = $1';
    await db.query(queryText, [id]);
}