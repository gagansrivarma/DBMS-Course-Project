/**
 * JurisCore - Client Management View (Live MySQL)
 */
import { api } from '../api.js';
import { Icons, Toast, Modal, confirmDialog, renderEmptyState } from '../components.js';

export async function renderClientsView(container, options = {}) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Clients Directory</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">Manage client profiles, contact details, and associated matters.</p>
        </div>
        <button class="btn btn-primary" id="clients-add-btn">${Icons.plus} Add Client</button>
      </div>
      <div class="card-3d" style="padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; position: relative;">
          <input type="text" id="clients-search-input" class="form-input" placeholder="Search by name, email, phone..." style="padding-left: 38px; height: 38px;"/>
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex;">${Icons.search}</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="clients-reset-filters" style="height: 38px;">Reset</button>
      </div>
      <div class="table-container card-3d">
        <div class="table-header-bar">
          <div class="table-title-area">
            <h3>${Icons.users} Registered Clients <span class="table-count-badge" id="clients-count-badge">Loading...</span></h3>
          </div>
          <span style="font-size: 12.5px; color: var(--text-muted);">Table: <code>Client</code></span>
        </div>
        <div class="table-responsive-wrapper" id="clients-table-wrapper">
          <div style="padding: 30px; text-align: center;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 10px; color: var(--text-muted);">Loading from MySQL...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  let clientsList = [];
  try {
    clientsList = await api.clients.getAll();
  } catch (e) {
    container.querySelector('#clients-table-wrapper').innerHTML = `<p style="padding: 20px; color: #C53030;">Error: ${e.message}</p>`;
    return;
  }

  const countBadge = container.querySelector('#clients-count-badge');
  const tableWrapper = container.querySelector('#clients-table-wrapper');
  const searchInput = container.querySelector('#clients-search-input');
  const addBtn = container.querySelector('#clients-add-btn');
  const resetBtn = container.querySelector('#clients-reset-filters');

  function renderTable(data) {
    countBadge.textContent = `${data.length} Total`;
    if (data.length === 0) {
      tableWrapper.innerHTML = '';
      tableWrapper.appendChild(renderEmptyState({ icon: Icons.users, title: 'No clients found', description: 'No records matched your query.', actionText: 'Add Client', onAction: () => openClientModal() }));
      return;
    }
    tableWrapper.innerHTML = `
      <table class="custom-table">
        <thead><tr>
          <th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>DOB</th><th style="text-align: right;">Actions</th>
        </tr></thead>
        <tbody>
          ${data.map(c => `
            <tr class="table-row-interactive">
              <td><span class="table-cell-id">#${c.client_id}</span></td>
              <td class="table-cell-bold">
                <a href="javascript:void(0)" class="client-view-link" data-id="${c.client_id}" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">${c.name}</a>
              </td>
              <td>${c.phone}</td>
              <td><a href="mailto:${c.email||''}" style="color: var(--brand-accent); text-decoration: none;">${c.email||'—'}</a></td>
              <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.address||''}">${c.address||'—'}</td>
              <td>${c.dob || '—'}</td>
              <td class="table-actions-cell">
                <button class="btn btn-sm btn-ghost client-view-btn" data-id="${c.client_id}" title="View">${Icons.eye}</button>
                <button class="btn btn-sm btn-ghost client-edit-btn" data-id="${c.client_id}" title="Edit">${Icons.edit}</button>
                <button class="btn btn-sm btn-ghost client-delete-btn" data-id="${c.client_id}" title="Delete" style="color: #C53030;">${Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    tableWrapper.querySelectorAll('.client-view-btn, .client-view-link').forEach(btn => {
      btn.onclick = () => openClientProfileModal(btn.getAttribute('data-id'));
    });
    tableWrapper.querySelectorAll('.client-edit-btn').forEach(btn => {
      btn.onclick = () => {
        const client = clientsList.find(c => String(c.client_id) === btn.getAttribute('data-id'));
        if (client) openClientModal(client);
      };
    });
    tableWrapper.querySelectorAll('.client-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const client = clientsList.find(c => String(c.client_id) === id);
        if (!client) return;
        const confirmed = await confirmDialog({ title: 'Delete Client?', message: `Delete ${client.name} (#${client.client_id})?`, confirmText: 'Delete', danger: true });
        if (confirmed) {
          try {
            await api.clients.remove(id);
            Toast.success('Deleted', `${client.name} removed.`);
            clientsList = await api.clients.getAll();
            renderTable(clientsList);
          } catch (err) { Toast.error('Error', err.message); }
        }
      };
    });
  }

  function applyFilter() {
    const q = searchInput.value.toLowerCase().trim();
    renderTable(clientsList.filter(c => !q || c.name.toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q) || c.phone.includes(q) || String(c.client_id).includes(q)));
  }

  searchInput.oninput = applyFilter;
  resetBtn.onclick = () => { searchInput.value = ''; renderTable(clientsList); };

  function openClientModal(clientToEdit = null) {
    const isEdit = !!clientToEdit;
    Modal.open({
      title: isEdit ? `Edit: ${clientToEdit.name}` : 'Register New Client',
      contentHtml: `
        <form id="client-form" novalidate>
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" id="client-name" class="form-input" placeholder="e.g. Rahul Kumar" value="${clientToEdit ? clientToEdit.name : ''}" required/>
            <div class="form-error-msg" id="err-name">Name is required.</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone <span class="required">*</span></label>
              <input type="tel" id="client-phone" class="form-input" placeholder="9876543210" value="${clientToEdit ? clientToEdit.phone : ''}" required/>
              <div class="form-error-msg" id="err-phone">Phone is required.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="client-email" class="form-input" placeholder="client@email.com" value="${clientToEdit ? (clientToEdit.email||'') : ''}"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" id="client-address" class="form-input" placeholder="City" value="${clientToEdit ? (clientToEdit.address||'') : ''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Date of Birth</label>
            <input type="date" id="client-dob" class="form-input" value="${clientToEdit ? (clientToEdit.dob||'') : ''}"/>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">${isEdit ? 'Save Changes' : 'Create Client'}</button>
      `
    });
    document.getElementById('modal-cancel').onclick = () => Modal.close();
    document.getElementById('modal-submit').onclick = async () => {
      const name = document.getElementById('client-name').value.trim();
      const phone = document.getElementById('client-phone').value.trim();
      if (!name) { document.getElementById('client-name').classList.add('is-invalid'); document.getElementById('err-name').classList.add('visible'); return; }
      if (!phone) { document.getElementById('client-phone').classList.add('is-invalid'); document.getElementById('err-phone').classList.add('visible'); return; }

      const payload = {
        name, phone,
        email: document.getElementById('client-email').value.trim() || null,
        address: document.getElementById('client-address').value.trim() || null,
        dob: document.getElementById('client-dob').value || null,
      };
      try {
        if (isEdit) {
          await api.clients.update(clientToEdit.client_id, payload);
          Toast.success('Updated', `${payload.name} updated.`);
        } else {
          await api.clients.create(payload);
          Toast.success('Created', `${payload.name} registered.`);
        }
        Modal.close();
        clientsList = await api.clients.getAll();
        renderTable(clientsList);
      } catch (err) { Toast.error('Error', err.message); }
    };
  }

  async function openClientProfileModal(clientId) {
    const client = clientsList.find(c => String(c.client_id) === String(clientId));
    if (!client) return;
    let clientCases = [];
    try {
      const detail = await api.clients.getById(clientId);
      clientCases = detail.cases || [];
    } catch (e) { /* ignore */ }

    Modal.open({
      title: `Client Dossier: ${client.name}`,
      wide: true,
      contentHtml: `
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
          <div style="background: var(--bg-subtle); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--brand-tint); border: 2px solid var(--brand-border); display: flex; align-items: center; justify-content: center; color: var(--brand-primary); font-size: 20px; font-weight: 700; margin-bottom: 12px;">${client.name.charAt(0)}</div>
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">${client.name}</h3>
            <span class="table-cell-id" style="margin-top: 4px;">#${client.client_id}</span>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; margin-top: 14px;">
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Phone</span><p style="color: var(--text-primary); font-weight: 500;">${client.phone}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Email</span><p style="color: var(--brand-accent);">${client.email||'—'}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Address</span><p style="color: var(--text-secondary);">${client.address||'—'}</p></div>
              <div><span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">DOB</span><p>${client.dob||'—'}</p></div>
            </div>
          </div>
          <div>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
              <span>Associated Cases</span><span class="table-count-badge">${clientCases.length} Matters</span>
            </h4>
            ${clientCases.length === 0 ? '<p style="font-size: 13px; color: var(--text-muted); padding: 20px 0;">No cases filed.</p>' :
              `<div style="display: flex; flex-direction: column; gap: 10px;">
                ${clientCases.map(c => `
                  <div style="padding: 12px 14px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <span class="table-cell-id" style="font-size: 11px;">#${c.case_id}</span>
                        <h5 style="font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin: 3px 0;">${c.title}</h5>
                        <span style="font-size: 12px; color: var(--text-muted);">${c.case_type||'General'} &bull; ${c.court_name||'—'}</span>
                      </div>
                      <span class="status-badge badge-${(c.status||'pending').toLowerCase()}">${c.status}</span>
                    </div>
                  </div>
                `).join('')}
              </div>`}
          </div>
        </div>
      `,
      footerHtml: `<button class="btn btn-secondary" onclick="document.querySelector('#modal-global-close').click()">Close</button>`
    });
  }

  addBtn.onclick = () => openClientModal();
  renderTable(clientsList);
  if (options.action === 'new') openClientModal();
}
