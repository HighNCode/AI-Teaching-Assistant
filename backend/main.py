import os
from anyio import ConnectionFailed
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth, projects
from database import connect_to_mongo, close_mongo_connection, get_db

load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    close_mongo_connection()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/api/v1/healthz")
def health_check():
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        # The ismaster command is cheap and does not require auth.
        db.client.admin.command('ismaster')
        return {"status": "ok", "database": "connected"}
    except ConnectionFailed:
        raise HTTPException(status_code=500, detail="Database connection failed")

app.include_router(auth.router, tags=["auth"])
app.include_router(projects.router, tags=["projects"])

# Serve static files
# Serve static files from the frontend build directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    # Return the index.html file for any path that is not an API route
    # This allows the frontend to handle routing
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)