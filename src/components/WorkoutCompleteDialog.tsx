import { Grid } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimerIcon from '@mui/icons-material/Timer';
import RepeatIcon from '@mui/icons-material/Repeat';
import type { WorkoutStats } from '../types';

interface WorkoutCompleteDialogProps {
  open: boolean;
  onClose: () => void;
  stats: WorkoutStats | null;
  exerciseName: string;
}

const WorkoutCompleteDialog: React.FC<WorkoutCompleteDialogProps> = ({ open, onClose, stats, exerciseName }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: 80, mb: 2, color: '#FFD700' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Well Done!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Workout Complete
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 3 }}>
        <Box sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.15)', 
          borderRadius: 2, 
          p: 3, 
          mb: 3,
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
            {exerciseName}
          </Typography>
          
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <FitnessCenterIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats?.expected_plan?.sets || stats?.sets || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Sets
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <RepeatIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {((stats?.expected_plan?.sets || stats?.sets || 0) * (stats?.expected_plan?.reps_per_set || stats?.reps || 0))}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Total Reps
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <TimerIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatTime(stats?.duration || 0)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Time
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center', 
            opacity: 0.9,
            fontStyle: 'italic'
          }}
        >
          Great job! You've completed your workout. Keep up the excellent work! 💪
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            backgroundColor: 'white',
            color: '#667eea',
            fontWeight: 'bold',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutCompleteDialog;
