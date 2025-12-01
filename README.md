# Personal Trainer - Joint Tracking Exercise Monitor

A Python application with React frontend that uses MediaPipe and OpenCV to track exercise form in real-time through your webcam. The system provides rep counting, form feedback, and detailed logging for various exercises.

## Features

- **Real-time Joint Tracking**: Uses MediaPipe Pose for accurate body landmark detection
- **10 Exercise Types**: Squat, Shoulder Press, Deadlift, Romanian Deadlift, Calf Raise, Barbell Row, Bicep Curl, Bench Press, Front Raise, Dumbbell Fly
- **Form Validation**: Ensures proper range of motion and technique before counting reps
- **React Web Interface**: Modern SPA with centralized state management
- **FitBod Integration**: Upload workout videos and automatically detect exercises
- **Fuzzy Exercise Matching**: Maps 50+ exercise name variations to tracking exercises
- **Detailed Logging**: Tracks all reps with timestamps, metrics, and quality assessments
- **Extensible Architecture**: Easy to add new exercises with base class system

## Requirements

- Python 3.10+
- Node.js 16+ and npm
- Webcam
- Dependencies in `requirements.txt` and `frontend/package.json`

## Installation

### Backend

```bash
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Quick Start

### Option 1: Use Startup Scripts (Easiest)

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

This will start both the Flask API server (port 5000) and React frontend (port 3000).

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
python web_server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open your browser to `http://localhost:3000` to:
- View live video feed with pose tracking
- Select exercises from dropdown with workout plan configuration
- See real-time rep counts and statistics
- Upload FitBod videos for exercise detection
- Track workout progress

## Architecture

The application uses a modern architecture:

```
React SPA (Port 3000) ←→ Flask REST API (Port 5000) ←→ MediaPipe + OpenCV
```

- **Frontend**: React 18 with Context API for state management
- **Backend**: Flask REST API with CORS support
- **Video Processing**: OpenCV + MediaPipe for pose detection
- **Exercise Detection**: Base class system with 10 exercise types
- **OCR**: Tesseract for FitBod video scanning

## Project Structure

```
personal-trainer/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # State management
│   │   ├── services/       # API layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── exercises/              # Exercise detector modules
│   ├── __init__.py         # Exercise registry and loading
│   ├── base_exercise.py    # Abstract base class for all exercises
│   ├── utils.py            # Shared utility functions
│   ├── squat.py            # Squat detector
│   ├── shoulder_press.py   # Shoulder press detector
│   ├── deadlift.py         # Deadlift detector
│   ├── romanian_deadlift.py # Romanian deadlift detector
│   ├── calf_raise.py       # Calf raise detector
│   ├── barbell_row.py      # Barbell row detector
│   ├── bicep_curl.py       # Bicep curl detector
│   ├── bench_press.py      # Bench press detector
│   ├── front_raise.py      # Front raise detector
│   └── dumbbell_fly.py     # Dumbbell fly detector
│
├── logs/                   # Exercise log files (auto-created)
├── uploads/                # Uploaded FitBod videos (auto-created)
│
├── joint_tracker.py        # Core joint tracking engine
├── event_handlers.py       # Event handler base classes
├── web_server.py           # Flask REST API server
├── fitbod_scanner.py       # FitBod video OCR processor
├── requirements.txt        # Python dependencies
├── start.bat / start.sh    # Startup scripts
└── README.md
```

## Adding a New Exercise

The system is designed for easy extension. Follow these steps:

### 1. Create Exercise Detector

Create a new file in `exercises/your_exercise.py`:

```python
from typing import Dict, Any
import numpy as np
from exercises.base_exercise import BaseExerciseDetector
from exercises import utils


class YourExerciseDetector(BaseExerciseDetector):
    """Detects your exercise reps."""
    
    def __init__(self, log_file='logs/your_exercise_log.txt'):
        super().__init__(
            exercise_name='Your Exercise',
            log_file=log_file,
            cooldown_frames=15  # Frames between reps
        )
        # Define your thresholds
        self.angle_threshold = 90
        self.distance_threshold = 0.3
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        """Specify which joints to track."""
        return self.get_bilateral_joints(landmarks, tracker, 
                                        ['SHOULDER', 'ELBOW', 'WRIST'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        """Calculate exercise-specific metrics."""
        angle = self.calculate_bilateral_angle(joints, ('shoulder', 'elbow', 'wrist'))
        distance = utils.calculate_distance_2d(joints['left_wrist'], joints['right_wrist'])
        
        return {
            'angle': angle,
            'distance': distance
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        """Check if in the contracted/end position."""
        return metrics['angle'] < self.angle_threshold
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        """Check if back at starting/extended position."""
        return metrics['angle'] > 160
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        """Provide quality feedback."""
        if metrics['angle'] < 70:
            return "Excellent - Full range"
        elif metrics['angle'] < 90:
            return "Good"
        else:
            return "Partial - Go deeper"
    
    def get_in_position_instruction(self) -> str:
        return "CONTRACTED - Hold"
    
    def get_return_instruction(self) -> str:
        return "EXTEND - Return to start"
    
    def get_ready_instruction(self) -> str:
        return "READY - Begin rep"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        """Track best performance."""
        if current['angle'] < best.get('angle', 180):
            best['angle'] = current['angle']
```

### 2. Register in Exercise Registry

Edit `exercises/__init__.py` and add to `EXERCISE_REGISTRY`:

```python
from exercises.your_exercise import YourExerciseDetector

EXERCISE_REGISTRY = {
    # ... existing exercises ...
    'your_exercise': {
        'class': YourExerciseDetector,
        'name': 'Your Exercise',
        'description': 'Brief description of the exercise',
        'category': 'Upper Body'  # or 'Lower Body'
    }
}
```

### 3. That's It!

Your exercise is now automatically available in:
- Web interface dropdown
- Exercise registry API
- Command-line usage via `get_exercise_detector('your_exercise')`

## Available Utility Functions

The `exercises/utils.py` module provides many helper functions:

### Angle Calculations
- `calculate_angle(a, b, c)` - Angle at point b
- `calculate_torso_angle(shoulder, hip, vertical_ref)` - Torso lean angle

### Distance Calculations
- `calculate_distance_2d(a, b)` - Horizontal/vertical distance
- `calculate_distance_3d(a, b)` - True 3D distance
- `calculate_vertical_distance(a, b)` - Y-axis only
- `calculate_horizontal_distance(a, b)` - X-axis only

### Position Checks
- `is_point_above(a, b)` - Is a higher than b?
- `is_point_below(a, b)` - Is a lower than b?
- `is_aligned_vertically(a, b, tolerance)` - Are points vertically aligned?
- `is_aligned_horizontally(a, b, tolerance)` - Are points horizontally aligned?

### Joint Helpers
- `get_midpoint(a, b)` - Midpoint between two joints
- `get_bilateral_joints(landmarks, tracker, joint_names)` - Get left/right pairs
- `calculate_bilateral_angle(joints, joint_tuple)` - Average angle from both sides

### Smoothing
- `MovingAverage(window_size)` - Smooth noisy measurements

## Exercise Specifications

### Squat
- **Full depth**: Hip-knee distance < 0.15, knee angle < 100°
- **Standing**: Knee angle > 160°, hip well above knee

### Shoulder Press
- **Lockout**: Elbow extension > 160°, wrists > 0.3 above shoulders
- **Starting**: Arms bent at shoulder level

### Deadlift
- **Lockout**: Hip angle > 160°, torso angle < 30° (upright)
- **Bottom**: Hip angle < 100°, torso bent forward

### Romanian Deadlift
- **Stretch**: Knee angle > 160° (legs straight), torso angle ~80° (bent forward)
- **Top**: Torso upright < 30°

### Calf Raise
- **Raised**: Heel lift > 0.08, ankle angle > 135°
- **Starting**: Heel at ground level

### Barbell Row
- **Pulled**: Elbow flexion < 90°, torso 45-80° bent
- **Extended**: Arms straight, weight down

### Bicep Curl
- **Curled**: Elbow flexion < 50°
- **Extended**: Elbow angle > 160°

### Bench Press
- **Lockout**: Elbow extension > 165°
- **Chest**: Elbow flexion < 90°, press depth < 0.12

### Front Raise
- **Raised**: Wrists above shoulders, arm angle < 100°
- **Starting**: Arms down at sides

### Dumbbell Fly
- **Closed**: Wrists together < 0.15
- **Open**: Wrists spread > 0.5, elbows slightly bent > 150°

## BaseExerciseDetector API

All exercise detectors inherit from `BaseExerciseDetector` which provides:

### Required Methods (Override These)

```python
def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
    """Return dictionary of joints needed for this exercise."""
    
def calculate_metrics(self, joints, tracker) -> Dict[str, Any]:
    """Calculate exercise-specific metrics (angles, distances, etc)."""
    
def is_in_rep_position(self, metrics) -> bool:
    """Is the user in the contracted/end position?"""
    
def is_at_starting_position(self, metrics) -> bool:
    """Is the user back at the starting position?"""
    
def assess_rep_quality(self, metrics) -> str:
    """Return quality assessment string."""
    
def get_in_position_instruction(self) -> str:
    """Instruction when in rep position."""
    
def get_return_instruction(self) -> str:
    """Instruction to return to start."""
    
def get_ready_instruction(self) -> str:
    """Instruction when ready for next rep."""
    
def update_best_metrics(self, current, best):
    """Update best_metrics dict with new records."""
```

### Provided Features

- **State Machine**: Automatically tracks rep progression (ready → in_position → returned → count)
- **Rep Counting**: Increments `rep_count` when full rep detected
- **Logging**: Writes to log file with timestamps and quality
- **Cooldown**: Prevents double-counting with frame cooldown
- **Best Tracking**: Maintains `best_metrics` dictionary
- **Helper Methods**:
  - `get_bilateral_joints()` - Get left/right joint pairs
  - `calculate_bilateral_angle()` - Average angle from both sides

## Configuration

### Tracker Settings

In `joint_tracker.py` or when creating `JointTracker()`:

```python
tracker = JointTracker(
    min_detection_confidence=0.7,  # Initial detection threshold
    min_tracking_confidence=0.7    # Frame-to-frame tracking threshold
)
```

### Exercise Thresholds

Each exercise defines its own thresholds as class attributes. To customize:

```python
from exercises import get_exercise_detector

detector = get_exercise_detector('squat')
detector.knee_angle_threshold = 95  # Make squats more strict
detector.depth_threshold = 0.12     # Require deeper squats
```

### Web Server

In `web_server.py`:

```python
app.run(
    host='0.0.0.0',  # Allow external connections
    port=5000,        # Port number
    debug=False       # Production mode
)
```

## Logging

All exercises log to `logs/exercise_name_log.txt` with format:

```
Timestamp | Rep # | Metrics | Duration | Quality Assessment
```

Example squat log entry:
```
2024-01-15 10:30:45 | #005 |  87.3° | Depth: 0.121 |   2.3s | Excellent - ATG (Ass to Grass)
```

## Troubleshooting

### Camera Not Found
- Ensure webcam is connected and not in use by another application
- Try changing `camera_index=0` to `1` or `2` in tracker initialization

### Poor Detection
- Ensure good lighting
- Stand further from camera to capture full body
- Wear fitted/contrasting clothing
- Increase `min_detection_confidence` threshold

### False Positives
- Increase `cooldown_frames` in exercise detector
- Adjust exercise-specific thresholds (angles, distances)
- Ensure proper starting position before each rep

### Import Errors
- Verify all files are in correct directories
- Check `exercises/__init__.py` exists and is properly formatted
- Run `pip install -r requirements.txt` to ensure dependencies

## Contributing

To add new features or exercises:

1. Follow the exercise detector pattern shown above
2. Use utility functions from `exercises/utils.py`
3. Test thoroughly with various body types and camera angles
4. Add to registry in `exercises/__init__.py`
5. Update this README with exercise specifications

## License

This project is provided as-is for personal use.

## Acknowledgments

- **MediaPipe**: Google's ML framework for pose detection
- **OpenCV**: Computer vision library
- **Flask**: Web framework for the UI
