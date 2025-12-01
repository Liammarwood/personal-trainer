"""
Calf Raise exercise detector.
Tracks ankle extension and heel height.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class CalfRaiseDetector(BaseExerciseDetector):
    """Detects calf raise reps."""
    
    def __init__(self, log_file='logs/calf_raise_log.txt'):
        super().__init__(
            exercise_name='Calf Raise',
            log_file=log_file,
            cooldown_frames=15
        )
        # Thresholds
        self.heel_lift_threshold = 0.08  # Minimum heel lift height
        self.ankle_angle_extended = 135  # Ankle extension at top
        self.ankle_angle_flexed = 100    # Ankle flexion at bottom
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return {
            'left_knee': tracker.get_joint_position(landmarks, 'LEFT_KNEE'),
            'right_knee': tracker.get_joint_position(landmarks, 'RIGHT_KNEE'),
            'left_ankle': tracker.get_joint_position(landmarks, 'LEFT_ANKLE'),
            'right_ankle': tracker.get_joint_position(landmarks, 'RIGHT_ANKLE'),
            'left_heel': tracker.get_joint_position(landmarks, 'LEFT_HEEL'),
            'right_heel': tracker.get_joint_position(landmarks, 'RIGHT_HEEL'),
            'left_foot_index': tracker.get_joint_position(landmarks, 'LEFT_FOOT_INDEX'),
            'right_foot_index': tracker.get_joint_position(landmarks, 'RIGHT_FOOT_INDEX'),
        }
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Ankle angle (knee-ankle-toe)
        ankle_angle = self.calculate_bilateral_angle(joints, ('knee', 'ankle', 'foot_index'))
        
        # Heel height (ankle to heel vertical distance)
        left_heel_height = utils.calculate_vertical_distance(
            joints['left_heel'], joints['left_ankle']
        )
        right_heel_height = utils.calculate_vertical_distance(
            joints['right_heel'], joints['right_ankle']
        )
        avg_heel_height = abs((left_heel_height + right_heel_height) / 2)
        
        return {
            'ankle_angle': ankle_angle,
            'heel_height': avg_heel_height
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: heels raised high, ankle extended
        return (metrics['ankle_angle'] > self.ankle_angle_extended or
                metrics['heel_height'] > self.heel_lift_threshold)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: heels down, ankle flexed
        return (metrics['ankle_angle'] < self.ankle_angle_flexed and
                metrics['heel_height'] < self.heel_lift_threshold * 0.5)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['heel_height'] > 0.12:
            return "Excellent - Full extension"
        elif metrics['heel_height'] > 0.08:
            return "Good - Adequate height"
        else:
            return "Shallow - Raise higher"
    
    def get_in_position_instruction(self) -> str:
        return "RAISED - Hold at top"
    
    def get_return_instruction(self) -> str:
        return "LOWER - Control descent"
    
    def get_ready_instruction(self) -> str:
        return "READY - Push up on toes"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        if current['heel_height'] > best.get('heel_height', 0):
            best['heel_height'] = current['heel_height']
            best['ankle_angle'] = current['ankle_angle']
