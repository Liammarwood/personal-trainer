"""
Squat Detection and Logging
Detects when a user performs a squat and logs the activity.
"""

import cv2
import numpy as np
import datetime
from joint_tracker import JointTracker
from event_handlers import JointAngleHandler


class SquatDetector(JointAngleHandler):
    """
    Detects full squats by monitoring knee angle AND hip-knee vertical alignment.
    A full squat requires hip to drop to near knee level (not just knee bend).
    """
    
    def __init__(self, log_file='squat_log.txt', angle_threshold=100, depth_threshold=0.15):
        """
        Initialize squat detector.
        
        Args:
            log_file: Path to log file for recording squats
            angle_threshold: Knee angle threshold in degrees (typical squat < 100°)
            depth_threshold: Maximum vertical distance between hip and knee (normalized coords)
                           Lower values = deeper squat required (0.15 = parallel or below)
        """
        # Monitor left knee angle (hip-knee-ankle)
        super().__init__(
            joint1_name='LEFT_HIP',
            joint2_name='LEFT_KNEE',  # Vertex joint
            joint3_name='LEFT_ANKLE',
            angle_threshold=angle_threshold,
            comparison='less',  # Trigger when angle goes below threshold
            cooldown_frames=30
        )
        
        self.log_file = log_file
        self.depth_threshold = depth_threshold
        self.squat_count = 0
        self.in_squat_position = False
        self.returned_to_standing = True  # Track if user returned to standing position
        self.squat_start_time = None
        self.min_angle_achieved = None
        self.min_depth_achieved = None  # Track best depth (hip-knee distance)
        
        # Also track right knee for averaging
        self.right_knee_angle = None
        
        # Initialize log file with header
        self._initialize_log()
    
    def _initialize_log(self):
        """Create log file with header if it doesn't exist."""
        try:
            with open(self.log_file, 'x') as f:
                f.write("Squat Activity Log\n")
                f.write("=" * 80 + "\n")
                f.write(f"Started: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 80 + "\n\n")
                f.write("Timestamp | Squat # | Angle | Depth | Duration (s) | Quality\n")
                f.write("-" * 80 + "\n")
        except FileExistsError:
            # File already exists, append to it
            pass
    
    def calculate_knee_angle(self, landmarks, tracker, side='LEFT'):
        """Calculate knee angle for specified side."""
        hip = tracker.get_joint_position(landmarks, f'{side}_HIP')
        knee = tracker.get_joint_position(landmarks, f'{side}_KNEE')
        ankle = tracker.get_joint_position(landmarks, f'{side}_ANKLE')
        
        if hip is None or knee is None or ankle is None:
            return None
        
        return self.calculate_angle(hip, knee, ankle)
    
    def calculate_squat_depth(self, landmarks, tracker):
        """
        Calculate squat depth by measuring vertical distance between hip and knee.
        Returns average of both sides. Lower value = deeper squat.
        
        Returns:
            Float: Vertical distance (y-axis), or None if joints not detected
        """
        left_hip = tracker.get_joint_position(landmarks, 'LEFT_HIP')
        left_knee = tracker.get_joint_position(landmarks, 'LEFT_KNEE')
        right_hip = tracker.get_joint_position(landmarks, 'RIGHT_HIP')
        right_knee = tracker.get_joint_position(landmarks, 'RIGHT_KNEE')
        
        if left_hip is None or left_knee is None or right_hip is None or right_knee is None:
            return None
        
        # Calculate vertical distance (y-coordinate difference)
        # In image coords, y increases downward, so hip.y - knee.y when squatting deep
        left_depth = abs(float(left_hip[1]) - float(left_knee[1]))
        right_depth = abs(float(right_hip[1]) - float(right_knee[1]))
        
        return float((left_depth + right_depth) / 2)
    
    def is_standing_position(self, avg_knee_angle, squat_depth):
        """
        Check if user is in standing position (knees extended, hips high).
        Standing position: knees nearly straight (>160°) and hips well above knees.
        """
        knees_extended = avg_knee_angle > 160
        hips_high = squat_depth > 0.25  # Hip significantly above knee
        
        return knees_extended and hips_high
    
    def on_joints_detected(self, current_landmarks, previous_landmarks, frame, tracker):
        """Override to track both knees and squat depth for full squat detection."""
        # Calculate both knee angles
        left_knee_angle = self.calculate_knee_angle(current_landmarks, tracker, 'LEFT')
        right_knee_angle = self.calculate_knee_angle(current_landmarks, tracker, 'RIGHT')
        
        # Calculate squat depth (hip-knee vertical alignment)
        squat_depth = self.calculate_squat_depth(current_landmarks, tracker)
        
        if left_knee_angle is None or right_knee_angle is None or squat_depth is None:
            return
        
        # Use average of both knees for more robust detection
        avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
        
        # Check if in standing position
        is_standing = self.is_standing_position(avg_knee_angle, squat_depth)
        
        # Display current angle and depth on frame
        self._draw_feedback(frame, avg_knee_angle, left_knee_angle, right_knee_angle, squat_depth, is_standing)
        
        # FULL SQUAT DETECTION: Both angle AND depth must meet threshold
        is_full_squat = (avg_knee_angle < self.angle_threshold and 
                        squat_depth < self.depth_threshold)
        
        # Track return to standing position
        if is_standing and self.in_squat_position:
            self.returned_to_standing = True
            self.in_squat_position = False
            
            # Calculate duration
            duration = (datetime.datetime.now() - self.squat_start_time).total_seconds()
            
            # Count and log the squat NOW when returning to standing
            self.squat_count += 1
            self._log_squat(self.min_angle_achieved, self.min_depth_achieved, duration)
            
            # Visual and audio feedback
            print(f"⬆️  FULL SQUAT completed! #{self.squat_count} - Angle: {self.min_angle_achieved:.1f}° | Depth: {self.min_depth_achieved:.3f} | {duration:.1f}s")
            self._draw_completion_feedback(frame)
        
        # Detect squat: entering full squat position (only if previously standing)
        if is_full_squat and not self.in_squat_position and self.returned_to_standing:
            self.in_squat_position = True
            self.returned_to_standing = False  # Must return to standing before counting
            self.squat_start_time = datetime.datetime.now()
            self.min_angle_achieved = avg_knee_angle
            self.min_depth_achieved = squat_depth
            print(f"⬇️  FULL SQUAT started - Angle: {avg_knee_angle:.1f}° | Depth: {squat_depth:.3f}")
        
        # Track minimum angle and depth while in squat
        elif self.in_squat_position:
            if avg_knee_angle < self.min_angle_achieved:
                self.min_angle_achieved = avg_knee_angle
            if squat_depth < self.min_depth_achieved:
                self.min_depth_achieved = squat_depth
    
    def _draw_feedback(self, frame, avg_angle, left_angle, right_angle, squat_depth, is_standing):
        """Draw real-time feedback on frame."""
        h, w, _ = frame.shape
        
        # Background box for text
        cv2.rectangle(frame, (10, 10), (450, 230), (0, 0, 0), -1)
        cv2.rectangle(frame, (10, 10), (450, 230), (255, 255, 255), 2)
        
        # Squat count
        cv2.putText(
            frame,
            f"Full Squats: {self.squat_count}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        # Current angles
        cv2.putText(
            frame,
            f"Knee Angle: {avg_angle:.1f}",
            (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )
        
        cv2.putText(
            frame,
            f"L: {left_angle:.1f}  R: {right_angle:.1f}",
            (20, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (200, 200, 200),
            1
        )
        
        # Squat depth indicator
        depth_color = (0, 255, 0) if squat_depth < self.depth_threshold else (0, 165, 255)
        cv2.putText(
            frame,
            f"Hip-Knee Depth: {squat_depth:.3f}",
            (20, 125),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            depth_color,
            2
        )
        
        # Depth requirement indicator
        cv2.putText(
            frame,
            f"Required: < {self.depth_threshold:.3f}",
            (20, 145),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (150, 150, 150),
            1
        )
        
        # Status indicator
        if self.in_squat_position:
            status_text = "FULL SQUAT!"
            status_color = (0, 255, 0)  # Green
            cv2.putText(
                frame,
                f"Best: {self.min_depth_achieved:.3f}",
                (20, 165),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 255),
                1
            )
        elif not self.returned_to_standing:
            status_text = "STAND UP!"
            status_color = (255, 165, 0)  # Orange
        else:
            # Check if currently meeting requirements
            is_angle_good = avg_angle < self.angle_threshold
            is_depth_good = squat_depth < self.depth_threshold
            
            if is_angle_good and is_depth_good:
                status_text = "FULL DEPTH!"
                status_color = (0, 255, 0)
            elif is_angle_good:
                status_text = "GO DEEPER!"
                status_color = (0, 165, 255)
            elif is_standing:
                status_text = "READY - SQUAT!"
                status_color = (0, 255, 0)
            else:
                status_text = "STANDING"
                status_color = (200, 200, 200)
        
        cv2.putText(
            frame,
            status_text,
            (20, 190),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            status_color,
            2
        )
        
        # Standing position indicator
        standing_color = (0, 255, 0) if self.returned_to_standing else (255, 0, 0)
        standing_text = "✓ Standing" if self.returned_to_standing else "✗ Must Stand"
        cv2.putText(
            frame,
            standing_text,
            (20, 220),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            standing_color,
            2
        )
        
        # Visual depth indicator (bar graph)
        bar_x = w - 150
        bar_y = 50
        bar_height = 150
        bar_width = 40
        
        # Draw bar background
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (50, 50, 50), -1)
        
        # Draw threshold line
        threshold_ratio = min(1.0, self.depth_threshold / 0.3)  # Normalize to 0.3 max
        threshold_y = int(bar_y + bar_height * (1 - threshold_ratio))
        cv2.line(frame, (bar_x - 5, threshold_y), (bar_x + bar_width + 5, threshold_y), (0, 0, 255), 2)
        cv2.putText(frame, "TARGET", (bar_x - 60, threshold_y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)
        
        # Draw current depth
        depth_ratio = min(1.0, squat_depth / 0.3)
        current_y = int(bar_y + bar_height * (1 - depth_ratio))
        fill_height = bar_y + bar_height - current_y
        
        bar_color = (0, 255, 0) if squat_depth < self.depth_threshold else (0, 165, 255)
        cv2.rectangle(frame, (bar_x, current_y), (bar_x + bar_width, bar_y + bar_height), bar_color, -1)
        
        cv2.putText(frame, "DEPTH", (bar_x, bar_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    def _draw_completion_feedback(self, frame):
        """Draw visual feedback when squat is completed."""
        h, w, _ = frame.shape
        cv2.putText(
            frame,
            "FULL SQUAT COMPLETE!",
            (w // 2 - 250, h // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 255, 0),
            3
        )
    
    def _log_squat(self, min_angle, min_depth, duration):
        """Log squat details to file."""
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Determine squat quality based on depth (hip-knee alignment)
        if min_depth < 0.10:
            quality = "ATG (Ass to Grass)"
        elif min_depth < 0.15:
            quality = "Full depth / Parallel"
        elif min_depth < 0.20:
            quality = "Just below parallel"
        else:
            quality = "Above parallel"
        
        # Also note angle
        if min_angle < 70:
            quality += " - Deep"
        elif min_angle < 90:
            quality += " - Good"
        
        log_entry = f"{timestamp} | #{self.squat_count:03d} | {min_angle:5.1f}° | Depth: {min_depth:.3f} | {duration:6.1f}s | {quality}\n"
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry)
        
        print(f"📝 Logged: {quality} - {min_angle:.1f}° / {min_depth:.3f} in {duration:.1f}s")
    
    def on_angle_threshold_crossed(self, joint1_name, joint2_name, joint3_name,
                                   angle, frame, tracker):
        """Not used - we override on_joints_detected instead."""
        pass


def main():
    """Main entry point for squat detection."""
    print("=" * 60)
    print("FULL SQUAT Detector - Real-time Counter & Logger")
    print("=" * 60)
    print("\nInstructions:")
    print("  1. Stand in front of the camera (full body visible)")
    print("  2. Perform FULL DEPTH squats:")
    print("     - Knee angle < 100°")
    print("     - Hip must drop to near knee level (< 0.15)")
    print("  3. Stand back up to complete the rep")
    print("  4. Only FULL squats will be counted!")
    print("\nReal-time feedback shows:")
    print("  - Current knee angle and hip-knee depth")
    print("  - Status: GO DEEPER! or FULL DEPTH!")
    print("  - Depth bar with target line")
    print("\nPress 'q' to quit and view your log")
    print("=" * 60)
    print()
    
    # Create tracker
    tracker = JointTracker(
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )
    
    # Add squat detector with FULL SQUAT requirements
    squat_detector = SquatDetector(
        log_file='squat_log.txt',
        angle_threshold=100,      # Knee angle must be < 100°
        depth_threshold=0.15      # Hip-knee vertical distance must be < 0.15
    )
    tracker.add_event_handler(squat_detector)
    
    # Start tracking
    try:
        tracker.start(camera_index=0)
    except KeyboardInterrupt:
        print("\n\nSquat session ended by user")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        # Print summary
        print("\n" + "=" * 60)
        print(f"Session Summary")
        print("=" * 60)
        print(f"Total FULL Squats: {squat_detector.squat_count}")
        print(f"Log file: {squat_detector.log_file}")
        print("=" * 60)
        
        # Offer to display log
        try:
            print("\nRecent squat log entries:")
            print("-" * 60)
            with open(squat_detector.log_file, 'r') as f:
                lines = f.readlines()
                # Show last 10 entries
                for line in lines[-10:]:
                    print(line.rstrip())
        except Exception as e:
            print(f"Could not read log: {e}")


if __name__ == "__main__":
    main()
