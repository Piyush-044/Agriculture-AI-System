from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pickle
import os

app = FastAPI(title="AgriClimate AI Platform")

# Load ML Model
MODEL_PATH = "random_forest_crop_model.pkl"
model = None

if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

# Request Schema
class CropRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/api/predict")
def predict_crop(data: CropRequest):
    if not model:
        raise HTTPException(status_code=500, detail="ML Model not loaded.")
    
    # Convert Pydantic object to list of features
    features = [[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]]
    prediction = model.predict(features)
    
    return {"recommended_crop": str(prediction[0]), "confidence": "high (synthetic approximation)"}

@app.get("/api/state-data/{state_name}")
def get_state_data(state_name: str):
    if not model:
        raise HTTPException(status_code=500, detail="ML Model not loaded.")
        
    state_db = {
        "Andhra Pradesh": {"N": 80, "P": 40, "K": 35, "temperature": 32.5, "humidity": 75.0, "ph": 6.8, "rainfall": 900.0, "soil": "Red / Sandy", "risk": "Moderate Risk: Heavy Monsoonal downpour in 20 days."},
        "Bihar": {"N": 100, "P": 50, "K": 40, "temperature": 28.0, "humidity": 80.0, "ph": 7.0, "rainfall": 1200.0, "soil": "Alluvial", "risk": "High Risk: Severe Flooding expected in 3 weeks."},
        "Gujarat": {"N": 60, "P": 30, "K": 20, "temperature": 35.0, "humidity": 50.0, "ph": 7.5, "rainfall": 800.0, "soil": "Black / Sandy", "risk": "Severe Risk: Cyclone 'Biparjoy' landfall expected next month."},
        "Himachal Pradesh": {"N": 40, "P": 20, "K": 50, "temperature": 15.0, "humidity": 65.0, "ph": 6.0, "rainfall": 1400.0, "soil": "Mountain / Loamy", "risk": "Moderate Risk: Flash floods/landslide possible in 4 weeks."},
        "Jharkhand": {"N": 70, "P": 35, "K": 30, "temperature": 29.0, "humidity": 70.0, "ph": 6.5, "rainfall": 1100.0, "soil": "Red / Laterite", "risk": "None"},
        "Kerala": {"N": 90, "P": 45, "K": 80, "temperature": 27.5, "humidity": 85.0, "ph": 5.5, "rainfall": 3000.0, "soil": "Laterite", "risk": "High Risk: Extreme Rainfall and Urban Flooding in 25 days."},
        "Madhya Pradesh": {"N": 75, "P": 35, "K": 30, "temperature": 31.0, "humidity": 60.0, "ph": 7.2, "rainfall": 950.0, "soil": "Black", "risk": "Low Risk: Normal climatic conditions."},
        "Maharashtra": {"N": 85, "P": 40, "K": 40, "temperature": 33.0, "humidity": 65.0, "ph": 6.9, "rainfall": 1000.0, "soil": "Black / Cotton", "risk": "Moderate Risk: Unseasonal Heatwave expected next month."},
        "Meghalaya": {"N": 50, "P": 25, "K": 35, "temperature": 22.0, "humidity": 90.0, "ph": 5.0, "rainfall": 2800.0, "soil": "Forest / Loamy", "risk": "Low Risk: Continued heavy terrain rainfall."},
        "Odisha": {"N": 80, "P": 42, "K": 38, "temperature": 29.5, "humidity": 78.0, "ph": 6.3, "rainfall": 1450.0, "soil": "Yellow / Red", "risk": "Severe Risk: Very Severe Cyclonic Storm forming, hits in 28 days."},
        "Telangana": {"N": 75, "P": 35, "K": 30, "temperature": 34.0, "humidity": 60.0, "ph": 7.1, "rainfall": 900.0, "soil": "Red / Black", "risk": "None"},
        "Uttar Pradesh": {"N": 110, "P": 55, "K": 40, "temperature": 30.0, "humidity": 65.0, "ph": 7.2, "rainfall": 1050.0, "soil": "Alluvial", "risk": "High Risk: Gangetic basin flooding expected in 1 month."},
        "Uttarakhand": {"N": 55, "P": 25, "K": 45, "temperature": 20.0, "humidity": 70.0, "ph": 6.0, "rainfall": 1500.0, "soil": "Mountain", "risk": "Moderate Risk: Cloudburst alerts active for next month."},
        "West Bengal": {"N": 95, "P": 48, "K": 42, "temperature": 28.5, "humidity": 82.0, "ph": 6.5, "rainfall": 1700.0, "soil": "Alluvial / Laterite", "risk": "Severe Risk: Coastal Cyclone Warning in 3 weeks."}
    }
    
    data = state_db.get(state_name)
    if not data:
        raise HTTPException(status_code=404, detail="State data not available.")
        
    features = [[data["N"], data["P"], data["K"], data["temperature"], data["humidity"], data["ph"], data["rainfall"]]]
    prediction = model.predict(features)
    
    return {
        "state": state_name,
        "climate_analysis": {
            "temperature_avg": data["temperature"],
            "humidity_avg": data["humidity"],
            "rainfall_yearly": data["rainfall"],
            "weather_condition": "Tropical/Favorable" if data["temperature"] < 35 else "Arid/Hot",
            "risk_alert": data.get("risk", "None")
        },
        "soil_analysis": {
            "type": data["soil"],
            "ph_level": data["ph"],
            "nutrients": f"N: {data['N']}, P: {data['P']}, K: {data['K']}"
        },
        "recommended_crop": str(prediction[0])
    }

# Mount static folder for frontend
app.mount("/assets", StaticFiles(directory="static"), name="static")

@app.get("/login")
def serve_login_page():
    return FileResponse("static/login.html")

@app.get("/")
def serve_login():
    return FileResponse("static/login.html")

@app.get("/app")
def serve_frontend():
    return FileResponse("static/index.html")
