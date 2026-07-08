const express = require("express");
const app = express();

const path = require('path');
const paths = require('./config/paths.js');

const { readFile } = require('fs').promises;

// Live reload
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(paths.publicPath);

liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 500);
});

app.use(connectLivereload());
app.use(express.json());
app.use(express.static(paths.publicPath));
app.use(paths.wineImagesUrlPrefix, express.static(paths.wineImagesPath));

// HTML / page routing
app.get("/", (request, response) => {
    response.redirect("/desktop-testing");
});

app.get('/desktop-testing', async (request, response) => {
    response.send(await readFile(path.join(paths.publicPath, 'desktop-testing.html'), 'utf8'));
});

app.get('/mobile-testing', async (request, response) => {
    response.send(await readFile(path.join(paths.publicPath, 'mobile-testing.html'), 'utf8'));
});

// API routing
const dbApiRoutes = require('./routes/db.routes.js');
app.use('/api/db',dbApiRoutes);

const wineApiRoutes = require('./routes/wine.routes.js');
app.use('/api/wine', wineApiRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on http://localhost:3000/. To stop the server, press Ctrl + C");
});