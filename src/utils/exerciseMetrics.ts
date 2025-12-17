/**
 * Exercise Metrics Utilities for angle and distance calculations
 */

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/**
 * Calculate angle at point B formed by points A-B-C
 * @param pointA First point
 * @param pointB Vertex point
 * @param pointC Third point
 * @returns Angle in degrees
 */
export function calculateAngle(
  pointA: Point3D,
  pointB: Point3D,
  pointC: Point3D
): number {
  // Vector from B to A
  const ba = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
    z: pointA.z - pointB.z,
  };

  // Vector from B to C
  const bc = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y,
    z: pointC.z - pointB.z,
  };

  // Calculate dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;

  // Calculate magnitudes
  const magnitudeBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  // Calculate cosine of angle
  const cosineAngle = dotProduct / (magnitudeBA * magnitudeBC);

  // Clamp to valid range for arccos
  const clampedCosine = Math.max(-1.0, Math.min(1.0, cosineAngle));

  // Calculate angle in radians then convert to degrees
  const angleRadians = Math.acos(clampedCosine);
  return (angleRadians * 180) / Math.PI;
}

/**
 * Calculate 2D Euclidean distance (x, y only)
 */
export function calculateDistance2D(pointA: Point3D, pointB: Point3D): number {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate 3D Euclidean distance
 */
export function calculateDistance3D(pointA: Point3D, pointB: Point3D): number {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  const dz = pointA.z - pointB.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate vertical distance (y-axis)
 * Positive value means pointA is below pointB
 */
export function calculateVerticalDistance(pointA: Point3D, pointB: Point3D): number {
  return pointA.y - pointB.y;
}

/**
 * Calculate horizontal distance (x-axis)
 */
export function calculateHorizontalDistance(pointA: Point3D, pointB: Point3D): number {
  return Math.abs(pointA.x - pointB.x);
}

/**
 * Get midpoint between two points
 */
export function getMidpoint(pointA: Point3D, pointB: Point3D): Point3D {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
    z: (pointA.z + pointB.z) / 2,
  };
}

/**
 * Calculate bilateral average (for left/right measurements)
 */
export function calculateBilateralAverage(
  leftValue: number | null,
  rightValue: number | null
): number | null {
  if (leftValue === null && rightValue === null) return null;
  if (leftValue === null) return rightValue;
  if (rightValue === null) return leftValue;
  return (leftValue + rightValue) / 2;
}

/**
 * Calculate bilateral angle (average of left and right sides)
 */
export function calculateBilateralAngle(
  leftPoints: [Point3D, Point3D, Point3D] | null,
  rightPoints: [Point3D, Point3D, Point3D] | null
): number | null {
  const leftAngle = leftPoints ? calculateAngle(...leftPoints) : null;
  const rightAngle = rightPoints ? calculateAngle(...rightPoints) : null;
  return calculateBilateralAverage(leftAngle, rightAngle);
}

/**
 * Check if joint is extended (nearly straight)
 */
export function isJointExtended(angle: number, threshold: number = 160): boolean {
  return angle > threshold;
}

/**
 * Check if joint is flexed (bent)
 */
export function isJointFlexed(angle: number, threshold: number = 120): boolean {
  return angle < threshold;
}

/**
 * Check if point A is above point B
 */
export function isPointAbove(pointA: Point3D, pointB: Point3D, threshold: number = 0): boolean {
  return pointA.y < pointB.y - threshold;
}

/**
 * Check if point A is below point B
 */
export function isPointBelow(pointA: Point3D, pointB: Point3D, threshold: number = 0): boolean {
  return pointA.y > pointB.y + threshold;
}

/**
 * Check if two points are vertically aligned
 */
export function isAlignedVertically(pointA: Point3D, pointB: Point3D, tolerance: number = 0.05): boolean {
  return Math.abs(pointA.x - pointB.x) < tolerance;
}

/**
 * Check if two points are horizontally aligned
 */
export function isAlignedHorizontally(pointA: Point3D, pointB: Point3D, tolerance: number = 0.05): boolean {
  return Math.abs(pointA.y - pointB.y) < tolerance;
}

/**
 * Map value from one range to another
 */
export function mapValue(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  return toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Moving average filter for smoothing measurements
 */
export class MovingAverage {
  private values: number[] = [];
  private windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  add(value: number): number {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
    return this.getAverage() || 0;
  }

  reset(): void {
    this.values = [];
  }

  getAverage(): number | null {
    if (this.values.length === 0) return null;
    const sum = this.values.reduce((acc, val) => acc + val, 0);
    return sum / this.values.length;
  }
}
