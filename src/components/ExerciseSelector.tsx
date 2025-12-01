import { useState, ChangeEvent, MouseEvent, SyntheticEvent } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import type { WorkoutOptions, Exercise, UploadResults } from '../types';
import {
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

type InputMode = 'webcam' | 'video';
type SelectionMode = 'single' | 'workout';

interface WorkoutExerciseItem {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
}

const ExerciseSelector: React.FC = () => {
  const { exercises, currentExercise, isTracking, startExercise, stopExercise, loading, trackVideoFile, setManualWorkoutPlan } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [rest, setRest] = useState<number>(60);
  const [mode, setMode] = useState<InputMode>('webcam');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  
  // Workout builder state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single');
  const [workoutList, setWorkoutList] = useState<WorkoutExerciseItem[]>([]);

  const handleStart = async (): Promise<void> => {
    if (!selectedExercise) return;
    
    const options: WorkoutOptions = {
      sets: parseInt(sets.toString()),
      reps_per_set: parseInt(reps.toString()),
      target_weight: parseFloat(weight.toString()),
      rest_seconds: parseInt(rest.toString())
    };
    
    console.log('[WORKOUT] Starting exercise with options:', options);
    console.log('[WORKOUT] Sets:', sets, '-> parsed:', options.sets);
    console.log('[WORKOUT] Reps:', reps, '-> parsed:', options.reps_per_set);
    console.log('[WORKOUT] Rest:', rest, '-> parsed:', options.rest_seconds);

    if (mode === 'video') {
      if (!videoFile) {
        setUploadError('Please select a video file');
        return;
      }
      await trackVideoFile(videoFile, selectedExercise.id, options);
    } else {
      await startExercise(selectedExercise.id, options);
    }
  };

  const handleStop = async (): Promise<void> => {
    await stopExercise();
    setSelectedExercise(null);
    setVideoFile(null);
    setUploadError('');
  };

  const handleModeChange = (event: MouseEvent<HTMLElement>, newMode: InputMode | null): void => {
    if (newMode !== null) {
      setMode(newMode);
      setVideoFile(null);
      setUploadError('');
    }
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please select a valid video file (MP4, AVI, or MOV)');
        setVideoFile(null);
        return;
      }
      setVideoFile(file);
      setUploadError('');
    }
  };

  const handleSelectionModeChange = (event: MouseEvent<HTMLElement>, newMode: SelectionMode | null): void => {
    if (newMode !== null) {
      setSelectionMode(newMode);
      if (newMode === 'single') {
        setWorkoutList([]);
      }
    }
  };

  const handleAddToWorkout = (): void => {
    if (!selectedExercise) return;
    
    const newItem: WorkoutExerciseItem = {
      exercise: selectedExercise,
      sets: parseInt(sets.toString()),
      reps: parseInt(reps.toString()),
      weight: weight > 0 ? parseFloat(weight.toString()) : undefined
    };
    
    setWorkoutList([...workoutList, newItem]);
    setSelectedExercise(null);
    setUploadError('');
  };

  const handleRemoveFromWorkout = (index: number): void => {
    setWorkoutList(workoutList.filter((_, i) => i !== index));
  };

  const handleStartWorkout = (): void => {
    if (workoutList.length === 0) return;
    
    // Convert workout list to UploadResults format
    const workoutPlanData: UploadResults = {
      success: true,
      detected_format: 'manual',
      exercises: workoutList.map(item => ({
        id: item.exercise.id,
        name: item.exercise.name,
        sets: item.sets,
        reps_per_set: item.reps,
        weight: item.weight,
        trackable: true,
        completed: false,
        mapped_exercise: item.exercise.id
      }))
    };
    
    // Set the manual workout plan
    setManualWorkoutPlan(workoutPlanData);
    
    // Clear the builder
    setWorkoutList([]);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        Exercise Selection
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Mode
        </Typography>
        <ToggleButtonGroup
          value={selectionMode}
          exclusive
          onChange={handleSelectionModeChange}
          fullWidth
          disabled={isTracking}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }
          }}
        >
          <ToggleButton value="single">
            <PlayArrowIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
            Single Exercise
          </ToggleButton>
          <ToggleButton value="workout">
            <FitnessCenterIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
            Build Workout
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {selectionMode === 'single' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Input Mode
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            fullWidth
            disabled={isTracking}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }
            }}
          >
            <ToggleButton value="webcam">
              <VideocamIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              Webcam
            </ToggleButton>
            <ToggleButton value="video">
              <VideoFileIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              Video File
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {selectionMode === 'single' && mode === 'video' && !isTracking && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<UploadFileIcon />}
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderStyle: 'dashed',
              '&:hover': { borderStyle: 'dashed' }
            }}
          >
            {videoFile ? videoFile.name : 'Select Video File'}
            <input
              type="file"
              hidden
              accept="video/mp4,video/avi,video/mov,video/quicktime"
              onChange={handleVideoFileChange}
            />
          </Button>
          {uploadError && (
            <Alert severity="error" sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {uploadError}
            </Alert>
          )}
        </Box>
      )}
      
      <Autocomplete
        fullWidth
        options={exercises}
        getOptionLabel={(option) => option.name}
        value={selectedExercise}
        onChange={(event: SyntheticEvent, newValue: Exercise | null) => {
          setSelectedExercise(newValue);
        }}
        disabled={isTracking}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Choose Exercise"
            placeholder="Search exercises..."
            sx={{
              '& .MuiInputLabel-root': { fontSize: { xs: '0.9rem', sm: '1rem' } },
              '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } }
            }}
          />
        )}
        sx={{ mb: 2 }}
      />

      <Collapse in={Boolean(selectedExercise && (selectionMode === 'workout' || !isTracking))}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            {selectionMode === 'workout' ? 'Exercise Details' : 'Workout Plan'}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Sets"
                type="number"
                value={sets}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(Number(e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.85rem', sm: '1rem' } },
                  '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Reps/Set"
                type="number"
                value={reps}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(Number(e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.85rem', sm: '1rem' } },
                  '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(Number(e.target.value))}
                inputProps={{ min: 0, step: 2.5 }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.85rem', sm: '1rem' } },
                  '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Rest (sec)"
                type="number"
                value={rest}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRest(Number(e.target.value))}
                inputProps={{ min: 0, step: 5 }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.85rem', sm: '1rem' } },
                  '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {selectionMode === 'workout' && workoutList.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Workout Plan ({workoutList.length} exercises)
          </Typography>
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            {workoutList.map((item, index) => (
              <ListItem key={index} divider={index < workoutList.length - 1}>
                <ListItemText
                  primary={item.exercise.name}
                  secondary={`${item.sets} sets × ${item.reps} reps${item.weight ? ` @ ${item.weight}kg` : ''}`}
                  primaryTypographyProps={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemoveFromWorkout(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box>
        {selectionMode === 'workout' ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddToWorkout}
              disabled={!selectedExercise}
              startIcon={<AddIcon />}
              fullWidth
              size="large"
              sx={{
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minHeight: { xs: '48px', sm: '56px' }
              }}
            >
              Add Exercise
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleStartWorkout}
              disabled={workoutList.length === 0}
              startIcon={<FitnessCenterIcon />}
              fullWidth
              size="large"
              sx={{
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minHeight: { xs: '48px', sm: '56px' }
              }}
            >
              Start Workout
            </Button>
          </Box>
        ) : !isTracking ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            disabled={!selectedExercise || (mode === 'video' && !videoFile) || loading}
            startIcon={<PlayArrowIcon />}
            fullWidth
            size="large"
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              minHeight: { xs: '48px', sm: '56px' }
            }}
          >
            {mode === 'video' ? 'Track Video' : 'Start Exercise'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={handleStop}
            disabled={loading}
            startIcon={<StopIcon />}
            fullWidth
            size="large"
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              minHeight: { xs: '48px', sm: '56px' }
            }}
          >
            Stop Exercise
          </Button>
        )}
      </Box>

      {isTracking && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            icon={<FiberManualRecordIcon sx={{ animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />}
            label={`Tracking: ${exercises.find(e => e.id === currentExercise)?.name}`}
            color="error"
            variant="outlined"
          />
        </Box>
      )}
    </Paper>
  );
};

export default ExerciseSelector;