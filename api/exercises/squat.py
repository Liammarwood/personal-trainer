"""
Squat exercise detector.
Tracks full depth squats with hip-knee alignment.
"""

from typing import Dict, Any
import numpy as np
from api.exercises.base_exercise import BaseExerciseDetector
from api.exercises import utils


class SquatDetector(BaseExerciseDetector):
    """Detects full squats with depth tracking."""
    
    def __init__(self, log_file='logs/squat_log.txt'):
        super().__init__(
            exercise_name='Squat',
            log_file=log_file,
            cooldown_frames=30
        )
        # Thresholds
        self.knee_angle_threshold = 100    # Knee angle < 100° for full squat
        self.depth_threshold = 0.15        # Hip-knee vertical distance < 0.15
        self.standing_angle = 160          # Knee angle > 160° when standing
        self.standing_depth = 0.25         # Hip-knee distance > 0.25 when standing
    
    def get_required_joints(self, landmarks, tracker) -> Dict[str, np.ndarray]:
        return self.get_bilateral_joints(landmarks, tracker, ['HIP', 'KNEE', 'ANKLE'])
    
    def calculate_metrics(self, joints: Dict[str, np.ndarray], tracker) -> Dict[str, Any]:
        # Calculate knee angles (both sides)
        knee_angle = self.calculate_bilateral_angle(joints, ('hip', 'knee', 'ankle'))
        
        # Calculate squat depth (hip-knee vertical distance)
        left_depth = abs(float(joints['left_hip'][1]) - float(joints['left_knee'][1]))
        right_depth = abs(float(joints['right_hip'][1]) - float(joints['right_knee'][1]))
        squat_depth = (left_depth + right_depth) / 2
        
        return {
            'knee_angle': knee_angle,
            'squat_depth': squat_depth
        }
    
    def is_in_rep_position(self, metrics: Dict[str, Any]) -> bool:
        # Full squat position: knee angle low AND hip near knee
        return (metrics['knee_angle'] < self.knee_angle_threshold and
                metrics['squat_depth'] < self.depth_threshold)
    
    def is_at_starting_position(self, metrics: Dict[str, Any]) -> bool:
        # Standing position: knees extended and hips high
        return (metrics['knee_angle'] > self.standing_angle and
                metrics['squat_depth'] > self.standing_depth)
    
    def assess_rep_quality(self, metrics: Dict[str, Any]) -> str:
        if metrics['squat_depth'] < 0.10:
            return "Excellent - ATG (Ass to Grass)"
        elif metrics['squat_depth'] < 0.15:
            return "Good - Full depth / Parallel"
        elif metrics['squat_depth'] < 0.20:
            return "Fair - Just below parallel"
        else:
            return "Shallow - Go deeper"
    
    def get_in_position_instruction(self) -> str:
        return "FULL SQUAT - Hold at bottom"
    
    def get_return_instruction(self) -> str:
        return "STAND UP - Return to top"
    
    def get_ready_instruction(self) -> str:
        depth_status = ""
        if hasattr(self, '_last_metrics'):
            if self._last_metrics['knee_angle'] < self.knee_angle_threshold:
                if self._last_metrics['squat_depth'] >= self.depth_threshold:
                    depth_status = " - GO DEEPER!"
                else:
                    depth_status = " - FULL DEPTH!"
        
        return f"READY - Squat down{depth_status}"
    
    def update_best_metrics(self, current: Dict[str, Any], best: Dict[str, Any]):
        # Track deepest squat (lowest depth value)
        if current['squat_depth'] < best.get('squat_depth', 1):
            best['squat_depth'] = current['squat_depth']
            best['knee_angle'] = current['knee_angle']
