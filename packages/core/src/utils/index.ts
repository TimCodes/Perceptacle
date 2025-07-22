
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Format dates
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Validate field names are unique
export function validateUniqueFieldNames(fields: Array<{ name: string }>): boolean {
  const names = fields.map(f => f.name);
  return new Set(names).size === names.length;
}

// Deep clone objects
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue ?? null;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};

// API helpers
export function createApiUrl(endpoint: string, baseUrl = ''): string {
  return `${baseUrl}${endpoint}`;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }
  return response.json() as Promise<T>;
}

// Component helpers
export function getComponentIcon(category: string): string {
  const iconMap: Record<string, string> = {
    Compute: 'Server',
    Storage: 'Database', 
    Database: 'Database',
    Networking: 'Network',
    Security: 'Shield',
    Serverless: 'Zap',
  };
  return iconMap[category] || 'Box';
}

export function getComponentColor(category: string): string {
  const colorMap: Record<string, string> = {
    Compute: '#4285f4',
    Storage: '#34a853',
    Database: '#ea4335', 
    Networking: '#fbbc04',
    Security: '#9aa0a6',
    Serverless: '#ff6d01',
  };
  return colorMap[category] || '#6b7280';
}
