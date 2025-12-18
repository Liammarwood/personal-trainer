import { Card, CardContent, CardActions, Box, Typography, Chip, IconButton, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Exercise as ExerciseType } from '../../types';

interface ExerciseCardProps {
  exercise: ExerciseType & {
    sets: number;
    reps_per_set: number;
    weight: number;
    rest_seconds: number;
    trackable: boolean;
    mapped_exercise?: string;
  };
  index: number;
  isCompleted: boolean;
  isCurrentlyTracking: boolean;
  isNextExercise: boolean;
  showAdvancedMode: boolean;
  nextExercise?: ExerciseType & {
    name: string;
    sets: number;
    reps_per_set: number;
    weight: number;
  };
  onStart: (index: number) => void;
  onRemove: (index: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  isCompleted,
  isCurrentlyTracking,
  isNextExercise,
  showAdvancedMode,
  nextExercise,
  onStart,
  onRemove
}) => {
  const isTrackable = exercise.trackable;

  return (
    <Card 
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
                onClick={() => onRemove(index)}
                aria-label={`Remove ${exercise.name} from plan`}
                sx={{ 
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.light', color: 'white' }
                }}
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

        {showAdvancedMode && isTrackable && exercise.mapped_exercise && (
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
          <Button
            fullWidth
            variant={isCurrentlyTracking ? "outlined" : "contained"}
            color="primary"
            size="medium"
            onClick={() => onStart(index)}
            disabled={isCurrentlyTracking}
            startIcon={<PlayArrowIcon />}
            aria-label={`Start ${exercise.name}`}
          >
            {isCurrentlyTracking ? 'In Progress' : 'Start Exercise'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
