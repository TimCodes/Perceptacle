
import type { ApiResponse } from '../types/index.js';

// API response helpers
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
  };
}

// ID generation
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validation helpers
export function validateFieldNames(fields: { name: string }[]): boolean {
  const names = fields.map(f => f.name);
  return new Set(names).size === names.length;
}

// Type guards
export function isValidNodeType(type: any): boolean {
  return typeof type === 'string' && type.length > 0;
}

export function isValidPosition(position: any): boolean {
  return (
    position &&
    typeof position.x === 'number' &&
    typeof position.y === 'number'
  );
}
