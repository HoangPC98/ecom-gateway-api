import rateLimit from "express-rate-limit";

let rateLimitTime;
const rateLimitTimeFromEnv = process.env.RATE_LIMIT_TIME_UNIT;
switch (rateLimitTimeFromEnv) {
  case 'hour':
    rateLimitTime = 60 * 60 * 1000; // 1 hour
    break;
  case 'minute':
    rateLimitTime = 60 * 1000; // 1 minute
    break;
  case 'second':
    rateLimitTime = 1000; // 1 second
    break;
  default:
    rateLimitTime = 60 * 1000; // default to 1 minute
}
const rateLimitMaxRequest = Number(process.env.RATE_LIMIT_MAX_REQUEST) || 100; // default to 100 requests
export const rateLimiter = rateLimit({
  windowMs: rateLimitTime,
  limit: rateLimitMaxRequest,
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: 'Reach the limit of requests, please try again later.',
  // store: ... , // Redis, Memcached, etc. See below.
})
