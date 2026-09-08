//appln 1
/* import { useState } from 'react'
function App() {
    const [id, setId] = useState(1)
    const [result, setResult] = useState(null)
    const [name_val, setName] = useState('')
    async function getTour() {
      const response=await fetch('http://localhost:3000/api/tour/' +id,{
        method:'GET'
      })
      const data = await response.json()
      setResult(data)
    }
    async function updateTour() {
      const response = await fetch('http://localhost:3000/api/tour/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer abc123',
        },
        body: JSON.stringify({ name: name_val }),
      })
      const data = await response.json()
      setResult(data)
      // setState(data) instead of textContent
    }
    return (
      <>
        <input value={id} onChange={e => setId(e.target.value)} />
        <input value={name_val} onChange={e=> setName(e.target.value)} />
        <button onClick={updateTour}>Update</button>
        <button onClick={getTour}>Get</button>
        <pre>{result && JSON.stringify(result,null,2)}</pre>
      </>
    )
  }

export default App */



/* 
import { useState } from 'react'

function App() {
  const [availableOnly, setAvailableOnly] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [tours, setTours] = useState([])

  async function loadTours() {
    const params = new URLSearchParams()
    if (availableOnly) params.set('available', 'true')
    if (minPrice) params.set('minPrice', minPrice)

    const qs = params.toString() // "" or "available=true&minPrice=150"
    const url =
      'http://localhost:3000/api/tours' + (qs ? '?' + qs : '')

    const response = await fetch(url) // GET, no body
    const data = await response.json()
    setTours(data)
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={e => setAvailableOnly(e.target.checked)}
        />
        Available only
      </label>
      <input
        type="number"
        placeholder="min price"
        value={minPrice}
        onChange={e => setMinPrice(e.target.value)}
      />
      <button onClick={loadTours}>Search</button>
      <pre>{JSON.stringify(tours, null, 2)}</pre>
    </>
  )
}

export default App
 */
/* 

import { useState } from 'react'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3000/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _csrf: 'CSRF token goes here',
          name,
          email,
        }),
      })
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Request failed with status ' + response.status)
      }
      const data = await response.json()
      setMessage(data.result === 'success' ? 'Thank you for signing up!' : data.err)
    } catch (err) {
      setMessage('Sorry, we had a problem. Try again.')
    }
  }

  return (
    <div>
      {message ? (
        <b>{message}</b>
      ) : (
        <form onSubmit={onSubmit}>
          <label>Name
          <input value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <button type="submit">Register</button>
        </form>
      )}
    </div>
  )
}

export default App */


import { useState } from 'react'

function App() {
async function burst() {
  const calls = Array.from({ length: 20 }, (_, i) =>
    fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n: i }),
    }).then(async r => ({ status: r.status, body: await r.json() }))
  )
  const results = await Promise.all(calls)
  const ok = results.filter(r => r.status === 200).length
  const blocked = results.filter(r => r.status === 429).length
  console.log({ ok, blocked, results })
}

return(
    <div>
      <button onClick={burst}>Send Request</button>
    </div>
  )
}
export default App