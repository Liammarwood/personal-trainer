"""
Front Raise exercise detector.
Tracks arm raising forward to shoulder height.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class FrontRaiseDetector(BaseExerciseDetector):
    """Detects front raise reps."""
    
    def __init__(self, log_file='logs/front_raise_log.txt'):
        super().__init__(
            exercise_name='Front Raise',
            log_file=log_file,
            cooldown_frames=15
        )
        # Thresholds
        self.wrist_height_threshold = -0.2  # Wrists above shoulders
        self.arm_angle_threshold = 100      # Arm raised forward
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, 
                                        ['SHOULDER', 'ELBOW', 'WRIST', 'HIP'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Wrist height relative to shoulder
        left_height = utils.calculate_vertical_distance(
            joints['left_wrist'], joints['left_shoulder']
        )
        right_height = utils.calculate_vertical_distance(
            joints['right_wrist'], joints['right_shoulder']
        )
        avg_height = (left_height + right_height) / 2
        
        # Shoulder-wrist angle (arm elevation)
        shoulder_mid = utils.get_midpoint(joints['left_shoulder'], joints['right_shoulder'])
        hip_mid = utils.get_midpoint(joints['left_hip'], joints['right_hip'])
        wrist_mid = utils.get_midpoint(joints['left_wrist'], joints['right_wrist'])
        
        arm_angle = utils.calculate_angle(hip_mid, shoulder_mid, wrist_mid)
        
        return {
            'wrist_height': avg_height,
            'arm_angle': arm_angle
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: arms raised to shoulder height
        return (metrics['wrist_height'] < self.wrist_height_threshold or
                metrics['arm_angle'] < self.arm_angle_threshold)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: arms down at sides
        return (metrics['wrist_height'] > 0 and
                metrics['arm_angle'] > 160)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['wrist_height'] < -0.25:
            return "Excellent - Above shoulders"
        elif metrics['wrist_height'] < -0.15:
            return "Good - Shoulder height"
        else:
            return "Low - Raise higher"
    
    def get_in_position_instruction(self) -> str:
        return "RAISED - Hold at top"
    
    def get_return_instruction(self) -> str:
        return "LOWER - Control descent"
    
    def get_ready_instruction(self) -> str:
        return "READY - Raise arms forward"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        if current['wrist_height'] < best.get('wrist_height', 1):
            best['wrist_height'] = current['wrist_height']
            best['arm_angle'] = current['arm_angle']
