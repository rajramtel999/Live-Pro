# Team_SShaRK Transit Platform MVP

This project is a Next.js-based smart transit MVP for Kathmandu Valley microbus and tempo routes.

## Seed Data Setup

The app includes a protected seed endpoint that inserts demo data into Firestore:
- 2 approved routes
- route stops
- fares
- vehicles
- one pending submission

### 1. Configure environment variables

Create a `.env.local` file in the project root with these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
SEED_API_KEY=replace_with_strong_seed_key
```

`NEXT_PUBLIC_FIREBASE_DATABASE_URL` is optional unless Realtime Database features are used.

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

### 4. Trigger seed endpoint

PowerShell example:

```powershell
$headers = @{ 'x-seed-key' = 'replace_with_strong_seed_key' }
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/seed -Headers $headers
```

Expected success response:

```json
{
  "success": true,
  "inserted": {
    "routes": 2,
    "stops": 8,
    "routeStops": 8,
    "fares": 2,
    "vehicles": 2,
    "submissions": 1
  }
}
```

### 5. Verify data in Firebase console

Open Firestore and confirm collections exist:
- `routes`
- `stops`
- `routeStops`
- `fares`
- `vehicles`
- `submissions`

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
