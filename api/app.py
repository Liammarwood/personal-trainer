"""
Flask API Server for Personal Trainer Application
Provides REST API for video feed and exercise tracking with React frontend.
"""

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import threading
import time
from api.core.joint_tracker import JointTracker
from api.exercises import get_exercise_detector, get_available_exercises, EXERCISE_REGISTRY
from api.services.fitbod_scanner import FitBodScanner
import os

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend


# Create base class for web detectors (no overlays)
class WebExerciseDetector:
    """Wrapper that disables drawing for web interface."""
    def __init__(self, detector):
        self._detector = detector
        # Override drawing methods
        if hasattr(detector, '_draw_feedback'):
            detector._draw_feedback = lambda *args, **kwargs: None
        if hasattr(detector, '_draw_completion_feedback'):
            detector._draw_completion_feedback = lambda *args, **kwargs: None
    
    def __getattr__(self, name):
        """Delegate all other attributes to wrapped detector."""
        return getattr(self._detector, name)


# Global state
tracker_lock = threading.Lock()
is_running = False


class WebTracker:
    """Wrapper for JointTracker that handles video streaming."""
    
    def __init__(self):
        self.tracker = None
        self.detector = None
        self.frame = None
        self.running = False
        self.thread = None
        self.exercise_type = 'none'
        self.draw_overlay = False  # Disable overlay for web interface
        
    def start(self, exercise_type='squat', options: dict = None):
        """Start tracking with specified exercise."""
        if self.running:
            self.stop()
        
        self.exercise_type = exercise_type
        self.running = True
        
        # Create tracker
        self.tracker = JointTracker(
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
        # Load detector from registry
        try:
            raw_detector = get_exercise_detector(exercise_type)
            # Attach expected workout plan metadata if provided
            if options:
                # set attributes on detector for UI display
                if 'sets' in options:
                    raw_detector.expected_sets = int(options.get('sets'))
                if 'reps_per_set' in options:
                    raw_detector.expected_reps = int(options.get('reps_per_set'))
                if 'target_weight' in options:
                    raw_detector.expected_weight = float(options.get('target_weight'))
                if 'rest_seconds' in options:
                    raw_detector.rest_seconds = int(options.get('rest_seconds'))
            self.detector = WebExerciseDetector(raw_detector)
        except ValueError as e:
            print(f"Error loading exercise: {e}")
            self.detector = None
        
        if self.detector:
            self.tracker.add_event_handler(self.detector)
        
        # Start video capture in thread
        self.thread = threading.Thread(target=self._capture_loop)
        self.thread.daemon = True
        self.thread.start()
    
    def stop(self):
        """Stop tracking."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=2)
        if self.tracker and self.tracker.cap:
            self.tracker.cap.release()
        self.tracker = None
        self.detector = None
        self.frame = None
        self.exercise_type = 'none'
    
    def _capture_loop(self):
        """Main capture loop running in background thread."""
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Could not open camera")
            self.running = False
            return
        
        try:
            while self.running:
                ret, frame = cap.read()
                
                if not ret:
                    print("Failed to grab frame")
                    break
                
                # Process frame with tracker (without drawing detector overlays)
                if self.tracker:
                    # Convert BGR to RGB
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image.flags.writeable = False
                    
                    # Process with MediaPipe
                    results = self.tracker.pose.process(image)
                    
                    # Convert back to BGR
                    image.flags.writeable = True
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                    
                    # Draw pose landmarks only (no text overlays)
                    if results.pose_landmarks:
                        self.tracker.mp_drawing.draw_landmarks(
                            image,
                            results.pose_landmarks,
                            self.tracker.mp_pose.POSE_CONNECTIONS,
                            landmark_drawing_spec=self.tracker.mp_drawing_styles.get_default_pose_landmarks_style()
                        )
                        
                        # Trigger event handlers (but they won't draw on frame)
                        self.tracker._trigger_event_handlers(results.pose_landmarks, image)
                        self.tracker.prev_landmarks = results.pose_landmarks
                    else:
                        self.tracker.prev_landmarks = None
                    
                    self.frame = image
                else:
                    self.frame = frame
                
                time.sleep(0.03)  # ~30 FPS
        
        finally:
            cap.release()
    
    def get_frame(self):
        """Get current frame as JPEG bytes."""
        if self.frame is None:
            # Return empty bytes if no frame available
            return b''
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', self.frame)
        if ret:
            return buffer.tobytes()
        return b''
    
    def get_stats(self):
        """Get current exercise statistics with proper structure for React."""
        if not self.detector or not self.running:
            return {
                'reps': 0,
                'sets': 0,
                'duration': 0,
                'expected_plan': None
            }
        
        # Calculate sets (assuming 10 reps per set)
        sets = self.detector.rep_count // 10
        
        # Calculate duration (use time since start if available)
        duration = int(time.time() - getattr(self.detector, 'start_time', time.time()))
        
        # Build stats response for React
        stats = {
            'reps': self.detector.rep_count,
            'sets': sets,
            'duration': duration
        }
        
        # Add expected workout plan if present on detector
        expected_plan = {}
        if hasattr(self.detector, 'expected_sets'):
            expected_plan['sets'] = getattr(self.detector, 'expected_sets')
        if hasattr(self.detector, 'expected_reps'):
            expected_plan['reps_per_set'] = getattr(self.detector, 'expected_reps')
        if hasattr(self.detector, 'expected_weight'):
            expected_plan['target_weight'] = getattr(self.detector, 'expected_weight')
        if hasattr(self.detector, 'rest_seconds'):
            expected_plan['rest_seconds'] = getattr(self.detector, 'rest_seconds')
        
        if expected_plan:
            stats['expected_plan'] = expected_plan
        
        return stats


# Global web tracker instance
web_tracker = WebTracker()


@app.route('/')
def index():
    """API root - return info."""
    return jsonify({
        'name': 'Personal Trainer API',
        'version': '1.0.0',
        'endpoints': {
            '/video_feed': 'GET - Video streaming endpoint',
            '/available_exercises': 'GET - List available exercises',
            '/start_exercise': 'POST - Start tracking exercise',
            '/stop_exercise': 'POST - Stop tracking',
            '/stats': 'GET - Get current stats',
            '/upload_video': 'POST - Upload FitBod video'
        }
    })


@app.route('/video_feed')
def video_feed():
    """Video streaming route."""
    def generate():
        while True:
            frame_bytes = web_tracker.get_frame()
            if frame_bytes:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                # Send a small delay if no frame available
                time.sleep(0.1)
    
    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/start_exercise', methods=['POST'])
def start_exercise():
    """Start tracking an exercise."""
    data = request.get_json()
    exercise = data.get('exercise', 'squat')
    options = {
        'sets': data.get('sets'),
        'reps_per_set': data.get('reps_per_set'),
        'target_weight': data.get('target_weight'),
        'rest_seconds': data.get('rest_seconds')
    }

    # Remove None entries
    options = {k: v for k, v in options.items() if v is not None}

    try:
        web_tracker.start(exercise, options=options if options else None)
        return jsonify({
            'success': True,
            'message': f'Started {exercise} tracking',
            'exercise': exercise
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/upload_video', methods=['POST'])
def upload_video():
    """Upload an MP4 video or image (JPG/PNG) and scan for workout plan using FitBodScanner."""
    if 'video' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    file = request.files['video']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    # Check file type
    allowed_video_types = ['video/mp4']
    allowed_image_types = ['image/jpeg', 'image/png', 'image/jpg']
    
    if file.content_type not in allowed_video_types + allowed_image_types:
        return jsonify({
            'success': False, 
            'message': f'Unsupported file type: {file.content_type}. Please upload MP4, JPG, or PNG files.'
        }), 400

    # Save uploaded file
    filename = os.path.basename(file.filename)
    save_path = os.path.join(UPLOAD_DIR, filename)
    file.save(save_path)

    scanner = FitBodScanner()
    try:
        # Route to appropriate processing method based on file type
        if file.content_type in allowed_video_types:
            result = scanner.process_uploaded_video_return(save_path)
        else:  # image file
            result = scanner.process_uploaded_image_return(save_path)
    except Exception as e:
        # Clean up file on error
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({'success': False, 'message': str(e)}), 500

    # Map detected exercises to registry where possible
    exercises = []
    for ex in result.get('exercises', []):
        name = ex.get('exercise', '')
        normalized = name.strip().lower()
        matched_id = None
        
        # Try exact match first
        for eid, info in EXERCISE_REGISTRY.items():
            registry_name = info.get('name', '').strip().lower()
            if registry_name == normalized or eid == normalized.replace(' ', '_'):
                matched_id = eid
                break
        
        # Try fuzzy matching if no exact match
        if not matched_id:
            # Common variations and mappings
            name_mappings = {
                'squats': 'squat',
                'barbell squats': 'squat',
                'back squat': 'squat',
                'back squats': 'squat',
                'front squat': 'squat',
                'front squats': 'squat',
                'goblet squat': 'squat',
                'goblet squats': 'squat',
                'dumbbell squat': 'squat',
                'dumbbell squats': 'squat',
                'air squat': 'squat',
                'air squats': 'squat',
                'bodyweight squat': 'squat',
                'box squat': 'squat',
                'shoulder presses': 'shoulder_press',
                'overhead press': 'shoulder_press',
                'military press': 'shoulder_press',
                'seated shoulder press': 'shoulder_press',
                'standing shoulder press': 'shoulder_press',
                'dumbbell shoulder press': 'shoulder_press',
                'barbell shoulder press': 'shoulder_press',
                'deadlifts': 'deadlift',
                'conventional deadlift': 'deadlift',
                'sumo deadlift': 'deadlift',
                'trap bar deadlift': 'deadlift',
                'romanian deadlifts': 'romanian_deadlift',
                'rdl': 'romanian_deadlift',
                'stiff leg deadlift': 'romanian_deadlift',
                'calf raises': 'calf_raise',
                'standing calf raise': 'calf_raise',
                'seated calf raise': 'calf_raise',
                'single leg calf raise': 'calf_raise',
                'barbell rows': 'barbell_row',
                'bent over row': 'barbell_row',
                'pendlay row': 'barbell_row',
                'dumbbell row': 'barbell_row',
                'bicep curls': 'bicep_curl',
                'dumbbell curl': 'bicep_curl',
                'barbell curl': 'bicep_curl',
                'hammer curl': 'bicep_curl',
                'preacher curl': 'bicep_curl',
                'concentration curl': 'bicep_curl',
                'bench presses': 'bench_press',
                'barbell bench press': 'bench_press',
                'dumbbell bench press': 'bench_press',
                'incline bench press': 'bench_press',
                'decline bench press': 'bench_press',
                'flat bench press': 'bench_press',
                'front raises': 'front_raise',
                'dumbbell front raise': 'front_raise',
                'barbell front raise': 'front_raise',
                'plate front raise': 'front_raise',
                'dumbbell flys': 'dumbbell_fly',
                'dumbbell flyes': 'dumbbell_fly',
                'chest fly': 'dumbbell_fly',
                'pec fly': 'dumbbell_fly',
                'cable fly': 'dumbbell_fly',
                'incline fly': 'dumbbell_fly'
            }
            
            matched_id = name_mappings.get(normalized)
            
            # If still no match, try contains-based fuzzy matching
            if not matched_id:
                # Extract key exercise words from detected name
                key_words = ['squat', 'press', 'deadlift', 'curl', 'row', 'raise', 'fly', 'calf']
                
                for key_word in key_words:
                    if key_word in normalized:
                        # Try to match to registry exercises containing this key word
                        if key_word == 'squat':
                            matched_id = 'squat'
                            break
                        elif key_word == 'press' and 'shoulder' in normalized:
                            matched_id = 'shoulder_press'
                            break
                        elif key_word == 'press' and ('bench' in normalized or 'chest' in normalized):
                            matched_id = 'bench_press'
                            break
                        elif key_word == 'deadlift':
                            if 'romanian' in normalized or 'rdl' in normalized or 'stiff' in normalized:
                                matched_id = 'romanian_deadlift'
                            else:
                                matched_id = 'deadlift'
                            break
                        elif key_word == 'curl':
                            matched_id = 'bicep_curl'
                            break
                        elif key_word == 'row':
                            matched_id = 'barbell_row'
                            break
                        elif key_word == 'raise' and 'calf' not in normalized:
                            matched_id = 'front_raise'
                            break
                        elif key_word == 'calf':
                            matched_id = 'calf_raise'
                            break
                        elif key_word == 'fly':
                            matched_id = 'dumbbell_fly'
                            break

        exercises.append({
            'name': name,
            'trackable': bool(matched_id),
            'mapped_exercise': matched_id,
            'sets': ex.get('sets'),
            'reps': ex.get('reps'),
            'weight': ex.get('weight_kg', 0)  # Keep weight in kg
        })

    # Delete the uploaded file after processing
    try:
        if os.path.exists(save_path):
            os.remove(save_path)
    except Exception as e:
        # Log but don't fail if file deletion fails
        print(f"Warning: Could not delete uploaded file {save_path}: {e}")

    return jsonify({
        'success': True,
        'message': 'Video processed successfully',
        'exercises': exercises
    })


@app.route('/stop_exercise', methods=['POST'])
def stop_exercise():
    """Stop tracking."""
    try:
        web_tracker.stop()
        return jsonify({
            'success': True,
            'message': 'Stopped tracking'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/stats')
def stats():
    """Get current exercise statistics."""
    return jsonify(web_tracker.get_stats())


@app.route('/available_exercises')
def available_exercises():
    """Get list of available exercises."""
    exercises = get_available_exercises()
    return jsonify({'exercises': exercises})
