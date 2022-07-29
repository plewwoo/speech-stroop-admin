function logger(req, res, next){
    console.log(`[Logger]: Request to ${req.method} ${req.url}`);
    next();
}

module.exports = logger;