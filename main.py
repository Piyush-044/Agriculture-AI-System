from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
# pyrefly: ignore[missing-import]
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
# pyrefly: ignore[missing-import]
from fastapi.staticfiles import StaticFiles
import pickle
import os
import base64
import json
import random
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai

# Load env variables
load_dotenv()

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

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
        "Arunachal Pradesh": {"N": 45, "P": 20, "K": 35, "temperature": 18.0, "humidity": 82.0, "ph": 5.5, "rainfall": 2200.0, "soil": "Forest / Acidic", "risk": "Moderate Risk: Flash floods due to monsoon rainfall."},
        "Assam": {"N": 85, "P": 38, "K": 40, "temperature": 24.5, "humidity": 88.0, "ph": 5.8, "rainfall": 2400.0, "soil": "Alluvial / Clayey", "risk": "Severe Risk: Brahmaputra flooding expected next month."},
        "Bihar": {"N": 100, "P": 50, "K": 40, "temperature": 28.0, "humidity": 80.0, "ph": 7.0, "rainfall": 1200.0, "soil": "Alluvial", "risk": "High Risk: Severe Flooding expected in 3 weeks."},
        "Chhattisgarh": {"N": 75, "P": 32, "K": 28, "temperature": 31.0, "humidity": 62.0, "ph": 6.2, "rainfall": 1300.0, "soil": "Red / Yellow Clay", "risk": "None"},
        "Goa": {"N": 55, "P": 25, "K": 50, "temperature": 28.0, "humidity": 85.0, "ph": 5.6, "rainfall": 2900.0, "soil": "Laterite / Sandy", "risk": "Low Risk: Normal monsoonal rain."},
        "Gujarat": {"N": 60, "P": 30, "K": 20, "temperature": 35.0, "humidity": 50.0, "ph": 7.5, "rainfall": 800.0, "soil": "Black / Sandy", "risk": "Severe Risk: Cyclone 'Biparjoy' landfall expected next month."},
        "Haryana": {"N": 115, "P": 52, "K": 45, "temperature": 30.0, "humidity": 55.0, "ph": 7.8, "rainfall": 600.0, "soil": "Alluvial / Loamy", "risk": "Low Risk: Mild heatwave warning in 10 days."},
        "Himachal Pradesh": {"N": 40, "P": 20, "K": 50, "temperature": 15.0, "humidity": 65.0, "ph": 6.0, "rainfall": 1400.0, "soil": "Mountain / Loamy", "risk": "Moderate Risk: Flash floods/landslide possible in 4 weeks."},
        "Jharkhand": {"N": 70, "P": 35, "K": 30, "temperature": 29.0, "humidity": 70.0, "ph": 6.5, "rainfall": 1100.0, "soil": "Red / Laterite", "risk": "None"},
        "Karnataka": {"N": 85, "P": 42, "K": 55, "temperature": 28.0, "humidity": 72.0, "ph": 6.6, "rainfall": 1150.0, "soil": "Red / Black Cotton", "risk": "Low Risk: Coastal heavy winds warning."},
        "Kerala": {"N": 90, "P": 45, "K": 80, "temperature": 27.5, "humidity": 85.0, "ph": 5.5, "rainfall": 3000.0, "soil": "Laterite", "risk": "High Risk: Extreme Rainfall and Urban Flooding in 25 days."},
        "Madhya Pradesh": {"N": 75, "P": 35, "K": 30, "temperature": 31.0, "humidity": 60.0, "ph": 7.2, "rainfall": 950.0, "soil": "Black", "risk": "Low Risk: Normal climatic conditions."},
        "Maharashtra": {"N": 85, "P": 40, "K": 40, "temperature": 33.0, "humidity": 65.0, "ph": 6.9, "rainfall": 1000.0, "soil": "Black / Cotton", "risk": "Moderate Risk: Unseasonal Heatwave expected next month."},
        "Manipur": {"N": 55, "P": 25, "K": 30, "temperature": 21.0, "humidity": 78.0, "ph": 5.9, "rainfall": 1500.0, "soil": "Alluvial / Clayey", "risk": "Low Risk: Normal monsoonal rain."},
        "Meghalaya": {"N": 50, "P": 25, "K": 35, "temperature": 22.0, "humidity": 90.0, "ph": 5.0, "rainfall": 2800.0, "soil": "Forest / Loamy", "risk": "Low Risk: Continued heavy terrain rainfall."},
        "Mizoram": {"N": 48, "P": 22, "K": 32, "temperature": 23.0, "humidity": 85.0, "ph": 5.4, "rainfall": 2100.0, "soil": "Acidic / Clay", "risk": "None"},
        "Nagaland": {"N": 52, "P": 24, "K": 34, "temperature": 20.0, "humidity": 80.0, "ph": 5.6, "rainfall": 1800.0, "soil": "Laterite / Clay", "risk": "Low Risk: Minor landslide warnings."},
        "Odisha": {"N": 80, "P": 42, "K": 38, "temperature": 29.5, "humidity": 78.0, "ph": 6.3, "rainfall": 1450.0, "soil": "Yellow / Red", "risk": "Severe Risk: Very Severe Cyclonic Storm forming, hits in 28 days."},
        "Punjab": {"N": 120, "P": 58, "K": 48, "temperature": 31.0, "humidity": 52.0, "ph": 7.7, "rainfall": 650.0, "soil": "Alluvial / Sandy Loam", "risk": "Moderate Risk: Depleting groundwater levels alert."},
        "Rajasthan": {"N": 45, "P": 22, "K": 25, "temperature": 36.5, "humidity": 35.0, "ph": 8.2, "rainfall": 400.0, "soil": "Desert / Sandy", "risk": "Severe Risk: Extreme heatwave (>47C) expected next week."},
        "Sikkim": {"N": 40, "P": 18, "K": 45, "temperature": 16.0, "humidity": 80.0, "ph": 5.4, "rainfall": 1900.0, "soil": "Mountain / Humus", "risk": "Moderate Risk: High altitude frost warnings."},
        "Tamil Nadu": {"N": 82, "P": 38, "K": 42, "temperature": 31.5, "humidity": 68.0, "ph": 7.1, "rainfall": 950.0, "soil": "Red Loamy / Sandy", "risk": "Low Risk: Water reservoir depletion warning."},
        "Telangana": {"N": 75, "P": 35, "K": 30, "temperature": 34.0, "humidity": 60.0, "ph": 7.1, "rainfall": 900.0, "soil": "Red / Black", "risk": "None"},
        "Tripura": {"N": 58, "P": 26, "K": 36, "temperature": 25.0, "humidity": 82.0, "ph": 5.7, "rainfall": 1700.0, "soil": "Alluvial / Red", "risk": "None"},
        "Uttar Pradesh": {"N": 110, "P": 55, "K": 40, "temperature": 30.0, "humidity": 65.0, "ph": 7.2, "rainfall": 1050.0, "soil": "Alluvial", "risk": "High Risk: Gangetic basin flooding expected in 1 month."},
        "Uttarakhand": {"N": 55, "P": 25, "K": 45, "temperature": 20.0, "humidity": 70.0, "ph": 6.0, "rainfall": 1500.0, "soil": "Mountain", "risk": "Moderate Risk: Cloudburst alerts active for next month."},
        "West Bengal": {"N": 95, "P": 48, "K": 42, "temperature": 28.5, "humidity": 82.0, "ph": 6.5, "rainfall": 1700.0, "soil": "Alluvial / Laterite", "risk": "Severe Risk: Coastal Cyclone Warning in 3 weeks."},
        "Jammu & Kashmir": {"N": 50, "P": 24, "K": 48, "temperature": 14.0, "humidity": 62.0, "ph": 6.8, "rainfall": 1100.0, "soil": "Mountain / Alluvial", "risk": "Moderate Risk: Early winter snowfall warning."},
        "Delhi": {"N": 95, "P": 42, "K": 38, "temperature": 31.0, "humidity": 55.0, "ph": 7.6, "rainfall": 700.0, "soil": "Alluvial / Loamy", "risk": "Moderate Risk: High smog and air pollution warning."}
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
            "weather_condition": "Tropical/Favorable" if float(data["temperature"]) < 35 else "Arid/Hot",
            "risk_alert": data.get("risk", "None")
        },
        "soil_analysis": {
            "type": data["soil"],
            "ph_level": data["ph"],
            "nutrients": f"N: {data['N']}, P: {data['P']}, K: {data['K']}"
        },
        "recommended_crop": str(prediction[0])
    }

# -----------------------------------------------
# Chat History Message Schema
# -----------------------------------------------
class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    crop: Optional[str] = None
    N: Optional[float] = None
    P: Optional[float] = None
    K: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    ph: Optional[float] = None
    rainfall: Optional[float] = None
    language: Optional[str] = "auto"  # "auto", "hi", "en", "hinglish"
    history: Optional[List[ChatMessage]] = []  # Multi-turn conversation history
    state_name: Optional[str] = None  # Current selected state
    market_snapshot: Optional[str] = None  # Quick market price summary

def build_system_prompt(crop=None, N=None, P=None, K=None, ph=None,
                        temperature=None, humidity=None, rainfall=None,
                        state_name=None, market_snapshot=None):
    """Build a rich system prompt with all available farm context."""
    context_parts = []
    if crop:
        context_parts.append(f"🌾 Recommended Crop: {crop}")
    if N is not None:
        context_parts.append(
            f"🧪 Soil: N={N}, P={P}, K={K}, pH={ph}\n"
            f"🌡️ Climate: Temp={temperature}°C, Humidity={humidity}%, Rainfall={rainfall}mm/yr"
        )
    if state_name:
        state_db_mini = {
            "Punjab": "wheat+rice belt, high groundwater stress",
            "Rajasthan": "arid zone, extreme heat, drip irrigation critical",
            "Kerala": "tropical, high rainfall, laterite soil",
            "Bihar": "alluvial, flood-prone, rice-wheat rotation",
            "Maharashtra": "black cotton soil, sugarcane+cotton dominant",
        }
        state_note = state_db_mini.get(state_name, "mixed agri zone")
        context_parts.append(f"📍 Selected State: {state_name} ({state_note})")
    if market_snapshot:
        context_parts.append(f"💰 Market Update: {market_snapshot}")

    farm_context = "\n".join(context_parts) if context_parts else "No specific farm context provided yet."

    return f"""You are AgriClimate AI — India ka sabse smart agricultural advisor! 🌾

🌐 LANGUAGE RULES (Strict):
1. Devanagari script detect karo → PURE HINDI mein jawab do (हिंदी)
2. Pure English → Hinglish mein jawab do (desi friendly style)
3. Hinglish/mixed → Hinglish mein jawab do  
4. Regional languages (Tamil, Telugu, Punjabi, etc.) → 1 line uski language + Hinglish detail
5. NEVER formal corporate English — hamesha ek expert dost ki tarah baat karo
6. Use "Yaar", "Bhai", "Arrey", "Sunno", "Dekho" naturally

✅ RESPONSE FORMAT:
- Emojis use karo freely 🌾 💧 🌡️ 🧪 ⚠️ ✅ 🚜
- Short bullets for multi-point answers
- Scientific terms → simple brackets mein explain karo
- 3-6 lines (detailed questions ke liye zyada ok hai)
- End mein: 1 actionable next step ya tip ZAROOR do
- Agar conversation history hai, toh usse refer karo naturally ("Jaise maine pehle bataya...")

📚 FARM CONTEXT:
{farm_context}

🎯 FOLLOW-UP FORMAT:
Response ke BILKUL end mein (newline ke baad), 3 follow-up questions JSON mein do:
[FOLLOWUPS]{{"q": ["question 1", "question 2", "question 3"]}}[/FOLLOWUPS]
Questions crop/soil context ke hisaab se relevant hone chahiye."""


@app.post("/api/chat")
def chat_with_advisor(data: ChatRequest):
    system_prompt = build_system_prompt(
        crop=data.crop, N=data.N, P=data.P, K=data.K, ph=data.ph,
        temperature=data.temperature, humidity=data.humidity, rainfall=data.rainfall,
        state_name=data.state_name, market_snapshot=data.market_snapshot
    )

    # Offline fallback
    if not gemini_key:
        offline_msg = (
            f"Yaar, abhi AI offline hai 😅 "
            f"Par general tip: {data.crop or 'sabhi crops'} ke liye "
            f"N-P-K ratio balanced rakhna zaroori hai, "
            f"pH 6.0-7.0 ke beech hona chahiye, "
            f"aur regular soil testing karwao! 🌱"
        )
        return {"response": offline_msg, "follow_ups": ["NPK ratio kya hona chahiye?", "Soil test kab karein?", "Organic fertilizer use karein?"], "language_detected": "hinglish"}

    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"]

    for model_name in models_to_try:
        try:
            ai_model = genai.GenerativeModel(
                model_name,
                system_instruction=system_prompt,
                generation_config={
                    "temperature": 0.85,
                    "top_p": 0.95,
                    "max_output_tokens": 700,
                }
            )

            # Build Gemini-format history for multi-turn
            gemini_history = []
            if data.history:
                for msg in data.history[:-1]:  # exclude the latest user message
                    gemini_history.append({
                        "role": msg.role,
                        "parts": [msg.content]
                    })

            chat_session = ai_model.start_chat(history=gemini_history)
            response = chat_session.send_message(data.message)
            full_text = response.text.strip()

            # Extract follow-up questions
            follow_ups = []
            main_response = full_text
            if "[FOLLOWUPS]" in full_text and "[/FOLLOWUPS]" in full_text:
                parts = full_text.split("[FOLLOWUPS]")
                main_response = parts[0].strip()
                try:
                    fu_json_str = parts[1].split("[/FOLLOWUPS]")[0].strip()
                    fu_data = json.loads(fu_json_str)
                    follow_ups = fu_data.get("q", [])
                except Exception:
                    pass

            return {
                "response": main_response,
                "follow_ups": follow_ups,
                "model_used": model_name,
                "language_detected": "auto"
            }
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
                continue
            elif "SAFETY" in err_msg:
                return {
                    "response": "Yaar, is question ka safe jawab nahi de sakta. Koi aur farming question puchho! 🌾",
                    "follow_ups": [],
                    "language_detected": "hinglish"
                }
            continue

    offline_fallback = (
        f"Arrey yaar, AI thoda busy hai abhi! 🙏 "
        f"{'`' + data.crop + '`' if data.crop else 'Apni crop'} ke liye: "
        f"Balanced NPK fertilizer use karo, pH 6-7 maintain karo, "
        f"aur monsoon se pehle soil test zaroor karwao! 💪🌾"
    )
    return {"response": offline_fallback, "follow_ups": [], "language_detected": "hinglish"}


# -----------------------------------------------
# Streaming Chat Endpoint (SSE)
# -----------------------------------------------
class StreamChatRequest(BaseModel):
    message: str
    crop: Optional[str] = None
    N: Optional[float] = None
    P: Optional[float] = None
    K: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    ph: Optional[float] = None
    rainfall: Optional[float] = None
    language: Optional[str] = "auto"
    history: Optional[List[ChatMessage]] = []
    state_name: Optional[str] = None
    market_snapshot: Optional[str] = None

@app.post("/api/chat/stream")
async def stream_chat(data: StreamChatRequest):
    """Streaming SSE endpoint — sends tokens as they arrive."""
    system_prompt = build_system_prompt(
        crop=data.crop, N=data.N, P=data.P, K=data.K, ph=data.ph,
        temperature=data.temperature, humidity=data.humidity, rainfall=data.rainfall,
        state_name=data.state_name, market_snapshot=data.market_snapshot
    )

    if not gemini_key:
        offline_msg = (
            f"Yaar, abhi AI offline hai 😅 Par tip: {data.crop or 'sabhi crops'} ke liye "
            f"N-P-K balanced rakhna zaroori hai aur pH 6-7 maintain karo! 🌱"
        )
        async def offline_gen():
            yield f"data: {json.dumps({'token': offline_msg, 'done': False})}\n\n"
            yield f"data: {json.dumps({'token': '', 'done': True, 'follow_ups': ['NPK ratio?', 'Soil test kab?', 'Organic tips?']})}\n\n"
        return StreamingResponse(offline_gen(), media_type="text/event-stream",
                                  headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    async def generate():
        models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash"]
        for model_name in models_to_try:
            try:
                ai_model = genai.GenerativeModel(
                    model_name,
                    system_instruction=system_prompt,
                    generation_config={
                        "temperature": 0.85,
                        "top_p": 0.95,
                        "max_output_tokens": 700,
                    }
                )

                gemini_history = []
                if data.history:
                    for msg in data.history[:-1]:
                        gemini_history.append({"role": msg.role, "parts": [msg.content]})

                chat_session = ai_model.start_chat(history=gemini_history)

                full_text = ""
                # Use streaming generate
                response_stream = chat_session.send_message(data.message, stream=True)
                for chunk in response_stream:
                    if chunk.text:
                        token = chunk.text
                        full_text += token
                        # Don't stream the [FOLLOWUPS] block
                        if "[FOLLOWUPS]" not in full_text:
                            yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
                        else:
                            # Send only the part before FOLLOWUPS
                            visible = full_text.split("[FOLLOWUPS]")[0]
                            already_sent = full_text[:full_text.index("[FOLLOWUPS]")]
                            new_part = visible[len(already_sent) - len(token):]
                            if new_part:
                                yield f"data: {json.dumps({'token': new_part, 'done': False})}\n\n"
                        await asyncio.sleep(0)  # yield event loop

                # Extract follow-ups
                follow_ups = []
                if "[FOLLOWUPS]" in full_text and "[/FOLLOWUPS]" in full_text:
                    try:
                        fu_str = full_text.split("[FOLLOWUPS]")[1].split("[/FOLLOWUPS]")[0].strip()
                        fu_data = json.loads(fu_str)
                        follow_ups = fu_data.get("q", [])
                    except Exception:
                        pass

                yield f"data: {json.dumps({'token': '', 'done': True, 'follow_ups': follow_ups, 'model_used': model_name})}\n\n"
                return
            except Exception as e:
                err_msg = str(e)
                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
                    continue
                yield f"data: {json.dumps({'token': 'Arrey yaar, AI busy hai! Thodi der baad try karo 🙏', 'done': True, 'follow_ups': []})}\n\n"
                return

        yield f"data: {json.dumps({'token': 'Yaar, sab models busy hain! Thodi der mein dobara try karo 🌾', 'done': True, 'follow_ups': []})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                              headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# -----------------------------------------------
# Proactive Tip Endpoint (for state selection)
# -----------------------------------------------
class ProactiveTipRequest(BaseModel):
    state_name: str
    crop: Optional[str] = None
    risk_alert: Optional[str] = None
    soil_type: Optional[str] = None

@app.post("/api/proactive-tip")
def get_proactive_tip(data: ProactiveTipRequest):
    """Generate an instant farming tip when user selects a state."""
    if not gemini_key:
        tips = [
            f"Yaar, {data.state_name} mein is season mein soil moisture check karna mat bhulo! 💧",
            f"{data.state_name} ke khet ke liye: NPK balance test karwao is mahine. 🧪",
            f"Bhai, {data.state_name} ke liye organic mulching bahut faydemand hai! 🌿",
        ]
        return {"tip": random.choice(tips), "state": data.state_name}

    prompt = (
        f"State: {data.state_name}\n"
        f"Crop: {data.crop or 'unknown'}\n"
        f"Risk: {data.risk_alert or 'None'}\n"
        f"Soil: {data.soil_type or 'Mixed'}\n\n"
        f"Ek short, actionable farming tip do is state ke liye (2-3 lines max). "
        f"Hinglish mein, friendly desi style. Emojis use karo. "
        f"Agar risk alert hai toh usse zaroor address karo."
    )

    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash-8b"]
    for model_name in models_to_try:
        try:
            ai_model = genai.GenerativeModel(
                model_name,
                generation_config={"temperature": 0.9, "max_output_tokens": 150}
            )
            response = ai_model.generate_content(prompt)
            return {"tip": response.text.strip(), "state": data.state_name}
        except Exception:
            continue

    return {"tip": f"{data.state_name} ke liye: Soil health check karo aur seasonal crops ke liye taiyari karo! 🌾", "state": data.state_name}




# -----------------------------------------------
# Phase 1: Disease Detection (Gemini Vision API)
# -----------------------------------------------
class DiseaseRequest(BaseModel):
    image_base64: str
    crop_name: Optional[str] = None

@app.post("/api/disease-detect")
def detect_disease(data: DiseaseRequest):
    offline_response = {
        "disease": "Leaf Blight (Simulated)",
        "confidence": "Offline Mode",
        "severity": "Moderate",
        "symptoms": "Yellowing of leaves, brown spots, wilting at edges.",
        "organic_treatment": "Apply neem oil spray (5ml/L water) every 7 days. Remove affected leaves.",
        "chemical_treatment": "Apply Mancozeb 75% WP at 2g/L or Carbendazim 50% WP at 1g/L.",
        "prevention": "Ensure proper drainage, avoid overhead irrigation, maintain plant spacing."
    }
    if not gemini_key:
        return offline_response
    try:
        image_data = base64.b64decode(data.image_base64)
        crop_context = f" The crop is {data.crop_name}." if data.crop_name else ""
        prompt = (
            f"You are an expert plant pathologist AI.{crop_context} "
            "Analyze this crop/plant image for diseases. "
            "Return a JSON object with these exact keys: "
            "disease (disease name or 'Healthy'), confidence (High/Medium/Low), "
            "severity (None/Mild/Moderate/Severe), symptoms (1-2 sentences), "
            "organic_treatment (1-2 sentences), chemical_treatment (1-2 sentences), "
            "prevention (1-2 sentences). "
            "If the plant is healthy, set disease='Healthy' and severity='None'. "
            "Only return valid JSON, no extra text."
        )
        vision_model = genai.GenerativeModel("gemini-2.0-flash")
        image_part = {"mime_type": "image/jpeg", "data": image_data}
        response = vision_model.generate_content([prompt, image_part])
        raw = response.text.strip()
        # Clean markdown code blocks if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        return offline_response
    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
            return offline_response
        return offline_response

# -----------------------------------------------
# Phase 2: Crop Calendar
# -----------------------------------------------
CROP_CALENDAR = {
    "Rice":       {"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 10, "harvest_end": 11, "duration": "120-150 days", "water": "High"},
    "Wheat":      {"season": "Rabi",   "sow_start": 10, "sow_end": 12, "harvest_start": 3, "harvest_end": 4, "duration": "120-140 days", "water": "Medium"},
    "Maize":      {"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 9, "harvest_end": 10, "duration": "90-110 days", "water": "Medium"},
    "Cotton":     {"season": "Kharif", "sow_start": 4, "sow_end": 6, "harvest_start": 10, "harvest_end": 12, "duration": "160-180 days", "water": "Medium"},
    "Sugarcane":  {"season": "Zaid",   "sow_start": 2, "sow_end": 3, "harvest_start": 11, "harvest_end": 2, "duration": "300-365 days", "water": "Very High"},
    "Chickpea":   {"season": "Rabi",   "sow_start": 10, "sow_end": 11, "harvest_start": 2, "harvest_end": 3, "duration": "90-120 days", "water": "Low"},
    "Lentil":     {"season": "Rabi",   "sow_start": 10, "sow_end": 11, "harvest_start": 2, "harvest_end": 3, "duration": "100-120 days", "water": "Low"},
    "Mungbean":   {"season": "Zaid",   "sow_start": 3, "sow_end": 4, "harvest_start": 6, "harvest_end": 7, "duration": "60-75 days", "water": "Low"},
    "Blackgram":  {"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 9, "harvest_end": 10, "duration": "70-90 days", "water": "Low"},
    "Pigeonpeas": {"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 12, "harvest_end": 1, "duration": "160-200 days", "water": "Low"},
    "Jute":       {"season": "Kharif", "sow_start": 3, "sow_end": 5, "harvest_start": 7, "harvest_end": 9, "duration": "120-150 days", "water": "High"},
    "Banana":     {"season": "Zaid",   "sow_start": 1, "sow_end": 12, "harvest_start": 1, "harvest_end": 12, "duration": "300-365 days", "water": "High"},
    "Mango":      {"season": "Zaid",   "sow_start": 7, "sow_end": 9, "harvest_start": 4, "harvest_end": 6, "duration": "Perennial", "water": "Low"},
    "Coconut":    {"season": "Zaid",   "sow_start": 6, "sow_end": 9, "harvest_start": 1, "harvest_end": 12, "duration": "Perennial", "water": "Medium"},
    "Coffee":     {"season": "Zaid",   "sow_start": 6, "sow_end": 7, "harvest_start": 11, "harvest_end": 2, "duration": "Perennial", "water": "Medium"},
    "Grapes":     {"season": "Zaid",   "sow_start": 1, "sow_end": 2, "harvest_start": 3, "harvest_end": 5, "duration": "Perennial", "water": "Medium"},
    "Watermelon": {"season": "Zaid",   "sow_start": 2, "sow_end": 4, "harvest_start": 5, "harvest_end": 7, "duration": "70-90 days", "water": "Medium"},
    "Papaya":     {"season": "Zaid",   "sow_start": 6, "sow_end": 9, "harvest_start": 1, "harvest_end": 12, "duration": "Perennial", "water": "Medium"},
    "Orange":     {"season": "Zaid",   "sow_start": 6, "sow_end": 9, "harvest_start": 11, "harvest_end": 2, "duration": "Perennial", "water": "Medium"},
    "Pomegranate":{"season": "Zaid",   "sow_start": 6, "sow_end": 9, "harvest_start": 8, "harvest_end": 11, "duration": "Perennial", "water": "Low"},
    "Apple":      {"season": "Rabi",   "sow_start": 12, "sow_end": 2, "harvest_start": 8, "harvest_end": 10, "duration": "Perennial", "water": "Medium"},
    "Mothbeans":  {"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 9, "harvest_end": 10, "duration": "70-90 days", "water": "Low"},
    "Kidneybeans":{"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 9, "harvest_end": 10, "duration": "80-100 days", "water": "Medium"},
    "Muskmelon":  {"season": "Zaid",   "sow_start": 2, "sow_end": 4, "harvest_start": 5, "harvest_end": 7, "duration": "70-90 days", "water": "Medium"},
}

@app.get("/api/crop-calendar/{state}")
def get_crop_calendar(state: str):
    state_crop_map = {
        "Punjab": ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane"],
        "Haryana": ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane"],
        "Uttar Pradesh": ["Wheat", "Rice", "Sugarcane", "Maize", "Chickpea", "Lentil"],
        "Bihar": ["Rice", "Wheat", "Maize", "Lentil", "Sugarcane", "Jute"],
        "West Bengal": ["Rice", "Jute", "Wheat", "Mungbean", "Blackgram"],
        "Assam": ["Rice", "Jute", "Tea", "Mungbean", "Blackgram"],
        "Odisha": ["Rice", "Jute", "Maize", "Chickpea", "Blackgram"],
        "Andhra Pradesh": ["Rice", "Cotton", "Maize", "Chickpea", "Sugarcane"],
        "Telangana": ["Rice", "Cotton", "Maize", "Chickpea"],
        "Karnataka": ["Rice", "Maize", "Cotton", "Sugarcane", "Coffee", "Coconut"],
        "Tamil Nadu": ["Rice", "Maize", "Sugarcane", "Banana", "Coconut"],
        "Kerala": ["Rice", "Coconut", "Banana", "Coffee", "Rubber"],
        "Maharashtra": ["Cotton", "Sugarcane", "Maize", "Chickpea", "Grapes", "Orange"],
        "Gujarat": ["Cotton", "Wheat", "Rice", "Groundnut", "Mango"],
        "Rajasthan": ["Wheat", "Maize", "Chickpea", "Mothbeans", "Mungbean"],
        "Madhya Pradesh": ["Wheat", "Maize", "Sugarcane", "Chickpea", "Cotton"],
        "Chhattisgarh": ["Rice", "Maize", "Chickpea", "Pigeonpeas"],
        "Jharkhand": ["Rice", "Wheat", "Maize", "Chickpea", "Blackgram"],
        "Himachal Pradesh": ["Apple", "Wheat", "Maize", "Potato"],
        "Jammu & Kashmir": ["Apple", "Wheat", "Maize", "Rice"],
        "Uttarakhand": ["Wheat", "Rice", "Maize", "Apple", "Sugarcane"],
        "Goa": ["Rice", "Coconut", "Cashew", "Mango"],
        "Delhi": ["Wheat", "Rice", "Maize", "Sugarcane"],
    }
    crops_for_state = state_crop_map.get(state, ["Rice", "Wheat", "Maize", "Chickpea"])
    calendar_data = []
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    for crop_name in crops_for_state:
        key = crop_name.lower().replace(" ","").replace("-","")
        # Try to find in CROP_CALENDAR
        info = None
        for k, v in CROP_CALENDAR.items():
            if k.lower().replace(" ","") == key:
                info = v
                break
        if not info:
            info = {"season": "Kharif", "sow_start": 6, "sow_end": 7, "harvest_start": 10, "harvest_end": 11, "duration": "120 days", "water": "Medium"}
        calendar_data.append({
            "crop": crop_name,
            "season": info["season"],
            "sowing_months": [months[i-1] for i in range(int(info["sow_start"]), int(info["sow_end"])+1) if 1 <= i <= 12],
            "harvesting_months": [months[i-1] for i in range(int(info["harvest_start"]), int(info["harvest_end"])+1) if 1 <= i <= 12],
            "duration": info["duration"],
            "water_requirement": info["water"],
            "sow_start": info["sow_start"],
            "sow_end": info["sow_end"],
            "harvest_start": info["harvest_start"],
            "harvest_end": info["harvest_end"],
        })
    return {"state": state, "calendar": calendar_data}

# -----------------------------------------------
# Phase 3: Market Prices Dashboard
# -----------------------------------------------
MARKET_PRICE_BASE = {
    "Rice":        {"min": 1800, "max": 2400, "unit": "quintal", "trend": "stable"},
    "Wheat":       {"min": 2000, "max": 2600, "unit": "quintal", "trend": "rising"},
    "Maize":       {"min": 1500, "max": 1900, "unit": "quintal", "trend": "stable"},
    "Cotton":      {"min": 5500, "max": 7000, "unit": "quintal", "trend": "falling"},
    "Sugarcane":   {"min": 290,  "max": 340,  "unit": "quintal", "trend": "stable"},
    "Chickpea":    {"min": 4800, "max": 6200, "unit": "quintal", "trend": "rising"},
    "Lentil":      {"min": 5200, "max": 6800, "unit": "quintal", "trend": "rising"},
    "Mungbean":    {"min": 6000, "max": 8000, "unit": "quintal", "trend": "stable"},
    "Blackgram":   {"min": 5500, "max": 7500, "unit": "quintal", "trend": "stable"},
    "Pigeonpeas":  {"min": 6000, "max": 7500, "unit": "quintal", "trend": "falling"},
    "Jute":        {"min": 3500, "max": 4500, "unit": "quintal", "trend": "stable"},
    "Banana":      {"min": 800,  "max": 1500, "unit": "quintal", "trend": "stable"},
    "Mango":       {"min": 2000, "max": 5000, "unit": "quintal", "trend": "seasonal"},
    "Coconut":     {"min": 120,  "max": 200,  "unit": "piece",   "trend": "stable"},
    "Coffee":      {"min": 15000,"max": 25000,"unit": "quintal", "trend": "rising"},
    "Tomato":      {"min": 500,  "max": 3000, "unit": "quintal", "trend": "volatile"},
    "Potato":      {"min": 800,  "max": 1500, "unit": "quintal", "trend": "stable"},
    "Onion":       {"min": 600,  "max": 2500, "unit": "quintal", "trend": "volatile"},
}

@app.get("/api/market-prices")
def get_market_prices(state: Optional[str] = None):
    prices = []
    today = datetime.now()
    for crop, base in MARKET_PRICE_BASE.items():
        fluctuation = random.uniform(-0.05, 0.08)
        modal = int(base["min"] + (base["max"] - base["min"]) * 0.55 * (1 + fluctuation))
        # Generate 7-day trend data
        trend_data = []
        prev_price = modal
        for i in range(6, -1, -1):
            date = (today - timedelta(days=i)).strftime("%d %b")
            change = random.uniform(-0.03, 0.04)
            day_price = int(prev_price * (1 + change))
            day_price = max(base["min"], min(base["max"], day_price))
            trend_data.append({"date": date, "price": day_price})
            prev_price = day_price
        prices.append({
            "crop": crop,
            "min_price": base["min"],
            "max_price": base["max"],
            "modal_price": modal,
            "unit": f"₹/{base['unit']}",
            "trend": base["trend"],
            "trend_data": trend_data,
            "last_updated": today.strftime("%d %b %Y, %I:%M %p")
        })
    return {"prices": prices, "source": "Simulated Agmarknet Data", "state": state or "All India"}

# -----------------------------------------------
# Phase 4: Yield Prediction
# -----------------------------------------------
YIELD_BASE = {
    "rice": 3.5, "wheat": 3.2, "maize": 4.0, "cotton": 1.8, "sugarcane": 70.0,
    "chickpea": 1.2, "lentil": 1.0, "mungbean": 0.8, "blackgram": 0.9,
    "pigeonpeas": 1.1, "jute": 2.5, "banana": 30.0, "mango": 8.0,
    "coconut": 6.0, "coffee": 1.5, "grapes": 15.0, "watermelon": 25.0,
    "papaya": 30.0, "orange": 12.0, "pomegranate": 10.0, "apple": 8.0,
    "mothbeans": 0.7, "kidneybeans": 1.0, "muskmelon": 12.0
}

@app.post("/api/yield-estimate")
def estimate_yield(data: CropRequest):
    crop_key = ""
    features = [data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]
    if model:
        prediction = model.predict([features])
        crop_key = str(prediction[0]).lower().replace(" ", "").replace("-", "")
    base_yield = YIELD_BASE.get(crop_key, 2.5)
    # Modifiers based on parameters
    n_factor = min(data.N / 80, 1.2)
    p_factor = min(data.P / 40, 1.1)
    k_factor = min(data.K / 40, 1.1)
    temp_factor = 1.0 if 20 <= data.temperature <= 32 else 0.85
    rain_factor = 1.0 if 600 <= data.rainfall <= 2000 else 0.9
    ph_factor = 1.0 if 6.0 <= data.ph <= 7.5 else 0.88
    final_yield = round(base_yield * n_factor * p_factor * k_factor * temp_factor * rain_factor * ph_factor, 2)
    quality_index = "Excellent" if final_yield >= base_yield * 1.1 else ("Good" if final_yield >= base_yield * 0.9 else "Average")
    water_req_liters = round(data.rainfall * 0.6 + (data.humidity * 2.5), 0)
    return {
        "expected_yield_tons_per_ha": final_yield,
        "base_yield_tons_per_ha": base_yield,
        "quality_index": quality_index,
        "water_requirement_mm": water_req_liters,
        "fertilizer_cost_estimate_inr": int(final_yield * 4500),
        "revenue_estimate_inr": int(final_yield * 18000)
    }

# -----------------------------------------------
# Phase 5: Irrigation Scheduler
# -----------------------------------------------
class IrrigationRequest(BaseModel):
    crop: str
    temperature: float
    humidity: float
    rainfall: float
    soil_type: Optional[str] = "Loamy"

@app.post("/api/irrigation-schedule")
def get_irrigation_schedule(data: IrrigationRequest):
    if gemini_key:
        try:
            prompt = (
                f"You are an expert irrigation engineer for Indian farming.\n"
                f"Crop: {data.crop}\nTemperature: {data.temperature}°C\n"
                f"Humidity: {data.humidity}%\nAnnual Rainfall: {data.rainfall}mm\nSoil: {data.soil_type}\n\n"
                "Create a 7-day irrigation schedule. Return a JSON array of 7 objects, each with:\n"
                "day (Mon/Tue/etc), irrigate (true/false), amount_liters_per_sqm (number), "
                "time_of_day (Morning/Evening/None), method (Drip/Sprinkler/Flood/None), reason (short reason).\n"
                "Only return valid JSON array, no markdown."
            )
            ai_model = genai.GenerativeModel("gemini-2.0-flash")
            response = ai_model.generate_content(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            schedule = json.loads(raw.strip())
            return {"crop": data.crop, "schedule": schedule, "source": "AI Generated"}
        except Exception:
            pass
    # Offline fallback
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    base_amount = max(2, round(10 - (data.rainfall / 500), 1))
    schedule = []
    for i, day in enumerate(days):
        irrigate = i % 2 == 0
        schedule.append({
            "day": day, "irrigate": irrigate,
            "amount_liters_per_sqm": base_amount if irrigate else 0,
            "time_of_day": "Morning" if irrigate else "None",
            "method": "Drip" if irrigate else "None",
            "reason": "Standard irrigation cycle" if irrigate else "Rest day"
        })
    return {"crop": data.crop, "schedule": schedule, "source": "Offline Estimate"}

# -----------------------------------------------
# Phase 6: Government Schemes
# -----------------------------------------------
SCHEMES_DB = [
    {"name": "PM-KISAN", "full_name": "Pradhan Mantri Kisan Samman Nidhi", "benefit": "₹6,000/year direct income support in 3 installments", "eligibility": "All landholding farmers", "crops": "all", "ministry": "Ministry of Agriculture", "link": "https://pmkisan.gov.in", "icon": "🌾", "states": "all"},
    {"name": "PMFBY", "full_name": "Pradhan Mantri Fasal Bima Yojana", "benefit": "Crop insurance against natural calamities, pest & disease", "eligibility": "All farmers growing notified crops", "crops": "Rice,Wheat,Maize,Cotton,Sugarcane", "ministry": "Ministry of Agriculture", "link": "https://pmfby.gov.in", "icon": "🛡️", "states": "all"},
    {"name": "Soil Health Card", "full_name": "Soil Health Card Scheme", "benefit": "Free soil testing + customized fertilizer recommendations", "eligibility": "All farmers", "crops": "all", "ministry": "Ministry of Agriculture", "link": "https://soilhealth.dac.gov.in", "icon": "🧪", "states": "all"},
    {"name": "PKVY", "full_name": "Paramparagat Krishi Vikas Yojana", "benefit": "₹50,000/hectare for organic farming over 3 years", "eligibility": "Farmers adopting organic farming", "crops": "all", "ministry": "Ministry of Agriculture", "link": "https://pgsindia-ncof.gov.in", "icon": "🌿", "states": "all"},
    {"name": "PM Krishi Sinchai Yojana", "full_name": "Pradhan Mantri Krishi Sinchayee Yojana", "benefit": "Subsidy on drip/sprinkler irrigation (up to 90%)", "eligibility": "Small & marginal farmers", "crops": "all", "ministry": "Ministry of Jal Shakti", "link": "https://pmksy.gov.in", "icon": "💧", "states": "all"},
    {"name": "KCC", "full_name": "Kisan Credit Card", "benefit": "Low-interest crop loans (4% pa) up to ₹3 lakh", "eligibility": "All farmers, tenant farmers, sharecroppers", "crops": "all", "ministry": "Ministry of Finance", "link": "https://www.nabard.org", "icon": "💳", "states": "all"},
    {"name": "eNAM", "full_name": "National Agriculture Market", "benefit": "Online mandi — sell crops at best prices across India", "eligibility": "All registered farmers", "crops": "all", "ministry": "Ministry of Agriculture", "link": "https://www.enam.gov.in", "icon": "🏪", "states": "all"},
    {"name": "Agri Infra Fund", "full_name": "Agriculture Infrastructure Fund", "benefit": "₹1 lakh crore fund for post-harvest infra at low interest", "eligibility": "FPOs, cooperatives, startups, farmers", "crops": "all", "ministry": "Ministry of Agriculture", "link": "https://agriinfra.dac.gov.in", "icon": "🏗️", "states": "all"},
    {"name": "NHM", "full_name": "National Horticulture Mission", "benefit": "Subsidy on seeds, planting material, irrigation for horticulture", "eligibility": "Horticulture farmers", "crops": "Banana,Mango,Coconut,Orange,Apple,Grapes,Papaya", "ministry": "Ministry of Agriculture", "link": "https://nhb.gov.in", "icon": "🍎", "states": "all"},
    {"name": "RKVY", "full_name": "Rashtriya Krishi Vikas Yojana", "benefit": "State-level grants for agriculture infra & innovation", "eligibility": "State governments, farmer groups", "crops": "all", "ministry": "Ministry of Agriculture", "link": "https://rkvy.nic.in", "icon": "📈", "states": "all"},
]

@app.get("/api/schemes")
def get_government_schemes(state: Optional[str] = None, crop: Optional[str] = None):
    filtered = []
    for scheme in SCHEMES_DB:
        crop_match = scheme["crops"] == "all" or (crop and crop.capitalize() in scheme["crops"])
        state_match = scheme["states"] == "all"
        if crop:
            if crop_match:
                filtered.append(scheme)
        else:
            filtered.append(scheme)
    return {"schemes": filtered, "total": len(filtered), "state": state, "crop": crop}

# -----------------------------------------------
# Serve new pages
# -----------------------------------------------

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

@app.get("/dashboard")
def serve_dashboard():
    return FileResponse("static/dashboard.html")

