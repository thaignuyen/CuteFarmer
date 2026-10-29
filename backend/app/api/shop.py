from fastapi import APIRouter, HTTPException
from typing import List
from ..services.game_service import game_service
from ..models.schemas import ShopItem, ShopTradeRequest

router = APIRouter(prefix="/shop", tags=["Shop"])

@router.get("/items", response_model=List[ShopItem])
def get_shop_items():
    """Lấy danh mục hàng hóa tại sạp chợ làng"""
    return game_service.shop_catalog

@router.post("/buy")
def buy(req: ShopTradeRequest):
    """Mua vật phẩm/hạt giống từ sạp chợ"""
    success, msg = game_service.buy_item(req.item_id, req.quantity)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "success": True,
        "message": msg,
        "gold": game_service.state.player.gold,
        "inventory": game_service.state.inventory
    }

@router.post("/sell")
def sell(req: ShopTradeRequest):
    """Bán nông sản, cá, vật phẩm thu hoạch lấy Vàng"""
    success, msg = game_service.sell_item(req.item_id, req.quantity)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {
        "success": True,
        "message": msg,
        "gold": game_service.state.player.gold,
        "inventory": game_service.state.inventory
    }
