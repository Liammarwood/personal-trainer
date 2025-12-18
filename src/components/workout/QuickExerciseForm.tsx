import { SyntheticEvent, ChangeEvent } from 'react';
import { Box, Typography, Autocomplete, TextField, Grid, Button, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Exercise } from '../../types';
import { DEFAULT_WORKOUT } from '../../constants';

interface QuickExerciseFormProps {
  exercises: Exercise[];
  selectedExercise: Exercise | null;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  isTracking: boolean;
  buildingCount: number;
  onExerciseChange: (exercise: Exercise | null) => void;
  onSetsChange: (sets: number) => void;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onRestChange: (rest: number) => void;
  onAddToWorkout: () => void;
}

export const QuickExerciseForm: React.FC<QuickExerciseFormProps> = ({
  exercises,
  selectedExercise,
  sets,
  reps,
  weight,
  rest,
  isTracking,
  buildingCount,
  onExerciseChange,
  onSetsChange,
  onRepsChange,
  onWeightChange,
  onRestChange,
  onAddToWorkout
}) => {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        {buildingCount > 0 ? 'Add Another Exercise' : 'Add First Exercise'}
      </Typography>
      
      <Autocomplete
        fullWidth
        options={exercises}
        getOptionLabel={(option) => option.name}
        value={selectedExercise}
        onChange={(event: SyntheticEvent, newValue: Exercise | null) => {
          onExerciseChange(newValue);
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSetsChange(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Reps"
                type="number"
                value={reps}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onRepsChange(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onWeightChange(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0, step: 2.5 } }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Rest (sec)"
                type="number"
                value={rest}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onRestChange(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0, step: 5 } }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button
            variant="outlined"
            color="primary"
            onClick={onAddToWorkout}
            disabled={!selectedExercise}
            startIcon={<AddIcon />}
            fullWidth
            size="large"
            aria-label="Add exercise to workout plan"
          >
            Add to Workout Plan
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};
