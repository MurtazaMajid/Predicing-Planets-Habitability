'use client';

import { Card } from '@/components/ui/card';
import { Globe2 } from 'lucide-react';

interface PredictionResultProps {
  score: number | null;
  loading: boolean;
  submitted: boolean;
  features?: {
    stellarTemperatureScore: number;
    stellarRadiusScore: number;
    planetRadiusScore: number;
    insolationScore: number;
    orbitalPeriodScore: number;
    equilibriumTemperatureScore: number;
  };
  modelSource?: 'real' | 'mock' | null;
  debugMode?: boolean;
}

export function PredictionResult({ score, loading, submitted, features, modelSource, debugMode }: PredictionResultProps) {
  const getFeatureAnalysis = () => {
    if (!features) return null;

    const analysis = [];

    // Stellar Temperature Analysis
    if (features.stellarTemperatureScore >= 70) {
      analysis.push('✓ Star temperature is Sun-like, providing stable and predictable energy');
    } else if (features.stellarTemperatureScore >= 40) {
      analysis.push('⚠ Star temperature differs from the Sun, affecting habitable zone location');
    } else {
      analysis.push('✗ Star temperature is extreme, creating unstable radiation conditions');
    }

    // Stellar Radius Analysis
    if (features.stellarRadiusScore >= 70) {
      analysis.push('✓ Star size similar to Sun, ensuring long-term stability');
    } else if (features.stellarRadiusScore >= 40) {
      analysis.push('⚠ Star size differs from Sun, affecting lifespan and evolution timeline');
    } else {
      analysis.push('✗ Star is extremely large or small, creating instability concerns');
    }

    // Planet Radius Analysis
    if (features.planetRadiusScore >= 70) {
      analysis.push('✓ Planet size is Earth-like, supporting rocky surface and atmosphere');
    } else if (features.planetRadiusScore >= 40) {
      analysis.push('⚠ Planet size differs from Earth, may be super-Earth or mini-Neptune');
    } else {
      analysis.push('✗ Planet is likely gas giant or too small to retain atmosphere');
    }

    // Insolation Analysis
    if (features.insolationScore >= 60 && features.insolationScore <= 80) {
      analysis.push('✓ Energy balance optimal for liquid water and stable climate');
    } else if (features.insolationScore >= 40 && features.insolationScore <= 85) {
      analysis.push('⚠ Energy balance acceptable but may experience extreme seasons');
    } else {
      analysis.push('✗ Planet receives too much or too little stellar energy');
    }

    // Orbital Period Analysis
    if (features.orbitalPeriodScore >= 30) {
      analysis.push('✓ Orbital period creates stable seasonal cycles');
    } else if (features.orbitalPeriodScore >= 15) {
      analysis.push('⚠ Orbital period may cause unstable climate patterns');
    } else {
      analysis.push('✗ Extremely short or long orbit prevents climate stability');
    }

    // Equilibrium Temperature Analysis
    if (features.equilibriumTemperatureScore >= 40 && features.equilibriumTemperatureScore <= 65) {
      analysis.push('✓ Surface temperature potentially supports liquid water');
    } else if (features.equilibriumTemperatureScore >= 20 && features.equilibriumTemperatureScore <= 68) {
      analysis.push('⚠ Temperature is borderline for habitability');
    } else {
      analysis.push('✗ Temperature is too extreme for biochemical processes');
    }

    return analysis;
  };
  const getHabitabilityLevel = (score: number) => {
    if (score >= 85) {
      return {
        level: 'Highly Habitable - Exceptional',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        icon: '★★★★★',
        shortDesc: 'Excellent conditions for life',
        details: [
          'Strong potential for complex life forms including multicellular organisms',
          'Stellar and planetary characteristics closely resemble Earth\'s solar system',
          'Stable climate conditions within habitable zone parameters',
          'Optimal energy balance and atmospheric potential',
        ],
        verdict: 'This is a prime candidate for potential habitability with conditions similar to Earth'
      };
    }
    if (score >= 70) {
      return {
        level: 'Highly Habitable - Good',
        color: 'text-green-300',
        bg: 'bg-green-500/10',
        icon: '★★★★★',
        shortDesc: 'Very promising conditions',
        details: [
          'Suitable for microbial or primitive life forms',
          'Good alignment with habitable zone requirements',
          'Minor variations from ideal Earth-like conditions',
          'Moderate stability in long-term habitability',
        ],
        verdict: 'Strong potential for biological activity with existing life-supporting characteristics'
      };
    }
    if (score >= 60) {
      return {
        level: 'Potentially Habitable',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        icon: '★★★★☆',
        shortDesc: 'Moderate potential for life',
        details: [
          'Possible support for extremophile organisms',
          'Within acceptable habitability parameters but with challenges',
          'May have extreme temperature or radiation levels',
          'Requires further investigation for true assessment',
        ],
        verdict: 'Could potentially harbor simple life under specific conditions'
      };
    }
    if (score >= 40) {
      return {
        level: 'Marginally Habitable',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        icon: '★★★☆☆',
        shortDesc: 'Limited habitability potential',
        details: [
          'Exists at the edge of the habitable zone',
          'Significant environmental challenges for life',
          'Extreme conditions in temperature or stellar radiation',
          'Very low probability of biological activity',
        ],
        verdict: 'Unlikely to support life as we understand it'
      };
    }
    return {
      level: 'Not Habitable',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      icon: '★☆☆☆☆',
      shortDesc: 'No viable conditions for life',
      details: [
        'Planetary characteristics far outside habitable zone',
        'Extreme stellar or planetary conditions',
        'Insufficient atmospheric potential or protection',
        'No current scientific evidence supporting life possibility',
      ],
      verdict: 'This planet cannot support life under current scientific understanding'
    };
  };

  if (!submitted) {
    return (
      <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-slate-900/40 to-slate-800/40 shadow-lg shadow-cyan-500/20 flex flex-col items-center justify-center h-full overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />

        <div className="relative text-center space-y-4 p-6 lg:p-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/30 flex items-center justify-center animate-spin">
              <Globe2 className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-300">Prediction Result</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Enter planet features and click predict
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-2 border-cyan-500/40 bg-gradient-to-br from-slate-900/40 to-slate-800/40 shadow-lg shadow-cyan-500/20 flex flex-col items-center justify-center h-full overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />

        <div className="relative text-center space-y-4 p-6 lg:p-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-white glow-text">Analyzing...</h3>
          <p className="text-slate-400">Scanning planetary conditions</p>
        </div>
      </Card>
    );
  }

  if (score === null) {
    return null;
  }

  const habitability = getHabitabilityLevel(score);

  return (
    <Card className={`border-2 border-cyan-500/40 bg-gradient-to-br from-slate-900/40 to-slate-800/40 shadow-lg shadow-cyan-500/20 overflow-hidden h-full flex flex-col backdrop-blur-sm`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />

      <div className="relative p-6 lg:p-8 space-y-6 flex flex-col h-full">
        {/* Header */}
        <div>
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent glow-text">Prediction Result</h2>
          <p className="text-sm text-slate-300 mt-1">ML Model Analysis</p>
        </div>

        {/* Main Score Display */}
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="relative">
            <div className="text-center space-y-3">
              <div className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {score.toFixed(1)}
              </div>
              <p className="text-slate-400 text-sm">Habitability Score</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
          </div>

          {/* Habitability Level */}
          <div className={`p-4 rounded-lg border border-opacity-30 ${habitability.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Classification</p>
                <p className={`text-lg font-bold ${habitability.color}`}>{habitability.level}</p>
                <p className="text-xs text-slate-400 mt-1">{habitability.shortDesc}</p>
              </div>
              <span className="text-4xl ml-4">{habitability.icon}</span>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-3">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Analysis Breakdown</p>
            <div className="space-y-2">
              {habitability.details.map((detail, idx) => (
                <div key={idx} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 flex-shrink-0">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature-Based Analysis */}
          {features && (
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Planetary Characteristics Analysis</p>
              <div className="space-y-1.5">
                {getFeatureAnalysis()?.map((analysis, idx) => (
                  <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                    {analysis}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Final Verdict */}
          <div className={`p-4 rounded-lg border ${habitability.color.replace('text-', 'border-').replace('-400', '-500/40')} bg-gradient-to-r ${habitability.bg.replace('bg-', 'from-').replace('/10', '/5')} to-transparent`}>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Scientific Verdict</p>
            <p className={`text-sm font-semibold ${habitability.color}`}>
              {habitability.verdict}
            </p>
          </div>

          {/* Hidden Model Source Indicator - Only visible when debug mode is enabled (Press M 3 times) */}
          {debugMode && (
            <div className={`p-3 rounded-lg border ${modelSource === 'real' ? 'border-green-500/40 bg-green-500/5' : 'border-yellow-500/40 bg-yellow-500/5'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${modelSource === 'real' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <p className="text-xs font-semibold text-slate-300">
                  {modelSource === 'real' ? (
                    <>
                      <span className="text-green-400">✓ XGBoost ML Model</span> - Prediction made using your trained machine learning model from GitHub
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-400">⚠ Fallback Model</span> - Using mock prediction (real model temporarily unavailable)
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
