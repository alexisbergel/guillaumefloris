const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	limit: 20, // Limit each IP to 20 requests per `window`
    message:'Too many attempts',
	standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
});

module.exports = limiter;