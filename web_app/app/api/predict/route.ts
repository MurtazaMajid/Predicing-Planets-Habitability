import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

/**
 * Real ML Model Prediction via Python
 * Loads the joblib model from GitHub and makes predictions
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
    // Path to the Python prediction script
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_habitability.py');

    // Build command with feature arguments (6 features)
    const cmd = `python3 "${scriptPath}" ${features.stellarTemperatureScore} ${features.stellarRadiusScore} ${features.planetRadiusScore} ${features.insolationScore} ${features.orbitalPeriodScore} ${features.equilibriumTemperatureScore}`;

    console.log('[v0] Executing Python prediction script...');
    const { stdout, stderr } = await execPromise(cmd, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Log stderr for debugging
    if (stderr) {
      console.log('[v0] Python script stderr:', stderr);
    }

    // Parse the JSON response from Python script
    const result = JSON.parse(stdout);

    if (!result.success && result.error) {
      throw new Error(result.error);
    }

    return result.habitability_score;
  } catch (error) {
    console.error('[v0] Python model error:', error);
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
