/**
 * Client-Side Pose Detection Service
 * Uses MediaPipe Pose (WASM) to perform pose detection in the browser
 */

import { Pose, Results, POSE_CONNECTIONS, POSE_LANDMARKS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { PoseLandmark } from '../utils/exerciseMetrics';

export interface PoseDetectionConfig {
  modelComplexity?: 0 | 1 | 2; // 0=lite, 1=full (default), 2=heavy
  smoothLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  showAdvancedMode?: boolean;
}

export interface PoseResults {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
  timestamp: number;
}

export type PoseResultsCallback = (results: PoseResults | null) => void;

/**
 * Client-side pose detector using MediaPipe WASM
 */
export class ClientSidePoseDetector {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private onResultsCallback: PoseResultsCallback | null = null;
  private isInitialized = false;
  private isRunning = false;
  private drawingEnabled = true;

  constructor(config: PoseDetectionConfig = {}) {
    this.drawingEnabled = config.showAdvancedMode ?? false;
    this.initializePose(config);
  }

  /**
   * Initialize MediaPipe Pose
   */
  private initializePose(config: PoseDetectionConfig): void {
    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    this.pose.setOptions({
      modelComplexity: config.modelComplexity ?? 1,
      smoothLandmarks: config.smoothLandmarks ?? true,
      minDetectionConfidence: config.minDetectionConfidence ?? 0.5,
      minTrackingConfidence: config.minTrackingConfidence ?? 0.5,
    });

    this.pose.onResults((results: Results) => {
      this.handleResults(results);
    });
  }

  /**
   * Handle pose detection results
   */
  private handleResults(results: Results): void {
    // Always draw video on canvas
    if (this.canvasElement) {
      this.drawPose(results);
    }

    // Convert to our format and call callback
    if (this.onResultsCallback) {
      const poseResults = this.convertResults(results);
      this.onResultsCallback(poseResults);
    }
  }

  /**
   * Convert MediaPipe results to our format
   */
  private convertResults(results: Results): PoseResults | null {
    if (!results.poseLandmarks) {
      return null;
    }

    return {
      landmarks: results.poseLandmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      })),
      worldLandmarks: results.poseWorldLandmarks
        ? results.poseWorldLandmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility,
          }))
        : [],
      timestamp: Date.now(),
    };
  }

  /**
   * Draw pose landmarks and connections on canvas
   */
  private drawPose(results: Results): void {
    if (!this.canvasElement) return;

    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.save();
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Draw the video frame with aspect ratio preservation
    if (this.videoElement && this.videoElement.readyState >= 2) {
      try {
        // Calculate dimensions to maintain aspect ratio (contain fit)
        const videoAspect = this.videoElement.videoWidth / this.videoElement.videoHeight;
        const canvasAspect = this.canvasElement.width / this.canvasElement.height;
        
        let drawWidth = this.canvasElement.width;
        let drawHeight = this.canvasElement.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (canvasAspect > videoAspect) {
          // Canvas is wider - add pillarboxes (black bars on sides)
          drawWidth = this.canvasElement.height * videoAspect;
          offsetX = (this.canvasElement.width - drawWidth) / 2;
        } else {
          // Canvas is taller - add letterboxes (black bars on top/bottom)
          drawHeight = this.canvasElement.width / videoAspect;
          offsetY = (this.canvasElement.height - drawHeight) / 2;
        }
        
        // Fill black background (for letterboxing/pillarboxing)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw video maintaining aspect ratio
        ctx.drawImage(
          this.videoElement,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );
      } catch (err) {
        console.warn('[PoseDetection] Error drawing video frame:', err);
      }
    } else {
      // Fill with black if video not ready
      if (this.videoElement) {
        console.warn('[PoseDetection] Video not ready, readyState:', this.videoElement.readyState, 'paused:', this.videoElement.paused, 'currentTime:', this.videoElement.currentTime);
      }
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    // Draw pose if detected and advanced mode enabled
    if (results.poseLandmarks && this.drawingEnabled) {
      // Draw connections
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4,
      });

      // Draw landmarks
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 6,
      });
    }

    ctx.restore();
  }

  /**
   * Start pose detection from video file
   */
  async startFromVideoFile(
    videoFile: File,
    canvasElement: HTMLCanvasElement,
    onResults: PoseResultsCallback
  ): Promise<void> {
    if (!this.pose) {
      throw new Error('Pose detector not initialized');
    }

    // Create video element for file
    const videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    videoElement.preload = 'auto';
    videoElement.playsInline = true;
    videoElement.muted = true; // Mute to allow autoplay
    videoElement.loop = true; // Enable looping
    document.body.appendChild(videoElement);

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResultsCallback = onResults;

    // Load video file
    const videoUrl = URL.createObjectURL(videoFile);
    videoElement.src = videoUrl;

    // Wait for video metadata to load with timeout
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          console.log(`[PoseDetection] Video loaded: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          resolve();
        };
        videoElement.onerror = (e) => {
          console.error('[PoseDetection] Video error:', e);
          reject(new Error('Failed to load video file'));
        };
      }),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Video load timeout')), 10000)
      )
    ]);

    // Wait for enough data to play
    if (videoElement.readyState < 2) {
      await new Promise<void>((resolve) => {
        videoElement.oncanplay = () => resolve();
      });
    }

    // Play video
    try {
      await videoElement.play();
      console.log('[PoseDetection] Video playing');
    } catch (err) {
      console.error('[PoseDetection] Play error:', err);
      throw new Error('Failed to play video');
    }

    // Process frames manually
    this.isRunning = true;
    this.isInitialized = true;

    const processFrame = async () => {
      if (!this.isRunning || !this.pose || !videoElement) return;

      if (!videoElement.paused && !videoElement.ended) {
        await this.pose.send({ image: videoElement });
        requestAnimationFrame(processFrame);
      } else {
        console.warn('[PoseDetection] Frame processing stopped - paused:', videoElement.paused, 'ended:', videoElement.ended);
      }
    };

    processFrame();
    console.log('[ClientSidePoseDetector] Started from video file');
  }

  /**
   * Start pose detection from video element
   */
  async startFromVideo(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onResults: PoseResultsCallback
  ): Promise<void> {
    if (!this.pose) {
      throw new Error('Pose detector not initialized');
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResultsCallback = onResults;

    // Set canvas size to match video
    canvasElement.width = videoElement.videoWidth || 1280;
    canvasElement.height = videoElement.videoHeight || 720;

    // Initialize camera
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.pose && this.isRunning) {
          await this.pose.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    await this.camera.start();
    this.isRunning = true;
    this.isInitialized = true;

    console.log('[ClientSidePoseDetector] Started from video');
  }

  /**
   * Start pose detection from webcam
   */
  async startFromWebcam(
    canvasElement: HTMLCanvasElement,
    onResults: PoseResultsCallback
  ): Promise<void> {
    if (!this.pose) {
      throw new Error('Pose detector not initialized');
    }

    // Create hidden video element for webcam
    const videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResultsCallback = onResults;

    // Request webcam access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    // Set canvas size
    canvasElement.width = videoElement.videoWidth || 1280;
    canvasElement.height = videoElement.videoHeight || 720;

    // Initialize camera
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.pose && this.isRunning) {
          await this.pose.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    await this.camera.start();
    this.isRunning = true;
    this.isInitialized = true;

    console.log('[ClientSidePoseDetector] Started from webcam');
  }

  /**
   * Stop pose detection
   */
  stop(): void {
    this.isRunning = false;

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }

    // Clean up video element if we created it
    if (this.videoElement && this.videoElement.parentNode) {
      const stream = this.videoElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (this.videoElement.style.display === 'none') {
        this.videoElement.parentNode.removeChild(this.videoElement);
      }
    }

    this.videoElement = null;
    this.canvasElement = null;
    this.onResultsCallback = null;
    this.isInitialized = false;

    console.log('[ClientSidePoseDetector] Stopped');
  }

  /**
   * Enable or disable pose drawing on canvas
   */
  setDrawingEnabled(enabled: boolean): void {
    this.drawingEnabled = enabled;
  }

  /**
   * Update pose detection options
   */
  updateOptions(config: PoseDetectionConfig): void {
    if (this.pose) {
      this.pose.setOptions({
        modelComplexity: config.modelComplexity ?? 1,
        smoothLandmarks: config.smoothLandmarks ?? true,
        minDetectionConfidence: config.minDetectionConfidence ?? 0.5,
        minTrackingConfidence: config.minTrackingConfidence ?? 0.5,
      });
    }
  }

  /**
   * Check if detector is running
   */
  isActive(): boolean {
    return this.isRunning && this.isInitialized;
  }

  /**
   * Get landmark by index
   */
  static getLandmarkIndex(landmarkName: string): number {
    return POSE_LANDMARKS[landmarkName as keyof typeof POSE_LANDMARKS];
  }
}

// Export MediaPipe constants for convenience
export { POSE_LANDMARKS, POSE_CONNECTIONS };
