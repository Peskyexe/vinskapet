// Updating data
async function updateUserEmail(id, newEmail) {
    const queryText = 'UPDATE users SET email = $1 WHERE id = $2';
    await db.query(queryText, [newEmail, id]); // Parameters must map to an array in order
}