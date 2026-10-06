/**
 * JurisCore - Judge Management View (Live MySQL)
 */
import { api } from '../api.js';
import { Icons, Toast, Modal, confirmDialog, renderEmptyState } from '../components.js';

export async function renderJudgesView(container, options = {}) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Judicial Bench</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">Manage judge records, court assignments, and hearing counts.</p>
        </div>
        <button class="btn btn-primary" id="judges-add-btn">${Icons.plus} Add Judge</button>
      </div>
      <div class="card-3d" style="padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; position: relative;">
          <input type="text" id="judges-search-input" class="form-input" placeholder="Search by name, court..." style="padding-left: 38px; height: 38px;"/>
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex;">${Icons.search}</span>
        </div>
        <select class="form-select" id="judges-filter-court" style="width: 220px; height: 38px;">
          <option value="all">All Courts</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="judges-reset-filters" style="height: 38px;">Reset</button>
      </div>
      <div class="table-container card-3d">
        <div class="table-header-bar">
          <div class="table-title-area"><h3>${Icons.scale} Registered Judges <span class="table-count-badge" id="judges-count-badge">Loading...</span></h3></div>
          <span style="font-size: 12.5px; color: var(--text-muted);">Table: <code>Judge</code></span>
        </div>
        <div class="table-responsive-wrapper" id="judges-table-wrapper">
          <div style="padding: 30px; text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 10px; color: var(--text-muted);">Loading...</p></div>
        </div>
      </div>
    </div>
  `;

  let judgesList = [];
  try { judgesList = await api.judges.getAll(); } catch (e) {
    container.querySelector('#judges-table-wrapper').innerHTML = `<p style="padding: 20px; color: #C53030;">Error: ${e.message}</p>`;
    return;
  }

  const courtFilter = container.querySelector('#judges-filter-court');
  const courts = [...new Set(judgesList.map(j => j.court_name).filter(Boolean))];
  courts.sort().forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; courtFilter.appendChild(o); });

  const countBadge = container.querySelector('#judges-count-badge');
  const tableWrapper = container.querySelector('#judges-table-wrapper');
  const searchInput = container.querySelector('#judges-search-input');
  const addBtn = container.querySelector('#judges-add-btn');
  const resetBtn = container.querySelector('#judges-reset-filters');

  function renderTable(data) {
    countBadge.textContent = `${data.length} Total`;
    if (data.length === 0) {
      tableWrapper.innerHTML = '';
      tableWrapper.appendChild(renderEmptyState({ icon: Icons.scale, title: 'No judges found', description: 'No records matched.', actionText: 'Add Judge', onAction: () => openJudgeModal() }));
      return;
    }
    tableWrapper.innerHTML = `
      <table class="custom-table">
        <thead><tr>
          <th>ID</th><th>Name</th><th>Court Name</th><th>Phone</th><th>Email</th><th>Hearings</th><th style="text-align: right;">Actions</th>
        </tr></thead>
        <tbody>
          ${data.map(j => `
            <tr class="table-row-interactive">
              <td><span class="table-cell-id">#${j.judge_id}</span></td>
              <td class="table-cell-bold">${j.name}</td>
              <td><span class="badge-specialization">${j.court_name}</span></td>
              <td>${j.phone||'—'}</td>
              <td><a href="mailto:${j.email||''}" style="color: var(--brand-accent); text-decoration: none;">${j.email||'—'}</a></td>
              <td><strong>${j.hearing_count || 0}</strong></td>
              <td class="table-actions-cell">
                <button class="btn btn-sm btn-ghost judge-edit-btn" data-id="${j.judge_id}" title="Edit">${Icons.edit}</button>
                <button class="btn btn-sm btn-ghost judge-delete-btn" data-id="${j.judge_id}" title="Delete" style="color: #C53030;">${Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    tableWrapper.querySelectorAll('.judge-edit-btn').forEach(btn => {
      btn.onclick = () => {
        const judge = judgesList.find(j => String(j.judge_id) === btn.getAttribute('data-id'));
        if (judge) openJudgeModal(judge);
      };
    });
    tableWrapper.querySelectorAll('.judge-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const judge = judgesList.find(j => String(j.judge_id) === id);
        if (!judge) return;
        const confirmed = await confirmDialog({ title: 'Delete Judge?', message: `Delete ${judge.name}?`, confirmText: 'Delete', danger: true });
        if (confirmed) {
          try { await api.judges.remove(id); Toast.success('Deleted', `${judge.name} removed.`); judgesList = await api.judges.getAll(); renderTable(judgesList); }
          catch (err) { Toast.error('Error', err.message); }
        }
      };
    });
  }

  function applyFilter() {
    const q = searchInput.value.toLowerCase().trim();
    const court = courtFilter.value;
    renderTable(judgesList.filter(j => {
      const matchSearch = !q || j.name.toLowerCase().includes(q) || j.court_name.toLowerCase().includes(q);
      const matchCourt = court === 'all' || j.court_name === court;
      return matchSearch && matchCourt;
    }));
  }

  searchInput.oninput = applyFilter;
  courtFilter.onchange = applyFilter;
  resetBtn.onclick = () => { searchInput.value = ''; courtFilter.value = 'all'; renderTable(judgesList); };

  function openJudgeModal(judgeToEdit = null) {
    const isEdit = !!judgeToEdit;
    Modal.open({
      title: isEdit ? `Edit: ${judgeToEdit.name}` : 'Add New Judge',
      contentHtml: `
        <form novalidate>
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" id="judge-name" class="form-input" value="${judgeToEdit?judgeToEdit.name:''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Court Name <span class="required">*</span></label>
            <input type="text" id="judge-court" class="form-input" placeholder="e.g. District Court Hyderabad" value="${judgeToEdit?judgeToEdit.court_name:''}"/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" id="judge-phone" class="form-input" value="${judgeToEdit?(judgeToEdit.phone||''):''}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="judge-email" class="form-input" value="${judgeToEdit?(judgeToEdit.email||''):''}"/>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">${isEdit?'Save':'Create Judge'}</button>
      `
    });
    document.getElementById('modal-cancel').onclick = () => Modal.close();
    document.getElementById('modal-submit').onclick = async () => {
      const name = document.getElementById('judge-name').value.trim();
      const court_name = document.getElementById('judge-court').value.trim();
      if (!name || !court_name) { Toast.error('Validation', 'Name and court are required.'); return; }
      const payload = { name, court_name, phone: document.getElementById('judge-phone').value.trim()||null, email: document.getElementById('judge-email').value.trim()||null };
      try {
        if (isEdit) { await api.judges.update(judgeToEdit.judge_id, payload); Toast.success('Updated', `${name} updated.`); }
        else { await api.judges.create(payload); Toast.success('Created', `${name} added.`); }
        Modal.close(); judgesList = await api.judges.getAll(); renderTable(judgesList);
      } catch (err) { Toast.error('Error', err.message); }
    };
  }

  addBtn.onclick = () => openJudgeModal();
  renderTable(judgesList);
  if (options.action === 'new') openJudgeModal();
}
