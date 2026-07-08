async function getWineFull(vmpId) {
    try {
        const res = await fetch(`/api/wine/getWineFull/${vmpId}`);
        return await res.json();
    } catch (err) {
        console.error('Error getting full wine,', err);
    }
}

async function getWineBasic(vmpId) {
    try {
        const res = await fetch(`/api/wine/getWineBasic/${vmpId}`);
        return await res.json();
    } catch (err) {
        console.error('Error getting basic wine,', err);
    }
}

async function getPageCount() {
    try {
        const res = await fetch(`/api/wine/getPageCount`);
        return await res.json();
    } catch (err) {
        console.error('Error getting page count,', err);
    }
}

async function getPage(pageNumber) {
    try {
        const res = await fetch(`/api/wine/getPage/${pageNumber}`);
        return await res.json();
    } catch (err) {
        console.error('Error getting page,', err);
    }
}

export { getWineFull, getWineBasic, getPageCount, getPage };