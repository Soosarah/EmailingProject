// js/campaigns.js
// ===========================================================
// DATA LAYER
// Replace `fetchCampaigns()` with a real API call later —
// everything below it only depends on the shape of this array.
// ===========================================================

const FAKE_CAMPAIGNS = [
  {
    id: 1,
    name: 'Ramadan Data Bonus',
    description: 'Promotional offer doubling mobile data for all prepaid customers during Ramadan.',
    subject: 'Double your data this month 🎉',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-03-30',
    recipients: 812400,
    createdBy: 'N. Boudiaf',
    createdAt: '2026-02-18',
    survey: 'None',
    openRate: 42,
    responses: 0,
    emailBody: 'Cher client Djezzy, profitez de x2 data sur tous vos forfaits jusqu\'à la fin du mois...',
  },
  {
    id: 2,
    name: 'Network Quality Survey — Algiers',
    description: 'Feedback survey targeting customers in the Algiers region to measure 4G+ satisfaction.',
    subject: 'Aidez-nous à améliorer votre réseau',
    status: 'scheduled',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    recipients: 154000,
    createdBy: 'S. Amrani',
    createdAt: '2026-07-10',
    survey: 'Network Quality Feedback',
    openRate: 0,
    responses: 0,
    emailBody: 'Nous aimerions connaître votre avis sur la qualité de votre connexion 4G+ dans votre wilaya...',
  },
  {
    id: 3,
    name: 'Youth Offer Poll',
    description: 'Poll to gauge interest in a new youth-targeted mobile plan before launch.',
    subject: 'Un nouveau forfait pensé pour toi',
    status: 'draft',
    startDate: '',
    endDate: '',
    recipients: 0,
    createdBy: 'K. Haddad',
    createdAt: '2026-07-15',
    survey: 'New Offer Interest Poll',
    openRate: 0,
    responses: 0,
    emailBody: '(brouillon — contenu non finalisé)',
  },
  {
    id: 4,
    name: 'Summer Roaming Promo',
    description: 'Reduced roaming rates for customers traveling abroad over the summer.',
    subject: 'Voyagez connecté cet été',
    status: 'completed',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    recipients: 96500,
    createdBy: 'N. Boudiaf',
    createdAt: '2026-05-20',
    survey: 'None',
    openRate: 55,
    responses: 0,
    emailBody: 'Profitez de tarifs roaming réduits partout en Europe et au Maghreb...',
  },
  {
    id: 5,
    name: 'Customer Satisfaction Q2',
    description: 'Quarterly satisfaction survey sent to a random sample of postpaid customers.',
    subject: 'Votre avis compte pour nous',
    status: 'completed',
    startDate: '2026-04-05',
    endDate: '2026-04-20',
    recipients: 40000,
    createdBy: 'S. Amrani',
    createdAt: '2026-03-28',
    survey: 'Customer Satisfaction Q3',
    openRate: 61,
    responses: 8120,
    emailBody: 'Quelques minutes de votre temps pour nous aider à mieux vous servir...',
  },
  {
    id: 6,
    name: 'Legacy Plan Sunset Notice',
    description: 'Notification to customers on discontinued plans about migration options.',
    subject: 'Des changements concernant votre forfait',
    status: 'archived',
    startDate: '2025-11-01',
    endDate: '2025-11-10',
    recipients: 21300,
    createdBy: 'K. Haddad',
    createdAt: '2025-10-22',
    survey: 'None',
    openRate: 38,
    responses: 0,
    emailBody: 'Votre forfait actuel ne sera plus disponible à partir du...',
  },
  {
    id: 7,
    name: 'Back to School Data Pack',
    description: 'Discounted data packs targeted at students ahead of the school year.',
    subject: 'La rentrée, sans te soucier de ta data',
    status: 'scheduled',
    startDate: '2026-08-25',
    endDate: '2026-09-10',
    recipients: 210000,
    createdBy: 'N. Boudiaf',
    createdAt: '2026-07-18',
    survey: 'None',
    openRate: 0,
    responses: 0,
    emailBody: 'Fais le plein de data avant la rentrée avec notre pack spécial étudiants...',
  },
];

async function fetchCampaigns() {
  // Swap this for: const res = await fetch(`${API_BASE}/api/campaigns`, {...});
  return Promise.resolve(FAKE_CAMPAIGNS);
}

// ===========================================================
// STATE
// ===========================================================
const state = {
  all: [],
  filtered: [],
  page: 1,
  perPage: 5,
};

const PILL_LABEL = {
  draft: 'Draft', scheduled: 'Scheduled', active: 'Active',
  completed: 'Completed', archived: 'Archived',
};

// ===========================================================
// INIT
// ===========================================================
document.addEventListener('DOMContentLoaded', init);

async function init() {
  populateProfile();
  state.all = await fetchCampaigns();
  state.filtered = [...state.all];
  renderTable();
  animateStatCounts();
  bindToolbar();
  bindDrawer();
  bindModal();
  bindLogout();
}

function populateProfile() {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) return; // page can still be previewed standalone without login
  const user = JSON.parse(userRaw);
  document.getElementById('adminName').textContent = `${user.first_name} ${user.last_name}`;
  document.getElementById('adminRole').textContent = user.role;
}

function bindLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'djezzy_login.html';
  });
}

// ===========================================================
// STAT CARD COUNT-UP
// ===========================================================
function animateStatCounts() {
  document.querySelectorAll('.stat-value').forEach((el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ===========================================================
// TABLE RENDERING
// ===========================================================
function renderTable() {
  const tbody = document.getElementById('campaignsBody');
  const emptyState = document.getElementById('emptyState');
  const tableScroll = document.querySelector('.table-scroll');

  if (state.filtered.length === 0) {
    tbody.innerHTML = '';
    tableScroll.style.display = 'none';
    emptyState.hidden = false;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  tableScroll.style.display = '';
  emptyState.hidden = true;

  const start = (state.page - 1) * state.perPage;
  const pageItems = state.filtered.slice(start, start + state.perPage);

  tbody.innerHTML = pageItems.map((c, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td data-label="Campaign">
        <span class="campaign-name">${escapeHtml(c.name)}</span>
        <span class="campaign-name-sub">${escapeHtml(c.description).slice(0, 46)}${c.description.length > 46 ? '…' : ''}</span>
      </td>
      <td data-label="Email Subject">${escapeHtml(c.subject)}</td>
      <td data-label="Status"><span class="pill pill--${c.status}">${PILL_LABEL[c.status]}</span></td>
      <td data-label="Start Date">${formatDate(c.startDate)}</td>
      <td data-label="End Date">${formatDate(c.endDate)}</td>
      <td data-label="Recipients">${c.recipients ? c.recipients.toLocaleString('en-US') : '—'}</td>
      <td data-label="Created By">${escapeHtml(c.createdBy)}</td>
      <td data-label="Actions">
        <div class="row-actions">
          <button title="View" data-action="view" data-id="${c.id}"><i class="fa-solid fa-eye"></i></button>
          <button title="Edit" data-action="edit" data-id="${c.id}"><i class="fa-solid fa-pen"></i></button>
          <button title="Duplicate" data-action="duplicate" data-id="${c.id}"><i class="fa-solid fa-copy"></i></button>
          <button title="Delete" class="danger" data-action="delete" data-id="${c.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  bindRowActions();
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.perPage));
  const el = document.getElementById('pagination');

  let html = `<button data-page="prev" ${state.page === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button data-page="${p}" class="${p === state.page ? 'active' : ''}">${p}</button>`;
  }
  html += `<button data-page="next" ${state.page === totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
  el.innerHTML = html;

  el.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.page;
      if (val === 'prev') state.page = Math.max(1, state.page - 1);
      else if (val === 'next') state.page = Math.min(totalPages, state.page + 1);
      else state.page = parseInt(val, 10);
      renderTable();
    });
  });
}

function bindRowActions() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      const campaign = state.all.find((c) => c.id === id);
      const action = btn.dataset.action;

      if (action === 'view') openDrawer(campaign);
      if (action === 'edit') openModalForEdit(campaign);
      if (action === 'duplicate') duplicateCampaign(campaign);
      if (action === 'delete') deleteCampaign(id);
    });
  });
}

function duplicateCampaign(campaign) {
  const copy = { ...campaign, id: Date.now(), name: `${campaign.name} (copy)`, status: 'draft' };
  state.all.unshift(copy);
  applyFilters();
}

function deleteCampaign(id) {
  if (!confirm('Delete this campaign? This cannot be undone.')) return;
  state.all = state.all.filter((c) => c.id !== id);
  applyFilters();
}

// ===========================================================
// TOOLBAR: search / filter / sort
// ===========================================================
function bindToolbar() {
  document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 250));
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('sortSelect').addEventListener('change', applyFilters);
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const from = document.getElementById('dateFrom').value;
  const to = document.getElementById('dateTo').value;
  const sort = document.getElementById('sortSelect').value;

  let result = state.all.filter((c) => {
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    const matchesStatus = status === 'all' || c.status === status;
    const matchesFrom = !from || (c.startDate && c.startDate >= from);
    const matchesTo = !to || (c.endDate && c.endDate <= to) || (!c.endDate && !to);
    return matchesQuery && matchesStatus && matchesFrom && matchesTo;
  });

  result = sortCampaigns(result, sort);

  state.filtered = result;
  state.page = 1;
  renderTable();
}

function sortCampaigns(list, mode) {
  const copy = [...list];
  switch (mode) {
    case 'oldest': return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'recipients-desc': return copy.sort((a, b) => b.recipients - a.recipients);
    case 'az': return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
    default: return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('statusFilter').value = 'all';
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';
  document.getElementById('sortSelect').value = 'newest';
  applyFilters();
}

// ===========================================================
// DRAWER (View Campaign)
// ===========================================================
function bindDrawer() {
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
}

function openDrawer(c) {
  document.getElementById('drawerTitle').textContent = c.name;
  const pill = document.getElementById('drawerStatusPill');
  pill.textContent = PILL_LABEL[c.status];
  pill.className = `pill pill--${c.status}`;
  document.getElementById('drawerCreated').textContent = `Created ${formatDate(c.createdAt)}`;
  document.getElementById('drawerDescription').textContent = c.description;
  document.getElementById('drawerRecipients').textContent = c.recipients.toLocaleString('en-US');
  document.getElementById('drawerOpenRate').textContent = `${c.openRate}%`;
  document.getElementById('drawerResponses').textContent = c.responses.toLocaleString('en-US');
  document.getElementById('drawerSurvey').textContent = c.survey;
  document.getElementById('drawerSubject').textContent = c.subject;
  document.getElementById('drawerEmailBody').textContent = c.emailBody;
  document.getElementById('drawerStart').textContent = formatDate(c.startDate);
  document.getElementById('drawerEnd').textContent = formatDate(c.endDate);

  document.getElementById('drawerOverlay').classList.add('show');
  document.getElementById('viewDrawer').classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('show');
  document.getElementById('viewDrawer').classList.remove('open');
}

// ===========================================================
// MODAL (Create / Edit Campaign)
// ===========================================================
let editingId = null;

function bindModal() {
  document.getElementById('openCreateModal').addEventListener('click', () => openModalForCreate());
  document.getElementById('emptyCreateBtn').addEventListener('click', () => openModalForCreate());
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', closeModal);
  document.getElementById('saveDraft').addEventListener('click', () => submitModal('draft'));
  document.getElementById('scheduleCampaign').addEventListener('click', () => submitModal('scheduled'));
}

function openModalForCreate() {
  editingId = null;
  document.querySelector('.modal-head h2').textContent = 'New Campaign';
  clearModalFields();
  showModal();
}

function openModalForEdit(c) {
  editingId = c.id;
  document.querySelector('.modal-head h2').textContent = 'Edit Campaign';
  document.getElementById('f-title').value = c.name;
  document.getElementById('f-description').value = c.description;
  document.getElementById('f-subject').value = c.subject;
  document.getElementById('f-start').value = c.startDate;
  document.getElementById('f-end').value = c.endDate;
  showModal();
}

function clearModalFields() {
  document.getElementById('f-title').value = '';
  document.getElementById('f-description').value = '';
  document.getElementById('f-subject').value = '';
  document.getElementById('f-template').selectedIndex = 0;
  document.getElementById('f-survey').selectedIndex = 0;
  document.getElementById('f-recipients').selectedIndex = 0;
  document.getElementById('f-start').value = '';
  document.getElementById('f-end').value = '';
  document.getElementById('f-status').value = 'draft';
}

function showModal() {
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('createModal').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('createModal').classList.remove('open');
}

function submitModal(status) {
  const title = document.getElementById('f-title').value.trim();
  if (!title) {
    alert('Campaign title is required.');
    return;
  }

  const payload = {
    name: title,
    description: document.getElementById('f-description').value.trim(),
    subject: document.getElementById('f-subject').value.trim(),
    status,
    startDate: document.getElementById('f-start').value,
    endDate: document.getElementById('f-end').value,
    survey: document.getElementById('f-survey').value,
    createdBy: 'You',
    createdAt: new Date().toISOString().slice(0, 10),
    recipients: 0,
    openRate: 0,
    responses: 0,
    emailBody: document.getElementById('f-description').value.trim(),
  };

  if (editingId) {
    const idx = state.all.findIndex((c) => c.id === editingId);
    state.all[idx] = { ...state.all[idx], ...payload };
  } else {
    state.all.unshift({ id: Date.now(), ...payload });
  }

  closeModal();
  applyFilters();
}

// ===========================================================
// HELPERS
// ===========================================================
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}