# BFHL — SRM Full Stack Challenge

## Structure
```
bfhl/
├── api/          ← Express REST API
│   ├── index.js
│   ├── package.json
│   └── vercel.json
└── frontend/
    └── index.html  ← Single-page frontend
```

## ⚡ Quick Deploy (15 minutes)

### Step 1 — Edit your credentials in `api/index.js`
Open `api/index.js` and update lines 7–9:
```js
const USER_ID = "yourname_ddmmyyyy";   // e.g. "johndoe_17091999"
const EMAIL_ID = "your.email@college.edu";
const COLLEGE_ROLL = "21CS1001";
```

### Step 2 — Deploy API to Render (free, easy)
1. Push this repo to GitHub (public)
2. Go to https://render.com → New → Web Service
3. Connect your repo, select the `api/` folder as root directory
4. Build command: `npm install`
5. Start command: `node index.js`
6. Deploy → copy the URL e.g. `https://bfhl-api.onrender.com`

### OR Deploy API to Vercel
```bash
cd api
npm i -g vercel
vercel --prod
```

### Step 3 — Deploy Frontend to Netlify (drag & drop)
1. Go to https://app.netlify.com/drop
2. Drag the `frontend/` folder onto the page
3. Done — you get a URL instantly

### Step 4 — Test
```bash
curl -X POST https://your-api-url/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","A->C","B->D","hello"]}'
```

## API Reference

**POST /bfhl**
```json
{ "data": ["A->B", "A->C", "B->D"] }
```

Returns full hierarchy analysis with invalid entries, duplicates, and summary.

**GET /bfhl** → `{ "operation_code": 1 }`
