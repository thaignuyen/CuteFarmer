import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .core.config import FRONTEND_DIR, PROJECT_TITLE, VERSION
from .api import player, farm, inventory, shop, quests, game

app = FastAPI(
    title=PROJECT_TITLE,
    version=VERSION,
    description="Backend API cho Game Nông Trại Phiêu Lưu Pixel Art - Cute Fantasy"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(player.router, prefix="/api")
app.include_router(farm.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(shop.router, prefix="/api")
app.include_router(quests.router, prefix="/api")
app.include_router(game.router, prefix="/api")

# Static assets and frontend serving
assets_dir = FRONTEND_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

css_dir = FRONTEND_DIR / "css"
if css_dir.exists():
    app.mount("/css", StaticFiles(directory=str(css_dir)), name="css")

js_dir = FRONTEND_DIR / "js"
if js_dir.exists():
    app.mount("/js", StaticFiles(directory=str(js_dir)), name="js")

@app.get("/")
def serve_root():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Frontend index.html not found!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "game": PROJECT_TITLE, "version": VERSION}
