const express = require('express')
const { engine } = require('express-handlebars')

const app = express()

const port = process.env.PORT || 3000

const fortunes = [
  "Conquer your fears or they will conquer you.",
  "Rivers need springs.",
  "Do not fear what you don't know.",
  "You will have a pleasant surprise.",
  "Whenever possible, keep it simple.",
]

// configure Handlebars view engine
app.engine('handlebars', engine({
  defaultLayout: 'main',
}))

app.set('views', __dirname)

app.set('view engine', 'handlebars')

app.get('/', (req, res) => res.render('home'))

// app.get('/about', (req, res) => res.render('about'))

app.get('/about', (req, res) => {
  const randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)]
  res.render('about', { fortune: randomFortune })
})

// custom 404 page
app.use((req, res) => {
  res.status(404)
  res.render('404')
})

// custom 500 page
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500)
  res.render('500')
})

app.listen(port, () => console.log(
  `Express started on http://localhost:${port}; ` +
  `press Ctrl-C to terminate.`))

// Views under handlebars aren’t simply a complicated way to deliver static HTML (though they can certainly do that as well). The real power of views is that they can contain dynamic information.