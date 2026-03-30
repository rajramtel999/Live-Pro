# TimroData - Web Privacy Exposure Demonstration System

An educational web application that demonstrates how much personal data websites can access automatically and how privacy risks increase when users grant browser permissions.

## Project Purpose

This system is designed to visually demonstrate:
- Baseline information browsers expose automatically (IP, browser, OS, language, timezone, screen size)
- Browser permission states (location, camera, microphone, notifications)
- How granting location permission reveals exact GPS coordinates
- Privacy awareness and protection tips

**Note:** This project is strictly for privacy awareness and education, not tracking or exploitation.

## Project Structure

```
timrodata/
├── frontend/          # Client-side application
├── backend/           # Flask API server
├── docs/              # Documentation and notes
└── scripts/           # Helper scripts
```

## Getting Started

### Frontend Only
```bash
cd frontend
# Open index.html in browser
```

### Full Stack (Week 2+)
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
# Configure API endpoint in app.js
```

## Development Timeline

- **Week 1:** Frontend only, baseline data
- **Week 2:** Flask backend, API integration
- **Week 3:** Database, GeoIP service
- **Week 4:** Permissions API, location tracking
- **Week 5:** Map integration
- **Week 6:** Statistics dashboard

## License

Educational use only.
