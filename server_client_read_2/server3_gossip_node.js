const express = require('express')
const cors = require('cors')

const PORT = Number(process.env.PORT)
const ID = String(PORT) // member ID = port, easy to read
const PEERS = (process.env.PEERS || '')
  .split(',')
  .map(Number)
  .filter(Boolean)

const GOSSIP_MS = 1000
const FANOUT = 2          // random peers per round — not all-to-all
const FAIL_MS = 5000      // heartbeat not increased → suspect
const CONFIRMATIONS = 2   // independent sources before "down"

const app = express()
app.use(cors())
app.use(express.json())

// local membership table
const members = new Map() // id -> { heartbeat, lastSeen, status, suspects: Set }

function upsertMe() {
  const me = members.get(ID) || { heartbeat: 0, lastSeen: Date.now(), status: 'alive', suspects: new Set() }
  me.heartbeat += 1
  me.lastSeen = Date.now()
  me.status = 'alive'
  members.set(ID, me)
}

function merge(incoming, fromId) {
  for (const row of incoming) {
    if (row.id === ID) continue // never let others overwrite me

    const cur = members.get(row.id)
    if (!cur) {
      members.set(row.id, {
        heartbeat: row.heartbeat,
        lastSeen: Date.now(),
        status: 'alive',
        suspects: new Set(),
      })
      continue
    }

    // only a HIGHER heartbeat is new evidence of life
    if (row.heartbeat > cur.heartbeat) {
      cur.heartbeat = row.heartbeat
      cur.lastSeen = Date.now()
      cur.status = 'alive'
      cur.suspects.clear()
    }
  }

  // sender is also independently saying "I think X is stale"
  if (fromId) {
    for (const row of incoming) {
      if (row.status === 'suspect' || row.status === 'down') {
        const cur = members.get(row.id)
        if (cur && cur.status !== 'alive') {
          cur.suspects.add(fromId)
        }
      }
    }
  }
}

function sweep() {
  const now = Date.now()
  for (const [id, m] of members) {
    if (id === ID) continue
    if (now - m.lastSeen > FAIL_MS) {
      m.status = 'suspect'
      // I am one independent source
      m.suspects.add(ID)
      if (m.suspects.size >= CONFIRMATIONS) {
        m.status = 'down'
      }
    }
  }
}

function pickRandomPeers() {
  const copy = [...PEERS]
  const chosen = []
  while (copy.length && chosen.length < FANOUT) {
    const i = Math.floor(Math.random() * copy.length)
    chosen.push(copy.splice(i, 1)[0])
  }
  return chosen
}

function snapshot() {
  return [...members.entries()].map(([id, m]) => ({
    id,
    heartbeat: m.heartbeat,
    lastSeen: m.lastSeen,
    status: m.status,
    suspects: [...m.suspects],
  }))
}

app.post('/gossip', (req, res) => {
  merge(req.body.members, req.body.from)
  sweep()
  res.json({ ok: true })
})

app.get('/membership', (req, res) => {
  sweep()
  res.json({ me: ID, members: snapshot() })
})

// kill this node from the React UI to watch gossip detect it
app.post('/crash', () => process.exit(0))

app.listen(PORT, () => {
  upsertMe()
  for (const p of PEERS) {
    if (!members.has(String(p))) {
      members.set(String(p), {
        heartbeat: 0,
        lastSeen: Date.now(),
        status: 'alive',
        suspects: new Set(),
      })
    }
  }
  console.log(`node ${ID} up`)
})

setInterval(async () => {
  upsertMe()
  sweep()
  const body = { from: ID, members: snapshot() }
  for (const peer of pickRandomPeers()) {
    try {
      await fetch(`http://localhost:${peer}/gossip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      // peer did not accept TCP — that is NOT proof it is down by itself
    }
  }
}, GOSSIP_MS)