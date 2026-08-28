import { useState } from 'react'
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

export default App