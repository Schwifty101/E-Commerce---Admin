const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // File system errors
    if (err.code === 'ENOENT') {
        return res.status(500).json({
            success: false,
            message: 'File system error',
            error: err.message
        });
    }

    // CSV generation errors
    if (err.message.includes('Failed to generate CSV')) {
        return res.status(500).json({
            success: false,
            message: 'Export generation failed',
            error: err.message
        });
    }

    // PDF generation errors
    if (err.message.includes('Failed to generate PDF')) {
        return res.status(500).json({
            success: false,
            message: 'Export generation failed',
            error: err.message
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
};

module.exports = errorHandler; 