# Joint Tracker - Webcam-Based Pose Detection

A Python application for real-time joint tracking using MediaPipe and webcam input. Features an extensible event handler system for detecting and responding to joint movements, crossings, and poses.

## Features

- **Real-time pose detection** using MediaPipe
- **Webcam integration** with live video feed
- **Extensible event handler system** for custom joint movement detection
- **Pre-built handlers** for common use cases:
  - Joint crossing detection (e.g., hands crossing)
  - Joint proximity detection (e.g., clapping)
  - Joint angle detection (e.g., arm bends for exercise counting)
- **Easy to extend** for custom behavior

## Requirements

- Python 3.10+
- Webcam

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install -r requirements.txt
```

The main dependencies are:
- `mediapipe` - For pose detection
- `opencv-python` - For webcam and video processing
- `numpy` - For numerical operations

## Quick Start

### Basic Usage (No Event Handlers)

Run the basic joint tracker to see pose detection in action:

```bash
python joint_tracker.py
```

Press 'q' to quit.

### Run Examples with Event Handlers

Try the example handlers that detect various movements:

```bash
python examples.py
```

This demo includes:
- ✋ **Hands Crossed** - Detects when hands cross horizontally
- 👏 **Hands Touching** - Detects when hands come close (clapping motion)
- 💪 **Arm Bend** - Counts arm bends (useful for exercise tracking)
- 🦘 **Jump Detector** - Detects jumping motions

## Architecture

### Core Components

1. **`joint_tracker.py`** - Main application
   - `JointTracker` class - Manages webcam, MediaPipe pose detection, and event handlers
   - Provides methods to add/remove event handlers
   - Handles frame processing and visualization

2. **`event_handlers.py`** - Event handler framework
   - `JointEventHandler` - Abstract base class for all handlers
   - `JointCrossingHandler` - Base class for detecting joint crossings
   - `JointProximityHandler` - Base class for detecting joint proximity
   - `JointAngleHandler` - Base class for detecting joint angles

3. **`examples.py`** - Example implementations
   - Demonstrates how to create custom event handlers
   - Includes several ready-to-use handlers

## Creating Custom Event Handlers

### Method 1: Subclass JointEventHandler (Full Control)

```python
from event_handlers import JointEventHandler
import numpy as np

class MyCustomHandler(JointEventHandler):
    def on_joints_detected(self, current_landmarks, previous_landmarks, frame, tracker):
        """Called every frame when joints are detected."""
        # Get joint positions
        left_wrist = tracker.get_joint_position(current_landmarks, 'LEFT_WRIST')
        right_wrist = tracker.get_joint_position(current_landmarks, 'RIGHT_WRIST')
        
        if left_wrist is not None and right_wrist is not None:
            # Your custom logic here
            distance = np.linalg.norm(left_wrist - right_wrist)
            print(f"Hand distance: {distance:.3f}")
```

### Method 2: Subclass JointCrossingHandler (For Crossing Detection)

```python
from event_handlers import JointCrossingHandler

class MyJointCrossingHandler(JointCrossingHandler):
    def __init__(self):
        super().__init__(
            joint1_name='LEFT_WRIST',
            joint2_name='RIGHT_WRIST',
            axis='x',  # 'x', 'y', or 'z'
            cooldown_frames=30
        )
    
    def on_joints_crossed(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                         direction, frame, tracker):
        """Called when joints cross each other."""
        print(f"Joints crossed: {direction}")
        # Add your custom behavior here
```

### Method 3: Subclass JointProximityHandler (For Proximity Detection)

```python
from event_handlers import JointProximityHandler

class MyProximityHandler(JointProximityHandler):
    def __init__(self):
        super().__init__(
            joint1_name='LEFT_ELBOW',
            joint2_name='RIGHT_ELBOW',
            threshold_distance=0.15,
            cooldown_frames=20
        )
    
    def on_joints_close(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                       distance, frame, tracker):
        """Called when joints come within threshold distance."""
        print(f"Elbows close together! Distance: {distance:.3f}")
        # Add your custom behavior here
```

### Method 4: Subclass JointAngleHandler (For Angle Detection)

```python
from event_handlers import JointAngleHandler

class MyAngleHandler(JointAngleHandler):
    def __init__(self):
        super().__init__(
            joint1_name='RIGHT_SHOULDER',
            joint2_name='RIGHT_ELBOW',  # Vertex joint
            joint3_name='RIGHT_WRIST',
            angle_threshold=90,
            comparison='less',  # or 'greater'
            cooldown_frames=15
        )
    
    def on_angle_threshold_crossed(self, joint1_name, joint2_name, joint3_name,
                                   angle, frame, tracker):
        """Called when angle crosses threshold."""
        print(f"Elbow angle: {angle:.1f}°")
        # Add your custom behavior here
```

## Using Your Custom Handler

```python
from joint_tracker import JointTracker
from my_handlers import MyCustomHandler

# Create tracker
tracker = JointTracker()

# Add your handler
tracker.add_event_handler(MyCustomHandler())

# Start tracking
tracker.start(camera_index=0)
```

## Available Joint Names

MediaPipe provides the following landmarks (joint names):

**Face**: `NOSE`, `LEFT_EYE_INNER`, `LEFT_EYE`, `LEFT_EYE_OUTER`, `RIGHT_EYE_INNER`, `RIGHT_EYE`, `RIGHT_EYE_OUTER`, `LEFT_EAR`, `RIGHT_EAR`, `MOUTH_LEFT`, `MOUTH_RIGHT`

**Upper Body**: `LEFT_SHOULDER`, `RIGHT_SHOULDER`, `LEFT_ELBOW`, `RIGHT_ELBOW`, `LEFT_WRIST`, `RIGHT_WRIST`

**Hands**: `LEFT_PINKY`, `RIGHT_PINKY`, `LEFT_INDEX`, `RIGHT_INDEX`, `LEFT_THUMB`, `RIGHT_THUMB`

**Lower Body**: `LEFT_HIP`, `RIGHT_HIP`, `LEFT_KNEE`, `RIGHT_KNEE`, `LEFT_ANKLE`, `RIGHT_ANKLE`, `LEFT_HEEL`, `RIGHT_HEEL`, `LEFT_FOOT_INDEX`, `RIGHT_FOOT_INDEX`

## Advanced Usage

### Multiple Handlers

You can add multiple handlers to track different movements simultaneously:

```python
tracker = JointTracker()
tracker.add_event_handler(HandsCrossedHandler())
tracker.add_event_handler(ArmBendHandler())
tracker.add_event_handler(JumpDetector())
tracker.start()
```

### Drawing on Frame

Event handlers receive the current frame and can draw on it:

```python
import cv2

def on_joints_crossed(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                     direction, frame, tracker):
    h, w, _ = frame.shape
    
    # Draw text
    cv2.putText(frame, "Event Detected!", (10, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # Draw circle at joint position
    pt = (int(joint1_pos[0] * w), int(joint1_pos[1] * h))
    cv2.circle(frame, pt, 10, (255, 0, 0), -1)
```

### Logging Events

```python
class LoggingHandler(JointCrossingHandler):
    def on_joints_crossed(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                         direction, frame, tracker):
        import datetime
        timestamp = datetime.datetime.now().isoformat()
        with open('events.log', 'a') as f:
            f.write(f"{timestamp}: {direction}\n")
```

## Configuration

### JointTracker Parameters

```python
tracker = JointTracker(
    min_detection_confidence=0.5,  # Confidence threshold for initial detection
    min_tracking_confidence=0.5    # Confidence threshold for tracking
)
```

### Handler Cooldown

Most handlers have a `cooldown_frames` parameter to prevent duplicate event triggers:

```python
handler = HandsCrossedHandler()
handler.cooldown_frames = 60  # Wait 60 frames between events
```

## Troubleshooting

### Camera Not Opening
- Check camera index: Try `camera_index=1` or `camera_index=2`
- Ensure no other application is using the camera
- Check camera permissions

### Poor Detection
- Ensure good lighting
- Stand at appropriate distance from camera
- Increase `min_detection_confidence` for more stable tracking
- Decrease for more sensitive detection

### Performance Issues
- Reduce frame size in OpenCV capture
- Increase cooldown frames to reduce processing
- Run fewer event handlers simultaneously

## Use Cases

- **Fitness Applications**: Count reps, track form
- **Gesture Recognition**: Detect specific poses or movements
- **Interactive Installations**: Respond to user movements
- **Data Collection**: Log movement patterns for analysis
- **Physical Therapy**: Monitor range of motion and exercises
- **Gaming**: Body-controlled game inputs

## License

This project uses MediaPipe, which is licensed under Apache 2.0.

## Contributing

Feel free to extend this framework with your own handlers! The architecture is designed to be modular and easy to customize.

## Future Extensions

The event handler system can be extended to support:
- Multi-person tracking
- Temporal patterns (sequences of movements)
- Machine learning integration for complex gesture recognition
- Data export for analysis
- Real-time feedback and coaching

---

**Happy tracking! 🎯**
