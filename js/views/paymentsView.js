/**
 * JurisCore - Payments View (Live MySQL)
 * Payment ledger, record payment, receipt modal.
 */
import { api } from '../api.js';
import { Icons, Toast, Modal, confirmDialog, renderEmptyState } from '../components.js';

export async function renderPaymentsView(container, options = {}) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Payments & Accounting</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">Track all payments from the Payment table in LegalCaseDB.</p>
        </div>
        <button class="btn btn-primary" id="payments-add-btn">${Icons.plus} Record Payment</button>
      </div>
      <!-- Metrics -->
      <div class="stat-cards-grid" id="payment-metrics" style="margin-bottom: 24px;"></div>
      <!-- Filters -->
      <div class="card-3d" style="padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; position: relative;">
          <input type="text" id="payments-search-input" class="form-input" placeholder="Search by client, case..." style="padding-left: 38px; height: 38px;"/>
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex;">${Icons.search}</span>
        </div>
        <select class="form-select" id="payments-filter-method" style="width: 160px; height: 38px;">
          <option value="all">All Methods</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="payments-reset-filters" style="height: 38px;">Reset</button>
      </div>
      <div class="table-container card-3d">
        <div class="table-header-bar">
          <div class="table-title-area"><h3>${Icons.creditCard} Payment Ledger <span class="table-count-badge" id="payments-count-badge">Loading...</span></h3></div>
          <span style="font-size: 12.5px; color: var(--text-muted);">Table: <code>Payment</code></span>
        </div>
        <div class="table-responsive-wrapper" id="payments-table-wrapper">
          <div style="padding: 30px; text-align: center;"><div class="loading-spinner"></div></div>
        </div>
      </div>
    </div>
  `;

  let paymentsList = [], casesList = [], clientsList = [];
  try {
    [paymentsList, casesList, clientsList] = await Promise.all([api.payments.getAll(), api.cases.getAll(), api.clients.getAll()]);
  } catch (e) {
    container.querySelector('#payments-table-wrapper').innerHTML = `<p style="padding: 20px; color: #C53030;">Error: ${e.message}</p>`;
    return;
  }

  // Populate method filter
  const methodFilter = container.querySelector('#payments-filter-method');
  const methods = [...new Set(paymentsList.map(p => p.method).filter(Boolean))];
  methods.sort().forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; methodFilter.appendChild(o); });

  // Metrics
  const metricsGrid = container.querySelector('#payment-metrics');
  const totalRev = paymentsList.reduce((s, p) => s + Number(p.amount), 0);
  const avgPayment = paymentsList.length ? totalRev / paymentsList.length : 0;
  const fmt = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  metricsGrid.innerHTML = `
    <div class="card-3d" style="padding: 18px; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Total Revenue</div>
      <div style="font-size: 24px; font-weight: 700; color: var(--brand-primary); margin-top: 4px;">${fmt(totalRev)}</div>
    </div>
    <div class="card-3d" style="padding: 18px; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Total Payments</div>
      <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${paymentsList.length}</div>
    </div>
    <div class="card-3d" style="padding: 18px; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Avg Payment</div>
      <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${fmt(avgPayment)}</div>
    </div>
    <div class="card-3d" style="padding: 18px; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Payment Methods</div>
      <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${methods.length}</div>
    </div>
  `;

  const countBadge = container.querySelector('#payments-count-badge');
  const tableWrapper = container.querySelector('#payments-table-wrapper');
  const searchInput = container.querySelector('#payments-search-input');
  const addBtn = container.querySelector('#payments-add-btn');
  const resetBtn = container.querySelector('#payments-reset-filters');

  function renderTable(data) {
    countBadge.textContent = `${data.length} Records`;
    if (data.length === 0) {
      tableWrapper.innerHTML = '';
      tableWrapper.appendChild(renderEmptyState({ icon: Icons.creditCard, title: 'No payments', description: 'No records matched.', actionText: 'Record Payment', onAction: () => openPaymentModal() }));
      return;
    }
    tableWrapper.innerHTML = `
      <table class="custom-table">
        <thead><tr>
          <th>ID</th><th>Client</th><th>Case</th><th>Amount</th><th>Date</th><th>Method</th><th>Remarks</th><th style="text-align: right;">Actions</th>
        </tr></thead>
        <tbody>
          ${data.map(p => `
            <tr class="table-row-interactive">
              <td><span class="table-cell-id">#${p.payment_id}</span></td>
              <td class="table-cell-bold">${p.client_name||'—'}</td>
              <td style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.case_title||'—'}</td>
              <td><strong style="color: var(--brand-primary); font-size: 14px;">₹${Number(p.amount).toLocaleString('en-IN')}</strong></td>
              <td>${p.payment_date}</td>
              <td><span class="badge-method">${p.method||'—'}</span></td>
              <td style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.remarks||'—'}</td>
              <td class="table-actions-cell">
                <button class="btn btn-sm btn-ghost payment-view-btn" data-id="${p.payment_id}" title="Receipt">${Icons.eye}</button>
                <button class="btn btn-sm btn-ghost payment-delete-btn" data-id="${p.payment_id}" title="Delete" style="color: #C53030;">${Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    tableWrapper.querySelectorAll('.payment-view-btn').forEach(btn => {
      btn.onclick = () => {
        const p = paymentsList.find(x => String(x.payment_id) === btn.getAttribute('data-id'));
        if (p) openReceiptModal(p);
      };
    });
    tableWrapper.querySelectorAll('.payment-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await confirmDialog({ title: 'Delete Payment?', message: `Delete payment #${id}?`, confirmText: 'Delete', danger: true });
        if (confirmed) {
          try { await api.payments.remove(id); Toast.success('Deleted', `Payment #${id} removed.`); paymentsList = await api.payments.getAll(); renderTable(paymentsList); }
          catch (err) { Toast.error('Error', err.message); }
        }
      };
    });
  }

  function applyFilter() {
    const q = searchInput.value.toLowerCase().trim();
    const method = methodFilter.value;
    renderTable(paymentsList.filter(p => {
      const matchQ = !q || (p.client_name||'').toLowerCase().includes(q) || (p.case_title||'').toLowerCase().includes(q) || String(p.payment_id).includes(q);
      const matchMethod = method === 'all' || p.method === method;
      return matchQ && matchMethod;
    }));
  }

  searchInput.oninput = applyFilter;
  methodFilter.onchange = applyFilter;
  resetBtn.onclick = () => { searchInput.value = ''; methodFilter.value = 'all'; renderTable(paymentsList); };

  function openReceiptModal(p) {
    Modal.open({
      title: `Payment Receipt #${p.payment_id}`,
      contentHtml: `
        <div style="border: 2px dashed var(--border-default); border-radius: var(--radius-lg); padding: 24px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 4px;">JurisCore Payment Receipt</div>
          <div style="font-size: 32px; font-weight: 700; color: var(--brand-primary); margin: 12px 0;">₹${Number(p.amount).toLocaleString('en-IN')}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: left; margin-top: 20px; font-size: 13px;">
            <div><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Receipt ID</span><p style="font-weight: 600;">#${p.payment_id}</p></div>
            <div><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Client</span><p>${p.client_name}</p></div>
            <div><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Case</span><p>${p.case_title}</p></div>
            <div><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Date</span><p>${p.payment_date}</p></div>
            <div><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Method</span><p>${p.method||'—'}</p></div>
            <div><span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Remarks</span><p>${p.remarks||'—'}</p></div>
          </div>
        </div>
      `,
      footerHtml: `<button class="btn btn-secondary" onclick="document.querySelector('#modal-global-close').click()">Close</button>`
    });
  }

  function openPaymentModal() {
    Modal.open({
      title: 'Record New Payment',
      contentHtml: `
        <form novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Client <span class="required">*</span></label>
              <select id="pay-client" class="form-select">
                <option value="">— Select —</option>
                ${clientsList.map(c => `<option value="${c.client_id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Case <span class="required">*</span></label>
              <select id="pay-case" class="form-select">
                <option value="">— Select —</option>
                ${casesList.map(c => `<option value="${c.case_id}">${c.title} (#${c.case_id})</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Amount (₹) <span class="required">*</span></label>
              <input type="number" id="pay-amount" class="form-input" min="1" placeholder="5000"/>
            </div>
            <div class="form-group">
              <label class="form-label">Date <span class="required">*</span></label>
              <input type="date" id="pay-date" class="form-input" value="${new Date().toISOString().slice(0,10)}"/>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Method</label>
              <select id="pay-method" class="form-select">
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Remarks</label>
              <input type="text" id="pay-remarks" class="form-input" placeholder="e.g. Consultation fee"/>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">Record Payment</button>
      `
    });
    document.getElementById('modal-cancel').onclick = () => Modal.close();
    document.getElementById('modal-submit').onclick = async () => {
      const client_id = document.getElementById('pay-client').value;
      const case_id = document.getElementById('pay-case').value;
      const amount = document.getElementById('pay-amount').value;
      const payment_date = document.getElementById('pay-date').value;
      if (!client_id || !case_id || !amount || !payment_date) { Toast.error('Validation', 'Client, case, amount, and date required.'); return; }
      const payload = { client_id: Number(client_id), case_id: Number(case_id), amount: Number(amount), payment_date, method: document.getElementById('pay-method').value, remarks: document.getElementById('pay-remarks').value.trim()||null };
      try {
        await api.payments.create(payload);
        Toast.success('Recorded', `₹${Number(amount).toLocaleString('en-IN')} payment recorded.`);
        Modal.close(); paymentsList = await api.payments.getAll(); renderTable(paymentsList);
      } catch (err) { Toast.error('Error', err.message); }
    };
  }

  addBtn.onclick = () => openPaymentModal();
  renderTable(paymentsList);
  if (options.action === 'new') openPaymentModal();
}
