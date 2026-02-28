# Deployment Guide - Planet Habitability Prediction App

## What You Have Built

A machine learning-powered web application that predicts planetary habitability using your trained XGBoost model. The app features:

- **6 Planetary Input Features** with detailed explanations
  - Stellar Temperature Score (1-100)
  - Stellar Radius Score (1-100)
  - Planet Radius Score (1-100)
  - Insolation Score (1-100)
  - Orbital Period Score (1-50)
  - Equilibrium Temperature Score (1-70)

- **Smart Result Interpretation** with 5 habitability levels:
  - Highly Habitable - Exceptional (85+)
  - Highly Habitable - Good (70-84)
  - Potentially Habitable (60-69)
  - Marginally Habitable (40-59)
  - Not Habitable (<40)

- **Real ML Model Integration**
  - XGBoost model (`xgb_habitability_model.pkl`)
  - Feature scaler (`feature_scaler.pkl`)
  - Automatic input scaling before prediction

## Next Steps: Deploy to Production

### Step 1: Download Your Code
1. Click the three dots (**⋯**) in the top-right corner of your v0 chat
2. Select **"Download ZIP"** to get your complete project
3. Extract the ZIP file to your computer

### Step 2: Initialize & Push to GitHub

#### 2a. Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `Planet-Habitability-Prediction` (or similar)
3. Don't initialize with README (you'll push your code)
4. Click **Create repository**

#### 2b. Push Your Code
Open your terminal and run these commands in your project folder:

```bash
# Initialize git in your project
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Planet habitability prediction app"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### 3a. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Authorize GitHub and select your repository
5. Click **Import**

#### 3b. Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: ./
- **Build Command**: `npm run build` or `pnpm build` (auto-detected)
- **Output Directory**: .next (auto-detected)

#### 3c. Deploy
Click **Deploy** and wait for Vercel to build and deploy your app (usually 2-3 minutes)

### Step 4: Verify Deployment

1. Once deployed, Vercel will give you a production URL (e.g., `https://planet-habitability.vercel.app`)
2. Visit your app and test with sample predictions
3. Check console for any errors (if issues, check the Vercel deployment logs)

## How the ML Model Works in Production

When users submit predictions on your deployed app:

1. **User Input** → Receives values from form (ranges validated)
2. **API Route** → `/api/predict` receives the request
3. **Python Script** → Downloads model & scaler from GitHub (if not cached)
4. **Feature Scaling** → Input features scaled using your `feature_scaler.pkl`
5. **XGBoost Prediction** → Model predicts habitability score
6. **Result Display** → Shows detailed interpretation with feature analysis

## Model Files Required

Make sure these files are in your GitHub repository at:
- `model/xgb_habitability_model.pkl`
- `model/feature_scaler.pkl`

If they're not there, upload them:

```bash
# Add model files to git
git add model/
git commit -m "Add ML model and scaler files"
git push origin main
```

## Testing the App

### In v0 Preview
- Currently shows mock predictions (for development)
- Check console logs for feature scaling info

### After Deployment to Vercel
- Real model predictions activate automatically
- No changes needed to code
- Production URL is live and public

## Monitoring & Troubleshooting

### Check Deployment Status
- Visit [vercel.com/dashboard](https://vercel.com/dashboard)
- Click your project to see build logs and errors

### Common Issues

**Issue**: Model download fails
- **Fix**: Ensure model files are in GitHub at correct paths
- Check that files are in `main` branch

**Issue**: Prediction returns 0
- **Fix**: Check API logs in Vercel for error messages
- Verify Python script can access GitHub model files

**Issue**: Scaling errors
- **Fix**: Ensure scaler.pkl is downloaded correctly
- Check feature order matches training data

## Making Updates

To update your app after deployment:

```bash
# Make changes locally
# Test in v0 preview

# Push to GitHub
git add .
git commit -m "Your update message"
git push origin main

# Vercel auto-deploys on git push
# Check deployment status at vercel.com/dashboard
```

## Next Features to Consider

- Add more planetary datasets
- User authentication & saved predictions
- Historical prediction tracking
- Interactive 3D planet viewer
- Comparison tool (compare multiple planets)
- Data export (CSV/PDF)

## Support

For issues:
1. Check Vercel deployment logs: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Review Python script output in logs
3. Verify GitHub model file paths are correct
4. Check model download from GitHub URLs

---

**Your app is ready for production! Good luck with your planet habitability predictions! 🚀**
