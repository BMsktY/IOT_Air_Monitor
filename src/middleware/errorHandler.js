const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);

    const status = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal server';

    res.status(status).json({
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
