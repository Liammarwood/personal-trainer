import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateAngle,
  calculateDistance2D,
  calculateDistance3D,
  calculateVerticalDistance,
  calculateHorizontalDistance,
  getMidpoint,
  calculateBilateralAverage,
  calculateBilateralAngle,
  isJointExtended,
  isJointFlexed,
  isPointAbove,
  isPointBelow,
  isAlignedVertically,
  isAlignedHorizontally,
  mapValue,
  clamp,
  MovingAverage,
  type Point3D,
} from '../exerciseMetrics';

describe('exerciseMetrics', () => {
  describe('calculateAngle', () => {
    it('should calculate 90 degree angle', () => {
      const pointA: Point3D = { x: 1, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 0, z: 0 };
      const pointC: Point3D = { x: 0, y: 1, z: 0 };

      const angle = calculateAngle(pointA, pointB, pointC);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should calculate 180 degree angle (straight line)', () => {
      const pointA: Point3D = { x: -1, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 0, z: 0 };
      const pointC: Point3D = { x: 1, y: 0, z: 0 };

      const angle = calculateAngle(pointA, pointB, pointC);
      expect(angle).toBeCloseTo(180, 1);
    });

    it('should calculate 45 degree angle', () => {
      const pointA: Point3D = { x: 1, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 0, z: 0 };
      const pointC: Point3D = { x: 1, y: 1, z: 0 };

      const angle = calculateAngle(pointA, pointB, pointC);
      expect(angle).toBeCloseTo(45, 1);
    });

    it('should handle 3D angles', () => {
      const pointA: Point3D = { x: 1, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 0, z: 0 };
      const pointC: Point3D = { x: 0, y: 0, z: 1 };

      const angle = calculateAngle(pointA, pointB, pointC);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should calculate acute angle', () => {
      const pointA: Point3D = { x: 1, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 0, z: 0 };
      const pointC: Point3D = { x: 0.5, y: 0.866, z: 0 }; // ~60 degrees

      const angle = calculateAngle(pointA, pointB, pointC);
      expect(angle).toBeCloseTo(60, 1);
    });

    it('should calculate obtuse angle', () => {
      const pointA: Point3D = { x: 1, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 0, z: 0 };
      const pointC: Point3D = { x: -0.5, y: 0.866, z: 0 }; // ~120 degrees

      const angle = calculateAngle(pointA, pointB, pointC);
      expect(angle).toBeCloseTo(120, 1);
    });
  });

  describe('calculateDistance2D', () => {
    it('should calculate horizontal distance', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 3, y: 0, z: 0 };

      const distance = calculateDistance2D(pointA, pointB);
      expect(distance).toBe(3);
    });

    it('should calculate vertical distance', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 0, y: 4, z: 0 };

      const distance = calculateDistance2D(pointA, pointB);
      expect(distance).toBe(4);
    });

    it('should calculate diagonal distance (Pythagorean)', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 3, y: 4, z: 0 };

      const distance = calculateDistance2D(pointA, pointB);
      expect(distance).toBe(5);
    });

    it('should ignore z-axis', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 3, y: 4, z: 100 };

      const distance = calculateDistance2D(pointA, pointB);
      expect(distance).toBe(5);
    });
  });

  describe('calculateDistance3D', () => {
    it('should calculate 3D distance', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 1, y: 1, z: 1 };

      const distance = calculateDistance3D(pointA, pointB);
      expect(distance).toBeCloseTo(Math.sqrt(3), 5);
    });

    it('should calculate distance with z-axis', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 3, y: 4, z: 12 };

      const distance = calculateDistance3D(pointA, pointB);
      expect(distance).toBe(13);
    });
  });

  describe('calculateVerticalDistance', () => {
    it('should calculate positive vertical distance', () => {
      const pointA: Point3D = { x: 0, y: 5, z: 0 };
      const pointB: Point3D = { x: 0, y: 2, z: 0 };

      const distance = calculateVerticalDistance(pointA, pointB);
      expect(distance).toBe(3);
    });

    it('should calculate negative vertical distance', () => {
      const pointA: Point3D = { x: 0, y: 2, z: 0 };
      const pointB: Point3D = { x: 0, y: 5, z: 0 };

      const distance = calculateVerticalDistance(pointA, pointB);
      expect(distance).toBe(-3);
    });
  });

  describe('calculateHorizontalDistance', () => {
    it('should calculate horizontal distance', () => {
      const pointA: Point3D = { x: 5, y: 0, z: 0 };
      const pointB: Point3D = { x: 2, y: 0, z: 0 };

      const distance = calculateHorizontalDistance(pointA, pointB);
      expect(distance).toBe(3);
    });

    it('should return absolute value', () => {
      const pointA: Point3D = { x: 2, y: 0, z: 0 };
      const pointB: Point3D = { x: 5, y: 0, z: 0 };

      const distance = calculateHorizontalDistance(pointA, pointB);
      expect(distance).toBe(3);
    });
  });

  describe('getMidpoint', () => {
    it('should calculate midpoint', () => {
      const pointA: Point3D = { x: 0, y: 0, z: 0 };
      const pointB: Point3D = { x: 4, y: 6, z: 8 };

      const midpoint = getMidpoint(pointA, pointB);
      expect(midpoint).toEqual({ x: 2, y: 3, z: 4 });
    });

    it('should handle negative coordinates', () => {
      const pointA: Point3D = { x: -2, y: -4, z: -6 };
      const pointB: Point3D = { x: 2, y: 4, z: 6 };

      const midpoint = getMidpoint(pointA, pointB);
      expect(midpoint).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('calculateBilateralAverage', () => {
    it('should average two values', () => {
      const avg = calculateBilateralAverage(10, 20);
      expect(avg).toBe(15);
    });

    it('should return left value when right is null', () => {
      const avg = calculateBilateralAverage(10, null);
      expect(avg).toBe(10);
    });

    it('should return right value when left is null', () => {
      const avg = calculateBilateralAverage(null, 20);
      expect(avg).toBe(20);
    });

    it('should return null when both are null', () => {
      const avg = calculateBilateralAverage(null, null);
      expect(avg).toBeNull();
    });
  });

  describe('calculateBilateralAngle', () => {
    it('should average bilateral angles', () => {
      const leftPoints: [Point3D, Point3D, Point3D] = [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ];
      const rightPoints: [Point3D, Point3D, Point3D] = [
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ];

      const angle = calculateBilateralAngle(leftPoints, rightPoints);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should return left angle when right is null', () => {
      const leftPoints: [Point3D, Point3D, Point3D] = [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ];

      const angle = calculateBilateralAngle(leftPoints, null);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should return null when both are null', () => {
      const angle = calculateBilateralAngle(null, null);
      expect(angle).toBeNull();
    });
  });

  describe('isJointExtended', () => {
    it('should detect extended joint', () => {
      expect(isJointExtended(170)).toBe(true);
      expect(isJointExtended(180)).toBe(true);
      expect(isJointExtended(165)).toBe(true);
    });

    it('should detect non-extended joint', () => {
      expect(isJointExtended(150)).toBe(false);
      expect(isJointExtended(90)).toBe(false);
      expect(isJointExtended(45)).toBe(false);
    });

    it('should use custom threshold', () => {
      expect(isJointExtended(155, 150)).toBe(true);
      expect(isJointExtended(145, 150)).toBe(false);
    });
  });

  describe('isJointFlexed', () => {
    it('should detect flexed joint', () => {
      expect(isJointFlexed(90)).toBe(true);
      expect(isJointFlexed(45)).toBe(true);
      expect(isJointFlexed(110)).toBe(true);
    });

    it('should detect non-flexed joint', () => {
      expect(isJointFlexed(130)).toBe(false);
      expect(isJointFlexed(180)).toBe(false);
    });

    it('should use custom threshold', () => {
      expect(isJointFlexed(95, 100)).toBe(true);
      expect(isJointFlexed(105, 100)).toBe(false);
    });
  });

  describe('isPointAbove', () => {
    it('should detect point above', () => {
      const pointA: Point3D = { x: 0, y: 2, z: 0 };
      const pointB: Point3D = { x: 0, y: 5, z: 0 };

      expect(isPointAbove(pointA, pointB)).toBe(true);
    });

    it('should detect point not above', () => {
      const pointA: Point3D = { x: 0, y: 5, z: 0 };
      const pointB: Point3D = { x: 0, y: 2, z: 0 };

      expect(isPointAbove(pointA, pointB)).toBe(false);
    });

    it('should use threshold', () => {
      const pointA: Point3D = { x: 0, y: 4.5, z: 0 };
      const pointB: Point3D = { x: 0, y: 5, z: 0 };

      expect(isPointAbove(pointA, pointB, 0)).toBe(true);
      expect(isPointAbove(pointA, pointB, 1)).toBe(false);
    });
  });

  describe('isPointBelow', () => {
    it('should detect point below', () => {
      const pointA: Point3D = { x: 0, y: 5, z: 0 };
      const pointB: Point3D = { x: 0, y: 2, z: 0 };

      expect(isPointBelow(pointA, pointB)).toBe(true);
    });

    it('should detect point not below', () => {
      const pointA: Point3D = { x: 0, y: 2, z: 0 };
      const pointB: Point3D = { x: 0, y: 5, z: 0 };

      expect(isPointBelow(pointA, pointB)).toBe(false);
    });
  });

  describe('isAlignedVertically', () => {
    it('should detect vertical alignment', () => {
      const pointA: Point3D = { x: 5, y: 0, z: 0 };
      const pointB: Point3D = { x: 5, y: 10, z: 0 };

      expect(isAlignedVertically(pointA, pointB)).toBe(true);
    });

    it('should detect non-vertical alignment', () => {
      const pointA: Point3D = { x: 5, y: 0, z: 0 };
      const pointB: Point3D = { x: 10, y: 10, z: 0 };

      expect(isAlignedVertically(pointA, pointB)).toBe(false);
    });

    it('should use tolerance', () => {
      const pointA: Point3D = { x: 5, y: 0, z: 0 };
      const pointB: Point3D = { x: 5.03, y: 10, z: 0 };

      expect(isAlignedVertically(pointA, pointB, 0.05)).toBe(true);
      expect(isAlignedVertically(pointA, pointB, 0.01)).toBe(false);
    });
  });

  describe('isAlignedHorizontally', () => {
    it('should detect horizontal alignment', () => {
      const pointA: Point3D = { x: 0, y: 5, z: 0 };
      const pointB: Point3D = { x: 10, y: 5, z: 0 };

      expect(isAlignedHorizontally(pointA, pointB)).toBe(true);
    });

    it('should detect non-horizontal alignment', () => {
      const pointA: Point3D = { x: 0, y: 5, z: 0 };
      const pointB: Point3D = { x: 10, y: 10, z: 0 };

      expect(isAlignedHorizontally(pointA, pointB)).toBe(false);
    });

    it('should use tolerance', () => {
      const pointA: Point3D = { x: 0, y: 5, z: 0 };
      const pointB: Point3D = { x: 10, y: 5.03, z: 0 };

      expect(isAlignedHorizontally(pointA, pointB, 0.05)).toBe(true);
      expect(isAlignedHorizontally(pointA, pointB, 0.01)).toBe(false);
    });
  });

  describe('mapValue', () => {
    it('should map value from one range to another', () => {
      expect(mapValue(5, 0, 10, 0, 100)).toBe(50);
      expect(mapValue(0, 0, 10, 0, 100)).toBe(0);
      expect(mapValue(10, 0, 10, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(mapValue(0, -10, 10, 0, 100)).toBe(50);
      expect(mapValue(-5, -10, 10, 0, 100)).toBe(25);
    });

    it('should handle inverted output range', () => {
      expect(mapValue(5, 0, 10, 100, 0)).toBe(50);
      expect(mapValue(0, 0, 10, 100, 0)).toBe(100);
      expect(mapValue(10, 0, 10, 100, 0)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should clamp values below minimum', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });

    it('should clamp values above maximum', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });
  });

  describe('MovingAverage', () => {
    let movingAvg: MovingAverage;

    beforeEach(() => {
      movingAvg = new MovingAverage(3);
    });

    it('should calculate moving average', () => {
      expect(movingAvg.add(10)).toBe(10);
      expect(movingAvg.add(20)).toBe(15);
      expect(movingAvg.add(30)).toBe(20);
    });

    it('should maintain window size', () => {
      movingAvg.add(10);
      movingAvg.add(20);
      movingAvg.add(30);
      expect(movingAvg.add(40)).toBe(30); // (20 + 30 + 40) / 3
    });

    it('should handle custom window size', () => {
      const customAvg = new MovingAverage(5);
      customAvg.add(10);
      customAvg.add(20);
      customAvg.add(30);
      expect(customAvg.add(40)).toBe(25);
    });

    it('should reset values', () => {
      movingAvg.add(10);
      movingAvg.add(20);
      movingAvg.reset();
      expect(movingAvg.getAverage()).toBeNull();
    });

    it('should return null for empty average', () => {
      expect(movingAvg.getAverage()).toBeNull();
    });

    it('should handle single value', () => {
      movingAvg.add(42);
      expect(movingAvg.getAverage()).toBe(42);
    });
  });
});
