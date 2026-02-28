#!/usr/bin/env python3
"""
Habitability Prediction Model Script
Loads the trained XGBoost model, feature scaler, and makes predictions on planetary features.
User inputs are scaled before prediction.
"""

import sys
import json
import os
import urllib.request
from pathlib import Path

try:
    import joblib
    import numpy as np
except ImportError as e:
    print(json.dumps({
        "error": f"Missing required package: {str(e)}. Install with: pip install joblib scikit-learn numpy"
    }))
    sys.exit(1)


def download_file(url, cache_path, file_type="file"):
    """Download a file from GitHub if not cached"""
    if os.path.exists(cache_path):
        print(f"[v0] {file_type} already cached at {cache_path}", file=sys.stderr)
        return

    try:
        print(f"[v0] Downloading {file_type} from GitHub...", file=sys.stderr)
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        urllib.request.urlretrieve(url, cache_path, timeout=30)
        print(f"[v0] {file_type} downloaded to {cache_path}", file=sys.stderr)
    except Exception as e:
        raise Exception(f"Failed to download {file_type}: {str(e)}")


def load_model_and_scaler(model_cache_path, scaler_cache_path):
    """Load both the XGBoost model and feature scaler"""
    try:
        print(f"[v0] Loading model from {model_cache_path}...", file=sys.stderr)
        model = joblib.load(model_cache_path)
        print(f"[v0] Model loaded successfully", file=sys.stderr)
        
        print(f"[v0] Loading scaler from {scaler_cache_path}...", file=sys.stderr)
        scaler = joblib.load(scaler_cache_path)
        print(f"[v0] Scaler loaded successfully", file=sys.stderr)
        
        return model, scaler
    except Exception as e:
        raise Exception(f"Failed to load model/scaler: {str(e)}")


def predict(model, scaler, features):
    """
    Make prediction on planetary features with scaling
    
    User Input Features (in order):
    1. Stellar Temperature Score (1-100)
    2. Stellar Radius Score (1-100)
    3. Planet Radius Score (1-100)
    4. Insolation Score (1-100)
    5. Orbital Period Score (1-50)
    6. Equilibrium Temperature Score (1-70)
    
    The scaler transforms these user inputs to the model's expected scale.
    """
    try:
        # Convert features to numpy array
        X = np.array(features).reshape(1, -1)
        print(f"[v0] User input features: {features}", file=sys.stderr)
        print(f"[v0] Input shape before scaling: {X.shape}", file=sys.stderr)
        
        # Scale features using the fitted scaler
        X_scaled = scaler.transform(X)
        print(f"[v0] Features after scaling: {X_scaled[0].tolist()}", file=sys.stderr)
        
        # Make prediction on scaled features
        prediction = model.predict(X_scaled)
        score = float(prediction[0])
        
        # Clamp score between 0 and 100
        score = max(0, min(100, score))
        
        print(f"[v0] Prediction result: {score}", file=sys.stderr)
        return score
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")


def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 7:
        print(json.dumps({
            "error": "Missing arguments. Expected 6 features: stellar_temp star_radius planet_radius insolation orbital_period equilibrium_temp"
        }))
        sys.exit(1)
    
    try:
        # Parse input features - 6 features required
        features = [float(arg) for arg in sys.argv[1:7]]
        
        # Validate feature ranges with different max values
        ranges = [
            (1, 100, "Stellar Temperature"),
            (1, 100, "Stellar Radius"),
            (1, 100, "Planet Radius"),
            (1, 100, "Insolation"),
            (1, 50, "Orbital Period"),
            (1, 70, "Equilibrium Temperature")
        ]
        
        for i, (score, (min_val, max_val, name)) in enumerate(zip(features, ranges)):
            if score < min_val or score > max_val:
                print(json.dumps({
                    "error": f"Feature {i+1} ({name}) must be between {min_val} and {max_val}, got {score}"
                }))
                sys.exit(1)
        
        # GitHub raw content URLs for XGBoost model and scaler
        model_url = "https://raw.githubusercontent.com/MurtazaMajid/Predicing-Planets-Habitability/main/model/xgb_habitability_model.pkl"
        scaler_url = "https://raw.githubusercontent.com/MurtazaMajid/Predicing-Planets-Habitability/main/model/feature_scaler.pkl"
        
        # Cache paths
        cache_dir = Path.home() / ".cache" / "habitability_prediction"
        cache_dir.mkdir(parents=True, exist_ok=True)
        model_path = cache_dir / "xgb_habitability_model.pkl"
        scaler_path = cache_dir / "feature_scaler.pkl"
        
        # Download model and scaler (only downloads if not already cached)
        download_file(model_url, str(model_path), "XGBoost model")
        download_file(scaler_url, str(scaler_path), "Feature scaler")
        
        # Load model and scaler
        model, scaler = load_model_and_scaler(str(model_path), str(scaler_path))
        
        # Make prediction with scaled features
        score = predict(model, scaler, features)
        
        # Return result as JSON
        print(json.dumps({
            "success": True,
            "habitability_score": score,
            "model": "xgb_habitability_model",
            "features_received": {
                "stellar_temperature_score": features[0],
                "stellar_radius_score": features[1],
                "planet_radius_score": features[2],
                "insolation_score": features[3],
                "orbital_period_score": features[4],
                "equilibrium_temperature_score": features[5]
            }
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
