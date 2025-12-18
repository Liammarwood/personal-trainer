import { memo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { GRADIENT_BACKGROUNDS } from '../constants';
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
  IconButton,
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
    <Paper elevation={3} sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FitnessCenterIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Workout Stats
          </Typography>
        </Box>
        {onShowVideo && (
          <IconButton
            onClick={onShowVideo}
            color="primary"
            size="large"
            aria-label="Show video feed"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <VideocamIcon />
          </IconButton>
        )}
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Exercise Instruction - Prominent Display */}
        {isTracking && stats.current_instruction && (
          <Alert 
            severity={stats.workout_complete ? 'success' : stats.in_rest_period ? 'warning' : 'info'}
            icon={<DirectionsRunIcon />}
            sx={{ 
              mb: 3, 
              fontSize: '1.1rem',
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
            p: 4, 
            mb: 3,
            background: GRADIENT_BACKGROUNDS.WARNING,
            borderRadius: 3,
            border: '3px solid',
            borderColor: 'warning.main',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
          }}>
            <Typography variant="h1" sx={{ fontWeight: 'bold', color: 'warning.dark', mb: 1 }}>
              {stats.rest_remaining}s
            </Typography>
            <Typography variant="h6" sx={{ color: 'warning.dark' }}>
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
              mb: 3, 
              fontSize: '1rem',
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
        
        {/* Main Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              background: GRADIENT_BACKGROUNDS.PRIMARY,
              color: 'white', 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <RepeatIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.reps || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                Reps Completed
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              background: GRADIENT_BACKGROUNDS.SECONDARY,
              color: 'white', 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <FitnessCenterIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {stats.sets || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                Sets Completed
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 3, 
              background: GRADIENT_BACKGROUNDS.TERTIARY,
              color: 'white', 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <TimerIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {formatTime(stats.duration || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                Total Time
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Target Workout Plan */}
        {stats.expected_plan && (
          <Paper elevation={2} sx={{ p: 2.5, backgroundColor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Target Workout
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.expected_plan.sets}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target Sets
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.expected_plan.reps_per_set}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Reps/Set
                  </Typography>
                </Box>
              </Grid>
              {(stats.expected_plan.target_weight && stats.expected_plan.target_weight > 0) ? (
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {stats.expected_plan.target_weight}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Weight (kg)
                    </Typography>
                  </Box>
                </Grid>
              ) : null}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.expected_plan.rest_seconds}s
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rest Period
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Empty State */}
        {!isTracking && stats.reps === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            color: 'text.disabled',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <FitnessCenterIcon sx={{ fontSize: 80, opacity: 0.3 }} />
            <Typography variant="h6">
              No Active Workout
            </Typography>
            <Typography variant="body2">
              Start an exercise to see live stats
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default memo(StatsPanel);
