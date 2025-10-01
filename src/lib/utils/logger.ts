export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as any : undefined,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context, error);
    const levelName = LogLevel[level];

    if (this.isDevelopment) {
      // In development, use console with colors
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';

      console.log(
        `${colors[level]}[${levelName}]${reset} ${logEntry.timestamp} - ${message}`,
        context ? context : '',
        error ? error : ''
      );
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(logEntry));
    }

    // In production, you would send this to a logging service
    // Example: Sentry, LogRocket, or custom logging endpoint
    this.sendToLoggingService(logEntry);
  }

  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    if (this.isDevelopment) return;

    try {
      // Example: Send to logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // });
    } catch (error) {
      // Don't log logging errors to avoid infinite loops
      console.error('Failed to send log to service:', error);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Specialized logging methods
  calculationStart(calculationType: string, userProfile: Record<string, any>): void {
    this.info(`Starting ${calculationType} calculation`, {
      calculationType,
      userProfile: this.sanitizeUserProfile(userProfile),
    });
  }

  calculationComplete(calculationType: string, duration: number, result: Record<string, any>): void {
    this.info(`Completed ${calculationType} calculation`, {
      calculationType,
      duration: `${duration}ms`,
      resultSummary: this.sanitizeResult(result),
    });
  }

  calculationError(calculationType: string, error: Error, userProfile?: Record<string, any>): void {
    this.error(`Calculation error in ${calculationType}`, error, {
      calculationType,
      userProfile: userProfile ? this.sanitizeUserProfile(userProfile) : undefined,
    });
  }

  apiRequest(method: string, url: string, statusCode: number, duration: number): void {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    });
  }

  apiError(method: string, url: string, error: Error, statusCode?: number): void {
    this.error(`API error ${method} ${url}`, error, {
      method,
      url,
      statusCode,
    });
  }

  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, context);
  }

  private sanitizeUserProfile(profile: Record<string, any>): Record<string, any> {
    // Remove sensitive information
    const sanitized = { ...profile };
    delete sanitized.postcode; // Remove exact postcode
    return sanitized;
  }

  private sanitizeResult(result: Record<string, any>): Record<string, any> {
    // Keep only essential result information
    return {
      totalCost: result.totaleJaarkostenMetPv,
      hasPV: !!result.pvOpbrengsten,
      contractCount: result.length || 1,
    };
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logCalculation = {
  start: (type: string, profile: Record<string, any>) => logger.calculationStart(type, profile),
  complete: (type: string, duration: number, result: Record<string, any>) => 
    logger.calculationComplete(type, duration, result),
  error: (type: string, error: Error, profile?: Record<string, any>) => 
    logger.calculationError(type, error, profile),
};

export const logAPI = {
  request: (method: string, url: string, statusCode: number, duration: number) => 
    logger.apiRequest(method, url, statusCode, duration),
  error: (method: string, url: string, error: Error, statusCode?: number) => 
    logger.apiError(method, url, error, statusCode),
};

export const logUser = {
  action: (action: string, context?: Record<string, any>) => logger.userAction(action, context),
};
