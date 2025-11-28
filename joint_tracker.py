"""
Joint Tracker Application
Uses MediaPipe to detect and track person's joints from webcam feed.
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import List, Optional
from event_handlers import JointEventHandler


class JointTracker:
    """
    Main class for tracking human joints using MediaPipe Pose.
    Supports extensible event handlers for joint movement detection.
    """
    
    def __init__(self, 
                 min_detection_confidence: float = 0.5,
                 min_tracking_confidence: float = 0.5):
        """
        Initialize the joint tracker.
        
        Args:
            min_detection_confidence: Minimum confidence for pose detection
            min_tracking_confidence: Minimum confidence for pose tracking
        """
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
        self.event_handlers: List[JointEventHandler] = []
        self.cap: Optional[cv2.VideoCapture] = None
        self.running = False
        
        # Store previous frame landmarks for event detection
        self.prev_landmarks = None
    
    def add_event_handler(self, handler: JointEventHandler):
        """
        Add an event handler to be called when processing joints.
        
        Args:
            handler: Instance of JointEventHandler subclass
        """
        self.event_handlers.append(handler)
    
    def remove_event_handler(self, handler: JointEventHandler):
        """
        Remove an event handler.
        
        Args:
            handler: Handler instance to remove
        """
        if handler in self.event_handlers:
            self.event_handlers.remove(handler)
    
    def get_joint_position(self, landmarks, joint_name: str) -> Optional[np.ndarray]:
        """
        Get the 3D position of a specific joint.
        
        Args:
            landmarks: MediaPipe pose landmarks
            joint_name: Name of the joint (e.g., 'LEFT_WRIST', 'RIGHT_ELBOW')
        
        Returns:
            numpy array [x, y, z] or None if joint not found
        """
        try:
            joint_idx = self.mp_pose.PoseLandmark[joint_name].value
            landmark = landmarks.landmark[joint_idx]
            return np.array([landmark.x, landmark.y, landmark.z])
        except (KeyError, AttributeError):
            return None
    
    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Process a single frame to detect and track joints.
        
        Args:
            frame: Input frame from webcam
        
        Returns:
            Annotated frame with pose landmarks
        """
        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Process the image
        results = self.pose.process(image)
        
        # Convert back to BGR for OpenCV
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        # Draw pose landmarks
        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
            
            # Trigger event handlers
            self._trigger_event_handlers(results.pose_landmarks, image)
            
            # Store current landmarks for next frame
            self.prev_landmarks = results.pose_landmarks
        else:
            self.prev_landmarks = None
        
        return image
    
    def _trigger_event_handlers(self, landmarks, frame: np.ndarray):
        """
        Trigger all registered event handlers with current landmark data.
        
        Args:
            landmarks: Current frame pose landmarks
            frame: Current frame image
        """
        for handler in self.event_handlers:
            handler.on_joints_detected(landmarks, self.prev_landmarks, frame, self)
    
    def start(self, camera_index: int = 0):
        """
        Start the joint tracking application.
        
        Args:
            camera_index: Index of the camera to use (default: 0)
        """
        self.cap = cv2.VideoCapture(camera_index)
        
        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open camera {camera_index}")
        
        self.running = True
        print("Joint Tracker started. Press 'q' to quit.")
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                
                if not ret:
                    print("Failed to grab frame")
                    break
                
                # Process the frame
                annotated_frame = self.process_frame(frame)
                
                # Display the frame
                cv2.imshow('Joint Tracker', annotated_frame)
                
                # Check for quit key
                if cv2.waitKey(5) & 0xFF == ord('q'):
                    break
        
        finally:
            self.stop()
    
    def stop(self):
        """Stop the joint tracking application and release resources."""
        self.running = False
        
        if self.cap is not None:
            self.cap.release()
        
        cv2.destroyAllWindows()
        self.pose.close()
        print("Joint Tracker stopped.")


def main():
    """Main entry point for the application."""
    tracker = JointTracker(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Example: You can add event handlers here
    # from examples import HandsCrossedHandler
    # tracker.add_event_handler(HandsCrossedHandler())
    
    try:
        tracker.start(camera_index=0)
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
