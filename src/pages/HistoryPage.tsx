import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  Grid,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface WorkoutHistory {
  id: string;
  date: string;
  name: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
  totalExercises: number;
  completedExercises: number;
}

// Dummy data
const dummyWorkouts: WorkoutHistory[] = [
  {
    id: '1',
    date: '2025-12-17',
    name: 'Upper Body Strength',
    duration: 45,
    totalExercises: 5,
    completedExercises: 5,
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 10, weight: 80 },
      { name: 'Shoulder Press', sets: 3, reps: 12, weight: 30 },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 12 },
      { name: 'Tricep Extensions', sets: 3, reps: 12, weight: 20 },
      { name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
    ],
  },
  {
    id: '2',
    date: '2025-12-15',
    name: 'Leg Day',
    duration: 55,
    totalExercises: 4,
    completedExercises: 4,
    exercises: [
      { name: 'Squats', sets: 4, reps: 10, weight: 100 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 150 },
      { name: 'Lunges', sets: 3, reps: 10, weight: 40 },
      { name: 'Leg Curls', sets: 3, reps: 12, weight: 50 },
    ],
  },
  {
    id: '3',
    date: '2025-12-13',
    name: 'Back & Biceps',
    duration: 40,
    totalExercises: 5,
    completedExercises: 4,
    exercises: [
      { name: 'Deadlifts', sets: 3, reps: 8, weight: 120 },
      { name: 'Bent Over Rows', sets: 3, reps: 10, weight: 70 },
      { name: 'Lat Pulldowns', sets: 3, reps: 12, weight: 60 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 20 },
      { name: 'Hammer Curls', sets: 3, reps: 12, weight: 18 },
    ],
  },
  {
    id: '4',
    date: '2025-12-11',
    name: 'Push Day',
    duration: 50,
    totalExercises: 6,
    completedExercises: 6,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight: 85 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 35 },
      { name: 'Shoulder Press', sets: 3, reps: 10, weight: 32 },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 12 },
      { name: 'Tricep Dips', sets: 3, reps: 12, weight: 0 },
      { name: 'Cable Flyes', sets: 3, reps: 15, weight: 15 },
    ],
  },
  {
    id: '5',
    date: '2025-12-09',
    name: 'Full Body Circuit',
    duration: 35,
    totalExercises: 6,
    completedExercises: 6,
    exercises: [
      { name: 'Squats', sets: 3, reps: 12, weight: 80 },
      { name: 'Push-ups', sets: 3, reps: 15, weight: 0 },
      { name: 'Bent Over Rows', sets: 3, reps: 12, weight: 60 },
      { name: 'Lunges', sets: 3, reps: 10, weight: 30 },
      { name: 'Shoulder Press', sets: 3, reps: 12, weight: 25 },
      { name: 'Planks', sets: 3, reps: 30, weight: 0 },
    ],
  },
];

const HistoryPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>(dummyWorkouts);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const handleReuse = (workout: WorkoutHistory): void => {
    console.log('Reusing workout:', workout);
    // TODO: Implement reuse functionality - load workout into plan
    alert(`Loading "${workout.name}" into your workout plan!`);
  };

  const handleDelete = (workoutId: string): void => {
    setWorkouts(workouts.filter(w => w.id !== workoutId));
  };

  const toggleWorkoutExpanded = (workoutId: string): void => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Workout History
          </Typography>
          <Chip 
            label={`${workouts.length} workouts`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Stack spacing={2}>
            {workouts.map((workout) => {
              const isExpanded = expandedWorkouts.has(workout.id);
              return (
              <Card 
                key={workout.id} 
                variant="outlined"
                sx={{ 
                  borderLeft: workout.completedExercises === workout.totalExercises 
                    ? '4px solid #4caf50' 
                    : '4px solid #ff9800',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleWorkoutExpanded(workout.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {workout.name}
                        </Typography>
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<CalendarTodayIcon />}
                          label={formatDate(workout.date)} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          icon={<TimerIcon />}
                          label={`${workout.duration} min`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          icon={<FitnessCenterIcon />}
                          label={`${workout.completedExercises}/${workout.totalExercises} exercises`} 
                          size="small" 
                          color={workout.completedExercises === workout.totalExercises ? 'success' : 'warning'}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(workout.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {isExpanded && (
                    <>
                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Exercises:
                      </Typography>
                      <Grid container spacing={1}>
                        {workout.exercises.map((exercise, index) => (
                          <Grid size={{ xs: 12, sm: 6 }} key={index}>
                            <Box 
                              sx={{ 
                                p: 1, 
                                backgroundColor: 'action.hover', 
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {exercise.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {exercise.sets}×{exercise.reps}
                                {exercise.weight > 0 ? ` @ ${exercise.weight}kg` : ''}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleReuse(workout)}
                    fullWidth
                    size="small"
                  >
                    Use This Workout
                  </Button>
                </CardActions>
              </Card>
              );
            })}
          </Stack>

          {workouts.length === 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                gap: 2
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 80, color: 'action.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                No Workout History Yet
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Complete your first workout to see it here
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default HistoryPage;
