from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database
from pydantic import BaseModel
import datetime
import os
import google.generativeai as genai

# Configure GenAI
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

# Create SQLite Database Tables on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="NutriFlow Health Engine")

# CORS middleware to allow the frontend to safely interact
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schemas
class HabitCreate(BaseModel):
    name: str
    is_healthy: bool

class ChatMessage(BaseModel):
    message: str

# API Routes
@app.get("/api/habits")
def get_habits(db: Session = Depends(get_db)):
    """Fetch all recorded user habits"""
    return db.query(models.Habit).order_by(models.Habit.timestamp.desc()).all()

@app.post("/api/habits")
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    """Log a new habit"""
    db_habit = models.Habit(name=habit.name, is_healthy=habit.is_healthy)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@app.post("/api/chat")
def chatbot(chat: ChatMessage):
    """
    AI Health Chatbot
    Analyzes user requests and provides food/habit recommendations.
    """
    msg = chat.message.lower()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        if "breakfast" in msg or "morning" in msg:
            reply = "For breakfast, aim for complex carbs and protein. Oatmeal with berries and walnuts provides sustained energy. Avoid sugary cereals which cause mid-day crashes!"
        elif "night" in msg or "dinner" in msg or "evening" in msg:
            reply = "At night, your digestion slows down. Lean proteins like grilled salmon or chicken with steamed asparagus are perfect. Stop eating 3 hours before sleep."
        elif "snack" in msg or "hungry" in msg:
            reply = "Healthy snacks keep your metabolism moving! Try apple slices with almond butter, Greek yogurt, or a handful of unsalted almonds."
        elif "bad" in msg or "sugar" in msg or "junk" in msg:
            reply = "Sugar spikes your insulin and creates false hunger. A bad habit is late-night snacking. Try drinking a large glass of water or herbal tea first to see if you're actually just dehydrated."
        else:
            reply = "[AI Disconnected - Set GEMINI_API_KEY for Advanced Recommendations]\nI'm your NutriFlow AI! Log your habits on the dashboard, and ask me what foods are best to eat during specific times of the day."
        return {"reply": reply}
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"You are NutriFlow AI, an advanced AI health and nutrition coach for an international health app. The user says: '{chat.message}'. Give a concise, empathetic, and expert answer (max 3 sentences) focusing on healthy habits and good food options."
        response = model.generate_content(prompt)
        reply = response.text
    except Exception as e:
        reply = f"Error connecting to AI Server: {str(e)}"
        
    return {"reply": reply}
