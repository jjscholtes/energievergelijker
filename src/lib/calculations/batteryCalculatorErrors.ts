/**
 * Custom error classes for battery calculator
 * Provides better error handling and recovery strategies
 */

/**
 * Base error class for battery calculator errors
 */
export class BatteryCalculatorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = 'BatteryCalculatorError';
    Object.setPrototypeOf(this, BatteryCalculatorError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 */
export class InvalidInputError extends BatteryCalculatorError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message, 'INVALID_INPUT', true);
    this.name = 'InvalidInputError';
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
}

/**
 * Error thrown when CSV data is missing or malformed
 */
export class CSVDataError extends BatteryCalculatorError {
  constructor(
    message: string,
    public readonly fileName?: string,
    public readonly lineNumber?: number
  ) {
    super(message, 'CSV_DATA_ERROR', true);
    this.name = 'CSVDataError';
    Object.setPrototypeOf(this, CSVDataError.prototype);
  }
}

/**
 * Error thrown when calculation produces invalid results
 */
export class CalculationError extends BatteryCalculatorError {
  constructor(
    message: string,
    public readonly calculationType?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message, 'CALCULATION_ERROR', false);
    this.name = 'CalculationError';
    Object.setPrototypeOf(this, CalculationError.prototype);
  }
}

/**
 * Error thrown when required data is missing
 */
export class MissingDataError extends BatteryCalculatorError {
  constructor(
    message: string,
    public readonly missingFields: string[]
  ) {
    super(message, 'MISSING_DATA', true);
    this.name = 'MissingDataError';
    Object.setPrototypeOf(this, MissingDataError.prototype);
  }
}

/**
 * Error thrown when a value is out of acceptable range
 */
export class RangeError extends BatteryCalculatorError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: number,
    public readonly min?: number,
    public readonly max?: number
  ) {
    super(message, 'RANGE_ERROR', true);
    this.name = 'RangeError';
    Object.setPrototypeOf(this, RangeError.prototype);
  }
}

/**
 * Type guard to check if error is a BatteryCalculatorError
 */
export function isBatteryCalculatorError(error: unknown): error is BatteryCalculatorError {
  return error instanceof BatteryCalculatorError;
}

/**
 * Get user-friendly error message from any error
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isBatteryCalculatorError(error)) {
    switch (error.code) {
      case 'INVALID_INPUT':
        return `Ongeldige invoer: ${error.message}`;
      case 'CSV_DATA_ERROR':
        return `Fout bij laden prijsgegevens: ${error.message}`;
      case 'CALCULATION_ERROR':
        return `Berekeningsfout: ${error.message}`;
      case 'MISSING_DATA':
        return `Ontbrekende gegevens: ${error.message}`;
      case 'RANGE_ERROR':
        return `Waarde buiten bereik: ${error.message}`;
      default:
        return `Onbekende fout: ${error.message}`;
    }
  }

  if (error instanceof Error) {
    return `Er is een fout opgetreden: ${error.message}`;
  }

  return 'Er is een onbekende fout opgetreden. Probeer het opnieuw.';
}

/**
 * Recovery strategy for different error types
 */
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  suggestedAction: string;
  fallbackValue?: unknown;
}

/**
 * Get recovery strategy for an error
 */
export function getRecoveryStrategy(error: unknown): ErrorRecoveryStrategy {
  if (!isBatteryCalculatorError(error)) {
    return {
      canRecover: false,
      suggestedAction: 'Herlaad de pagina en probeer opnieuw.',
    };
  }

  switch (error.code) {
    case 'INVALID_INPUT':
      return {
        canRecover: true,
        suggestedAction: 'Controleer de ingevoerde waarden en probeer opnieuw.',
      };
    
    case 'CSV_DATA_ERROR':
      return {
        canRecover: true,
        suggestedAction: 'Selecteer een ander prijsbestand of gebruik de standaard waarden.',
        fallbackValue: { gemiddeldeSpread: 0, aantalCycliPerJaar: 0, jaarlijkseWinst: 0 },
      };
    
    case 'MISSING_DATA':
      return {
        canRecover: true,
        suggestedAction: 'Vul alle verplichte velden in.',
      };
    
    case 'RANGE_ERROR':
      return {
        canRecover: true,
        suggestedAction: 'Pas de waarde aan zodat deze binnen het toegestane bereik valt.',
      };
    
    case 'CALCULATION_ERROR':
      return {
        canRecover: false,
        suggestedAction: 'Neem contact op met de ondersteuning als dit probleem zich blijft voordoen.',
      };
    
    default:
      return {
        canRecover: error.recoverable,
        suggestedAction: 'Probeer het opnieuw of neem contact op met de ondersteuning.',
      };
  }
}

