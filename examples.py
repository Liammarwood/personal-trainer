"""
Example Event Handlers
Demonstrates how to create custom event handlers for the Joint Tracker.
"""

import cv2
import numpy as np
from event_handlers import JointCrossingHandler, JointProximityHandler, JointAngleHandler


class HandsCrossedHandler(JointCrossingHandler):
    """
    Example: Detects when hands cross each other horizontally.
    Prints a message and draws a visual indicator on the frame.
    """
    
    def __init__(self):
        super().__init__(
            joint1_name='LEFT_WRIST',
            joint2_name='RIGHT_WRIST',
            axis='x',  # Check horizontal crossing
            cooldown_frames=30
        )
        self.crossing_count = 0
    
    def on_joints_crossed(self, joint1_name, joint2_name, joint1_pos, joint2_pos, 
                         direction, frame, tracker):
        """Called when hands cross each other."""
        self.crossing_count += 1
        print(f"✋ Hands crossed! ({direction}) - Count: {self.crossing_count}")
        
        # Draw visual feedback on frame
        h, w, _ = frame.shape
        cv2.putText(
            frame,
            f"Hands Crossed! #{self.crossing_count}",
            (10, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        # Draw line between hands
        pt1 = (int(joint1_pos[0] * w), int(joint1_pos[1] * h))
        pt2 = (int(joint2_pos[0] * w), int(joint2_pos[1] * h))
        cv2.line(frame, pt1, pt2, (0, 255, 0), 3)


class HandsTouchingHandler(JointProximityHandler):
    """
    Example: Detects when hands come close together (like a clap).
    """
    
    def __init__(self):
        super().__init__(
            joint1_name='LEFT_WRIST',
            joint2_name='RIGHT_WRIST',
            threshold_distance=0.1,  # Normalized coordinate distance
            cooldown_frames=20
        )
        self.touch_count = 0
    
    def on_joints_close(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                       distance, frame, tracker):
        """Called when hands come close together."""
        self.touch_count += 1
        print(f"👏 Hands close together! Distance: {distance:.3f} - Count: {self.touch_count}")
        
        # Draw visual feedback
        h, w, _ = frame.shape
        cv2.putText(
            frame,
            f"Clap! #{self.touch_count}",
            (10, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )
        
        # Draw circle at midpoint
        midpoint = (joint1_pos + joint2_pos) / 2
        center = (int(midpoint[0] * w), int(midpoint[1] * h))
        cv2.circle(frame, center, 30, (0, 255, 255), 3)


class ArmBendHandler(JointAngleHandler):
    """
    Example: Detects when the right arm is bent past a threshold (elbow angle < 90 degrees).
    Useful for counting bicep curls or similar exercises.
    """
    
    def __init__(self):
        super().__init__(
            joint1_name='RIGHT_SHOULDER',
            joint2_name='RIGHT_ELBOW',  # Vertex joint
            joint3_name='RIGHT_WRIST',
            angle_threshold=90,
            comparison='less',  # Trigger when angle < 90
            cooldown_frames=15
        )
        self.rep_count = 0
    
    def on_angle_threshold_crossed(self, joint1_name, joint2_name, joint3_name,
                                   angle, frame, tracker):
        """Called when elbow bends past 90 degrees."""
        self.rep_count += 1
        print(f"💪 Arm bent! Angle: {angle:.1f}° - Rep count: {self.rep_count}")
        
        # Draw visual feedback
        h, w, _ = frame.shape
        cv2.putText(
            frame,
            f"Rep #{self.rep_count} - {angle:.1f}°",
            (10, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 0, 255),
            2
        )


class JumpDetector(JointCrossingHandler):
    """
    Example: Detects jumping by checking when ankle crosses above knee vertically.
    """
    
    def __init__(self):
        super().__init__(
            joint1_name='LEFT_ANKLE',
            joint2_name='LEFT_KNEE',
            axis='y',  # Check vertical movement (y increases downward in image coords)
            cooldown_frames=20
        )
        self.jump_count = 0
    
    def on_joints_crossed(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                         direction, frame, tracker):
        """Called when ankle crosses knee line (potential jump)."""
        # Only count when ankle moves up past knee (y decreases)
        if joint1_pos[1] < joint2_pos[1]:
            self.jump_count += 1
            print(f"🦘 Jump detected! Count: {self.jump_count}")
            
            h, w, _ = frame.shape
            cv2.putText(
                frame,
                f"Jump! #{self.jump_count}",
                (10, 200),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 165, 0),
                2
            )


class CustomLoggingHandler(JointCrossingHandler):
    """
    Example: Simple logging handler for data collection.
    Logs crossing events to a file.
    """
    
    def __init__(self, log_file='joint_events.log'):
        super().__init__(
            joint1_name='LEFT_WRIST',
            joint2_name='RIGHT_WRIST',
            axis='x',
            cooldown_frames=30
        )
        self.log_file = log_file
    
    def on_joints_crossed(self, joint1_name, joint2_name, joint1_pos, joint2_pos,
                         direction, frame, tracker):
        """Log crossing event to file."""
        import datetime
        
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f"{timestamp} - {direction} - Positions: {joint1_pos}, {joint2_pos}\n"
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry)
        
        print(f"📝 Event logged: {direction}")


def demo_all_handlers():
    """
    Demonstration function showing how to use multiple handlers together.
    """
    from joint_tracker import JointTracker
    
    # Create tracker instance
    tracker = JointTracker(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Add multiple event handlers
    tracker.add_event_handler(HandsCrossedHandler())
    tracker.add_event_handler(HandsTouchingHandler())
    tracker.add_event_handler(ArmBendHandler())
    tracker.add_event_handler(JumpDetector())
    # tracker.add_event_handler(CustomLoggingHandler())  # Uncomment to enable logging
    
    print("=" * 60)
    print("Joint Tracker Demo with Multiple Event Handlers")
    print("=" * 60)
    print("Active handlers:")
    print("  ✋ Hands Crossed - Detects horizontal hand crossing")
    print("  👏 Hands Touching - Detects when hands come close")
    print("  💪 Arm Bend - Counts arm bends (< 90°)")
    print("  🦘 Jump Detector - Detects jumping motion")
    print("\nPress 'q' to quit")
    print("=" * 60)
    
    # Start tracking
    try:
        tracker.start(camera_index=0)
    except KeyboardInterrupt:
        print("\nDemo stopped by user")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    demo_all_handlers()
