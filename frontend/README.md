# Personal Trainer - React Frontend

Modern React-based UI for the Personal Trainer application with centralized state management.

## Features

- **React 18** with hooks for state management
- **Context API** for global workout state
- **Vite** for fast development and building
- **Axios** for API communication
- **Responsive Design** with modern CSS

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running on port 5000

### Installation

```bash
cd frontend
npm install
```

### Development

Start the development server (proxies API requests to Flask backend):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── VideoFeed.jsx
│   │   ├── ExerciseSelector.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── UploadInterface.jsx
│   │   └── WorkoutResults.jsx
│   ├── context/           # React Context for state
│   │   └── WorkoutContext.jsx
│   ├── services/          # API service layer
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── App.css
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## State Management

The app uses React Context (`WorkoutContext`) to manage:
- Available exercises list
- Current exercise selection
- Real-time stats (reps, sets, duration)
- Upload results and workout plans
- Loading states

## API Integration

All API calls are handled through `src/services/api.js`:

- `GET /api/available_exercises` - Fetch exercise list
- `POST /api/start_exercise` - Start tracking
- `POST /api/stop_exercise` - Stop tracking
- `GET /api/stats` - Get current stats
- `POST /api/upload_video` - Upload FitBod video
- `GET /api/video_feed` - Video stream

## Components

### VideoFeed
Displays live camera feed with pose tracking overlay

### ExerciseSelector
Dropdown to select exercise and configure workout plan (sets, reps, weight, rest)

### StatsPanel
Real-time display of workout statistics and target metrics

### UploadInterface
Drag-and-drop interface for FitBod video upload

### WorkoutResults
Modal showing detected exercises from uploaded video with trackable status

## Development Notes

- Vite proxy configuration redirects `/api/*` to Flask backend
- CORS is enabled on the backend for development
- Video feed uses multipart/x-mixed-replace for streaming
- State updates happen via Context, not props drilling
