<div align="center">

# Exoplanet Habitability Predictor

### Uncovering the secrets of distant worlds using NASA's Kepler Object of Interest (KOI) Dataset

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-Regressor-FF6600?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://astro-life-quest.vercel.app/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Spaces-FFD21E?style=for-the-badge)](https://huggingface.co/spaces/murtazamajid/planet-habitability-api)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37626?style=for-the-badge&logo=jupyter&logoColor=white)](https://jupyter.org)
[![NASA](https://img.shields.io/badge/NASA-KOI%20Dataset-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://exoplanetarchive.ipac.caltech.edu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> Can a machine tell us if a planet could harbour life? This end-to-end machine learning project builds a physics-informed habitability score from raw NASA telescope data, trains an XGBoost regression model on confirmed Kepler exoplanets, and serves live predictions through a FastAPI backend and a Next.js web app, both deployed to the cloud.

<br/>

**[Live Web App](https://astro-life-quest.vercel.app/) &nbsp;|&nbsp; [API on HuggingFace Spaces](https://huggingface.co/spaces/murtazamajid/planet-habitability-api) &nbsp;|&nbsp; [Notebook](notebooks/) &nbsp;|&nbsp; [Dataset](data/)**

---

![Habitability Predictor demo](Images/demo.gif)

---

</div>

---

## Table of Contents

- [Project Highlights](#project-highlights)
- [Problem Statement](#problem-statement)
- [System Architecture](#system-architecture)
- [Dataset](#dataset)
- [Methodology](#methodology)
  - [Data Preprocessing](#1-data-preprocessing)
  - [Exploratory Data Analysis](#2-exploratory-data-analysis)
  - [Feature Engineering and Habitability Scoring](#3-feature-engineering-and-habitability-scoring)
  - [Model Training and Tuning](#4-model-training-and-tuning)
  - [Explainability with SHAP](#5-explainability-with-shap)
- [Results](#results)
- [Web Application](#web-application)
- [FastAPI Backend](#fastapi-backend)
- [Use This Project](#use-this-project)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Future Work](#future-work)
- [Author](#author)

---

## Project Highlights

| Feature | Detail |
|---|---|
| Custom Scoring Engine | Physics-inspired Gaussian scoring across 6 planetary and stellar features grounded in real habitability science |
| Regression Model | XGBoost regressor tuned via 50-iteration RandomizedSearchCV with 5-fold cross-validation to predict a continuous habitability score |
| Explainable AI | SHAP TreeExplainer plots reveal exactly which features drive each prediction |
| REST API | FastAPI backend deployed on Hugging Face Spaces, accepting feature scores and returning a predicted habitability score |
| Production Web App | Next.js and TypeScript frontend deployed on Vercel for anyone to interact with the model in real time |
| Real-world Data | NASA's official Kepler KOI cumulative dataset with thousands of confirmed and candidate exoplanets |

---

## Problem Statement

NASA's Kepler Space Telescope catalogued thousands of Kepler Objects of Interest (KOI), which are candidate and confirmed planets orbiting distant stars. The telescope captures measurements like how hot a star burns, how large a planet is compared to Earth, how much starlight it receives, and how long it takes to complete one orbit. These numbers alone do not tell us whether a planet is a realistic candidate for life.

This project addresses that gap. Rather than producing a simple yes or no answer, the goal is to predict a **continuous Habitability Score from 0 to 100** for any exoplanet. A score of 70 or above indicates a strong similarity to Earth conditions across multiple criteria. The score is built from scratch using knowledge of what makes planets like Earth hospitable, and an XGBoost regression model is trained to generalise this scoring to planets it has never seen before.

The full pipeline, from raw NASA data to a live web app, is built and deployed end to end.

---

## System Architecture
```
+------------------------------------------------------------------+
|                          USER INPUT                              |
|             (planetary and stellar feature values)               |
+-----------------------------+------------------------------------+
                              |
               +--------------v--------------+
               |    Next.js Frontend App      |
               |    (TypeScript / Vercel)      |
               +--------------+--------------+
                              |  HTTP POST /predict
               +--------------v--------------+
               |    FastAPI Backend            |
               |    (Python / HF Spaces)       |
               |    +----------------------+   |
               |    |  MinMaxScaler        |   |
               |    |  XGBoost Regressor   |   |
               |    |  (xgb_model.pkl)     |   |
               |    +----------------------+   |
               +--------------+--------------+
                              |
               +--------------v--------------+
               |    Habitability Score 0-100   |
               |    Interpretation Label       |
               |    (Low / Medium / High)      |
               +------------------------------+
```

---

## Dataset

- **Source:** [NASA Exoplanet Archive - KOI Cumulative Table](https://exoplanetarchive.ipac.caltech.edu/)
- **File:** `cumulative.csv`
- **Scope:** Thousands of Kepler Objects of Interest spanning multiple Kepler observation quarters
- **Used for modelling:** Confirmed exoplanets only (`koi_disposition == 'CONFIRMED'`)

The KOI dataset is one of the most comprehensive publicly available sources of exoplanet data. Each row represents a candidate or confirmed planet, with dozens of columns covering stellar and planetary measurements assigned by NASA scientists. Only confirmed exoplanets are used for this project, making sure the model learns from planets whose existence has been independently verified.

**Features used:**

| Feature | What it measures | Unit |
|---|---|---|
| `koi_steff` | Temperature of the host star | Kelvin |
| `koi_srad` | Size of the host star | Solar radii |
| `koi_prad` | Size of the planet | Earth radii |
| `koi_insol` | Amount of starlight the planet receives | Earth flux |
| `koi_teq` | Estimated surface temperature of the planet | Kelvin |
| `koi_period` | How long one orbit takes | Days |

---

## Methodology

### 1. Data Preprocessing

The raw KOI dataset needs significant cleaning before it can be used. The steps taken are:

- Numerical and categorical columns are separated so each type can be handled appropriately
- Duplicate rows are removed from both subsets
- Columns with no useful signal (`koi_teq_err1`, `koi_teq_err2`, `kepler_name`, `koi_tce_delivname`) are dropped
- Missing values in orbital and stellar columns are filled using the column median, which handles the skewed distributions in this data well. The columns `ra`, `dec`, and `koi_score` are filled using the column mean
- Only rows where `koi_disposition == 'CONFIRMED'` are kept for modelling, ensuring training happens on verified planets only

---

### 2. Exploratory Data Analysis

Before building anything, each feature is studied carefully to understand how confirmed Kepler exoplanets are distributed. This exploration directly shapes the design of the scoring system in the next step.

**Stellar Temperature**

Most confirmed Kepler planets orbit stars with temperatures between 5,000 and 6,000 K, which is very close to our own Sun at 5,778 K. This makes sense as Kepler was designed to look for Sun-like stars. The distribution justifies using the Sun's temperature as the target reference when scoring planets.

![Stellar Temperature Distribution](images/Stellar%20Temperature%20Bar.png)

**Stellar Size**

The majority of host stars are close to 1 solar radius in size, again reflecting Kepler's focus on Sun-like systems. Larger giant stars are rare in the confirmed sample.

![Stellar Radius Distribution](images/Stellar%20Radius%20Bar.png)

**Planet Size**

Super-Earths and Mini-Neptunes make up the bulk of confirmed detections. Truly Earth-sized planets are harder to detect and so appear less frequently, even though they are likely more common in reality.

![Planet Radius Distribution](images/Planet%20Radius%20Bar.png)

**Starlight Received**

The vast majority of confirmed planets receive far more starlight than Earth does. Most orbit very close to their stars. Only a small fraction fall in the Earth-like range of 0.8 to 1.2 times Earth's flux, which is one of the key conditions for liquid water on a surface.

![Insolation Flux Distribution](images/Insol%20Bar.png)

**Orbital Period**

Most confirmed Kepler planets complete their orbits in under 50 days. This is a known detection bias: planets that orbit quickly cross in front of their stars more often, making them easier to spot. Planets with year-long orbits similar to Earth are much harder to confirm.

![Orbital Period Distribution](images/Orbital%20period%20Bar.png)

**Habitability Score Distribution**

After scoring all confirmed planets using the method described below, the distribution is heavily skewed toward the low end. This reflects the real state of the Kepler survey: most confirmed planets are hot, close-in, and larger than Earth, making them poor candidates for life.

![Habitability Score Distribution](images/Habitability%20score.PNG)

![Habitability Category Breakdown](images/Habitability%20Bar.png)

---

### 3. Feature Engineering and Habitability Scoring

This is the core contribution of the project. Instead of feeding raw telescope numbers directly into a model, each feature is converted into a score between 0 and its maximum using a **Gaussian curve**. This curve gives the highest score to values close to Earth or Sun references, and the score falls off smoothly as the value moves further away. There are no hard cutoffs.

The scoring formula for each feature is:
```
score = max_points * exp( -( (value - ideal)^2 ) / ( 2 * sigma^2 ) )
```

Where `ideal` is the Earth or Sun reference and `sigma` controls how quickly the score drops as values deviate from ideal.

**Component scores:**

| Score | Ideal Reference | Max Points | Why it matters |
|---|---|---|---|
| `koi_steff_score` | 5,778 K (Sun) | 100 | Stars that are too hot or too cool make conditions difficult for life |
| `koi_srad_score` | 1.0 R☉ | 90 | Star size affects how long the star lives and how much radiation it gives off |
| `koi_prad_score` | 1.0 R⊕ | 70 | Earth-sized planets are more likely to be rocky and hold a stable atmosphere |
| `koi_insol_score` | 1.0 S⊕ | 50 | The habitable zone is defined by receiving roughly Earth-like amounts of starlight |
| `koi_teq_score` | 288 K (Earth) | 70 | Liquid water needs surface temperatures in a relatively narrow range |
| `koi_period_score` | 365 days | 50 | Earth-like orbital periods reduce the chance of a planet becoming tidally locked |

**Final Habitability Score:**
```
habitability_score = ( steff_score + srad_score + prad_score + insol_score + teq_score + period_score ) / 450 * 100
```

The denominator 450 is the theoretical maximum across all six components, which normalises everything to a clean 0 to 100 scale.

**What the score means:**

| Score Range | Meaning |
|---|---|
| 70 and above | High habitability. The planet shares strong similarities with Earth across most criteria |
| 40 to 69 | Medium habitability. Some Earth-like properties but notable differences in one or more areas |
| Below 40 | Low habitability. Conditions differ substantially from Earth across most features |

Because the score is built from understandable physical comparisons, the result is always traceable back to specific feature contributions. There is no guesswork involved.

---

### 4. Model Training and Tuning

Once habitability scores are computed for all confirmed planets, the problem becomes a regression task: given the 6 component scores for a new planet, predict its overall habitability score.

**XGBoost** is used as the model because it performs well on tabular data, handles regularisation internally, and works cleanly with SHAP for explainability.

Hyperparameters are found using `RandomizedSearchCV` over 50 iterations with 5-fold cross-validation:

| Hyperparameter | Search Range |
|---|---|
| `n_estimators` | 400 to 1200 |
| `max_depth` | 3 to 7 |
| `learning_rate` | 0.01 to 0.11 |
| `subsample` | 0.7 to 0.9 |
| `colsample_bytree` | 0.6 to 0.9 |
| `reg_lambda` | 0.1 to 0.6 |
| `reg_alpha` | 0.0 to 0.3 |
| `gamma` | 0.0 to 0.1 |

**Best configuration found:**
```python
XGBRegressor(
    n_estimators     = 1087,
    learning_rate    = 0.0758,
    max_depth        = 3,
    subsample        = 0.7530,
    colsample_bytree = 0.7949,
    reg_alpha        = 0.0281,
    reg_lambda       = 0.2839,
    gamma            = 0.0849,
    objective        = 'reg:squarederror',
    random_state     = 42,
    n_jobs           = -1
)
```

**Training steps:**

1. All 6 input scores are scaled to a 0 to 1 range using `MinMaxScaler`
2. Data is split 80% for training and 20% for testing
3. The tuned model is trained on the training set
4. The trained model and scaler are saved as `xgb_habitability_model.pkl` and `feature_scaler.pkl` for use in the API

**Validation on known planets:**

To check that the model makes physical sense, predictions are run against manually constructed inputs for Earth, Kepler-22b, and Mars:

| Planet | Prediction |
|---|---|
| Earth | Habitable |
| Kepler-22b | Possibly Habitable |
| Mars | Uninhabitable |

These results match what scientists already know about each planet, which gives confidence that the model has learned real patterns.

---

### 5. Explainability with SHAP

A strong test score is not enough reason to trust a model in a scientific context. SHAP (SHapley Additive exPlanations) is used with `TreeExplainer` to understand exactly what the model is doing under the hood.

Two visualisations are produced. The beeswarm plot shows how each feature pushes individual predictions up or down, coloured by whether the feature value is high or low. The bar chart summarises the average influence of each feature across the entire training set.

![SHAP Feature Importance](images/shap%20planets.png)

The results show that equilibrium temperature (`koi_teq_score`) and insolation flux (`koi_insol_score`) are the strongest drivers of the predicted score. This lines up with physical intuition: how hot a planet is and how much starlight it receives are the most direct indicators of whether liquid water could exist on its surface.

---

## Results

| Metric | Value |
|---|---|
| R2 Score | ~0.98+ |
| MSE | Near-zero on test set |
| Earth (validation) | Habitable |
| Kepler-22b (validation) | Possibly Habitable |
| Mars (validation) | Uninhabitable |

The model fits the test data very closely, which is expected since the target score is a deterministic function of the input features. The more meaningful check is the real-world validation: the model correctly ranks Earth, Kepler-22b, and Mars in the order that scientists would expect. The actual vs. predicted scatter plot shows tight alignment across the full score range with no systematic errors at any particular score level.

---

## Web Application

The model is available through a web app built with **Next.js and TypeScript**, deployed on **Vercel**. No technical knowledge is needed to use it.

Enter values for the 6 planetary and stellar parameters, and the app converts them into component scores, sends them to the API, and displays the predicted habitability score with an explanation of what the number means.

**[Open the Web App at astro-life-quest.vercel.app](https://astro-life-quest.vercel.app/)**

---

## FastAPI Backend

The model runs as a REST API built with **FastAPI** and hosted on **Hugging Face Spaces**. It takes the 6 component scores, scales them, runs the XGBoost model, and returns the predicted habitability score.

**[View the API on Hugging Face Spaces](https://huggingface.co/spaces/murtazamajid/planet-habitability-api)**

Interactive API documentation is available at the Hugging Face Space URL with `/docs` added to the end.

**Endpoint:**
```http
POST /predict
Content-Type: application/json
```

**Request:**
```json
{
  "koi_steff_score":  65.0,
  "koi_srad_score":   85.0,
  "koi_prad_score":   65.0,
  "koi_insol_score":  65.0,
  "koi_period_score": 30.0,
  "koi_teq_score":    70.0
}
```

**Response:**
```json
{
  "habitability_score": 72.4
}
```

A score of 70 or above means high habitability. Between 40 and 69 means partial Earth-like conditions. Below 40 means the planet is unlikely to support life as we know it.

---

## Use This Project

### Option 1: Try the Web App

No setup needed. Go to [astro-life-quest.vercel.app](https://astro-life-quest.vercel.app/), enter the planetary parameters, and get a score instantly.

### Option 2: Call the API from Your Own Code

The API is publicly available. Here is how to call it from Python:
```python
import requests

payload = {
    "koi_steff_score":  65.0,   # Stellar temperature score (0-100), ideal = 5778 K
    "koi_srad_score":   85.0,   # Stellar radius score (0-90), ideal = 1.0 solar radii
    "koi_prad_score":   65.0,   # Planet radius score (0-70), ideal = 1.0 Earth radii
    "koi_insol_score":  65.0,   # Starlight received score (0-50), ideal = 1.0 Earth flux
    "koi_period_score": 30.0,   # Orbital period score (0-50), ideal = 365 days
    "koi_teq_score":    70.0    # Surface temperature score (0-70), ideal = 288 K
}

response = requests.post(
    "https://murtazamajid-planet-habitability-api.hf.space/predict",
    json=payload
)

print(response.json())
# {"habitability_score": 72.4}
```

Or using curl:
```bash
curl -X POST "https://murtazamajid-planet-habitability-api.hf.space/predict" \
     -H "Content-Type: application/json" \
     -d '{
           "koi_steff_score": 65.0,
           "koi_srad_score": 85.0,
           "koi_prad_score": 65.0,
           "koi_insol_score": 65.0,
           "koi_period_score": 30.0,
           "koi_teq_score": 70.0
         }'
```

### Option 3: Convert Raw Telescope Measurements to Scores

If you have raw measurements rather than pre-computed scores, use these helper functions to convert them before calling the API:
```python
import numpy as np

def steff_score(koi_steff):
    ideal, sigma = 5778, 800
    return round(min(100, max(0, 100 * np.exp(-((koi_steff - ideal)**2) / (2 * sigma**2)))), 2)

def srad_score(koi_srad):
    ideal, sigma = 1.0, 0.5
    return round(min(90, max(0, 90 * np.exp(-((koi_srad - ideal)**2) / (2 * sigma**2)))), 2)

def prad_score(koi_prad):
    ideal, sigma = 1.0, 0.8
    return round(max(0, 70 * np.exp(-0.5 * ((koi_prad - ideal) / sigma)**2)), 2)

def insol_score(koi_insol):
    if koi_insol <= 0:
        return 0.0
    log_diff = np.log10(koi_insol) - np.log10(1.0)
    return round(max(0, 50 * np.exp(-(log_diff**2) / (2 * 0.4**2))), 2)

def teq_score(koi_teq):
    ideal, sigma = 288, 0.4
    if koi_teq <= 0:
        return 0.0
    log_diff = np.log(koi_teq / ideal)
    return round(max(0, 70 * np.exp(-(log_diff**2) / (2 * sigma**2))), 2)

def period_score(koi_period):
    ideal, sigma_log = 365.0, np.log(2)
    if koi_period <= 0:
        return 0.0
    d = np.log(koi_period / ideal)
    return round(max(0, 50 * np.exp(-0.5 * (d / sigma_log)**2)), 2)
```

### Option 4: Run Everything Locally

See the [Quick Start](#quick-start) section below.

---

## Repository Structure
```
Predicing-Planets-Habitability/
|
+-- data/
|   +-- cumulative.csv                  Raw NASA KOI dataset
|
+-- documents/                          Project reports and write-ups
|
+-- images/
|   +-- Stellar Temperature Bar.png
|   +-- Stellar Radius Bar.png
|   +-- Planet Radius Bar.png
|   +-- Insol Bar.png
|   +-- Orbital period Bar.png
|   +-- Habitability score.PNG
|   +-- Habitability Bar.png
|   +-- shap planets.png
|
+-- model/
|   +-- xgb_habitability_model.pkl      Trained XGBoost model
|   +-- feature_scaler.pkl              Fitted MinMaxScaler
|
+-- notebooks/
|   +-- Exploring_the_Nasa_koi_Exoplanets_habitability.ipynb
|
+-- web_app/                            Next.js and TypeScript frontend
|   +-- components/
|   +-- pages/
|   +-- ...
|
+-- main.py                             FastAPI application
+-- requirements.txt                    Python dependencies
+-- README.md
```

---

## Quick Start

**Prerequisites:** Python 3.10+, Node.js 18+

**Clone the repository**
```bash
git clone https://github.com/MurtazaMajid/Predicing-Planets-Habitability.git
cd Predicing-Planets-Habitability
```

**Run the FastAPI backend locally**
```bash
pip install -r requirements.txt
uvicorn main:app --reload
# API running at http://127.0.0.1:8000
# Interactive docs at http://127.0.0.1:8000/docs
```

**Run the Next.js frontend locally**
```bash
cd web_app
npm install
npm run dev
# App running at http://localhost:3000
```

**Explore the notebook**
```bash
pip install jupyter
jupyter notebook notebooks/
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Data and EDA | Python, Pandas, NumPy, Matplotlib, Seaborn |
| Feature Engineering | NumPy Gaussian scoring functions |
| ML Model | XGBoost, Scikit-learn |
| Explainability | SHAP |
| Serialisation | Joblib |
| Backend API | FastAPI, Uvicorn |
| Frontend | Next.js, TypeScript |
| ML Deployment | Hugging Face Spaces |
| Web Deployment | Vercel |
| Notebook | Jupyter |
| Dataset | NASA Exoplanet Archive |

---

## Future Work

- Bring in more features such as surface gravity estimates to improve score precision
- Pull in data from other missions like TESS to increase the variety of training examples
- Add confidence ranges to predictions so users get a sense of how certain each score is
- Connect directly to the NASA Exoplanet Archive API so users can search for real planets by name
- Show a per-feature SHAP breakdown inside the web app for each prediction
- Try ensemble approaches that combine XGBoost with uncertainty-aware models

---

## Author

**Murtaza Majid**

[![GitHub](https://img.shields.io/badge/GitHub-MurtazaMajid-181717?style=flat-square&logo=github)](https://github.com/MurtazaMajid)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Murtaza%20Majid-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/murtaza-majid/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-murtazamajid-FFD21E?style=flat-square)](https://huggingface.co/spaces/murtazamajid/planet-habitability-api)

---

<div align="center">

If you found this project interesting, please consider giving it a star. It helps others discover it.

Built with curiosity about the cosmos and a passion for applied machine learning.

</div>
