# 🌾 Cute Fantasy RPG - Nông Trại & Phiêu Lưu Làng Quê

Dự án game RPG mô phỏng cuộc sống làng quê pixel art 2D hoàn chỉnh, được xây dựng theo chuẩn kiến trúc tách biệt **Backend (BE)** và **Frontend (FE)**, tái hiện bản đồ ngôi làng theo đúng hình ảnh mẫu với các nghiệp vụ game tiêu chuẩn.

---

## 🏗️ 1. Kiến Trúc Hệ Thống (Structure BE & FE)

Hệ thống được thiết kế theo mô hình Client-Server hướng dịch vụ (Service-Oriented):

```
DoAnHoang/
├── backend/                        # BACKEND (Python FastAPI)
│   ├── app/
│   │   ├── api/                    # API Endpoints (RESTful Routes)
│   │   │   ├── player.py           # Quản lý người chơi, chỉ số HP, Thể lực, Vàng
│   │   │   ├── farm.py             # Nghiệp vụ xới đất, gieo mầm, tưới nước, thu hoạch
│   │   │   ├── inventory.py        # Quản lý kho đồ, hotbar, sử dụng vật phẩm
│   │   │   ├── shop.py             # Sạp chợ buôn bán nông sản, mua hạt giống
│   │   │   ├── quests.py           # Hệ thống nhiệm vụ cốt truyện & phần thưởng
│   │   │   └── game.py             # Đồng bộ toàn bộ Game State, lưu trữ, câu cá, săn quái
│   │   ├── core/                   # Cấu hình hệ thống (config, đường dẫn lưu file)
│   │   ├── models/                 # Schemas Pydantic kiểm định kiểu dữ liệu
│   │   ├── services/               # Xử lý nghiệp vụ chính (GameService Business Logic)
│   │   └── main.py                 # FastAPI Web Server, phục vụ Static Assets & HTML
│   ├── data/                       # Dữ liệu lưu trữ trạng thái thế giới (game_save.json)
│   └── requirements.txt
│
├── frontend/                       # FRONTEND (HTML5, CSS3, Modern JavaScript)
│   ├── index.html                  # Giao diện chính, Canvas 2D & Hệ thống HUD/Modals
│   ├── css/
│   │   ├── style.css               # Phong cách pixel art cổ điển, khung game
│   │   └── ui.css                  # HUD thanh máu, thể lực, hotbar 8 ô, hộp thoại, sạp chợ
│   ├── js/
│   │   ├── engine/                 # Game Engine (Loop, Input, Camera, Sound, Sprite)
│   │   ├── world/                  # Bản đồ, hệ thống va chạm (Collisions), chu kỳ ngày đêm
│   │   ├── entities/               # Thực thể (Player, Vật nuôi, Kẻ địch, Dân làng NPC)
│   │   ├── systems/                # Nghiệp vụ (Farming, Combat, Fishing, Inventory, Quest)
│   │   ├── ui/                     # Điều khiển giao diện (HUD, Dialogue, Shop, Toast)
│   │   ├── api.js                  # Module giao tiếp REST API với Backend
│   │   └── main.js                 # Khởi tạo game & đồng bộ dữ liệu
│   └── assets/                     # Tài nguyên hình ảnh Cute Fantasy chuẩn 16x16
│
├── run.py                          # Script khởi động 1 chạm (chạy server & mở trình duyệt)
└── README.md
```

---

## 🔍 2. Phân Tích Bố Cục Bản Đồ & Sắp Xếp Asset

Bản đồ ngôi làng trong hình ảnh mẫu được chia thành 8 phân khu chức năng được sắp xếp hài hòa:

| Vùng (Zone) | Vị trí trên Map | Đối tượng & Asset sử dụng | Vai trò & Nghiệp vụ tương tác |
| :--- | :--- | :--- | :--- |
| **Khu Vườn Nông Trại** | Góc trên bên trái | `FarmLand_Tile`, `Player_Actions` (Cuốc, Bình tưới), Bù nhìn rơm, Hoa sen | Xới đất, gieo hạt (Cà chua, Bắp, Cà rốt), tưới nước và thu hoạch nông sản chín. |
| **Nhà Dân & Kho Củi** | Phía trên bên trái | `House_1_Wood_Base_Blue`, Bậc thang gỗ, Đống củi | Ngôi nhà của nhân vật chính. Đến cửa bấm `[E]` để nghỉ ngơi hồi phục máu và thể lực qua đêm. |
| **Chuồng Nuôi Gia Cầm** | Phía trên ở giữa | `Fences`, `Chicken.png`, Máng ăn, Rơm rạ | Nơi đàn gà và vịt đi lại kiếm ăn, đẻ trứng. |
| **Dinh Thự & Quán Trọ** | Góc trên bên phải | Tòa nhà lớn 2 tầng, Hàng rào cây tỉa, Bàn trà ngoài trời | Nơi Đầu Bếp Pierre tiếp đón khách, sẵn sàng thu mua thực phẩm tươi từ người chơi. |
| **Nhà Kính & Quảng Trường** | Khu vực trung tâm | Nhà kính khung kim loại, Đá lát đường, Ghế băng, Đèn đường | Trung tâm giao thương kết nối các khu vực, có NPC chỉ dẫn. |
| **Bãi Chăn Thả & Chuồng Lớn** | Góc dưới bên trái | Chuồng gỗ đỏ, Tháp Silo, `Cow.png`, `Pig.png`, `Sheep.png` | Bò, lợn, cừu gặm cỏ tự do quanh bãi đồng quê. |
| **Sạp Chợ Phiên** | Rìa đường giữa - dưới | 3 Sạp hàng mái sọc đỏ/xanh/vàng, Thùng gỗ, Rương | Nơi gặp Thương Gia Marcus để mua hạt giống, dược phẩm và bán nông sản lấy Vàng. |
| **Dòng Sông & Bến Câu Cá** | Rìa dưới - giữa | `Water_Tile`, `Bridge_Wood`, Cầu tàu gỗ, Thiên nga | Cầm Cần câu ra bến gỗ bấm `[Space]` để kích hoạt minigame câu cá tươi. |
| **Giáo Đường Cổ Kính** | Góc dưới bên phải | Nhà thờ đá, Tháp chuông cao, Cửa kính phát sáng | Nơi Mục Sư Lucas cầu nguyện và cảnh báo về quái vật Slime ngoài bìa rừng. |
| **Vùng Bìa Rừng Phía Đông** | Ngoại vi phía đông bắc | Cây sồi, Cỏ dại, `Slime_Green.png` | Nơi Slime xanh xuất hiện; người chơi trang bị Kiếm để tiêu diệt nhận thạch slime và kinh nghiệm. |

---

## 🎮 3. Chuẩn Nghiệp Vụ Trong Game (Business Logic)

1. **Nông Nghiệp (Farming Lifecycle)**:
   - **Xới đất (Till)**: Cầm Cuốc [Phím 1] xới ô đất tơi xốp (-5 Thể lực).
   - **Gieo hạt (Plant)**: Cầm Hạt giống [Phím 6, 7] gieo vào ô đất đã xới.
   - **Tưới nước (Water)**: Cầm Bình tưới [Phím 2] cấp ẩm cho đất (-3 Thể lực).
   - **Sinh trưởng & Thu hoạch (Growth & Harvest)**: Cây trải qua 4 giai đoạn phát triển (Hạt -> Mầm -> Cây ra hoa -> Quả chín mọng). Khi chín, nhấp vào để thu hoạch nông sản tươi và nhận +25 XP.
2. **Kinh Tế & Giao Thương (Market Economy)**:
   - Mua hạt giống giá gốc tại Sạp Chợ.
   - Chăm sóc và bán lại thành phẩm chín với giá cao hơn để kiếm lợi nhuận Vàng.
3. **Chiến Đấu & Bảo Vệ Làng (Combat System)**:
   - Cầm Kiếm [Phím 4] chém quét tầm gần (-4 Thể lực).
   - Slime nhận sát thương, bị đẩy lùi (knockback), nhấp nháy đỏ và hiển thị số sát thương nổi.
   - Khi hạ gục: rơi Thạch Slime (Slime Jelly) và thưởng điểm kinh nghiệm.
4. **Câu Cá Tại Bến Nước (Fishing Minigame)**:
   - Cầm Cần câu [Phím 5] ra bến gỗ bấm [Space].
   - Minigame thanh căn lực: bấm giữ [Space] để điều chỉnh vùng xanh lá bắt trọn chú cá đang bơi để kéo lên bờ.
5. **Nhiệm Vụ & Cốt Truyện (Quest & Level Progression)**:
   - Chuỗi nhiệm vụ dẫn dắt: Khai khẩn đất -> Gieo hạt tưới cây -> Thu hoạch vụ mùa -> Bán hàng tại chợ -> Diệt quái Slime bảo vệ đàn gà -> Thú vui câu cá.
   - Hoàn thành nhiệm vụ nhận thêm tiền Vàng, hạt giống và điểm kinh nghiệm để lên cấp (Level Up).
6. **Môi Trường & Thời Gian (Environment & Day-Night Cycle)**:
   - Chu kỳ ánh sáng mặt trời: Ban ngày tươi sáng -> Hoàng hôn chiều tà ấm áp -> Ban đêm bóng tối buông xuống với ánh đèn đường và đèn lồng của người chơi soi sáng lung linh.

---

## 🚀 4. Hướng Dẫn Cài Đặt & Khởi Chạy

### Bước 1: Khởi động Game bằng Python
Tại thư mục gốc dự án `DoAnHoang`:
```bash
python run.py
```
> Trình duyệt web sẽ tự động mở trang game tại địa chỉ: `http://127.0.0.1:8000`

### Bước 2: Hoặc chạy trực tiếp Backend Uvicorn
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## ⌨️ 5. Phím Tắt Điều Khiển

- **W, A, S, D** hoặc **Phím Mũi Tên**: Di chuyển nhân vật 4 hướng.
- **Phím Cách (Space)** hoặc **Click Chuột**: Sử dụng công cụ đang chọn (Cuốc, Bình tưới, Rìu, Kiếm, Cần câu).
- **Phím E**: Tương tác với Dân Làng NPC, Mở Sạp Chợ, Nghỉ ngơi tại nhà.
- **Phím 1 đến 8**: Chuyển nhanh công cụ/vật phẩm trên thanh Hotbar.
- **Phím Q**: Mở bảng Nhiệm vụ làng.
- **Phím I**: Mở Túi đồ hành trang.
- **Phím H**: Mở sổ tay hướng dẫn điều khiển.
