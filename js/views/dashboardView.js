/**
 * JurisCore - Dashboard View
 * Pulls live data from MySQL via REST API.
 * Uses real column names: case_id, case_type, client_name, filing_date, etc.
 */

import { api } from '../api.js';
import { Icons, renderStatCard, init3DTiltEffects } from '../components.js';

export async function renderDashboardView(container, navigateTo) {
  // Skeleton while loading
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 26px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">Loading Dashboard…</h2>
        <p style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">Connecting to LegalCaseDB…</p>
      </div>
      <div class="stat-cards-grid">
        ${Array(6).fill('<div class="skeleton" style="height: 140px; border-radius: var(--radius-lg);"></div>').join('')}
      </div>
    </div>
  `;

  let stats;
  try {
    stats = await api.dashboard.getStats();
  } catch (e) {
    container.innerHTML = `<div class="view-fade-enter" style="padding: 60px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <h3 style="color: var(--text-primary); margin-bottom: 8px;">Cannot connect to backend</h3>
      <p style="color: var(--text-muted); margin-bottom: 24px;">Make sure the Express server is running: <code>cd server && npm start</code></p>
      <button class="btn btn-primary" id="retry-dash">Retry</button>
    </div>`;
    container.querySelector('#retry-dash').onclick = () => renderDashboardView(container, navigateTo);
    return;
  }

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(stats.total_revenue || 0);

  const total        = stats.total_cases || 1;
  const pendingPct   = Math.round(((stats.pending_cases  || 0) / total) * 100);
  const ongoingPct   = Math.round(((stats.active_cases   || 0) / total) * 100);
  const closedPct    = Math.round(((stats.closed_cases   || 0) / total) * 100);

  const upcomingHearings = stats.upcoming_hearings || [];
  const recentPayments   = stats.recent_payments   || [];
  const recentCases      = stats.recent_cases      || [];

  container.innerHTML = `
    <div class="view-fade-enter">
      <!-- Welcome Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 26px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">Good morning, Admin</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">Live data from <strong>LegalCaseDB</strong> — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="dash-quick-refresh">${Icons.barChart} Refresh</button>
          <button class="btn btn-primary" id="dash-quick-new-case">${Icons.plus} New Case</button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stat-cards-grid" id="dashboard-stats-grid"></div>

      <!-- Charts Row -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px;">
        <!-- Case Donut -->
        <div class="chart-card-container card-3d">
          <div class="chart-header">
            <div>
              <h3>Case Overview</h3>
              <p style="font-size: 12px; color: var(--text-muted);">Docket distribution by stage</p>
            </div>
            <span class="table-count-badge">${stats.total_cases} Total Matters</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-around; padding: 12px 0; flex-wrap: wrap; gap: 16px;">
            <div style="position: relative; width: 170px; height: 170px; display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EFF3F0" stroke-width="4.2"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2D5A46" stroke-width="4.2" stroke-dasharray="${closedPct}, 100"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#52896F" stroke-width="4.2" stroke-dasharray="${ongoingPct}, 100" stroke-dashoffset="-${closedPct}"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#C59B27" stroke-width="4.2" stroke-dasharray="${pendingPct}, 100" stroke-dashoffset="-${closedPct + ongoingPct}"/>
              </svg>
              <div style="position: absolute; text-align: center;">
                <span style="font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1;">${stats.total_cases}</span>
                <span style="display: block; font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-top: 2px;">Cases</span>
              </div>
            </div>
            <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 14px;">
              ${[
                { label: 'Pending',  count: stats.pending_cases, pct: pendingPct, color: '#C59B27' },
                { label: 'Ongoing',  count: stats.active_cases,  pct: ongoingPct, color: '#52896F' },
                { label: 'Closed',   count: stats.closed_cases,  pct: closedPct,  color: '#2D5A46' },
              ].map(s => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px;">
                    <span style="font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${s.color};"></span>${s.label}
                    </span>
                    <span style="font-weight: 700; color: var(--text-primary);">${s.count} (${s.pct}%)</span>
                  </div>
                  <div style="height: 6px; border-radius: 3px; background: #EFF3F0; overflow: hidden;">
                    <div style="width: ${s.pct}%; height: 100%; background: ${s.color}; border-radius: 3px;"></div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Recent Cases -->
        <div class="card-3d" style="padding: 22px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary);">Recent Cases</h3>
              <p style="font-size: 12px; color: var(--text-muted);">Latest filings from LegalCaseDB</p>
            </div>
            <button class="btn btn-sm btn-ghost" id="dash-view-all-cases">View All &rarr;</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; flex: 1;">
            ${recentCases.slice(0, 4).map(c => `
              <div class="card-subtle elevation-hover" style="padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-surface); display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-case-id="${c.case_id}">
                <div style="min-width: 0; flex: 1; padding-right: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
                    <span class="table-cell-id" style="font-size: 11px;">#${c.case_id}</span>
                    <span class="badge-specialization" style="font-size: 11px;">${c.case_type || 'General'}</span>
                  </div>
                  <h4 style="font-size: 13.5px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</h4>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Client: ${c.client_name} &bull; Filed: ${c.filing_date || '—'}</div>
                </div>
                <span class="status-badge badge-${(c.status||'pending').toLowerCase()}">${c.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Upcoming Hearings -->
      <div class="table-container card-3d" style="margin-bottom: 30px;">
        <div class="table-header-bar">
          <div class="table-title-area">
            <h3>${Icons.calendar} Upcoming Hearings <span class="table-count-badge">${upcomingHearings.length} Scheduled</span></h3>
          </div>
          <button class="btn btn-sm btn-secondary" id="dash-view-all-hearings">Full Schedule &rarr;</button>
        </div>
        <div class="table-responsive-wrapper">
          <table class="custom-table">
            <thead><tr>
              <th>Case</th><th>Judge</th><th>Date</th><th>Time</th><th>Location</th>
            </tr></thead>
            <tbody>
              ${upcomingHearings.length === 0
                ? `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 24px;">No upcoming hearings</td></tr>`
                : upcomingHearings.map(h => `
                <tr class="table-row-interactive">
                  <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${h.case_title}</div>
                    <div style="font-size: 11px; color: var(--brand-accent);">#${h.case_id}</div>
                  </td>
                  <td>${h.judge_name}</td>
                  <td><strong>${h.hearing_date}</strong></td>
                  <td><span style="color: var(--brand-primary);">${h.hearing_time}</span></td>
                  <td>${h.location || '—'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Payments -->
      <div class="table-container card-3d">
        <div class="table-header-bar">
          <div class="table-title-area">
            <h3>${Icons.creditCard} Recent Payments <span class="table-count-badge">${formattedRevenue} Total</span></h3>
          </div>
          <button class="btn btn-sm btn-secondary" id="dash-view-all-payments">All Invoices &rarr;</button>
        </div>
        <div class="table-responsive-wrapper">
          <table class="custom-table">
            <thead><tr>
              <th>ID</th><th>Client</th><th>Case</th><th>Amount</th><th>Date</th><th>Method</th>
            </tr></thead>
            <tbody>
              ${recentPayments.length === 0
                ? `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 24px;">No payments recorded</td></tr>`
                : recentPayments.map(p => `
                <tr class="table-row-interactive">
                  <td><span class="table-cell-id">#${p.payment_id}</span></td>
                  <td class="table-cell-bold">${p.client_name}</td>
                  <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.case_title}</td>
                  <td><strong style="color: var(--brand-primary);">₹${Number(p.amount).toLocaleString('en-IN')}</strong></td>
                  <td>${p.payment_date}</td>
                  <td><span class="badge-method">${p.method || '—'}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Render stat cards
  const statsGrid = container.querySelector('#dashboard-stats-grid');
  [
    { id: 'stat-clients',  label: 'Total Clients',   value: String(stats.total_clients || 0),   icon: Icons.users,      trend: 'Registered',  trendType: 'neutral', onClick: () => navigateTo('clients') },
    { id: 'stat-lawyers',  label: 'Total Lawyers',   value: String(stats.total_lawyers || 0),   icon: Icons.briefcase,  trend: 'On Roster',   trendType: 'neutral', onClick: () => navigateTo('lawyers') },
    { id: 'stat-judges',   label: 'Total Judges',    value: String(stats.total_judges  || 0),   icon: Icons.gavel,      trend: 'Courts',      trendType: 'neutral', onClick: () => navigateTo('judges')  },
    { id: 'stat-active',   label: 'Active Cases',    value: String(stats.active_cases  || 0),   icon: Icons.gavel,      trend: 'Ongoing',     trendType: 'up',      onClick: () => navigateTo('cases')   },
    { id: 'stat-hearings', label: 'Total Hearings',  value: String(stats.total_hearings|| 0),   icon: Icons.calendar,   trend: 'Scheduled',   trendType: 'up',      onClick: () => navigateTo('hearings')},
    { id: 'stat-revenue',  label: 'Total Revenue',   value: formattedRevenue,                   icon: Icons.creditCard, trend: 'Collected',   trendType: 'up',      onClick: () => navigateTo('payments')},
  ].forEach(item => statsGrid.appendChild(renderStatCard(item)));

  // Event handlers
  container.querySelector('#dash-quick-refresh').onclick   = () => renderDashboardView(container, navigateTo);
  container.querySelector('#dash-quick-new-case').onclick  = () => navigateTo('cases', { action: 'new' });
  container.querySelector('#dash-view-all-cases').onclick  = () => navigateTo('cases');
  container.querySelector('#dash-view-all-hearings').onclick = () => navigateTo('hearings');
  container.querySelector('#dash-view-all-payments').onclick = () => navigateTo('payments');

  container.querySelectorAll('[data-case-id]').forEach(el => {
    el.addEventListener('click', () => navigateTo('cases', { viewCaseId: el.getAttribute('data-case-id') }));
  });

  init3DTiltEffects();
}
