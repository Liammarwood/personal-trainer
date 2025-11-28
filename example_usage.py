"""
Example: Using the Exercise Registry System

This script demonstrates how to:
1. List all available exercises
2. Load an exercise detector dynamically
3. Use it with the joint tracker
"""

from exercises import get_available_exercises, get_exercises_by_category, get_exercise_detector
from joint_tracker import JointTracker


def list_exercises():
    """Print all available exercises."""
    print("=" * 60)
    print("Available Exercises")
    print("=" * 60)
    
    # List by category
    by_category = get_exercises_by_category()
    for category, exercises in by_category.items():
        print(f"\n{category}:")
        for ex in exercises:
            print(f"  - {ex['name']} ({ex['id']})")
            print(f"    {ex['description']}")
    
    print("\n" + "=" * 60)


def run_exercise(exercise_id: str):
    """
    Run a specific exercise by ID.
    
    Args:
        exercise_id: ID like 'squat', 'deadlift', etc.
    """
    print(f"\nStarting {exercise_id} detector...")
    print("Press 'q' to quit\n")
    
    # Create tracker
    tracker = JointTracker(
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )
    
    # Load exercise detector from registry
    try:
        detector = get_exercise_detector(exercise_id)
        tracker.add_event_handler(detector)
        
        print(f"Loaded {detector.exercise_name}")
        print(f"Logging to: {detector.log_file}")
        print("\nInstructions:")
        print("  - Stand in view of camera")
        print("  - Perform the exercise with proper form")
        print("  - Follow on-screen instructions")
        print()
        
        # Start tracking
        tracker.start(camera_index=0)
        
    except ValueError as e:
        print(f"Error: {e}")
        return
    except KeyboardInterrupt:
        print("\n\nSession ended by user")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        # Print summary
        print("\n" + "=" * 60)
        print("Session Summary")
        print("=" * 60)
        print(f"Exercise: {detector.exercise_name}")
        print(f"Total Reps: {detector.rep_count}")
        print(f"Log file: {detector.log_file}")
        if detector.best_metrics:
            print(f"Best Metrics: {detector.best_metrics}")
        print("=" * 60)


def main():
    """Main menu."""
    print("=" * 60)
    print("Personal Trainer - Exercise Registry Demo")
    print("=" * 60)
    
    while True:
        print("\nOptions:")
        print("  1. List all exercises")
        print("  2. Run an exercise")
        print("  3. Exit")
        
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == '1':
            list_exercises()
        
        elif choice == '2':
            # List exercises
            exercises = get_available_exercises()
            print("\nAvailable exercises:")
            for i, ex in enumerate(exercises, 1):
                print(f"  {i}. {ex['name']} ({ex['id']})")
            
            # Get selection
            try:
                selection = int(input("\nEnter exercise number: ").strip()) - 1
                if 0 <= selection < len(exercises):
                    exercise_id = exercises[selection]['id']
                    run_exercise(exercise_id)
                else:
                    print("Invalid selection")
            except (ValueError, IndexError):
                print("Invalid input")
        
        elif choice == '3':
            print("\nGoodbye!")
            break
        
        else:
            print("Invalid choice")


if __name__ == "__main__":
    main()
