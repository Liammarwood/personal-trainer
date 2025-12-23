import React, { memo, useState } from 'react';
import { Box, Typography, LinearProgress, Chip, Paper, Grid, IconButton, Tooltip } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimerIcon from '@mui/icons-material/Timer';
import RepeatIcon from '@mui/icons-material/Repeat';
import MinimizeIcon from '@mui/icons-material/Minimize';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSettings } from '../context/SettingsContext';
import type { WorkoutStats } from '../types';

interface WorkoutStatsOverlayProps {
  stats: WorkoutStats | null;
  visible: boolean;
}

const WorkoutStatsOverlay: React.FC<WorkoutStatsOverlayProps> = ({ stats, visible }) => {
  const { settings } = useSettings();
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (!stats) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to format metric values
  const formatMetricValue = (metricName: string, value: number): string => {
    const name = metricName.toLowerCase();
    // Metrics that represent percentages/ratios (normalized 0-1 values)
    if (name.includes('height') || 
        name.includes('spread') || 
        name.includes('distance') || 
        name.includes('depth') ||
        name.includes('elevation')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    // Angle metrics in degrees
    return `${Math.round(value)}°`;
  };

  const expectedPlan = stats.expected_plan || {};
  const hasExpectedPlan = Boolean(expectedPlan.sets && expectedPlan.reps_per_set);
  
  // Calculate progress
  // stats.sets = completed sets (increments immediately when set completes)
  // stats.reps = reps in current/next set (resets to 0 when set completes)
  // Total reps = (completed sets * reps per set) + current set reps
  const totalExpectedReps = hasExpectedPlan 
    ? (expectedPlan.sets || 0) * (expectedPlan.reps_per_set || 0)
    : 0;
  const totalCompletedReps = (stats.sets || 0) * (expectedPlan.reps_per_set || 0) + (stats.reps || 0);
  const progress = totalExpectedReps > 0 
    ? (totalCompletedReps / totalExpectedReps) * 100 
    : 0;

  return (
    <>
      {/* Rest Timer - Large Display During Rest */}
      {stats.in_rest_period && !stats.workout_complete && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: 'rgba(237, 108, 2, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: { xs: 3, sm: 4 },
            minWidth: { xs: 250, sm: 300 },
            zIndex: 3,
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Typography variant="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
            {stats.rest_remaining}s
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Rest Period
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Get Ready for Next Set
          </Typography>
        </Box>
      )}

      {/* Exercise Instruction Overlay - Bottom */}
      {stats.current_instruction && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)',
            padding: { xs: 2, sm: 3 },
            zIndex: 2,
          }}
        >
          <Chip
            label={stats.current_instruction}
            sx={{
              fontSize: { xs: '0.9rem', sm: '1.2rem' },
              fontWeight: 'bold',
              padding: { xs: '15px 20px', sm: '20px 30px' },
              height: 'auto',
              width: '100%',
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                textAlign: 'center',
              },
            }}
          />
        </Box>
      )}

      {/* Stats Panel - Top Left (only visible when setting enabled) */}
      {visible && !isMinimized && (
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 10, sm: 10 },
            left: { xs: 10, sm: 15 },
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            padding: { xs: 1.5, sm: 2 },
            minWidth: { xs: 200, sm: 250 },
            zIndex: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', flex: 1 }}>
              Workout Progress
            </Typography>
            <Tooltip title="Minimize stats">
              <IconButton
                onClick={() => setIsMinimized(true)}
                size="small"
                aria-label="Minimize workout stats"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '4px',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <MinimizeIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Stats Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Current Set/Reps */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RepeatIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Set {stats.sets + 1 || 1}
                  {hasExpectedPlan && ` / ${expectedPlan.sets}`}
                </Typography>
              </Box>
              <Chip
                label={`${stats.reps || 0}${hasExpectedPlan ? ` / ${expectedPlan.reps_per_set}` : ''} reps`}
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              />
            </Box>

            {/* Duration */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimerIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Time
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                {formatTime(stats.duration || 0)}
              </Typography>
            </Box>

            {/* Target Weight (if available) */}
            {expectedPlan.target_weight ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Weight
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {expectedPlan.target_weight} kg
                </Typography>
              </Box>
            ) : null}

            {/* Progress Bar */}
            {hasExpectedPlan && (
              <Box sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Progress
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progress >= 100 ? '#4caf50' : 'primary.main',
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
            )}

            {/* Total Reps */}
            {hasExpectedPlan && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Total Reps
                </Typography>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {totalCompletedReps} / {totalExpectedReps}
                </Typography>
              </Box>
            )}

            {/* Rep Quality Feedback */}
            {stats.rep_quality && (
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <Chip
                  label={stats.rep_quality}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: stats.rep_quality.includes('Excellent') ? '#4caf50' :
                                     stats.rep_quality.includes('Good') ? '#8bc34a' :
                                     stats.rep_quality.includes('Fair') ? '#ff9800' : '#f44336',
                    color: 'white',
                  }}
                />
              </Box>
            )}

            {/* Advanced Mode - Live Metrics */}
            {settings.showAdvancedMode && stats.joint_angles && Object.keys(stats.joint_angles).length > 0 && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  LIVE METRICS
                </Typography>
                <Grid container spacing={0.5}>
                  {Object.entries(stats.joint_angles).map(([joint, angle]) => (
                    <Grid size={{ xs: 6 }} key={joint}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>
                          {joint.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                          {formatMetricValue(joint, angle)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Restore Button - Shows when overlay is minimized */}
      {visible && isMinimized && (
        <Tooltip title="Show workout stats">
          <IconButton
            onClick={() => setIsMinimized(false)}
            aria-label="Show workout stats"
            sx={{
              position: 'absolute',
              top: { xs: 10, sm: 10 },
              left: { xs: 10, sm: 15 },
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              color: 'primary.main',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: 'primary.light',
              },
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

export default memo(WorkoutStatsOverlay);