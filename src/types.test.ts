import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, TIMER_CONFIG } from './types';

describe('Types', () => {
  describe('ACHIEVEMENTS', () => {
    it('should have 5 achievement levels', () => {
      expect(ACHIEVEMENTS).toHaveLength(5);
    });

    it('should have correct achievement progression', () => {
      const thresholds = ACHIEVEMENTS.map(a => a.threshold);
      expect(thresholds).toEqual([1, 10, 100, 1000, 10000]);
    });

    it('should have unique IDs for each achievement', () => {
      const ids = ACHIEVEMENTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have required properties for each achievement', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('title');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('threshold');
      });
    });

    it('should have ascending threshold values', () => {
      for (let i = 1; i < ACHIEVEMENTS.length; i++) {
        expect(ACHIEVEMENTS[i].threshold).toBeGreaterThan(
          ACHIEVEMENTS[i - 1].threshold
        );
      }
    });
  });

  describe('TIMER_CONFIG', () => {
    it('should have work mode set to 25 minutes', () => {
      expect(TIMER_CONFIG.work).toBe(25 * 60);
    });

    it('should have short break set to 5 minutes', () => {
      expect(TIMER_CONFIG.short_break).toBe(5 * 60);
    });

    it('should have long break set to 15 minutes', () => {
      expect(TIMER_CONFIG.long_break).toBe(15 * 60);
    });

    it('should have all three timer modes', () => {
      expect(Object.keys(TIMER_CONFIG)).toEqual([
        'work',
        'short_break',
        'long_break',
      ]);
    });

    it('should have work duration longer than breaks', () => {
      expect(TIMER_CONFIG.work).toBeGreaterThan(TIMER_CONFIG.short_break);
      expect(TIMER_CONFIG.work).toBeGreaterThan(TIMER_CONFIG.long_break);
    });

    it('should have long break longer than short break', () => {
      expect(TIMER_CONFIG.long_break).toBeGreaterThan(TIMER_CONFIG.short_break);
    });
  });
});
