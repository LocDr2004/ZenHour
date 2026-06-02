import { describe, it, expect } from 'vitest';
import { cn, formatDuration } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', null, undefined, 'bar')).toBe('foo bar');
      expect(cn('foo', false && 'bar', true && 'baz')).toBe('foo baz');
    });

    it('should handle tailwind class merging', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn(null, undefined, false)).toBe('');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('0m 30s');
      expect(formatDuration(59)).toBe('0m 59s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(150)).toBe('2m 30s');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7265)).toBe('2h 1m');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0m 0s');
    });

    it('should handle large durations', () => {
      expect(formatDuration(36000)).toBe('10h 0m');
      expect(formatDuration(86400)).toBe('24h 0m');
    });
  });
});
