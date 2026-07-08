async function populateDB() {
    try {
        await fetch(`/api/db/populate`, {
            method: 'POST'
        });
        console.log('DB populated.'); 
    } catch (err) {
        console.error('Error populating the DB,', err);
    }
}

async function clearDB() {
    try {
        await fetch(`/api/db/reset`, {
            method: 'POST'
        });
        console.log('DB cleared.');
    } catch (err) {
        console.error('Error clearing the DB,', err);
    }
}

export { populateDB, clearDB };