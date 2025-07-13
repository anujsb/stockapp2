// src/lib/error-monitoring.ts
// Error monitoring and reporting system

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  context: string;
  stack?: string;
  userAgent?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

class ErrorMonitor {
  private errors: ErrorLog[] = [];
  private maxErrors = 1000; // Keep last 1000 errors
  private isDevelopment = process.env.NODE_ENV === 'development';

  logError(
    message: string, 
    context: string, 
    error?: Error, 
    additionalData?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message,
      context,
      stack: error?.stack,
      additionalData
    };

    this.addError(errorLog);
    
    // In development, also log to console
    if (this.isDevelopment) {
      console.error(`[${context}] ${message}`, error, additionalData);
    }
  }

  logWarning(
    message: string, 
    context: string, 
    additionalData?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warn',
      message,
      context,
      additionalData
    };

    this.addError(errorLog);
    
    if (this.isDevelopment) {
      console.warn(`[${context}] ${message}`, additionalData);
    }
  }

  logInfo(
    message: string, 
    context: string, 
    additionalData?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      context,
      additionalData
    };

    this.addError(errorLog);
    
    if (this.isDevelopment) {
      console.log(`[${context}] ${message}`, additionalData);
    }
  }

  private addError(errorLog: ErrorLog): void {
    this.errors.push(errorLog);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getErrors(level?: 'error' | 'warn' | 'info', limit?: number): ErrorLog[] {
    let filtered = this.errors;
    
    if (level) {
      filtered = filtered.filter(error => error.level === level);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.errors.length,
      errors: 0,
      warnings: 0,
      info: 0
    };

    this.errors.forEach(error => {
      const key = error.level + 's' as keyof typeof stats;
      if (key in stats) {
        stats[key]++;
      }
    });

    return stats;
  }

  clearErrors(): void {
    this.errors = [];
  }

  // Get errors by context
  getErrorsByContext(context: string): ErrorLog[] {
    return this.errors.filter(error => error.context === context);
  }

  // Get recent errors (last 24 hours)
  getRecentErrors(): ErrorLog[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.errors.filter(error => error.timestamp > oneDayAgo);
  }
}

// Create global error monitor instance
export const errorMonitor = new ErrorMonitor();

// Error boundary for React components
export function withErrorBoundary<T extends React.ComponentType<any>>(
  Component: T,
  fallback?: React.ComponentType<{ error?: Error }>
): T {
  return Component;
}

// API error handler
export function handleApiError(error: any, context: string): never {
  errorMonitor.logError(
    error.message || 'Unknown API error',
    context,
    error,
    { url: error.url, status: error.status }
  );
  
  throw error;
}

// Database error handler
export function handleDatabaseError(error: any, context: string): never {
  errorMonitor.logError(
    error.message || 'Unknown database error',
    context,
    error,
    { query: error.query, params: error.params }
  );
  
  throw error;
}

// Validation error handler
export function handleValidationError(errors: string[], context: string): never {
  errorMonitor.logError(
    `Validation failed: ${errors.join(', ')}`,
    context,
    undefined,
    { errors }
  );
  
  throw new Error(`Validation failed: ${errors.join(', ')}`);
} 