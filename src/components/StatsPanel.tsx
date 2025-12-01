import { useWorkout } from '../context/WorkoutContext';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Button,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimerIcon from '@mui/icons-material/Timer';
import RepeatIcon from '@mui/icons-material/Repeat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import VideocamIcon from '@mui/icons-material/Videocam';

interface StatsPanelProps {
  onShowVideo?: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ onShowVideo }) => {
  const { stats, isTracking } = useWorkout();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Workout Stats
        </Typography>
        {onShowVideo && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<VideocamIcon />}
            onClick={onShowVideo}
            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
          >
            Show Video
          </Button>
        )}
      </Box>

      {/* Exercise Instruction - Prominent Display */}
      {isTracking && stats.current_instruction && (
        <Alert 
          severity={stats.workout_complete ? 'success' : stats.in_rest_period ? 'warning' : 'info'}
          icon={<DirectionsRunIcon />}
          sx={{ 
            mb: 2, 
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            fontWeight: 'bold',
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          {stats.current_instruction}
        </Alert>
      )}

      {/* Rest Timer - Large Display During Rest */}
      {isTracking && stats.in_rest_period && !stats.workout_complete && (
        <Box sx={{ 
          textAlign: 'center', 
          p: 3, 
          mb: 2,
          backgroundColor: 'warning.light', 
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'warning.main'
        }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
            {stats.rest_remaining}s
          </Typography>
          <Typography variant="body1" sx={{ color: 'warning.dark', mt: 1 }}>
            Rest Period - Get Ready for Next Set
          </Typography>
        </Box>
      )}

      {/* Rep Quality Feedback */}
      {isTracking && stats.rep_quality && (
        <Alert 
          severity={
            stats.rep_quality.includes('Excellent') ? 'success' :
            stats.rep_quality.includes('Good') ? 'success' :
            stats.rep_quality.includes('Fair') ? 'warning' : 'error'
          }
          sx={{ 
            mb: 2, 
            fontSize: { xs: '0.85rem', sm: '1rem' },
            fontWeight: 'bold',
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          {stats.rep_quality}
        </Alert>
      )}
      
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {stats.reps || 0}
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              <RepeatIcon fontSize="small" /> Reps
            </Typography>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: 'secondary.main', color: 'white', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {stats.sets || 0}
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              <FitnessCenterIcon fontSize="small" /> Sets
            </Typography>
          </Box>
        </Grid>
        
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: 'success.main', color: 'white', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {formatTime(stats.duration || 0)}
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              <TimerIcon fontSize="small" /> Time
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {stats.expected_plan && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Target Workout
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Target Sets"
                secondary={stats.expected_plan.sets}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Target Reps/Set"
                secondary={stats.expected_plan.reps_per_set}
              />
            </ListItem>
            {stats.expected_plan && stats.expected_plan.target_weight && stats.expected_plan.target_weight > 0 && (
              <ListItem>
                <ListItemText
                  primary="Target Weight"
                  secondary={`${stats.expected_plan.target_weight} kg`}
                />
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary="Rest Period"
                secondary={`${stats.expected_plan.rest_seconds}s`}
              />
            </ListItem>
          </List>
        </>
      )}

      {!isTracking && stats.reps === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
          <Typography variant="body2">
            Start an exercise to see stats
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StatsPanel;
