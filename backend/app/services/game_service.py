import json
import time
from pathlib import Path
from typing import List, Optional, Tuple
from ..core.config import SAVE_FILE_PATH
from ..models.schemas import (
    PlayerState, Item, FarmPlot, Quest, ShopItem, GameSaveData,
    TillRequest, PlantRequest, WaterRequest, HarvestRequest,
    ShopTradeRequest, UpdatePlayerRequest
)

class GameService:
    def __init__(self):
        self.state: Optional[GameSaveData] = None
        self.shop_catalog: List[ShopItem] = self._init_shop_catalog()
        self.load_or_init_game()

    def _init_shop_catalog(self) -> List[ShopItem]:
        return [
            # Hạt giống
            ShopItem(id="seed_tomato", name="Hạt Cà Chua", category="seed", price=15, sell_price=8, icon="seed_tomato", description="Nảy mầm nhanh, cho trái đỏ mọng."),
            ShopItem(id="seed_corn", name="Hạt Bắp Ngô", category="seed", price=25, sell_price=12, icon="seed_corn", description="Hạt giống bắp ngọt, năng suất cao."),
            ShopItem(id="seed_carrot", name="Hạt Cà Rốt", category="seed", price=20, sell_price=10, icon="seed_carrot", description="Củ quả giàu dinh dưỡng cho thỏ và người."),
            # Nông sản (bán lại)
            ShopItem(id="crop_tomato", name="Cà Chua Tươi", category="crop", price=40, sell_price=35, icon="crop_tomato", description="Cà chua chín mọng vừa thu hoạch."),
            ShopItem(id="crop_corn", name="Bắp Ngô Vàng", category="crop", price=60, sell_price=55, icon="crop_corn", description="Bắp ngô vàng óng ả thơm ngon."),
            ShopItem(id="crop_carrot", name="Cà Rốt Cam", category="crop", price=50, sell_price=45, icon="crop_carrot", description="Cà rốt tươi ngon giòn rụm."),
            # Thủy sản & Chiến lợi phẩm
            ShopItem(id="item_fish", name="Cá Chép Suối", category="fish", price=60, sell_price=50, icon="item_fish", description="Cá tươi đánh bắt từ dòng sông làng."),
            ShopItem(id="item_slime_jelly", name="Thạch Slime", category="material", price=30, sell_price=25, icon="item_slime_jelly", description="Chiến lợi phẩm dẻo dai từ quái Slime."),
            # Nhu yếu phẩm
            ShopItem(id="potion_health", name="Bình Máu Nhỏ", category="potion", price=30, sell_price=15, icon="potion_health", description="Hồi phục 50 Máu tức thì."),
            ShopItem(id="potion_energy", name="Nước Tăng Lực", category="potion", price=25, sell_price=12, icon="potion_energy", description="Hồi phục 50 Thể lực để tiếp tục làm vườn.")
        ]

    def _create_default_state(self) -> GameSaveData:
        # Default Player: Vị trí xuất hiện ở lối vào làng (gần nhà và nông trại)
        player = PlayerState(
            name="Hoàng Hiệp Sĩ",
            x=140.0,
            y=240.0,
            direction="down",
            hp=100,
            max_hp=100,
            energy=100,
            max_energy=100,
            gold=100,
            level=1,
            xp=0,
            equipped_slot=0
        )

        # Default Hotbar / Inventory Items
        inventory = [
            Item(id="tool_hoe", name="Cuốc Nông Nghiệp", category="tool", icon="tool_hoe", count=1, description="Dùng để xới đất trồng trọt."),
            Item(id="tool_watering_can", name="Bình Tưới Nước", category="tool", icon="tool_watering_can", count=1, description="Tưới nước giúp cây mau lớn."),
            Item(id="tool_axe", name="Rìu Đốn Củi", category="tool", icon="tool_axe", count=1, description="Dùng để đốn củi và dọn vật cản."),
            Item(id="tool_sword", name="Kiếm Rỉ Sét", category="tool", icon="tool_sword", count=1, description="Vũ khí cơ bản để tiêu diệt quái vật."),
            Item(id="tool_fishing_rod", name="Cần Câu Tre", category="tool", icon="tool_fishing_rod", count=1, description="Dùng để câu cá tại bến sông."),
            Item(id="seed_tomato", name="Hạt Cà Chua", category="seed", icon="seed_tomato", count=5, description="Hạt giống cà chua chín mọng.", buy_price=15, sell_price=8),
            Item(id="seed_corn", name="Hạt Bắp Ngô", category="seed", icon="seed_corn", count=3, description="Hạt giống bắp ngô ngọt.", buy_price=25, sell_price=12),
            Item(id="potion_health", name="Bình Máu Nhỏ", category="potion", icon="potion_health", count=2, description="Hồi phục 50 HP.", buy_price=30, sell_price=15)
        ]

        # 6 ô nông trại ở góc trên bên trái (vùng đất Farm plot như hình mẫu)
        # Tọa độ pixel tương ứng trên map 630x500:
        # Ô 1: (30, 95), Ô 2: (50, 95), Ô 3: (70, 95)
        # Ô 4: (30, 115), Ô 5: (50, 115), Ô 6: (70, 115)
        farm_plots = [
            FarmPlot(id=1, tile_x=25, tile_y=95, is_tilled=True, is_watered=True, seed_type="seed_tomato", stage=2),
            FarmPlot(id=2, tile_x=45, tile_y=95, is_tilled=True, is_watered=True, seed_type="seed_corn", stage=1),
            FarmPlot(id=3, tile_x=65, tile_y=95, is_tilled=True, is_watered=False, seed_type="seed_carrot", stage=3),
            FarmPlot(id=4, tile_x=25, tile_y=115, is_tilled=True, is_watered=False, seed_type=None, stage=0),
            FarmPlot(id=5, tile_x=45, tile_y=115, is_tilled=False, is_watered=False, seed_type=None, stage=0),
            FarmPlot(id=6, tile_x=65, tile_y=115, is_tilled=False, is_watered=False, seed_type=None, stage=0),
        ]

        # Quests cơ bản gắn liền cốt truyện nông trại và phiêu lưu
        quests = [
            Quest(
                id="q1_till",
                title="Khai Khẩn Đất Đai",
                description="Trang bị Cuốc và xới tơi xốp ít nhất 2 ô đất trong vườn.",
                reward_gold=30,
                reward_xp=50,
                reward_item="seed_tomato",
                target_type="till",
                target_count=2,
                current_count=0
            ),
            Quest(
                id="q2_plant_water",
                title="Gieo Mầm Sự Sống",
                description="Gieo hạt giống và dùng Bình tưới nước cho cây trồng.",
                reward_gold=40,
                reward_xp=60,
                reward_item="potion_energy",
                target_type="water",
                target_count=2,
                current_count=0
            ),
            Quest(
                id="q3_harvest",
                title="Vụ Mùa Bội Thu",
                description="Chăm sóc và thu hoạch 2 luống nông sản chín mọng.",
                reward_gold=50,
                reward_xp=80,
                target_type="harvest",
                target_count=2,
                current_count=0
            ),
            Quest(
                id="q4_merchant",
                title="Giao Thương Thị Trấn",
                description="Đem nông sản hoặc cá ra sạp chợ trung tâm bán lấy tiền.",
                reward_gold=60,
                reward_xp=100,
                target_type="sell",
                target_count=1,
                current_count=0
            ),
            Quest(
                id="q5_slime_hunter",
                title="Bảo Vệ Đàn Gà",
                description="Dùng Kiếm tiêu diệt 2 quái Slime xanh đang rình rập quanh làng.",
                reward_gold=80,
                reward_xp=150,
                reward_item="potion_health",
                target_type="kill_slime",
                target_count=2,
                current_count=0
            ),
            Quest(
                id="q6_angler",
                title="Thú Vui Câu Cá",
                description="Đến bến cầu gỗ thả cần và câu được ít nhất 1 con cá tươi.",
                reward_gold=50,
                reward_xp=70,
                target_type="fish",
                target_count=1,
                current_count=0
            )
        ]

        return GameSaveData(
            player=player,
            inventory=inventory,
            farm_plots=farm_plots,
            quests=quests,
            world_time=8.0,
            day=1
        )

    def load_or_init_game(self) -> GameSaveData:
        if SAVE_FILE_PATH.exists():
            try:
                with open(SAVE_FILE_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.state = GameSaveData(**data)
                    return self.state
            except Exception as e:
                print(f"[GameService] Error loading save file: {e}. Reinitializing default state.")
        
        self.state = self._create_default_state()
        self.save_game()
        return self.state

    def save_game(self) -> bool:
        if not self.state:
            return False
        try:
            with open(SAVE_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump(self.state.model_dump(), f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"[GameService] Error saving game: {e}")
            return False

    def reset_game(self) -> GameSaveData:
        self.state = self._create_default_state()
        self.save_game()
        return self.state

    # Business: Player Stats & Progression
    def update_player(self, req: UpdatePlayerRequest) -> PlayerState:
        p = self.state.player
        if req.x is not None: p.x = req.x
        if req.y is not None: p.y = req.y
        if req.direction is not None: p.direction = req.direction
        if req.hp is not None: p.hp = max(0, min(p.max_hp, req.hp))
        if req.energy is not None: p.energy = max(0, min(p.max_energy, req.energy))
        if req.gold is not None: p.gold = max(0, req.gold)
        if req.equipped_slot is not None: p.equipped_slot = req.equipped_slot
        if req.xp is not None:
            p.xp = req.xp
            # Auto Level up logic (mỗi level cần level * 100 xp)
            needed_xp = p.level * 100
            while p.xp >= needed_xp:
                p.xp -= needed_xp
                p.level += 1
                p.max_hp += 10
                p.hp = p.max_hp
                p.max_energy += 10
                p.energy = p.max_energy
                needed_xp = p.level * 100
        self.save_game()
        return p

    def rest_player(self) -> Tuple[PlayerState, int]:
        p = self.state.player
        p.hp = p.max_hp
        p.energy = p.max_energy
        self.state.day += 1
        self.state.world_time = 8.0 # 8h sáng
        # Cây trồng qua đêm lớn lên
        for plot in self.state.farm_plots:
            if plot.seed_type and plot.is_watered:
                if plot.stage < plot.max_stage:
                    plot.stage += 1
            plot.is_watered = False # Sang ngày mới đất khô cần tưới lại
        self.save_game()
        return p, self.state.day

    # Business: Farming Operations
    def till_plot(self, plot_id: int) -> Tuple[bool, str, Optional[FarmPlot]]:
        plot = next((p for p in self.state.farm_plots if p.id == plot_id), None)
        if not plot:
            return False, "Không tìm thấy ô đất!", None
        if plot.is_tilled:
            return False, "Ô đất đã được xới rồi!", plot
        if self.state.player.energy < 5:
            return False, "Bạn quá mệt để xới đất! Cần ít nhất 5 Thể lực.", plot

        self.state.player.energy -= 5
        plot.is_tilled = True
        self._progress_quest("till", 1)
        self.save_game()
        return True, "Đã xới đất tơi xốp thành công!", plot

    def plant_seed(self, plot_id: int, seed_id: str) -> Tuple[bool, str, Optional[FarmPlot]]:
        plot = next((p for p in self.state.farm_plots if p.id == plot_id), None)
        if not plot:
            return False, "Không tìm thấy ô đất!", None
        if not plot.is_tilled:
            return False, "Cần phải xới đất trước khi gieo hạt!", plot
        if plot.seed_type is not None:
            return False, "Ô đất này đã có hạt giống đang phát triển!", plot

        # Kiểm tra túi đồ có hạt giống không
        item = next((i for i in self.state.inventory if i.id == seed_id and i.count > 0), None)
        if not item:
            return False, "Bạn không có loại hạt giống này!", plot

        item.count -= 1
        if item.count <= 0:
            self.state.inventory.remove(item)

        plot.seed_type = seed_id
        plot.stage = 0
        self._progress_quest("plant", 1)
        self.save_game()
        return True, f"Đã gieo {item.name} vào đất!", plot

    def water_plot(self, plot_id: int) -> Tuple[bool, str, Optional[FarmPlot]]:
        plot = next((p for p in self.state.farm_plots if p.id == plot_id), None)
        if not plot:
            return False, "Không tìm thấy ô đất!", None
        if not plot.is_tilled:
            return False, "Chỉ có thể tưới đất đã xới!", plot
        if plot.is_watered:
            return False, "Đất đã đủ ẩm rồi!", plot
        if self.state.player.energy < 3:
            return False, "Không đủ thể lực để tưới nước! Cần ít nhất 3 Thể lực.", plot

        self.state.player.energy -= 3
        plot.is_watered = True
        self._progress_quest("water", 1)
        self.save_game()
        return True, "Đã tưới nước mát cho luống đất!", plot

    def harvest_plot(self, plot_id: int) -> Tuple[bool, str, Optional[Item]]:
        plot = next((p for p in self.state.farm_plots if p.id == plot_id), None)
        if not plot:
            return False, "Không tìm thấy ô đất!", None
        if not plot.seed_type:
            return False, "Chưa có cây gì để thu hoạch!", None
        if plot.stage < plot.max_stage:
            return False, "Cây trồng chưa chín muồi, hãy kiên nhẫn đợi thêm!", None

        # Bản đồ seed sang crop
        crop_map = {
            "seed_tomato": ("crop_tomato", "Cà Chua Tươi", "Cà chua chín mọng vừa thu hoạch.", 35),
            "seed_corn": ("crop_corn", "Bắp Ngô Vàng", "Bắp ngô vàng óng ả thơm ngon.", 55),
            "seed_carrot": ("crop_carrot", "Cà Rốt Cam", "Cà rốt tươi ngon giòn rụm.", 45)
        }
        crop_info = crop_map.get(plot.seed_type, ("crop_tomato", "Nông Sản Tươi", "Nông sản tươi ngon", 30))

        # Thêm vào kho đồ
        harvested_item = self._add_item_to_inventory(
            crop_info[0], crop_info[1], "crop", crop_info[0], 1, crop_info[2], 0, crop_info[3]
        )

        # Reset plot
        plot.seed_type = None
        plot.stage = 0
        plot.is_watered = False

        # Thưởng XP cho người chơi
        self.state.player.xp += 25
        self._progress_quest("harvest", 1)
        self.save_game()
        return True, f"Thu hoạch thành công 1 {harvested_item.name}! (+25 XP)", harvested_item

    # Business: Inventory Management
    def _add_item_to_inventory(self, item_id: str, name: str, category: str, icon: str,
                              count: int, desc: str, buy_price: int, sell_price: int) -> Item:
        existing = next((i for i in self.state.inventory if i.id == item_id), None)
        if existing:
            existing.count += count
            return existing
        else:
            new_item = Item(
                id=item_id, name=name, category=category, icon=icon,
                count=count, description=desc, buy_price=buy_price, sell_price=sell_price
            )
            self.state.inventory.append(new_item)
            return new_item

    def use_item(self, item_id: str) -> Tuple[bool, str]:
        item = next((i for i in self.state.inventory if i.id == item_id and i.count > 0), None)
        if not item:
            return False, "Không tìm thấy vật phẩm trong túi đồ!"

        p = self.state.player
        if item.id == "potion_health":
            p.hp = min(p.max_hp, p.hp + 50)
            item.count -= 1
            if item.count <= 0: self.state.inventory.remove(item)
            self.save_game()
            return True, "Đã uống Bình Máu (+50 HP)!"
        elif item.id == "potion_energy":
            p.energy = min(p.max_energy, p.energy + 50)
            item.count -= 1
            if item.count <= 0: self.state.inventory.remove(item)
            self.save_game()
            return True, "Đã uống Nước Tăng Lực (+50 Thể lực)!"
        return False, "Vật phẩm này không thể dùng trực tiếp!"

    # Business: Shop Buy & Sell
    def buy_item(self, item_id: str, quantity: int = 1) -> Tuple[bool, str]:
        if quantity <= 0:
            return False, "Số lượng mua không hợp lệ!"
        shop_item = next((s for s in self.shop_catalog if s.id == item_id), None)
        if not shop_item:
            return False, "Mặt hàng này không có trong sạp chợ!"

        total_cost = shop_item.price * quantity
        if self.state.player.gold < total_cost:
            return False, f"Không đủ Vàng! Cần {total_cost} Vàng nhưng bạn chỉ có {self.state.player.gold} Vàng."

        self.state.player.gold -= total_cost
        self._add_item_to_inventory(
            shop_item.id, shop_item.name, shop_item.category, shop_item.icon,
            quantity, shop_item.description, shop_item.price, shop_item.sell_price
        )
        self.save_game()
        return True, f"Mua thành công {quantity}x {shop_item.name} với giá {total_cost} Vàng!"

    def sell_item(self, item_id: str, quantity: int = 1) -> Tuple[bool, str]:
        if quantity <= 0:
            return False, "Số lượng bán không hợp lệ!"
        inv_item = next((i for i in self.state.inventory if i.id == item_id and i.count >= quantity), None)
        if not inv_item:
            return False, "Bạn không có đủ số lượng vật phẩm này để bán!"

        sell_price = inv_item.sell_price
        if sell_price <= 0:
            # Check catalog
            cat = next((s for s in self.shop_catalog if s.id == item_id), None)
            sell_price = cat.sell_price if cat else 10

        total_gain = sell_price * quantity
        inv_item.count -= quantity
        if inv_item.count <= 0:
            self.state.inventory.remove(inv_item)

        self.state.player.gold += total_gain
        self._progress_quest("sell", quantity)
        self.save_game()
        return True, f"Đã bán {quantity}x {inv_item.name} thu về {total_gain} Vàng!"

    # Business: Combat & Defeat Enemy
    def defeat_enemy(self, enemy_type: str) -> Tuple[str, int, Optional[Item]]:
        p = self.state.player
        xp_gain = 35 if enemy_type == "slime" else 60
        p.xp += xp_gain
        self._progress_quest("kill_slime", 1)

        # Rơi đồ
        dropped_item = None
        if enemy_type == "slime":
            dropped_item = self._add_item_to_inventory(
                "item_slime_jelly", "Thạch Slime", "material", "item_slime_jelly",
                1, "Chiến lợi phẩm dẻo quánh từ quái slime xanh.", 30, 25
            )

        self.save_game()
        return f"Hạ gục {enemy_type}! Nhận +{xp_gain} XP.", xp_gain, dropped_item

    # Business: Fishing
    def catch_fish(self) -> Tuple[bool, str, Optional[Item]]:
        p = self.state.player
        if p.energy < 8:
            return False, "Bạn quá mệt để giật cần câu! Cần 8 Thể lực.", None

        p.energy -= 8
        fish_item = self._add_item_to_inventory(
            "item_fish", "Cá Chép Suối", "fish", "item_fish",
            1, "Cá tươi ngon giãy đành đạch vừa câu được.", 60, 50
        )
        p.xp += 20
        self._progress_quest("fish", 1)
        self.save_game()
        return True, "Cắn câu rồi! Bạn bắt được 1 Cá Chép Suối! (+20 XP)", fish_item

    # Quests Progression
    def _progress_quest(self, target_type: str, count: int = 1):
        for q in self.state.quests:
            if not q.is_completed and q.target_type == target_type:
                q.current_count = min(q.target_count, q.current_count + count)
                if q.current_count >= q.target_count:
                    q.is_completed = True

    def claim_quest_reward(self, quest_id: str) -> Tuple[bool, str]:
        q = next((quest for quest in self.state.quests if quest.id == quest_id), None)
        if not q:
            return False, "Nhiệm vụ không tồn tại!"
        if not q.is_completed:
            return False, "Nhiệm vụ chưa hoàn thành mục tiêu!"
        if q.is_claimed:
            return False, "Phần thưởng nhiệm vụ này đã được nhận trước đó!"

        q.is_claimed = True
        self.state.player.gold += q.reward_gold
        self.state.player.xp += q.reward_xp

        # Reward item if any
        if q.reward_item:
            cat = next((s for s in self.shop_catalog if s.id == q.reward_item), None)
            if cat:
                self._add_item_to_inventory(
                    cat.id, cat.name, cat.category, cat.icon, 1,
                    cat.description, cat.price, cat.sell_price
                )

        self.save_game()
        return True, f"Nhận thưởng thành công: +{q.reward_gold} Vàng, +{q.reward_xp} XP!"

# Singleton instance
game_service = GameService()
