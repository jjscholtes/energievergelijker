'use client';

import { useMemo, useState } from 'react';
import {
  Battery,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { BatteryInput, BatteryProfile } from '@/types/battery';
import {
  basicsSchema,
  solarSchema,
  batterySchema,
  dynamicSchema,
  type StepKey,
} from '@/lib/validation/batterySchemas';
import { defaultWizardState, stepFields, type WizardState } from '@/lib/utils/formTransformers';

interface BatteryInputFormProps {
  onCalculate: (input: BatteryInput) => void;
  isCalculating?: boolean;
}

interface StepDefinition {
  key: StepKey;
  title: string;
  description: string;
  optional?: boolean;
}

const steps: StepDefinition[] = [
  { key: 'basics', title: 'Basisgegevens', description: 'Verbruik en zonnepanelen' },
  { key: 'solar', title: 'Zonnepanelen & flex', description: 'PV-opwekking en flexibele lasten' },
  { key: 'battery', title: 'Accugegevens', description: 'Capaciteit, investering en efficiëntie' },
  { key: 'dynamic', title: 'Contract & bevestiging', description: 'Tarieven, arbitrage en samenvatting' },
];

export function BatteryInputForm({ onCalculate, isCalculating = false }: BatteryInputFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formState, setFormState] = useState<WizardState>(defaultWizardState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasSolar = formState.basics.heeftZonnepanelen;

  const activeSteps = useMemo(() => {
    if (hasSolar) {
      return steps;
    }
    return steps.filter(step => step.key !== 'solar');
  }, [hasSolar]);

  const activeStepIndex = Math.min(stepIndex, activeSteps.length - 1);
  const activeStep = activeSteps[activeStepIndex];

  const validateStep = (stepKey: StepKey) => {
    if (stepKey === 'solar' && !hasSolar) {
      clearErrorsForStep(stepKey);
      return true;
    }

    const schema = {
      basics: basicsSchema,
      solar: solarSchema,
      battery: batterySchema,
      dynamic: dynamicSchema,
    }[stepKey];

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
  };

  const clearErrorsForStep = (stepKey: StepKey) => {
    setErrors(prev => {
      const next = { ...prev };
      stepFields[stepKey].forEach(field => {
        delete next[field];
      });
      return next;
    });
  };

  const handleNext = () => {
    if (!validateStep(activeStep.key)) {
      return;
    }
    setStepIndex(prev => Math.min(prev + 1, activeSteps.length - 1));
  };

  const handlePrevious = () => {
    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  const handleCalculate = () => {
    const validations = (hasSolar ? steps : steps.filter(step => step.key !== 'solar')).map(step =>
      validateStep(step.key)
    );

    if (validations.includes(false)) {
      return;
    }
    
    const basics = basicsSchema.parse(formState.basics);

    const solar = hasSolar ? solarSchema.parse(formState.solar) : null;
    const battery = batterySchema.parse(formState.battery);
    const dynamic = dynamicSchema.parse(formState.dynamic);

    const batteryProfile: BatteryProfile = {
      capaciteitKwh: battery.capaciteitKwh,
      prijsEuro: battery.prijsEuro,
      roundTripEfficiency: battery.roundTripEfficiency / 100,
      garantieJaren: battery.garantieJaren,
      degradatiePerJaar: battery.degradatie / 100,
    };

    const stroomKalePrijs =
      dynamic.contractType === 'dynamisch'
        ? (dynamic.stroomPrijsCent + dynamic.opslagAfnameCent) / 100
        : dynamic.stroomPrijsCent / 100;

    const terugleververgoeding =
      dynamic.contractType === 'dynamisch'
        ? Math.max(0, dynamic.stroomPrijsCent - dynamic.opslagInvoedingCent) / 100
        : dynamic.terugleververgoedingCent / 100;

    const totaalVerbruik =
      (Number(basics.jaarverbruikStroomPiek) || 0) + (Number(basics.jaarverbruikStroomDal) || 0);

    const input: BatteryInput = {
      battery: batteryProfile,
      heeftZonnepanelen: basics.heeftZonnepanelen,
      pvOpwekKwh: basics.heeftZonnepanelen ? solar?.pvOpwekKwh : undefined,
      huidigEigenverbruikPercentage: basics.heeftZonnepanelen ? solar?.eigenverbruikZonder : undefined,
      eigenverbruikMetAccuPercentage: basics.heeftZonnepanelen ? solar?.eigenverbruikMet : undefined,
      jaarverbruikStroom: totaalVerbruik,
      contractType: dynamic.contractType,
      stroomKalePrijs,
      terugleververgoeding,
    };
    
    onCalculate(input);
  };

  const updateFormState = <K extends StepKey, F extends keyof WizardState[K]>(
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
  };

  return (
    <div className="space-y-6">
      <WizardStepIndicator
        steps={activeSteps}
        currentIndex={activeStepIndex}
        completedCount={activeStepIndex}
      />

      <Card className="border border-orange-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <span>{activeStep.title}</span>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              Stap {activeStepIndex + 1} van {activeSteps.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{activeStep.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeStep.key === 'basics' && (
            <StepBasics
              data={formState.basics}
              errors={errors}
              onChange={(field, value) => updateFormState('basics', field, value)}
            />
          )}

          {activeStep.key === 'solar' && (
            <StepSolar
              data={formState.solar}
              errors={errors}
              onChange={(field, value) => updateFormState('solar', field, value)}
            />
          )}

          {activeStep.key === 'battery' && (
            <StepBattery
              data={formState.battery}
              errors={errors}
              onChange={(field, value) => updateFormState('battery', field, value)}
            />
          )}

          {activeStep.key === 'dynamic' && (
            <StepDynamic
              data={formState.dynamic}
              errors={errors}
              onChange={(field, value) => updateFormState('dynamic', field, value)}
              basicsData={formState.basics}
              solarData={formState.solar}
              batteryData={formState.battery}
            />
          )}

          <WizardNavigation
            isFirst={activeStepIndex === 0}
            isLast={activeStepIndex === activeSteps.length - 1}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleCalculate}
            isSubmitting={isCalculating}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface WizardStepIndicatorProps {
  steps: StepDefinition[];
  currentIndex: number;
  completedCount: number;
}

function WizardStepIndicator({ steps, currentIndex, completedCount }: WizardStepIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Stap {currentIndex + 1} van {steps.length}</span>
        <span>functie vóór vorm</span>
      </div>
      <div className="flex items-center gap-3">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < completedCount;
          return (
            <div key={step.key} className="flex-1">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 px-3 py-2 text-xs font-semibold transition-all',
                  isActive && 'border-orange-500 bg-orange-50 text-orange-700',
                  !isActive && 'border-slate-200 bg-white text-slate-500',
                  isCompleted && 'border-emerald-500 bg-emerald-50 text-emerald-700'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <span className="mr-2 text-[10px]">{index + 1}</span>
                )}
                <span className="truncate">{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-2 rounded-full bg-orange-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

interface StepProps<T> {
  data: T;
  errors: Record<string, string>;
  onChange: <K extends keyof T>(field: K, value: T[K]) => void;
}

type BasicsData = WizardState['basics'];

function StepBasics({ data, errors, onChange }: StepProps<BasicsData>) {
  const piek = Number(data.jaarverbruikStroomPiek) || 0;
  const dal = Number(data.jaarverbruikStroomDal) || 0;
  const totaal = piek + dal;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="jaarverbruikStroomPiek">Verbruik piekuren (kWh)</Label>
          <Input
            id="jaarverbruikStroomPiek"
            type="number"
            value={data.jaarverbruikStroomPiek}
            onChange={event => onChange('jaarverbruikStroomPiek', event.target.value)}
            min={0}
            max={25000}
          />
          {errors.jaarverbruikStroomPiek && <ErrorLabel>{errors.jaarverbruikStroomPiek}</ErrorLabel>}
          <p className="mt-1 text-xs text-muted-foreground">Normaal tarief (daguren)</p>
        </div>
        <div>
          <Label htmlFor="jaarverbruikStroomDal">Verbruik daluren (kWh)</Label>
          <Input
            id="jaarverbruikStroomDal"
            type="number"
            value={data.jaarverbruikStroomDal}
            onChange={event => onChange('jaarverbruikStroomDal', event.target.value)}
            min={0}
            max={25000}
          />
          {errors.jaarverbruikStroomDal && <ErrorLabel>{errors.jaarverbruikStroomDal}</ErrorLabel>}
          <p className="mt-1 text-xs text-muted-foreground">Laag tarief (nacht/weekend)</p>
        </div>
        <div>
          <Label htmlFor="jaarverbruikGas">Jaarverbruik gas (optioneel)</Label>
          <Input
            id="jaarverbruikGas"
            type="number"
            value={data.jaarverbruikGas}
            onChange={event => onChange('jaarverbruikGas', event.target.value)}
            placeholder="1200"
          />
          {errors.jaarverbruikGas && <ErrorLabel>{errors.jaarverbruikGas}</ErrorLabel>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Totaal verbruik</p>
          <p className="text-2xl font-bold text-orange-600">{totaal.toLocaleString('nl-NL')} kWh</p>
          <p className="mt-1 text-xs text-muted-foreground">Minimaal 500 kWh · Maximaal 25.000 kWh</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Label className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Ik heb zonnepanelen</div>
              <p className="text-sm text-muted-foreground">Hierdoor kunnen we eigenverbruik en saldering meenemen.</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 accent-orange-500"
              checked={data.heeftZonnepanelen}
              onChange={event => onChange('heeftZonnepanelen', event.target.checked)}
            />
          </Label>
        </div>
      </div>
    </div>
  );
}

type SolarData = WizardState['solar'];

function StepSolar({ data, errors, onChange }: StepProps<SolarData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="pvOpwekKwh">Jaarlijkse PV-opwekking (kWh)</Label>
          <Input
            id="pvOpwekKwh"
            type="number"
            value={data.pvOpwekKwh}
            onChange={event => onChange('pvOpwekKwh', event.target.value)}
            min={0}
            max={40000}
          />
          {errors.pvOpwekKwh && <ErrorLabel>{errors.pvOpwekKwh}</ErrorLabel>}
        </div>
        <div>
          <Label>Eigenverbruik zonder accu</Label>
          <Slider
            value={[data.eigenverbruikZonder]}
            min={10}
            max={80}
            onValueChange={value => onChange('eigenverbruikZonder', value[0])}
          />
          {errors.eigenverbruikZonder && <ErrorLabel>{errors.eigenverbruikZonder}</ErrorLabel>}
          <p className="mt-1 text-xs text-muted-foreground">{data.eigenverbruikZonder}% direct gebruik</p>
        </div>
        <div>
          <Label>Eigenverbruik met accu</Label>
          <Slider
            value={[data.eigenverbruikMet]}
            min={30}
            max={95}
            onValueChange={value => onChange('eigenverbruikMet', value[0])}
          />
          {errors.eigenverbruikMet && <ErrorLabel>{errors.eigenverbruikMet}</ErrorLabel>}
          <p className="mt-1 text-xs text-muted-foreground">{data.eigenverbruikMet}% met slim laden</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label>EV flexibel laden</Label>
          <Slider
            value={[data.evFlexPct]}
            min={0}
            max={100}
            onValueChange={value => onChange('evFlexPct', value[0])}
          />
          <p className="mt-1 text-xs text-muted-foreground">{data.evFlexPct}% van het laden is verschuifbaar</p>
        </div>
        <div>
          <Label>Warmtepomp flexibiliteit</Label>
          <Slider
            value={[data.wpFlexPct]}
            min={0}
            max={60}
            onValueChange={value => onChange('wpFlexPct', value[0])}
          />
          <p className="mt-1 text-xs text-muted-foreground">{data.wpFlexPct}% buffer binnen comfort</p>
        </div>
        <div>
          <Label htmlFor="maxFlexvermogen">Max. flexibel vermogen (kW)</Label>
          <Input
            id="maxFlexvermogen"
            type="number"
            value={data.maxFlexvermogen}
            onChange={event => onChange('maxFlexvermogen', event.target.value)}
            min={0}
            max={25}
            step="0.5"
          />
          {errors.maxFlexvermogen && <ErrorLabel>{errors.maxFlexvermogen}</ErrorLabel>}
        </div>
      </div>
    </div>
  );
}

type BatteryData = WizardState['battery'];

function StepBattery({ data, errors, onChange }: StepProps<BatteryData>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="capaciteitKwh">Accu capaciteit (kWh)</Label>
          <Input
            id="capaciteitKwh"
            type="number"
            value={data.capaciteitKwh}
            onChange={event => onChange('capaciteitKwh', event.target.value)}
            min={0.1}
            max={30}
            step="0.1"
          />
          {errors.capaciteitKwh && <ErrorLabel>{errors.capaciteitKwh}</ErrorLabel>}
        </div>
        <div>
          <Label htmlFor="prijsEuro">Investering (incl. installatie)</Label>
              <Input
                id="prijsEuro"
                type="number"
            value={data.prijsEuro}
            onChange={event => onChange('prijsEuro', event.target.value)}
            min={500}
            max={25000}
                step="100"
              />
          {errors.prijsEuro && <ErrorLabel>{errors.prijsEuro}</ErrorLabel>}
        </div>
        <div>
          <Label htmlFor="maxLaadvermogen">Max. laad/ontlaadvermogen (kW)</Label>
          <Input
            id="maxLaadvermogen"
            type="number"
            value={data.maxLaadvermogen}
            onChange={event => onChange('maxLaadvermogen', event.target.value)}
            min={0.1}
            max={25}
            step="0.1"
          />
          {errors.maxLaadvermogen && <ErrorLabel>{errors.maxLaadvermogen}</ErrorLabel>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label>Rondritrendement</Label>
          <Slider
            value={[data.roundTripEfficiency]}
            min={70}
            max={98}
            onValueChange={value => onChange('roundTripEfficiency', value[0])}
          />
          {errors.roundTripEfficiency && <ErrorLabel>{errors.roundTripEfficiency}</ErrorLabel>}
          <p className="mt-1 text-xs text-muted-foreground">{data.roundTripEfficiency}%</p>
        </div>
        <div>
          <Label>Degradatie per jaar</Label>
          <Slider
            value={[data.degradatie]}
            min={0.5}
            max={5}
            step={0.1}
            onValueChange={value => onChange('degradatie', value[0])}
          />
          {errors.degradatie && <ErrorLabel>{errors.degradatie}</ErrorLabel>}
          <p className="mt-1 text-xs text-muted-foreground">{data.degradatie.toFixed(1)}% na startjaar</p>
        </div>
        <div>
          <Label htmlFor="degradatieStartJaar">Degradatie start in jaar</Label>
          <Input
            id="degradatieStartJaar"
            type="number"
            value={data.degradatieStartJaar}
            onChange={event => onChange('degradatieStartJaar', event.target.value)}
            min={5}
            max={15}
          />
          {errors.degradatieStartJaar && <ErrorLabel>{errors.degradatieStartJaar}</ErrorLabel>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="garantieJaren">Garantie (jaren)</Label>
          <Input
            id="garantieJaren"
            type="number"
            value={data.garantieJaren}
            onChange={event => onChange('garantieJaren', event.target.value)}
            min={5}
            max={25}
          />
          {errors.garantieJaren && <ErrorLabel>{errors.garantieJaren}</ErrorLabel>}
        </div>
      </div>
    </div>
  );
}

type DynamicData = WizardState['dynamic'];

interface StepDynamicProps extends StepProps<DynamicData> {
  basicsData: WizardState['basics'];
  solarData: WizardState['solar'];
  batteryData: WizardState['battery'];
}

function StepDynamic({ data, errors, onChange, basicsData, solarData, batteryData }: StepDynamicProps) {
  const piekVerbruik = Number(basicsData.jaarverbruikStroomPiek) || 0;
  const dalVerbruik = Number(basicsData.jaarverbruikStroomDal) || 0;
  const totaalVerbruik = piekVerbruik + dalVerbruik;

  const summaryItems = [
    {
      label: 'Jaarverbruik stroom',
      value: `${totaalVerbruik.toLocaleString('nl-NL')} kWh (piek ${piekVerbruik.toLocaleString('nl-NL')} / dal ${dalVerbruik.toLocaleString('nl-NL')})`,
    },
    {
      label: 'Accu',
      value: `${batteryData.capaciteitKwh} kWh • €${batteryData.prijsEuro}`,
    },
    {
      label: 'Eigenverbruik met accu',
      value: basicsData.heeftZonnepanelen ? `${solarData.eigenverbruikMet}%` : 'n.v.t.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div>
            <Label>Contracttype</Label>
            <div className="mt-2 flex gap-3">
              {(['vast', 'dynamisch'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange('contractType', option)}
                  className={cn(
                    'flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition',
                    data.contractType === option
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                  )}
                >
                  {option === 'vast' ? 'Vast contract' : 'Dynamisch contract'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
              <Label>All-in kale prijs (ct/kWh)</Label>
              <Input
                value={data.stroomPrijsCent}
                onChange={event => onChange('stroomPrijsCent', event.target.value)}
                type="number"
                step="0.1"
              />
              {errors.stroomPrijsCent && <ErrorLabel>{errors.stroomPrijsCent}</ErrorLabel>}
            </div>
            <div>
              <Label>Terugleververgoeding (ct/kWh)</Label>
              <Input
                value={data.terugleververgoedingCent}
                onChange={event => onChange('terugleververgoedingCent', event.target.value)}
                type="number"
                step="0.1"
              />
              {errors.terugleververgoedingCent && <ErrorLabel>{errors.terugleververgoedingCent}</ErrorLabel>}
        </div>
            <div>
              <Label htmlFor="vasteKostenMaand">Vaste kosten (€/maand)</Label>
              <Input
                id="vasteKostenMaand"
                value={data.vasteKostenMaand}
                onChange={event => onChange('vasteKostenMaand', event.target.value)}
                type="number"
                step="0.1"
              />
              {errors.vasteKostenMaand && <ErrorLabel>{errors.vasteKostenMaand}</ErrorLabel>}
            </div>
          </div>

          {data.contractType === 'dynamisch' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label>Opslag afname (ct/kWh)</Label>
                <Input
                  value={data.opslagAfnameCent}
                  onChange={event => onChange('opslagAfnameCent', event.target.value)}
                  type="number"
                  step="0.1"
                />
                {errors.opslagAfnameCent && <ErrorLabel>{errors.opslagAfnameCent}</ErrorLabel>}
              </div>
            <div>
                <Label>Opslag invoeding (ct/kWh)</Label>
                <Input
                  value={data.opslagInvoedingCent}
                  onChange={event => onChange('opslagInvoedingCent', event.target.value)}
                  type="number"
                  step="0.1"
                />
                {errors.opslagInvoedingCent && <ErrorLabel>{errors.opslagInvoedingCent}</ErrorLabel>}
              </div>
            <div>
                <Label>Laaddrempel (ct/kWh)</Label>
                <Input
                  value={data.laadDrempelCent}
                  onChange={event => onChange('laadDrempelCent', event.target.value)}
                  type="number"
                  step="0.1"
                />
                {errors.laadDrempelCent && <ErrorLabel>{errors.laadDrempelCent}</ErrorLabel>}
              </div>
          <div>
                <Label>Ontlaaddrempel (ct/kWh)</Label>
              <Input
                  value={data.ontlaadDrempelCent}
                  onChange={event => onChange('ontlaadDrempelCent', event.target.value)}
                type="number"
                  step="0.1"
                />
                {errors.ontlaadDrempelCent && <ErrorLabel>{errors.ontlaadDrempelCent}</ErrorLabel>}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
              <Label htmlFor="maandelijkseVergoeding">Maandelijkse vergoeding dynamisch (€/maand)</Label>
              <Input
                id="maandelijkseVergoeding"
                value={data.maandelijkseVergoeding}
                onChange={event => onChange('maandelijkseVergoeding', event.target.value)}
                type="number"
                step="0.1"
              />
              {errors.maandelijkseVergoeding && <ErrorLabel>{errors.maandelijkseVergoeding}</ErrorLabel>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Info className="h-4 w-4 text-orange-500" />
              Controleer je invoer
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {summaryItems.map(item => (
                <li key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </li>
                ))}
              </ul>
            </div>
          </div>
      </div>
    </div>
  );
}

interface WizardNavigationProps {
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function WizardNavigation({
  isFirst,
  isLast,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}: WizardNavigationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {!isFirst && (
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige stap
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
        {!isLast && (
          <Button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
          >
            Volgende stap
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {isLast && (
      <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
            Berekenen...
          </>
        ) : (
          <>
                <Battery className="h-4 w-4" />
                Bereken terugverdientijd
          </>
        )}
      </Button>
        )}
      </div>
    </div>
  );
}

function ErrorLabel({ children }: { children: string }) {
  return <p className="mt-1 text-xs font-medium text-red-600">{children}</p>;
}

