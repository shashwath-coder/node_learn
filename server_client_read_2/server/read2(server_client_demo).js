/* const express = require('express')
const app = express()

app.use(express.json()) // needed because fetch sends JSON

const tours = [
  { id: 1, name: 'Hood River', price: 99.99 },
  { id: 2, name: 'Hood River 2', price: 150 },
  { id: 3, name: 'Hood River 3', price: 999 },
  { id: 4, name: 'Hood River 4', price: 1500 },
]

// --- RECEIVER (Express) ---
app.put('/api/tour/:id', (req, res) => {
  console.log('id from URL:', req.params.id)
  console.log('headers Content-Type:', req.headers['content-type'])
  console.log('headers Authorization:', req.headers.authorization)
  console.log('body:', req.body)

  const tour = tours.find(t => t.id === parseInt(req.params.id))
  if (!tour) return res.status(404).json({ error: 'No such tour' })

  if (req.body.name) tour.name = req.body.name
  res.json({ success: true, tour })
})

// --- SENDER lives in this page (browser fetch) ---
app.get('/', (req, res) => {
  res.send(`<!doctype html>
    <input id="tourId" type="number" value="1">

<button id="btn">Update tour 1</button>
<pre id="out"></pre>
<script>
  const token = 'abc123'  // fake login token
  const id = document.getElementById('tourId').value
  document.getElementById('btn').onclick = async () => {
      const id = document.getElementById('tourId').value
    const response = await fetch('/api/tour/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ name: 'Oregon Coast' }),
    })
    const data = await response.json()
    document.getElementById('out').textContent = JSON.stringify(data, null, 2)
  }
</script>`)
})

app.listen(3000, () => console.log('open http://localhost:3000')) */


//below is when react comes into picture




/* 

appln 1
const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')
app.use(cors())

const tours = [
  { id: 1, name: 'Hood River', price: 99.99 },
  { id: 2, name: 'Hood River 2', price: 150 },
  { id: 3, name: 'Hood River 3', price: 999 },
  { id: 4, name: 'Hood River 4', price: 1500 },
]

app.get('/api/tour/:id' , (req,res)=>{
  const tour=tours.find(t=>t.id===parseInt(req.params.id))
  if (!tour) return res.status(404).json({ error: 'No such tour' })
  res.json({ success: true, tour })
})
app.put('/api/tour/:id', (req, res) => {
    console.log('id from URL:', req.params.id)
    console.log('headers Content-Type:', req.headers['content-type'])
    console.log('headers Authorization:', req.headers.authorization)
    console.log('body:', req.body)
  
    const tour = tours.find(t => t.id === parseInt(req.params.id))
    if (!tour) return res.status(404).json({ error: 'No such tour' })
  
    if (req.body.name) tour.name = req.body.name
    res.json({ success: true, tour })
  })

app.listen(3000, () => console.log('open http://localhost:3000')) */

/* 

//appln 2

const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')
app.use(cors())

const tours = [
  { id: 1, name: 'Hood River', price: 99.99, available: true },
  { id: 2, name: 'Oregon Coast', price: 149.95, available: false },
  { id: 3, name: 'Bend', price: 199, available: true },
]

app.get('/api/tours', (req, res) => {
  let list = tours

  // ?available=true   → req.query.available === "true"  (string)
  if (req.query.available === 'true') {
    list = list.filter(t => t.available)
  }
  if (req.query.available === 'false') {
    list = list.filter(t => !t.available)
  }

  // ?minPrice=100
  if (req.query.minPrice) {
    const min = Number(req.query.minPrice)
    list = list.filter(t => t.price >= min)
  }

  res.json(list)
})

app.listen(3000, () => console.log('open http://localhost:3000')) */


/* 
//appln 3


const { MongoClient } = require('mongodb')
require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')
app.use(cors())

const client = new MongoClient(process.env.MONGODB_URI)
let signups // collection handle

app.post('/api/newsletter-signup',async (req, res) => {
  console.log(req.body._csrf)
  console.log(req.body.name)
  console.log(req.body.email)
  const { name, email } = req.body //IMPORTANT TO DESTRUCTURE THE BODY AND INITIALIZE THE VARIABLES

  await signups.insertOne({ name, email, createdAt: new Date() })
  res.json({ result: 'success' })
  // on failure: res.status(400).json({ err: 'invalid email' })
})

async function start() {
  await client.connect()
  const db = client.db() // uses the db name in the URI
  signups = db.collection('signups')

  app.listen(3000, () => console.log('listening'))
}

start()
 */



