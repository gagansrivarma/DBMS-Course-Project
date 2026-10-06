/**
 * JurisCore - Hearings View (Live MySQL)
 * Table + interactive calendar, schedule hearing modal.
 */
import { api } from '../api.js';
import { Icons, Toast, Modal, confirmDialog, renderEmptyState } from '../components.js';

export async function renderHearingsView(container, options = {}) {
  container.innerHTML = `
    <div class="view-fade-enter">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Hearings & Court Schedule</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">All hearing dates from the Hearing table in LegalCaseDB.</p>
        </div>
        <button class="btn btn-primary" id="hearings-add-btn">${Icons.plus} Schedule Hearing</button>
      </div>
      <div class="table-container card-3d" style="margin-bottom: 24px;">
        <div class="table-header-bar">
          <div class="table-title-area"><h3>${Icons.calendar} All Hearings <span class="table-count-badge" id="hearings-count-badge">Loading...</span></h3></div>
          <span style="font-size: 12.5px; color: var(--text-muted);">Table: <code>Hearing</code></span>
        </div>
        <div class="table-responsive-wrapper" id="hearings-table-wrapper">
          <div style="padding: 30px; text-align: center;"><div class="loading-spinner"></div></div>
        </div>
      </div>
      <div class="card-3d" style="padding: 24px;" id="hearings-calendar-section">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">${Icons.calendar} Calendar View</h3>
        <div id="calendar-grid"></div>
      </div>
    </div>
  `;

  let hearingsList = [], casesList = [], judgesList = [];
  try {
    [hearingsList, casesList, judgesList] = await Promise.all([api.hearings.getAll(), api.cases.getAll(), api.judges.getAll()]);
  } catch (e) {
    container.querySelector('#hearings-table-wrapper').innerHTML = `<p style="padding: 20px; color: #C53030;">Error: ${e.message}</p>`;
    return;
  }

  const countBadge = container.querySelector('#hearings-count-badge');
  const tableWrapper = container.querySelector('#hearings-table-wrapper');
  const addBtn = container.querySelector('#hearings-add-btn');

  function renderTable(data) {
    countBadge.textContent = `${data.length} Hearings`;
    if (data.length === 0) {
      tableWrapper.innerHTML = '';
      tableWrapper.appendChild(renderEmptyState({ icon: Icons.calendar, title: 'No hearings', description: 'No hearings found.', actionText: 'Schedule', onAction: () => openHearingModal() }));
      return;
    }
    tableWrapper.innerHTML = `
      <table class="custom-table">
        <thead><tr>
          <th>ID</th><th>Case</th><th>Client</th><th>Judge</th><th>Date</th><th>Time</th><th>Location</th><th>Notes</th><th style="text-align: right;">Actions</th>
        </tr></thead>
        <tbody>
          ${data.map(h => `
            <tr class="table-row-interactive">
              <td><span class="table-cell-id">#${h.hearing_id}</span></td>
              <td class="table-cell-bold">${h.case_title||'—'}</td>
              <td>${h.client_name||'—'}</td>
              <td>${h.judge_name||'—'}</td>
              <td><strong>${h.hearing_date}</strong></td>
              <td><span style="color: var(--brand-primary);">${Icons.clock} ${h.hearing_time}</span></td>
              <td>${h.location||'—'}</td>
              <td style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${h.notes||'—'}</td>
              <td class="table-actions-cell">
                <button class="btn btn-sm btn-ghost hearing-edit-btn" data-id="${h.hearing_id}" title="Edit">${Icons.edit}</button>
                <button class="btn btn-sm btn-ghost hearing-delete-btn" data-id="${h.hearing_id}" title="Delete" style="color: #C53030;">${Icons.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    tableWrapper.querySelectorAll('.hearing-edit-btn').forEach(btn => {
      btn.onclick = () => {
        const h = hearingsList.find(x => String(x.hearing_id) === btn.getAttribute('data-id'));
        if (h) openHearingModal(h);
      };
    });
    tableWrapper.querySelectorAll('.hearing-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const h = hearingsList.find(x => String(x.hearing_id) === id);
        if (!h) return;
        const confirmed = await confirmDialog({ title: 'Delete Hearing?', message: `Delete hearing #${id}?`, confirmText: 'Delete', danger: true });
        if (confirmed) {
          try { await api.hearings.remove(id); Toast.success('Deleted', `Hearing #${id} removed.`); hearingsList = await api.hearings.getAll(); renderTable(hearingsList); renderCalendar(); }
          catch (err) { Toast.error('Error', err.message); }
        }
      };
    });
  }

  function renderCalendar() {
    const calGrid = container.querySelector('#calendar-grid');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map hearings to day numbers
    const hearingsByDay = {};
    hearingsList.forEach(h => {
      const d = new Date(h.hearing_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!hearingsByDay[day]) hearingsByDay[day] = [];
        hearingsByDay[day].push(h);
      }
    });

    let html = `<div style="text-align: center; font-weight: 700; font-size: 15px; margin-bottom: 12px;">${monthName}</div>`;
    html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
      html += `<div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; padding: 6px 0;">${d}</div>`;
    });
    for (let i = 0; i < firstDay; i++) html += '<div></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === now.getDate();
      const dayHearings = hearingsByDay[day] || [];
      html += `<div style="padding: 8px 4px; border-radius: var(--radius-sm); min-height: 50px; ${isToday ? 'background: var(--brand-tint); border: 2px solid var(--brand-accent);' : 'border: 1px solid var(--border-subtle);'}">
        <div style="font-size: 12px; font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? 'var(--brand-primary)' : 'var(--text-primary)'};">${day}</div>
        ${dayHearings.map(h => `<div style="font-size: 9px; background: var(--brand-accent); color: white; border-radius: 3px; padding: 1px 4px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${h.case_title} - ${h.hearing_time}">${h.hearing_time?.slice(0,5) || ''}</div>`).join('')}
      </div>`;
    }
    html += '</div>';
    calGrid.innerHTML = html;
  }

  function openHearingModal(hearingToEdit = null) {
    const isEdit = !!hearingToEdit;
    Modal.open({
      title: isEdit ? `Edit Hearing #${hearingToEdit.hearing_id}` : 'Schedule Hearing',
      contentHtml: `
        <form novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Case <span class="required">*</span></label>
              <select id="hearing-case" class="form-select">
                <option value="">— Select Case —</option>
                ${casesList.map(c => `<option value="${c.case_id}" ${hearingToEdit && hearingToEdit.case_id===c.case_id?'selected':''}>${c.title} (#${c.case_id})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Judge <span class="required">*</span></label>
              <select id="hearing-judge" class="form-select">
                <option value="">— Select Judge —</option>
                ${judgesList.map(j => `<option value="${j.judge_id}" ${hearingToEdit && hearingToEdit.judge_id===j.judge_id?'selected':''}>${j.name} (${j.court_name})</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date <span class="required">*</span></label>
              <input type="date" id="hearing-date" class="form-input" value="${hearingToEdit?hearingToEdit.hearing_date:''}"/>
            </div>
            <div class="form-group">
              <label class="form-label">Time <span class="required">*</span></label>
              <input type="time" id="hearing-time" class="form-input" value="${hearingToEdit?(hearingToEdit.hearing_time||'').slice(0,5):'10:00'}"/>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" id="hearing-location" class="form-input" placeholder="e.g. Court Hall 1" value="${hearingToEdit?(hearingToEdit.location||''):''}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="hearing-notes" class="form-input" rows="2">${hearingToEdit?(hearingToEdit.notes||''):''}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-submit">${isEdit?'Save':'Schedule'}</button>
      `
    });
    document.getElementById('modal-cancel').onclick = () => Modal.close();
    document.getElementById('modal-submit').onclick = async () => {
      const case_id = document.getElementById('hearing-case').value;
      const judge_id = document.getElementById('hearing-judge').value;
      const hearing_date = document.getElementById('hearing-date').value;
      const hearing_time = document.getElementById('hearing-time').value;
      if (!case_id || !judge_id || !hearing_date || !hearing_time) { Toast.error('Validation', 'Case, judge, date, and time are required.'); return; }
      const payload = { case_id: Number(case_id), judge_id: Number(judge_id), hearing_date, hearing_time, location: document.getElementById('hearing-location').value.trim()||null, notes: document.getElementById('hearing-notes').value.trim()||null };
      try {
        if (isEdit) { await api.hearings.update(hearingToEdit.hearing_id, payload); Toast.success('Updated', 'Hearing updated.'); }
        else { await api.hearings.create(payload); Toast.success('Scheduled', 'Hearing scheduled.'); }
        Modal.close(); hearingsList = await api.hearings.getAll(); renderTable(hearingsList); renderCalendar();
      } catch (err) { Toast.error('Error', err.message); }
    };
  }

  addBtn.onclick = () => openHearingModal();
  renderTable(hearingsList);
  renderCalendar();
  if (options.action === 'new') openHearingModal();
}
