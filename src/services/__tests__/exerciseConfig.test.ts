import { describe, it, expect, beforeEach } from 'vitest';
import { getExercises, getExercise, evaluateConditions, assessRepQuality, isAtRepPosition, isAtStartingPosition, ExerciseCondition, ExerciseDefinition } from '../exerciseConfig';

describe('exerciseConfig', () => {
  describe('evaluateConditions', () => {
    it('should evaluate less than operator', () => {
      const metrics = { knee_angle: 85 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should evaluate greater than operator', () => {
      const metrics = { knee_angle: 95 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '>', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should evaluate less than or equal operator', () => {
      const metrics = { knee_angle: 90 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<=', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should evaluate greater than or equal operator', () => {
      const metrics = { knee_angle: 90 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '>=', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should evaluate equals operator', () => {
      const metrics = { knee_angle: 90 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '==', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should evaluate absolute greater than operator', () => {
      const metrics = { angle: -15 };
      const conditions: ExerciseCondition[] = [
        { metric: 'angle', operator: 'abs_>', value: 10 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should evaluate absolute less than operator', () => {
      const metrics = { angle: -5 };
      const conditions: ExerciseCondition[] = [
        { metric: 'angle', operator: 'abs_<', value: 10 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should return false when condition not met', () => {
      const metrics = { knee_angle: 95 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(false);
    });

    it('should return false when metric missing', () => {
      const metrics = { hip_angle: 85 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(false);
    });

    it('should evaluate multiple conditions (AND logic)', () => {
      const metrics = { knee_angle: 85, hip_angle: 80 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<', value: 90 },
        { metric: 'hip_angle', operator: '<', value: 85 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should fail if any condition fails (AND logic)', () => {
      const metrics = { knee_angle: 85, hip_angle: 90 };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<', value: 90 },
        { metric: 'hip_angle', operator: '<', value: 85 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(false);
    });
  });

  describe('assessRepQuality', () => {
    const minimalConfig: ExerciseDefinition = {
      id: 'squat',
      name: 'Squat',
      description: 'Test',
      category: 'Lower Body',
      cooldown_frames: 10,
      joints: { required: ['hip', 'knee', 'ankle'], bilateral: true },
      metrics: {},
      positions: {
        rep_position: { conditions: [] },
        starting_position: { conditions: [] }
      },
      quality_levels: {
        excellent: {
          conditions: [{ metric: 'knee_angle', operator: '<', value: 85 }],
          message: 'Excellent depth!'
        },
        good: {
          conditions: [{ metric: 'knee_angle', operator: '<', value: 95 }],
          message: 'Good form!'
        },
        default: {
          message: 'Keep going!'
        }
      },
      instructions: {
        in_position: 'Lower down',
        return: 'Stand up',
        ready: 'Ready'
      }
    };

    it('should return excellent quality when conditions met', () => {
      const metrics = { knee_angle: 80 };
      const result = assessRepQuality(minimalConfig, metrics);
      expect(result).toBe('Excellent depth!');
    });

    it('should return good quality when excellent not met', () => {
      const metrics = { knee_angle: 90 };
      const result = assessRepQuality(minimalConfig, metrics);
      expect(result).toBe('Good form!');
    });

    it('should return default quality when no conditions met', () => {
      const metrics = { knee_angle: 100 };
      const result = assessRepQuality(minimalConfig, metrics);
      expect(result).toBe('Keep going!');
    });

    it('should handle missing quality levels gracefully', () => {
      const configNoExcellent = {
        ...minimalConfig,
        quality_levels: {
          good: {
            conditions: [{ metric: 'knee_angle', operator: '<' as const, value: 95 }],
            message: 'Good!'
          },
          default: { message: 'Default' }
        }
      };

      const metrics = { knee_angle: 90 };
      const result = assessRepQuality(configNoExcellent, metrics);
      expect(result).toBe('Good!');
    });
  });

  describe('isAtRepPosition', () => {
    const mockConfig: ExerciseDefinition = {
      id: 'squat',
      name: 'Squat',
      description: 'Test',
      category: 'Lower Body',
      cooldown_frames: 10,
      joints: { required: ['hip', 'knee', 'ankle'], bilateral: true },
      metrics: {},
      positions: {
        rep_position: {
          conditions: [
            { metric: 'knee_angle', operator: '<', value: 100 },
            { metric: 'hip_height', operator: '<', value: 0.5 }
          ]
        },
        starting_position: { conditions: [] }
      },
      quality_levels: { default: { message: 'Good' } },
      instructions: { in_position: '', return: '', ready: '' }
    };

    it('should return true when at rep position', () => {
      const metrics = { knee_angle: 90, hip_height: 0.4 };
      const result = isAtRepPosition(mockConfig, metrics);
      expect(result).toBe(true);
    });

    it('should return false when not at rep position', () => {
      const metrics = { knee_angle: 110, hip_height: 0.6 };
      const result = isAtRepPosition(mockConfig, metrics);
      expect(result).toBe(false);
    });
  });

  describe('isAtStartingPosition', () => {
    const mockConfig: ExerciseDefinition = {
      id: 'squat',
      name: 'Squat',
      description: 'Test',
      category: 'Lower Body',
      cooldown_frames: 10,
      joints: { required: ['hip', 'knee', 'ankle'], bilateral: true },
      metrics: {},
      positions: {
        rep_position: { conditions: [] },
        starting_position: {
          conditions: [
            { metric: 'knee_angle', operator: '>', value: 160 }
          ]
        }
      },
      quality_levels: { default: { message: 'Good' } },
      instructions: { in_position: '', return: '', ready: '' }
    };

    it('should return true when at starting position', () => {
      const metrics = { knee_angle: 170 };
      const result = isAtStartingPosition(mockConfig, metrics);
      expect(result).toBe(true);
    });

    it('should return false when not at starting position', () => {
      const metrics = { knee_angle: 150 };
      const result = isAtStartingPosition(mockConfig, metrics);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty conditions array', () => {
      const metrics = { knee_angle: 90 };
      const conditions: ExerciseCondition[] = [];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true); // Empty conditions should pass
    });

    it('should handle null/undefined metrics', () => {
      const metrics = { knee_angle: null };
      const conditions: ExerciseCondition[] = [
        { metric: 'knee_angle', operator: '<', value: 90 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(false);
    });

    it('should handle zero values correctly', () => {
      const metrics = { distance: 0 };
      const conditions: ExerciseCondition[] = [
        { metric: 'distance', operator: '==', value: 0 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });

    it('should handle negative values', () => {
      const metrics = { angle: -10 };
      const conditions: ExerciseCondition[] = [
        { metric: 'angle', operator: '<', value: 0 }
      ];

      const result = evaluateConditions(metrics, conditions);
      expect(result).toBe(true);
    });
  });
});
