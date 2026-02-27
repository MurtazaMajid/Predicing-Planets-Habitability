# Model Integration Guide

## Current Setup ✓

Your real ML model from GitHub has been successfully integrated! The API now:

1. **Downloads your joblib model** from: `https://raw.githubusercontent.com/MurtazaMajid/Predicing-Planets-Habitability/main/Nasa_Koi_model.joblib`
2. **Executes predictions** via a Python backend script (`scripts/predict_habitability.py`)
3. **Falls back to mock** automatically if Python dependencies aren't available
4. **Caches the model** locally for faster repeated predictions

## Quick Start

### 1. Install Python Dependencies

Run this command in your project directory:

```bash
bash scripts/setup-python.sh
```

Or manually:

```bash
pip3 install joblib scikit-learn numpy
```

**Note:** This is only needed for local development. If you deploy to Vercel, ensure Python and these packages are available.

### 2. How It Works

When you submit a prediction:

```
Frontend Form 
  → POST /api/predict 
    → Node.js API Route 
      → Calls Python Script (scripts/predict_habitability.py)
        → Downloads model from GitHub (first time only)
        → Makes prediction on your features
      → Returns score to frontend
```

### 3. Feature Input (1-100 scale)

1. **Catalog Score** - Overall candidate authenticity
   - How likely the planet candidate is real (1 = unlikely, 100 = very likely)

2. **Star Radius Score** - Host star characteristics  
   - Affects the habitable zone distance (1 = very small star, 100 = very large star)

3. **Planet Radius Score** - Earth-like similarity
   - Planet size comparison to Earth (1 = very large, 100 = Earth-like)

4. **Insolation Score** - Stellar energy received
   - Energy from star compared to Earth (1 = too cold, 100 = too hot)

### 4. Habitability Output (0-100)

- **80+**: Highly habitable
- **60-79**: Potentially habitable  
- **40-59**: Marginally habitable
- **<40**: Not habitable

## Troubleshooting

### Issue: Python script fails or "module not found" error

**Solution:** Install the required packages:
```bash
pip3 install joblib scikit-learn numpy
```

The prediction will fall back to the mock model automatically.

### Issue: GitHub model download fails

The script caches the model locally at `~/.cache/nasa_koi_model.joblib`. If download fails:
- Check your internet connection
- The mock model will still work as a fallback
- Try running the script manually:
```bash
python3 scripts/predict_habitability.py 75 80 85 70
```

### Issue: Predictions seem off

Check that input features are in the correct order and range (1-100). The model expects:
```
[catalog_score, star_radius_score, planet_radius_score, insolation_score]
```

### Issue: On Vercel/Production

For production deployment on Vercel:

1. **Option A:** Keep current setup - Python backend will execute serverless functions
2. **Option B:** Convert to ONNX format for JavaScript-native predictions (faster, no Python needed)

Convert your model:
```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import joblib

model = joblib.load('Nasa_Koi_model.joblib')
initial_type = [('float_input', FloatTensorType([None, 4]))]
onnx_model = convert_sklearn(model, initial_type=initial_type)

with open("habitability_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
```

Then use `onnxruntime-node` in the API route for pure JavaScript inference.

## Model Info

- **Source:** NASA Exoplanet Archive (KOI dataset)
- **Repository:** https://github.com/MurtazaMajid/Predicing-Planets-Habitability
- **Target:** Habitability score (0-100)
- **Features:** 4 planetary/stellar characteristics
- **Framework:** scikit-learn
