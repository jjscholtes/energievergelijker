/**
 * Custom hook for battery calculator form state management
 * Centralizes validation, state updates, and error handling
 */

import { useState, useMemo, useCallback } from 'react';
import { BatteryInput } from '@/types/battery';
import {
  schemaMap,
  StepKey,
  basicsSchema,
  solarSchema,
  batterySchema,
  dynamicSchema,
} from '@/lib/validation/batterySchemas';
import {
  WizardState,
  defaultWizardState,
  stepFields,
  transformFormToBatteryInput,
} from '@/lib/utils/formTransformers';

export interface UseBatteryFormReturn {
  // State
  formState: WizardState;
  errors: Record<string, string>;
  stepIndex: number;
  activeSteps: StepDefinition[];
  activeStep: StepDefinition;
  activeStepIndex: number;
  hasSolar: boolean;

  // Actions
  updateField: <K extends StepKey, F extends keyof WizardState[K]>(
    step: K,
    field: F,
    value: WizardState[K][F]
  ) => void;
  validateStep: (stepKey: StepKey) => boolean;
  handleNext: () => void;
  handlePrevious: () => void;
  handleCalculate: () => BatteryInput | null;
  clearErrorsForStep: (stepKey: StepKey) => void;
  setStepIndex: (index: number) => void;
}

export interface StepDefinition {
  key: StepKey;
  title: string;
  description: string;
  optional?: boolean;
}

const allSteps: StepDefinition[] = [
  { key: 'basics', title: 'Basisgegevens', description: 'Verbruik en zonnepanelen' },
  { key: 'solar', title: 'Zonnepanelen & flex', description: 'PV-opwekking en flexibele lasten' },
  { key: 'battery', title: 'Accugegevens', description: 'Capaciteit, investering en efficiëntie' },
  { key: 'dynamic', title: 'Contract & bevestiging', description: 'Tarieven, arbitrage en samenvatting' },
];

/**
 * Custom hook for managing battery calculator form state
 */
export function useBatteryForm(initialState: WizardState = defaultWizardState): UseBatteryFormReturn {
  const [formState, setFormState] = useState<WizardState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);

  const hasSolar = formState.basics.heeftZonnepanelen;

  // Calculate active steps based on solar panel selection
  const activeSteps = useMemo(() => {
    if (hasSolar) {
      return allSteps;
    }
    return allSteps.filter(step => step.key !== 'solar');
  }, [hasSolar]);

  const activeStepIndex = Math.min(stepIndex, activeSteps.length - 1);
  const activeStep = activeSteps[activeStepIndex];

  /**
   * Update a specific field in the form state
   */
  const updateField = useCallback(
    <K extends StepKey, F extends keyof WizardState[K]>(
      step: K,
      field: F,
      value: WizardState[K][F]
    ) => {
      setFormState(prev => ({
        ...prev,
        [step]: {
          ...prev[step],
          [field]: value,
        },
      }));
    },
    []
  );

  /**
   * Clear errors for a specific step
   */
  const clearErrorsForStep = useCallback((stepKey: StepKey) => {
    setErrors(prev => {
      const next = { ...prev };
      stepFields[stepKey].forEach(field => {
        delete next[field];
      });
      return next;
    });
  }, []);

  /**
   * Validate a specific step
   * Returns true if validation passes, false otherwise
   */
  const validateStep = useCallback(
    (stepKey: StepKey): boolean => {
      // Skip validation for solar step if no solar panels
      if (stepKey === 'solar' && !hasSolar) {
        clearErrorsForStep(stepKey);
        return true;
      }

      const schema = schemaMap[stepKey];
      const value = formState[stepKey] as unknown;

      try {
        const result = schema.safeParse(value);

        if (!result.success) {
          const stepErrors: Record<string, string> = {};

          // Properly handle Zod error structure
          if (result.error?.issues) {
            result.error.issues.forEach(issue => {
              const field = issue.path[0];
              if (typeof field === 'string') {
                stepErrors[field] = issue.message;
              }
            });
          } else {
            // Fallback for unexpected error structure
            console.error('Unexpected validation error structure:', result.error);
            stepErrors['_form'] = 'Er is een validatiefout opgetreden. Controleer alle velden.';
          }

          setErrors(prev => ({
            ...prev,
            ...stepErrors,
          }));
          return false;
        }

        clearErrorsForStep(stepKey);
        return true;
      } catch (error) {
        console.error('Validation exception:', error);
        setErrors(prev => ({
          ...prev,
          _form: 'Er is een onverwachte fout opgetreden bij validatie.',
        }));
        return false;
      }
    },
    [formState, hasSolar, clearErrorsForStep]
  );

  /**
   * Navigate to next step
   */
  const handleNext = useCallback(() => {
    if (!validateStep(activeStep.key)) {
      return;
    }
    setStepIndex(prev => Math.min(prev + 1, allSteps.length - 1));
  }, [activeStep.key, validateStep]);

  /**
   * Navigate to previous step
   */
  const handlePrevious = useCallback(() => {
    setStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  /**
   * Validate all steps and prepare data for calculation
   * Returns BatteryInput if validation passes, null otherwise
   */
  const handleCalculate = useCallback((): BatteryInput | null => {
    const stepsToValidate = hasSolar ? allSteps : allSteps.filter(step => step.key !== 'solar');
    const validations = stepsToValidate.map(step => validateStep(step.key));

    if (validations.includes(false)) {
      return null;
    }

    try {
      // Parse and validate all form data
      const basics = basicsSchema.parse(formState.basics);
      const solar = hasSolar ? solarSchema.parse(formState.solar) : null;
      const battery = batterySchema.parse(formState.battery);
      const dynamic = dynamicSchema.parse(formState.dynamic);

      // Transform to BatteryInput
      return transformFormToBatteryInput(basics, solar, battery, dynamic);
    } catch (error) {
      console.error('Error transforming form data:', error);
      setErrors(prev => ({
        ...prev,
        _form: 'Er is een fout opgetreden bij het verwerken van de gegevens.',
      }));
      return null;
    }
  }, [formState, hasSolar, validateStep]);

  return {
    // State
    formState,
    errors,
    stepIndex,
    activeSteps,
    activeStep,
    activeStepIndex,
    hasSolar,

    // Actions
    updateField,
    validateStep,
    handleNext,
    handlePrevious,
    handleCalculate,
    clearErrorsForStep,
    setStepIndex,
  };
}

