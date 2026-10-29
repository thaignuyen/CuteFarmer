from fastapi import APIRouter, HTTPException
from typing import List
from ..services.game_service import game_service
from ..models.schemas import (
    FarmPlot, TillRequest, PlantRequest, WaterRequest, HarvestRequest
)

router = APIRouter(prefix="/farm", tags=["Farm"])

@router.get("/plots", response_model=List[FarmPlot])
def get_plots():
    """Lấy danh sách các ô đất nông trại và trạng thái cây trồng"""
    return game_service.state.farm_plots

@router.post("/till")
def till(req: TillRequest):
    """Xới đất bằng cuốc"""
    success, msg, plot = game_service.till_plot(req.plot_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "plot": plot, "player": game_service.state.player}

@router.post("/plant")
def plant(req: PlantRequest):
    """Gieo hạt giống vào ô đất đã xới"""
    success, msg, plot = game_service.plant_seed(req.plot_id, req.seed_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "plot": plot, "inventory": game_service.state.inventory}

@router.post("/water")
def water(req: WaterRequest):
    """Tưới nước cho ô đất"""
    success, msg, plot = game_service.water_plot(req.plot_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "plot": plot, "player": game_service.state.player}

@router.post("/harvest")
def harvest(req: HarvestRequest):
    """Thu hoạch cây trồng đã chín muồi"""
    success, msg, item = game_service.harvest_plot(req.plot_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "item": item, "player": game_service.state.player, "inventory": game_service.state.inventory}
