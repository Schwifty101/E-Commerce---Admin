const fs = require('fs');
const path = require('path');

// Create temp directory for exports
const initializeFileSystem = () => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    return tempDir;
};

module.exports = {
    initializeFileSystem,
    TEMP_DIR: path.join(__dirname, '../temp')
}; 