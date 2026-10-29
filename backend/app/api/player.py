from fastapi import APIRouter, HTTPException
from ..services.game_service import game_service
from ..models.schemas import PlayerState, UpdatePlayerRequest

router = APIRouter(prefix="/player", tags=["Player"])

@router.get("", response_model=PlayerState)
def get_player():
    """Lấy thông tin và trạng thái hiện tại của người chơi"""
    return game_service.state.player

@router.post("/update", response_model=PlayerState)
def update_player(req: UpdatePlayerRequest):
    """Cập nhật tọa độ, hướng di chuyển, HP, thể lực của nhân vật"""
    return game_service.update_player(req)

@router.post("/rest")
def rest_player():
    """Nghỉ ngơi qua đêm (hồi máu & thể lực, qua ngày mới)"""
    player, day = game_service.rest_player()
    return {"success": True, "message": f"Chào buổi sáng! Đã bước sang ngày thứ {day}.", "player": player, "day": day}
