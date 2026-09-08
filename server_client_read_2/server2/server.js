const express = require('express')
const cors = require('cors')
const { rateLimiter } = require('./rateLimiter')

const app = express()
app.use(cors())
app.use(express.json())

let processed=0

app.post('/api/orders', rateLimiter('orders'),(req,res)=>{
    processed+=1
    console.log('ORDER ok', processed,req.body)
    res.json({ok:true,processed,port:3000})
})

app.get('/api/stats',(req,res)=>{
    res.json({processed})
})

app.listen(3000,()=> console.log('API on 3000'))