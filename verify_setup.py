"""
Verification Script - Test New Exercise System

Run this to verify all exercises load correctly.
"""

from exercises import (
    get_exercise_detector, 
    get_available_exercises, 
    get_exercises_by_category,
    EXERCISE_REGISTRY
)


def test_registry():
    """Test that registry is properly configured."""
    print("Testing Exercise Registry...")
    print(f"  ✓ Found {len(EXERCISE_REGISTRY)} exercises in registry")
    
    for exercise_id, info in EXERCISE_REGISTRY.items():
        print(f"  ✓ {exercise_id}: {info['name']}")
        assert 'class' in info, f"Missing 'class' for {exercise_id}"
        assert 'name' in info, f"Missing 'name' for {exercise_id}"
        assert 'description' in info, f"Missing 'description' for {exercise_id}"
        assert 'category' in info, f"Missing 'category' for {exercise_id}"
    
    print("✓ Registry structure valid\n")


def test_exercise_loading():
    """Test that all exercises can be instantiated."""
    print("Testing Exercise Loading...")
    
    for exercise_id in EXERCISE_REGISTRY.keys():
        try:
            detector = get_exercise_detector(exercise_id)
            print(f"  ✓ {exercise_id}: {detector.exercise_name} loaded")
            
            # Verify it has required methods
            assert hasattr(detector, 'get_required_joints')
            assert hasattr(detector, 'calculate_metrics')
            assert hasattr(detector, 'is_in_rep_position')
            assert hasattr(detector, 'is_at_starting_position')
            assert hasattr(detector, 'assess_rep_quality')
            assert hasattr(detector, 'get_in_position_instruction')
            assert hasattr(detector, 'get_return_instruction')
            assert hasattr(detector, 'get_ready_instruction')
            
        except Exception as e:
            print(f"  ✗ {exercise_id} FAILED: {e}")
            return False
    
    print("✓ All exercises load successfully\n")
    return True


def test_helper_functions():
    """Test helper functions work."""
    print("Testing Helper Functions...")
    
    exercises = get_available_exercises()
    print(f"  ✓ get_available_exercises() returned {len(exercises)} exercises")
    
    by_category = get_exercises_by_category()
    print(f"  ✓ get_exercises_by_category() returned {len(by_category)} categories")
    
    for category, exercise_list in by_category.items():
        print(f"    - {category}: {len(exercise_list)} exercises")
    
    print("✓ Helper functions work\n")


def test_base_class_features():
    """Test that base class features are inherited."""
    print("Testing Base Class Features...")
    
    detector = get_exercise_detector('squat')
    
    # Check state machine attributes
    assert hasattr(detector, 'rep_count'), "Missing rep_count"
    assert hasattr(detector, 'in_rep_position'), "Missing in_rep_position"
    assert hasattr(detector, 'returned_to_start'), "Missing returned_to_start"
    assert hasattr(detector, 'best_metrics'), "Missing best_metrics"
    
    print("  ✓ State machine attributes present")
    
    # Check base class methods
    assert hasattr(detector, 'on_joints_detected'), "Missing on_joints_detected"
    assert hasattr(detector, 'get_bilateral_joints'), "Missing get_bilateral_joints"
    assert hasattr(detector, 'calculate_bilateral_angle'), "Missing calculate_bilateral_angle"
    
    print("  ✓ Base class methods inherited")
    print("✓ Base class features working\n")


def test_utils():
    """Test utility functions import."""
    print("Testing Utilities Module...")
    
    from exercises import utils
    
    functions = [
        'calculate_angle',
        'calculate_distance_2d',
        'calculate_distance_3d',
        'calculate_vertical_distance',
        'calculate_horizontal_distance',
        'get_midpoint',
        'is_point_above',
        'is_point_below',
        'calculate_torso_angle',
        'get_bilateral_joints',
        'calculate_bilateral_angle'
    ]
    
    for func_name in functions:
        assert hasattr(utils, func_name), f"Missing function: {func_name}"
        print(f"  ✓ {func_name}")
    
    # Test MovingAverage class
    assert hasattr(utils, 'MovingAverage'), "Missing MovingAverage class"
    ma = utils.MovingAverage(5)
    ma.add(10)
    assert ma.get_average() == 10, "MovingAverage calculation error"
    print("  ✓ MovingAverage class")
    
    print("✓ All utility functions available\n")


def test_web_server_import():
    """Test that web server can import exercises."""
    print("Testing Web Server Integration...")
    
    try:
        import web_server
        print("  ✓ web_server.py imports successfully")
        
        # Check it imported the registry
        assert hasattr(web_server, 'EXERCISE_REGISTRY'), "web_server missing EXERCISE_REGISTRY import"
        assert hasattr(web_server, 'get_exercise_detector'), "web_server missing get_exercise_detector import"
        assert hasattr(web_server, 'get_available_exercises'), "web_server missing get_available_exercises import"
        
        print("  ✓ Registry imports present in web_server")
        print("✓ Web server integration working\n")
        
    except Exception as e:
        print(f"  ✗ Web server import FAILED: {e}\n")
        return False
    
    return True


def main():
    """Run all verification tests."""
    print("=" * 60)
    print("Exercise System Verification")
    print("=" * 60)
    print()
    
    tests = [
        ("Registry Configuration", test_registry),
        ("Exercise Loading", test_exercise_loading),
        ("Helper Functions", test_helper_functions),
        ("Base Class Features", test_base_class_features),
        ("Utilities Module", test_utils),
        ("Web Server Integration", test_web_server_import)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result if result is not None else True))
        except Exception as e:
            print(f"✗ {test_name} FAILED with exception: {e}\n")
            results.append((test_name, False))
    
    # Summary
    print("=" * 60)
    print("Verification Summary")
    print("=" * 60)
    
    all_passed = all(result for _, result in results)
    
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print("=" * 60)
    
    if all_passed:
        print("\n✓ ALL TESTS PASSED - System ready to use!")
        print("\nNext steps:")
        print("  1. Run 'python web_server.py' to start web interface")
        print("  2. Run 'python example_usage.py' for CLI demo")
        print("  3. See README.md for full documentation")
    else:
        print("\n✗ SOME TESTS FAILED - Check errors above")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
