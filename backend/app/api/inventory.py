from fastapi import APIRouter, HTTPException
from typing import List
from ..services.game_service import game_service
from ..models.schemas import Item, UseItemRequest

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[Item])
def get_inventory():
    """Lấy danh sách vật phẩm trong kho đồ/túi hành trang"""
    return game_service.state.inventory

@router.post("/use")
def use_item(req: UseItemRequest):
    """Sử dụng bình máu, nước tăng lực hoặc vật phẩm tiêu hao"""
    success, msg = game_service.use_item(req.item_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "success": True,
        "message": msg,
        "player": game_service.state.player,
        "inventory": game_service.state.inventory
    }
