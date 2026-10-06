/**
 * JurisCore - Legal Cases View (Live MySQL)
 * Full CRUD with 5-part dossier modal, case filing, lawyer assignment.
 */
import { api } from '../api.js';
import { Icons, Toast, Modal, confirmDialog, renderEmptyState, init3DTiltEffects } from '../components.js';

export async function renderCasesView(container, options = {}) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Legal Cases Docket</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">File, track, and manage all legal matters from LegalCaseDB.</p>
        </div>
        <button class="btn btn-primary" id="cases-add-btn">${Icons.plus} File New Case</button>
      </div>
      <div class="card-3d" style="padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; position: relative;">
          <input type="text" id="cases-search-input" class="form-input" placeholder="Search by title, client, ID..." style="padding-left: 38px; height: 38px;"/>
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex;">${Icons.search}</span>
        </div>
        <select class="form-select" id="cases-filter-status" style="width: 160px; height: 38px;">
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Closed">Closed</option>
        </select>
        <select class="form-select" id="cases-filter-type" style="width: 160px; height: 38px;">
          <option value="all">All Types</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="cases-reset-filters" style="height: 38px;">Reset</button>
      </div>
      <div class="table-container card-3d">
        <div class="table-header-bar">
          <div class="table-title-area"><h3>${Icons.gavel} Case Docket <span class="table-count-badge" id="cases-count-badge">Loading...</span></h3></div>
          <span style="font-size: 12.5px; color: var(--text-muted);">Tables: <code>LegalCase</code>, <code>Works_On</code></span>
        </div>
        <div class="table-responsive-wrapper" id="cases-table-wrapper">
          <div style="padding: 30px; text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 10px; color: var(--text-muted);">Loading cases from MySQL...</p></div>
        </div>
      </div>
    </div>
  `;

  let casesList = [], clientsList = [], lawyersList = [];
  try {
    [casesList, clientsList, lawyersList] = await Promise.all([api.cases.getAll(), api.clients.getAll(), api.lawyers.getAll()]);
  } catch (e) {
    container.querySelector('#cases-table-wrapper').innerHTML = `<p style="padding: 20px; color: #C53030;">Error: ${e.message}</p>`;
    return;
  }

  // Populate type filter
  const typeFilter = container.querySelector('#cases-filter-type');
  const types = [...new Set(casesList.map(c => c.case_type).filter(Boolean))];
  types.sort().forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; typeFilter.appendChild(o); });

  const countBadge = container.querySelector('#cases-count-badge');
  const tableWrapper = container.querySelector('#cases-table-wrapper');
  const searchInput = container.querySelector('#cases-search-input');
  const statusFilter = container.querySelector('#cases-filter-status');
  const addBtn = container.querySelector('#cases-add-btn');
  const resetBtn = container.querySelector('#cases-reset-filters');

  function renderTable(data) {
    countBadge.textContent = `${data.length} Matters`;
    if (data.length === 0) {
      tableWrapper.innerHTML = '';
      tableWrapper.appendChild(renderEmptyState({ icon: Icons.gavel, title: 'No cases found', description: 'No records matched.', actionText: 'File Case', onAction: () => openCaseModal() }));
      return;
    }
    tableWrapper.innerHTML = `
      <table class="custom-table">
        <thead><tr>
          <th>ID</th><th>Title</th><th>Client</th><th>Type</th><th>Status</th><th>Filing Date</th><th>Court</th><th>Lawyers</th><th style="text-align: right;">Actions</th>
        </tr></thead>
        <tbody>
          ${data.map(c => `
            <tr class="table-row-interactive">
              <td><span class="table-cell-id">#${c.case_id}</span></td>
              <td class="table-cell-bold">
                <a href="javascript:void(0)" class="case-view-link" data-id="${c.case_id}" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${c.title}</a>
              </td>
              <td>${c.client_name||'—'}</td>
              <td><span class="badge-specialization">${c.case_type||'General'}</span></td>
              <td><span class="status-badge badge-${(c.status||'pending').toLowerCase()}">${c.status}</span></td>
              <td>${c.filing_date||'—'}</td>
              <td style="max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.court_name||'—'}</td>
              <td style="max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.lawyers||'—'}</td>
              <td class="table-actions-cell">
                <button class="btn btn-sm btn-ghost case-view-btn" data-id="${c.case_id}" title="Dossier">${Icons.eye}</button>
                <button class="btn btn-sm btn-ghost case-edit-btn" data-id="${c.case_id}" title="Edit">${Icons.edit}</button>
                <button class="btn btn-sm btn-ghost case-delete-btn" data-id="${c.case_id}" title="Delete" style="color: #C53030;">${Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    tableWrapper.querySelectorAll('.case-view-btn, .case-view-link').forEach(btn => {
      btn.onclick = () => openCaseDossier(btn.getAttribute('data-id'));
    });
    tableWrapper.querySelectorAll('.case-edit-btn').forEach(btn => {
      btn.onclick = () => {
        const c = casesList.find(x => String(x.case_id) === btn.getAttribute('data-id'));
        if (c) openCaseModal(c);
      };
    });
    tableWrapper.querySelectorAll('.case-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const c = casesList.find(x => String(x.case_id) === id);
        if (!c) return;
        const confirmed = await confirmDialog({ title: 'Delete Case?', message: `Delete "${c.title}" (#${c.case_id})?`, confirmText: 'Delete', danger: true });
        if (confirmed) {
          try { await api.cases.remove(id); Toast.success('Deleted', `Case #${id} removed.`); casesList = await api.cases.getAll(); renderTable(casesList); }
          catch (err) { Toast.error('Error', err.message); }
        }
      };
    });
  }

  function applyFilter() {
    const q = searchInput.value.toLowerCase().trim();
    const status = statusFilter.value;
    const type = typeFilter.value;
    renderTable(casesList.filter(c => {
      const matchQ = !q || c.title.toLowerCase().includes(q) || (c.client_name||'').toLowerCase().includes(q) || String(c.case_id).includes(q);
      const matchStatus = status === 'all' || c.status === status;
      const matchType = type === 'all' || c.case_type === type;
      return matchQ && matchStatus && matchType;
    }));
  }

  searchInput.oninput = applyFilter;
  statusFilter.onchange = applyFilter;
  typeFilter.onchange = applyFilter;
  resetBtn.onclick = () => { searchInput.value = ''; statusFilter.value = 'all'; typeFilter.value = 'all'; renderTable(casesList); };

  function openCaseModal(caseToEdit = null) {
    const isEdit = !!caseToEdit;
    Modal.open({
      title: isEdit ? `Edit: ${caseToEdit.title}` : 'File New Case',
      wide: true,
      contentHtml: `
        <form novalidate>
          <div class="form-group">
            <label class="form-label">Case Title <span class="required">*</span></label>
            <input type="text" id="case-title" class="form-input" value="${caseToEdit?caseToEdit.title:''}"/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Client <span class="required">*</span></label>
              <select id="case-client" class="form-select">
                <option value="">— Select Client —</option>
                ${clientsList.map(cl => `<option value="${cl.client_id}" ${caseToEdit && caseToEdit.client_id === cl.client_id ? 'selected' : ''}>${cl.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Case Type</label>
              <select id="case-type" class="form-select">
                ${['Civil', 'Criminal', 'Corporate', 'Family', 'Property', 'Tax', 'Consumer', 'Labour', 'Other'].map(t => `<option value="${t}" ${caseToEdit && caseToEdit.case_type===t?'selected':''}>${t}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="case-desc" class="form-input" rows="3" style="resize: vertical;">${caseToEdit?(caseToEdit.description||''):''}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="case-status" class="form-select">
                ${['Pending','Ongoing','Closed'].map(s => `<option value="${s}" ${caseToEdit && caseToEdit.status===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Filing Date</label>
              <input type="date" id="case-filing-date" class="form-input" value="${caseToEdit?(caseToEdit.filing_date||''):new Date().toISOString().slice(0,10)}"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Court Name</label>
            <input type="text" id="case-court" class="form-input" placeholder="e.g. District Court Hyderabad" value="${caseToEdit?(caseToEdit.court_name||''):''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Assign Lawyers</label>
            <div id="case-lawyers-checkboxes" style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; overflow-y: auto;">
              ${lawyersList.map(l => `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <input type="checkbox" name="case-lawyer" value="${l.lawyer_id}"/>
                  ${l.name} <span style="font-size: 11px; color: var(--text-muted);">(${l.specialization||'General'})</span>
                </label>
              `).join('')}
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">${isEdit?'Save Changes':'File Case'}</button>
      `
    });
    document.getElementById('modal-cancel').onclick = () => Modal.close();
    document.getElementById('modal-submit').onclick = async () => {
      const title = document.getElementById('case-title').value.trim();
      const client_id = document.getElementById('case-client').value;
      if (!title || !client_id) { Toast.error('Validation', 'Title and client are required.'); return; }
      const lawyer_ids = [...document.querySelectorAll('input[name="case-lawyer"]:checked')].map(cb => Number(cb.value));
      const payload = {
        title, client_id: Number(client_id),
        case_type: document.getElementById('case-type').value,
        description: document.getElementById('case-desc').value.trim()||null,
        status: document.getElementById('case-status').value,
        filing_date: document.getElementById('case-filing-date').value||null,
        court_name: document.getElementById('case-court').value.trim()||null,
        lawyer_ids,
      };
      try {
        if (isEdit) { await api.cases.update(caseToEdit.case_id, payload); Toast.success('Updated', `"${title}" updated.`); }
        else { await api.cases.create(payload); Toast.success('Filed', `"${title}" filed successfully.`); }
        Modal.close(); casesList = await api.cases.getAll(); renderTable(casesList);
      } catch (err) { Toast.error('Error', err.message); }
    };
  }

  async function openCaseDossier(caseId) {
    let detail;
    try { detail = await api.cases.getById(caseId); } catch (e) { Toast.error('Error', e.message); return; }

    const hearings = detail.hearings || [];
    const payments = detail.payments || [];
    const lawyers  = detail.lawyers  || [];
    const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);

    Modal.open({
      title: `Case Dossier: ${detail.title}`,
      wide: true,
      contentHtml: `
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
          <!-- Profile -->
          <div style="background: var(--bg-subtle); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
            <span class="table-cell-id">#${detail.case_id}</span>
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 6px 0;">${detail.title}</h3>
            <span class="status-badge badge-${(detail.status||'pending').toLowerCase()}" style="margin-bottom: 12px;">${detail.status}</span>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; margin-top: 14px;">
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Type</span><p>${detail.case_type||'General'}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Client</span><p style="font-weight: 600;">${detail.client_name}</p><p style="font-size: 12px; color: var(--text-muted);">${detail.client_phone} &bull; ${detail.client_email||''}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Court</span><p>${detail.court_name||'—'}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Filed</span><p>${detail.filing_date||'—'}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Description</span><p style="line-height: 1.4;">${detail.description||'No description provided.'}</p></div>
            </div>
          </div>
          <!-- Details -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Lawyers -->
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Assigned Lawyers <span class="table-count-badge">${lawyers.length}</span></h4>
              ${lawyers.length === 0 ? '<p style="font-size: 13px; color: var(--text-muted);">No lawyers assigned.</p>' :
                `<div style="display: flex; flex-wrap: wrap; gap: 8px;">${lawyers.map(l => `<span class="badge-specialization">${l.name} (${l.specialization||'General'})</span>`).join('')}</div>`}
            </div>
            <!-- Hearings -->
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Hearings <span class="table-count-badge">${hearings.length}</span></h4>
              ${hearings.length === 0 ? '<p style="font-size: 13px; color: var(--text-muted);">No hearings scheduled.</p>' :
                `<table class="custom-table" style="font-size: 13px;">
                  <thead><tr><th>Date</th><th>Time</th><th>Judge</th><th>Location</th><th>Notes</th></tr></thead>
                  <tbody>${hearings.map(h => `<tr>
                    <td><strong>${h.hearing_date}</strong></td>
                    <td>${h.hearing_time}</td>
                    <td>${h.judge_name}</td>
                    <td>${h.location||'—'}</td>
                    <td style="max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${h.notes||'—'}</td>
                  </tr>`).join('')}</tbody>
                </table>`}
            </div>
            <!-- Payments -->
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Payment Ledger <span class="table-count-badge">₹${totalPaid.toLocaleString('en-IN')}</span></h4>
              ${payments.length === 0 ? '<p style="font-size: 13px; color: var(--text-muted);">No payments recorded.</p>' :
                `<table class="custom-table" style="font-size: 13px;">
                  <thead><tr><th>ID</th><th>Amount</th><th>Date</th><th>Method</th><th>Remarks</th></tr></thead>
                  <tbody>${payments.map(p => `<tr>
                    <td>#${p.payment_id}</td>
                    <td><strong style="color: var(--brand-primary);">₹${Number(p.amount).toLocaleString('en-IN')}</strong></td>
                    <td>${p.payment_date}</td>
                    <td><span class="badge-method">${p.method||'—'}</span></td>
                    <td style="max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.remarks||'—'}</td>
                  </tr>`).join('')}</tbody>
                </table>`}
            </div>
          </div>
        </div>
      `,
      footerHtml: `<button class="btn btn-secondary" onclick="document.querySelector('#modal-global-close').click()">Close Dossier</button>`
    });
  }

  addBtn.onclick = () => openCaseModal();
  renderTable(casesList);
  if (options.action === 'new') openCaseModal();
  if (options.viewCaseId) openCaseDossier(options.viewCaseId);
}
