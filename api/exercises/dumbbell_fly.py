"""
Dumbbell Fly exercise detector.
Tracks arm spreading and chest stretch.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class DumbbellFlyDetector(BaseExerciseDetector):
    """Detects dumbbell fly reps."""
    
    def __init__(self, log_file='logs/dumbbell_fly_log.txt'):
        super().__init__(
            exercise_name='Dumbbell Fly',
            log_file=log_file,
            cooldown_frames=15
        )
        # Thresholds
        self.wrist_distance_closed = 0.15  # Wrists close together
        self.wrist_distance_open = 0.5     # Arms spread wide
        self.elbow_angle_min = 150         # Slight bend in elbows
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, 
                                        ['SHOULDER', 'ELBOW', 'WRIST'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Distance between wrists (fly opening)
        wrist_distance = utils.calculate_distance_2d(
            joints['left_wrist'], joints['right_wrist']
        )
        
        # Elbow angle (should stay slightly bent)
        elbow_angle = self.calculate_bilateral_angle(joints, ('shoulder', 'elbow', 'wrist'))
        
        # Shoulder to wrist distance (arm length)
        left_arm_length = utils.calculate_distance_2d(
            joints['left_shoulder'], joints['left_wrist']
        )
        right_arm_length = utils.calculate_distance_2d(
            joints['right_shoulder'], joints['right_wrist']
        )
        avg_arm_length = (left_arm_length + right_arm_length) / 2
        
        return {
            'wrist_distance': wrist_distance,
            'elbow_angle': elbow_angle,
            'arm_length': avg_arm_length
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Closed: wrists together at center
        return metrics['wrist_distance'] < self.wrist_distance_closed
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Open: arms spread wide
        return (metrics['wrist_distance'] > self.wrist_distance_open and
                metrics['elbow_angle'] > self.elbow_angle_min)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['wrist_distance'] > 0.6 and metrics['elbow_angle'] > 150:
            return "Excellent - Full chest stretch"
        elif metrics['wrist_distance'] > 0.5:
            return "Good - Good stretch"
        elif metrics['elbow_angle'] < 140:
            return "Bent elbows - Keep arms straighter"
        else:
            return "Shallow - Open wider"
    
    def get_in_position_instruction(self) -> str:
        return "CLOSED - Squeeze chest"
    
    def get_return_instruction(self) -> str:
        return "OPEN - Stretch chest wide"
    
    def get_ready_instruction(self) -> str:
        return "READY - Bring dumbbells together"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        # Track widest opening with proper form
        if current['wrist_distance'] > best.get('wrist_distance', 0):
            if current['elbow_angle'] > self.elbow_angle_min:
                best['wrist_distance'] = current['wrist_distance']
                best['elbow_angle'] = current['elbow_angle']
