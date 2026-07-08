const path = require('path');

module.exports = {
    publicPath: path.join(process.cwd(), "public"),
    // Kept outside public/ so it isn't git-tracked and survives `git clean`/repo operations.
    wineImagesPath: path.join(process.cwd(), "storage", "wine-images"),
    wineImagesUrlPrefix: "/wine-images"
}