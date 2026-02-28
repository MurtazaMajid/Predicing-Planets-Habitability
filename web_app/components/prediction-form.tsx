'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

interface FeatureConfig {
  id: string;
  label: string;
  shortDescription: string;
  detailedDescription: string;
  scoreInterpretation: string;
  placeholder: string;
  maxScore: number;
}

interface PredictionFormProps {
  onSubmit: (values: {
    stellarTemperatureScore: number;
    stellarRadiusScore: number;
    planetRadiusScore: number;
    insolationScore: number;
    orbitalPeriodScore: number;
    equilibriumTemperatureScore: number;
  }) => Promise<void>;
  loading: boolean;
}

const features: FeatureConfig[] = [
  {
    id: 'stellarTemperatureScore',
    label: 'Stellar Temperature Score',
    shortDescription: 'How similar the star\'s temperature is to the Sun (1-100) — Press the info icon for detailed explanation',
    detailedDescription: 'This score evaluates how close the star\'s effective temperature is to the Sun (~5778 K). Stellar temperature determines radiation intensity, habitable zone location, and long-term climate stability. Extremely hot stars emit high-energy radiation that can strip atmospheres, while very cool stars may cause tidal locking and unstable climates.',
    scoreInterpretation: '0–30: Extreme temperatures, hostile radiation\n30–70: Moderately suitable but not solar-like\n70–100: Sun-like temperature and stable radiation',
    placeholder: 'e.g. 75',
    maxScore: 100,
  },
  {
    id: 'stellarRadiusScore',
    label: 'Stellar Radius Score',
    shortDescription: 'How similar the star\'s size is to the Sun (1-100) — Press the info icon for detailed explanation',
    detailedDescription: 'This score compares the star\'s radius to the Sun\'s radius. Stellar size influences luminosity stability and lifespan. Large stars evolve rapidly and may not remain stable long enough for life to develop. Very small stars can produce strong flare activity.',
    scoreInterpretation: '0–30: Star significantly larger or smaller than Sun\n30–70: Moderately comparable\n70–100: Solar-sized and stable',
    placeholder: 'e.g. 80',
    maxScore: 100,
  },
  {
    id: 'planetRadiusScore',
    label: 'Planet Radius Score',
    shortDescription: 'How close the planet\'s size is to Earth (1-100) — Press the info icon for detailed explanation',
    detailedDescription: 'Planet size affects gravity, atmospheric retention, and composition. Extremely large planets are likely gas giants without solid surfaces. Very small planets may not retain thick atmospheres. Earth-sized rocky planets score highest because they are most likely to support surface liquid water.',
    scoreInterpretation: '0–30: Likely gas giant or very small rocky body\n30–70: Possibly rocky but not Earth-sized\n70–100: Earth-sized rocky planet',
    placeholder: 'e.g. 85',
    maxScore: 100,
  },
  {
    id: 'insolationScore',
    label: 'Insolation Score',
    shortDescription: 'How much stellar energy the planet receives (1-100) — Press the info icon for detailed explanation',
    detailedDescription: 'Insolation represents the amount of radiation reaching the planet from its host star. It directly affects surface temperature and climate. Too much radiation leads to runaway greenhouse heating; too little results in global freezing.',
    scoreInterpretation: '0–30: Extreme heating or freezing\n30–70: Borderline habitable energy levels\n70–100: Earth-like radiation levels',
    placeholder: 'e.g. 70',
    maxScore: 100,
  },
  {
    id: 'orbitalPeriodScore',
    label: 'Orbital Period Score',
    shortDescription: 'How Earth-like the planet\'s orbital duration is (1-50) — Press the info icon for detailed explanation',
    detailedDescription: 'This score evaluates how close the planet\'s orbital period is to Earth\'s (~365 days). Orbital duration influences seasonal cycles, climate regulation, and long-term environmental stability. Extremely short or long orbital periods can produce unstable temperature conditions.',
    scoreInterpretation: '0–15: Extreme orbit, unstable seasonal patterns\n15–35: Moderately stable orbital cycle\n35–50: Earth-like seasonal cycle',
    placeholder: 'e.g. 40',
    maxScore: 50,
  },
  {
    id: 'equilibriumTemperatureScore',
    label: 'Equilibrium Temperature Score',
    shortDescription: 'How suitable the planet\'s baseline temperature is for liquid water (1-70) — Press the info icon for detailed explanation',
    detailedDescription: 'This score represents the planet\'s equilibrium temperature based on stellar radiation and orbital distance, assuming no atmospheric effects. It provides a baseline thermal estimate. Temperatures near Earth\'s equilibrium temperature are more likely to support liquid water.',
    scoreInterpretation: '0–20: Too hot or too cold for liquid water\n20–50: Possibly within habitable limits\n50–70: Close to Earth-like temperature',
    placeholder: 'e.g. 55',
    maxScore: 70,
  },
];

export function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [values, setValues] = useState({
    stellarTemperatureScore: '',
    stellarRadiusScore: '',
    planetRadiusScore: '',
    insolationScore: '',
    orbitalPeriodScore: '',
    equilibriumTemperatureScore: '',
  });
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    features.forEach((feature) => {
      const value = values[feature.id as keyof typeof values];
      if (!value) {
        newErrors[feature.id] = 'Required';
      } else {
        const num = parseFloat(value);
        if (isNaN(num) || num < 1 || num > feature.maxScore) {
          newErrors[feature.id] = `Enter a number between 1 and ${feature.maxScore}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit({
      stellarTemperatureScore: parseFloat(values.stellarTemperatureScore),
      stellarRadiusScore: parseFloat(values.stellarRadiusScore),
      planetRadiusScore: parseFloat(values.planetRadiusScore),
      insolationScore: parseFloat(values.insolationScore),
      orbitalPeriodScore: parseFloat(values.orbitalPeriodScore),
      equilibriumTemperatureScore: parseFloat(values.equilibriumTemperatureScore),
    });
  };

  return (
    <Card className="border-2 border-purple-500/40 bg-gradient-to-br from-slate-900/40 to-slate-800/40 shadow-lg shadow-purple-500/20 overflow-hidden h-full flex flex-col backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 pointer-events-none" />

      <div className="relative p-6 lg:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">
            Planet Features
          </h2>
          <p className="text-sm text-slate-300 mt-1">Enter all 6 planetary characteristics for accurate prediction</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
          <div className="space-y-5 flex-1">
            {features.map((feature) => (
              <div key={feature.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <label htmlFor={feature.id} className="text-sm font-semibold text-white">
                    {feature.label}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === feature.id ? null : feature.id)}
                      className="ml-2 p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === feature.id && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">{feature.label}</p>
                        <p className="mb-3">{feature.detailedDescription}</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Ranges:</p>
                        <p className="whitespace-pre-line text-slate-300">{feature.scoreInterpretation}</p>
                        <p className="mt-2 text-cyan-400">Max Score: {feature.maxScore}</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">{feature.shortDescription}</p>
                <div className="relative">
                  <Input
                    id={feature.id}
                    type="number"
                    name={feature.id}
                    value={values[feature.id as keyof typeof values]}
                    onChange={handleChange}
                    placeholder={feature.placeholder}
                    min="1"
                    max={feature.maxScore}
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/30"
                    disabled={loading}
                  />
                  {errors[feature.id] && (
                    <p className="text-xs text-red-400 mt-1">{errors[feature.id]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 mt-auto"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Predict Habitability</>
            )}
          </button>
        </form>
      </div>
    </Card>
  );
}
