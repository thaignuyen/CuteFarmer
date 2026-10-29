// NPC Dialogue Modal
class DialogueSystem {
  constructor() {
    this.modal = document.getElementById('dialogue-modal');
    this.portraitEl = document.getElementById('dialogue-portrait');
    this.nameEl = document.getElementById('dialogue-npc-name');
    this.roleEl = document.getElementById('dialogue-npc-role');
    this.textEl = document.getElementById('dialogue-text');
    this.nextBtn = document.getElementById('dialogue-btn-next');
    this.closeBtn = document.getElementById('btn-close-dialogue');

    this.currentLines = [];
    this.lineIndex = 0;
    this.activeNPC = null;
    this.isTyping = false;
    this.typewriterInterval = null;

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.advance());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (this.isOpen() && (e.code === 'KeyE' || e.code === 'Space')) {
        this.advance();
      }
    });
  }

  isOpen() {
    return this.modal && !this.modal.classList.contains('hidden');
  }

  open(npc) {
    if (!this.modal || !npc) return;

    this.activeNPC = npc;
    this.currentLines = npc.dialogues || ['Xin chào!'];
    this.lineIndex = 0;

    if (this.portraitEl) this.portraitEl.textContent = npc.icon;
    if (this.nameEl) this.nameEl.textContent = npc.name;
    if (this.roleEl) this.roleEl.textContent = npc.role;

    this.modal.classList.remove('hidden');
    this.showLine();
  }

  showLine() {
    if (this.lineIndex >= this.currentLines.length) {
      this.close();
      if (this.activeNPC && typeof this.activeNPC.onInteract === 'function') {
        this.activeNPC.onInteract();
      }
      return;
    }

    const line = this.currentLines[this.lineIndex];
    if (this.textEl) this.textEl.textContent = line;
    if (this.nextBtn) {
      this.nextBtn.textContent = (this.lineIndex === this.currentLines.length - 1) ? 'Xong [E]' : 'Tiếp tục [E]';
    }
  }

  advance() {
    this.lineIndex++;
    this.showLine();
  }

  close() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }
}

const Dialogue = new DialogueSystem();
