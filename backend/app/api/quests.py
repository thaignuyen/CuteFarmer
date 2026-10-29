from fastapi import APIRouter, HTTPException
from typing import List
from ..services.game_service import game_service
from ..models.schemas import Quest

router = APIRouter(prefix="/quests", tags=["Quests"])

@router.get("", response_model=List[Quest])
def get_quests():
    """Lấy danh sách nhiệm vụ và tiến độ hiện tại"""
    return game_service.state.quests

@router.post("/{quest_id}/claim")
def claim_quest(quest_id: str):
    """Nhận phần thưởng khi hoàn thành nhiệm vụ"""
    success, msg = game_service.claim_quest_reward(quest_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "success": True,
        "message": msg,
        "player": game_service.state.player,
        "quests": game_service.state.quests
    }
