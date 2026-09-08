//ioredis / Redis rule: after the number 1, the next 1 value is a key. Everything after that is ARGV.

const Redis=require('ioredis')
const redis= new Redis(process.env.REDIS_URL||'redis://127.0.0.1:6379')

//“Get fields tokens and last from this key.” ->local data=redis.call('HMGET',key,'tokens','last')
const LUA =`
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local now = tonumber(ARGV[2])

local data = redis.call('HMGET', key, 'tokens', 'last')
local tokens = tonumber(data[1])
local last = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last = now
end
if (now - last) >= 1000 then
  tokens = capacity
  last = now
end
local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

redis.call('HSET', key, 'tokens', tokens, 'last', last)
redis.call('EXPIRE', key, 120)
local retryMs = 0

if allowed == 0 then
  retryMs = math.max(0, 1000 - (now - last))
end

return {allowed,tokens,retryMs}
`

async function takeToken(key,capacity,refillPerSecond){

    const now=Date.now()
    const [allowed,remaining,retryMs]=await redis.eval(
        LUA,
        1,  // “the next 1 argument is a KEY”
        key, // KEYS[1]  e.g. "rl:orders:127.0.0.1"
        capacity,// ARGV[1]  e.g. 5
        refillPerSecond,// ARGV[2]  e.g. 5
        now// ARGV[3]  Date.now()

    )

    return{
        allowed:allowed===1,
        remaining:Number(remaining),
        retryAfterSec:Math.max(0,Math.ceil(Number(retryMs)/1000)),
        limit:capacity,
    }
}

module.exports={redis,takeToken}