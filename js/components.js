/**
 * JurisCore - Reusable Component Helpers & UI Utilities
 */

// SVG Icon Library
export const Icons = {
  scale: `<svg viewBox="0 0 24 24"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zm-14 0l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zm10-14v20m-7-16h14"/></svg>`,
  gavel: `<svg viewBox="0 0 24 24"><path d="M14 13l5 5m-9-9l5 5m-2-7l2-2a2.83 2.83 0 0 1 4 4l-2 2m-8 2l-2 2a2.83 2.83 0 0 0 4 4l2-2m-9 9h6"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  user: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  creditCard: `<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  fileText: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  barChart: `<svg viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  bell: `<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  eye: `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  logOut: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  filter: `<svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  download: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  shield: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  trendUp: `<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
};

// ========================================================
// TOAST NOTIFICATIONS
// ========================================================
export const Toast = {
  container: null,

  ensureContainer() {
    if (!this.container) {
      let el = document.getElementById('toast-root');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-root';
        el.className = 'toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show({ type = 'info', title, message, duration = 3800 }) {
    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSvg = Icons.info;
    if (type === 'success') iconSvg = Icons.check;
    if (type === 'error') iconSvg = Icons.alertCircle;

    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close-btn" aria-label="Dismiss">${Icons.close}</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.onclick = () => this.dismiss(toast);

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('active');
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  },

  dismiss(toast) {
    toast.classList.remove('active');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 280);
  },

  success(title, message) {
    this.show({ type: 'success', title, message });
  },

  error(title, message) {
    this.show({ type: 'error', title, message });
  },

  info(title, message) {
    this.show({ type: 'info', title, message });
  }
};

// ========================================================
// MODAL SYSTEM
// ========================================================
export const Modal = {
  backdrop: null,
  window: null,
  titleEl: null,
  bodyEl: null,
  footerEl: null,
  currentOnClose: null,

  init() {
    if (this.backdrop) return;
    const el = document.createElement('div');
    el.className = 'modal-backdrop';
    el.innerHTML = `
      <div class="modal-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 id="modal-title-text">Modal</h3>
          <button class="modal-close-btn" id="modal-global-close" aria-label="Close modal">${Icons.close}</button>
        </div>
        <div class="modal-body" id="modal-body-content"></div>
        <div class="modal-footer" id="modal-footer-content"></div>
      </div>
    `;
    document.body.appendChild(el);

    this.backdrop = el;
    this.window = el.querySelector('.modal-window');
    this.titleEl = el.querySelector('#modal-title-text');
    this.bodyEl = el.querySelector('#modal-body-content');
    this.footerEl = el.querySelector('#modal-footer-content');

    const closeBtn = el.querySelector('#modal-global-close');
    closeBtn.onclick = () => this.close();

    // Close on backdrop click (if clicked directly on backdrop)
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.backdrop.classList.contains('active')) {
        this.close();
      }
    });
  },

  open({ title, contentHtml, footerHtml = '', wide = false, onClose = null }) {
    this.init();
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = contentHtml;
    this.footerEl.innerHTML = footerHtml;
    this.currentOnClose = onClose;

    if (wide) {
      this.window.classList.add('modal-wide');
    } else {
      this.window.classList.remove('modal-wide');
    }

    if (!footerHtml) {
      this.footerEl.style.display = 'none';
    } else {
      this.footerEl.style.display = 'flex';
    }

    this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.backdrop) return;
    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
    if (this.currentOnClose) {
      this.currentOnClose();
      this.currentOnClose = null;
    }
  }
};

// ========================================================
// CONFIRMATION DIALOG
// ========================================================
export function confirmDialog({ title = 'Confirm Action', message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    Modal.open({
      title,
      contentHtml: `
        <div style="display: flex; gap: 16px; align-items: flex-start; padding: 8px 0;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: ${danger ? '#FDF1F1' : '#EDF5F0'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${danger ? '#C53030' : '#274D3B'};">
            ${danger ? Icons.alertCircle : Icons.info}
          </div>
          <div>
            <p style="font-size: 14.5px; color: var(--text-primary); line-height: 1.5; margin-bottom: 6px;">${message}</p>
            <p style="font-size: 12.5px; color: var(--text-muted);">This action will immediately update your system records.</p>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="confirm-dialog-cancel">${cancelText}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-dialog-proceed">${confirmText}</button>
      `,
      onClose: () => resolve(false)
    });

    const cancelBtn = document.getElementById('confirm-dialog-cancel');
    const proceedBtn = document.getElementById('confirm-dialog-proceed');

    cancelBtn.onclick = () => {
      Modal.close();
      resolve(false);
    };

    proceedBtn.onclick = () => {
      Modal.close();
      resolve(true);
    };
  });
}

// ========================================================
// STAT CARD BUILDER
// ========================================================
export function renderStatCard({ id, label, value, icon, trend, trendType = 'up', onClick = null }) {
  const card = document.createElement('div');
  card.className = 'card-3d stat-card interactive-tilt';
  if (id) card.id = id;

  card.innerHTML = `
    <div class="stat-card-header">
      <span class="stat-card-label">${label}</span>
      <div class="stat-card-icon-wrap">${icon}</div>
    </div>
    <div class="stat-card-value">${value}</div>
    <div class="stat-card-footer">
      <span class="stat-trend-indicator stat-trend-${trendType}">
        ${trendType === 'up' ? Icons.trendUp : ''}
        ${trend}
      </span>
      <span>vs last period</span>
    </div>
  `;

  if (onClick) {
    card.onclick = onClick;
  }
  return card;
}

// ========================================================
// EMPTY & LOADING SKELETON HELPERS
// ========================================================
export function renderEmptyState({ icon = Icons.briefcase, title = 'No records found', description = 'There are no items matching your criteria.', actionText = null, onAction = null }) {
  const container = document.createElement('div');
  container.className = 'empty-state';
  container.innerHTML = `
    <div class="empty-icon-circle">${icon}</div>
    <h4 class="empty-title">${title}</h4>
    <p class="empty-desc">${description}</p>
    ${actionText ? `<button class="btn btn-primary empty-action-btn">${Icons.plus} ${actionText}</button>` : ''}
  `;

  if (actionText && onAction) {
    const btn = container.querySelector('.empty-action-btn');
    btn.onclick = onAction;
  }

  return container;
}

export function renderLoadingSkeleton(rows = 5) {
  let html = `<div style="padding: 24px; display: flex; flex-direction: column; gap: 14px;">`;
  for (let i = 0; i < rows; i++) {
    html += `
      <div style="display: flex; gap: 16px; align-items: center;">
        <div class="skeleton" style="width: 80px; height: 20px;"></div>
        <div class="skeleton" style="flex: 2; height: 20px;"></div>
        <div class="skeleton" style="flex: 1; height: 20px;"></div>
        <div class="skeleton" style="width: 100px; height: 20px;"></div>
      </div>
    `;
  }
  html += `</div>`;
  return html;
}

// ========================================================
// 3D TILT EFFECT INITIALIZER
// Subtle 3D perspective following mouse movements
// ========================================================
export function init3DTiltEffects() {
  const cards = document.querySelectorAll('.interactive-tilt');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
