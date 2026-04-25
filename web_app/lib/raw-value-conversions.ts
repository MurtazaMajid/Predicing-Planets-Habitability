/**
 * Raw Value to Habitability Score Conversion Functions
 * Based on Gaussian scoring from NASA exoplanet data analysis
 */

/**
 * Convert Stellar Temperature (Kelvin) to Habitability Score
 * Ideal: 5778K (Sun's effective temperature)
 */
export function convertStellarTemperature(tempKelvin: number): number {
  const idealCenter = 5778; // Sun's effective temperature
  const spread = 800; // Tolerance range

  // Gaussian scoring
  const score = 100 * Math.exp(-Math.pow(tempKelvin - idealCenter, 2) / (2 * Math.pow(spread, 2)));

  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

/**
 * Convert Stellar Radius (Solar Radii) to Habitability Score
 * Ideal: 1.0 solar radius (Sun-like)
 */
export function convertStellarRadius(solarRadii: number): number {
  const ideal = 1.0;
  const spread = 0.5; // Sensitivity around ideal

  // Gaussian scoring
  const score = 90 * Math.exp(-Math.pow(solarRadii - ideal, 2) / (2 * Math.pow(spread, 2)));

  return Math.max(0, Math.min(90, Math.round(score * 100) / 100));
}

/**
 * Convert Planet Radius (Earth Radii) to Habitability Score
 * Ideal: 1.0 Earth radius
 */
export function convertPlanetRadius(earthRadii: number): number {
  const ideal = 1.0;
  const sigma = 0.8; // Width factor (tolerance ~0.8 R⊕)

  // Gaussian decay from ideal value
  const score = 70 * Math.exp(-0.5 * Math.pow((earthRadii - ideal) / sigma, 2));

  return Math.max(0, Math.round(score * 100) / 100);
}

/**
 * Convert Insolation (Earth Flux) to Habitability Score
 * Ideal: 1.0 (Earth-like stellar flux)
 * Uses log-space Gaussian
 */
export function convertInsolation(earthFlux: number): number {
  if (earthFlux <= 0) return 0;

  const ideal = 1.0;
  const sigma = 0.5; // Width of habitable zone

  // Log-space difference
  const logDiff = Math.log(earthFlux / ideal);

  // Gaussian score (scaled 0-70)
  const score = 70 * Math.exp(-Math.pow(logDiff, 2) / (2 * Math.pow(sigma, 2)));

  return Math.max(0, Math.round(score * 100) / 100);
}

/**
 * Convert Orbital Period (Earth Days) to Habitability Score
 * Ideal: 365 days (1 year like Earth)
 * Uses log-space Gaussian
 */
export function convertOrbitalPeriod(days: number): number {
  if (days <= 0) return 0;

  const periodIdeal = 365.0;
  const periodSigmaLog = Math.log(2); // Log-space standard deviation

  // Distance in log space
  const logDiff = Math.log(days / periodIdeal);

  // Gaussian decay
  const raw = Math.exp(-0.5 * Math.pow(logDiff / periodSigmaLog, 2));
  const score = 50 * raw;

  return Math.max(0, Math.round(score * 100) / 100);
}

/**
 * Convert Equilibrium Temperature (Kelvin) to Habitability Score
 * Ideal: 288K (Earth's average temperature)
 * Uses log-space Gaussian
 */
export function convertEquilibriumTemperature(tempKelvin: number): number {
  if (tempKelvin <= 0 || isNaN(tempKelvin)) return 0;

  const ideal = 288; // Earth's average temperature
  const sigma = 0.4; // Log-space sigma
  const maxPoints = 70;

  // Log-space difference
  const logDiff = Math.log(tempKelvin / ideal);

  // Gaussian score
  const score = maxPoints * Math.exp(-Math.pow(logDiff, 2) / (2 * Math.pow(sigma, 2)));

  return Math.max(0, Math.round(score * 100) / 100);
}

/**
 * Convert all raw values to habitability scores
 */
export function convertRawValuesToScores(rawValues: {
  stellarTemperature: number;
  stellarRadius: number;
  planetRadius: number;
  insolation: number;
  orbitalPeriod: number;
  equilibriumTemperature: number;
}) {
  return {
    stellarTemperatureScore: convertStellarTemperature(rawValues.stellarTemperature),
    stellarRadiusScore: convertStellarRadius(rawValues.stellarRadius),
    planetRadiusScore: convertPlanetRadius(rawValues.planetRadius),
    insolationScore: convertInsolation(rawValues.insolation),
    orbitalPeriodScore: convertOrbitalPeriod(rawValues.orbitalPeriod),
    equilibriumTemperatureScore: convertEquilibriumTemperature(rawValues.equilibriumTemperature),
  };
}
