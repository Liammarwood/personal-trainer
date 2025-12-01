# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                     http://localhost:3000                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    React Application                     │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   VideoFeed  │  │   Exercise   │  │  StatsPanel  │  │  │
│  │  │  Component   │  │   Selector   │  │  Component   │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │  │
│  │         │                 │                 │           │  │
│  │  ┌──────────────┐  ┌──────────────────────────────┐   │  │
│  │  │   Upload     │  │    WorkoutResults Modal      │   │  │
│  │  │  Interface   │  │                              │   │  │
│  │  └──────┬───────┘  └──────────────────────────────┘   │  │
│  │         │                                              │  │
│  │         └────────────┬─────────────────────────────┐  │  │
│  │                      ▼                             │  │  │
│  │         ┌─────────────────────────────┐            │  │  │
│  │         │    WorkoutContext (State)   │            │  │  │
│  │         │  - exercises                │            │  │  │
│  │         │  - currentExercise          │            │  │  │
│  │         │  - stats (reps/sets/time)   │            │  │  │
│  │         │  - uploadResults            │            │  │  │
│  │         │  - isTracking               │            │  │  │
│  │         │  - loading                  │            │  │  │
│  │         └──────────┬──────────────────┘            │  │  │
│  │                    │                               │  │  │
│  └────────────────────┼───────────────────────────────┘  │
│                       │                                  │
│                       ▼                                  │
│         ┌──────────────────────────────┐                │
│         │     API Service (Axios)      │                │
│         │  - getAvailableExercises()   │                │
│         │  - startExercise()           │                │
│         │  - stopExercise()            │                │
│         │  - getStats()                │                │
│         │  - uploadVideo()             │                │
│         │  - getVideoFeedUrl()         │                │
│         └──────────┬───────────────────┘                │
│                    │                                    │
└────────────────────┼────────────────────────────────────┘
                     │
                     │ HTTP Requests (Port 3000 → 5000)
                     │ Proxied by Vite: /api/* → Flask
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Flask API Server                             │
│                  http://localhost:5000                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    REST API Endpoints                     │  │
│  │                                                           │  │
│  │  GET  /                    → API info                    │  │
│  │  GET  /available_exercises → Exercise list               │  │
│  │  POST /start_exercise      → Start tracking              │  │
│  │  POST /stop_exercise       → Stop tracking               │  │
│  │  GET  /stats               → Current stats               │  │
│  │  POST /upload_video        → Upload & analyze            │  │
│  │  GET  /video_feed          → MJPEG stream                │  │
│  │                                                           │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                           │
│                    ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               WebTracker Class                           │  │
│  │  - Manages camera capture thread                        │  │
│  │  - Holds current exercise detector                      │  │
│  │  - Tracks workout state                                 │  │
│  │  - Generates video frames                               │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                           │
│                    ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Exercise Registry System                     │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │         EXERCISE_REGISTRY (Dict)                │   │  │
│  │  │  'squat' → SquatDetector                        │   │  │
│  │  │  'shoulder_press' → ShoulderPressDetector       │   │  │
│  │  │  'deadlift' → DeadliftDetector                  │   │  │
│  │  │  ... (10 total)                                 │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                           │
│                    ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Exercise Detectors                            │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │        BaseExerciseDetector (Abstract)            │ │  │
│  │  │  - State machine (ready/in_position/returned)     │ │  │
│  │  │  - Rep counting logic                             │ │  │
│  │  │  - Metrics calculation                            │ │  │
│  │  │  - Logging                                        │ │  │
│  │  └─────┬──────────────────────────────────────────────┘ │  │
│  │        │                                                │  │
│  │        ├─ SquatDetector                                │  │
│  │        ├─ ShoulderPressDetector                        │  │
│  │        ├─ DeadliftDetector                             │  │
│  │        ├─ RomanianDeadliftDetector                     │  │
│  │        ├─ CalfRaiseDetector                            │  │
│  │        ├─ BarbellRowDetector                           │  │
│  │        ├─ BicepCurlDetector                            │  │
│  │        ├─ BenchPressDetector                           │  │
│  │        ├─ FrontRaiseDetector                           │  │
│  │        └─ DumbbellFlyDetector                          │  │
│  │                                                          │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                           │
│                    ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              JointTracker Class                          │  │
│  │  - OpenCV camera capture                                │  │
│  │  - MediaPipe Pose processing                            │  │
│  │  - Landmark extraction                                  │  │
│  │  - Event handler triggering                            │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                           │
│                    ▼                                           │
│         ┌────────────────────────┐                            │
│         │   MediaPipe Pose       │                            │
│         │   - 33 body landmarks  │                            │
│         │   - Real-time tracking │                            │
│         └────────┬───────────────┘                            │
│                  │                                             │
└──────────────────┼─────────────────────────────────────────────┘
                   │
                   ▼
         ┌───────────────────┐
         │   Webcam/Camera   │
         │   Live video feed │
         └───────────────────┘
```

## Data Flow

### 1. Exercise Selection Flow

```
User selects exercise in ExerciseSelector
         ↓
useWorkout().startExercise(id, options)
         ↓
WorkoutContext.startExercise()
         ↓
api.startExercise() → POST /api/start_exercise
         ↓
Flask: web_tracker.start(exercise_id, options)
         ↓
JointTracker initialized with detector
         ↓
Camera capture starts in background thread
         ↓
Context updates: isTracking = true
         ↓
UI updates: Button changes, stats polling begins
```

### 2. Real-time Stats Flow

```
Stats polling (every 1 second)
         ↓
api.getStats() → GET /api/stats
         ↓
Flask: web_tracker.get_stats()
         ↓
Detector's current state (reps, sets, duration)
         ↓
JSON response → Frontend
         ↓
WorkoutContext.setStats(data)
         ↓
StatsPanel re-renders with new values
```

### 3. Video Feed Flow

```
<img src="/api/video_feed" />
         ↓
GET /api/video_feed → Flask
         ↓
Response: multipart/x-mixed-replace stream
         ↓
WebTracker capture loop:
  - Capture frame from camera
  - Process with MediaPipe
  - Draw pose landmarks
  - Trigger detector callbacks
  - Encode as JPEG
  - Send frame bytes
         ↓
Browser displays MJPEG stream
         ↓
Continuous loop (30 FPS)
```

### 4. Video Upload Flow

```
User drags/drops MP4 file
         ↓
UploadInterface component
         ↓
useWorkout().uploadVideo(file)
         ↓
api.uploadVideo() → POST /api/upload_video
         ↓
Flask: Save file to uploads/
         ↓
FitBodScanner.process_uploaded_video_return()
  - Extract frames
  - Run OCR with Tesseract
  - Parse exercise data
         ↓
Fuzzy matching (50+ variations)
  - Exact match → Registry ID
  - Name mappings → Registry ID
  - Keyword fallback → Registry ID
         ↓
JSON response with exercises[]
         ↓
WorkoutContext.setUploadResults(data)
         ↓
WorkoutResults modal displays
         ↓
User clicks "Start Now" on trackable exercise
```

## State Synchronization

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend State                         │
│  (React Context - WorkoutContext)                       │
│                                                         │
│  - exercises: []              ← GET /available_exercises│
│  - currentExercise: string    ← POST /start_exercise   │
│  - stats: {}                  ← GET /stats (polling)   │
│  - uploadResults: {}          ← POST /upload_video     │
│  - isTracking: boolean        ← Local state            │
│  - loading: boolean           ← Local state            │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP API Calls
                 │
┌────────────────▼────────────────────────────────────────┐
│                  Backend State                          │
│  (WebTracker instance)                                  │
│                                                         │
│  - tracker: JointTracker      ← Created on start       │
│  - detector: ExerciseDetector ← From registry          │
│  - exercise_type: string      ← From request           │
│  - running: boolean           ← Thread control         │
│  - frame: np.ndarray          ← Latest camera frame    │
│                                                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ MediaPipe Processing
                 │
┌────────────────▼────────────────────────────────────────┐
│              Hardware/External                          │
│                                                         │
│  - Camera: Video capture                               │
│  - MediaPipe: ML model                                 │
│  - Tesseract: OCR engine                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

```
Frontend:
├── React 18              → UI library
├── Vite                  → Build tool & dev server
├── Axios                 → HTTP client
├── Context API           → State management
└── CSS Modules           → Component styling

Backend:
├── Flask                 → Web framework
├── flask-cors            → CORS middleware
├── OpenCV                → Video capture
├── MediaPipe             → Pose estimation
├── NumPy                 → Numerical operations
└── pytesseract           → OCR processing
```

## Deployment Architecture (Production)

```
                    ┌────────────────┐
                    │   Nginx/CDN    │
                    │  (Static files)│
                    └────────┬───────┘
                             │
                    ┌────────▼───────┐
                    │  React Build   │
                    │ (frontend/dist)│
                    └────────┬───────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐         ┌────────▼────────┐
    │   Static Assets   │         │   index.html    │
    │  (JS/CSS/Images)  │         │   (SPA Entry)   │
    └───────────────────┘         └─────────────────┘
                                           │
                                           │ API Calls
                                           │
                                  ┌────────▼─────────┐
                                  │   Flask Server   │
                                  │  (Gunicorn/uWSGI)│
                                  └────────┬─────────┘
                                           │
                                  ┌────────▼─────────┐
                                  │   Backend Logic  │
                                  │  Exercise Tracking│
                                  └──────────────────┘
```
