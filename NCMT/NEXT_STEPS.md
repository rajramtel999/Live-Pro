# Next Steps — Team_SShaRK Transit Platform

## ✅ What's Already Done

All MVP features are implemented and TypeScript compiles with zero errors:

- Home page with route search form
- Route results page (fare, ETA, availability, stop list, map)
- Driver/Contributor portal (submit routes, fares, corrections, vehicle status)
- Admin dashboard (review, edit, approve/reject submissions)
- Live vehicle tracking page (real-time map via Firebase Realtime Database)
- Vehicle simulator API (`/api/simulator`)
- Seed API (`/api/seed`)
- All business logic: fuzzy stop matching, fare fallback, ETA calculation, route ranking

---

## 🔧 Step 1: Set Up Firebase (Required Before Running)

You need a Firebase project to run the app. Follow these steps:

### 1a. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. `ncmt-transit`)
3. Disable Google Analytics (optional) → **Create project**

### 1b. Enable Firestore
1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in test mode** → select a region → **Enable**

### 1c. Enable Realtime Database
1. In Firebase Console → **Realtime Database** → **Create database**
2. Choose **Start in test mode** → select a region → **Done**

### 1d. Get Firebase Config
1. In Firebase Console → **Project Settings** (gear icon) → **Your apps**
2. Click **Add app** → Web (`</>`) → Register app
3. Copy the `firebaseConfig` values

### 1e. Create `.env.local`
Create a file named `.env.local` in the project root (copy from `.env.template`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
SEED_API_KEY=any-random-string-you-choose
```

> ⚠️ Never commit `.env.local` to Git — it's already in `.gitignore`

---

## 🚀 Step 2: Run the App

```bash
npm run dev
```

Open http://localhost:3000

---

## 🌱 Step 3: Seed the Database (First Time Only)

Run this in PowerShell to populate Firestore with demo data:

```powershell
$headers = @{ 'x-seed-key' = 'your-SEED_API_KEY-value' }
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/seed -Headers $headers
```

Or with curl:
```bash
curl -X POST http://localhost:3000/api/seed -H "x-seed-key: your-SEED_API_KEY-value"
```

This inserts:
- 2 routes (Ratna Park→Bouddhanath Micro, Kalanki→Lagankhel Tempo)
- 8 stops with GPS coordinates
- 2 fares
- 2 vehicles
- 1 sample pending submission

---

## 🎬 Step 4: Demo the Full Flow

### Demo Part 1 — User/Commuter Flow
1. Open http://localhost:3000
2. Enter **From:** `Ratna Park` → **To:** `Bouddhanath`
3. Click **Find Route**
4. Show the route card: fare (NPR 30), ETA, availability, stop list, map

### Demo Part 2 — Driver/Contributor Flow
1. Open http://localhost:3000/driver
2. Submit a fare update (e.g. Putalisadak → Bouddhanath, NPR 20)
3. Show it saves as "pending" status

### Demo Part 3 — Admin Flow
1. Open http://localhost:3000/admin
2. See the pending submission
3. Click it, review the JSON payload
4. Click **Approve** → it writes to Firestore `fares` collection

### Demo Part 4 — Live Tracking
1. Open http://localhost:3000/live-tracking
2. Select a route from the dropdown
3. Start the vehicle simulator from the Driver page (or via API)
4. Watch the vehicle marker move on the map in real-time

---

## 🔄 Step 5: Start Vehicle Simulator (for Live Tracking Demo)

Call the simulator API to start a vehicle moving:

```powershell
$body = @{ action = "start"; routeId = "route-ratna-bouddha"; vehicleId = "vehicle-micro-1" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/simulator -Body $body -ContentType "application/json"
```

Or with curl:
```bash
curl -X POST http://localhost:3000/api/simulator \
  -H "Content-Type: application/json" \
  -d '{"action":"start","routeId":"route-ratna-bouddha","vehicleId":"vehicle-micro-1"}'
```

Then open http://localhost:3000/live-tracking to see the vehicle moving.

To stop:
```bash
curl -X POST http://localhost:3000/api/simulator \
  -H "Content-Type: application/json" \
  -d '{"action":"stopAll","routeId":"route-ratna-bouddha","vehicleId":"vehicle-micro-1"}'
```

---

## 🔥 Step 6: Update Firestore Security Rules (Before Sharing)

In Firebase Console → Firestore → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /routes/{id}      { allow read: if true; allow write: if false; }
    match /stops/{id}       { allow read: if true; allow write: if false; }
    match /routeStops/{id}  { allow read: if true; allow write: if false; }
    match /fares/{id}       { allow read: if true; allow write: if false; }
    match /vehicles/{id}    { allow read: if true; allow write: if true; }
    match /submissions/{id} { allow read: if true; allow create: if true; allow update: if true; allow delete: if false; }
  }
}
```

For Realtime Database → Rules:
```json
{ "rules": { ".read": "true", ".write": "false" } }
```

---

## 📋 Optional Improvements (Post-MVP)

These are not required for the demo but would improve the product:

| Feature | Description |
|---------|-------------|
| Wire Firestore into route search | `routeSearchService.ts` currently uses static sample data. Connect it to `firestoreQueries.ts` to use live Firestore data |
| Add more seed routes | Add Koteshwor, Chabahil, Baneshwor, Thamel stops to cover more demo searches |
| Add stop autocomplete | Show dropdown suggestions as user types in the search form |
| Add vehicle simulator button in Driver page | Let drivers start/stop simulation from the UI instead of API calls |
| Add authentication | Protect admin page with Firebase Auth |
| Deploy to Vercel | Run `vercel deploy` — add env vars in Vercel dashboard |

---

## 🧪 Test Searches That Work Right Now

| From | To | Expected |
|------|----|----------|
| Ratna Park | Bouddhanath | Route found, NPR 30 fare |
| Ratna Park | Bouddha | Route found (fuzzy match) |
| Kalanki | Lagankhel | Route found, NPR 28 fare |
| Kalanki | Tripureshwor | Route found (partial route) |
| Koteshwor | Thamel | No route found (not in seed data) |
