# Prediction Behavior: Development vs Production

## Current Status

Your model path has been updated to: `https://raw.githubusercontent.com/MurtazaMajid/Predicing-Planets-Habitability/main/model/Nasa_Koi_model.joblib`

## Development (v0 Preview / Local Testing)

**Current Behavior:** Mock Predictions
- The v0 preview environment may use the **mock/fallback prediction model** because:
  - Python packages might not be fully installed in the sandbox
  - The Python script execution may be limited
  - Testing purposes to keep things fast

**How to Know Which Model is Running:**
Check the API response in your browser DevTools → Network tab:
```json
{
  "habitabilityScore": 65.5,
  "modelSource": "mock",  // ← Shows "mock" in preview
  "timestamp": "2026-02-26T..."
}
```

Or check the console for debug logs:
```
[v0] Real model failed, falling back to mock: ...
```

## Production (Vercel Deployment)

**Behavior:** Real Model Inference
When you deploy to Vercel (click "Publish"), the following happens:

1. **Build Time:**
   - Vercel installs Python dependencies (joblib, scikit-learn, numpy)
   - Creates the build artifacts

2. **Runtime (First Prediction):**
   - Node.js API receives your prediction request
   - Calls Python script: `scripts/predict_habitability.py`
   - Python script downloads your model from GitHub
   - Model is cached locally for subsequent requests
   - Real prediction is made using your trained ML model
   - Score is returned to frontend

3. **Subsequent Predictions:**
   - Model is already cached locally
   - Faster predictions (no re-download)
   - Uses your actual trained model every time

**API Response with Real Model:**
```json
{
  "habitabilityScore": 72.3,
  "modelSource": "real",  // ← Shows "real" in production
  "timestamp": "2026-02-26T..."
}
```

## How to Deploy

1. **Push to GitHub** (if not already connected):
   ```bash
   git add .
   git commit -m "Update model path and predictions"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Select your GitHub repo
   - Vercel auto-detects `vercel.json` configuration
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

3. **Test Live Predictions:**
   - Your deployed URL will use **real model inference**
   - Check network tab to confirm `"modelSource": "real"`

## Testing Locally Before Deployment

To test with the real model locally:

```bash
# Install dependencies
bash scripts/setup-python.sh

# Test the Python script directly
python3 scripts/predict_habitability.py 75 80 85 70
```

Expected output:
```json
{
  "success": true,
  "habitability_score": 71.5,
  "features_received": {
    "catalog_score": 75,
    "star_radius_score": 80,
    "planet_radius_score": 85,
    "insolation_score": 70
  }
}
```

## Troubleshooting

### Q: My predictions still look random/wrong
**A:** You're in development preview mode with the mock model. Deploy to Vercel for real predictions.

### Q: Model download fails on Vercel
**A:** Check that:
1. Your GitHub repo is public
2. Model file path is correct: `model/Nasa_Koi_model.joblib`
3. Check Vercel logs for exact error

### Q: Predictions take too long
**A:** First request downloads the model (~30-60 seconds). Subsequent requests are instant (model cached).

### Q: Different results locally vs on Vercel
**A:** Could be due to:
- Python version differences
- Different dependency versions
- Environment variables not set
- Model file corruption (re-download to fix)

## Summary

| Aspect | Preview (v0) | Production (Vercel) |
|--------|-------------|-------------------|
| Model | Mock/Fallback | Real (from GitHub) |
| API Response | `"modelSource": "mock"` | `"modelSource": "real"` |
| Speed | Fast | Slower first request, then cached |
| Requires Python | No | Yes (auto-installed) |
| How to Use | Just preview in v0 | Click "Publish" in v0 or deploy via GitHub |

**Bottom Line:** Your actual ML model will be used automatically when you deploy to Vercel. The preview uses a mock just for testing the UI/UX.
