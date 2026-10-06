/**
 * JurisCore - Application Orchestrator & Shell Controller
 * Manages routing, sidebar/topbar, global search, quick actions, notifications.
 * Connected to live MySQL backend via REST API.
 */

import { initAmbientBackground } from './background.js';
import { api } from './api.js';
import { Icons, Toast, Modal } from './components.js';

import { renderLoginView } from './views/loginView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderClientsView } from './views/clientsView.js';
import { renderLawyersView } from './views/lawyersView.js';
import { renderJudgesView } from './views/judgesView.js';
import { renderCasesView } from './views/casesView.js';
import { renderHearingsView } from './views/hearingsView.js';
import { renderPaymentsView } from './views/paymentsView.js';
import { renderReportsView } from './views/reportsView.js';
import { renderSettingsView } from './views/settingsView.js';

class App {
  constructor() {
    this.currentUser = {
      name: 'Admin',
      email: 'admin@juriscore.law',
      role: 'Managing Partner'
    };
    this.isAuthenticated = true;
    this.currentRoute = 'dashboard';
    this.routeParams = {};
    this.isSidebarCollapsed = false;
    this.appRoot = document.getElementById('app-container');
  }

  init() {
    initAmbientBackground();
    if (this.isAuthenticated) {
      this.renderMainShell();
      this.navigate('dashboard');
    } else {
      this.renderLogin();
    }
    window.appNavigate = (route, params) => this.navigate(route, params);
  }

  renderLogin() {
    this.isAuthenticated = false;
    renderLoginView(this.appRoot, (userData) => {
      this.currentUser = userData;
      this.isAuthenticated = true;
      this.renderMainShell();
      this.navigate('dashboard');
    });
  }

  renderMainShell() {
    this.appRoot.innerHTML = `
      <div class="main-shell">
        <aside class="app-sidebar ${this.isSidebarCollapsed ? 'collapsed' : ''}" id="app-sidebar">
          <div class="sidebar-header">
            <a class="sidebar-brand-link" id="brand-home-link">
              <div class="brand-symbol-circle" style="width: 36px; height: 36px;">
                ${Icons.scale}
              </div>
              <div class="brand-text-lockup">
                <h1 style="font-size: 17px;">JurisCore</h1>
                <span>Legal Cloud</span>
              </div>
            </a>
            <button class="sidebar-toggle-btn" id="sidebar-toggle-trigger" title="Toggle Sidebar">
              ${Icons.menu}
            </button>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section-title">Navigation</div>
            <a class="nav-item ${this.currentRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard">
              ${Icons.barChart}<span class="nav-item-label">Dashboard</span>
            </a>
            <a class="nav-item ${this.currentRoute === 'clients' ? 'active' : ''}" data-route="clients">
              ${Icons.users}<span class="nav-item-label">Clients</span>
            </a>
            <a class="nav-item ${this.currentRoute === 'lawyers' ? 'active' : ''}" data-route="lawyers">
              ${Icons.briefcase}<span class="nav-item-label">Lawyers</span>
            </a>
            <a class="nav-item ${this.currentRoute === 'judges' ? 'active' : ''}" data-route="judges">
              ${Icons.scale}<span class="nav-item-label">Judges</span>
            </a>
            <a class="nav-item ${this.currentRoute === 'cases' ? 'active' : ''}" data-route="cases">
              ${Icons.gavel}<span class="nav-item-label">Legal Cases</span>
            </a>

            <div class="nav-section-title">Court & Finance</div>
            <a class="nav-item ${this.currentRoute === 'hearings' ? 'active' : ''}" data-route="hearings">
              ${Icons.calendar}<span class="nav-item-label">Hearings</span>
            </a>
            <a class="nav-item ${this.currentRoute === 'payments' ? 'active' : ''}" data-route="payments">
              ${Icons.creditCard}<span class="nav-item-label">Payments</span>
            </a>
            <a class="nav-item ${this.currentRoute === 'reports' ? 'active' : ''}" data-route="reports">
              ${Icons.fileText}<span class="nav-item-label">Reports</span>
            </a>

            <div class="nav-section-title">System</div>
            <a class="nav-item ${this.currentRoute === 'settings' ? 'active' : ''}" data-route="settings">
              ${Icons.settings}<span class="nav-item-label">Settings</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="sidebar-user-card">
              <div class="user-avatar-wrap">
                AD
                <span class="user-online-dot"></span>
              </div>
              <div class="sidebar-user-details">
                <div class="sidebar-user-name">${this.currentUser.name}</div>
                <div class="sidebar-user-role">${this.currentUser.role}</div>
              </div>
              <button class="logout-icon-btn" id="sidebar-logout-btn" title="Sign Out">
                ${Icons.logOut}
              </button>
            </div>
          </div>
        </aside>

        <div class="mobile-drawer-overlay" id="mobile-drawer-backdrop"></div>

        <div class="app-main-viewport">
          <header class="app-topbar">
            <div class="topbar-left">
              <button class="mobile-menu-trigger" id="mobile-hamburger-btn" aria-label="Open Navigation">
                ${Icons.menu}
              </button>
              <div class="topbar-breadcrumbs">
                <span class="breadcrumb-root">JurisCore &bull; Operations</span>
                <span class="breadcrumb-current" id="topbar-page-title">Dashboard</span>
              </div>
            </div>

            <div class="topbar-center">
              <div class="global-search-container">
                <span class="global-search-icon">${Icons.search}</span>
                <input type="text" id="global-search-input" class="global-search-input" placeholder="Search cases, clients, lawyers..." autocomplete="off"/>
                <span class="global-search-kbd">⌘K</span>
                <div class="search-results-dropdown" id="global-search-dropdown"></div>
              </div>
            </div>

            <div class="topbar-right">
              <div class="api-mode-badge" id="topbar-api-badge" title="Connected to LegalCaseDB">
                <span class="api-mode-dot" style="background: #2BB673;"></span>
                <span>Live MySQL</span>
              </div>
              <button class="btn btn-sm btn-primary" id="topbar-quick-add-btn" style="padding: 7px 14px;">
                ${Icons.plus} New Action
              </button>
              <button class="icon-action-btn" id="topbar-notifications-btn" title="Notifications">
                ${Icons.bell}
                <span class="notification-count-badge"></span>
              </button>
            </div>
          </header>

          <main class="app-content-scrollable" id="main-view-container"></main>
        </div>
      </div>
    `;

    this.bindShellEvents();
  }

  bindShellEvents() {
    const sidebar = document.getElementById('app-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle-trigger');
    const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
    const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    const brandLink = document.getElementById('brand-home-link');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const quickAddBtn = document.getElementById('topbar-quick-add-btn');
    const notifBtn = document.getElementById('topbar-notifications-btn');

    sidebarToggle.onclick = () => {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
    };

    hamburgerBtn.onclick = () => {
      sidebar.classList.add('mobile-open');
      mobileBackdrop.classList.add('active');
    };

    mobileBackdrop.onclick = () => {
      sidebar.classList.remove('mobile-open');
      mobileBackdrop.classList.remove('active');
    };

    navItems.forEach(item => {
      item.onclick = () => {
        const route = item.getAttribute('data-route');
        sidebar.classList.remove('mobile-open');
        mobileBackdrop.classList.remove('active');
        this.navigate(route);
      };
    });

    brandLink.onclick = () => this.navigate('dashboard');
    document.getElementById('topbar-api-badge').onclick = () => this.navigate('settings');

    logoutBtn.onclick = () => {
      Toast.info('Signed Out', 'You have been safely signed out of JurisCore.');
      this.renderLogin();
    };

    // Quick Add
    quickAddBtn.onclick = () => {
      Modal.open({
        title: 'Create New Legal Record',
        contentHtml: `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 10px 0;">
            ${[
              { action: 'new-case',    icon: Icons.gavel,      label: 'File New Case',     desc: 'Initiate matter in docket' },
              { action: 'new-client',  icon: Icons.users,      label: 'Register Client',   desc: 'Add client credentials' },
              { action: 'new-hearing', icon: Icons.calendar,   label: 'Schedule Hearing',  desc: 'Calendar court date' },
              { action: 'new-payment', icon: Icons.creditCard, label: 'Record Payment',    desc: 'Disburse or collect fee' },
            ].map(q => `
              <div class="card-3d elevation-hover quick-add-choice" data-action="${q.action}" style="padding: 16px; border: 1px solid var(--border-default); border-radius: var(--radius-md); cursor: pointer; text-align: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--brand-tint); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: var(--brand-primary);">${q.icon}</div>
                <strong style="font-size: 14px; color: var(--text-primary); display: block;">${q.label}</strong>
                <span style="font-size: 12px; color: var(--text-muted);">${q.desc}</span>
              </div>
            `).join('')}
          </div>
        `
      });
      document.querySelectorAll('.quick-add-choice').forEach(choice => {
        choice.onclick = () => {
          const action = choice.getAttribute('data-action');
          Modal.close();
          if (action === 'new-case')    this.navigate('cases', { action: 'new' });
          if (action === 'new-client')  this.navigate('clients', { action: 'new' });
          if (action === 'new-hearing') this.navigate('hearings', { action: 'new' });
          if (action === 'new-payment') this.navigate('payments', { action: 'new' });
        };
      });
    };

    // Notifications
    notifBtn.onclick = () => {
      Modal.open({
        title: 'Recent Notifications',
        contentHtml: `
          <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
            <div style="padding: 12px 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border-left: 3px solid var(--brand-accent);">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted); margin-bottom: 2px;">
                <span>System</span><span>Now</span>
              </div>
              <strong style="font-size: 13.5px; color: var(--text-primary);">Connected to LegalCaseDB</strong>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Live MySQL backend is active and serving real data.</p>
            </div>
          </div>
        `,
        footerHtml: `<button class="btn btn-secondary" onclick="document.querySelector('#modal-global-close').click()">Dismiss</button>`
      });
    };

    this.initGlobalSearch();
  }

  async initGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    const dropdown = document.getElementById('global-search-dropdown');
    if (!searchInput || !dropdown) return;

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    let cases = [], clients = [], lawyers = [];
    try {
      [cases, clients, lawyers] = await Promise.all([
        api.cases.getAll(),
        api.clients.getAll(),
        api.lawyers.getAll()
      ]);
    } catch (e) {
      console.warn('Global search: could not preload data', e);
    }

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (!q) { dropdown.classList.remove('active'); dropdown.innerHTML = ''; return; }

      const matchCases   = cases.filter(c => c.title.toLowerCase().includes(q) || String(c.case_id).includes(q)).slice(0, 3);
      const matchClients = clients.filter(c => c.name.toLowerCase().includes(q) || String(c.client_id).includes(q) || (c.email||'').toLowerCase().includes(q)).slice(0, 3);
      const matchLawyers = lawyers.filter(l => l.name.toLowerCase().includes(q) || (l.specialization||'').toLowerCase().includes(q)).slice(0, 3);

      const totalMatches = matchCases.length + matchClients.length + matchLawyers.length;
      if (totalMatches === 0) {
        dropdown.innerHTML = `<div style="padding: 12px; text-align: center; font-size: 12.5px; color: var(--text-muted);">No records found matching "${q}"</div>`;
        dropdown.classList.add('active');
        return;
      }

      let html = '';
      if (matchCases.length > 0) {
        html += `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); padding: 4px 8px 6px;">Legal Matters (${matchCases.length})</div>`;
        matchCases.forEach(c => {
          html += `<div class="search-item" data-type="case" data-id="${c.case_id}" style="padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <div><strong style="font-size: 13px; color: var(--text-primary); display: block;">${c.title}</strong>
            <span style="font-size: 11.5px; color: var(--text-muted);">#${c.case_id} &bull; ${c.case_type||'General'}</span></div>
            <span class="status-badge badge-${(c.status||'pending').toLowerCase()}">${c.status}</span></div>`;
        });
      }
      if (matchClients.length > 0) {
        html += `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); padding: 8px 8px 6px;">Clients (${matchClients.length})</div>`;
        matchClients.forEach(c => {
          html += `<div class="search-item" data-type="client" data-id="${c.client_id}" style="padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <div><strong style="font-size: 13px; color: var(--text-primary); display: block;">${c.name}</strong>
            <span style="font-size: 11.5px; color: var(--text-muted);">#${c.client_id} &bull; ${c.phone}</span></div>
            <span class="badge-specialization">Client</span></div>`;
        });
      }
      if (matchLawyers.length > 0) {
        html += `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); padding: 8px 8px 6px;">Lawyers (${matchLawyers.length})</div>`;
        matchLawyers.forEach(l => {
          html += `<div class="search-item" data-type="lawyer" data-id="${l.lawyer_id}" style="padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <div><strong style="font-size: 13px; color: var(--text-primary); display: block;">${l.name}</strong>
            <span style="font-size: 11.5px; color: var(--text-muted);">${l.specialization||'General'}</span></div>
            <span class="badge-specialization">Counsel</span></div>`;
        });
      }

      dropdown.innerHTML = html;
      dropdown.classList.add('active');

      dropdown.querySelectorAll('.search-item').forEach(item => {
        item.onmouseenter = () => item.style.backgroundColor = 'var(--brand-tint)';
        item.onmouseleave = () => item.style.backgroundColor = '';
        item.onclick = () => {
          const type = item.getAttribute('data-type');
          const id = item.getAttribute('data-id');
          dropdown.classList.remove('active');
          searchInput.value = '';
          if (type === 'case')   this.navigate('cases', { viewCaseId: id });
          if (type === 'client') this.navigate('clients');
          if (type === 'lawyer') this.navigate('lawyers');
        };
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== searchInput) dropdown.classList.remove('active');
    });
  }

  navigate(route, params = {}) {
    this.currentRoute = route;
    this.routeParams = params;

    const pageTitleMap = {
      dashboard: 'Dashboard Overview',
      clients: 'Client Management',
      lawyers: 'Lawyer Registry',
      judges: 'Judicial Bench',
      cases: 'Legal Cases Docket',
      hearings: 'Hearings & Court Schedule',
      payments: 'Payments & Accounting',
      reports: 'Reports',
      settings: 'System Settings'
    };

    const titleEl = document.getElementById('topbar-page-title');
    if (titleEl) titleEl.textContent = pageTitleMap[route] || 'JurisCore';

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-route') === route);
    });

    const viewContainer = document.getElementById('main-view-container');
    if (!viewContainer) return;
    viewContainer.scrollTop = 0;

    switch (route) {
      case 'dashboard': renderDashboardView(viewContainer, (r, p) => this.navigate(r, p)); break;
      case 'clients':   renderClientsView(viewContainer, params); break;
      case 'lawyers':   renderLawyersView(viewContainer, params); break;
      case 'judges':    renderJudgesView(viewContainer, params); break;
      case 'cases':     renderCasesView(viewContainer, params); break;
      case 'hearings':  renderHearingsView(viewContainer, params); break;
      case 'payments':  renderPaymentsView(viewContainer, params); break;
      case 'reports':   renderReportsView(viewContainer); break;
      case 'settings':  renderSettingsView(viewContainer); break;
      default:          renderDashboardView(viewContainer, (r, p) => this.navigate(r, p));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
