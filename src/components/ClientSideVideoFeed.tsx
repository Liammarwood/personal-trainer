/**
 * Client-Side Video Feed Component
 * Uses MediaPipe WASM for pose detection in the browser
 */

import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { ClientSidePoseDetector, PoseResults } from '../services/poseDetection';
import { ExerciseMetricsCalculator, ExerciseConfig } from '../services/exerciseMetricsCalculator';
import { getExercise } from '../services/exerciseConfig';
import api from '../services/api';

interface ClientSideVideoFeedProps {
  exerciseId: string;
  onMetricsUpdate: (metrics: any) => void;
  onRepComplete: (repData: any) => void;
  sessionId: string | null;
  isTracking: boolean;
  videoFile?: File | null;
  inRestPeriod?: boolean;
  workoutComplete?: boolean;
  showAdvancedMode?: boolean;
}

const ClientSideVideoFeed: React.FC<ClientSideVideoFeedProps> = ({
  exerciseId,
  onMetricsUpdate,
  onRepComplete,
  sessionId,
  isTracking,
  videoFile = null,
  inRestPeriod = false,
  workoutComplete = false,
  showAdvancedMode = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<ClientSidePoseDetector | null>(null);
  const [calculator, setCalculator] = useState<ExerciseMetricsCalculator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  // Rep counting state
  const [atStartingPosition, setAtStartingPosition] = useState(false);
  const [atRepPosition, setAtRepPosition] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);

  // FPS calculation
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });
  
  // Rep counting refs (to avoid stale state in callbacks)
  const prevAtRepPositionRef = useRef(false);
  const calculatorRef = useRef<ExerciseMetricsCalculator | null>(null);
  const exerciseConfigRef = useRef<ExerciseConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    let detectorInstance: ClientSidePoseDetector | null = null;

    const initializeDetection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load exercise config from static JSON
        console.log('[ClientSideVideoFeed] Loading exercise config:', exerciseId);
        const exerciseData = await getExercise(exerciseId);
        const exerciseConfig: ExerciseConfig = {
          id: exerciseId,
          name: exerciseData.name,
          category: exerciseData.category,
          joints: exerciseData.joints,
          metrics: exerciseData.metrics,
          positions: exerciseData.positions,
          quality_levels: exerciseData.quality_levels,
          instructions: exerciseData.instructions
        };

        // Create metrics calculator
        const calc = new ExerciseMetricsCalculator(exerciseConfig);
        calculatorRef.current = calc;
        exerciseConfigRef.current = exerciseConfig;
        setCalculator(calc);

        // Create pose detector
        const det = new ClientSidePoseDetector({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          showAdvancedMode
        });

        if (!mounted) return;

        // Start detection from video file or webcam
        if (canvasRef.current) {
          if (videoFile) {
            console.log('[ClientSideVideoFeed] Starting with VIDEO FILE:', videoFile.name, videoFile.size, 'bytes');
            await det.startFromVideoFile(videoFile, canvasRef.current, (results: PoseResults | null) => {
              if (!mounted || !calc) return;

              // Update FPS counter
              const counter = fpsCounterRef.current;
              counter.frames++;
              const now = Date.now();
              if (now - counter.lastTime >= 1000) {
                setFps(counter.frames);
                counter.frames = 0;
                counter.lastTime = now;
              }

              if (!results) return;

              // Calculate metrics from landmarks
              const metrics = calc.calculateMetrics(results.landmarks);
              setCurrentMetrics(metrics);
              
              // Check positions for rep counting
              const isAtStart = calc.isAtStartingPosition(metrics);
              const isAtRep = calc.isAtRepPosition(metrics);

              setAtStartingPosition(isAtStart);
              setAtRepPosition(isAtRep);
              
              // Determine and pass current instruction
              const currentInstruction = getCurrentInstruction(isAtStart, isAtRep);
              onMetricsUpdate({ ...metrics, current_instruction: currentInstruction });

              // Detect rep completion (using ref to avoid stale state)
              const wasAtRep = prevAtRepPositionRef.current;
              
              // Count rep when leaving rep position (but not during rest period or if workout complete)
              if (wasAtRep && !isAtRep && !inRestPeriod && !workoutComplete) {
                console.log('[ClientSideVideoFeed] [VIDEO] Rep completed! Left rep position');
                handleRepComplete(metrics);
              }
              
              // Log if rep was skipped due to rest period
              if (wasAtRep && !isAtRep && inRestPeriod) {
                console.log('[ClientSideVideoFeed] [VIDEO] Rep detected but skipped (in rest period)');
              }
              
              // Log if rep was skipped due to workout completion
              if (wasAtRep && !isAtRep && workoutComplete) {
                console.log('[ClientSideVideoFeed] [VIDEO] Rep detected but skipped (workout complete)');
              }
              
              // Log position changes for debugging with metrics
              if (wasAtRep !== isAtRep) {
                console.log('[ClientSideVideoFeed] [VIDEO] Rep position changed:', wasAtRep, '->', isAtRep, 'Start:', isAtStart);
                console.log('[ClientSideVideoFeed] [VIDEO] Metrics:', {
                  knee_angle_degrees: metrics.knee_angle?.toFixed(1) + '°',
                  squat_depth_normalized: metrics.squat_depth?.toFixed(3),
                  squat_depth_threshold_rep: '< 0.15',
                  squat_depth_threshold_start: '> 0.18'
                });
              }

              prevAtRepPositionRef.current = isAtRep;
            });
          } else {
            await det.startFromWebcam(canvasRef.current, (results: PoseResults | null) => {
              if (!mounted || !calc) return;

              // Update FPS counter
              const counter = fpsCounterRef.current;
              counter.frames++;
              const now = Date.now();
              if (now - counter.lastTime >= 1000) {
                setFps(counter.frames);
                counter.frames = 0;
                counter.lastTime = now;
              }

              if (!results) return;

              // Calculate metrics from landmarks
              const metrics = calc.calculateMetrics(results.landmarks);
              setCurrentMetrics(metrics);
              
              // Check positions for rep counting
              const isAtStart = calc.isAtStartingPosition(metrics);
              const isAtRep = calc.isAtRepPosition(metrics);

              setAtStartingPosition(isAtStart);
              setAtRepPosition(isAtRep);
              
              // Determine and pass current instruction
              const currentInstruction = getCurrentInstruction(isAtStart, isAtRep);
              onMetricsUpdate({ ...metrics, current_instruction: currentInstruction });

              // Detect rep completion (using ref to avoid stale state)
              const wasAtRep = prevAtRepPositionRef.current;
              
              // Count rep when leaving rep position (but not during rest period or if workout complete)
              if (wasAtRep && !isAtRep && !inRestPeriod && !workoutComplete) {
                console.log('[ClientSideVideoFeed] [WEBCAM] Rep completed! Left rep position');
                handleRepComplete(metrics);
              }
              
              // Log if rep was skipped due to rest period
              if (wasAtRep && !isAtRep && inRestPeriod) {
                console.log('[ClientSideVideoFeed] [WEBCAM] Rep detected but skipped (in rest period)');
              }
              
              // Log if rep was skipped due to workout completion
              if (wasAtRep && !isAtRep && workoutComplete) {
                console.log('[ClientSideVideoFeed] [WEBCAM] Rep detected but skipped (workout complete)');
              }
              
              // Log position changes for debugging
              if (wasAtRep !== isAtRep) {
                console.log('[ClientSideVideoFeed] [WEBCAM] Rep position changed:', wasAtRep, '->', isAtRep, 'Start:', isAtStart);
                console.log('[ClientSideVideoFeed] [WEBCAM] Metrics:', metrics);
              }

              prevAtRepPositionRef.current = isAtRep;
            });
          }

          detectorInstance = det;
          setDetector(det);
          setLoading(false);
          console.log('[ClientSideVideoFeed] Pose detection initialized');
        }
      } catch (err: any) {
        console.error('[ClientSideVideoFeed] Initialization error:', err);
        setError(err.message || 'Failed to initialize pose detection');
        setLoading(false);
      }
    };

    if (isTracking) {
      initializeDetection();
    }

    return () => {
      mounted = false;
      if (detectorInstance) {
        console.log('[ClientSideVideoFeed] Cleaning up detector');
        detectorInstance.stop();
      }
    };
  }, [exerciseId, isTracking, videoFile]);

  const getCurrentInstruction = (isAtStart: boolean, isAtRep: boolean): string => {
    const config = exerciseConfigRef.current;
    if (!config || !config.instructions) return '';
    
    // Priority: rep position > starting position > return
    if (isAtRep) {
      return config.instructions.in_position || '';
    } else if (isAtStart) {
      return config.instructions.ready || '';
    } else {
      return config.instructions.return || '';
    }
  };

  const handleRepComplete = async (metrics: any) => {
    const calc = calculatorRef.current;
    console.log('[ClientSideVideoFeed] handleRepComplete called, sessionId:', sessionId, 'calculator:', !!calc);
    
    if (!sessionId || !calc) {
      console.warn('[ClientSideVideoFeed] Cannot complete rep - missing sessionId or calculator');
      return;
    }

    try {
      // Validate rep with backend
      const validation = await api.validateRepV2(exerciseId, metrics, 'rep');
      
      const repData = {
        metrics,
        quality: validation.quality || 'Complete',
        valid: validation.valid,
        timestamp: Date.now()
      };

      // Log rep to session
      await api.logRepV2(sessionId, metrics, repData.quality);

      // Call parent callback to update UI
      console.log('[ClientSideVideoFeed] Calling onRepComplete with:', repData);
      onRepComplete(repData);
      console.log('[ClientSideVideoFeed] Rep processing complete');
    } catch (err) {
      console.error('[ClientSideVideoFeed] Error logging rep:', err);
      
      // Still call onRepComplete even if backend fails
      const repData = {
        metrics,
        quality: 'Complete',
        valid: true,
        timestamp: Date.now()
      };
      console.log('[ClientSideVideoFeed] Backend failed, calling onRepComplete anyway:', repData);
      onRepComplete(repData);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Pose Detection Error</Typography>
          <Typography variant="body2">{error}</Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Please ensure your browser supports WebGL and you've granted camera permissions.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        autoPlay
      />

      {/* Canvas for pose visualization */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: loading ? 'none' : 'block',
          backgroundColor: '#000',
          objectFit: 'contain'
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading MediaPipe Pose...
          </Typography>
          <Typography variant="caption" sx={{ mt: 1 }}>
            First load may take a few seconds
          </Typography>
        </Box>
      )}

      {/* FPS Counter (dev mode) */}
      {showAdvancedMode && !loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#0f0',
            padding: '4px 8px',
            borderRadius: 1,
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        >
          {fps} FPS
        </Box>
      )}

      {/* Position indicators (dev mode) */}
      {showAdvancedMode && !loading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            gap: 1
          }}
        >
          <Box
            sx={{
              backgroundColor: atStartingPosition ? '#4caf50' : 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '11px'
            }}
          >
            START
          </Box>
          <Box
            sx={{
              backgroundColor: atRepPosition ? '#2196f3' : 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '11px'
            }}
          >
            REP
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ClientSideVideoFeed;
