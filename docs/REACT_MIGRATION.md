# React Migration Guide

The Personal Trainer app has been converted from a Flask-rendered template to a modern React single-page application with a Flask REST API backend.

## Architecture Changes

### Before (Flask Templates)
```
Browser → Flask Server (renders HTML) → Returns HTML with embedded JS
```

### After (React + API)
```
Browser → React App (SPA) → API Calls → Flask API Server
```

## What Changed

### Backend (Flask)
- ✅ Removed `render_template` calls
- ✅ Added `flask-cors` for CORS support
- ✅ All endpoints now return JSON
- ✅ Changed file upload field from 'file' to 'video'
- ✅ Simplified `/stats` response structure
- ✅ Root endpoint (`/`) now returns API info

### Frontend (New React App)
- ✅ Created separate `frontend/` directory
- ✅ Built with **React 18** + **Vite**
- ✅ Context API for state management
- ✅ 5 main components: VideoFeed, ExerciseSelector, StatsPanel, UploadInterface, WorkoutResults
- ✅ API service layer with Axios
- ✅ Responsive CSS with modern styling

## Setup Instructions

### 1. Install Backend Dependencies

```bash
pip install flask-cors
```

Or reinstall from requirements.txt:
```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the Backend

In the project root:
```bash
python web_server.py
```

Backend runs on: `http://localhost:5000`

### 4. Start the Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 5. Access the App

Open your browser to: **http://localhost:3000**

## State Management

The React app uses Context API to manage state centrally:

```jsx
// WorkoutContext provides:
- exercises (list)
- currentExercise (string)
- stats (object)
- uploadResults (object)
- isTracking (boolean)
- loading (boolean)
- startExercise(id, options)
- stopExercise()
- uploadVideo(file)
```

Components consume this via `useWorkout()` hook:

```jsx
const { exercises, startExercise, stats } = useWorkout();
```

## API Endpoints

All endpoints prefixed with `/api` in frontend (proxied by Vite):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/video_feed` | Video stream |
| GET | `/available_exercises` | List exercises |
| POST | `/start_exercise` | Start tracking |
| POST | `/stop_exercise` | Stop tracking |
| GET | `/stats` | Current stats |
| POST | `/upload_video` | Upload FitBod video |

## File Structure

```
personal-trainer/
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # State management
│   │   ├── services/       # API layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── exercises/              # Python exercise detectors
├── web_server.py          # Flask API server
├── requirements.txt       # Python dependencies
└── README.md
```

## Development Workflow

1. **Make backend changes**: Edit `web_server.py` or exercise detectors
2. **Make frontend changes**: Edit React components in `frontend/src/`
3. **Test**: Both servers auto-reload on changes
4. **Build for production**: `cd frontend && npm run build`

## Troubleshooting

### CORS Errors
- Ensure `flask-cors` is installed
- Check backend has `CORS(app)` enabled

### API Not Found
- Verify Flask server is running on port 5000
- Check Vite proxy config in `vite.config.js`

### Video Feed Not Loading
- Ensure camera permissions are granted
- Check `/video_feed` endpoint in backend
- Browser must support multipart streams

### State Not Updating
- Check React DevTools for context values
- Verify API responses match expected format
- Check browser console for errors

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Serve with Flask
Modify `web_server.py` to serve static files from `frontend/dist/`:

```python
from flask import send_from_directory

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(f'frontend/dist/{path}'):
        return send_from_directory('frontend/dist', path)
    return send_from_directory('frontend/dist', 'index.html')
```

## Benefits of React Migration

✨ **Better State Management**: Centralized state with Context API
✨ **Improved UX**: Faster navigation, no page reloads
✨ **Easier Testing**: Components can be tested in isolation
✨ **Modern Tooling**: Hot reload, ES6+, JSX
✨ **Scalability**: Easy to add new features/components
✨ **Maintainability**: Clear separation of concerns
