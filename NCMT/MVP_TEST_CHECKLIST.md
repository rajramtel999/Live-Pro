# MVP Test Checklist

This checklist tracks the required MVP flow validation for the Kathmandu transit platform.

## Automated checks

- [x] `npm run lint` passes
- [x] `npm run build` passes

## Functional checks

### 1. Valid route search
- [x] Enter known stops on home page and navigate to results page
- [x] Confirm at least one ranked route card appears
- [x] Confirm fare, ETA, availability, stop list, and map polyline are visible

### 2. Invalid route handling
- [x] Search with unknown or incompatible stop pair
- [x] Confirm explicit no-route state appears on route page

### 3. Correct fare display
- [x] Confirm `FareDisplay` shows numeric fare in NPR
- [x] Confirm fare is derived from exact match or fallback logic

### 4. ETA updates correctly
- [x] Confirm wait ETA and total ETA render in separate badges
- [x] Confirm values are numeric and non-negative

### 5. Contributor submission works
- [x] Submit route/fare/stop payload from driver page
- [x] Confirm document is written to `submissions` with `pending` status

### 6. Vehicle manual status updater works
- [x] Submit vehicle status update from driver page
- [x] Confirm vehicle document updates in `vehicles` collection
- [x] Confirm map vehicle markers reflect active vehicle count

### 7. Admin approval updates data
- [x] View pending submissions in admin table
- [x] Open detail view and edit payload JSON
- [x] Approve submission and confirm status changes to `approved`
- [x] Reject submission and confirm status changes to `rejected`
- [x] Confirm approved route/fare payloads are applied to target collections

## Data model verification

- [x] `routes` collection present
- [x] `stops` collection present
- [x] `routeStops` collection present
- [x] `fares` collection present
- [x] `vehicles` collection present
- [x] `submissions` collection present

## Demo readiness checks

- [x] Home page presents search clearly
- [x] Route page shows decision-ready commuter info
- [x] Driver page supports submission and manual vehicle simulation
- [x] Admin page supports moderation workflow
- [x] UI builds and runs without runtime compile errors
