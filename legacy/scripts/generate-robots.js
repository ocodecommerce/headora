const fs = require("fs");
const path = require("path"); // Ensure path is properly required

function generateRobots() {
    const robotsContent = `
    # https://www.robotstxt.org/robotstxt.html
    User-agent: *
    Disallow: /
    `;
    // Use path.resolve with __dirname to correctly locate the public directory
    fs.writeFileSync(path.resolve(__dirname, "../public/robots.txt"), robotsContent);
}

generateRobots();
