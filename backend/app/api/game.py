from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.game_service import game_service
from ..models.schemas import GameSaveData

router = APIRouter(prefix="/game", tags=["Game State"])

class DefeatEnemyRequest(BaseModel):
    enemy_type: str = "slime"

@router.get("/state", response_model=GameSaveData)
def get_state():
    """Lấy toàn bộ dữ liệu trạng thái thế giới và nhân vật"""
    return game_service.state

@router.post("/save")
def save_game():
    """Lưu tiến trình game thủ công"""
    success = game_service.save_game()
    return {"success": success, "message": "Đã lưu dữ liệu game thành công!" if success else "Lưu thất bại!"}

@router.post("/reset")
def reset_game():
    """Khởi tạo lại ván chơi mới từ đầu"""
    new_state = game_service.reset_game()
    return {"success": True, "message": "Đã làm mới dữ liệu thế giới thành công!", "state": new_state}

@router.post("/combat/defeat")
def defeat_enemy(req: DefeatEnemyRequest):
    """Xử lý sự kiện tiêu diệt quái vật (rơi đồ & cộng kinh nghiệm)"""
    msg, xp_gain, item = game_service.defeat_enemy(req.enemy_type)
    return {
        "success": True,
        "message": msg,
        "xp_gain": xp_gain,
        "dropped_item": item,
        "player": game_service.state.player,
        "inventory": game_service.state.inventory
    }

@router.post("/fish")
def fish():
    """Xử lý hoạt động câu cá tại bến nước"""
    success, msg, item = game_service.catch_fish()
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "success": True,
        "message": msg,
        "item": item,
        "player": game_service.state.player,
        "inventory": game_service.state.inventory
    }
