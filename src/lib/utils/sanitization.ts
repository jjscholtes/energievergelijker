import { z } from 'zod';

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize string input
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

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

  // Sanitize number input
  static sanitizeNumber(input: any): number {
    if (typeof input === 'number' && !isNaN(input) && isFinite(input)) {
      return input;
    }

    if (typeof input === 'string') {
      const parsed = parseFloat(input);
      if (!isNaN(parsed) && isFinite(parsed)) {
        return parsed;
      }
    }

    return 0;
  }

  // Sanitize postcode
  static sanitizePostcode(input: string): string {
    const sanitized = this.sanitizeString(input);
    // Dutch postcode format: 1234AB
    const postcodeRegex = /^[1-9][0-9]{3}[A-Z]{2}$/i;
    
    if (postcodeRegex.test(sanitized)) {
      return sanitized.toUpperCase();
    }
    
    return '';
  }

  // Sanitize email
  static sanitizeEmail(input: string): string {
    const sanitized = this.sanitizeString(input);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(sanitized)) {
      return sanitized.toLowerCase();
    }
    
    return '';
  }

  // Sanitize phone number
  static sanitizePhone(input: string): string {
    const sanitized = this.sanitizeString(input);
    // Remove all non-digit characters except + at the beginning
    const cleaned = sanitized.replace(/[^\d+]/g, '');
    
    // Dutch phone number patterns
    const phoneRegex = /^(\+31|0)[1-9][0-9]{8}$/;
    
    if (phoneRegex.test(cleaned)) {
      return cleaned;
    }
    
    return '';
  }

  // Sanitize object recursively
  static sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as T;
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj) as T;
    }

    if (typeof obj === 'number') {
      return this.sanitizeNumber(obj) as T;
    }

    return obj;
  }
}

// Validation schemas with sanitization
export const sanitizedSchemas = {
  postcode: z.string()
    .transform(InputSanitizer.sanitizePostcode)
    .refine(val => val.length === 6, 'Ongeldige postcode'),

  email: z.string()
    .transform(InputSanitizer.sanitizeEmail)
    .refine(val => val.length > 0, 'Ongeldig email adres'),

  phone: z.string()
    .transform(InputSanitizer.sanitizePhone)
    .refine(val => val.length > 0, 'Ongeldig telefoonnummer'),

  positiveNumber: z.number()
    .transform(InputSanitizer.sanitizeNumber)
    .refine(val => val >= 0, 'Getal moet positief zijn'),

  percentage: z.number()
    .transform(InputSanitizer.sanitizeNumber)
    .refine(val => val >= 0 && val <= 100, 'Percentage moet tussen 0 en 100 zijn'),

  safeString: z.string()
    .transform(InputSanitizer.sanitizeString)
    .refine(val => val.length > 0, 'Tekst mag niet leeg zijn'),
};

// Enhanced user profile schema with sanitization
export const sanitizedUserProfileSchema = z.object({
  postcode: sanitizedSchemas.postcode,
  aansluitingElektriciteit: z.enum(['1x25A', '1x35A', '3x25A', '3x35A', '3x50A']),
  aansluitingGas: z.enum(['G4', 'G6', 'G10', 'G16', 'G25']),
  jaarverbruikStroom: sanitizedSchemas.positiveNumber,
  jaarverbruikGas: sanitizedSchemas.positiveNumber,
  heeftZonnepanelen: z.boolean(),
  geenGas: z.boolean(),
  netbeheerder: sanitizedSchemas.safeString,
  pvOpwek: z.number().min(0).optional(),
  percentageZelfverbruik: sanitizedSchemas.percentage.optional(),
  piekDalVerdeling: z.object({
    piek: sanitizedSchemas.percentage,
    dal: sanitizedSchemas.percentage,
  }).optional(),
});

// Contract data schema with sanitization
export const sanitizedContractSchema = z.object({
  leverancier: sanitizedSchemas.safeString,
  productNaam: sanitizedSchemas.safeString,
  type: z.enum(['vast', 'variabel', 'dynamisch']),
  looptijdMaanden: z.number().min(1).max(60),
  vasteLeveringskosten: sanitizedSchemas.positiveNumber,
  tarieven: z.object({
    stroomKalePrijs: sanitizedSchemas.positiveNumber,
    gasKalePrijs: sanitizedSchemas.positiveNumber,
    terugleververgoeding: sanitizedSchemas.positiveNumber,
  }),
  kortingEenmalig: sanitizedSchemas.positiveNumber,
  duurzaamheidsScore: z.number().min(0).max(10),
  klanttevredenheid: z.number().min(0).max(10),
});

// API request sanitization
export function sanitizeApiRequest<T>(data: any, schema: z.ZodSchema<T>): T {
  try {
    // First sanitize the raw data
    const sanitizedData = InputSanitizer.sanitizeObject(data);
    
    // Then validate with Zod schema
    return schema.parse(sanitizedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// XSS protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// SQL injection protection (for future database use)
export function escapeSql(unsafe: string): string {
  return unsafe
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

// File upload sanitization
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

// URL sanitization
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    return urlObj.toString();
  } catch {
    return '';
  }
}
