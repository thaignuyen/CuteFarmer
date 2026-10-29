// Quest Tracking & Progression System
class QuestSystem {
  constructor() {
    this.quests = [];
    this.modal = document.getElementById('quest-modal');
    this.container = document.getElementById('quest-list-container');

    const closeBtn = document.getElementById('btn-close-quest');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
  }

  loadQuests(questsData) {
    this.quests = questsData || [];
    this.render();
  }

  openModal() {
    if (!this.modal) return;
    this.render();
    this.modal.classList.remove('hidden');
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  toggleModal() {
    if (!this.modal) return;
    if (this.modal.classList.contains('hidden')) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (this.quests.length === 0) {
      this.container.innerHTML = '<p style="text-align:center; padding: 20px; color:#aaa;">Chưa có nhiệm vụ nào.</p>';
      return;
    }

    this.quests.forEach((q) => {
      const item = document.createElement('div');
      item.className = `quest-item ${q.is_completed ? 'completed' : ''}`;

      const progressPercent = Math.min(100, Math.floor((q.current_count / q.target_count) * 100));

      item.innerHTML = `
        <div class="quest-info">
          <h4>${q.title} ${q.is_completed ? '✅' : '⏳'}</h4>
          <p>${q.description}</p>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="quest-progress-bar">
              <div class="quest-progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <span class="quest-progress-text">${q.current_count} / ${q.target_count}</span>
          </div>
          <div style="font-size:11px; color:#ffd700; margin-top:6px;">
            🎁 Thưởng: +${q.reward_gold} Vàng, +${q.reward_xp} XP ${q.reward_item ? `(+1 ${q.reward_item})` : ''}
          </div>
        </div>
        <div class="quest-action">
          ${q.is_claimed 
            ? '<span style="font-size:12px; color:#5bb36b; font-weight:700;">Đã Nhận Thưởng</span>' 
            : (q.is_completed 
                ? `<button class="pixel-btn primary btn-claim" data-id="${q.id}">Nhận Thưởng</button>`
                : '<span style="font-size:12px; color:#aaa;">Đang Thực Hiện</span>'
              )
          }
        </div>
      `;

      const claimBtn = item.querySelector('.btn-claim');
      if (claimBtn) {
        claimBtn.addEventListener('click', () => {
          this.claim(q.id);
        });
      }

      this.container.appendChild(item);
    });
  }

  claim(questId) {
    API.claimQuest(questId).then((res) => {
      Toast.show(res.message, 'success');
      Sound.levelUp();
      if (res.player) GameEngine.syncPlayerStats(res.player);
      if (res.quests) this.loadQuests(res.quests);
    }).catch(err => Toast.show(err.message, 'warning'));
  }
}

const Quests = new QuestSystem();
