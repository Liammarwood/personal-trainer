/**
 * Client-Side Workout Scanner
 * Uses Tesseract.js for OCR processing entirely in the browser
 * 
 * Features:
 * - Process images and video frames
 * - Detect FitBod and generic workout formats
 * - Extract exercises, sets, reps, weight, duration
 * - Progress tracking for long operations
 * - Offline support after initial load
 */

import Tesseract, { createWorker, RecognizeResult } from 'tesseract.js';
import { getExercises } from './exerciseConfig';

export interface WorkoutExercise {
  exercise: string;
  sets: number;
  reps?: number | string;
  weight_kg?: number;
  duration?: string;
}

export interface ScanProgress {
  status: 'initializing' | 'loading' | 'processing' | 'recognizing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface ScanResult {
  source: string;
  source_type: 'image' | 'video';
  detected_format: 'fitbod' | 'generic' | 'unknown';
  total_exercises: number;
  timestamp: string;
  exercises: WorkoutExercise[];
  raw_text: string;
}

export class WorkoutScanner {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  /**
   * Initialize the OCR worker
   */
  async initialize(onProgress?: (progress: ScanProgress) => void): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      onProgress?.({
        status: 'initializing',
        progress: 0,
        message: 'Creating OCR worker...'
      });

      this.worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
            onProgress?.({
              status: 'loading',
              progress: Math.round((m.progress || 0) * 50), // 0-50%
              message: `Loading OCR engine... ${Math.round((m.progress || 0) * 100)}%`
            });
          } else if (m.status === 'loading language traineddata') {
            onProgress?.({
              status: 'loading',
              progress: 50 + Math.round((m.progress || 0) * 50), // 50-100%
              message: `Loading language data... ${Math.round((m.progress || 0) * 100)}%`
            });
          }
        }
      });

      // Configure for better accuracy with workout text
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });

      this.isInitialized = true;

      onProgress?.({
        status: 'complete',
        progress: 100,
        message: 'OCR engine ready'
      });
    } catch (error) {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: `Failed to initialize: ${error}`
      });
      throw error;
    }
  }

  /**
   * Terminate the worker and free resources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  private preprocessImage(imageData: ImageData): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    
    ctx.putImageData(imageData, 0, 0);
    
    // Apply filters for better OCR
    // 1. Convert to grayscale
    const imageDataGray = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataGray.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    // 2. Increase contrast
    const contrast = 1.5;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = ((data[i] - 128) * contrast) + 128;
      data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
      data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;
    }
    
    ctx.putImageData(imageDataGray, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  /**
   * Extract text from image using OCR
   */
  async extractText(
    imageSource: File | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<string> {
    if (!this.worker) {
      await this.initialize(onProgress);
    }

    onProgress?.({
      status: 'recognizing',
      progress: 0,
      message: 'Analyzing image...'
    });

    try {
      const result = await this.worker!.recognize(imageSource);
      const text = result.data.text;
      
      // Log OCR output for debugging
      console.log('[WorkoutScanner] OCR extracted text:');
      console.log('---START---');
      console.log(text);
      console.log('---END---');

      return text;
    } catch (error) {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: `OCR failed: ${error}`
      });
      throw error;
    }
  }

  /**
   * Parse generic workout format (WorkoutLabs, etc.)
   */
  parseGenericWorkoutFormat(text: string): WorkoutExercise[] {
    const exercises: WorkoutExercise[] = [];
    const seenExercises = new Set<string>();
    const lines = text.split('\n');

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      i++;

      if (!line || line.length < 3) continue;

      // Skip non-exercise lines
      const skipKeywords = [
        'click', 'print', 'free', 'discover', 'more', 'tools',
        'workoutlabs', 'www.', 'http', '...and', 'exercises',
        'view', 'fitness', 'simple', 'wl'
      ];

      if (skipKeywords.some(k => line.toLowerCase().includes(k))) continue;
      if (['leg day', 'arm day', 'chest day', 'back day'].includes(line.toLowerCase())) continue;

      // Check for exercise name patterns (more lenient for OCR errors)
      let exerciseName: string | null = null;

      // Title case multi-word names (allow some OCR noise)
      if (/^[A-Z][a-z]+(?:[\s\-]+[A-Z][a-z]+)+/.test(line)) {
        exerciseName = this.normalizeExerciseName(line.split(/[·•.—]/)[0].trim());
      }
      // ALL CAPS multi-word names
      else if (/^[A-Z]+(?:[\s\-]+[A-Z]+)+/.test(line)) {
        exerciseName = this.normalizeExerciseName(line.split(/[·•.—]/)[0].trim());
      }
      // Mixed case with 2+ words (more lenient)
      else if (/^[A-Za-z]+(?:[\s\-]+[A-Za-z]+)+/.test(line) && !/^\d/.test(line)) {
        exerciseName = this.normalizeExerciseName(line.split(/[·•.—]/)[0].trim());
      }
      // Single word if it looks like exercise and is long enough
      else if (/^[A-Z][a-z]{4,}$/.test(line) && this.looksLikeExercise(line)) {
        exerciseName = this.normalizeExerciseName(line);
      }

      if (!exerciseName || seenExercises.has(exerciseName)) continue;

      // Look ahead for sets/reps (check current line and next few lines)
      let exerciseData: WorkoutExercise | null = null;
      
      // Also check current line in case sets/reps are on same line
      const linesToCheck = [line, ...Array.from({ length: 3 }, (_, idx) => 
        i + idx < lines.length ? lines[i + idx].trim() : ''
      )];
      
      for (const checkLine of linesToCheck) {
        if (!checkLine) continue;

        // Pattern variations for sets/reps (very lenient for OCR)
        const patterns = [
          // Standard patterns
          /(\d+)\s*[sS]ets?\s*[·•.·\-×x,:\s]+\s*(\d+)\s*[rR]eps?/i,
          // Just numbers with separators
          /(\d+)\s*[·•.—×x]\s*(\d+)(?!\d)/,
          // Sets/reps in any order
          /(\d+)\s*reps?\s*[·•.·\-×x,:\s]+\s*(\d+)\s*sets?/i,
        ];

        for (const pattern of patterns) {
          const match = checkLine.match(pattern);
          if (match) {
            let sets = parseInt(match[1]);
            let reps = parseInt(match[2]);
            
            // If pattern was reps first, swap them
            if (pattern.source.includes('reps?.*sets?')) {
              [sets, reps] = [reps, sets];
            }
            
            // Sanity check: sets usually 1-10, reps usually 1-50
            if (sets > 0 && sets <= 20 && reps > 0 && reps <= 100) {
              exerciseData = {
                exercise: exerciseName,
                sets: sets,
                reps: reps
              };
              console.log(`[WorkoutScanner] Parsed: ${exerciseName} - ${sets} sets × ${reps} reps`);
              break;
            }
          }
        }

        if (exerciseData) break;
      }

      // Add with defaults if looks like valid exercise
      if (!exerciseData && this.looksLikeExercise(exerciseName)) {
        exerciseData = {
          exercise: exerciseName,
          sets: 4,
          reps: 10
        };
      }

      if (exerciseData) {
        seenExercises.add(exerciseName);
        exercises.push(exerciseData);
      }
    }

    return exercises;
  }

  /**
   * Parse FitBod format workout
   */
  parseFitBodFormat(text: string): WorkoutExercise[] {
    const exercises: WorkoutExercise[] = [];
    const seenExercises = new Set<string>();
    const lines = text.split('\n');

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      i++;

      if (!line || ['Start Workout', 'Body Targets Log', 'Target Muscles', 'FOCUS'].includes(line)) {
        continue;
      }

      // Skip common non-exercise lines
      const skipKeywords = [
        'workout', 'swap', 'exercises', 'your gym', 'intermediate',
        'target muscles', 'abs glutes', 'quadrice', 'superset', 'rounds', 'focus'
      ];
      if (skipKeywords.some(k => line.toLowerCase().includes(k))) continue;

      // Look for exercise names (more patterns)
      let exerciseName: string | null = null;
      
      // Pattern 1: Title Case multi-word (e.g., "Barbell Squat")
      let match = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (match) {
        exerciseName = match[1].trim();
      }
      
      // Pattern 2: All caps multi-word (e.g., "BENCH PRESS")
      if (!exerciseName) {
        match = line.match(/([A-Z]{2,}(?:\s+[A-Z]{2,})+)/);
        if (match) {
          exerciseName = match[1].trim();
        }
      }
      
      // Pattern 3: Mixed case (e.g., "Cable Row" or "DB Curl")
      if (!exerciseName) {
        match = line.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)+)(?:\s|$)/);
        if (match && !/^\d/.test(match[1]) && this.looksLikeExercise(match[1])) {
          exerciseName = match[1].trim();
        }
      }
      
      if (!exerciseName) continue;
      
      exerciseName = this.normalizeExerciseName(exerciseName);

      if (exerciseName.length <= 3 || seenExercises.has(exerciseName)) continue;

      // Look ahead for workout data
      let exerciseData: WorkoutExercise | null = null;
      for (let lookahead = 0; lookahead < 2 && i + lookahead < lines.length; lookahead++) {
        const nextLine = lines[i + lookahead].trim();

        if (nextLine.length < 5 || !/\d/.test(nextLine)) continue;

        // Pattern 1: Sets + Reps + Weight
        let match = nextLine.match(/(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°:]+\s*(\d+)\s*[Rr]eps?\s*[+»×xX*\-«>°:]+\s*(\d+(?:\.\d+)?)\s*k/);
        if (match) {
          exerciseData = {
            exercise: exerciseName,
            sets: parseInt(match[1]),
            reps: parseInt(match[2]),
            weight_kg: parseFloat(match[3])
          };
        }

        // Pattern 2: Sets + Time only
        if (!exerciseData) {
          match = nextLine.match(/(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°]+\s*(\d+):(\d+)/);
          if (match) {
            exerciseData = {
              exercise: exerciseName,
              sets: parseInt(match[1]),
              duration: `${match[2]}:${match[3].padStart(2, '0')}`
            };
          }
        }

        // Pattern 3: Sets + Reps only
        if (!exerciseData) {
          match = nextLine.match(/(\d+)\s*[Ss]ets?\s*[+»×xX*\-«>°]+\s*(\d+)\s*[Rr]eps?/);
          if (match) {
            exerciseData = {
              exercise: exerciseName,
              sets: parseInt(match[1]),
              reps: parseInt(match[2])
            };
          }
        }

        if (exerciseData) {
          seenExercises.add(exerciseName);
          exercises.push(exerciseData);
          break;
        }
      }
    }

    return exercises;
  }

  /**
   * Smart parser that tries multiple formats
   */
  parseWorkoutText(text: string): { exercises: WorkoutExercise[]; format: string } {
    console.log('[WorkoutScanner] Parsing workout text...');
    
    // Try FitBod format first
    const fitbodExercises = this.parseFitBodFormat(text);
    console.log(`[WorkoutScanner] FitBod format found ${fitbodExercises.length} exercises:`, fitbodExercises);

    // Check if FitBod found good results
    if (fitbodExercises.length >= 3) {
      const hasFitbodFields = fitbodExercises.some(
        ex => ex.weight_kg !== undefined || ex.duration !== undefined
      );
      if (hasFitbodFields) {
        return { exercises: fitbodExercises, format: 'fitbod' };
      }
    }

    // Try generic format
    const genericExercises = this.parseGenericWorkoutFormat(text);
    console.log(`[WorkoutScanner] Generic format found ${genericExercises.length} exercises:`, genericExercises);

    // Return whichever found more
    if (genericExercises.length > fitbodExercises.length) {
      console.log('[WorkoutScanner] Using GENERIC format');
      return { exercises: genericExercises, format: 'generic' };
    } else if (fitbodExercises.length > 0) {
      console.log('[WorkoutScanner] Using FITBOD format');
      return { exercises: fitbodExercises, format: 'fitbod' };
    } else {
      console.log('[WorkoutScanner] No exercises found!');
      return { exercises: genericExercises, format: 'unknown' };
    }
  }

  /**
   * Process an image file
   */
  async processImage(
    file: File,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<ScanResult> {
    onProgress?.({
      status: 'processing',
      progress: 0,
      message: 'Loading image...'
    });

    // Extract text
    const text = await this.extractText(file, onProgress);

    onProgress?.({
      status: 'processing',
      progress: 100,
      message: 'Parsing workout data...'
    });

    // Parse workout
    const { exercises, format } = this.parseWorkoutText(text);

    // Match exercises to database
    const matchedExercises = await this.matchExercises(exercises);

    return {
      source: file.name,
      source_type: 'image',
      detected_format: format as any,
      total_exercises: matchedExercises.length,
      timestamp: new Date().toISOString(),
      exercises: matchedExercises,
      raw_text: text
    };
  }

  /**
   * Process a video file by sampling frames
   */
  async processVideo(
    file: File,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration;
          const fps = 30; // Assume 30fps
          const sampleInterval = 0.5; // Sample every 0.5 seconds
          const totalSamples = Math.floor(duration / sampleInterval);
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          const allText: string[] = [];
          let processedFrames = 0;

          for (let i = 0; i < totalSamples; i++) {
            const time = i * sampleInterval;
            
            // Seek to time
            video.currentTime = time;
            await new Promise(resolve => {
              video.onseeked = resolve;
            });

            // Draw frame to canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            onProgress?.({
              status: 'processing',
              progress: Math.round((i / totalSamples) * 100),
              message: `Processing frame ${i + 1}/${totalSamples}...`
            });

            // Extract text from frame
            const text = await this.extractText(canvas);

            if (text.trim()) {
              allText.push(text);
            }
            processedFrames++;
          }

          // Combine all text
          const combinedText = allText.join('\n');

          onProgress?.({
            status: 'processing',
            progress: 100,
            message: 'Parsing workout data...'
          });

          // Parse workout
          const { exercises, format } = this.parseWorkoutText(combinedText);

          // Match exercises to database
          const matchedExercises = await this.matchExercises(exercises);

          resolve({
            source: file.name,
            source_type: 'video',
            detected_format: format as any,
            total_exercises: matchedExercises.length,
            timestamp: new Date().toISOString(),
            exercises: matchedExercises,
            raw_text: combinedText
          });
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Helper: Normalize exercise name
   */
  private normalizeExerciseName(name: string): string {
    // Convert to title case
    return name
      .split(/[\s\-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Helper: Check if text looks like an exercise
   */
  private looksLikeExercise(name: string): boolean {
    if (!name || name.length < 3) return false;
    
    const keywords = [
      // Equipment
      'barbell', 'dumbbell', 'cable', 'machine', 'kettlebell', 'band',
      // Exercise types
      'squat', 'press', 'raise', 'curl', 'row', 'lunge', 'deadlift', 
      'fly', 'pull', 'push', 'step', 'crunch', 'plank', 'extension',
      'kickback', 'shrug', 'twist', 'bend', 'lift', 'dip',
      // Body parts
      'leg', 'chest', 'shoulder', 'back', 'bicep', 'tricep', 'arm',
      'glute', 'hamstring', 'quad', 'calf', 'ab', 'core', 'hip',
      // Common words
      'bench', 'incline', 'decline', 'lateral', 'front', 'side',
      'overhead', 'seated', 'standing', 'lying', 'prone', 'supine'
    ];
    
    const lowerName = name.toLowerCase();
    
    // Check if contains exercise keywords
    const hasKeyword = keywords.some(k => lowerName.includes(k));
    
    // Or if it has 2+ words and looks exercise-like (not common words)
    const commonWords = ['set', 'rep', 'rest', 'warm', 'cool', 'down', 'up', 'the', 'and', 'or'];
    const isMultiWord = name.split(/\s+/).length >= 2;
    const notCommonPhrase = !commonWords.some(w => lowerName === w);
    
    return (hasKeyword || isMultiWord) && notCommonPhrase;
  }

  /**
   * Match scanned exercises to database exercises
   */
  private async matchExercises(scannedExercises: WorkoutExercise[]): Promise<any[]> {
    const allExercises = await getExercises();
    const matched: any[] = [];

    console.log('[WorkoutScanner] Matching exercises to database...');
    console.log('[WorkoutScanner] Available exercises:', allExercises.length);

    for (const scanned of scannedExercises) {
      const scannedName = scanned.exercise.toLowerCase().trim();
      
      // Try exact match first
      let match = allExercises.find(ex => 
        ex.name.toLowerCase() === scannedName
      );

      // Try fuzzy match (contains)
      if (!match) {
        match = allExercises.find(ex => {
          const dbName = ex.name.toLowerCase();
          return dbName.includes(scannedName) || scannedName.includes(dbName);
        });
      }

      // Try word-by-word match
      if (!match) {
        const scannedWords = scannedName.split(/\s+/);
        match = allExercises.find(ex => {
          const dbWords = ex.name.toLowerCase().split(/\s+/);
          // Match if at least 2 words overlap
          const overlap = scannedWords.filter(w => dbWords.includes(w));
          return overlap.length >= Math.min(2, scannedWords.length);
        });
      }

      if (match) {
        console.log(`[WorkoutScanner] ✓ Matched "${scanned.exercise}" → "${match.name}" (${match.id})`);
        matched.push({
          id: match.id,
          name: scanned.exercise, // Keep original scanned name (e.g., "Back Squat", "Kneeling Squat")
          sets: scanned.sets,
          reps_per_set: typeof scanned.reps === 'number' ? scanned.reps : 0,
          weight: scanned.weight_kg,
          duration: scanned.duration,
          trackable: true,
          completed: false,
          mapped_exercise: match.id // Store the actual exercise ID for tracking
        });
      } else {
        console.log(`[WorkoutScanner] ✗ No match for "${scanned.exercise}"`);
        // Add as non-trackable
        matched.push({
          id: '',
          name: scanned.exercise,
          sets: scanned.sets,
          reps_per_set: typeof scanned.reps === 'number' ? scanned.reps : 0,
          weight: scanned.weight_kg,
          duration: scanned.duration,
          trackable: false,
          completed: false
        });
      }
    }

    return matched;
  }
}

// Singleton instance
let scannerInstance: WorkoutScanner | null = null;

/**
 * Get or create scanner instance
 */
export function getWorkoutScanner(): WorkoutScanner {
  if (!scannerInstance) {
    scannerInstance = new WorkoutScanner();
  }
  return scannerInstance;
}
