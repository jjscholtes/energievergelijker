import { NextRequest, NextResponse } from 'next/server';

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind CSS requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // X-Frame-Options
  'X-Frame-Options': 'DENY',

  // X-Content-Type-Options
  'X-Content-Type-Options': 'nosniff',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // Strict Transport Security (only in production)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // X-XSS-Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'require-corp',

  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',

  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin',
};

// Development security headers (less restrictive)
export const developmentSecurityHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' localhost:*",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: localhost:*",
    "font-src 'self' data:",
    "connect-src 'self' https: localhost:* ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'Strict-Transport-Security': '', // Disable HSTS in development
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse, isDevelopment: boolean = false): NextResponse {
  const headers = isDevelopment ? developmentSecurityHeaders : securityHeaders;
  
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

// Security middleware for API routes
export function withSecurityHeaders(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return applySecurityHeaders(response, isDevelopment);
  };
}

// CSRF protection
export class CSRFProtection {
  private static readonly CSRF_TOKEN_HEADER = 'x-csrf-token';
  private static readonly CSRF_TOKEN_COOKIE = 'csrf-token';
  
  static generateToken(): string {
    // Generate a cryptographically secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  static validateToken(request: NextRequest): boolean {
    const tokenFromHeader = request.headers.get(this.CSRF_TOKEN_HEADER);
    const tokenFromCookie = request.cookies.get(this.CSRF_TOKEN_COOKIE)?.value;
    
    if (!tokenFromHeader || !tokenFromCookie) {
      return false;
    }
    
    return tokenFromHeader === tokenFromCookie;
  }
  
  static setTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set(this.CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }
}

// CSRF middleware
export function withCSRFProtection(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF for GET requests
    if (request.method === 'GET') {
      return handler(request);
    }
    
    // Validate CSRF token for other methods
    if (!CSRFProtection.validateToken(request)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
    
    return handler(request);
  };
}

// Input validation and sanitization
export class SecurityValidator {
  // Validate and sanitize user input
  static validateUserInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }
    
    if (typeof input === 'number') {
      return this.validateNumber(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.validateUserInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeString(key)] = this.validateUserInput(value);
      }
      return sanitized;
    }
    
    return input;
  }
  
  private static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[&<>"']/g, (match) => {
        const entities: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
        };
        return entities[match];
      });
  }
  
  private static validateNumber(input: number): number {
    if (isNaN(input) || !isFinite(input)) {
      return 0;
    }
    return input;
  }
  
  // Validate file uploads
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'text/plain',
    ];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    
    return { valid: true };
  }
  
  // Validate URL
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  // Validate email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validate postcode
  static validatePostcode(postcode: string): boolean {
    const postcodeRegex = /^[1-9][0-9]{3}[A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
  }
}

// Security audit logging
export class SecurityAuditLogger {
  private static logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ip: 'unknown', // Would be extracted from request in real implementation
    };
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to security monitoring service
      console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
    } else {
      console.log('Security Event:', logEntry);
    }
  }
  
  static logSuspiciousActivity(activity: string, details: any): void {
    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', { activity, details });
  }
  
  static logAuthenticationAttempt(success: boolean, details: any): void {
    this.logSecurityEvent('AUTH_ATTEMPT', { success, details });
  }
  
  static logDataAccess(resource: string, details: any): void {
    this.logSecurityEvent('DATA_ACCESS', { resource, details });
  }
  
  static logError(error: Error, context: any): void {
    this.logSecurityEvent('ERROR', { 
      message: error.message, 
      stack: error.stack, 
      context 
    });
  }
}

// Security headers for Next.js configuration
export const nextSecurityConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
    ];
  },
};

// Environment-specific security configuration
export const securityConfig = {
  development: {
    enableCSRF: false,
    enableRateLimiting: false,
    enableSecurityHeaders: true,
    logLevel: 'debug',
  },
  production: {
    enableCSRF: true,
    enableRateLimiting: true,
    enableSecurityHeaders: true,
    logLevel: 'error',
  },
};

// Get current security configuration
export function getSecurityConfig() {
  const env = process.env.NODE_ENV || 'development';
  return securityConfig[env as keyof typeof securityConfig];
}
