import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

/**
 * Real ML Model Prediction using Hugging Face Space API
 * Calls the trained XGBoost model deployed on Hugging Face
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
    console.log('[v0] Calling Hugging Face Space API with real XGBoost model...');
    
    const hfApiUrl = 'https://murtazamajid-planet-habitability-api.hf.space';
    
    const response = await fetch(`${hfApiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stellarTemperatureScore: features.stellarTemperatureScore,
        stellarRadiusScore: features.stellarRadiusScore,
        planetRadiusScore: features.planetRadiusScore,
        insolationScore: features.insolationScore,
        orbitalPeriodScore: features.orbitalPeriodScore,
        equilibriumTemperatureScore: features.equilibriumTemperatureScore,
      }),
      timeout: 30000, // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json() as { habitability_score?: number; score?: number };
    const prediction = result.habitability_score || result.score;

    if (typeof prediction !== 'number') {
      throw new Error('Invalid response format from Hugging Face API');
    }

    console.log('[v0] Real XGBoost model prediction from HF:', prediction);
    return prediction;
  } catch (error) {
    console.error('[v0] Hugging Face API error:', error);
    throw error;
  }
}


/**
 * Fallback mock prediction model
 * Used if Python script fails (for development/testing)
 */
function mockPredictHabitability(features: {
  stellarTemperatureScore: number;
  stellarRadiusScore: number;
  planetRadiusScore: number;
  insolationScore: number;
  orbitalPeriodScore: number;
  equilibriumTemperatureScore: number;
}): number {
  // Normalize scores to 0-100 range for calculation
  // orbitalPeriodScore max is 50, equilibriumTemperatureScore max is 70
  const normalizedOrbitalPeriod = (features.orbitalPeriodScore / 50) * 100;
  const normalizedEquilibriumTemp = (features.equilibriumTemperatureScore / 70) * 100;

  // Weighted average of all 6 features
  const weights = {
    stellarTemperature: 0.18,
    stellarRadius: 0.18,
    planetRadius: 0.18,
    insolation: 0.18,
    orbitalPeriod: 0.16,
    equilibriumTemp: 0.12,
  };

  let baseScore =
    features.stellarTemperatureScore * weights.stellarTemperature +
    features.stellarRadiusScore * weights.stellarRadius +
    features.planetRadiusScore * weights.planetRadius +
    features.insolationScore * weights.insolation +
    normalizedOrbitalPeriod * weights.orbitalPeriod +
    normalizedEquilibriumTemp * weights.equilibriumTemp;

  // Apply some non-linear adjustments
  const temperatureFit = Math.abs(features.equilibriumTemperatureScore - 55); // Prefer around 55
  const insolationFit = Math.abs(features.insolationScore - 70); // Prefer around 70

  let finalScore = baseScore - temperatureFit * 0.15 - insolationFit * 0.1;
  finalScore += (Math.random() - 0.5) * 4; // Less randomness

  return Math.max(0, Math.min(100, finalScore));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input - 6 features required
    const {
      stellarTemperatureScore,
      stellarRadiusScore,
      planetRadiusScore,
      insolationScore,
      orbitalPeriodScore,
      equilibriumTemperatureScore,
    } = body;

    if (
      typeof stellarTemperatureScore !== 'number' ||
      typeof stellarRadiusScore !== 'number' ||
      typeof planetRadiusScore !== 'number' ||
      typeof insolationScore !== 'number' ||
      typeof orbitalPeriodScore !== 'number' ||
      typeof equilibriumTemperatureScore !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid input: all 6 features must be numbers' },
        { status: 400 }
      );
    }

    // Validate ranges - different max values for different features
    if (stellarTemperatureScore < 1 || stellarTemperatureScore > 100 ||
        stellarRadiusScore < 1 || stellarRadiusScore > 100 ||
        planetRadiusScore < 1 || planetRadiusScore > 100 ||
        insolationScore < 1 || insolationScore > 100 ||
        orbitalPeriodScore < 1 || orbitalPeriodScore > 50 ||
        equilibriumTemperatureScore < 1 || equilibriumTemperatureScore > 70) {
      return NextResponse.json(
        { error: 'Invalid feature ranges: Check input values (4 features 1-100, orbital period 1-50, equilibrium temp 1-70)' },
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

    // Try to use real model first
    try {
      console.log('[v0] Attempting to use real XGBoost model...');
      prediction = await predictWithRealModel(features);
      console.log('[v0] Real model prediction successful:', prediction);
    } catch (pythonError) {
      console.error('[v0] Real model failed with error:', pythonError);
      console.warn('[v0] Falling back to mock model...');
      prediction = mockPredictHabitability(features);
      modelSource = 'mock';
      console.log('[v0] Mock model prediction result:', prediction);
    }

    return NextResponse.json({
      habitabilityScore: Math.round(prediction * 100) / 100,
      modelSource,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
