"""
Shoulder Press Detection and Logging
Detects when a user performs a shoulder press (overhead press) and logs the activity.
"""

import cv2
import numpy as np
import datetime
from joint_tracker import JointTracker
from event_handlers import JointAngleHandler


class ShoulderPressDetector(JointAngleHandler):
    """
    Detects shoulder presses by monitoring elbow angle and arm height.
    A press is detected when arms go from bent position to extended overhead.
    """
    
    def __init__(self, log_file='shoulder_press_log.txt', 
                 elbow_angle_threshold=160, 
                 wrist_height_threshold=0.3):
        """
        Initialize shoulder press detector.
        
        Args:
            log_file: Path to log file for recording presses
            elbow_angle_threshold: Elbow must extend beyond this angle (160° = nearly straight)
            wrist_height_threshold: Wrist must be above shoulder by this amount (normalized)
        """
        # Monitor right elbow angle (shoulder-elbow-wrist)
        super().__init__(
            joint1_name='RIGHT_SHOULDER',
            joint2_name='RIGHT_ELBOW',  # Vertex joint
            joint3_name='RIGHT_WRIST',
            angle_threshold=elbow_angle_threshold,
            comparison='greater',  # Trigger when angle goes above threshold (extension)
            cooldown_frames=15
        )
        
        self.log_file = log_file
        self.elbow_angle_threshold = elbow_angle_threshold
        self.wrist_height_threshold = wrist_height_threshold
        self.press_count = 0
        self.in_press_position = False
        self.arms_returned = True  # Track if arms returned to starting position
        self.press_start_time = None
        self.max_extension_achieved = None
        self.max_height_achieved = None
        
        # Track both arms
        self.left_elbow_angle = None
        self.right_elbow_angle = None
        
        # Initialize log file with header
        self._initialize_log()
    
    def _initialize_log(self):
        """Create log file with header if it doesn't exist."""
        try:
            with open(self.log_file, 'x') as f:
                f.write("Shoulder Press Activity Log\n")
                f.write("=" * 80 + "\n")
                f.write(f"Started: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 80 + "\n\n")
                f.write("Timestamp | Press # | Max Extension | Max Height | Duration (s) | Quality\n")
                f.write("-" * 80 + "\n")
        except FileExistsError:
            # File already exists, append to it
            pass
    
    def calculate_elbow_angle(self, landmarks, tracker, side='RIGHT'):
        """Calculate elbow angle for specified side."""
        shoulder = tracker.get_joint_position(landmarks, f'{side}_SHOULDER')
        elbow = tracker.get_joint_position(landmarks, f'{side}_ELBOW')
        wrist = tracker.get_joint_position(landmarks, f'{side}_WRIST')
        
        if shoulder is None or elbow is None or wrist is None:
            return None
        
        return float(self.calculate_angle(shoulder, elbow, wrist))
    
    def calculate_wrist_height(self, landmarks, tracker):
        """
        Calculate how high wrists are relative to shoulders.
        Returns average height difference (negative = wrists above shoulders).
        
        Returns:
            Float: Height difference, or None if joints not detected
        """
        left_shoulder = tracker.get_joint_position(landmarks, 'LEFT_SHOULDER')
        left_wrist = tracker.get_joint_position(landmarks, 'LEFT_WRIST')
        right_shoulder = tracker.get_joint_position(landmarks, 'RIGHT_SHOULDER')
        right_wrist = tracker.get_joint_position(landmarks, 'RIGHT_WRIST')
        
        if left_shoulder is None or left_wrist is None or right_shoulder is None or right_wrist is None:
            return None
        
        # Calculate vertical distance (negative = wrist above shoulder)
        # In image coords, y increases downward
        left_height = float(left_wrist[1] - left_shoulder[1])
        right_height = float(right_wrist[1] - right_shoulder[1])
        
        return float((left_height + right_height) / 2)
    
    def is_arms_overhead(self, wrist_height):
        """Check if arms are extended overhead."""
        # Negative height means wrists above shoulders
        # We want wrists significantly above (more negative than threshold)
        return wrist_height < -self.wrist_height_threshold
    
    def is_arms_at_starting_position(self, avg_elbow_angle, wrist_height):
        """
        Check if arms are back at starting position (bent, at shoulder level).
        Starting position: elbows bent (~90-120°) and wrists near shoulder height.
        """
        # Arms bent (not extended)
        arms_bent = avg_elbow_angle < 140
        # Wrists at or below shoulder level (not overhead)
        arms_lowered = wrist_height > -0.15  # Near or below shoulders
        
        return arms_bent and arms_lowered
    
    def on_joints_detected(self, current_landmarks, previous_landmarks, frame, tracker):
        """Override to track both arms and press completion."""
        # Calculate both elbow angles
        left_elbow_angle = self.calculate_elbow_angle(current_landmarks, tracker, 'LEFT')
        right_elbow_angle = self.calculate_elbow_angle(current_landmarks, tracker, 'RIGHT')
        
        # Calculate wrist height
        wrist_height = self.calculate_wrist_height(current_landmarks, tracker)
        
        if left_elbow_angle is None or right_elbow_angle is None or wrist_height is None:
            return
        
        # Use average of both elbows for more robust detection
        avg_elbow_angle = (left_elbow_angle + right_elbow_angle) / 2
        
        # Check if arms are overhead and extended
        arms_overhead = self.is_arms_overhead(wrist_height)
        arms_extended = avg_elbow_angle > self.elbow_angle_threshold
        at_starting_position = self.is_arms_at_starting_position(avg_elbow_angle, wrist_height)
        
        # Display current status on frame
        self._draw_feedback(frame, avg_elbow_angle, left_elbow_angle, right_elbow_angle, 
                           wrist_height, arms_overhead, arms_extended, at_starting_position)
        
        # PRESS DETECTION: Arms extended overhead (only if arms previously returned)
        is_full_press = arms_extended and arms_overhead
        
        # Track return to starting position
        if at_starting_position and self.in_press_position:
            self.arms_returned = True
            self.in_press_position = False
            print(f"⬇️  Arms returned to starting position - Ready for next rep")
        
        # Detect press completion: arms reach full extension overhead
        # Only count if arms previously returned to starting position
        if is_full_press and not self.in_press_position and self.arms_returned:
            self.in_press_position = True
            self.arms_returned = False  # Must return before counting next rep
            self.press_count += 1
            
            if self.press_start_time is None:
                self.press_start_time = datetime.datetime.now()
            
            # Calculate duration from last press
            duration = (datetime.datetime.now() - self.press_start_time).total_seconds()
            self.press_start_time = datetime.datetime.now()
            
            self.max_extension_achieved = avg_elbow_angle
            self.max_height_achieved = wrist_height
            
            # Log the press
            self._log_press(self.max_extension_achieved, self.max_height_achieved, duration)
            
            # Visual and audio feedback
            print(f"⬆️  SHOULDER PRESS! #{self.press_count} - Extension: {self.max_extension_achieved:.1f}° | Height: {abs(self.max_height_achieved):.3f}")
            self._draw_completion_feedback(frame)
        
        # Track maximum extension and height while maintaining overhead position
        elif self.in_press_position and is_full_press:
            if avg_elbow_angle > self.max_extension_achieved:
                self.max_extension_achieved = avg_elbow_angle
            if wrist_height < self.max_height_achieved:  # More negative = higher
                self.max_height_achieved = wrist_height
    
    def _draw_feedback(self, frame, avg_angle, left_angle, right_angle, 
                      wrist_height, arms_overhead, arms_extended, at_starting_position):
        """Draw real-time feedback on frame."""
        h, w, _ = frame.shape
        
        # Background box for text
        cv2.rectangle(frame, (10, 10), (500, 250), (0, 0, 0), -1)
        cv2.rectangle(frame, (10, 10), (500, 250), (255, 255, 255), 2)
        
        # Press count
        cv2.putText(
            frame,
            f"Shoulder Presses: {self.press_count}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        # Current elbow angles
        cv2.putText(
            frame,
            f"Elbow Extension: {avg_angle:.1f}",
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
        
        # Wrist height indicator
        height_color = (0, 255, 0) if arms_overhead else (0, 165, 255)
        cv2.putText(
            frame,
            f"Wrist Height: {abs(wrist_height):.3f}",
            (20, 130),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            height_color,
            2
        )
        
        # Height requirement indicator
        cv2.putText(
            frame,
            f"Required: > {self.wrist_height_threshold:.3f}",
            (20, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (150, 150, 150),
            1
        )
        
        # Extension requirement
        extension_color = (0, 255, 0) if arms_extended else (0, 165, 255)
        cv2.putText(
            frame,
            f"Extension: {'GOOD' if arms_extended else 'EXTEND MORE'} (>{self.elbow_angle_threshold}°)",
            (20, 175),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            extension_color,
            1
        )
        
        # Status indicator
        if self.in_press_position:
            status_text = "OVERHEAD!"
            status_color = (0, 255, 0)  # Green
        elif not self.arms_returned:
            status_text = "RETURN TO START"
            status_color = (255, 165, 0)  # Orange
        else:
            # Check what's needed
            if arms_extended and arms_overhead:
                status_text = "LOCKED OUT!"
                status_color = (0, 255, 0)
            elif arms_extended:
                status_text = "RAISE HIGHER!"
                status_color = (0, 165, 255)
            elif arms_overhead:
                status_text = "EXTEND ARMS!"
                status_color = (0, 165, 255)
            elif at_starting_position:
                status_text = "READY - PRESS!"
                status_color = (0, 255, 0)
            else:
                status_text = "GET IN POSITION"
                status_color = (200, 200, 200)
        
        cv2.putText(
            frame,
            status_text,
            (20, 210),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            status_color,
            2
        )
        
        # Arms returned indicator
        returned_color = (0, 255, 0) if self.arms_returned else (255, 0, 0)
        returned_text = "✓ Returned" if self.arms_returned else "✗ Must Return"
        cv2.putText(
            frame,
            returned_text,
            (20, 240),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            returned_color,
            2
        )
        
        # Visual indicators (checkboxes)
        checkbox_x = w - 200
        checkbox_y = 50
        box_size = 25
        
        # Arms overhead checkbox
        color_overhead = (0, 255, 0) if arms_overhead else (100, 100, 100)
        cv2.rectangle(frame, (checkbox_x, checkbox_y), 
                     (checkbox_x + box_size, checkbox_y + box_size), color_overhead, -1)
        cv2.putText(frame, "Overhead", (checkbox_x + 35, checkbox_y + 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Arms extended checkbox
        checkbox_y += 40
        color_extended = (0, 255, 0) if arms_extended else (100, 100, 100)
        cv2.rectangle(frame, (checkbox_x, checkbox_y), 
                     (checkbox_x + box_size, checkbox_y + box_size), color_extended, -1)
        cv2.putText(frame, "Extended", (checkbox_x + 35, checkbox_y + 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    def _draw_completion_feedback(self, frame):
        """Draw visual feedback when press is completed."""
        h, w, _ = frame.shape
        cv2.putText(
            frame,
            "SHOULDER PRESS!",
            (w // 2 - 250, h // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.8,
            (0, 255, 0),
            3
        )
    
    def _log_press(self, max_extension, max_height, duration):
        """Log press details to file."""
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Determine press quality based on extension and height
        if max_extension > 170 and abs(max_height) > 0.35:
            quality = "Excellent - Full lockout"
        elif max_extension > 165 and abs(max_height) > 0.30:
            quality = "Good - Nearly full"
        elif max_extension > 160 and abs(max_height) > 0.25:
            quality = "Fair - Partial lockout"
        else:
            quality = "Incomplete"
        
        log_entry = f"{timestamp} | #{self.press_count:03d} | {max_extension:5.1f}° | Height: {abs(max_height):.3f} | {duration:6.1f}s | {quality}\n"
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry)
        
        print(f"📝 Logged: {quality} - {max_extension:.1f}° / {abs(max_height):.3f}")
    
    def on_angle_threshold_crossed(self, joint1_name, joint2_name, joint3_name,
                                   angle, frame, tracker):
        """Not used - we override on_joints_detected instead."""
        pass


def main():
    """Main entry point for shoulder press detection."""
    print("=" * 60)
    print("Shoulder Press Detector - Real-time Counter & Logger")
    print("=" * 60)
    print("\nInstructions:")
    print("  1. Stand in front of the camera (upper body visible)")
    print("  2. Perform shoulder presses (overhead press):")
    print("     - Start with arms bent at shoulders")
    print("     - Press arms overhead until extended")
    print("     - Elbow extension > 160°")
    print("     - Wrists above shoulders by > 0.3")
    print("  3. Lower back down to complete the rep")
    print("\nReal-time feedback shows:")
    print("  - Current elbow extension angle")
    print("  - Wrist height relative to shoulders")
    print("  - Status indicators for overhead/extended")
    print("\nPress 'q' to quit and view your log")
    print("=" * 60)
    print()
    
    # Create tracker
    tracker = JointTracker(
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )
    
    # Add shoulder press detector
    press_detector = ShoulderPressDetector(
        log_file='shoulder_press_log.txt',
        elbow_angle_threshold=160,    # Arms must be nearly straight
        wrist_height_threshold=0.3    # Wrists must be well above shoulders
    )
    tracker.add_event_handler(press_detector)
    
    # Start tracking
    try:
        tracker.start(camera_index=0)
    except KeyboardInterrupt:
        print("\n\nShoulder press session ended by user")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        # Print summary
        print("\n" + "=" * 60)
        print(f"Session Summary")
        print("=" * 60)
        print(f"Total Shoulder Presses: {press_detector.press_count}")
        print(f"Log file: {press_detector.log_file}")
        print("=" * 60)
        
        # Offer to display log
        try:
            print("\nRecent shoulder press log entries:")
            print("-" * 60)
            with open(press_detector.log_file, 'r') as f:
                lines = f.readlines()
                # Show last 10 entries
                for line in lines[-10:]:
                    print(line.rstrip())
        except Exception as e:
            print(f"Could not read log: {e}")


if __name__ == "__main__":
    main()
