import { populateDB, clearDB } from './db-api.js';
import { getPage, getPageCount } from './wine-api.js';
import { loadWineBasic } from './wine-loading.js';

let currentPage = 1;
let pageCount = 0;
let dbViewWinesContainer;

async function initializeDBView() {
    // Initialize variables
    pageCount = await getPageCount();
    dbViewWinesContainer = document.getElementById('db-view--wines-container');

    // Adding event listeners to all the buttons
    const refreshButton = document.getElementById('db-view--refresh-button');
    refreshButton.addEventListener('click', refreshDBView);

    const populateButton = document.getElementById('db-view--populate-button');
    populateButton.addEventListener('click', populateDBView);

    const clearButton = document.getElementById('db-view--clear-button');
    clearButton.addEventListener('click', clearDBView);

    // Load the first page
    await loadPage(currentPage);
}

async function refreshDBView() {
    await loadPage(currentPage);
}

async function populateDBView() {
    await populateDB();
    await refreshDBView();
}

async function clearDBView() {
    await clearDB();
    await refreshDBView();
}

async function loadPage(pageNumber) {
    const wines = await getPage(pageNumber);

    dbViewWinesContainer.innerHTML = '';

    for (const wine of wines) {
        await loadWineBasic(wine, dbViewWinesContainer)
    }

    currentPage = pageNumber;
}

export { initializeDBView, refreshDBView }