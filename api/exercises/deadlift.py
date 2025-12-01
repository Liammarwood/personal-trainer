"""
Deadlift exercise detector.
Tracks hip hinge, back angle, and lockout position.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class DeadliftDetector(BaseExerciseDetector):
    """Detects deadlift reps with proper form."""
    
    def __init__(self, log_file='logs/deadlift_log.txt'):
        super().__init__(
            exercise_name='Deadlift',
            log_file=log_file,
            cooldown_frames=20
        )
        # Thresholds
        self.hip_angle_threshold = 160  # Lockout position
        self.bottom_hip_angle = 100     # Bottom position
        self.torso_angle_threshold = 30 # Nearly vertical at top
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return {
            'left_shoulder': tracker.get_joint_position(landmarks, 'LEFT_SHOULDER'),
            'right_shoulder': tracker.get_joint_position(landmarks, 'RIGHT_SHOULDER'),
            'left_hip': tracker.get_joint_position(landmarks, 'LEFT_HIP'),
            'right_hip': tracker.get_joint_position(landmarks, 'RIGHT_HIP'),
            'left_knee': tracker.get_joint_position(landmarks, 'LEFT_KNEE'),
            'right_knee': tracker.get_joint_position(landmarks, 'RIGHT_KNEE'),
            'left_ankle': tracker.get_joint_position(landmarks, 'LEFT_ANKLE'),
            'right_ankle': tracker.get_joint_position(landmarks, 'RIGHT_ANKLE'),
        }
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Calculate hip angle (hip extension)
        left_hip_angle = utils.calculate_angle(
            joints['left_shoulder'], joints['left_hip'], joints['left_knee']
        )
        right_hip_angle = utils.calculate_angle(
            joints['right_shoulder'], joints['right_hip'], joints['right_knee']
        )
        avg_hip_angle = (left_hip_angle + right_hip_angle) / 2
        
        # Calculate torso angle (from vertical)
        shoulder_mid = utils.get_midpoint(joints['left_shoulder'], joints['right_shoulder'])
        hip_mid = utils.get_midpoint(joints['left_hip'], joints['right_hip'])
        torso_angle = utils.calculate_torso_angle(shoulder_mid, hip_mid)
        
        # Calculate knee angles
        left_knee_angle = utils.calculate_angle(
            joints['left_hip'], joints['left_knee'], joints['left_ankle']
        )
        right_knee_angle = utils.calculate_angle(
            joints['right_hip'], joints['right_knee'], joints['right_ankle']
        )
        avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
        
        return {
            'hip_angle': avg_hip_angle,
            'torso_angle': torso_angle,
            'knee_angle': avg_knee_angle
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom position: hips hinged, knees bent
        return (metrics['hip_angle'] < self.bottom_hip_angle and
                metrics['knee_angle'] < 160)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Lockout: hips extended, torso upright
        return (metrics['hip_angle'] > self.hip_angle_threshold and
                metrics['torso_angle'] < self.torso_angle_threshold)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['hip_angle'] > 165:
            return "Excellent - Full lockout"
        elif metrics['hip_angle'] > 160:
            return "Good - Nearly locked"
        else:
            return "Incomplete lockout"
    
    def get_in_position_instruction(self) -> str:
        return "PULLING - Drive through heels"
    
    def get_return_instruction(self) -> str:
        return "LOCKOUT - Stand fully upright"
    
    def get_ready_instruction(self) -> str:
        return "READY - Hinge and grip bar"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        # Track maximum hip extension (lockout)
        if current['hip_angle'] > best.get('hip_angle', 0):
            best['hip_angle'] = current['hip_angle']
        if current['torso_angle'] < best.get('torso_angle', 90):
            best['torso_angle'] = current['torso_angle']
