# NutriFlow AI - International Hackathon Project

NutriFlow is a full-stack, AI-driven health and dietary application featuring a vibrant, advanced UI/UX dashboard. It serves as a personal AI nutritional coach and habit-tracking platform.

## Features
- **Advanced Dynamic UI/UX:** A stunning, premium "glassmorphism" bright layout designed for both desktop and mobile. 
- **AI NutriCoach:** Powered by Google's Gemini Advanced Large Language Model for tailored micro-habits and situational dietary recommendations.
- **Real-time Habit Tracking:** A live timeline to register healthy vs unhealthy behaviors, synced securely to an SQLite database.
- **Metrics Ring Displays:** Daily diagnostic scoring and analytical visuals.

## Tech Stack
- **Frontend:** Pure HTML5, CSS3, ES6 JavaScript (No bloated framework overhead). Extremely fast and strictly responsive.
- **Backend:** Python + FastAPI 
- **Database:** SQLite & SQLAlchemy
- **AI Pipeline:** Google Generative AI (`gemini-1.5-flash`)

## How to Run

### 1. Start the Backend API
You will need Python installed.
```bash
cd backend
pip install -r requirements.txt
# Set your Gemini API Key (optional, but needed for real AI responses)
# Windows: $env:GEMINI_API_KEY="your-key-here"
# Mac/Linux: export GEMINI_API_KEY="your-key-here"

# Run the FastAPI server
uvicorn main:app --reload
```
The backend will be running at `http://localhost:8000`

### 2. Start the Frontend
In a new terminal window:
```bash
cd frontend
# Run a quick python server to serve the HTML/CSS
python -m http.server 5500
```
Then navigate to `http://localhost:5500` in your web browser.

Let's win this hackathon! 🚀

