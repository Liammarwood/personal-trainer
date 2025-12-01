"""
Barbell Row exercise detector.
Tracks torso angle and elbow pull to chest.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class BarbellRowDetector(BaseExerciseDetector):
    """Detects barbell row reps."""
    
    def __init__(self, log_file='logs/barbell_row_log.txt'):
        super().__init__(
            exercise_name='Barbell Row',
            log_file=log_file,
            cooldown_frames=15
        )
        # Thresholds
        self.elbow_flexion_threshold = 90  # Elbows pulled back
        self.torso_angle_min = 45          # Bent over position
        self.torso_angle_max = 80          # Not too horizontal
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, 
                                        ['SHOULDER', 'ELBOW', 'WRIST', 'HIP', 'KNEE'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Elbow angle
        elbow_angle = self.calculate_bilateral_angle(joints, ('shoulder', 'elbow', 'wrist'))
        
        # Torso angle
        shoulder_mid = utils.get_midpoint(joints['left_shoulder'], joints['right_shoulder'])
        hip_mid = utils.get_midpoint(joints['left_hip'], joints['right_hip'])
        torso_angle = utils.calculate_torso_angle(shoulder_mid, hip_mid)
        
        # Wrist to shoulder distance (pull height)
        left_pull_dist = utils.calculate_distance_2d(joints['left_wrist'], joints['left_shoulder'])
        right_pull_dist = utils.calculate_distance_2d(joints['right_wrist'], joints['right_shoulder'])
        avg_pull_dist = (left_pull_dist + right_pull_dist) / 2
        
        return {
            'elbow_angle': elbow_angle,
            'torso_angle': torso_angle,
            'pull_distance': avg_pull_dist
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: elbows pulled back, wrists near chest
        return (metrics['elbow_angle'] < self.elbow_flexion_threshold and
                self.torso_angle_min < metrics['torso_angle'] < self.torso_angle_max)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: arms extended down
        return (metrics['elbow_angle'] > 160 and
                self.torso_angle_min < metrics['torso_angle'] < self.torso_angle_max)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['elbow_angle'] < 80 and metrics['pull_distance'] < 0.15:
            return "Excellent - Full contraction"
        elif metrics['elbow_angle'] < 90:
            return "Good - Solid pull"
        else:
            return "Partial - Pull higher"
    
    def get_in_position_instruction(self) -> str:
        return "PULLING - Squeeze shoulder blades"
    
    def get_return_instruction(self) -> str:
        return "EXTEND - Lower with control"
    
    def get_ready_instruction(self) -> str:
        return "READY - Hinge and pull to chest"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        if current['elbow_angle'] < best.get('elbow_angle', 180):
            best['elbow_angle'] = current['elbow_angle']
            best['pull_distance'] = current['pull_distance']
