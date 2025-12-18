import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Exercise } from '../../types';

interface WorkoutBuilderItemProps {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
  index: number;
  onRemove: (index: number) => void;
}

export const WorkoutBuilderItem: React.FC<WorkoutBuilderItemProps> = ({
  exercise,
  sets,
  reps,
  weight,
  index,
  onRemove
}) => {
  return (
    <Card elevation={2} sx={{ 
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
                {index + 1}. {exercise.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`${sets} sets`} size="small" variant="outlined" />
              <Chip label={`${reps} reps`} size="small" variant="outlined" />
              {weight > 0 ? (
                <Chip label={`${weight} kg`} size="small" variant="outlined" color="primary" />
              ) : null}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${exercise.name} from workout`}
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
  );
};
