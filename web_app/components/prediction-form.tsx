'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, AlertCircle, ChevronDown } from 'lucide-react';
import { convertRawValuesToScores } from '@/lib/raw-value-conversions';

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
  const [inputMode, setInputMode] = useState<'score' | 'raw'>('score');
  const [values, setValues] = useState({
    stellarTemperatureScore: '',
    stellarRadiusScore: '',
    planetRadiusScore: '',
    insolationScore: '',
    orbitalPeriodScore: '',
    equilibriumTemperatureScore: '',
  });
  const [rawValues, setRawValues] = useState({
    stellarTemperature: '5778',
    stellarRadius: '1.0',
    planetRadius: '1.0',
    insolation: '1.0',
    orbitalPeriod: '365',
    equilibriumTemperature: '288',
  });
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  const handleRawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRawValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === 'score') {
      if (!validateForm()) return;

      await onSubmit({
        stellarTemperatureScore: parseFloat(values.stellarTemperatureScore),
        stellarRadiusScore: parseFloat(values.stellarRadiusScore),
        planetRadiusScore: parseFloat(values.planetRadiusScore),
        insolationScore: parseFloat(values.insolationScore),
        orbitalPeriodScore: parseFloat(values.orbitalPeriodScore),
        equilibriumTemperatureScore: parseFloat(values.equilibriumTemperatureScore),
      });
    } else {
      // Convert raw values to scores
      try {
        const scores = convertRawValuesToScores({
          stellarTemperature: parseFloat(rawValues.stellarTemperature),
          stellarRadius: parseFloat(rawValues.stellarRadius),
          planetRadius: parseFloat(rawValues.planetRadius),
          insolation: parseFloat(rawValues.insolation),
          orbitalPeriod: parseFloat(rawValues.orbitalPeriod),
          equilibriumTemperature: parseFloat(rawValues.equilibriumTemperature),
        });

        await onSubmit(scores);
      } catch (error) {
        setErrors({
          form: 'Invalid raw values. Please check your inputs.',
        });
      }
    }
  };

  return (
    <Card className="border-2 border-purple-500/40 bg-gradient-to-br from-slate-900/40 to-slate-800/40 shadow-lg shadow-purple-500/20 overflow-hidden h-full flex flex-col backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 pointer-events-none" />

      <div className="relative p-6 lg:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">
              Planet Features
            </h2>
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Learn how habitability is calculated"
            >
              <Info className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
            </button>
          </div>
          <p className="text-sm text-slate-300 mt-1">Enter all 6 planetary characteristics for accurate prediction</p>
          
          {/* Mode Selection Tabs */}
          <div className="flex gap-2 border-b border-slate-700/50 mt-6">
            <button
              onClick={() => setInputMode('score')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                inputMode === 'score'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Habitability Scores
            </button>
            <button
              onClick={() => setInputMode('raw')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                inputMode === 'raw'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Raw Astronomical Values
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
          {inputMode === 'score' ? (
            /* Score Input Mode */
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
          ) : (
            /* Raw Values Input Mode */
            <div className="space-y-5 flex-1">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-300">
                  <p className="font-semibold mb-1">Enter Real Astronomical Values</p>
                  <p>Values are automatically converted to habitability scores using scientific models. (Earth reference values shown)</p>
                </div>
              </div>

              {/* Expandable Info Box */}
              <button
                type="button"
                onClick={() => setInfoExpanded(!infoExpanded)}
                className="w-full flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-left">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-300">How Raw Values Are Converted to Scores</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${infoExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded Info Content */}
              {infoExpanded && (
                <div className="p-4 bg-slate-800/20 border border-slate-700/50 rounded-lg space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Stellar Temperature:</p>
                    <p className="text-xs text-slate-400">Uses Gaussian scoring centered at 5778 K (Sun). Ideal range: 5000-6500 K = highest score.</p>
                    <p className="text-xs text-slate-400">Example: 5778 K → Score 100 | 7000 K → Score 60 | 3500 K → Score 15</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Stellar Radius:</p>
                    <p className="text-xs text-slate-400">Gaussian scoring centered at 1.0 solar radii. Ideal: Sun-like size for stable habitable zones.</p>
                    <p className="text-xs text-slate-400">Example: 1.0 R☉ → Score 90 | 1.5 R☉ → Score 50 | 0.5 R☉ → Score 30</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Planet Radius:</p>
                    <p className="text-xs text-slate-400">Gaussian scoring centered at 1.0 Earth radii. Earth-like size most suitable for life.</p>
                    <p className="text-xs text-slate-400">Example: 1.0 R⊕ → Score 70 | 1.5 R⊕ → Score 30 | 2.5 R⊕ → Score 5</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Insolation (Stellar Flux):</p>
                    <p className="text-xs text-slate-400">Log-space Gaussian scoring centered at 1.0 Earth flux. Maintains liquid water on surface.</p>
                    <p className="text-xs text-slate-400">Example: 1.0 → Score 100 | 2.0 → Score 50 | 0.5 → Score 40</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Orbital Period:</p>
                    <p className="text-xs text-slate-400">Log-space Gaussian scoring centered at 365 days (Earth year). Similar year length preferred.</p>
                    <p className="text-xs text-slate-400">Example: 365 days → Score 50 | 180 days → Score 35 | 730 days → Score 20</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Equilibrium Temperature:</p>
                    <p className="text-xs text-slate-400">Log-space Gaussian scoring centered at 288 K (Earth temp). Habitable zone: 250-350 K.</p>
                    <p className="text-xs text-slate-400">Example: 288 K → Score 70 | 250 K → Score 40 | 400 K → Score 10</p>
                  </div>
                </div>
              )}

              {/* Raw Values Fields */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Stellar Temperature (K)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === 'raw_stellarTemp' ? null : 'raw_stellarTemp')}
                      className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === 'raw_stellarTemp' && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">Stellar Temperature (Kelvin)</p>
                        <p className="mb-3">The surface temperature of the star. This determines the type of radiation emitted, which affects the habitable zone location and planet's energy balance.</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Conversion (Gaussian):</p>
                        <p className="text-slate-300 mb-2">5778 K → Score 100 | 7000 K → Score 60 | 3500 K → Score 15</p>
                        <p className="font-semibold text-cyan-300 mb-1">Ideal Range:</p>
                        <p className="text-slate-300">5000-6500 K (Sun-like stars)</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Earth's Sun: 5778 K | Hot star: 7000+ K | Cool star: 3500 K</p>
                <Input
                  type="number"
                  name="stellarTemperature"
                  value={rawValues.stellarTemperature}
                  onChange={handleRawChange}
                  placeholder="e.g. 5778"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Stellar Radius (Solar Radii)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === 'raw_stellarRad' ? null : 'raw_stellarRad')}
                      className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === 'raw_stellarRad' && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">Stellar Radius (Solar Radii)</p>
                        <p className="mb-3">The size of the star compared to our Sun. Larger stars have different habitable zone distances and provide different energy outputs over their lifetimes.</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Conversion (Gaussian):</p>
                        <p className="text-slate-300 mb-2">1.0 R☉ → Score 90 | 1.5 R☉ → Score 50 | 0.5 R☉ → Score 30</p>
                        <p className="font-semibold text-cyan-300 mb-1">Ideal Range:</p>
                        <p className="text-slate-300">0.8-1.2 Solar Radii</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Earth's Sun: 1.0 | Larger star: 1.5+ | Smaller star: 0.5</p>
                <Input
                  type="number"
                  name="stellarRadius"
                  value={rawValues.stellarRadius}
                  onChange={handleRawChange}
                  placeholder="e.g. 1.0"
                  step="0.1"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Planet Radius (Earth Radii)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === 'raw_planetRad' ? null : 'raw_planetRad')}
                      className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === 'raw_planetRad' && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">Planet Radius (Earth Radii)</p>
                        <p className="mb-3">The size of the planet relative to Earth. This affects surface gravity, atmospheric retention, and geological activity needed for habitability.</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Conversion (Gaussian):</p>
                        <p className="text-slate-300 mb-2">1.0 R⊕ → Score 70 | 1.5 R⊕ → Score 30 | 2.5 R⊕ → Score 5</p>
                        <p className="font-semibold text-cyan-300 mb-1">Ideal Range:</p>
                        <p className="text-slate-300">0.8-1.5 Earth Radii</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Earth: 1.0 | Super-Earth: 1.5-2.0 | Mini-Neptune: 2.5+</p>
                <Input
                  type="number"
                  name="planetRadius"
                  value={rawValues.planetRadius}
                  onChange={handleRawChange}
                  placeholder="e.g. 1.0"
                  step="0.1"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Insolation (Earth Flux)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === 'raw_insolation' ? null : 'raw_insolation')}
                      className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === 'raw_insolation' && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">Insolation (Earth Flux)</p>
                        <p className="mb-3">The amount of stellar radiation received by the planet. Controls surface temperature and determines if liquid water can exist, critical for life.</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Conversion (Log-space Gaussian):</p>
                        <p className="text-slate-300 mb-2">1.0 → Score 100 | 2.0 → Score 50 | 0.5 → Score 40</p>
                        <p className="font-semibold text-cyan-300 mb-1">Ideal Range:</p>
                        <p className="text-slate-300">0.25-4.0 Earth Flux (habitable zone)</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Earth: 1.0 | More radiation: 2.0+ | Less radiation: 0.5</p>
                <Input
                  type="number"
                  name="insolation"
                  value={rawValues.insolation}
                  onChange={handleRawChange}
                  placeholder="e.g. 1.0"
                  step="0.1"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Orbital Period (Days)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === 'raw_period' ? null : 'raw_period')}
                      className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === 'raw_period' && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">Orbital Period (Days)</p>
                        <p className="mb-3">How long it takes the planet to complete one orbit around its star. Affects seasonal cycles and climate stability important for life.</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Conversion (Log-space Gaussian):</p>
                        <p className="text-slate-300 mb-2">365 days → Score 50 | 180 days → Score 35 | 730 days → Score 20</p>
                        <p className="font-semibold text-cyan-300 mb-1">Ideal Range:</p>
                        <p className="text-slate-300">200-500 days (similar to Earth)</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Earth: 365 days | Shorter orbit: 100-200 days | Longer orbit: 500-1000 days</p>
                <Input
                  type="number"
                  name="orbitalPeriod"
                  value={rawValues.orbitalPeriod}
                  onChange={handleRawChange}
                  placeholder="e.g. 365"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Equilibrium Temperature (K)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTooltipOpen(tooltipOpen === 'raw_teq' ? null : 'raw_teq')}
                      className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                    </button>
                    {tooltipOpen === 'raw_teq' && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-lg p-4 text-xs text-slate-200">
                        <p className="font-semibold text-cyan-400 mb-2">Equilibrium Temperature (Kelvin)</p>
                        <p className="mb-3">The theoretical surface temperature of a planet if it were in thermal equilibrium with its star. Indicates whether the planet can support liquid water.</p>
                        <p className="font-semibold text-cyan-300 mb-1">Score Conversion (Log-space Gaussian):</p>
                        <p className="text-slate-300 mb-2">288 K → Score 70 | 250 K → Score 40 | 400 K → Score 10</p>
                        <p className="font-semibold text-cyan-300 mb-1">Habitable Zone:</p>
                        <p className="text-slate-300">250-350 K (liquid water possible)</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Earth: 288 K | Hot planet: 350+ K | Cold planet: 200 K</p>
                <Input
                  type="number"
                  name="equilibriumTemperature"
                  value={rawValues.equilibriumTemperature}
                  onChange={handleRawChange}
                  placeholder="e.g. 288"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  disabled={loading}
                />
              </div>

              {errors.form && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-400">{errors.form}</p>
                </div>
              )}
            </div>
          )}

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

      {/* Info Modal Popup */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-cyan-400">Understanding Habitability Scoring</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Habitability Scores Section */}
              <div>
                <h4 className="text-lg font-bold text-purple-400 mb-3">Habitability Scores (1-100)</h4>
                <p className="text-sm text-slate-300 mb-4">
                  Direct scoring from 1 to 100, where higher scores indicate better habitability. Each parameter is pre-evaluated on a 0-100 scale.
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-300 mb-1">Stellar Temperature (1-100)</p>
                    <p className="text-xs text-slate-400">Ideal: 50-100. Sun-like stars (5000-6500K) provide stable, habitable zones.</p>
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-300 mb-1">Stellar Radius (1-100)</p>
                    <p className="text-xs text-slate-400">Ideal: 50-100. Sun-sized stars are better for maintaining habitable zones over time.</p>
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-300 mb-1">Planet Radius (1-100)</p>
                    <p className="text-xs text-slate-400">Ideal: 60-100. Earth-sized planets have optimal gravity and atmospheric retention.</p>
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-300 mb-1">Insolation (1-100)</p>
                    <p className="text-xs text-slate-400">Ideal: 40-100. Energy received from the star should allow liquid water on surface.</p>
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-300 mb-1">Orbital Period (1-100)</p>
                    <p className="text-xs text-slate-400">Ideal: 30-70. Earth-like year lengths provide seasonal stability for life.</p>
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-purple-300 mb-1">Equilibrium Temperature (1-100)</p>
                    <p className="text-xs text-slate-400">Ideal: 50-100. Surface temperature should support liquid water (250-350K).</p>
                  </div>
                </div>
              </div>

              {/* Raw Values Section */}
              <div className="border-t border-slate-700/50 pt-6">
                <h4 className="text-lg font-bold text-cyan-400 mb-3">Raw Astronomical Values</h4>
                <p className="text-sm text-slate-300 mb-4">
                  Enter actual astronomical measurements. These are automatically converted to habitability scores using scientific models.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Stellar Temperature (Kelvin)</p>
                    <p className="text-xs text-slate-400">Earth's Sun: 5778 K | Gaussian scoring peaks at 5778 K</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Stellar Radius (Solar Radii)</p>
                    <p className="text-xs text-slate-400">Earth's Sun: 1.0 | Gaussian scoring peaks at 1.0 solar radii</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Planet Radius (Earth Radii)</p>
                    <p className="text-xs text-slate-400">Earth: 1.0 | Gaussian scoring peaks at 1.0 Earth radii</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Insolation (Earth Flux)</p>
                    <p className="text-xs text-slate-400">Earth receives: 1.0 | Log-space Gaussian scoring peaks at 1.0</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Orbital Period (Days)</p>
                    <p className="text-xs text-slate-400">Earth year: 365 days | Log-space Gaussian scoring peaks at 365</p>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-cyan-300 mb-1">Equilibrium Temperature (Kelvin)</p>
                    <p className="text-xs text-slate-400">Earth's average: 288 K | Log-space Gaussian scoring peaks at 288 K</p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="border-t border-slate-700/50 pt-6">
                <h4 className="text-lg font-bold text-slate-300 mb-3">How It Works</h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-cyan-400">→</span>
                    <span><strong>Score Input:</strong> Manually enter pre-calculated scores (1-100 for each parameter)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">→</span>
                    <span><strong>Raw Values:</strong> Enter actual measurements and the system converts them to scores</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">→</span>
                    <span><strong>ML Model:</strong> All 6 scores are fed into an XGBoost model trained on NASA exoplanet data</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">→</span>
                    <span><strong>Prediction:</strong> The model outputs a final habitability score (0-100)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700/50 p-6">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
