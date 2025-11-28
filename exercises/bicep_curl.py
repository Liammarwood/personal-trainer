"""
Bicep Curl exercise detector.
Tracks elbow flexion while keeping upper arm stable.
"""

from typing import Dict, Any
import numpy as np
from exercises.base_exercise import BaseExerciseDetector
from exercises import utils


class BicepCurlDetector(BaseExerciseDetector):
    """Detects bicep curl reps."""
    
    def __init__(self, log_file='logs/bicep_curl_log.txt'):
        super().__init__(
            exercise_name='Bicep Curl',
            log_file=log_file,
            cooldown_frames=15
        )
        # Thresholds
        self.elbow_flexion_threshold = 50   # Fully curled
        self.elbow_extension_threshold = 160 # Fully extended
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, 
                                        ['SHOULDER', 'ELBOW', 'WRIST'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Elbow angle
        elbow_angle = self.calculate_bilateral_angle(joints, ('shoulder', 'elbow', 'wrist'))
        
        # Wrist height relative to shoulder (curl height)
        left_curl_height = utils.calculate_vertical_distance(
            joints['left_shoulder'], joints['left_wrist']
        )
        right_curl_height = utils.calculate_vertical_distance(
            joints['right_shoulder'], joints['right_wrist']
        )
        avg_curl_height = abs((left_curl_height + right_curl_height) / 2)
        
        return {
            'elbow_angle': elbow_angle,
            'curl_height': avg_curl_height
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: elbow fully flexed
        return metrics['elbow_angle'] < self.elbow_flexion_threshold
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: arms extended
        return metrics['elbow_angle'] > self.elbow_extension_threshold
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['elbow_angle'] < 40:
            return "Excellent - Full contraction"
        elif metrics['elbow_angle'] < 50:
            return "Good - Full curl"
        else:
            return "Partial - Curl higher"
    
    def get_in_position_instruction(self) -> str:
        return "CURLED - Squeeze biceps"
    
    def get_return_instruction(self) -> str:
        return "LOWER - Control descent"
    
    def get_ready_instruction(self) -> str:
        return "READY - Curl weights to shoulders"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        if current['elbow_angle'] < best.get('elbow_angle', 180):
            best['elbow_angle'] = current['elbow_angle']
            best['curl_height'] = current['curl_height']
