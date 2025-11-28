"""
Test exercise name mapping logic
"""
from web_server import EXERCISE_REGISTRY

test_names = [
    # Squat variations
    'Squat', 'Squats', 'Barbell Squats', 'Back Squat', 'Front Squat',
    'Goblet Squat', 'Dumbbell Squat', 'Air Squat', 'Bodyweight Squat',
    # Shoulder Press variations
    'Shoulder Press', 'Overhead Press', 'Military Press',
    'Seated Shoulder Press', 'Dumbbell Shoulder Press',
    # Deadlift variations
    'Deadlift', 'Deadlifts', 'Conventional Deadlift', 'Sumo Deadlift',
    'Romanian Deadlift', 'RDL', 'Stiff Leg Deadlift',
    # Bench Press variations
    'Bench Press', 'Barbell Bench Press', 'Dumbbell Bench Press',
    'Incline Bench Press', 'Flat Bench Press',
    # Curl variations
    'Bicep Curl', 'Dumbbell Curl', 'Barbell Curl', 'Hammer Curl',
    # Row variations
    'Barbell Row', 'Bent Over Row', 'Dumbbell Row', 'Pendlay Row',
    # Fly variations
    'Dumbbell Fly', 'Chest Fly', 'Cable Fly', 'Incline Fly',
    # Calf variations
    'Calf Raise', 'Standing Calf Raise', 'Seated Calf Raise',
    # Front Raise variations
    'Front Raise', 'Dumbbell Front Raise', 'Plate Front Raise',
    # Unknown exercises
    'Unknown Exercise', 'Leg Press', 'Lat Pulldown'
]

name_mappings = {
    'squats': 'squat',
    'barbell squats': 'squat',
    'back squat': 'squat',
    'back squats': 'squat',
    'front squat': 'squat',
    'front squats': 'squat',
    'goblet squat': 'squat',
    'goblet squats': 'squat',
    'dumbbell squat': 'squat',
    'dumbbell squats': 'squat',
    'air squat': 'squat',
    'air squats': 'squat',
    'bodyweight squat': 'squat',
    'shoulder presses': 'shoulder_press',
    'overhead press': 'shoulder_press',
    'military press': 'shoulder_press',
    'seated shoulder press': 'shoulder_press',
    'dumbbell shoulder press': 'shoulder_press',
    'deadlifts': 'deadlift',
    'conventional deadlift': 'deadlift',
    'sumo deadlift': 'deadlift',
    'romanian deadlifts': 'romanian_deadlift',
    'rdl': 'romanian_deadlift',
    'stiff leg deadlift': 'romanian_deadlift',
    'bicep curls': 'bicep_curl',
    'dumbbell curl': 'bicep_curl',
    'barbell curl': 'bicep_curl',
    'hammer curl': 'bicep_curl',
    'bench presses': 'bench_press',
    'barbell bench press': 'bench_press',
    'dumbbell bench press': 'bench_press',
    'incline bench press': 'bench_press',
    'flat bench press': 'bench_press',
    'barbell rows': 'barbell_row',
    'bent over row': 'barbell_row',
    'dumbbell row': 'barbell_row',
    'pendlay row': 'barbell_row',
    'dumbbell flys': 'dumbbell_fly',
    'dumbbell flyes': 'dumbbell_fly',
    'chest fly': 'dumbbell_fly',
    'cable fly': 'dumbbell_fly',
    'incline fly': 'dumbbell_fly',
    'calf raises': 'calf_raise',
    'standing calf raise': 'calf_raise',
    'seated calf raise': 'calf_raise',
    'front raises': 'front_raise',
    'dumbbell front raise': 'front_raise',
    'plate front raise': 'front_raise',
}

print('Exercise Name Mapping Test:')
print('=' * 60)

squat_matches = []
press_matches = []
deadlift_matches = []
other_matches = []
untrackable = []

for name in test_names:
    normalized = name.lower()
    matched_id = None
    
    # Try exact match
    for eid, info in EXERCISE_REGISTRY.items():
        if info.get('name', '').lower() == normalized:
            matched_id = eid
            break
    
    # Try mappings
    if not matched_id:
        matched_id = name_mappings.get(normalized)
    
    # Try fuzzy key-word matching
    if not matched_id:
        key_words = ['squat', 'press', 'deadlift', 'curl', 'row', 'raise', 'fly', 'calf']
        
        for key_word in key_words:
            if key_word in normalized:
                if key_word == 'squat':
                    matched_id = 'squat'
                    break
                elif key_word == 'press' and 'shoulder' in normalized:
                    matched_id = 'shoulder_press'
                    break
                elif key_word == 'press' and ('bench' in normalized or 'chest' in normalized):
                    matched_id = 'bench_press'
                    break
                elif key_word == 'deadlift':
                    if 'romanian' in normalized or 'rdl' in normalized or 'stiff' in normalized:
                        matched_id = 'romanian_deadlift'
                    else:
                        matched_id = 'deadlift'
                    break
                elif key_word == 'curl':
                    matched_id = 'bicep_curl'
                    break
                elif key_word == 'row':
                    matched_id = 'barbell_row'
                    break
                elif key_word == 'raise' and 'calf' not in normalized:
                    matched_id = 'front_raise'
                    break
                elif key_word == 'calf':
                    matched_id = 'calf_raise'
                    break
                elif key_word == 'fly':
                    matched_id = 'dumbbell_fly'
                    break
    
    status = '✓ TRACKABLE  ' if matched_id else '✗ UNTACKABLE'
    mapping = f' → {matched_id}' if matched_id else ''
    
    # Categorize for grouped display
    if matched_id == 'squat':
        squat_matches.append((name, matched_id))
    elif matched_id in ['shoulder_press', 'bench_press']:
        press_matches.append((name, matched_id))
    elif matched_id in ['deadlift', 'romanian_deadlift']:
        deadlift_matches.append((name, matched_id))
    elif matched_id:
        other_matches.append((name, matched_id))
    else:
        untrackable.append(name)

# Print grouped results
print('\n🏋️ SQUAT VARIATIONS:')
for name, match_id in squat_matches:
    print(f'  ✓ {name:30} → {match_id}')

print('\n💪 PRESS VARIATIONS:')
for name, match_id in press_matches:
    print(f'  ✓ {name:30} → {match_id}')

print('\n🔥 DEADLIFT VARIATIONS:')
for name, match_id in deadlift_matches:
    print(f'  ✓ {name:30} → {match_id}')

print('\n💯 OTHER EXERCISES:')
for name, match_id in other_matches:
    print(f'  ✓ {name:30} → {match_id}')

print('\n❌ UNTACKABLE:')
for name in untrackable:
    print(f'  ✗ {name}')

print('=' * 60)
print(f'\nTotal tested: {len(test_names)}')
print(f'✓ Trackable: {len(test_names) - len(untrackable)}')
print(f'✗ Untackable: {len(untrackable)}')
print(f'\nTotal exercises in registry: {len(EXERCISE_REGISTRY)}')
