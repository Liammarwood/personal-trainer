"""
Shoulder Press exercise detector.
Tracks overhead press with full lockout.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class ShoulderPressDetector(BaseExerciseDetector):
    """Detects shoulder press reps."""
    
    def __init__(self, log_file='logs/shoulder_press_log.txt'):
        super().__init__(
            exercise_name='Shoulder Press',
            log_file=log_file,
            cooldown_frames=15
        )
        # Thresholds
        self.elbow_extension_threshold = 160  # Arms extended overhead
        self.wrist_height_threshold = 0.3     # Wrists above shoulders
        self.starting_angle = 140             # Arms bent at start
        self.starting_height = -0.15          # Wrists near/below shoulders
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, ['SHOULDER', 'ELBOW', 'WRIST'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Elbow extension angle
        elbow_angle = self.calculate_bilateral_angle(joints, ('shoulder', 'elbow', 'wrist'))
        
        # Wrist height relative to shoulders (negative = above)
        left_height = float(joints['left_wrist'][1] - joints['left_shoulder'][1])
        right_height = float(joints['right_wrist'][1] - joints['right_shoulder'][1])
        wrist_height = (left_height + right_height) / 2
        
        return {
            'elbow_angle': elbow_angle,
            'wrist_height': wrist_height
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Top: arms extended overhead
        return (metrics['elbow_angle'] > self.elbow_extension_threshold and
                metrics['wrist_height'] < -self.wrist_height_threshold)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Bottom: arms bent at shoulder level
        return (metrics['elbow_angle'] < self.starting_angle and
                metrics['wrist_height'] > self.starting_height)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['elbow_angle'] > 170 and abs(metrics['wrist_height']) > 0.35:
            return "Excellent - Full lockout"
        elif metrics['elbow_angle'] > 165 and abs(metrics['wrist_height']) > 0.30:
            return "Good - Nearly full"
        elif metrics['elbow_angle'] > 160:
            return "Fair - Partial lockout"
        else:
            return "Incomplete - Extend more"
    
    def get_in_position_instruction(self) -> str:
        return "OVERHEAD - Locked out"
    
    def get_return_instruction(self) -> str:
        return "LOWER - Control descent"
    
    def get_ready_instruction(self) -> str:
        extension_status = ""
        overhead_status = ""
        
        if hasattr(self, '_last_metrics'):
            if self._last_metrics['elbow_angle'] < self.elbow_extension_threshold:
                extension_status = " - EXTEND ARMS"
            if self._last_metrics['wrist_height'] >= -self.wrist_height_threshold:
                overhead_status = " - RAISE HIGHER"
        
        return f"READY - Press overhead{extension_status}{overhead_status}"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        # Track best extension and height
        if current['elbow_angle'] > best.get('elbow_angle', 0):
            best['elbow_angle'] = current['elbow_angle']
        if current['wrist_height'] < best.get('wrist_height', 1):
            best['wrist_height'] = current['wrist_height']
