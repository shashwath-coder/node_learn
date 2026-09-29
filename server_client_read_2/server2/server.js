const express = require('express')
const cors = require('cors')
const { rateLimiter } = require('./rateLimiter')
const {ordersQueue,createWorker} = required('./queue')

const app = express()
app.use(cors())
app.use(express.json())

let processed=0
const PORT = Number(process.env.PORT) || 3000

let worker =null
if(PORT===3000)
{
    worker=createWorker(async(data)=>{
        processed+=1
        console.log('DRAIN ok',processed,data.body)
    })
}

app.get('/api/queue',async(req,res)=>{
    const waiting=await ordersQueue.getWaitingCount()
    const completed = await ordersQueue.getCompletedCount()
    res.json({waiting,completed,processed,port:PORT})
})

app.post('/api/drain',async(req,res)=>{
    if(!worker){
        return res.status(400).json({ error: 'drain only on port 3000' })
    }
    if (!worker.isRunning()) 
    {
        await worker.run()
    }
      await worker.resume()

    const started = Date.now()
    while ((await ordersQueue.getWaitingCount()) > 0 && 
    Date.now() - started < 10000) 
    {
    await new Promise((r) => setTimeout(r, 50))
    }

    await worker.pause()
    const waiting = await ordersQueue.getWaitingCount()
    res.json({ok:true,processed,waiting})
})
app.post('/api/orders', rateLimiter('orders'),(req,res)=>{
    processed+=1
    console.log('ORDER ok', processed,req.body,'port',PORT)
    res.json({ok:true,processed,port:PORT})
})

app.get('/api/stats',(req,res)=>{
    res.json({processed})
})

app.listen(PORT,()=> console.log('API on ', PORT))