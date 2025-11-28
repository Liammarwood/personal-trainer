"""
Romanian Deadlift exercise detector.
Focuses on hamstring stretch and hip hinge with straighter legs.
"""

from typing import Dict, Any
import numpy as np
from exercises.base_exercise import BaseExerciseDetector
from exercises import utils


class RomanianDeadliftDetector(BaseExerciseDetector):
    """Detects Romanian deadlift reps (straight-leg hip hinge)."""
    
    def __init__(self, log_file='logs/romanian_deadlift_log.txt'):
        super().__init__(
            exercise_name='Romanian Deadlift',
            log_file=log_file,
            cooldown_frames=20
        )
        # Thresholds
        self.hip_angle_threshold = 165  # Nearly fully extended at top
        self.bottom_hip_angle = 100     # Hip flexion at bottom
        self.knee_angle_min = 160       # Knees stay relatively straight
        self.torso_angle_bottom = 80    # Forward lean at bottom
    
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
        # Hip angle
        hip_angle = self.calculate_bilateral_angle(joints, ('shoulder', 'hip', 'knee'))
        
        # Torso angle from vertical
        shoulder_mid = utils.get_midpoint(joints['left_shoulder'], joints['right_shoulder'])
        hip_mid = utils.get_midpoint(joints['left_hip'], joints['right_hip'])
        torso_angle = utils.calculate_torso_angle(shoulder_mid, hip_mid)
        
        # Knee angle (should stay straight)
        knee_angle = self.calculate_bilateral_angle(joints, ('hip', 'knee', 'ankle'))
        
        # Hamstring stretch indicator (torso forward, legs straight)
        stretch_depth = torso_angle if knee_angle > self.knee_angle_min else 0
        
        return {
            'hip_angle': hip_angle,
            'torso_angle': torso_angle,
            'knee_angle': knee_angle,
            'stretch_depth': stretch_depth
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: hips hinged, torso leaning forward, knees straight
        return (metrics['hip_angle'] < self.bottom_hip_angle and
                metrics['knee_angle'] > self.knee_angle_min and
                metrics['torso_angle'] > self.torso_angle_bottom)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: standing upright, hips extended
        return (metrics['hip_angle'] > self.hip_angle_threshold and
                metrics['torso_angle'] < 30)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['stretch_depth'] > 85 and metrics['knee_angle'] > 165:
            return "Excellent - Deep stretch, straight legs"
        elif metrics['stretch_depth'] > 75:
            return "Good - Good hamstring stretch"
        elif metrics['knee_angle'] < 160:
            return "Knees bent - Keep legs straighter"
        else:
            return "Shallow - Go deeper"
    
    def get_in_position_instruction(self) -> str:
        return "HINGING - Feel hamstring stretch"
    
    def get_return_instruction(self) -> str:
        return "STAND UP - Drive hips forward"
    
    def get_ready_instruction(self) -> str:
        return "READY - Hinge at hips, keep legs straight"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        # Track deepest stretch with straight legs
        if current['stretch_depth'] > best.get('stretch_depth', 0):
            best['stretch_depth'] = current['stretch_depth']
            best['hip_angle'] = current['hip_angle']
            best['knee_angle'] = current['knee_angle']
