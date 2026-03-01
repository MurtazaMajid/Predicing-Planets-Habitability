import { NextRequest, NextResponse } from 'next/server';

/**
 * Call the real Hugging Face Space XGBoost model
 */
async function predictWithRealModel(features: {
  stellarTemperatureScore: number;
  stellarRadiusScore: number;
  planetRadiusScore: number;
  insolationScore: number;
  orbitalPeriodScore: number;
  equilibriumTemperatureScore: number;
}): Promise<number> {
  try {
    console.log('[v1] Sending features to Hugging Face Space:', features);

    const hfApiUrl = 'https://murtazamajid-planet-habitability-api.hf.space';

    const response = await fetch(`${hfApiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stellar_temperature_score: features.stellarTemperatureScore,
        stellar_radius_score: features.stellarRadiusScore,
        planet_radius_score: features.planetRadiusScore,
        insolation_score: features.insolationScore,
        orbital_period_score: features.orbitalPeriodScore,
        equilibrium_temperature_score: features.equilibriumTemperatureScore,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json() as { habitability_score?: number; score?: number };
    const prediction = result.habitability_score ?? result.score;

    if (typeof prediction !== 'number') {
      throw new Error('Invalid response format from Hugging Face API');
    }

    console.log('[v1] Real model prediction:', prediction);
    return prediction;

  } catch (error) {
    console.error('[v1] Real model failed:', error);
    throw error;
  }
}

/**
 * Mock fallback model (used if real model fails)
 */
function mockPredictHabitability(features: {
  stellarTemperatureScore: number;
  stellarRadiusScore: number;
  planetRadiusScore: number;
  insolationScore: number;
  orbitalPeriodScore: number;
  equilibriumTemperatureScore: number;
}): number {
  const normalizedOrbital = (features.orbitalPeriodScore / 50) * 100;
  const normalizedEquilibrium = (features.equilibriumTemperatureScore / 70) * 100;

  const weights = {
    stellarTemperature: 0.18,
    stellarRadius: 0.18,
    planetRadius: 0.18,
    insolation: 0.18,
    orbitalPeriod: 0.16,
    equilibriumTemp: 0.12,
  };

  let score =
    features.stellarTemperatureScore * weights.stellarTemperature +
    features.stellarRadiusScore * weights.stellarRadius +
    features.planetRadiusScore * weights.planetRadius +
    features.insolationScore * weights.insolation +
    normalizedOrbital * weights.orbitalPeriod +
    normalizedEquilibrium * weights.equilibriumTemp;

  // Small non-linear adjustments
  score -= Math.abs(features.equilibriumTemperatureScore - 55) * 0.15;
  score -= Math.abs(features.insolationScore - 70) * 0.1;

  // Add minor randomness
  score += (Math.random() - 0.5) * 4;

  return Math.max(0, Math.min(100, score));
}

/**
 * Next.js API Route
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stellarTemperatureScore,
      stellarRadiusScore,
      planetRadiusScore,
      insolationScore,
      orbitalPeriodScore,
      equilibriumTemperatureScore,
    } = body;

    // Validate input types
    if (
      typeof stellarTemperatureScore !== 'number' ||
      typeof stellarRadiusScore !== 'number' ||
      typeof planetRadiusScore !== 'number' ||
      typeof insolationScore !== 'number' ||
      typeof orbitalPeriodScore !== 'number' ||
      typeof equilibriumTemperatureScore !== 'number'
    ) {
      return NextResponse.json(
        { error: 'All 6 features must be numbers' },
        { status: 400 }
      );
    }

    // Validate ranges
    if (
      stellarTemperatureScore < 1 || stellarTemperatureScore > 100 ||
      stellarRadiusScore < 1 || stellarRadiusScore > 100 ||
      planetRadiusScore < 1 || planetRadiusScore > 100 ||
      insolationScore < 1 || insolationScore > 100 ||
      orbitalPeriodScore < 1 || orbitalPeriodScore > 50 ||
      equilibriumTemperatureScore < 1 || equilibriumTemperatureScore > 70
    ) {
      return NextResponse.json(
        { error: 'Feature values out of valid ranges' },
        { status: 400 }
      );
    }

    const features = {
      stellarTemperatureScore,
      stellarRadiusScore,
      planetRadiusScore,
      insolationScore,
      orbitalPeriodScore,
      equilibriumTemperatureScore,
    };

    let prediction: number;
    let modelSource = 'real';

    try {
      prediction = await predictWithRealModel(features);
    } catch {
      prediction = mockPredictHabitability(features);
      modelSource = 'mock';
    }

    return NextResponse.json({
      habitabilityScore: Math.round(prediction * 100) / 100,
      modelSource,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[v1] Prediction route failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}