const fs = require('fs');
const path = require('path');
const { TEMP_DIR } = require('./fileSystem');

const cleanup = () => {
    console.log('Cleaning up temporary files...');
    
    try {
        if (fs.existsSync(TEMP_DIR)) {
            fs.readdir(TEMP_DIR, (err, files) => {
                if (err) {
                    console.error('Error reading temp directory:', err);
                    return;
                }
                
                for (const file of files) {
                    fs.unlink(path.join(TEMP_DIR, file), err => {
                        if (err) {
                            console.error(`Error deleting file ${file}:`, err);
                        } else {
                            console.log(`Successfully deleted ${file}`);
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
};

const setupCleanup = () => {
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('Received SIGINT. Performing cleanup...');
        cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('Received SIGTERM. Performing cleanup...');
        cleanup();
        process.exit(0);
    });

    // Cleanup on uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        cleanup();
        process.exit(1);
    });
};

module.exports = {
    cleanup,
    setupCleanup
}; 