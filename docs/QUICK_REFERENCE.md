# Quick Reference - React + Flask API

## Starting the Application

### Development Mode

**Option 1: Startup Scripts**
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

**Option 2: Manual**
```bash
# Terminal 1 - Backend
python web_server.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Access:** http://localhost:3000

## API Endpoints

Base URL: `http://localhost:5000`

### GET /
Returns API information and available endpoints.

### GET /available_exercises
Get list of trackable exercises.

**Response:**
```json
{
  "exercises": [
    {
      "id": "squat",
      "name": "Squat",
      "description": "Full depth squat with proper form"
    }
  ]
}
```

### POST /start_exercise
Start tracking an exercise.

**Body:**
```json
{
  "exercise": "squat",
  "sets": 3,
  "reps_per_set": 10,
  "target_weight": 135,
  "rest_seconds": 60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Started squat tracking",
  "exercise": "squat"
}
```

### POST /stop_exercise
Stop current tracking.

**Response:**
```json
{
  "success": true,
  "message": "Stopped tracking"
}
```

### GET /stats
Get current workout statistics.

**Response:**
```json
{
  "reps": 15,
  "sets": 1,
  "duration": 45,
  "expected_plan": {
    "sets": 3,
    "reps_per_set": 10,
    "target_weight": 135,
    "rest_seconds": 60
  }
}
```

### POST /upload_video
Upload FitBod workout video for analysis.

**Body:** multipart/form-data with `video` field

**Response:**
```json
{
  "success": true,
  "message": "Video processed successfully",
  "exercises": [
    {
      "name": "Back Squat",
      "trackable": true,
      "mapped_exercise": "squat",
      "sets": 3,
      "reps": 10,
      "weight": 185
    }
  ]
}
```

### GET /video_feed
Streaming video endpoint (multipart/x-mixed-replace).

Returns MJPEG stream of camera feed with pose overlay.

## React Components

### App.jsx
Main application wrapper with WorkoutProvider.

### VideoFeed.jsx
Displays camera stream with loading spinner.

### ExerciseSelector.jsx
Dropdown to select exercise and configure workout plan.
- Shows available exercises
- Input fields for sets, reps, weight, rest
- Start/Stop buttons
- Tracking indicator

### StatsPanel.jsx
Real-time statistics display.
- Current reps, sets, duration
- Expected workout plan (if set)
- Color-coded stat cards

### UploadInterface.jsx
Drag-and-drop file upload.
- Accepts MP4 files
- Shows file preview
- Upload button

### WorkoutResults.jsx
Modal showing upload results.
- List of detected exercises
- Trackable badges
- "Start Now" buttons
- Summary statistics

## State Management

All state managed via `WorkoutContext`:

```jsx
const {
  exercises,        // Available exercises list
  currentExercise,  // Currently tracking exercise ID
  stats,            // { reps, sets, duration, expected_plan }
  uploadResults,    // Upload analysis results
  isTracking,       // Boolean tracking state
  loading,          // Boolean loading state
  startExercise,    // (id, options) => Promise
  stopExercise,     // () => Promise
  uploadVideo,      // (file) => Promise
  setUploadResults  // (results) => void
} = useWorkout();
```

## Common Tasks

### Add a New Exercise

1. Create detector in `exercises/new_exercise.py`
2. Register in `exercises/__init__.py`
3. Restart backend
4. Exercise appears in dropdown automatically

### Modify Stats Display

Edit `frontend/src/components/StatsPanel.jsx`:
```jsx
<div className="stat-card">
  <div className="stat-value">{stats.reps}</div>
  <div className="stat-label">Reps</div>
</div>
```

### Change API Port

**Backend:** Edit `web_server.py`:
```python
app.run(host='0.0.0.0', port=5001)
```

**Frontend:** Edit `frontend/vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://localhost:5001'
  }
}
```

### Add New API Endpoint

1. Add route in `web_server.py`:
```python
@app.route('/my_endpoint')
def my_endpoint():
    return jsonify({'data': 'value'})
```

2. Add to `frontend/src/services/api.js`:
```js
export const api = {
  myEndpoint: async () => {
    const response = await axios.get(`${API_BASE_URL}/my_endpoint`);
    return response.data;
  }
};
```

3. Use in component:
```jsx
import api from '../services/api';

const data = await api.myEndpoint();
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 is available: `netstat -an | grep 5000`

### Frontend won't start
- Check Node version: `node --version` (need 16+)
- Install dependencies: `cd frontend && npm install`
- Check port 3000 is available

### Video feed not loading
- Grant camera permissions in browser
- Check backend is running
- Open browser console for errors

### CORS errors
- Ensure `flask-cors` is installed: `pip install flask-cors`
- Check `CORS(app)` is in `web_server.py`

### Stats not updating
- Check backend is running
- Open Network tab in DevTools
- Verify `/stats` endpoint returns data
- Check console for JavaScript errors

## File Locations

**Backend:**
- Main server: `web_server.py`
- Exercise detectors: `exercises/*.py`
- Logs: `logs/*.txt`
- Uploads: `uploads/*.mp4`

**Frontend:**
- Components: `frontend/src/components/*.jsx`
- State: `frontend/src/context/WorkoutContext.jsx`
- API: `frontend/src/services/api.js`
- Styles: `frontend/src/components/*.css`

## Production Build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

To serve with Flask, modify `web_server.py`:
```python
from flask import send_from_directory

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    dist_dir = 'frontend/dist'
    if path and os.path.exists(f'{dist_dir}/{path}'):
        return send_from_directory(dist_dir, path)
    return send_from_directory(dist_dir, 'index.html')
```
