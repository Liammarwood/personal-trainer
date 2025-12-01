/**
 * Exercise Configuration Loader
 * Loads exercise definitions from static JSON file (no API needed)
 */

export interface ExerciseCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | 'abs_>' | 'abs_<';
  value: number;
}

export interface ExercisePosition {
  conditions: ExerciseCondition[];
}

export interface ExerciseQualityLevel {
  conditions?: ExerciseCondition[];
  message: string;
}

export interface ExerciseMetric {
  calculation: string;
  points: string[];
}

export interface ExerciseConfig {
  name: string;
  description: string;
  category: string;
  cooldown_frames: number;
  joints: {
    required: string[];
    bilateral: boolean;
  };
  metrics: {
    [key: string]: ExerciseMetric;
  };
  positions: {
    rep_position: ExercisePosition;
    starting_position: ExercisePosition;
  };
  quality_levels: {
    excellent?: ExerciseQualityLevel;
    good?: ExerciseQualityLevel;
    default: ExerciseQualityLevel;
  };
  instructions: {
    in_position: string;
    return: string;
    ready: string;
  };
}

export interface ExerciseDefinition extends ExerciseConfig {
  id: string;
}

let exercisesCache: { [key: string]: ExerciseConfig } | null = null;

/**
 * Load exercises from static JSON file
 */
async function loadExercises(): Promise<{ [key: string]: ExerciseConfig }> {
  if (exercisesCache !== null) {
    return exercisesCache;
  }

  try {
    const response = await fetch('/exercises.json');
    if (!response.ok) {
      throw new Error(`Failed to load exercises: ${response.statusText}`);
    }
    const data = await response.json();
    exercisesCache = data.exercises;
    if (!exercisesCache) {
      throw new Error('Invalid exercises data structure');
    }
    return exercisesCache;
  } catch (error) {
    console.error('Error loading exercises:', error);
    throw error;
  }
}

/**
 * Get all available exercises
 */
export async function getExercises(): Promise<ExerciseDefinition[]> {
  const exercises = await loadExercises();
  return Object.entries(exercises).map(([id, config]) => ({
    id,
    ...config
  }));
}

/**
 * Get a specific exercise by ID
 */
export async function getExercise(exerciseId: string): Promise<ExerciseDefinition> {
  const exercises = await loadExercises();
  const config = exercises[exerciseId];
  
  if (!config) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }
  
  return {
    id: exerciseId,
    ...config
  };
}

/**
 * Get exercises grouped by category
 */
export async function getExercisesByCategory(): Promise<{ [category: string]: ExerciseDefinition[] }> {
  const allExercises = await getExercises();
  const byCategory: { [category: string]: ExerciseDefinition[] } = {};
  
  for (const exercise of allExercises) {
    if (!byCategory[exercise.category]) {
      byCategory[exercise.category] = [];
    }
    byCategory[exercise.category].push(exercise);
  }
  
  return byCategory;
}

/**
 * Evaluate conditions against metrics
 */
export function evaluateConditions(metrics: any, conditions: ExerciseCondition[]): boolean {
  for (const condition of conditions) {
    const value = metrics[condition.metric];
    if (value === undefined || value === null) {
      return false;
    }

    switch (condition.operator) {
      case '<':
        if (!(value < condition.value)) return false;
        break;
      case '<=':
        if (!(value <= condition.value)) return false;
        break;
      case '>':
        if (!(value > condition.value)) return false;
        break;
      case '>=':
        if (!(value >= condition.value)) return false;
        break;
      case '==':
        if (!(value === condition.value)) return false;
        break;
      case 'abs_>':
        if (!(Math.abs(value) > condition.value)) return false;
        break;
      case 'abs_<':
        if (!(Math.abs(value) < condition.value)) return false;
        break;
      default:
        console.warn(`Unknown operator: ${condition.operator}`);
        return false;
    }
  }
  return true;
}

/**
 * Assess rep quality based on metrics
 */
export function assessRepQuality(config: ExerciseConfig, metrics: any): string {
  // Check excellent first
  if (config.quality_levels.excellent && config.quality_levels.excellent.conditions) {
    if (evaluateConditions(metrics, config.quality_levels.excellent.conditions)) {
      return config.quality_levels.excellent.message;
    }
  }

  // Then good
  if (config.quality_levels.good && config.quality_levels.good.conditions) {
    if (evaluateConditions(metrics, config.quality_levels.good.conditions)) {
      return config.quality_levels.good.message;
    }
  }

  // Default
  return config.quality_levels.default.message;
}

/**
 * Check if at rep position
 */
export function isAtRepPosition(config: ExerciseConfig, metrics: any): boolean {
  return evaluateConditions(metrics, config.positions.rep_position.conditions);
}

/**
 * Check if at starting position
 */
export function isAtStartingPosition(config: ExerciseConfig, metrics: any): boolean {
  return evaluateConditions(metrics, config.positions.starting_position.conditions);
}
