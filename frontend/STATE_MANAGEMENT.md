# React App State Management

This document explains how state is managed in the Personal Trainer React application.

## State Architecture

The app uses **React Context API** for centralized state management, avoiding prop drilling and making state accessible to all components.

### WorkoutContext Provider

Located in `src/context/WorkoutContext.jsx`, this context manages all application state:

```jsx
const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  // State declarations
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [stats, setStats] = useState({ reps: 0, sets: 0, duration: 0 });
  const [uploadResults, setUploadResults] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Methods
  const startExercise = async (exerciseId, options) => { ... };
  const stopExercise = async () => { ... };
  const uploadVideo = async (file) => { ... };

  return (
    <WorkoutContext.Provider value={{ ...state, ...methods }}>
      {children}
    </WorkoutContext.Provider>
  );
};
```

## State Properties

### exercises (Array)
List of available exercises from the backend registry.

**Structure:**
```js
[
  { id: 'squat', name: 'Squat', description: '...' },
  { id: 'shoulder_press', name: 'Shoulder Press', description: '...' },
  ...
]
```

**Updated:** On mount via `loadExercises()`

**Used by:** ExerciseSelector component

### currentExercise (String | null)
ID of the currently tracking exercise.

**Values:** `'squat'`, `'deadlift'`, etc., or `null`

**Updated:** When starting/stopping exercises

**Used by:** ExerciseSelector, App (for conditional rendering)

### stats (Object)
Real-time workout statistics.

**Structure:**
```js
{
  reps: 0,              // Total reps completed
  sets: 0,              // Calculated sets (reps / 10)
  duration: 0,          // Seconds elapsed
  expected_plan: {      // Target workout (if set)
    sets: 3,
    reps_per_set: 10,
    target_weight: 135,
    rest_seconds: 60
  }
}
```

**Updated:** Every 1 second via polling when `isTracking === true`

**Used by:** StatsPanel component

### uploadResults (Object | null)
Results from FitBod video upload.

**Structure:**
```js
{
  success: true,
  exercises: [
    {
      name: 'Back Squat',
      trackable: true,
      mapped_exercise: 'squat',
      sets: 3,
      reps: 10,
      weight: 185
    },
    ...
  ]
}
```

**Updated:** After video upload completes

**Used by:** WorkoutResults modal component

### isTracking (Boolean)
Whether an exercise is currently being tracked.

**Values:** `true` or `false`

**Updated:** When starting/stopping exercises

**Used by:** ExerciseSelector (button state), Stats polling

### loading (Boolean)
General loading state for async operations.

**Values:** `true` or `false`

**Updated:** During API calls

**Used by:** All components for showing loading indicators

## State Flow

### Starting an Exercise

1. User selects exercise and configures workout plan
2. User clicks "Start Exercise" button
3. `ExerciseSelector` calls `startExercise(id, options)`
4. Context updates: `loading = true`
5. API call to `/api/start_exercise`
6. Context updates: `currentExercise = id`, `isTracking = true`, `loading = false`
7. Stats polling begins (every 1 second)
8. `StatsPanel` receives updated stats

### Uploading a Video

1. User selects MP4 file via drag-drop or file picker
2. User clicks "Upload & Analyze"
3. `UploadInterface` calls `uploadVideo(file)`
4. Context updates: `loading = true`
5. API call to `/api/upload_video`
6. Context updates: `uploadResults = data`, `loading = false`
7. `WorkoutResults` modal displays detected exercises
8. User can click "Start Now" on trackable exercises

### Real-time Stats Updates

When `isTracking === true`:
```jsx
useEffect(() => {
  let interval;
  if (isTracking) {
    interval = setInterval(async () => {
      const data = await api.getStats();
      setStats(data);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isTracking]);
```

This polling mechanism ensures the UI stays in sync with backend state.

## Using State in Components

### Hook Pattern

Components access state via `useWorkout()` hook:

```jsx
import { useWorkout } from '../context/WorkoutContext';

function MyComponent() {
  const { exercises, startExercise, loading } = useWorkout();
  
  // Component logic
}
```

### Example: ExerciseSelector

```jsx
const ExerciseSelector = () => {
  const { 
    exercises,        // Available exercises list
    currentExercise,  // Currently selected
    isTracking,       // Is tracking active?
    startExercise,    // Function to start
    stopExercise,     // Function to stop
    loading           // Loading state
  } = useWorkout();

  const handleStart = async () => {
    await startExercise(selectedExercise, {
      sets: 3,
      reps_per_set: 10,
      target_weight: 135,
      rest_seconds: 60
    });
  };

  return (
    <div>
      <select disabled={isTracking}>
        {exercises.map(ex => <option key={ex.id}>{ex.name}</option>)}
      </select>
      <button onClick={handleStart} disabled={loading}>
        Start
      </button>
    </div>
  );
};
```

## Benefits of Context API

✅ **No Prop Drilling**: Components access state directly without passing through parents

✅ **Centralized Logic**: All state updates happen in one place

✅ **Easy Testing**: Components can be tested with mock context values

✅ **Type Safety**: Can add TypeScript interfaces for better DX

✅ **Performance**: Only components using specific values re-render

## Alternatives Considered

### Redux
- ❌ Too complex for this app size
- ❌ Requires more boilerplate
- ✅ Better for very large apps with complex state

### Zustand
- ✅ Simpler than Redux
- ✅ Good performance
- ❌ Another dependency to learn

### Component State Only
- ✅ Simplest approach
- ❌ Requires prop drilling
- ❌ Harder to maintain

## Best Practices

1. **Keep Context Focused**: Don't put everything in one context
2. **Separate Concerns**: API calls in services, state in context
3. **Use Custom Hooks**: `useWorkout()` abstracts context consumption
4. **Handle Loading States**: Always show feedback during async operations
5. **Error Handling**: Wrap API calls in try-catch blocks
6. **Cleanup Effects**: Clear intervals/timers in useEffect cleanup

## Future Enhancements

Potential improvements to state management:

- **Local Storage Persistence**: Save workout history
- **WebSocket Integration**: Real-time updates instead of polling
- **State Middleware**: Add logging/debugging tools
- **Optimistic Updates**: Update UI before API confirms
- **State Normalization**: Use IDs as keys for better lookups
