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

interface WorkoutPlanProps {
  onNavigateToWorkout?: () => void;
}

const WorkoutPlan: React.FC<WorkoutPlanProps> = ({ onNavigateToWorkout }) => {
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
    
    // Navigate to workout page after starting
    if (onNavigateToWorkout) {
      onNavigateToWorkout();
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
    // Show workout planner when no workout plan
    return (
      <Paper elevation={3} sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Plan Workout
          </Typography>
          {buildingWorkout.length > 0 && (
            <Chip 
              label={`${buildingWorkout.length} exercise${buildingWorkout.length > 1 ? 's' : ''}`}
              color="primary"
              size="small"
            />
          )}
        </Box>

        {/* Workout Builder Section - Scrollable */}
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
          {buildingWorkout.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Your Workout Plan
              </Typography>
              <Stack spacing={1.5}>
                {buildingWorkout.map((item, index) => (
                  <Card key={index} elevation={2} sx={{ 
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 3 }
                  }}>
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {index + 1}. {item.exercise.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={`${item.sets} sets`} size="small" variant="outlined" />
                            <Chip label={`${item.reps} reps`} size="small" variant="outlined" />
                            {item.weight > 0 ? (
                              <Chip label={`${item.weight} kg`} size="small" variant="outlined" color="primary" />
                            ) : null}
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromBuildingWorkout(index)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'error.light', color: 'white' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* Add Exercise Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {buildingWorkout.length > 0 ? 'Add Another Exercise' : 'Add First Exercise'}
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
                  label="Search Exercise"
                  placeholder="Type to search..."
                />
              )}
              sx={{ mb: 2 }}
            />

            <Collapse in={Boolean(selectedExercise && !isTracking)}>
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Sets"
                      type="number"
                      value={sets}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSets(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 1 } }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Reps"
                      type="number"
                      value={reps}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 1 } }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Weight (kg)"
                      type="number"
                      value={weight}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 0, step: 2.5 } }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Rest (sec)"
                      type="number"
                      value={rest}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRest(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 0, step: 5 } }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleAddToWorkout}
                  disabled={!selectedExercise}
                  startIcon={<AddIcon />}
                  fullWidth
                  size="large"
                >
                  Add to Workout Plan
                </Button>
              </Box>
            </Collapse>
          </Box>
        </Box>

        {/* Action Buttons at Bottom */}
        <Box sx={{ borderTop: '2px solid rgba(0,0,0,0.08)', pt: 2, mt: 'auto' }}>
          {buildingWorkout.length > 0 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateWorkout}
              disabled={loading}
              startIcon={<PlayArrowIcon />}
              fullWidth
              size="large"
              sx={{ fontWeight: 'bold', py: 1.5 }}
            >
              Start Workout ({buildingWorkout.length} exercise{buildingWorkout.length > 1 ? 's' : ''})
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Add exercises above to build your workout plan
            </Typography>
          )}
        </Box>
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
      
      // Navigate to workout page after starting
      if (onNavigateToWorkout) {
        onNavigateToWorkout();
      }
    }
  };

  const totalExercises = workoutPlan.exercises?.length || 0;
  const completedCount = completedExercises.length;
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-section="workout-plan">
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            minHeight: 64,
            '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' },
            '& .MuiAccordionSummary-content': { my: 2 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <AssignmentIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  Today's Workout
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {completedCount} of {totalExercises} exercises completed
                </Typography>
              </Box>
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

        <AccordionDetails sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={2} sx={{ pb: 2 }}>
            {workoutPlan.exercises?.map((exercise, index: number) => {
              const isCompleted = completedExercises.includes(index);
              const isCurrentlyTracking = currentExerciseIndex === index && isTracking;
              const isTrackable = exercise.trackable;

              // Find next exercise for display
              const nextExercise = workoutPlan.exercises?.[index + 1];
              const isNextExercise = !isCompleted && !isCurrentlyTracking && index === completedExercises.length;

              return (
                <Card 
                  key={index}
                  elevation={isCurrentlyTracking ? 4 : 1}
                  sx={{
                    borderLeft: isCompleted ? '5px solid #4caf50' : isCurrentlyTracking ? '5px solid #2196F3' : isNextExercise ? '5px solid #ff9800' : '5px solid #e0e0e0',
                    backgroundColor: isCompleted ? '#f1f8f4' : isCurrentlyTracking ? '#e3f2fd' : isNextExercise ? '#fff3e0' : 'white',
                    transition: 'all 0.3s ease',
                    animation: isCurrentlyTracking ? 'pulse 2s infinite' : 'none',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                      '50%': { boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)' },
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ flex: 1, fontWeight: 600, fontSize: '1.1rem' }}>
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
                        {isNextExercise && !isCurrentlyTracking && (
                          <Chip
                            label="Next Up"
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
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

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip 
                        label={`${exercise.sets} sets`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                      <Chip 
                        label={`${exercise.reps_per_set} reps`} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                      {(exercise.weight && exercise.weight > 0) ? (
                        <Chip 
                          label={`${exercise.weight} kg`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 'medium' }}
                        />
                      ) : null}
                    </Box>

                    {settings.showAdvancedMode && isTrackable && exercise.mapped_exercise && (
                      <Typography variant="caption" color="text.disabled">
                        Maps to: <strong>{exercise.mapped_exercise}</strong>
                      </Typography>
                    )}
                    
                    {/* Show next exercise preview when currently tracking */}
                    {isCurrentlyTracking && nextExercise && (
                      <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1, border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                        <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 'bold', display: 'block' }}>
                          Up Next: {nextExercise.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {nextExercise.sets} sets x {nextExercise.reps_per_set} reps @ {nextExercise.weight}kg
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  {isTrackable && !isCompleted && (
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      {isCurrentlyTracking ? (
                        <Button
                          size="medium"
                          variant="contained"
                          color="error"
                          onClick={handleStop}
                          disabled={loading}
                          startIcon={<StopIcon />}
                          fullWidth
                          sx={{ fontWeight: 'bold' }}
                        >
                          Stop Exercise
                        </Button>
                      ) : (
                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={() => handleStartExercise(exercise, index)}
                          disabled={isTracking}
                          startIcon={<PlayArrowIcon />}
                          fullWidth
                          sx={{ fontWeight: 'bold' }}
                        >
                          {isTracking ? 'In Progress...' : 'Start Exercise'}
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
      </Paper>

      {/* Standalone Exercise Selector */}
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 3, borderTop: '2px solid rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AddIcon />
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
                  slotProps={{ htmlInput: { min: 1 } }}
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
                  slotProps={{ htmlInput: { min: 1 } }}
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
                  slotProps={{ htmlInput: { min: 0, step: 2.5 } }}
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
                  slotProps={{ htmlInput: { min: 0, step: 5 } }}
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
    </Box>
  );
};

export default WorkoutPlan;
