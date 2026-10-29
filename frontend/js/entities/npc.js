// NPC Entities & Interactive Villagers
class NPC {
  constructor(id, name, role, x, y, icon, dialogues, onInteract = null) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.x = x;
    this.y = y;
    this.icon = icon;
    this.dialogues = dialogues;
    this.onInteract = onInteract;
    this.animTimer = 0;
    this.bob = 0;
  }

  update(dt) {
    this.animTimer += dt * 3;
    this.bob = Math.sin(this.animTimer) * 1.5;
  }

  render(ctx, isNear) {
    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 4, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw NPC icon / sprite
    ctx.save();
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, this.x, this.y - 10 + this.bob);

    // Floating interaction indicator when player approaches
    if (isNear) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 9px "Be Vietnam Pro"';
      ctx.fillText('[E] Nói chuyện', this.x, this.y - 28 + this.bob);
    }
    ctx.restore();
  }
}

class NPCManager {
  constructor() {
    this.npcs = [];
    this._initVillagers();
  }

  _initVillagers() {
    // 1. Farmer at crops
    this.npcs.push(new NPC(
      'farmer',
      'Bác Ba Nông Dân',
      'Chủ trang trại mẫu mực',
      45, 145,
      '👨‍🌾',
      [
        'Chào Hoàng! Cháu muốn học nghề làm nông chứ?',
        'Hãy bấm phím [1] chọn Cuốc để xới đất, chọn Hạt giống phím [6] để gieo, rồi bấm phím [2] tưới nước nhé.',
        'Khi quả chín mọng, chỉ cần nhấp vào luống để thu hoạch lấy kinh nghiệm và nông sản!'
      ]
    ));

    // 2. Chef at tavern
    this.npcs.push(new NPC(
      'chef',
      'Đầu Bếp Pierre',
      'Bếp trưởng quán trọ',
      510, 185,
      '👨‍🍳',
      [
        'Bonjour! Quán trọ của ta phục vụ các món ăn ngon nhất xứ sở!',
        'Ta luôn sẵn sàng trả giá cao để thu mua những mẻ cá tươi và cà chua chín mọng vừa hái trong vườn.',
        'Hãy đem bán tại Sạp Chợ trung tâm, ta sẽ tới đó lấy hàng thường xuyên!'
      ]
    ));

    // 3. Merchant at Market Stalls
    this.npcs.push(new NPC(
      'merchant',
      'Thương Gia Marcus',
      'Chủ quầy sạp chợ phiên',
      210, 345,
      '👳‍♂️',
      [
        'Kính chào quý khách! Sạp chợ hôm nay có hạt giống cà chua, ngô ngọt và các loại thảo dược tăng lực.',
        'Cần mua hạt giống hay bán nông sản thì cứ việc mở sạp giao dịch nhé!'
      ],
      () => {
        ShopModal.open();
      }
    ));

    // 4. Fisherman at the Wooden Dock
    this.npcs.push(new NPC(
      'fisherman',
      'Lão Ngư Hải',
      'Tay câu cự phách dòng sông',
      425, 290,
      '🎣',
      [
        'Nước sông hôm nay êm ả, đàn cá chép đang lượn dưới chân cầu kìa!',
        'Trang bị Cần câu [Phím 5], đứng ở bến cầu gỗ rồi bấm [Space] để câu nhé cháu.',
        'Canh thời điểm chuẩn xác để giật cần câu là sẽ tóm gọn ngay mẻ cá béo tốt!'
      ]
    ));

    // 5. Priest at the Stone Church
    this.npcs.push(new NPC(
      'priest',
      'Mục Sư Lucas',
      'Người coi sóc giáo đường',
      555, 345,
      '🧙‍♂️',
      [
        'Cầu mong ánh sáng che chở cho ngôi làng chúng ta.',
        'Gần đây lũ slime xanh ngoài bìa rừng phía đông bắc lại sinh sôi.',
        'Nếu cháu có Kiếm [Phím 4], hãy dũng cảm trừ hại giúp bà con an tâm chăn nuôi!'
      ]
    ));
  }

  update(dt) {
    for (let npc of this.npcs) {
      npc.update(dt);
    }
  }

  render(ctx, playerX, playerY) {
    for (let npc of this.npcs) {
      const dist = Math.hypot(npc.x - playerX, npc.y - playerY);
      npc.render(ctx, dist <= 28);
    }
  }

  getNearest(x, y, maxDist = 28) {
    for (let npc of this.npcs) {
      const dist = Math.hypot(npc.x - x, npc.y - y);
      if (dist <= maxDist) return npc;
    }
    return null;
  }
}

const NPCs = new NPCManager();
