from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PlayerState(BaseModel):
    name: str = "Hoàng Hiệp Sĩ"
    x: float = 140.0
    y: float = 230.0
    direction: str = "down" # "up", "down", "left", "right"
    hp: int = 100
    max_hp: int = 100
    energy: int = 100
    max_energy: int = 100
    gold: int = 150
    level: int = 1
    xp: int = 0
    equipped_slot: int = 0

class Item(BaseModel):
    id: str
    name: str
    category: str # "tool", "seed", "crop", "potion", "material", "fish"
    icon: str # key in UI / sprite reference
    count: int = 1
    description: str = ""
    buy_price: int = 0
    sell_price: int = 0

class FarmPlot(BaseModel):
    id: int
    tile_x: int
    tile_y: int
    is_tilled: bool = False
    is_watered: bool = False
    seed_type: Optional[str] = None # "tomato", "corn", "carrot"
    stage: int = 0 # 0: seed, 1: sprout, 2: blooming, 3: mature
    max_stage: int = 3
    grow_time_seconds: int = 15 # thời gian tăng trưởng mỗi giai đoạn

class Quest(BaseModel):
    id: str
    title: str
    description: str
    reward_gold: int
    reward_xp: int
    reward_item: Optional[str] = None
    target_type: str # "till", "plant", "water", "harvest", "sell", "kill_slime", "fish"
    target_count: int
    current_count: int = 0
    is_completed: bool = False
    is_claimed: bool = False

class ShopItem(BaseModel):
    id: str
    name: str
    category: str
    price: int
    sell_price: int
    icon: str
    description: str

class GameSaveData(BaseModel):
    player: PlayerState
    inventory: List[Item]
    farm_plots: List[FarmPlot]
    quests: List[Quest]
    world_time: float = 8.0 # 8:00 AM
    day: int = 1

# Request Payloads
class TillRequest(BaseModel):
    plot_id: int

class PlantRequest(BaseModel):
    plot_id: int
    seed_id: str

class WaterRequest(BaseModel):
    plot_id: int

class HarvestRequest(BaseModel):
    plot_id: int

class ShopTradeRequest(BaseModel):
    item_id: str
    quantity: int = 1

class UseItemRequest(BaseModel):
    item_id: str

class UpdatePlayerRequest(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    direction: Optional[str] = None
    hp: Optional[int] = None
    energy: Optional[int] = None
    gold: Optional[int] = None
    xp: Optional[int] = None
    level: Optional[int] = None
    equipped_slot: Optional[int] = None
