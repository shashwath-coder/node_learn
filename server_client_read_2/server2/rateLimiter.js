const rules=require('./rules.json')
const {takeToken}= require('./tokenBucket')
const { ordersQueue } = require('./queue')

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
                const job = await ordersQueue.add('order', {
                    body: req.body,
                    path: req.path,
                  })
                return res.status(429).json({
                  error: 'too many requests',
                  retryAfterSec: result.retryAfterSec,
                  queued: true,
                  jobId: job.id,
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
   