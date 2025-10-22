# main.py
import os
from fastapi import FastAPI
from datetime import datetime

app = FastAPI(title="AI Agent API with BrowserUse", version="1.0")

@app.get("/")
def read_root():
    return {"message": "AI Agent API is running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8888)
