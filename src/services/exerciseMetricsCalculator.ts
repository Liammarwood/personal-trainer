/**
 * Exercise Metrics Calculator
 * Calculates exercise-specific metrics from pose landmarks
 */

import {
  calculateAngle,
  calculateBilateralAngle,
  calculateDistance2D,
  calculateVerticalDistance,
  calculateHorizontalDistance,
  Point3D,
  PoseLandmark,
} from '../utils/exerciseMetrics';
import { POSE_LANDMARKS } from '@mediapipe/pose';

export interface ExerciseMetrics {
  [metricName: string]: number;
}

export interface ExerciseCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | 'abs_>' | 'abs_<';
  value: number;
}

export interface ExerciseConfig {
  id: string;
  name: string;
  category: string;
  joints: {
    required: string[];
    bilateral: boolean;
  };
  metrics: {
    [metricName: string]: {
      calculation: string;
      points?: string[];
      point?: string;
      side?: 'left' | 'right';
      absolute?: boolean;
    };
  };
  positions: {
    starting_position: {
      conditions: ExerciseCondition[];
    };
    rep_position: {
      conditions: ExerciseCondition[];
    };
  };
  quality_levels?: {
    excellent?: { conditions?: ExerciseCondition[]; message: string };
    good?: { conditions?: ExerciseCondition[]; message: string };
    default: { conditions?: ExerciseCondition[]; message: string };
  };
  instructions?: {
    in_position: string;
    return: string;
    ready: string;
  };
}

/**
 * Exercise Metrics Calculator
 */
export class ExerciseMetricsCalculator {
  private config: ExerciseConfig;
  private joints: { [key: string]: Point3D } = {};

  constructor(config: ExerciseConfig) {
    this.config = config;
  }

  /**
   * Get required joints from landmarks
   */
  private extractJoints(landmarks: PoseLandmark[]): void {
    this.joints = {};
    const requiredJoints = this.config.joints.required;
    const isBilateral = this.config.joints.bilateral;

    for (const jointName of requiredJoints) {
      if (isBilateral) {
        // Get both left and right
        const leftIndex = POSE_LANDMARKS[`LEFT_${jointName.toUpperCase()}` as keyof typeof POSE_LANDMARKS];
        const rightIndex = POSE_LANDMARKS[`RIGHT_${jointName.toUpperCase()}` as keyof typeof POSE_LANDMARKS];

        if (leftIndex !== undefined && landmarks[leftIndex]) {
          this.joints[`left_${jointName.toLowerCase()}`] = landmarks[leftIndex];
        }
        if (rightIndex !== undefined && landmarks[rightIndex]) {
          this.joints[`right_${jointName.toLowerCase()}`] = landmarks[rightIndex];
        }
      } else {
        // Unilateral - joint name already has LEFT_ or RIGHT_
        const index = POSE_LANDMARKS[jointName.toUpperCase() as keyof typeof POSE_LANDMARKS];
        if (index !== undefined && landmarks[index]) {
          this.joints[jointName.toLowerCase()] = landmarks[index];
        }
      }
    }
  }

  /**
   * Calculate all metrics for current pose
   */
  calculateMetrics(landmarks: PoseLandmark[]): ExerciseMetrics {
    this.extractJoints(landmarks);
    const metrics: ExerciseMetrics = {};

    for (const [metricName, metricConfig] of Object.entries(this.config.metrics)) {
      const calculation = metricConfig.calculation;

      switch (calculation) {
        case 'bilateral_angle':
          metrics[metricName] = this.calculateBilateralAngleMetric(metricConfig);
          break;

        case 'unilateral_angle':
          metrics[metricName] = this.calculateUnilateralAngleMetric(metricConfig);
          break;

        case 'vertical_distance_average':
          metrics[metricName] = this.calculateVerticalDistanceAverage(metricConfig);
          break;

        case 'single_joint_y':
          metrics[metricName] = this.calculateSingleJointY(metricConfig);
          break;

        case 'distance_2d_average':
          metrics[metricName] = this.calculateDistance2DAverage(metricConfig);
          break;

        case 'horizontal_distance_average':
          metrics[metricName] = this.calculateHorizontalDistanceAverage(metricConfig);
          break;

        default:
          console.warn(`Unknown calculation type: ${calculation}`);
          metrics[metricName] = 0;
      }
    }

    return metrics;
  }

  /**
   * Calculate bilateral angle (average of left and right)
   */
  private calculateBilateralAngleMetric(config: any): number {
    const points = config.points as string[];
    if (!points || points.length !== 3) return 0;

    const [p1, p2, p3] = points;

    // Get left side points
    const leftP1 = this.joints[`left_${p1.toLowerCase()}`];
    const leftP2 = this.joints[`left_${p2.toLowerCase()}`];
    const leftP3 = this.joints[`left_${p3.toLowerCase()}`];

    // Get right side points
    const rightP1 = this.joints[`right_${p1.toLowerCase()}`];
    const rightP2 = this.joints[`right_${p2.toLowerCase()}`];
    const rightP3 = this.joints[`right_${p3.toLowerCase()}`];

    const leftPoints = leftP1 && leftP2 && leftP3 ? ([leftP1, leftP2, leftP3] as [Point3D, Point3D, Point3D]) : null;
    const rightPoints = rightP1 && rightP2 && rightP3 ? ([rightP1, rightP2, rightP3] as [Point3D, Point3D, Point3D]) : null;

    return calculateBilateralAngle(leftPoints, rightPoints) || 0;
  }

  /**
   * Calculate unilateral angle (single side)
   */
  private calculateUnilateralAngleMetric(config: any): number {
    const points = config.points as string[];
    const side = config.side || 'left';

    if (!points || points.length !== 3) return 0;

    const [p1, p2, p3] = points.map(p => this.joints[`${side}_${p.toLowerCase()}`]);

    if (!p1 || !p2 || !p3) return 0;

    return calculateAngle(p1, p2, p3);
  }

  /**
   * Calculate vertical distance average (both sides)
   */
  private calculateVerticalDistanceAverage(config: any): number {
    const points = config.points as string[];
    if (!points || points.length !== 2) return 0;

    const [p1Name, p2Name] = points;
    const distances: number[] = [];

    // Left side
    const leftP1 = this.joints[`left_${p1Name.toLowerCase()}`];
    const leftP2 = this.joints[`left_${p2Name.toLowerCase()}`];
    if (leftP1 && leftP2) {
      distances.push(calculateVerticalDistance(leftP1, leftP2));
    }

    // Right side
    const rightP1 = this.joints[`right_${p1Name.toLowerCase()}`];
    const rightP2 = this.joints[`right_${p2Name.toLowerCase()}`];
    if (rightP1 && rightP2) {
      distances.push(calculateVerticalDistance(rightP1, rightP2));
    }

    if (distances.length === 0) return 0;

    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    return config.absolute ? Math.abs(avgDistance) : avgDistance;
  }

  /**
   * Get Y coordinate of a single joint
   */
  private calculateSingleJointY(config: any): number {
    const pointName = config.point;
    const side = config.side || 'left';
    const joint = this.joints[`${side}_${pointName.toLowerCase()}`];
    return joint ? joint.y : 0;
  }

  /**
   * Calculate 2D distance average (both sides)
   */
  private calculateDistance2DAverage(config: any): number {
    const points = config.points as string[];
    if (!points || points.length !== 2) return 0;

    const [p1Name, p2Name] = points;
    const distances: number[] = [];

    // Left side
    const leftP1 = this.joints[`left_${p1Name.toLowerCase()}`];
    const leftP2 = this.joints[`left_${p2Name.toLowerCase()}`];
    if (leftP1 && leftP2) {
      distances.push(calculateDistance2D(leftP1, leftP2));
    }

    // Right side
    const rightP1 = this.joints[`right_${p1Name.toLowerCase()}`];
    const rightP2 = this.joints[`right_${p2Name.toLowerCase()}`];
    if (rightP1 && rightP2) {
      distances.push(calculateDistance2D(rightP1, rightP2));
    }

    if (distances.length === 0) return 0;
    return distances.reduce((sum, d) => sum + d, 0) / distances.length;
  }

  /**
   * Calculate horizontal distance average
   */
  private calculateHorizontalDistanceAverage(config: any): number {
    const leftWrist = this.joints['left_wrist'];
    const rightWrist = this.joints['right_wrist'];

    if (!leftWrist || !rightWrist) return 0;
    return calculateHorizontalDistance(leftWrist, rightWrist);
  }

  /**
   * Evaluate conditions against metrics
   */
  evaluateConditions(metrics: ExerciseMetrics, conditions: ExerciseCondition[]): boolean {
    for (const condition of conditions) {
      const metricValue = metrics[condition.metric];
      if (metricValue === undefined) return false;

      const threshold = condition.value;

      switch (condition.operator) {
        case '>':
          if (!(metricValue > threshold)) return false;
          break;
        case '<':
          if (!(metricValue < threshold)) return false;
          break;
        case '>=':
          if (!(metricValue >= threshold)) return false;
          break;
        case '<=':
          if (!(metricValue <= threshold)) return false;
          break;
        case '==':
          if (!(metricValue === threshold)) return false;
          break;
        case 'abs_>':
          if (!(Math.abs(metricValue) > threshold)) return false;
          break;
        case 'abs_<':
          if (!(Math.abs(metricValue) < threshold)) return false;
          break;
        default:
          console.warn(`Unknown operator: ${condition.operator}`);
          return false;
      }
    }

    return true;
  }

  /**
   * Check if at starting position
   */
  isAtStartingPosition(metrics: ExerciseMetrics): boolean {
    return this.evaluateConditions(
      metrics,
      this.config.positions.starting_position.conditions
    );
  }

  /**
   * Check if at rep position
   */
  isAtRepPosition(metrics: ExerciseMetrics): boolean {
    return this.evaluateConditions(
      metrics,
      this.config.positions.rep_position.conditions
    );
  }
}
