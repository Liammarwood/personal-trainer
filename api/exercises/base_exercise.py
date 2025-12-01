"""
Base class for all exercise detectors.
Provides common functionality and structure for easy exercise creation.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import datetime
import numpy as np
from api.core.event_handlers import JointEventHandler
from api.exercises import utils


class BaseExerciseDetector(JointEventHandler, ABC):
    """
    Base class for all exercise detectors.
    Inherit from this class to create new exercise detectors easily.
    """
    
    def __init__(self, 
                 exercise_name: str,
                 log_file: str,
                 cooldown_frames: int = 20):
        """
        Initialize base exercise detector.
        
        Args:
            exercise_name: Display name of the exercise
            log_file: Path to log file
            cooldown_frames: Minimum frames between rep counts
        """
        self.exercise_name = exercise_name
        self.log_file = log_file
        self.cooldown_frames = cooldown_frames
        
        # Common state
        self.rep_count = 0
        self.in_rep_position = False
        self.returned_to_start = True
        self.rep_start_time = None
        self.frames_since_last_rep = cooldown_frames
        
        # Metrics tracking
        self.current_metrics = {}
        self.best_metrics = {}
        
        # Initialize log file
        self._initialize_log()
    
    def _initialize_log(self):
        """Create log file with header if it doesn't exist."""
        try:
            with open(self.log_file, 'x') as f:
                f.write(f"{self.exercise_name} Activity Log\n")
                f.write("=" * 80 + "\n")
                f.write(f"Started: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 80 + "\n\n")
                f.write(self._get_log_header())
                f.write("-" * 80 + "\n")
        except FileExistsError:
            pass
    
    def _get_log_header(self) -> str:
        """
        Get log file header columns.
        Override in subclass to customize.
        """
        return "Timestamp | Rep # | Duration (s) | Quality\n"
    
    def on_joints_detected(self, current_landmarks, previous_landmarks, frame, tracker):
        """
        Main detection loop - called every frame when joints are detected.
        Implements the rep counting state machine.
        """
        self.frames_since_last_rep += 1
        
        # Get joint positions
        joints = self.get_required_joints(current_landmarks, tracker)
        
        # Check if all required joints are detected
        if not utils.all_joints_detected(list(joints.values())):
            return
        
        # Calculate current exercise metrics
        self.current_metrics = self.calculate_metrics(joints, tracker)
        
        # Check exercise states
        is_in_position = self.is_in_rep_position(self.current_metrics)
        is_at_start = self.is_at_starting_position(self.current_metrics)
        
        # State machine: Track return to start
        if is_at_start and self.in_rep_position:
            self.returned_to_start = True
            self.in_rep_position = False
            
            # Count rep when returning to start
            if self.frames_since_last_rep >= self.cooldown_frames:
                self._complete_rep()
        
        # State machine: Entering rep position
        elif is_in_position and not self.in_rep_position and self.returned_to_start:
            self.in_rep_position = True
            self.returned_to_start = False
            self.rep_start_time = datetime.datetime.now()
            self.best_metrics = self.current_metrics.copy()
            self.on_rep_started(self.current_metrics)
        
        # Update best metrics while in position
        elif self.in_rep_position:
            self.update_best_metrics(self.current_metrics, self.best_metrics)
    
    def _complete_rep(self):
        """Complete a rep - count, log, and notify."""
        self.rep_count += 1
        self.frames_since_last_rep = 0
        
        duration = (datetime.datetime.now() - self.rep_start_time).total_seconds()
        quality = self.assess_rep_quality(self.best_metrics)
        
        # Log the rep
        self._log_rep(self.best_metrics, duration, quality)
        
        # Callback for subclass
        self.on_rep_completed(self.rep_count, self.best_metrics, duration, quality)
    
    def _log_rep(self, metrics: Dict[str, Any], duration: float, quality: str):
        """Log rep to file."""
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = self._format_log_entry(timestamp, self.rep_count, metrics, duration, quality)
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")
        
        print(f"📝 {self.exercise_name}: Rep #{self.rep_count} - {quality}")
    
    def _format_log_entry(self, timestamp: str, rep_num: int, 
                         metrics: Dict[str, Any], duration: float, quality: str) -> str:
        """
        Format log entry string.
        Override in subclass to customize.
        """
        return f"{timestamp} | #{rep_num:03d} | {duration:6.1f}s | {quality}"
    
    def get_instruction(self) -> str:
        """
        Get current instruction for user.
        Returns appropriate message based on current state.
        """
        if self.in_rep_position:
            return self.get_in_position_instruction()
        elif not self.returned_to_start:
            return self.get_return_instruction()
        else:
            return self.get_ready_instruction()
    
    # Abstract methods that must be implemented by subclasses
    
    @abstractmethod
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        """
        Get required joint positions for this exercise.
        
        Returns:
            Dictionary of joint_name: position
        """
        pass
    
    @abstractmethod
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        """
        Calculate exercise-specific metrics.
        
        Returns:
            Dictionary of metric_name: value
        """
        pass
    
    @abstractmethod
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        """
        Check if currently in the rep position (e.g., bottom of squat, top of press).
        
        Returns:
            True if in rep position
        """
        pass
    
    @abstractmethod
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        """
        Check if at starting position (ready for next rep).
        
        Returns:
            True if at starting position
        """
        pass
    
    @abstractmethod
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        """
        Assess the quality of the completed rep.
        
        Returns:
            Quality description string (e.g., "Excellent", "Good", "Partial")
        """
        pass
    
    @abstractmethod
    def get_in_position_instruction(self) -> str:
        """Get instruction when in rep position."""
        pass
    
    @abstractmethod
    def get_return_instruction(self) -> str:
        """Get instruction to return to start."""
        pass
    
    @abstractmethod
    def get_ready_instruction(self) -> str:
        """Get instruction when ready for next rep."""
        pass
    
    # Optional override methods
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        """
        Update best metrics while in rep position.
        Override to customize which metrics are tracked as "best".
        """
        for key, value in current.items():
            if key not in best:
                best[key] = value
    
    def on_rep_started(self, metrics: Dict[str, Any]):
        """
        Called when rep position is entered.
        Override for custom behavior.
        """
        print(f"⬇️  {self.exercise_name} started")
    
    def on_rep_completed(self, rep_num: int, metrics: Dict[str, Any], 
                        duration: float, quality: str):
        """
        Called when rep is completed.
        Override for custom behavior.
        """
        print(f"⬆️  {self.exercise_name} completed! #{rep_num} - {quality} - {duration:.1f}s")
    
    # Helper methods for common patterns
    
    def get_bilateral_joints(self, landmarks, tracker, base_names: list) -> Dict[str, np.ndarray]:
        """
        Get joints for both left and right sides.
        
        Args:
            landmarks: MediaPipe landmarks
            tracker: JointTracker instance
            base_names: List of base joint names (e.g., ['SHOULDER', 'ELBOW'])
        
        Returns:
            Dictionary with left and right joints
        """
        joints = {}
        for name in base_names:
            joints[f'left_{name.lower()}'] = tracker.get_joint_position(landmarks, f'LEFT_{name}')
            joints[f'right_{name.lower()}'] = tracker.get_joint_position(landmarks, f'RIGHT_{name}')
        return joints
    
    def calculate_bilateral_angle(self, joints: Dict[str, np.ndarray], 
                                  joint_names: tuple) -> Optional[float]:
        """
        Calculate average angle for both sides.
        
        Args:
            joints: Dictionary of joint positions
            joint_names: Tuple of (point1_name, vertex_name, point3_name) without 'left_'/'right_' prefix
        
        Returns:
            Average angle or None if joints missing
        """
        j1, j2, j3 = joint_names
        
        left_angle = None
        right_angle = None
        
        if all(f'left_{name}' in joints for name in [j1, j2, j3]):
            left_angle = utils.calculate_angle(
                joints[f'left_{j1}'],
                joints[f'left_{j2}'],
                joints[f'left_{j3}']
            )
        
        if all(f'right_{name}' in joints for name in [j1, j2, j3]):
            right_angle = utils.calculate_angle(
                joints[f'right_{j1}'],
                joints[f'right_{j2}'],
                joints[f'right_{j3}']
            )
        
        return utils.calculate_bilateral_average(left_angle, right_angle)
