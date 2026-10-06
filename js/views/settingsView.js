/**
 * JurisCore - Settings & Database System Status View
 * Connected directly to local MySQL database: LegalCaseDB
 * Displays live database schema, latency test, table counts, and connection architecture.
 */

import { api } from '../api.js';
import { Icons, Toast } from '../components.js';

export async function renderSettingsView(container) {
  container.innerHTML = `
    <div class="view-fade-enter" style="max-width: 960px;">
      <!-- Header -->
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Database Architecture & System Settings</h2>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">
          Live MySQL connection telemetry, relational schema specifications, and host endpoint configuration.
        </p>
      </div>

      <!-- Live MySQL Status Card -->
      <div class="card-3d" style="padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(45, 90, 70, 0.1); display: flex; align-items: center; justify-content: center; color: var(--brand-accent);">
              ${Icons.database}
            </div>
            <div>
              <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">MySQL 8.0 &mdash; LegalCaseDB</h3>
              <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
                Direct UNIX Socket / Localhost TCP Connection
              </p>
            </div>
          </div>
          <span class="status-badge badge-ongoing" id="db-live-badge" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 12.5px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #2D5A46; display: inline-block;"></span>
            Live MySQL Active
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;" id="db-metrics-cards">
          <div class="skeleton" style="height: 70px; border-radius: var(--radius-md);"></div>
          <div class="skeleton" style="height: 70px; border-radius: var(--radius-md);"></div>
          <div class="skeleton" style="height: 70px; border-radius: var(--radius-md);"></div>
          <div class="skeleton" style="height: 70px; border-radius: var(--radius-md);"></div>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-primary" id="test-db-conn-btn">
            ${Icons.check} Test Connection & Ping Latency
          </button>
          <span id="test-db-result" style="font-size: 13px; color: var(--text-secondary); font-weight: 500;"></span>
        </div>
      </div>

      <!-- Relational Schema Inspector -->
      <div class="card-3d" style="padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
          Relational Database Schema (LegalCaseDB)
        </h3>
        <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 18px;">
          7 normalized tables enforced with primary and foreign key constraints:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: Client</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              client_id (PK), name, phone, email, address, dob
            </p>
          </div>
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: Lawyer</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              lawyer_id (PK), name, phone, email, specialization
            </p>
          </div>
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: Judge</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              judge_id (PK), name, court_name, phone, email
            </p>
          </div>
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: LegalCase</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              case_id (PK), client_id (FK), title, case_type, description, status, filing_date, court_name
            </p>
          </div>
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: Hearing</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              hearing_id (PK), case_id (FK), judge_id (FK), hearing_date, hearing_time, location, notes
            </p>
          </div>
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: Payment</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              payment_id (PK), client_id (FK), case_id (FK), amount, payment_date, method, remarks
            </p>
          </div>
          <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); grid-column: 1 / -1;">
            <strong style="color: var(--brand-primary); font-size: 13.5px;">Table: Works_On (Junction Table)</strong>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 5px; font-family: monospace;">
              (lawyer_id, case_id) Composite PK &mdash; Maps multiple advocates to cases
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Fetch live stats to fill metric cards
  try {
    const stats = await api.dashboard.getStats();
    const cardsEl = container.querySelector('#db-metrics-cards');
    if (cardsEl) {
      cardsEl.innerHTML = `
        <div style="padding: 12px 16px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Clients</span>
          <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${stats.total_clients}</div>
        </div>
        <div style="padding: 12px 16px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Lawyers</span>
          <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${stats.total_lawyers}</div>
        </div>
        <div style="padding: 12px 16px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Judges</span>
          <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${stats.total_judges}</div>
        </div>
        <div style="padding: 12px 16px; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Legal Cases</span>
          <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${stats.total_cases}</div>
        </div>
      `;
    }
  } catch (e) {
    console.warn('Settings: could not fetch live stats', e);
  }

  // Bind ping test
  const testBtn = container.querySelector('#test-db-conn-btn');
  const resultSpan = container.querySelector('#test-db-result');

  testBtn.onclick = async () => {
    testBtn.disabled = true;
    testBtn.innerHTML = `<span class="loading-spinner" style="width: 14px; height: 14px;"></span> Testing...`;
    resultSpan.textContent = '';

    const start = performance.now();
    try {
      const health = await api.health();
      const latency = Math.round(performance.now() - start);
      testBtn.disabled = false;
      testBtn.innerHTML = `${Icons.check} Test Connection & Ping Latency`;
      resultSpan.innerHTML = `<span style="color: #2D5A46; font-weight: 600;">✓ Connected to ${health.database}</span> &mdash; ${latency}ms latency`;
      Toast.success('Database Online', `LegalCaseDB responded in ${latency}ms.`);
    } catch (err) {
      testBtn.disabled = false;
      testBtn.innerHTML = `${Icons.check} Test Connection & Ping Latency`;
      resultSpan.innerHTML = `<span style="color: #C53030; font-weight: 600;">✗ Connection Error</span>: ${err.message}`;
      Toast.error('Connection Failed', err.message);
    }
  };
}
