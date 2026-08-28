// const http = require('http')
// const port = process.env.PORT || 3000

// const server = http.createServer((req, res) => {
// //   res.writeHead(200, { 'Content-Type': 'text/plain' })
//   res.end('Hello world!')
// })

// server.listen(port, () => console.log(`server started on port ${port}; ` +
//   'press Ctrl-C to terminate....'))


/* const http = require('http')
const port = process.env.PORT || 3000
const server=http.createServer((req,res)=>{
    const path=req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase()
    switch(path)
    {
        case '':
        case '':
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('Homepage')
      break
    case '/about':
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('About')
      break
    default:
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      break
    }
})

server.listen(port,()=>console.log(`server started on port ${port};`)) */

/* 


const http = require('http')
const fs = require('fs')
const port = process.env.PORT || 3000

function serveStaticFile(res, path, contentType, responseCode = 200) {
  fs.readFile(path, (err, data) => {
    if(err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      return res.end('500 - Internal Error')
    }
    res.writeHead(responseCode, { 'Content-Type': contentType })
    res.end(data)
  })
}

const server = http.createServer((req,res) => {
  // normalize url by removing querystring, optional trailing slash, and
  // making lowercase
  const path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase()
  switch(path) {
    case '':
      serveStaticFile(res, 'D:/Anacond, C++ and Others (Data)/home.html', 'text/html')
      break
    case '/about':
      serveStaticFile(res, 'D:/Anacond, C++ and Others (Data)/about.html', 'text/html')
      break
    case '/img/photo.jpeg':
      serveStaticFile(res, 'C:/Users/Admin/OneDrive/Pictures/photo.jpg', 'image/jpeg')
      break
    default:
      serveStaticFile(res, 'D:/Anacond, C++ and Others (Data)/error404.html', 'text/html', 404)
      break
  }
})

server.listen(port, () => console.log(`server started on port ${port}; ` +
  'press Ctrl-C to terminate....')) */


const express = require('express')

const app = express()

const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: false })) //to add info in body in postman in x-www-form-urlencoded
/* 
app.get('/', (req, res) => {
  //res.type('text/plain')
  res.send('Meadowlark Travel');
})

app.get('/about', (req, res) => {
  res.type('text/plain')
  res.send('About Meadowlark Travel')
})
// custom 500 page
app.use((err, req, res, next) => {
  console.error(err.message)
  res.type('text/plain')
  res.status(500)
  res.send('500 - Server Error')
})
app.get('/headers', (req, res) => {
  res.type('text/plain')
  const headers = Object.entries(req.headers)  //Object.entries() takes that object and converts it into an array of [key, value] pairs:
    .map(([key, value]) => `${key}: ${value}`)
  res.send(headers.join('\n'))
})
app.post('/process-contact', (req, res) => {
  try {
    // here's where we would try to save contact to database or other
    // persistence mechanism...for now, we'll just simulate an error
    if(req.body.simulateError==='true') throw new Error("error saving contact!")
    console.log(`contact from ${req.body.name} <${req.body.email}>`)                    
    res.format({                                                                //res.format() = "Look at what response format the client accepts, and execute the appropriate response handler."
      'text/html': () => res.redirect(303, '/thank-you'),
      'application/json': () => res.json({ success: true }),
    })
  } catch(err) {
    // here's where we would handle any persistence failures
    console.error(`error processing contact from ${req.body.name} ` +
      `<${req.body.email}>`)
    res.format({
      'text/html': () =>  res.redirect(303, '/contact-error'),
      'application/json': () => res.status(500).json({
        error: 'error saving contact information' }),
    })
  }
})

app.get('/thank-you',(req,res)=>{
  res.send('Your contact saved. Thanks!')
})
app.get('/contact-error',(req,res)=>{
  res.send('Sorry. Your contact couldnt be saved')
})
app.listen(port, () => console.log(
  `Express started on http://localhost:${port}; ` +
  `press Ctrl-C to terminate.`))
 */


const tours = [
  { id: 0, name: 'Hood River', price: 99.99 },
  { id: 1, name: 'Oregon Coast', price: 149.95 },
]

app.put('/api/tour/:id', (req, res) => {
  const p = tours.find(p => p.id === parseInt(req.params.id))
  if(!p) return res.status(404).json({ error: 'No such tour exists' })
  if(req.body.name) p.name = req.body.name
  if(req.body.price) p.price = req.body.price
  res.json({ success: true })
})

app.delete('/api/tour/:id', (req, res) => {
  const idx = tours.findIndex(tour => tour.id === parseInt(req.params.id))
  if(idx < 0) return res.json({ error: 'No such tour exists.' })
  tours.splice(idx, 1)
  res.json({ success: true })
})