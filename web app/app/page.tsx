'use client';

import { useState, useEffect } from 'react';
import { Starfield } from '@/components/starfield';
import { PredictionForm } from '@/components/prediction-form';
import { PredictionResult } from '@/components/prediction-result';

export default function Home() {
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<{
    stellarTemperatureScore: number;
    stellarRadiusScore: number;
    planetRadiusScore: number;
    insolationScore: number;
    orbitalPeriodScore: number;
    equilibriumTemperatureScore: number;
  } | null>(null);

  const handlePredict = async (values: {
    stellarTemperatureScore: number;
    stellarRadiusScore: number;
    planetRadiusScore: number;
    insolationScore: number;
    orbitalPeriodScore: number;
    equilibriumTemperatureScore: number;
  }) => {
    setLoading(true);
    setError(null);
    setFeatures(values);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setResult(data.habitabilityScore);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Starfield />

      <main className="min-h-screen relative z-10 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-transparent backdrop-blur-md py-6 lg:py-8 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent glow-text">Can Life Exist on the Planet?</h1>
            </div>
            <p className="text-slate-300 text-sm lg:text-base">ML-powered habitability prediction</p>
          </div>
        </header>

        {/* Main Content */}
        <section className="flex-1 flex items-center justify-center py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <p className="font-semibold">Error: {error}</p>
              </div>
            )}

            {/* Grid Layout - Equal Height Containers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Form Section */}
              <div className="flex flex-col">
                <PredictionForm onSubmit={handlePredict} loading={loading} />
              </div>

              {/* Result Section */}
              <div className="flex flex-col">
                <PredictionResult score={result} loading={loading} submitted={submitted} features={features || undefined} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 bg-gradient-to-t from-slate-900/50 to-transparent py-6 text-center text-xs text-slate-400">
          <p>ML Model | Habitability Prediction System</p>
        </footer>
      </main>
    </>
  );
}
