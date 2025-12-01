"""
Event Handler System for Joint Tracking
Provides base classes and utilities for creating custom event handlers.
"""

from abc import ABC, abstractmethod
from typing import Optional, Tuple
import numpy as np


class JointEventHandler(ABC):
    """
    Abstract base class for joint event handlers.
    Subclass this to create custom event handlers that respond to joint movements.
    """
    
    @abstractmethod
    def on_joints_detected(self, 
                          current_landmarks, 
                          previous_landmarks, 
                          frame: np.ndarray,
                          tracker):
        """
        Called when joints are detected in a frame.
        
        Args:
            current_landmarks: MediaPipe pose landmarks for current frame
            previous_landmarks: MediaPipe pose landmarks from previous frame (can be None)
            frame: Current frame image (BGR format)
            tracker: Reference to the JointTracker instance
        """
        pass


class JointCrossingHandler(JointEventHandler):
    """
    Base class for detecting when two joints cross each other.
    Subclass this and override on_joints_crossed() to implement custom behavior.
    """
    
    def __init__(self, 
                 joint1_name: str, 
                 joint2_name: str,
                 axis: str = 'x',
                 cooldown_frames: int = 30):
        """
        Initialize joint crossing detector.
        
        Args:
            joint1_name: Name of first joint (e.g., 'LEFT_WRIST')
            joint2_name: Name of second joint (e.g., 'RIGHT_WRIST')
            axis: Axis to check for crossing ('x', 'y', or 'z')
            cooldown_frames: Minimum frames between events to prevent duplicate triggers
        """
        self.joint1_name = joint1_name
        self.joint2_name = joint2_name
        self.axis = axis
        self.cooldown_frames = cooldown_frames
        
        # State tracking
        self.last_relative_position: Optional[float] = None
        self.frames_since_last_event = cooldown_frames
        
        # Map axis to index
        self.axis_map = {'x': 0, 'y': 1, 'z': 2}
        if axis not in self.axis_map:
            raise ValueError(f"Invalid axis: {axis}. Must be 'x', 'y', or 'z'")
        self.axis_idx = self.axis_map[axis]
    
    def on_joints_detected(self, 
                          current_landmarks, 
                          previous_landmarks, 
                          frame: np.ndarray,
                          tracker):
        """Process landmarks to detect joint crossings."""
        self.frames_since_last_event += 1
        
        # Get joint positions
        joint1_pos = tracker.get_joint_position(current_landmarks, self.joint1_name)
        joint2_pos = tracker.get_joint_position(current_landmarks, self.joint2_name)
        
        if joint1_pos is None or joint2_pos is None:
            return
        
        # Calculate relative position on specified axis
        current_relative_position = joint1_pos[self.axis_idx] - joint2_pos[self.axis_idx]
        
        # Check for crossing
        if self.last_relative_position is not None:
            # Crossing detected if sign changed
            if (np.sign(self.last_relative_position) != np.sign(current_relative_position) and
                self.frames_since_last_event >= self.cooldown_frames):
                
                # Determine crossing direction
                if current_relative_position > 0:
                    direction = f"{self.joint1_name} crossed over {self.joint2_name}"
                else:
                    direction = f"{self.joint2_name} crossed over {self.joint1_name}"
                
                # Trigger the event
                self.on_joints_crossed(
                    joint1_name=self.joint1_name,
                    joint2_name=self.joint2_name,
                    joint1_pos=joint1_pos,
                    joint2_pos=joint2_pos,
                    direction=direction,
                    frame=frame,
                    tracker=tracker
                )
                
                self.frames_since_last_event = 0
        
        self.last_relative_position = current_relative_position
    
    @abstractmethod
    def on_joints_crossed(self, 
                         joint1_name: str,
                         joint2_name: str,
                         joint1_pos: np.ndarray,
                         joint2_pos: np.ndarray,
                         direction: str,
                         frame: np.ndarray,
                         tracker):
        """
        Called when joints cross each other.
        
        Args:
            joint1_name: Name of first joint
            joint2_name: Name of second joint
            joint1_pos: 3D position [x, y, z] of first joint
            joint2_pos: 3D position [x, y, z] of second joint
            direction: Description of crossing direction
            frame: Current frame image
            tracker: Reference to JointTracker instance
        """
        pass


class JointProximityHandler(JointEventHandler):
    """
    Base class for detecting when two joints come within a certain distance.
    Subclass this and override on_joints_close() to implement custom behavior.
    """
    
    def __init__(self,
                 joint1_name: str,
                 joint2_name: str,
                 threshold_distance: float = 0.1,
                 cooldown_frames: int = 30):
        """
        Initialize joint proximity detector.
        
        Args:
            joint1_name: Name of first joint
            joint2_name: Name of second joint
            threshold_distance: Distance threshold (in normalized coordinates)
            cooldown_frames: Minimum frames between events
        """
        self.joint1_name = joint1_name
        self.joint2_name = joint2_name
        self.threshold_distance = threshold_distance
        self.cooldown_frames = cooldown_frames
        
        self.frames_since_last_event = cooldown_frames
        self.was_close = False
    
    def on_joints_detected(self,
                          current_landmarks,
                          previous_landmarks,
                          frame: np.ndarray,
                          tracker):
        """Process landmarks to detect joint proximity."""
        self.frames_since_last_event += 1
        
        # Get joint positions
        joint1_pos = tracker.get_joint_position(current_landmarks, self.joint1_name)
        joint2_pos = tracker.get_joint_position(current_landmarks, self.joint2_name)
        
        if joint1_pos is None or joint2_pos is None:
            return
        
        # Calculate distance
        distance = np.linalg.norm(joint1_pos - joint2_pos)
        
        is_close = distance < self.threshold_distance
        
        # Trigger event when joints become close (not while staying close)
        if is_close and not self.was_close and self.frames_since_last_event >= self.cooldown_frames:
            self.on_joints_close(
                joint1_name=self.joint1_name,
                joint2_name=self.joint2_name,
                joint1_pos=joint1_pos,
                joint2_pos=joint2_pos,
                distance=distance,
                frame=frame,
                tracker=tracker
            )
            self.frames_since_last_event = 0
        
        self.was_close = is_close
    
    @abstractmethod
    def on_joints_close(self,
                       joint1_name: str,
                       joint2_name: str,
                       joint1_pos: np.ndarray,
                       joint2_pos: np.ndarray,
                       distance: float,
                       frame: np.ndarray,
                       tracker):
        """
        Called when joints come within threshold distance.
        
        Args:
            joint1_name: Name of first joint
            joint2_name: Name of second joint
            joint1_pos: 3D position of first joint
            joint2_pos: 3D position of second joint
            distance: Distance between joints
            frame: Current frame image
            tracker: Reference to JointTracker instance
        """
        pass


class JointAngleHandler(JointEventHandler):
    """
    Base class for detecting when the angle formed by three joints exceeds a threshold.
    Useful for detecting arm bends, leg bends, etc.
    """
    
    def __init__(self,
                 joint1_name: str,
                 joint2_name: str,  # This is the "vertex" joint
                 joint3_name: str,
                 angle_threshold: float,
                 comparison: str = 'less',
                 cooldown_frames: int = 30):
        """
        Initialize joint angle detector.
        
        Args:
            joint1_name: Name of first joint
            joint2_name: Name of vertex joint (the angle is measured at this joint)
            joint3_name: Name of third joint
            angle_threshold: Angle threshold in degrees
            comparison: 'less' or 'greater' - trigger when angle is less/greater than threshold
            cooldown_frames: Minimum frames between events
        """
        self.joint1_name = joint1_name
        self.joint2_name = joint2_name
        self.joint3_name = joint3_name
        self.angle_threshold = angle_threshold
        self.comparison = comparison
        self.cooldown_frames = cooldown_frames
        
        self.frames_since_last_event = cooldown_frames
        self.threshold_crossed = False
    
    def calculate_angle(self, a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
        """
        Calculate angle at point b formed by points a, b, c.
        
        Returns:
            Angle in degrees
        """
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        
        return float(np.degrees(angle))
    
    def on_joints_detected(self,
                          current_landmarks,
                          previous_landmarks,
                          frame: np.ndarray,
                          tracker):
        """Process landmarks to detect angle threshold crossing."""
        self.frames_since_last_event += 1
        
        # Get joint positions
        joint1_pos = tracker.get_joint_position(current_landmarks, self.joint1_name)
        joint2_pos = tracker.get_joint_position(current_landmarks, self.joint2_name)
        joint3_pos = tracker.get_joint_position(current_landmarks, self.joint3_name)
        
        if joint1_pos is None or joint2_pos is None or joint3_pos is None:
            return
        
        # Calculate angle
        angle = self.calculate_angle(joint1_pos, joint2_pos, joint3_pos)
        
        # Check threshold
        threshold_currently_crossed = (
            (self.comparison == 'less' and angle < self.angle_threshold) or
            (self.comparison == 'greater' and angle > self.angle_threshold)
        )
        
        # Trigger event on threshold crossing
        if threshold_currently_crossed and not self.threshold_crossed and \
           self.frames_since_last_event >= self.cooldown_frames:
            self.on_angle_threshold_crossed(
                joint1_name=self.joint1_name,
                joint2_name=self.joint2_name,
                joint3_name=self.joint3_name,
                angle=angle,
                frame=frame,
                tracker=tracker
            )
            self.frames_since_last_event = 0
        
        self.threshold_crossed = threshold_currently_crossed
    
    @abstractmethod
    def on_angle_threshold_crossed(self,
                                   joint1_name: str,
                                   joint2_name: str,
                                   joint3_name: str,
                                   angle: float,
                                   frame: np.ndarray,
                                   tracker):
        """
        Called when angle crosses the threshold.
        
        Args:
            joint1_name: Name of first joint
            joint2_name: Name of vertex joint
            joint3_name: Name of third joint
            angle: Current angle in degrees
            frame: Current frame image
            tracker: Reference to JointTracker instance
        """
        pass
