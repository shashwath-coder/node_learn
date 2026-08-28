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

app.listen(3000, () => console.log('open http://localhost:3000'))