import { getStatusColor, getPriorityColor, getStatusBadgeVariant } from '../helpers';

describe('helpers utilities', () => {
  describe('getStatusColor', () => {
    it('should return success color for active status', () => {
      expect(getStatusColor('active')).toBe('hsl(var(--success))');
    });

    it('should return warning color for warning status', () => {
      expect(getStatusColor('warning')).toBe('hsl(var(--warning))');
    });

    it('should return destructive color for error status', () => {
      expect(getStatusColor('error')).toBe('hsl(var(--destructive))');
    });

    it('should return muted color for inactive status', () => {
      expect(getStatusColor('inactive')).toBe('hsl(var(--muted))');
    });

    it('should return border color for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('hsl(var(--border))');
    });

    it('should return border color for undefined status', () => {
      expect(getStatusColor(undefined)).toBe('hsl(var(--border))');
    });
  });

  describe('getPriorityColor', () => {
    it('should return destructive color for high priority', () => {
      expect(getPriorityColor('high')).toBe('text-destructive');
      expect(getPriorityColor('HIGH')).toBe('text-destructive');
      expect(getPriorityColor('High')).toBe('text-destructive');
    });

    it('should return warning color for medium priority', () => {
      expect(getPriorityColor('medium')).toBe('text-warning');
      expect(getPriorityColor('MEDIUM')).toBe('text-warning');
      expect(getPriorityColor('Medium')).toBe('text-warning');
    });

    it('should return success color for low priority', () => {
      expect(getPriorityColor('low')).toBe('text-success');
      expect(getPriorityColor('LOW')).toBe('text-success');
      expect(getPriorityColor('Low')).toBe('text-success');
    });

    it('should return muted-foreground color for unknown priority', () => {
      expect(getPriorityColor('unknown')).toBe('text-muted-foreground');
    });
  });

  describe('getStatusBadgeVariant', () => {
    it('should return destructive variant for open status', () => {
      expect(getStatusBadgeVariant('open')).toBe('destructive');
      expect(getStatusBadgeVariant('OPEN')).toBe('destructive');
      expect(getStatusBadgeVariant('Open')).toBe('destructive');
    });

    it('should return warning variant for in-progress status', () => {
      expect(getStatusBadgeVariant('in-progress')).toBe('warning');
      expect(getStatusBadgeVariant('IN-PROGRESS')).toBe('warning');
      expect(getStatusBadgeVariant('In-Progress')).toBe('warning');
    });

    it('should return success variant for closed status', () => {
      expect(getStatusBadgeVariant('closed')).toBe('success');
      expect(getStatusBadgeVariant('CLOSED')).toBe('success');
      expect(getStatusBadgeVariant('Closed')).toBe('success');
    });

    it('should return secondary variant for unknown status', () => {
      expect(getStatusBadgeVariant('unknown')).toBe('secondary');
    });
  });
});
