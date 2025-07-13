// src/lib/performance-monitor.ts
// Performance monitoring and metrics collection

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  type: 'api' | 'database' | 'render' | 'user-interaction';
  name: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';

  startTimer(name: string, type: PerformanceMetric['type'] = 'api') {
    const startTime = performance.now();
    
    return {
      end: (success: boolean = true, error?: string, metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, type, duration, success, error, metadata);
      }
    };
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    type: PerformanceMetric['type'] = 'api',
    metadata?: Record<string, any>
  ): Promise<T> {
    const timer = this.startTimer(name, type);
    
    try {
      const result = await fn();
      timer.end(true, undefined, metadata);
      return result;
    } catch (error) {
      timer.end(false, error instanceof Error ? error.message : String(error), metadata);
      throw error;
    }
  }

  measureSync<T>(
    name: string,
    fn: () => T,
    type: PerformanceMetric['type'] = 'api',
    metadata?: Record<string, any>
  ): T {
    const timer = this.startTimer(name, type);
    
    try {
      const result = fn();
      timer.end(true, undefined, metadata);
      return result;
    } catch (error) {
      timer.end(false, error instanceof Error ? error.message : String(error), metadata);
      throw error;
    }
  }

  private recordMetric(
    name: string,
    type: PerformanceMetric['type'],
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      name,
      duration,
      success,
      error,
      metadata
    };

    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations in development
    if (this.isDevelopment && duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(type?: PerformanceMetric['type'], limit?: number): PerformanceMetric[] {
    let filtered = this.metrics;
    
    if (type) {
      filtered = filtered.filter(metric => metric.type === type);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }

  getPerformanceStats(): Record<string, any> {
    const successful = this.metrics.filter(m => m.success);
    const failed = this.metrics.filter(m => !m.success);
    
    const avgDuration = successful.length > 0 
      ? successful.reduce((sum, m) => sum + m.duration, 0) / successful.length 
      : 0;
    
    const maxDuration = successful.length > 0 
      ? Math.max(...successful.map(m => m.duration))
      : 0;
    
    const minDuration = successful.length > 0 
      ? Math.min(...successful.map(m => m.duration))
      : 0;
    
    return {
      total: this.metrics.length,
      successful: successful.length,
      failed: failed.length,
      successRate: this.metrics.length > 0 ? (successful.length / this.metrics.length) * 100 : 0,
      averageDuration: avgDuration,
      maxDuration,
      minDuration,
      byType: this.getMetricsByType()
    };
  }

  private getMetricsByType(): Record<string, any> {
    const byType: Record<string, any> = {};
    
    this.metrics.forEach(metric => {
      if (!byType[metric.type]) {
        byType[metric.type] = {
          count: 0,
          successful: 0,
          failed: 0,
          totalDuration: 0,
          avgDuration: 0
        };
      }
      
      byType[metric.type].count++;
      byType[metric.type].totalDuration += metric.duration;
      
      if (metric.success) {
        byType[metric.type].successful++;
      } else {
        byType[metric.type].failed++;
      }
    });
    
    // Calculate averages
    Object.values(byType).forEach((type: any) => {
      type.avgDuration = type.count > 0 ? type.totalDuration / type.count : 0;
    });
    
    return byType;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Get slow operations (above threshold)
  getSlowOperations(threshold: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.duration > threshold);
  }

  // Get failed operations
  getFailedOperations(): PerformanceMetric[] {
    return this.metrics.filter(metric => !metric.success);
  }

  // Get recent metrics (last hour)
  getRecentMetrics(): PerformanceMetric[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp > oneHourAgo);
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Decorator for measuring function performance
export function measurePerformance(
  name: string,
  type: PerformanceMetric['type'] = 'api'
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      return performanceMonitor.measureAsync(
        name,
        () => method.apply(this, args),
        type
      );
    };
  };
}

// Utility for measuring API calls
export function measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
  return performanceMonitor.measureAsync(name, apiCall, 'api');
}

// Utility for measuring database operations
export function measureDbOperation<T>(name: string, dbOperation: () => Promise<T>): Promise<T> {
  return performanceMonitor.measureAsync(name, dbOperation, 'database');
} 