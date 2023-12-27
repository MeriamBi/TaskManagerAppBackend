export function notFoundError(req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
}

export function errorHandler(err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    })
}