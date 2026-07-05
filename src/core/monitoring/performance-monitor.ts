import { Platform } from 'react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private enabled = __DEV__;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  private addLog(level: LogLevel, message: string, data?: any, context?: string) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      context,
    };

    this.logs.push(entry);

    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log en consola en desarrollo
    if (__DEV__) {
      const prefix = `[${level.toUpperCase()}]`;
      const contextStr = context ? `[${context}]` : '';
      const dataStr = data ? JSON.stringify(data) : '';
      
      switch (level) {
        case 'debug':
          console.debug(`${prefix}${contextStr} ${message}`, dataStr);
          break;
        case 'info':
          console.info(`${prefix}${contextStr} ${message}`, dataStr);
          break;
        case 'warn':
          console.warn(`${prefix}${contextStr} ${message}`, dataStr);
          break;
        case 'error':
          console.error(`${prefix}${contextStr} ${message}`, dataStr);
          break;
      }
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.addLog('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.addLog('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.addLog('warn', message, data, context);
  }

  error(message: string, data?: any, context?: string) {
    this.addLog('error', message, data, context);
  }

  // Métricas de performance
  private metrics: Map<string, number> = new Map();

  startTimer(label: string) {
    this.metrics.set(label, Date.now());
    this.debug(`Timer started: ${label}`, undefined, 'Performance');
  }

  endTimer(label: string): number | null {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      this.warn(`Timer not found: ${label}`, undefined, 'Performance');
      return null;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(label);
    this.info(`Timer ended: ${label} - ${duration}ms`, { duration }, 'Performance');
    return duration;
  }

  // Métricas de memoria (solo Android)
  getMemoryInfo() {
    if (Platform.OS === 'android') {
      // En producción, podrías usar native modules para obtener info de memoria
      this.debug('Memory info requested', undefined, 'Performance');
    }
    return null;
  }

  // Obtener logs
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.info('Logs cleared', undefined, 'System');
  }

  // Exportar logs para análisis
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Métricas de API
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    this.info(
      `API Call: ${endpoint}`,
      { endpoint, duration, success },
      'API'
    );
  }

  // Métricas de navegación
  trackNavigation(route: string, duration?: number) {
    this.info(
      `Navigation: ${route}`,
      { route, duration },
      'Navigation'
    );
  }

  // Métricas de errores
  trackError(error: Error, context?: string) {
    this.error(
      error.message,
      {
        name: error.name,
        stack: error.stack,
      },
      context || 'Error'
    );
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper functions
export function withPerformanceTracking<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.startTimer(label);
  return fn()
    .then((result) => {
      performanceMonitor.endTimer(label);
      return result;
    })
    .catch((error) => {
      performanceMonitor.endTimer(label);
      performanceMonitor.trackError(error, label);
      throw error;
    });
}

export function logApiCall(
  endpoint: string,
  method: string,
  duration: number,
  success: boolean
) {
  performanceMonitor.trackApiCall(`${method} ${endpoint}`, duration, success);
}
