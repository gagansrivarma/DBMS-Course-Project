/**
 * JurisCore - Lawyer Management View (Live MySQL)
 */
import { api } from '../api.js';
import { Icons, Toast, Modal, confirmDialog, renderEmptyState } from '../components.js';

export async function renderLawyersView(container, options = {}) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Lawyer Registry</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">Manage counsel profiles, specializations, and caseloads.</p>
        </div>
        <button class="btn btn-primary" id="lawyers-add-btn">${Icons.plus} Add Lawyer</button>
      </div>
      <div class="card-3d" style="padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; position: relative;">
          <input type="text" id="lawyers-search-input" class="form-input" placeholder="Search by name, specialization..." style="padding-left: 38px; height: 38px;"/>
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex;">${Icons.search}</span>
        </div>
        <select class="form-select" id="lawyers-filter-spec" style="width: 180px; height: 38px;">
          <option value="all">All Specializations</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="lawyers-reset-filters" style="height: 38px;">Reset</button>
      </div>
      <div class="table-container card-3d">
        <div class="table-header-bar">
          <div class="table-title-area"><h3>${Icons.briefcase} Registered Lawyers <span class="table-count-badge" id="lawyers-count-badge">Loading...</span></h3></div>
          <span style="font-size: 12.5px; color: var(--text-muted);">Table: <code>Lawyer</code></span>
        </div>
        <div class="table-responsive-wrapper" id="lawyers-table-wrapper">
          <div style="padding: 30px; text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 10px; color: var(--text-muted);">Loading...</p></div>
        </div>
      </div>
    </div>
  `;

  let lawyersList = [];
  try { lawyersList = await api.lawyers.getAll(); } catch (e) {
    container.querySelector('#lawyers-table-wrapper').innerHTML = `<p style="padding: 20px; color: #C53030;">Error: ${e.message}</p>`;
    return;
  }

  // Populate specialization filter
  const specFilter = container.querySelector('#lawyers-filter-spec');
  const specs = [...new Set(lawyersList.map(l => l.specialization).filter(Boolean))];
  specs.sort().forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; specFilter.appendChild(o); });

  const countBadge = container.querySelector('#lawyers-count-badge');
  const tableWrapper = container.querySelector('#lawyers-table-wrapper');
  const searchInput = container.querySelector('#lawyers-search-input');
  const addBtn = container.querySelector('#lawyers-add-btn');
  const resetBtn = container.querySelector('#lawyers-reset-filters');

  function renderTable(data) {
    countBadge.textContent = `${data.length} Total`;
    if (data.length === 0) {
      tableWrapper.innerHTML = '';
      tableWrapper.appendChild(renderEmptyState({ icon: Icons.briefcase, title: 'No lawyers found', description: 'No records matched.', actionText: 'Add Lawyer', onAction: () => openLawyerModal() }));
      return;
    }
    tableWrapper.innerHTML = `
      <table class="custom-table">
        <thead><tr>
          <th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Specialization</th><th>Cases</th><th style="text-align: right;">Actions</th>
        </tr></thead>
        <tbody>
          ${data.map(l => `
            <tr class="table-row-interactive">
              <td><span class="table-cell-id">#${l.lawyer_id}</span></td>
              <td class="table-cell-bold">${l.name}</td>
              <td>${l.phone}</td>
              <td><a href="mailto:${l.email||''}" style="color: var(--brand-accent); text-decoration: none;">${l.email||'—'}</a></td>
              <td><span class="badge-specialization">${l.specialization||'General'}</span></td>
              <td><strong>${l.case_count || 0}</strong></td>
              <td class="table-actions-cell">
                <button class="btn btn-sm btn-ghost lawyer-edit-btn" data-id="${l.lawyer_id}" title="Edit">${Icons.edit}</button>
                <button class="btn btn-sm btn-ghost lawyer-delete-btn" data-id="${l.lawyer_id}" title="Delete" style="color: #C53030;">${Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    tableWrapper.querySelectorAll('.lawyer-edit-btn').forEach(btn => {
      btn.onclick = () => {
        const lawyer = lawyersList.find(l => String(l.lawyer_id) === btn.getAttribute('data-id'));
        if (lawyer) openLawyerModal(lawyer);
      };
    });
    tableWrapper.querySelectorAll('.lawyer-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const lawyer = lawyersList.find(l => String(l.lawyer_id) === id);
        if (!lawyer) return;
        const confirmed = await confirmDialog({ title: 'Delete Lawyer?', message: `Delete ${lawyer.name} (#${lawyer.lawyer_id})?`, confirmText: 'Delete', danger: true });
        if (confirmed) {
          try { await api.lawyers.remove(id); Toast.success('Deleted', `${lawyer.name} removed.`); lawyersList = await api.lawyers.getAll(); renderTable(lawyersList); }
          catch (err) { Toast.error('Error', err.message); }
        }
      };
    });
  }

  function applyFilter() {
    const q = searchInput.value.toLowerCase().trim();
    const spec = specFilter.value;
    renderTable(lawyersList.filter(l => {
      const matchSearch = !q || l.name.toLowerCase().includes(q) || (l.specialization||'').toLowerCase().includes(q) || (l.email||'').toLowerCase().includes(q);
      const matchSpec = spec === 'all' || l.specialization === spec;
      return matchSearch && matchSpec;
    }));
  }

  searchInput.oninput = applyFilter;
  specFilter.onchange = applyFilter;
  resetBtn.onclick = () => { searchInput.value = ''; specFilter.value = 'all'; renderTable(lawyersList); };

  function openLawyerModal(lawyerToEdit = null) {
    const isEdit = !!lawyerToEdit;
    Modal.open({
      title: isEdit ? `Edit: ${lawyerToEdit.name}` : 'Add New Lawyer',
      contentHtml: `
        <form id="lawyer-form" novalidate>
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" id="lawyer-name" class="form-input" value="${lawyerToEdit?lawyerToEdit.name:''}" required/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone <span class="required">*</span></label>
              <input type="tel" id="lawyer-phone" class="form-input" value="${lawyerToEdit?lawyerToEdit.phone:''}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="lawyer-email" class="form-input" value="${lawyerToEdit?(lawyerToEdit.email||''):''}"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Specialization</label>
            <input type="text" id="lawyer-spec" class="form-input" placeholder="e.g. Criminal Law" value="${lawyerToEdit?(lawyerToEdit.specialization||''):''}"/>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">${isEdit?'Save Changes':'Create Lawyer'}</button>
      `
    });
    document.getElementById('modal-cancel').onclick = () => Modal.close();
    document.getElementById('modal-submit').onclick = async () => {
      const name = document.getElementById('lawyer-name').value.trim();
      const phone = document.getElementById('lawyer-phone').value.trim();
      if (!name || !phone) { Toast.error('Validation', 'Name and phone are required.'); return; }
      const payload = { name, phone, email: document.getElementById('lawyer-email').value.trim()||null, specialization: document.getElementById('lawyer-spec').value.trim()||null };
      try {
        if (isEdit) { await api.lawyers.update(lawyerToEdit.lawyer_id, payload); Toast.success('Updated', `${name} updated.`); }
        else { await api.lawyers.create(payload); Toast.success('Created', `${name} added.`); }
        Modal.close(); lawyersList = await api.lawyers.getAll(); renderTable(lawyersList);
      } catch (err) { Toast.error('Error', err.message); }
    };
  }

  addBtn.onclick = () => openLawyerModal();
  renderTable(lawyersList);
  if (options.action === 'new') openLawyerModal();
}
