/**
 * JurisCore - Reports & Analytics View (Live MySQL)
 * Multi-dimensional reporting suite powered by live LegalCaseDB:
 * Case Report, Client Report, Lawyer Report, Hearing Report, Payment Report.
 * Features live MySQL filters, summary stat tiles, visual breakdowns, and CSV export.
 */

import { api } from '../api.js';
import { Icons, Toast } from '../components.js';

export async function renderReportsView(container) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Firm Operations & Practice Reports</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">
            Audited operational analytics, caseload distributions, and financial trust statements from <strong>LegalCaseDB</strong>.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="reports-print-btn">${Icons.fileText} Print Report</button>
          <button class="btn btn-primary" id="reports-export-csv-btn">${Icons.download} Export CSV</button>
        </div>
      </div>

      <!-- Report Tabs -->
      <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 20px; overflow-x: auto; padding-bottom: 2px;">
        <button class="btn btn-sm btn-accent report-tab-btn" data-report="cases" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0;">Case Report</button>
        <button class="btn btn-sm btn-ghost report-tab-btn" data-report="clients" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0;">Client Report</button>
        <button class="btn btn-sm btn-ghost report-tab-btn" data-report="lawyers" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0;">Lawyer Report</button>
        <button class="btn btn-sm btn-ghost report-tab-btn" data-report="hearings" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0;">Hearing Report</button>
        <button class="btn btn-sm btn-ghost report-tab-btn" data-report="payments" style="border-radius: var(--radius-sm) var(--radius-sm) 0 0;">Payment Report</button>
      </div>

      <!-- Filter Controls Toolbar -->
      <div class="card-3d" style="padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          ${Icons.filter} <span>Report Scope:</span>
        </div>

        <select class="form-select" id="report-filter-status" style="width: 170px; height: 38px;">
          <option value="all">All Case Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Closed">Closed</option>
        </select>

        <select class="form-select" id="report-filter-type" style="width: 190px; height: 38px;">
          <option value="all">All Practice Areas</option>
          <option value="Criminal">Criminal</option>
          <option value="Civil">Civil</option>
          <option value="Corporate">Corporate</option>
          <option value="Cyber">Cyber</option>
          <option value="Family">Family</option>
          <option value="Tax">Tax</option>
        </select>
      </div>

      <!-- Summary Stat Cards for Report -->
      <div class="stat-cards-grid" id="report-summary-cards" style="margin-bottom: 24px;"></div>

      <!-- Report Table & Visuals Area -->
      <div id="report-output-area"></div>
    </div>
  `;

  let currentReport = 'cases';
  let allCases = [], allClients = [], allLawyers = [], allHearings = [], allPayments = [];

  try {
    [allCases, allClients, allLawyers, allHearings, allPayments] = await Promise.all([
      api.cases.getAll(),
      api.clients.getAll(),
      api.lawyers.getAll(),
      api.hearings.getAll(),
      api.payments.getAll()
    ]);
  } catch (err) {
    Toast.error('Failed to load reports data', err.message);
  }

  const tabBtns = container.querySelectorAll('.report-tab-btn');
  const summaryGrid = container.querySelector('#report-summary-cards');
  const outputArea = container.querySelector('#report-output-area');
  const exportCsvBtn = container.querySelector('#reports-export-csv-btn');
  const printBtn = container.querySelector('#reports-print-btn');
  const statusFilter = container.querySelector('#report-filter-status');
  const typeFilter = container.querySelector('#report-filter-type');

  let currentExportData = { filename: 'JurisCore_Report.csv', headers: [], rows: [] };

  function renderActiveReport() {
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-report') === currentReport) {
        btn.className = 'btn btn-sm btn-accent report-tab-btn';
      } else {
        btn.className = 'btn btn-sm btn-ghost report-tab-btn';
      }
    });

    const selectedStatus = statusFilter.value;
    const selectedType = typeFilter.value;

    if (currentReport === 'cases') {
      const filtered = allCases.filter(c => {
        const matchStatus = selectedStatus === 'all' || (c.status || '').toLowerCase() === selectedStatus.toLowerCase();
        const matchType = selectedType === 'all' || (c.case_type || '').toLowerCase().includes(selectedType.toLowerCase());
        return matchStatus && matchType;
      });

      const pendingCount = filtered.filter(c => (c.status || '').toLowerCase() === 'pending').length;
      const ongoingCount = filtered.filter(c => (c.status || '').toLowerCase() === 'ongoing').length;
      const closedCount  = filtered.filter(c => (c.status || '').toLowerCase() === 'closed').length;

      summaryGrid.innerHTML = `
        <div class="card-3d stat-card">
          <span class="stat-card-label">Total Filtered Cases</span>
          <div class="stat-card-value">${filtered.length}</div>
          <div class="stat-card-footer"><span>Live MySQL records</span></div>
        </div>
        <div class="card-3d stat-card">
          <span class="stat-card-label">Pending Matters</span>
          <div class="stat-card-value" style="color: #C59B27;">${pendingCount}</div>
          <div class="stat-card-footer"><span>Initial docket stage</span></div>
        </div>
        <div class="card-3d stat-card">
          <span class="stat-card-label">Ongoing Litigation</span>
          <div class="stat-card-value" style="color: var(--brand-accent);">${ongoingCount}</div>
          <div class="stat-card-footer"><span>Active proceedings</span></div>
        </div>
        <div class="card-3d stat-card">
          <span class="stat-card-label">Closed Decrees</span>
          <div class="stat-card-value" style="color: #2D5A46;">${closedCount}</div>
          <div class="stat-card-footer"><span>Disposed / resolved</span></div>
        </div>
      `;

      outputArea.innerHTML = `
        <div class="table-container card-3d">
          <div class="table-header-bar">
            <h3>${Icons.fileText} Comprehensive Case Matter Report</h3>
            <span class="table-count-badge">${filtered.length} Records</span>
          </div>
          <div class="table-responsive-wrapper">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Case Type</th>
                  <th>Assigned Counsel</th>
                  <th>Status</th>
                  <th>Filing Date</th>
                  <th>Court</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length ? filtered.map(c => `
                  <tr>
                    <td><span class="table-cell-id">#CASE-${c.case_id}</span></td>
                    <td class="table-cell-bold">${c.title}</td>
                    <td>${c.client_name || '—'}</td>
                    <td><span class="badge-specialization">${c.case_type || 'General'}</span></td>
                    <td>${c.lawyers || 'Unassigned'}</td>
                    <td><span class="status-badge badge-${(c.status || 'pending').toLowerCase()}">${c.status || 'Pending'}</span></td>
                    <td>${c.filing_date || '—'}</td>
                    <td>${c.court_name || '—'}</td>
                  </tr>
                `).join('') : `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No cases match the selected filters.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;

      currentExportData = {
        filename: 'JurisCore_Cases_Report.csv',
        headers: ['Case ID', 'Case Title', 'Client Name', 'Case Type', 'Assigned Counsel', 'Status', 'Filing Date', 'Court'],
        rows: filtered.map(c => [c.case_id, `"${c.title}"`, `"${c.client_name || ''}"`, c.case_type, `"${c.lawyers || ''}"`, c.status, c.filing_date, `"${c.court_name || ''}"`])
      };
    } else if (currentReport === 'clients') {
      summaryGrid.innerHTML = `
        <div class="card-3d stat-card">
          <span class="stat-card-label">Total Clients in LegalCaseDB</span>
          <div class="stat-card-value">${allClients.length}</div>
          <div class="stat-card-footer"><span>Live roster</span></div>
        </div>
        <div class="card-3d stat-card">
          <span class="stat-card-label">Total Active Cases</span>
          <div class="stat-card-value">${allCases.length}</div>
          <div class="stat-card-footer"><span>Assigned dockets</span></div>
        </div>
      `;

      outputArea.innerHTML = `
        <div class="table-container card-3d">
          <div class="table-header-bar">
            <h3>${Icons.users} Client Registry Report</h3>
            <span class="table-count-badge">${allClients.length} Clients</span>
          </div>
          <div class="table-responsive-wrapper">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Name</th>
                  <th>Contact Phone</th>
                  <th>Email Address</th>
                  <th>Address</th>
                  <th>Date of Birth</th>
                </tr>
              </thead>
              <tbody>
                ${allClients.map(c => `
                  <tr>
                    <td><span class="table-cell-id">#CL-${c.client_id}</span></td>
                    <td class="table-cell-bold">${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.email || '—'}</td>
                    <td>${c.address || '—'}</td>
                    <td>${c.dob || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      currentExportData = {
        filename: 'JurisCore_Clients_Report.csv',
        headers: ['Client ID', 'Full Name', 'Phone', 'Email', 'Address', 'DOB'],
        rows: allClients.map(c => [c.client_id, `"${c.name}"`, c.phone, c.email || '', `"${c.address || ''}"`, c.dob || ''])
      };
    } else if (currentReport === 'lawyers') {
      summaryGrid.innerHTML = `
        <div class="card-3d stat-card">
          <span class="stat-card-label">Enrolled Advocates</span>
          <div class="stat-card-value">${allLawyers.length}</div>
          <div class="stat-card-footer"><span>Legal staff</span></div>
        </div>
        <div class="card-3d stat-card">
          <span class="stat-card-label">Active Litigations</span>
          <div class="stat-card-value">${allCases.length}</div>
          <div class="stat-card-footer"><span>Assigned via Works_On</span></div>
        </div>
      `;

      outputArea.innerHTML = `
        <div class="table-container card-3d">
          <div class="table-header-bar">
            <h3>${Icons.briefcase} Legal Counsel Roster Report</h3>
            <span class="table-count-badge">${allLawyers.length} Advocates</span>
          </div>
          <div class="table-responsive-wrapper">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Lawyer ID</th>
                  <th>Advocate Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Assigned Matters</th>
                </tr>
              </thead>
              <tbody>
                ${allLawyers.map(l => `
                  <tr>
                    <td><span class="table-cell-id">#LAW-${l.lawyer_id}</span></td>
                    <td class="table-cell-bold">${l.name}</td>
                    <td>${l.phone}</td>
                    <td>${l.email || '—'}</td>
                    <td><span class="badge-specialization">${l.specialization || 'General'}</span></td>
                    <td><strong>${l.case_count || 0}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      currentExportData = {
        filename: 'JurisCore_Lawyers_Report.csv',
        headers: ['Lawyer ID', 'Advocate Name', 'Phone', 'Email', 'Specialization', 'Cases'],
        rows: allLawyers.map(l => [l.lawyer_id, `"${l.name}"`, l.phone, l.email || '', l.specialization || '', l.case_count || 0])
      };
    } else if (currentReport === 'hearings') {
      summaryGrid.innerHTML = `
        <div class="card-3d stat-card">
          <span class="stat-card-label">Scheduled Hearings</span>
          <div class="stat-card-value">${allHearings.length}</div>
          <div class="stat-card-footer"><span>Total court listings</span></div>
        </div>
      `;

      outputArea.innerHTML = `
        <div class="table-container card-3d">
          <div class="table-header-bar">
            <h3>${Icons.calendar} Court Hearing Schedule Report</h3>
            <span class="table-count-badge">${allHearings.length} Hearings</span>
          </div>
          <div class="table-responsive-wrapper">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Hearing ID</th>
                  <th>Case Title</th>
                  <th>Presiding Judge</th>
                  <th>Hearing Date</th>
                  <th>Hearing Time</th>
                  <th>Court / Location</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${allHearings.map(h => `
                  <tr>
                    <td><span class="table-cell-id">#HR-${h.hearing_id}</span></td>
                    <td class="table-cell-bold">${h.case_title || `Case #${h.case_id}`}</td>
                    <td>${h.judge_name || '—'}</td>
                    <td>${h.hearing_date}</td>
                    <td>${h.hearing_time || '—'}</td>
                    <td>${h.location || h.court_name || '—'}</td>
                    <td style="font-size: 12px; color: var(--text-muted);">${h.notes || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      currentExportData = {
        filename: 'JurisCore_Hearings_Report.csv',
        headers: ['Hearing ID', 'Case Title', 'Judge', 'Date', 'Time', 'Location', 'Notes'],
        rows: allHearings.map(h => [h.hearing_id, `"${h.case_title || ''}"`, `"${h.judge_name || ''}"`, h.hearing_date, h.hearing_time || '', `"${h.location || ''}"`, `"${h.notes || ''}"`])
      };
    } else if (currentReport === 'payments') {
      const totalAmount = allPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const fmtAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount);

      summaryGrid.innerHTML = `
        <div class="card-3d stat-card">
          <span class="stat-card-label">Total Fee Collections</span>
          <div class="stat-card-value" style="color: var(--brand-accent);">${fmtAmount}</div>
          <div class="stat-card-footer"><span>Cumulative receipts</span></div>
        </div>
        <div class="card-3d stat-card">
          <span class="stat-card-label">Transactions Recorded</span>
          <div class="stat-card-value">${allPayments.length}</div>
          <div class="stat-card-footer"><span>Verified entries</span></div>
        </div>
      `;

      outputArea.innerHTML = `
        <div class="table-container card-3d">
          <div class="table-header-bar">
            <h3>${Icons.creditCard} Trust Account & Payment Report</h3>
            <span class="table-count-badge">${allPayments.length} Transactions</span>
          </div>
          <div class="table-responsive-wrapper">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Client</th>
                  <th>Case Title</th>
                  <th>Amount (₹)</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${allPayments.map(p => `
                  <tr>
                    <td><span class="table-cell-id">#PAY-${p.payment_id}</span></td>
                    <td class="table-cell-bold">${p.client_name || `Client #${p.client_id}`}</td>
                    <td>${p.case_title || `Case #${p.case_id}`}</td>
                    <td class="table-cell-bold" style="color: var(--brand-accent);">
                      ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.amount)}
                    </td>
                    <td>${p.payment_date}</td>
                    <td><span class="badge-specialization">${p.method || 'Cash'}</span></td>
                    <td style="font-size: 12px; color: var(--text-muted);">${p.remarks || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      currentExportData = {
        filename: 'JurisCore_Payments_Report.csv',
        headers: ['Payment ID', 'Client Name', 'Case Title', 'Amount', 'Date', 'Method', 'Remarks'],
        rows: allPayments.map(p => [p.payment_id, `"${p.client_name || ''}"`, `"${p.case_title || ''}"`, p.amount, p.payment_date, p.method || '', `"${p.remarks || ''}"`])
      };
    }
  }

  // Bind tab navigation
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      currentReport = btn.getAttribute('data-report');
      renderActiveReport();
    };
  });

  statusFilter.onchange = renderActiveReport;
  typeFilter.onchange = renderActiveReport;

  // Print button
  printBtn.onclick = () => {
    window.print();
  };

  // CSV Export
  exportCsvBtn.onclick = () => {
    if (!currentExportData.rows.length) {
      Toast.warning('No Records', 'There are no rows in the selected report to export.');
      return;
    }
    const csvContent = [
      currentExportData.headers.join(','),
      ...currentExportData.rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentExportData.filename;
    link.click();
    Toast.success('Export Complete', `Saved ${currentExportData.filename}`);
  };

  renderActiveReport();
}
