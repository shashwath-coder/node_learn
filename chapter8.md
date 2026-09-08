# Form handling (modern)

Collect fields from the user → send them to the server → show whether it worked.

---

## Goal

A form is a request with user data. You always decide two things:

1. **Which URL and HTTP method** receive the data
2. **What you send back** — JSON for a JavaScript client, or a redirect / HTML if the browser navigated

---

## Default flow today

The page is a React (or similar) app. Submit does **not** reload the page.

```
React UI
  onSubmit → preventDefault
  fetch(POST/PUT, JSON body)
        ↓
Express
  express.json() → req.body
  save / validate
  res.json({ success } | { error })
        ↓
React
  setResult → same screen updates
```

A real `<form>` with no JavaScript still reloads the page. In that case the server must **not** leave the user on the POST URL — redirect with **303** to a GET page. Both styles can share one API route if you need a fallback.

---

## 1. Which path handles the form

### Same path, different methods

| Method | Path | Job |
|---|---|---|
| GET | `/newsletter` | Show the form (or React route `/newsletter`) |
| POST | `/newsletter` | Process the signup |

One URL, two jobs. The **method** tells them apart.

### Separate process path

| UI | API |
|---|---|
| `/newsletter` | `POST /api/newsletter` |

Use this when many screens share one submit (home, footer, blog).

**Do not** send emails, names, or passwords with GET. GET puts fields on the query string (visible, logged, length-limited). Writes use **POST / PUT / PATCH** and the **body**.

### Name the resource, not the client

| Avoid | Prefer |
|---|---|
| `/ajax/signup` | `POST /api/newsletter` |
| `/fetch/signup` | `PUT /api/tour/:id` |

---

## 2. What you send back

### JavaScript client (`fetch`) — default

| Status | Body |
|---|---|
| 200 | `{ "success": true }` |
| 400 | `{ "error": "invalid email" }` |
| 500 | `{ "error": "could not save" }` |

React reads that and updates the UI (message, spinner, clear inputs). No new document. Refreshing the tab does **not** resubmit, because POST was `fetch`, not a browser navigation.

Do **not** return a full HTML page as the only success path for `fetch`. The client asked for data.

### Browser submitted a real `<form>` (no JS)

Do **not** render HTML on the same POST URL. Refresh would offer to send the form again. Bookmarks and Back get messy.

Redirect instead:

| Code | Meaning | After a form |
|---|---|---|
| **303** See Other | Next request must be GET | **Use this** |
| 302 Found | Often used the same way | OK; 303 is clearer |
| **301** Moved Permanently | Cached forever | **Never** — browser may skip POST next time |

```js
res.redirect(303, '/newsletter/thank-you')
```

### Where that GET goes

**Dedicated success / failure URLs**

- `/newsletter/thank-you`
- `/newsletter/error`
- Good for analytics (thank-you hits ≈ signups)
- Cost: extra routes and copy; user must leave the thank-you page

**Stay on the same screen with a message**

- Best for small widgets (footer email box)
- With `fetch`: `setState` a “Thanks” banner
- Without `fetch`: redirect back (hidden field with current URL) + one-time flash message (cookies / session)

**New location plus a message**

- Large “create” forms: after success, send them next (e.g. admin tour list)
- Still tell them it worked (banner or flash)

One URL can return JSON for `fetch` **or** 303 for a native form (`Accept` / `Content-Type` / `res.format`). Do not invent `/ajax/...` just for JavaScript.

---

## 3. How fields reach Express

### GET — search, filters (not signups / passwords)

```
/search?email=a@b.com
req.query.email
```

### POST / PUT / PATCH — writes (recommended)

Body is raw bytes until middleware parses it.

**JSON** (`fetch`, Postman raw JSON) — usual for React:

```js
app.use(express.json())
```

```js
fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Sai', email: 'a@b.com' }),
})
```

```
req.body.name
req.body.email
```

**HTML form default** (`application/x-www-form-urlencoded`):

```js
app.use(express.urlencoded({ extended: true }))
```

```html
<form method="POST" action="/api/newsletter">
  <input name="name" />
  <input name="email" type="email" />
</form>
```

```
req.body.name
req.body.email
```

You can mount **both** parsers. `?form=newsletter` on a POST is still `req.query.form`, separate from `req.body`.

Hidden fields (CSRF, return URL) are more body keys (`req.body._csrf`). Use a real CSRF story in production.

File uploads need `multipart/form-data` and extra middleware — not the JSON parser.

The **`name` attribute** (or JSON key) is what Express sees. `id` is for labels and React only.

---

## 4. Example: newsletter signup

Data is in memory (or later a DB). Restarting Node resets it.

### Server — API + optional HTML fallback

```js
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/api/newsletter', (req, res) => {
  const { name, email } = req.body
  // const csrf = req.body._csrf
  // const formTag = req.query.form

  if (!email) {
    return res.status(400).json({ error: 'email required' })
  }

  // save name + email here

  if (
    req.headers.accept?.includes('application/json') ||
    req.headers['content-type']?.includes('application/json')
  ) {
    return res.json({ success: true })
  }

  return res.redirect(303, '/newsletter/thank-you')
})

app.get('/newsletter/thank-you', (req, res) => {
  res.send('Thanks for signing up.')
})

app.listen(3000)
```

### Server — React only (simpler)

```js
app.post('/api/newsletter', (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ error: 'email required' })
  }
  console.log(req.body.name, req.body.email)
  res.json({ success: true })
})
```

### Client — React

```jsx
function Newsletter() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    const response = await fetch('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await response.json()
    setResult(data)
  } 

  return (
    <form onSubmit={onSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Register</button>
      {result && <p>{result.success ? 'Thanks!' : result.error}</p>}
    </form>
  )
}
```

- `preventDefault` — browser does not navigate
- `fetch` — the submit
- `setResult` — thank-you / error on the same page

### Optional: same POST URL, no JS

```html
<form action="http://localhost:3000/api/newsletter" method="POST">
  <input type="hidden" name="_csrf" value="..." />
  <input name="name" />
  <input name="email" type="email" required />
  <button type="submit">Register</button>
</form>
```

This is urlencoded, not JSON. The 303 GET keeps the address bar off the POST.

---

## Checklist

- [ ] Writes: `POST` / `PUT` / `PATCH` + body
- [ ] Reads / filters: `GET` + query is fine
- [ ] JSON apps: `express.json()`, `fetch` + `JSON.stringify`, `res.json`
- [ ] Native `<form>`: `express.urlencoded()`, **303** after POST, never **301**
- [ ] One resource URL — no `/ajax/` prefix
- [ ] Feedback on the same view (React state) or redirect + message
- [ ] CSRF and flash when you add cookies / sessions
- [ ] In-memory arrays reset when the server process stops







# Fetch forms and file uploads

Submit without reloading the page. The browser stays on one screen. JavaScript sends the data. The server replies with JSON. The same view shows thanks or an error.

---

## Goal

- Stop the browser from doing a full form POST
- Send fields with `fetch`
- Parse JSON (or files) on Express
- Update the UI from the response — no 303 needed for this path

The React (or HTML) page can live at `/newsletter`. Processing lives at a **separate API** URL, e.g. `POST /api/newsletter-signup`. One “experience” on screen; two URLs if you want (page vs API). `/api/...` is a normal way to mark machine endpoints. Do **not** use `/ajax/...`.

---

## 1. JSON form with `fetch`

### Client idea

1. User clicks Submit
2. `preventDefault()` — page does not navigate
3. Build a JSON object from the fields
4. `fetch` with `method: 'POST'`, `Content-Type: application/json`, `body: JSON.stringify(...)`
5. Check `response.status` (2xx = ok)
6. `response.json()` → show thank-you or error **in the same container**

### React

```jsx
function Newsletter() {
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
          <input value={name} onChange={e => setName(e.target.value)} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit">Register</button>
        </form>
      )}
    </div>
  )
}
```

No `action` / `method` on the form when `fetch` owns submit. A wrapper `div` (or React `message` state) is what you replace with “Thank you.”

### Same idea in plain HTML + `<script>`

```js
form.addEventListener('submit', evt => {
  evt.preventDefault()
  const form = evt.target
  fetch('/api/newsletter-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      _csrf: form.elements._csrf.value,
      name: form.elements.name.value,
      email: form.elements.email.value,
    }),
  })
    .then(resp => {
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error('Request failed with status ' + resp.status)
      }
      return resp.json()
    })
    .then(() => { container.innerHTML = '<b>Thank you for signing up!</b>' })
    .catch(() => { container.innerHTML = '<b>Sorry — try again.</b>' })
})
```

`.then` and `async/await` are the same trip.

---

## 2. Express: JSON body + routes

`express.json()` (not a separate `body-parser` package) must run **before** the POST route.

```js
app.use(express.json())

app.post('/api/newsletter-signup', (req, res) => {
  console.log(req.body._csrf)
  console.log(req.body.name)
  console.log(req.body.email)
  // save to DB here
  res.json({ result: 'success' })
  // on failure: res.status(400).json({ err: 'invalid email' })
})
```

| Piece | Role |
|---|---|
| `GET` the React/HTML page | Vite (`5173`) or `app.get('/newsletter')` if Express serves the page |
| `POST /api/newsletter-signup` | Process fields, return JSON |
| `req.body` | Filled by `express.json()` |

If the client might want HTML **or** JSON, look at `req.accepts(...)` or `res.format({ 'application/json': ..., 'text/html': ... })`. For a React app, JSON only is enough.

---

## 3. File uploads

JSON cannot carry a real file easily. Use **`multipart/form-data`**.

The `<input type="file">` form (or React file input) must use that encoding. Fancy drag-and-drop UIs still end up as the same encoding + `FormData`.

### Why extra middleware

`express.json()` and `express.urlencoded()` do **not** parse files. Use **multer** (common on Express). It reads the multipart body, puts text fields on `req.body`, and file info on `req.file` / `req.files`. Files land in a temp folder (or memory) — you then copy, store, or upload to cloud storage.

Local disk only does **not** scale well on multiple servers / cloud. Persist elsewhere for production.

### HTML shape

```html
<form encType="multipart/form-data">
  <input name="name" />
  <input name="email" type="email" />
  <input name="photo" type="file" accept="image/*" />
  <button type="submit">Register</button>
</form>
```

- `enctype="multipart/form-data"` — required for files
- `accept="image/*"` — optional, browser hint only
- Route can include params: `/api/vacation-photo-contest/:year/:month` → `req.params.year`

### Express + multer

```js
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

app.post(
  '/api/vacation-photo-contest/:year/:month',
  upload.single('photo'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ err: 'photo required' })
    }
    console.log('fields', req.body)       // name, email, _csrf
    console.log('file', req.file)         // size, path, originalname, ...
    res.json({ result: 'success' })
  }
)
```

`name="photo"` on the input must match `upload.single('photo')`.

`req.file` typically includes size, temp `path`, and `originalname` (filename only, not the user’s full disk path).

### `fetch` + `FormData` (do not set Content-Type)

```js
async function onSubmit(e) {
  e.preventDefault()
  const body = new FormData(e.target) // all named inputs + the file

  const response = await fetch(
    'http://localhost:3000/api/vacation-photo-contest/2026/09',
    { method: 'POST', body }  // no headers: browser sets multipart boundary
  )
  if (response.status < 200 || response.status >= 300) {
    throw new Error('Request failed with status ' + response.status)
  }
  const data = await response.json()
  setMessage(data.result === 'success' ? 'Thank you for submitting your photo!' : 'Error')
}
```

```jsx
<form onSubmit={onSubmit}>
  <input name="name" />
  <input name="email" type="email" />
  <input name="photo" type="file" accept="image/*" />
  <button type="submit">Register</button>
</form>
```

If you set `Content-Type: application/json`, the file will not upload correctly. If you set `multipart/form-data` yourself, you usually **break** the boundary. Leave `headers` off; `FormData` is enough.

Native form POST (no JS) can still 303 to a thank-you **page**. The `fetch` path should return **JSON**, then the UI swaps in “Thank you.”

### React without `<form>` (controlled file)

```js
const fd = new FormData()
fd.append('name', name)
fd.append('email', email)
fd.append('photo', fileFromInput) // e.g. e.target.files[0]
fetch(url, { method: 'POST', body: fd })
```

---

## 4. Encodings (what to remember)

| Encoding | When |
|---|---|
| `application/json` | `fetch` + `JSON.stringify` — text fields, no files |
| `application/x-www-form-urlencoded` | Default native `<form>` — text fields, no files |
| `multipart/form-data` | Any file upload — native form or `FormData` |

| Parser | Use |
|---|---|
| `express.json()` | JSON body |
| `express.urlencoded({ extended: true })` | Classic form fields |
| `multer` (or similar) | Multipart + files |

---

## Checklist

- [ ] `preventDefault` on submit when using `fetch`
- [ ] JSON writes: `express.json()` + `Content-Type: application/json` + `res.json`
- [ ] Check `response.status` before trusting `response.json()`
- [ ] Show thanks/error in the same view (state or `innerHTML`)
- [ ] Files: `FormData` + multer; do **not** set Content-Type yourself
- [ ] `name` on the file input matches `upload.single('...')`
- [ ] Fetch + files → JSON reply, not a 303 (unless you also handle a no-JS form)
- [ ] CSRF / real storage / cloud files when you leave the demo
- [ ] Next topic after this: cookies and sessions (keep client and server in sync)
