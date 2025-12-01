"""
Exercise registry for dynamic loading.
Import all exercise detectors and register them with metadata.
"""

from api.exercises.squat import SquatDetector
from api.exercises.shoulder_press import ShoulderPressDetector
from api.exercises.deadlift import DeadliftDetector
from api.exercises.romanian_deadlift import RomanianDeadliftDetector
from api.exercises.calf_raise import CalfRaiseDetector
from api.exercises.barbell_row import BarbellRowDetector
from api.exercises.bicep_curl import BicepCurlDetector
from api.exercises.bench_press import BenchPressDetector
from api.exercises.front_raise import FrontRaiseDetector
from api.exercises.dumbbell_fly import DumbbellFlyDetector


# Exercise registry mapping IDs to detector classes and metadata
EXERCISE_REGISTRY = {
    'squat': {
        'class': SquatDetector,
        'name': 'Squat',
        'description': 'Track full depth squats with hip-knee alignment',
        'category': 'Lower Body'
    },
    'shoulder_press': {
        'class': ShoulderPressDetector,
        'name': 'Shoulder Press',
        'description': 'Track overhead press with full lockout',
        'category': 'Upper Body'
    },
    'deadlift': {
        'class': DeadliftDetector,
        'name': 'Deadlift',
        'description': 'Track hip hinge and lockout position',
        'category': 'Lower Body'
    },
    'romanian_deadlift': {
        'class': RomanianDeadliftDetector,
        'name': 'Romanian Deadlift',
        'description': 'Track straight-leg hip hinge for hamstrings',
        'category': 'Lower Body'
    },
    'calf_raise': {
        'class': CalfRaiseDetector,
        'name': 'Calf Raise',
        'description': 'Track ankle extension and heel lift',
        'category': 'Lower Body'
    },
    'barbell_row': {
        'class': BarbellRowDetector,
        'name': 'Barbell Row',
        'description': 'Track bent-over row with elbow pull',
        'category': 'Upper Body'
    },
    'bicep_curl': {
        'class': BicepCurlDetector,
        'name': 'Bicep Curl',
        'description': 'Track elbow flexion and full extension',
        'category': 'Upper Body'
    },
    'bench_press': {
        'class': BenchPressDetector,
        'name': 'Bench Press',
        'description': 'Track chest press with full lockout',
        'category': 'Upper Body'
    },
    'front_raise': {
        'class': FrontRaiseDetector,
        'name': 'Front Raise',
        'description': 'Track forward arm raise to shoulder height',
        'category': 'Upper Body'
    },
    'dumbbell_fly': {
        'class': DumbbellFlyDetector,
        'name': 'Dumbbell Fly',
        'description': 'Track chest fly with wide arm spread',
        'category': 'Upper Body'
    }
}


def get_exercise_detector(exercise_id: str, log_file: str = None):
    """
    Get an exercise detector instance by ID.
    
    Args:
        exercise_id: ID of the exercise (e.g., 'squat', 'deadlift')
        log_file: Optional custom log file path
    
    Returns:
        Instance of the exercise detector class
    
    Raises:
        ValueError: If exercise_id is not found in registry
    """
    if exercise_id not in EXERCISE_REGISTRY:
        raise ValueError(f"Unknown exercise: {exercise_id}. Available: {list(EXERCISE_REGISTRY.keys())}")
    
    detector_class = EXERCISE_REGISTRY[exercise_id]['class']
    
    if log_file:
        return detector_class(log_file=log_file)
    else:
        return detector_class()


def get_available_exercises():
    """
    Get list of all available exercises with metadata.
    
    Returns:
        List of dicts with exercise info (id, name, description, category)
    """
    exercises = []
    for exercise_id, info in EXERCISE_REGISTRY.items():
        exercises.append({
            'id': exercise_id,
            'name': info['name'],
            'description': info['description'],
            'category': info['category']
        })
    return exercises


def get_exercises_by_category():
    """
    Get exercises grouped by category.
    
    Returns:
        Dict with category names as keys and exercise lists as values
    """
    by_category = {}
    for exercise_id, info in EXERCISE_REGISTRY.items():
        category = info['category']
        if category not in by_category:
            by_category[category] = []
        
        by_category[category].append({
            'id': exercise_id,
            'name': info['name'],
            'description': info['description']
        })
    
    return by_category
