# Deployment Guide - Planet Habitability Predictor

This guide will help you deploy your space-themed habitability prediction website to Vercel with full Python ML model support.

## Prerequisites

- GitHub account with your repository
- Vercel account (free at vercel.com)
- Git installed on your machine

## Step 1: Prepare Your Local Repository

Before deploying, make sure your project is set up locally:

```bash
# Install local dependencies
npm install

# Install Python dependencies
bash scripts/setup-python.sh

# Test locally
npm run dev
```

Visit `http://localhost:3000` and test the prediction form.

## Step 2: Push to GitHub

If you haven't already, push your project to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Space-themed planet habitability predictor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository from GitHub
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

Vercel will automatically:
- Read `vercel.json` configuration
- Install Python dependencies from `requirements.txt`
- Build your Next.js app
- Deploy your site with Python runtime support

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow the prompts)
vercel
```

## Step 4: Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the prediction form with different inputs
3. Check that predictions work correctly with your real ML model

## Configuration Files Overview

### `vercel.json`
Tells Vercel to:
- Run `pip install -r requirements.txt` before building
- Use Python 3.11 runtime
- Build the Next.js app

### `requirements.txt`
Lists all Python dependencies needed:
- `joblib` - Model loading
- `scikit-learn` - ML framework
- `numpy` - Numerical operations
- `requests` - HTTP requests for downloading model

### `package.json` (updated)
Added `vercel-build` script for Vercel's build system to use.

### `.vercelignore`
Prevents unnecessary files from being uploaded:
- Git files
- Node modules (rebuilt on Vercel)
- README and local config files

## Troubleshooting

### Issue: "Python not found" error

**Solution:** The `vercel.json` specifies Python 3.11. Ensure `runtime` is set correctly:

```json
{
  "runtime": "python3.11"
}
```

### Issue: Model download fails

The Python script tries to cache the model at `~/.cache/nasa_koi_model.joblib`. On Vercel's ephemeral filesystem, this might fail on first request. 

**Solution:** 
- The model will be re-downloaded each request (acceptable for Vercel's fast execution)
- Consider pre-downloading the model during build by modifying `vercel.json`:

```json
{
  "buildCommand": "python3 scripts/download-model.py && pip install -r requirements.txt && npm run build"
}
```

### Issue: Timeout errors

If predictions timeout:
1. Check that Python dependencies installed correctly
2. Verify scikit-learn version is compatible with your model
3. Monitor Vercel logs for errors

View logs:
```bash
vercel logs your-project.vercel.app
```

### Issue: Model predictions giving wrong results

**Checklist:**
- Features are in correct order: [catalogScore, starRadiusScore, planetRadiusScore, insolationScore]
- Feature values are in range 1-100
- Scikit-learn version matches the version used to train the model
- Model file wasn't corrupted during download

## Environment Variables (Optional)

If you need to add API keys or other secrets:

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add your variables

Then access in your code:
```typescript
const apiKey = process.env.YOUR_VARIABLE_NAME;
```

## Performance Tips

1. **Model Caching:** The current setup downloads the model each time. For better performance, pre-cache it:
   ```bash
   python3 scripts/predict_habitability.py 50 50 50 50  # Pre-warm cache
   ```

2. **Vercel Edge Functions:** If you want faster predictions, consider converting to ONNX format and using JavaScript inference (no Python needed).

3. **Monitor Usage:** Check Vercel dashboard for CPU usage and execution time.

## Rollback & Updates

To update your deployment:

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main

# Automatically redeploys!
```

To rollback to a previous version:
1. Go to Vercel dashboard
2. Select your project
3. Deployments tab
4. Click on previous deployment
5. Click "Promote to Production"

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/community)
- [Open a support ticket](https://vercel.com/support)

For ML model issues:
- Check [MODEL_INTEGRATION.md](./MODEL_INTEGRATION.md)
- Review [your model's GitHub repo](https://github.com/MurtazaMajid/Predicing-Planets-Habitability)

---

Happy deploying! 🚀
