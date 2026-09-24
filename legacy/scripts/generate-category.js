const fs = require("fs");
const path = require("path"); // Ensure path is properly required

function generateCategory() {
    const categoryGeneration = 

    
    // Use path.resolve with __dirname to correctly locate the public directory
    fs.writeFileSync(path.resolve(__dirname, "../cacheM/product"), categoryGeneration);
}

generateCategory();
