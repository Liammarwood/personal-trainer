"""
Utility functions for exercise detection.
Provides common calculations and helpers used across all exercise detectors.
"""

import numpy as np
from typing import Optional, Tuple, List


def calculate_angle(point_a: np.ndarray, point_b: np.ndarray, point_c: np.ndarray) -> float:
    """
    Calculate angle at point B formed by points A-B-C.
    
    Args:
        point_a: First point [x, y, z]
        point_b: Vertex point [x, y, z]
        point_c: Third point [x, y, z]
    
    Returns:
        Angle in degrees
    """
    ba = point_a - point_b
    bc = point_c - point_b
    
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    
    return float(np.degrees(angle))


def calculate_distance_2d(point_a: np.ndarray, point_b: np.ndarray) -> float:
    """
    Calculate 2D Euclidean distance between two points (x, y only).
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
    
    Returns:
        Distance (normalized coordinates)
    """
    return float(np.linalg.norm(point_a[:2] - point_b[:2]))


def calculate_distance_3d(point_a: np.ndarray, point_b: np.ndarray) -> float:
    """
    Calculate 3D Euclidean distance between two points.
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
    
    Returns:
        Distance (normalized coordinates)
    """
    return float(np.linalg.norm(point_a - point_b))


def calculate_vertical_distance(point_a: np.ndarray, point_b: np.ndarray) -> float:
    """
    Calculate vertical distance (y-axis) between two points.
    Positive value means point_a is below point_b.
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
    
    Returns:
        Vertical distance
    """
    return float(point_a[1] - point_b[1])


def calculate_horizontal_distance(point_a: np.ndarray, point_b: np.ndarray) -> float:
    """
    Calculate horizontal distance (x-axis) between two points.
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
    
    Returns:
        Horizontal distance
    """
    return float(abs(point_a[0] - point_b[0]))


def get_midpoint(point_a: np.ndarray, point_b: np.ndarray) -> np.ndarray:
    """
    Calculate midpoint between two points.
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
    
    Returns:
        Midpoint coordinates
    """
    return (point_a + point_b) / 2


def is_point_above(point_a: np.ndarray, point_b: np.ndarray, threshold: float = 0.0) -> bool:
    """
    Check if point_a is above point_b (lower y value in image coordinates).
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
        threshold: Minimum difference to consider "above"
    
    Returns:
        True if point_a is above point_b
    """
    return point_a[1] < (point_b[1] - threshold)


def is_point_below(point_a: np.ndarray, point_b: np.ndarray, threshold: float = 0.0) -> bool:
    """
    Check if point_a is below point_b (higher y value in image coordinates).
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
        threshold: Minimum difference to consider "below"
    
    Returns:
        True if point_a is below point_b
    """
    return point_a[1] > (point_b[1] + threshold)


def is_aligned_vertically(point_a: np.ndarray, point_b: np.ndarray, tolerance: float = 0.05) -> bool:
    """
    Check if two points are vertically aligned (similar x coordinates).
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
        tolerance: Maximum horizontal difference to consider aligned
    
    Returns:
        True if points are vertically aligned
    """
    return abs(point_a[0] - point_b[0]) < tolerance


def is_aligned_horizontally(point_a: np.ndarray, point_b: np.ndarray, tolerance: float = 0.05) -> bool:
    """
    Check if two points are horizontally aligned (similar y coordinates).
    
    Args:
        point_a: First point [x, y, z]
        point_b: Second point [x, y, z]
        tolerance: Maximum vertical difference to consider aligned
    
    Returns:
        True if points are horizontally aligned
    """
    return abs(point_a[1] - point_b[1]) < tolerance


def calculate_torso_angle(shoulder: np.ndarray, hip: np.ndarray) -> float:
    """
    Calculate torso angle relative to vertical.
    0° = upright, 90° = horizontal, 180° = upside down
    
    Args:
        shoulder: Shoulder position [x, y, z]
        hip: Hip position [x, y, z]
    
    Returns:
        Angle in degrees from vertical
    """
    # Create vertical reference point
    vertical_ref = shoulder.copy()
    vertical_ref[1] += 1.0  # Point directly below shoulder
    
    return calculate_angle(vertical_ref, shoulder, hip)


def get_joints_from_landmarks(landmarks, tracker, joint_names: List[str]) -> List[Optional[np.ndarray]]:
    """
    Get multiple joint positions at once.
    
    Args:
        landmarks: MediaPipe pose landmarks
        tracker: JointTracker instance
        joint_names: List of joint names to retrieve
    
    Returns:
        List of joint positions (None if not found)
    """
    return [tracker.get_joint_position(landmarks, name) for name in joint_names]


def all_joints_detected(joints: List[Optional[np.ndarray]]) -> bool:
    """
    Check if all joints in list are detected (not None).
    
    Args:
        joints: List of joint positions
    
    Returns:
        True if all joints are detected
    """
    return all(joint is not None for joint in joints)


def calculate_average_angle(angles: List[float]) -> float:
    """
    Calculate average of multiple angles.
    
    Args:
        angles: List of angles in degrees
    
    Returns:
        Average angle
    """
    return float(np.mean(angles))


def calculate_bilateral_average(left_value: Optional[float], 
                               right_value: Optional[float]) -> Optional[float]:
    """
    Calculate average of left and right side measurements.
    
    Args:
        left_value: Left side measurement
        right_value: Right side measurement
    
    Returns:
        Average or None if both are None
    """
    if left_value is None and right_value is None:
        return None
    if left_value is None:
        return right_value
    if right_value is None:
        return left_value
    return (left_value + right_value) / 2


def is_joint_extended(angle: float, threshold: float = 160.0) -> bool:
    """
    Check if a joint is extended (nearly straight).
    
    Args:
        angle: Joint angle in degrees
        threshold: Minimum angle to consider extended
    
    Returns:
        True if joint is extended
    """
    return angle > threshold


def is_joint_flexed(angle: float, threshold: float = 120.0) -> bool:
    """
    Check if a joint is flexed (bent).
    
    Args:
        angle: Joint angle in degrees
        threshold: Maximum angle to consider flexed
    
    Returns:
        True if joint is flexed
    """
    return angle < threshold


def map_value(value: float, from_min: float, from_max: float, 
              to_min: float, to_max: float) -> float:
    """
    Map a value from one range to another.
    
    Args:
        value: Input value
        from_min: Input range minimum
        from_max: Input range maximum
        to_min: Output range minimum
        to_max: Output range maximum
    
    Returns:
        Mapped value
    """
    return to_min + (value - from_min) * (to_max - to_min) / (from_max - from_min)


def clamp(value: float, min_val: float, max_val: float) -> float:
    """
    Clamp a value between minimum and maximum.
    
    Args:
        value: Input value
        min_val: Minimum value
        max_val: Maximum value
    
    Returns:
        Clamped value
    """
    return max(min_val, min(max_val, value))


class MovingAverage:
    """Simple moving average filter for smoothing measurements."""
    
    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self.values = []
    
    def add(self, value: float) -> float:
        """Add a value and return the current average."""
        self.values.append(value)
        if len(self.values) > self.window_size:
            self.values.pop(0)
        return sum(self.values) / len(self.values)
    
    def reset(self):
        """Reset the moving average."""
        self.values = []
    
    def get_average(self) -> Optional[float]:
        """Get current average without adding a value."""
        if not self.values:
            return None
        return sum(self.values) / len(self.values)
