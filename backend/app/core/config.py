import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SAVE_FILE_PATH = DATA_DIR / "game_save.json"

FRONTEND_DIR = BASE_DIR.parent / "frontend"

PROJECT_TITLE = "Cute Fantasy RPG - Village Life"
VERSION = "1.0.0"
