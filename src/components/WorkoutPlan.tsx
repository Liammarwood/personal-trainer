import { useState, MouseEvent, ChangeEvent, SyntheticEvent } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useSettings } from '../context/SettingsContext';
import type { WorkoutOptions, Exercise } from '../types';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Stack,
  Autocomplete,
  TextField,
  Grid,
  Collapse,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import DeleteIcon from '@mui/icons-material/Delete';

const WorkoutPlan: React.FC = () => {
  const { workoutPlan, completedExercises, currentExerciseIndex, startExercise, clearWorkoutPlan, isTracking, exercises, currentExercise, stopExercise, loading, trackVideoFile, selectedVideoFile, removeExerciseFromPlan, setMultipleExercisesToWorkoutPlan } = useWorkout();
  const { settings } = useSettings();
  const [expanded, setExpanded] = useState<boolean>(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [rest, setRest] = useState<number>(60);
  const [buildingWorkout, setBuildingWorkout] = useState<Array<{
    exercise: Exercise;
    sets: number;
    reps: number;
    weight: number;
    rest: number;
  }>>([]);

  const handleStartStandaloneExercise = async (): Promise<void> => {
    if (!selectedExercise) return;
    
    const options: WorkoutOptions = {
      sets: parseInt(sets.toString()),
      reps_per_set: parseInt(reps.toString()),
      target_weight: parseFloat(weight.toString()),
      rest_seconds: parseInt(rest.toString())
    };

    // Check if we should track a video file or start webcam tracking
    if (settings.inputMode === 'video' && selectedVideoFile) {
      await trackVideoFile(selectedVideoFile, selectedExercise.id, options);
    } else {
      await startExercise(selectedExercise.id, options);
    }
  };

  const handleStop = async (): Promise<void> => {
    await stopExercise();
    setSelectedExercise(null);
  };

  const handleAddToWorkout = (): void => {
    if (!selectedExercise) return;
    
    setBuildingWorkout([...buildingWorkout, {
      exercise: selectedExercise,
      sets,
      reps,
      weight,
      rest
    }]);
    
    // Reset form
    setSelectedExercise(null);
    setSets(3);
    setReps(10);
    setWeight(0);
    setRest(60);
  };

  const handleRemoveFromBuildingWorkout = (index: number): void => {
    setBuildingWorkout(buildingWorkout.filter((_, i) => i !== index));
  };

  const handleCreateWorkout = (): void => {
    if (buildingWorkout.length === 0) return;
    
    const exercisesToAdd = buildingWorkout.map(item => ({
      id: item.exercise.id,
      name: item.exercise.name,
      sets: item.sets,
      reps_per_set: item.reps,
      weight: item.weight,
      rest_seconds: item.rest
    }));
    
    setMultipleExercisesToWorkoutPlan(exercisesToAdd);
    
    // Clear building state
    setBuildingWorkout([]);
  };

  if (!workoutPlan) {
    // Show standalone exercise selector when no workout plan
    return (
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon />
          Quick Exercise
        </Typography>
        
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
            />
          )}
          sx={{ mb: 2 }}
        />

        <Collapse in={Boolean(selectedExercise && !isTracking)}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Workout Settings
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
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {buildingWorkout.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Building Workout ({buildingWorkout.length} exercises)
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleCreateWorkout}
              >
                Create Workout
              </Button>
            </Box>
            <Stack spacing={1}>
              {buildingWorkout.map((item, index) => (
                <Card key={index} variant="outlined" sx={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.exercise.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.sets} sets × {item.reps} reps
                          {item.weight > 0 && ` @ ${item.weight}kg`}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromBuildingWorkout(index)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {!isTracking ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartStandaloneExercise}
              disabled={!selectedExercise || loading}
              startIcon={<PlayArrowIcon />}
              fullWidth
              size="large"
            >
              Start
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddToWorkout}
              disabled={!selectedExercise}
              startIcon={<AddIcon />}
              fullWidth
              size="large"
            >
              Add to Workout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              variant="contained"
              color="error"
              onClick={handleStop}
              disabled={loading}
              startIcon={<StopIcon />}
              fullWidth
              size="large"
              sx={{ mb: 2 }}
            >
              Stop Exercise
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<FiberManualRecordIcon sx={{ animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />}
                label={`Tracking: ${exercises.find(e => e.id === currentExercise)?.name}`}
                color="error"
                variant="outlined"
              />
            </Box>
          </Box>
        )}
      </Paper>
    );
  }

  const handleStartExercise = (exercise: any, index: number): void => {
    if (isTracking || completedExercises.includes(index)) return;
    
    const options: WorkoutOptions = {
      sets: exercise.sets,
      reps_per_set: exercise.reps_per_set,
      target_weight: exercise.weight || 0,
      rest_seconds: 60,
      exerciseIndex: index
    };
    
    if (exercise.mapped_exercise) {
      startExercise(exercise.mapped_exercise, options);
    }
  };

  const totalExercises = workoutPlan.exercises?.length || 0;
  const completedCount = completedExercises.length;
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Today's Workout
              </Typography>
              {workoutPlan.detected_format && (
                <Chip
                  label={workoutPlan.detected_format === 'fitbod' ? 'FitBod' : 'Generic'}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.7rem' }}
                />
              )}
              <Chip
                label={`${completedCount} / ${totalExercises} completed`}
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
            <Box
              component="span"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                clearWorkoutPlan();
              }}
              sx={{ 
                color: 'white',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </Box>
          </Box>
        </AccordionSummary>

        <Box sx={{ px: 2, pt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <AccordionDetails>
          <Stack spacing={2}>
            {workoutPlan.exercises?.map((exercise, index: number) => {
              const isCompleted = completedExercises.includes(index);
              const isCurrentlyTracking = currentExerciseIndex === index && isTracking;
              const isTrackable = exercise.trackable;

              return (
                <Card 
                  key={index}
                  elevation={isCurrentlyTracking ? 8 : 1}
                  sx={{
                    borderLeft: isCompleted ? '4px solid #4caf50' : isCurrentlyTracking ? '4px solid #2196F3' : '4px solid #ccc',
                    backgroundColor: isCompleted ? '#f1f8f4' : isCurrentlyTracking ? '#e3f2fd' : 'white',
                    animation: isCurrentlyTracking ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                      '50%': { boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)' },
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                        {exercise.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {isCompleted && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Done"
                            color="success"
                            size="small"
                          />
                        )}
                        {isCurrentlyTracking && (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label="In Progress"
                            color="primary"
                            size="small"
                          />
                        )}
                        {!isTrackable && (
                          <Chip
                            label="Not Trackable"
                            color="warning"
                            size="small"
                          />
                        )}
                        {!isCurrentlyTracking && (
                          <IconButton
                            size="small"
                            onClick={() => removeExerciseFromPlan(index)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.light', color: 'white' }
                            }}
                            title="Remove exercise"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{exercise.sets}</strong> sets
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{exercise.reps_per_set}</strong> reps
                      </Typography>
                      {exercise.weight && exercise.weight > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>{exercise.weight}</strong> kg
                        </Typography>
                      )}
                    </Box>

                    {isTrackable && exercise.mapped_exercise && (
                      <Typography variant="caption" color="text.disabled">
                        Maps to: <strong>{exercise.mapped_exercise}</strong>
                      </Typography>
                    )}
                  </CardContent>

                  {isTrackable && !isCompleted && (
                    <CardActions>
                      {isCurrentlyTracking ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={handleStop}
                          disabled={loading}
                          startIcon={<StopIcon />}
                          fullWidth
                        >
                          Stop
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleStartExercise(exercise, index)}
                          disabled={isTracking}
                          startIcon={<PlayArrowIcon />}
                          fullWidth
                        >
                          {isTracking ? 'In Progress...' : 'Start'}
                        </Button>
                      )}
                    </CardActions>
                  )}
                </Card>
              );
            })}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Standalone Exercise Selector */}
      <Box sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AddIcon fontSize="small" />
          Add Extra Exercise
        </Typography>
        
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
              size="small"
            />
          )}
          sx={{ mb: 2 }}
        />

        <Collapse in={Boolean(selectedExercise && !isTracking)}>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Sets"
                  type="number"
                  value={sets}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Reps/Set"
                  type="number"
                  value={reps}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={weight}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(Number(e.target.value))}
                  inputProps={{ min: 0, step: 2.5 }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Rest (sec)"
                  type="number"
                  value={rest}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRest(Number(e.target.value))}
                  inputProps={{ min: 0, step: 5 }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {!isTracking ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartStandaloneExercise}
            disabled={!selectedExercise || loading}
            startIcon={<PlayArrowIcon />}
            fullWidth
          >
            Start Exercise
          </Button>
        ) : (
          <Box>
            <Button
              variant="contained"
              color="error"
              onClick={handleStop}
              disabled={loading}
              startIcon={<StopIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Stop Exercise
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<FiberManualRecordIcon sx={{ animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />}
                label={`Tracking: ${exercises.find(e => e.id === currentExercise)?.name}`}
                color="error"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WorkoutPlan;
