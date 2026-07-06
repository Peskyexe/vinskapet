const express = require("express");
const app = express();

const path = require('path');
const publicPath = path.join(process.cwd(), "public");

const { readFile } = require('fs').promises;

// Live reload
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(publicPath);

liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 500);
});

app.use(connectLivereload());
app.use(express.json());
app.use(express.static(publicPath));

app.get('/', async (request, response) => {
    response.send(await readFile(path.join(publicPath, 'testing.html'), 'utf8'));
});

const dbApiRoutes = require('./routes/db.routes.js');
app.use('/api/db',dbApiRoutes);

const wineApiRoutes = require('./routes/wine.routes.js');
app.use('/api/wine', wineApiRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on http://localhost:3000/. To stop the server, press Ctrl + C");
});