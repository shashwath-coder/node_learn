const rules=require('./rules.json')
const {takeToken}= require('./tokenBucket')

function rateLimiter(ruleName){
    const rule = rules[ruleName]

    return async (req,res,next)=> {
        try{
            const id = req.ip || 'local'
            const key = `rl:${ruleName}:${id}`
            const result = await takeToken(key, rule.capacity, rule.refillPerSecond)

            res.set('X-RateLimit-Limit', String(result.limit))
            res.set('X-RateLimit-Remaining', String(Math.floor(result.remaining)))
            res.set('X-RateLimit-Retry-After', String(result.retryAfterSec))

            if (!result.allowed) {
                return res.status(429).json({
                  error: 'too many requests',
                  retryAfterSec: result.retryAfterSec,
                })
              }
              next()
            } 
            catch (err) {
                console.error('limiter/redis failed, allowing request', err.message)
                next() // fail open
              }
          }
        }
    module.exports = { rateLimiter }
   