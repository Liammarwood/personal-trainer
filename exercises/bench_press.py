"""
Bench Press exercise detector.
Tracks arm extension from chest level.
"""

from typing import Dict, Any
import numpy as np
from exercises.base_exercise import BaseExerciseDetector
from exercises import utils


class BenchPressDetector(BaseExerciseDetector):
    """Detects bench press reps."""
    
    def __init__(self, log_file='logs/bench_press_log.txt'):
        super().__init__(
            exercise_name='Bench Press',
            log_file=log_file,
            cooldown_frames=20
        )
        # Thresholds
        self.elbow_extension_threshold = 165  # Locked out
        self.elbow_flexion_threshold = 90     # Lowered to chest
        self.wrist_shoulder_distance = 0.12   # Wrists near chest
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, 
                                        ['SHOULDER', 'ELBOW', 'WRIST'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Elbow angle
        elbow_angle = self.calculate_bilateral_angle(joints, ('shoulder', 'elbow', 'wrist'))
        
        # Wrist to shoulder distance (depth)
        left_depth = utils.calculate_distance_2d(joints['left_wrist'], joints['left_shoulder'])
        right_depth = utils.calculate_distance_2d(joints['right_wrist'], joints['right_shoulder'])
        avg_depth = (left_depth + right_depth) / 2
        
        return {
            'elbow_angle': elbow_angle,
            'press_depth': avg_depth
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: arms extended, locked out
        return metrics['elbow_angle'] > self.elbow_extension_threshold
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: bar at chest, elbows bent
        return (metrics['elbow_angle'] < self.elbow_flexion_threshold and
                metrics['press_depth'] < self.wrist_shoulder_distance)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['elbow_angle'] > 170:
            return "Excellent - Full lockout"
        elif metrics['elbow_angle'] > 165:
            return "Good - Nearly locked"
        else:
            return "Incomplete - Lock arms"
    
    def get_in_position_instruction(self) -> str:
        return "LOCKED OUT - Hold"
    
    def get_return_instruction(self) -> str:
        return "LOWER - Touch chest"
    
    def get_ready_instruction(self) -> str:
        return "READY - Press to lockout"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        if current['elbow_angle'] > best.get('elbow_angle', 0):
            best['elbow_angle'] = current['elbow_angle']
