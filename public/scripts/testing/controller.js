import { initializeDBView } from "./db-view.js";

await initializeApp();

async function initializeApp() {
    await Promise.all([
        initializeDBView()
    ]);
}

