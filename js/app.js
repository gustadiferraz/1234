/* =============================================
   APP.JS — Lógica Principal
   CarreiraPro
============================================= */

// ─── STATE ──────────────────────────────────
let currentUser = null;
let currentPage = '';
let currentEvalEmployeeId = null;
let starRating = 0;
let chartStatus = null;
let chartPie = null;
let chartEval = null;

// ─── STORAGE HELPERS ────────────────────────
function loadData(key, fallback) {
  try {
    const d = localStorage.getItem('cp_' + key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

function saveData(key, value) {
  localStorage.setItem('cp_' + key, JSON.stringify(value));
}

function getEmployees() { return loadData('employees', DEMO_EMPLOYEES); }
function saveEmployees(e) { saveData('employees', e); }
function getCareers()   { return loadData('careers', DEMO_CAREERS); }
function saveCareers(c) { saveData('careers', c); }
function getEvaluations() { return loadData('evaluations', DEMO_EVALUATIONS); }
function saveEvaluations(ev) { saveData('evaluations', ev); }

// ─── INIT ────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Garantir dados demo no storage
  if (!localStorage.getItem('cp_employees'))  saveEmployees(DEMO_EMPLOYEES);
  if (!localStorage.getItem('cp_careers'))    saveCareers(DEMO_CAREERS);
  if (!localStorage.getItem('cp_evaluations')) saveEvaluations(DEMO_EVALUATIONS);

  // Checar sessão salva
  const saved = sessionStorage.getItem('cp_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    startApp();
  }
});

// ─── LOGIN ────────────────────────────────────
function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-password').value.trim();
  const errEl = document.getElementById('login-error');

  const user = USUARIOS.find(u => u.email === email && u.password === pass);
  if (!user) {
    errEl.classList.remove('hidden');
    return;
  }
  errEl.classList.add('hidden');
  currentUser = user;
  sessionStorage.setItem('cp_user', JSON.stringify(user));
  startApp();
}

function startApp() {
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Iniciais do avatar
  const initials = currentUser.name.split(' ').slice(0, 2).map(n => n[0]).join('');
  document.getElementById('user-initials').textContent = initials;
  document.getElementById('user-menu-name').textContent = currentUser.name;
  document.getElementById('user-menu-role').textContent = currentUser.role === 'admin' ? 'RH / Administrador' : 'Supervisor';

  // Exibir menus
  if (currentUser.role === 'admin') {
    document.getElementById('menu-admin').classList.remove('hidden');
    navigateTo('admin-dashboard');
  } else {
    document.getElementById('menu-supervisor').classList.remove('hidden');
    navigateTo('supervisor-home');
  }

  updateNotifBadge();
}

function doLogout() {
  sessionStorage.removeItem('cp_user');
  currentUser = null;
  location.reload();
}

function togglePass() {
  const inp = document.getElementById('login-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}



// ─── NAVIGATION ──────────────────────────────
function navigateTo(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById('page-' + page);
  if (section) section.classList.remove('hidden');

  document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add('active'));

  currentPage = page;
  closeSidebar();
  window.scrollTo(0, 0);

  // Render de cada página
  const renders = {
    'admin-dashboard':    renderAdminDashboard,
    'admin-employees':    renderEmployeesTable,
    'admin-careers':      renderCareers,
    'admin-evaluations':  renderEvaluationsList,
    'admin-matrix':       renderMatrix,
    'admin-reports':      renderReports,
    'supervisor-home':    renderSupervisorHome,
    'supervisor-employees': renderSupervisorTeam,
  };
  if (renders[page]) renders[page]();
}

function goBack() {
  if (currentUser.role === 'supervisor') navigateTo('supervisor-home');
  else navigateTo('admin-evaluations');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}
function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('hidden');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-menu');
  if (menu && !menu.classList.contains('hidden')) {
    if (!e.target.closest('.topbar-right')) menu.classList.add('hidden');
  }
});

// ─── UTILS ───────────────────────────────────
function calcTenure(admissionDate) {
  const now = new Date();
  const adm = new Date(admissionDate);
  let months = (now.getFullYear() - adm.getFullYear()) * 12 + (now.getMonth() - adm.getMonth());
  if (months < 0) months = 0;
  return months;
}

function tenureText(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y > 0) parts.push(`${y} ano${y > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mês${m > 1 ? 'es' : ''}`);
  return parts.length ? parts.join(' e ') : 'Recém admitido';
}

function getStatusInfo(employee) {
  const months = calcTenure(employee.admission);
  const pct = Math.min(100, Math.round((months / employee.minMonths) * 100));

  // Override com status salvo, exceto promoção
  if (employee.status === 'promoted') return { label: '⭐ Promovido', cls: 'status-promoted', pct, months };
  if (employee.status === 'approved') return { label: '✅ Aprovado', cls: 'status-approved', pct, months };
  if (months >= employee.minMonths)  return { label: '🟡 Apto para Avaliação', cls: 'status-ready', pct: 100, months };
  return { label: '🔴 Em Período', cls: 'status-period', pct, months };
}

function getProgressColor(pct) {
  if (pct >= 100) return 'green';
  if (pct >= 50)  return 'yellow';
  return 'red';
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function updateNotifBadge() {
  const employees = getEmployees();
  let count = 0;
  if (currentUser.role === 'supervisor') {
    count = employees.filter(e => e.supervisor === currentUser.email && calcTenure(e.admission) >= e.minMonths && e.status === 'ready').length;
  } else {
    count = employees.filter(e => calcTenure(e.admission) >= e.minMonths && e.status === 'ready').length;
  }
  const badge = document.getElementById('badge-count');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function uuid() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

// ─── ADMIN DASHBOARD ─────────────────────────
function renderAdminDashboard() {
  const employees = getEmployees();
  const evaluations = getEvaluations();

  const total     = employees.length;
  const apt       = employees.filter(e => calcTenure(e.admission) >= e.minMonths && (e.status === 'ready' || e.status === 'period')).filter(e => calcTenure(e.admission) >= e.minMonths).length;
  const pending   = employees.filter(e => calcTenure(e.admission) >= e.minMonths && e.status === 'ready').length;
  const promoted  = employees.filter(e => e.status === 'promoted').length;

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-apt').textContent      = apt;
  document.getElementById('stat-pending').textContent  = pending;
  document.getElementById('stat-promoted').textContent = promoted;

  // Recent eligible list
  const eligible = employees.filter(e => calcTenure(e.admission) >= e.minMonths && e.status === 'ready');
  const listEl = document.getElementById('recent-eligible-list');
  if (!eligible.length) {
    listEl.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle"></i><p>Nenhum funcionário aguardando avaliação</p></div>`;
  } else {
    listEl.innerHTML = eligible.map(e => {
      const months = calcTenure(e.admission);
      return `<div class="recent-item">
        <div class="recent-avatar">${getInitials(e.name)}</div>
        <div class="recent-info">
          <div class="recent-name">${e.name}</div>
          <div class="recent-detail">${e.currentRole} → ${e.desiredRole} | ${e.sector}</div>
        </div>
        <span class="recent-badge">${tenureText(months)}</span>
      </div>`;
    }).join('');
  }

  // Chart
  const period   = employees.filter(e => calcTenure(e.admission) < e.minMonths).length;
  const ready    = employees.filter(e => calcTenure(e.admission) >= e.minMonths && e.status === 'ready').length;
  const approved = employees.filter(e => e.status === 'approved').length;
  const prom     = employees.filter(e => e.status === 'promoted').length;

  if (chartStatus) { chartStatus.destroy(); chartStatus = null; }
  const ctx = document.getElementById('chart-status');
  if (ctx) {
    chartStatus = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Em Período', 'Apto p/ Avaliação', 'Aprovado', 'Promovido'],
        datasets: [{
          label: 'Funcionários',
          data: [period, ready, approved, prom],
          backgroundColor: ['#FEE2E2', '#FEF3C7', '#DCFCE7', '#EDE9FE'],
          borderColor: ['#DC2626', '#D97706', '#16A34A', '#7C3AED'],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#F3F4F6' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

// ─── EMPLOYEES TABLE ─────────────────────────
function renderEmployeesTable() {
  const employees = getEmployees();
  const search = document.getElementById('search-employees')?.value?.toLowerCase() || '';
  const filtered = search ? employees.filter(e =>
    e.name.toLowerCase().includes(search) ||
    e.sector.toLowerCase().includes(search) ||
    e.currentRole.toLowerCase().includes(search)
  ) : employees;

  const tbody = document.getElementById('employees-tbody');
  if (!tbody) return;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-search"></i><p>Nenhum funcionário encontrado</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    const months = calcTenure(e.admission);
    const si = getStatusInfo(e);
    const pct = si.pct;
    const color = getProgressColor(pct);

    return `<tr>
      <td>
        <div class="emp-name-cell">
          <div class="emp-table-avatar">${getInitials(e.name)}</div>
          <div>
            <div class="emp-table-name">${e.name}</div>
            <div class="emp-table-sector">${e.sector}</div>
          </div>
        </div>
      </td>
      <td><span style="font-size:13px">${e.currentRole}</span><br><span style="color:#6B7280;font-size:12px">→ ${e.desiredRole}</span></td>
      <td><strong>${tenureText(months)}</strong><br><span style="color:#6B7280;font-size:12px">mín. ${e.minMonths}m</span></td>
      <td>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill ${color}" style="width:${pct}%"></div>
          </div>
          <span class="progress-pct">${pct}%</span>
        </div>
      </td>
      <td><span class="status-badge ${si.cls}">${si.label}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn-primary btn-sm" onclick="viewEmployee('${e.id}')"><i class="fas fa-eye"></i></button>
          <button class="btn-outline btn-sm" onclick="openEditEmployee('${e.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn-danger btn-sm" onclick="deleteEmployee('${e.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddEmployee() {
  document.getElementById('modal-employee-title').textContent = 'Novo Funcionário';
  document.getElementById('emp-id').value = '';
  document.getElementById('emp-name').value = '';
  document.getElementById('emp-sector').value = '';
  document.getElementById('emp-current-role').value = '';
  document.getElementById('emp-desired-role').value = '';
  document.getElementById('emp-admission').value = '';
  document.getElementById('emp-min-months').value = '';
  document.getElementById('emp-supervisor').value = 'supervisor@empresa.com';
  openModal('modal-employee');
}

function openEditEmployee(id) {
  const employees = getEmployees();
  const e = employees.find(x => x.id === id);
  if (!e) return;
  document.getElementById('modal-employee-title').textContent = 'Editar Funcionário';
  document.getElementById('emp-id').value = e.id;
  document.getElementById('emp-name').value = e.name;
  document.getElementById('emp-sector').value = e.sector;
  document.getElementById('emp-current-role').value = e.currentRole;
  document.getElementById('emp-desired-role').value = e.desiredRole;
  document.getElementById('emp-admission').value = e.admission;
  document.getElementById('emp-min-months').value = e.minMonths;
  document.getElementById('emp-supervisor').value = e.supervisor;
  openModal('modal-employee');
}

function saveEmployee() {
  const id      = document.getElementById('emp-id').value;
  const name    = document.getElementById('emp-name').value.trim();
  const sector  = document.getElementById('emp-sector').value.trim();
  const curr    = document.getElementById('emp-current-role').value.trim();
  const desired = document.getElementById('emp-desired-role').value.trim();
  const adm     = document.getElementById('emp-admission').value;
  const min     = parseInt(document.getElementById('emp-min-months').value);
  const sup     = document.getElementById('emp-supervisor').value;

  if (!name || !sector || !curr || !desired || !adm || !min) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  let employees = getEmployees();
  if (id) {
    employees = employees.map(e => e.id === id
      ? { ...e, name, sector, currentRole: curr, desiredRole: desired, admission: adm, minMonths: min, supervisor: sup }
      : e);
  } else {
    const months = calcTenure(adm);
    const status = months >= min ? 'ready' : 'period';
    employees.push({ id: uuid(), name, sector, currentRole: curr, desiredRole: desired, admission: adm, minMonths: min, supervisor: sup, status, skills: {} });
  }
  saveEmployees(employees);
  closeModal('modal-employee');
  renderEmployeesTable();
  updateNotifBadge();
}

function deleteEmployee(id) {
  if (!confirm('Excluir este funcionário? Esta ação não pode ser desfeita.')) return;
  let employees = getEmployees().filter(e => e.id !== id);
  saveEmployees(employees);
  renderEmployeesTable();
  updateNotifBadge();
}

function viewEmployee(id) {
  const employees = getEmployees();
  const evaluations = getEvaluations();
  const e = employees.find(x => x.id === id);
  if (!e) return;

  const months = calcTenure(e.admission);
  const si = getStatusInfo(e);
  const evals = evaluations.filter(ev => ev.employeeId === id);
  const lastEval = evals[evals.length - 1];

  let evalHtml = lastEval ? `
    <div class="score-item"><div class="score-label">Última Avaliação</div><div class="score-value">${formatDate(lastEval.date)}</div></div>
    <div class="score-item"><div class="score-label">Resultado</div><div class="score-value">${lastEval.percent}% critérios</div></div>
    <div class="score-item"><div class="score-label">Nota Geral</div><div class="score-value">${'★'.repeat(lastEval.stars)}${'☆'.repeat(5 - lastEval.stars)}</div></div>
    <div class="score-item"><div class="score-label">Avaliador</div><div class="score-value">${lastEval.supervisorName}</div></div>
  ` : `<p style="color:#6B7280;font-size:13px">Nenhuma avaliação realizada ainda.</p>`;

  document.getElementById('modal-employee-view-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;padding:0 0 16px;border-bottom:1px solid #E5E7EB;margin-bottom:16px">
      <div class="emp-avatar" style="width:60px;height:60px;font-size:20px">${getInitials(e.name)}</div>
      <div>
        <div style="font-size:18px;font-weight:700;color:#111827">${e.name}</div>
        <div style="font-size:13px;color:#6B7280">${e.currentRole} → ${e.desiredRole}</div>
        <div style="margin-top:6px"><span class="status-badge ${si.cls}">${si.label}</span></div>
      </div>
    </div>
    <div class="eval-card-scores" style="margin-bottom:16px">
      <div class="score-item"><div class="score-label">Setor</div><div class="score-value">${e.sector}</div></div>
      <div class="score-item"><div class="score-label">Admissão</div><div class="score-value">${formatDate(e.admission)}</div></div>
      <div class="score-item"><div class="score-label">Tempo de Casa</div><div class="score-value">${tenureText(months)}</div></div>
      <div class="score-item"><div class="score-label">Mínimo Exigido</div><div class="score-value">${e.minMonths} meses</div></div>
    </div>
    <h4 style="font-size:14px;font-weight:700;color:#1E3A5F;margin-bottom:10px"><i class="fas fa-clipboard-check" style="color:#F97316"></i> Histórico de Avaliações</h4>
    <div class="eval-card-scores">${evalHtml}</div>
  `;
  openModal('modal-employee-view');
}

// ─── CAREERS ─────────────────────────────────
function renderCareers() {
  const careers = getCareers().sort((a, b) => a.level - b.level);
  renderCareerTrail(careers);

  const tbody = document.getElementById('careers-tbody');
  if (!tbody) return;

  tbody.innerHTML = careers.map(c => `
    <tr>
      <td><strong>${c.name}</strong> <span style="color:#6B7280;font-size:12px">(Nível ${c.level})</span></td>
      <td>${c.minMonths} meses</td>
      <td><div class="competencies-list">${c.competencies.map(cp => `<span class="tag">${cp}</span>`).join('')}</div></td>
      <td>
        <div class="actions-cell">
          <button class="btn-outline btn-sm" onclick="openEditCareer('${c.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn-danger btn-sm" onclick="deleteCareer('${c.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderCareerTrail(careers) {
  const flow = document.getElementById('career-trail-flow');
  if (!flow) return;
  const sorted = [...careers].sort((a, b) => a.level - b.level);
  const icons = ['🔰', '⚙️', '🔧', '👑', '🎯'];
  let html = '';
  sorted.forEach((c, i) => {
    html += `<div class="trail-node">
      <div class="trail-circle">${icons[i] || c.level}</div>
      <div class="trail-label">${c.name}</div>
      <div class="trail-months">${c.minMonths}m</div>
    </div>`;
    if (i < sorted.length - 1) html += `<div class="trail-arrow"></div>`;
  });
  flow.innerHTML = html;
}

function openAddCareer() {
  document.getElementById('modal-career-title').textContent = 'Novo Cargo';
  document.getElementById('career-id').value = '';
  document.getElementById('career-name').value = '';
  document.getElementById('career-level').value = '';
  document.getElementById('career-months').value = '';
  document.getElementById('career-competencies').value = '';
  openModal('modal-career');
}

function openEditCareer(id) {
  const c = getCareers().find(x => x.id === id);
  if (!c) return;
  document.getElementById('modal-career-title').textContent = 'Editar Cargo';
  document.getElementById('career-id').value = c.id;
  document.getElementById('career-name').value = c.name;
  document.getElementById('career-level').value = c.level;
  document.getElementById('career-months').value = c.minMonths;
  document.getElementById('career-competencies').value = c.competencies.join('\n');
  openModal('modal-career');
}

function saveCareer() {
  const id     = document.getElementById('career-id').value;
  const name   = document.getElementById('career-name').value.trim();
  const level  = parseInt(document.getElementById('career-level').value);
  const months = parseInt(document.getElementById('career-months').value);
  const compTxt = document.getElementById('career-competencies').value;
  const competencies = compTxt.split('\n').map(s => s.trim()).filter(Boolean);

  if (!name || !level || !months) { alert('Preencha todos os campos obrigatórios!'); return; }

  let careers = getCareers();
  if (id) {
    careers = careers.map(c => c.id === id ? { ...c, name, level, minMonths: months, competencies } : c);
  } else {
    careers.push({ id: uuid(), name, level, minMonths: months, competencies });
  }
  saveCareers(careers);
  closeModal('modal-career');
  renderCareers();
}

function deleteCareer(id) {
  if (!confirm('Excluir este cargo da trilha?')) return;
  saveCareers(getCareers().filter(c => c.id !== id));
  renderCareers();
}

// ─── EVALUATIONS LIST ────────────────────────
function renderEvaluationsList() {
  const evaluations = getEvaluations();
  const container = document.getElementById('evaluations-list');
  if (!container) return;

  if (!evaluations.length) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-clipboard"></i><p>Nenhuma avaliação realizada ainda.</p></div>`;
    return;
  }

  const sorted = [...evaluations].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted.map(ev => {
    const resultMap = {
      recommended: { cls: 'status-approved', label: '✅ Recomendado para Promoção' },
      developing:  { cls: 'status-ready',    label: '⚠️ Requer Desenvolvimento' },
      not_recommended: { cls: 'status-period', label: '❌ Não Recomendado' }
    };
    const r = resultMap[ev.result] || resultMap['developing'];

    return `<div class="eval-card">
      <div class="eval-card-header">
        <div class="eval-card-info">
          <div class="eval-card-name">${ev.employeeName}</div>
          <div class="eval-card-meta">${ev.currentRole} → ${ev.desiredRole} | Avaliado por: ${ev.supervisorName} | ${formatDate(ev.date)}</div>
        </div>
        <span class="status-badge ${r.cls}">${r.label}</span>
      </div>
      <div class="eval-card-scores">
        <div class="score-item"><div class="score-label">% Critérios</div><div class="score-value">${ev.percent}%</div></div>
        <div class="score-item"><div class="score-label">Nota Geral</div><div class="score-value">${'★'.repeat(ev.stars)}${'☆'.repeat(5 - ev.stars)}</div></div>
        <div class="score-item"><div class="score-label">Téc. (${ev.sections.tecnica.filter(Boolean).length}/${ev.sections.tecnica.length})</div><div class="score-value">${Math.round(ev.sections.tecnica.filter(Boolean).length/ev.sections.tecnica.length*100)}%</div></div>
        <div class="score-item"><div class="score-label">Comport. (${ev.sections.comportamento.filter(Boolean).length}/${ev.sections.comportamento.length})</div><div class="score-value">${Math.round(ev.sections.comportamento.filter(Boolean).length/ev.sections.comportamento.length*100)}%</div></div>
      </div>
      ${ev.strengths ? `<div class="eval-card-obs"><div class="obs-label">Pontos Fortes</div>${ev.strengths}</div>` : ''}
      ${ev.improvements ? `<div class="eval-card-obs"><div class="obs-label">Pontos a Desenvolver</div>${ev.improvements}</div>` : ''}
    </div>`;
  }).join('');
}

function printEvaluations() { window.print(); }

// ─── MATRIX ──────────────────────────────────
function renderMatrix() {
  const employees = getEmployees();
  const sectorFilter = document.getElementById('matrix-sector-filter')?.value || '';
  const skills = DEMO_MATRIX_SKILLS;

  // Populate sector filter
  const sectors = [...new Set(employees.map(e => e.sector))];
  const sel = document.getElementById('matrix-sector-filter');
  if (sel && sel.options.length === 1) {
    sectors.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
  }

  const filtered = sectorFilter ? employees.filter(e => e.sector === sectorFilter) : employees;
  const container = document.getElementById('matrix-container');
  if (!container) return;

  const levelIcons = ['⬜', '🟡', '🟢', '⭐'];
  const levelCls   = ['level-0', 'level-1', 'level-2', 'level-3'];
  const levelLabels = ['Não Treinado', 'Em Treinamento', 'Competente', 'Referência'];

  let html = `<table class="matrix-table">
    <thead>
      <tr>
        <th>Funcionário / Habilidade</th>
        ${skills.map(s => `<th>${s}</th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  filtered.forEach(e => {
    html += `<tr><td>${e.name}<br><span style="font-size:11px;color:#6B7280;font-weight:400">${e.sector}</span></td>`;
    skills.forEach(s => {
      const level = (e.skills && e.skills[s] !== undefined) ? e.skills[s] : 0;
      html += `<td>
        <div class="matrix-cell ${levelCls[level]}" 
             onclick="cycleMatrixCell('${e.id}','${s}')" 
             title="${levelLabels[level]}">
          ${levelIcons[level]}
        </div>
      </td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function cycleMatrixCell(empId, skill) {
  let employees = getEmployees();
  const idx = employees.findIndex(e => e.id === empId);
  if (idx === -1) return;
  if (!employees[idx].skills) employees[idx].skills = {};
  const cur = employees[idx].skills[skill] !== undefined ? employees[idx].skills[skill] : 0;
  employees[idx].skills[skill] = (cur + 1) % 4;
  saveEmployees(employees);
  renderMatrix();
}

// ─── REPORTS ─────────────────────────────────
function renderReports() {
  const employees  = getEmployees();
  const evaluations = getEvaluations();

  // Pie chart
  const period   = employees.filter(e => calcTenure(e.admission) < e.minMonths).length;
  const ready    = employees.filter(e => calcTenure(e.admission) >= e.minMonths && e.status === 'ready').length;
  const approved = employees.filter(e => e.status === 'approved').length;
  const promoted = employees.filter(e => e.status === 'promoted').length;

  if (chartPie) { chartPie.destroy(); chartPie = null; }
  const piCtx = document.getElementById('chart-pie-status');
  if (piCtx) {
    chartPie = new Chart(piCtx, {
      type: 'doughnut',
      data: {
        labels: ['Em Período', 'Apto p/ Avaliação', 'Aprovado', 'Promovido'],
        datasets: [{
          data: [period, ready, approved, promoted],
          backgroundColor: ['#FEE2E2', '#FEF3C7', '#DCFCE7', '#EDE9FE'],
          borderColor: ['#DC2626', '#D97706', '#16A34A', '#7C3AED'],
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } } }
    });
  }

  // Eval results chart
  const rec = evaluations.filter(e => e.result === 'recommended').length;
  const dev = evaluations.filter(e => e.result === 'developing').length;
  const nr  = evaluations.filter(e => e.result === 'not_recommended').length;

  if (chartEval) { chartEval.destroy(); chartEval = null; }
  const evCtx = document.getElementById('chart-eval-result');
  if (evCtx) {
    chartEval = new Chart(evCtx, {
      type: 'bar',
      data: {
        labels: ['Recomendado', 'Requer Dev.', 'Não Recomendado'],
        datasets: [{
          data: [rec, dev, nr],
          backgroundColor: ['#DCFCE7', '#FEF3C7', '#FEE2E2'],
          borderColor: ['#16A34A', '#D97706', '#DC2626'],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#F3F4F6' } }, x: { grid: { display: false } } }
      }
    });
  }

  // Report table
  const tbody = document.getElementById('report-tbody');
  if (!tbody) return;

  tbody.innerHTML = employees.map(e => {
    const months = calcTenure(e.admission);
    const si = getStatusInfo(e);
    const evals = evaluations.filter(ev => ev.employeeId === e.id);
    const last  = evals[evals.length - 1];
    const resultMap = { recommended: '✅ Recomendado', developing: '⚠️ Em Desenvolvimento', not_recommended: '❌ Não Recomendado' };

    return `<tr>
      <td><div class="emp-name-cell"><div class="emp-table-avatar">${getInitials(e.name)}</div><div><div class="emp-table-name">${e.name}</div><div class="emp-table-sector">${e.sector}</div></div></div></td>
      <td>${e.currentRole}</td>
      <td>${e.desiredRole}</td>
      <td>${tenureText(months)}</td>
      <td>${last ? formatDate(last.date) : '—'}</td>
      <td>${last ? `${last.percent}% (${last.stars}★)` : '—'}</td>
      <td><span class="status-badge ${si.cls}">${si.label}</span></td>
    </tr>`;
  }).join('');
}

// ─── SUPERVISOR HOME ─────────────────────────
function renderSupervisorHome() {
  const employees = getEmployees().filter(e => e.supervisor === currentUser.email);
  const eligible  = employees.filter(e => calcTenure(e.admission) >= e.minMonths && e.status === 'ready');

  document.getElementById('supervisor-greeting').textContent = `Olá, ${currentUser.name}!`;
  document.getElementById('sup-stat-total').textContent = employees.length;
  document.getElementById('sup-stat-pending').textContent = eligible.length;

  const alertEl = document.getElementById('supervisor-alert');
  const alertTxt = document.getElementById('supervisor-alert-text');
  if (eligible.length > 0) {
    alertEl.classList.remove('hidden');
    alertTxt.textContent = `${eligible.length} funcionário${eligible.length > 1 ? 's' : ''} aguardam sua avaliação!`;
  } else {
    alertEl.classList.add('hidden');
  }

  // Eligible list
  const elList = document.getElementById('sup-eligible-list');
  if (eligible.length) {
    elList.innerHTML = eligible.map(e => buildEmployeeCard(e, true)).join('');
  } else {
    elList.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle"></i><p>Nenhum funcionário aguardando avaliação no momento.</p></div>`;
  }

  // All employees
  const allList = document.getElementById('sup-all-list');
  const others = employees.filter(e => !eligible.includes(e));
  allList.innerHTML = others.length ? others.map(e => buildEmployeeCard(e, false)).join('') : `<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum outro funcionário cadastrado.</p></div>`;
}

function renderSupervisorTeam() {
  const employees = getEmployees().filter(e => e.supervisor === currentUser.email);
  const list = document.getElementById('sup-team-list');
  if (!list) return;
  if (!employees.length) {
    list.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum funcionário na sua equipe.</p></div>`;
    return;
  }
  list.innerHTML = employees.map(e => buildEmployeeCard(e, calcTenure(e.admission) >= e.minMonths && e.status === 'ready')).join('');
}

function buildEmployeeCard(e, canEvaluate) {
  const months = calcTenure(e.admission);
  const si = getStatusInfo(e);
  const pct = si.pct;
  const color = getProgressColor(pct);
  const cardCls = e.status === 'promoted' ? 'promoted' : (e.status === 'approved' ? 'approved' : (canEvaluate ? 'ready' : 'period'));

  return `<div class="emp-card ${cardCls}">
    <div class="emp-card-header">
      <div class="emp-avatar">${getInitials(e.name)}</div>
      <div class="emp-meta">
        <div class="emp-name">${e.name}</div>
        <div class="emp-role">${e.currentRole} <span style="color:#F97316">→</span> ${e.desiredRole}</div>
        <div class="emp-tenure"><i class="fas fa-calendar-alt"></i> ${tenureText(months)} de casa</div>
      </div>
      <span class="status-badge ${si.cls}">${si.label}</span>
    </div>
    <div class="emp-card-body">
      <div class="emp-card-info">
        <div class="emp-info-item">
          <div class="emp-info-label">Setor</div>
          <div class="emp-info-value">${e.sector}</div>
        </div>
        <div class="emp-info-item">
          <div class="emp-info-label">Admissão</div>
          <div class="emp-info-value">${formatDate(e.admission)}</div>
        </div>
        <div class="emp-info-item">
          <div class="emp-info-label">Mínimo Exigido</div>
          <div class="emp-info-value">${e.minMonths} meses</div>
        </div>
        <div class="emp-info-item">
          <div class="emp-info-label">Progresso</div>
          <div class="emp-info-value">${pct}%</div>
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill ${color}" style="width:${pct}%"></div>
        </div>
        <span class="progress-pct">${pct}%</span>
      </div>
      <div class="emp-card-actions">
        ${canEvaluate
          ? `<button class="btn-primary" onclick="openEvaluation('${e.id}')"><i class="fas fa-clipboard-check"></i> Avaliar Agora</button>`
          : `<button class="btn-outline" onclick="openEvaluation('${e.id}')"><i class="fas fa-eye"></i> Ver Avaliação</button>`
        }
        ${currentUser.role === 'admin' ? `<button class="btn-outline btn-sm" onclick="openEditEmployee('${e.id}')"><i class="fas fa-edit"></i></button>` : ''}
      </div>
    </div>
  </div>`;
}

// ─── EVALUATION FORM ─────────────────────────
function openEvaluation(empId) {
  const employees = getEmployees();
  const e = employees.find(x => x.id === empId);
  if (!e) return;

  currentEvalEmployeeId = empId;
  starRating = 0;

  // Header
  const months = calcTenure(e.admission);
  document.getElementById('eval-employee-header').innerHTML = `
    <div class="eval-emp-avatar">${getInitials(e.name)}</div>
    <div class="eval-emp-info">
      <div class="eval-emp-name">${e.name}</div>
      <div class="eval-emp-career">${e.currentRole} → ${e.desiredRole}</div>
      <span class="eval-emp-tenure"><i class="fas fa-calendar-alt"></i> ${tenureText(months)} de casa</span>
      <div class="eval-emp-date">Data da Avaliação: ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  `;

  // Render question sections
  renderEvalSection('section-tecnica',       EVAL_QUESTIONS.tecnica,       'tecnica');
  renderEvalSection('section-comportamento', EVAL_QUESTIONS.comportamento, 'comportamento');
  renderEvalSection('section-seguranca',     EVAL_QUESTIONS.seguranca,     'seguranca');
  renderEvalSection('section-potencial',     EVAL_QUESTIONS.potencial,     'potencial');

  // Reset stars & fields
  setStars(0);
  document.getElementById('eval-strengths').value = '';
  document.getElementById('eval-improvements').value = '';
  document.getElementById('eval-observations').value = '';
  updateResultPreview();

  navigateTo('evaluation-form');
}

function renderEvalSection(containerId, questions, sectionKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = questions.map((q, i) => `
    <div class="eval-question">
      <div class="question-text">${i + 1}. ${q}</div>
      <div class="question-options">
        <label class="radio-btn yes-btn" id="q-${sectionKey}-${i}-yes" onclick="selectAnswer('${sectionKey}', ${i}, true)">
          <input type="radio" name="q-${sectionKey}-${i}" value="yes"/>
          ✅ Sim
        </label>
        <label class="radio-btn no-btn" id="q-${sectionKey}-${i}-no" onclick="selectAnswer('${sectionKey}', ${i}, false)">
          <input type="radio" name="q-${sectionKey}-${i}" value="no"/>
          ❌ Não
        </label>
      </div>
      <div class="question-obs">
        <input type="text" id="obs-${sectionKey}-${i}" placeholder="Observação (opcional)..." />
      </div>
    </div>
  `).join('');
}

function selectAnswer(section, idx, isYes) {
  const yes = document.getElementById(`q-${section}-${idx}-yes`);
  const no  = document.getElementById(`q-${section}-${idx}-no`);
  if (yes && no) {
    yes.classList.toggle('selected', isYes);
    no.classList.toggle('selected', !isYes);
  }
  updateResultPreview();
}

function updateResultPreview() {
  const sections = ['tecnica', 'comportamento', 'seguranca', 'potencial'];
  let total = 0, yes = 0;

  sections.forEach(sec => {
    const questions = EVAL_QUESTIONS[sec];
    questions.forEach((_, i) => {
      total++;
      const yesBtn = document.getElementById(`q-${sec}-${i}-yes`);
      if (yesBtn && yesBtn.classList.contains('selected')) yes++;
    });
  });

  const pct = total > 0 ? Math.round((yes / total) * 100) : 0;

  const bar = document.getElementById('result-bar-fill');
  if (bar) bar.style.width = pct + '%';

  let resultHtml = '';
  if (pct >= 75) {
    if (bar) bar.style.background = '#16A34A';
    resultHtml = `<span class="result-badge recommended">✅ Recomendado para Promoção</span>`;
  } else if (pct >= 50) {
    if (bar) bar.style.background = '#D97706';
    resultHtml = `<span class="result-badge developing">⚠️ Requer Desenvolvimento</span>`;
  } else {
    if (bar) bar.style.background = '#DC2626';
    resultHtml = `<span class="result-badge not-recommended">❌ Não Recomendado no Momento</span>`;
  }

  const previewEl = document.getElementById('eval-result-preview');
  if (previewEl) {
    previewEl.querySelector('.result-info').innerHTML = `
      <span>${pct}% de critérios atendidos (${yes}/${total})</span>
      ${resultHtml}
    `;
  }
}

function setStars(val) {
  starRating = val;
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
  document.getElementById('star-label').textContent = STAR_LABELS[val] || 'Selecione';
}

function submitEvaluation(e) {
  e.preventDefault();

  const sections = ['tecnica', 'comportamento', 'seguranca', 'potencial'];
  const sectionData = {};
  let total = 0, yes = 0;

  sections.forEach(sec => {
    const questions = EVAL_QUESTIONS[sec];
    const answers = questions.map((_, i) => {
      const yesBtn = document.getElementById(`q-${sec}-${i}-yes`);
      return yesBtn ? yesBtn.classList.contains('selected') : false;
    });
    sectionData[sec] = answers;
    total += answers.length;
    yes   += answers.filter(Boolean).length;
  });

  if (yes === 0) {
    alert('Por favor, responda pelo menos algumas perguntas antes de enviar.');
    return;
  }

  const pct = Math.round((yes / total) * 100);
  let result = 'not_recommended';
  if (pct >= 75) result = 'recommended';
  else if (pct >= 50) result = 'developing';

  const employees = getEmployees();
  const emp = employees.find(x => x.id === currentEvalEmployeeId);

  const evaluation = {
    id: uuid(),
    employeeId: currentEvalEmployeeId,
    employeeName: emp.name,
    currentRole: emp.currentRole,
    desiredRole: emp.desiredRole,
    supervisorEmail: currentUser.email,
    supervisorName: currentUser.name,
    date: new Date().toISOString().split('T')[0],
    sections: sectionData,
    stars: starRating,
    strengths:    document.getElementById('eval-strengths').value.trim(),
    improvements: document.getElementById('eval-improvements').value.trim(),
    observations: document.getElementById('eval-observations').value.trim(),
    percent: pct,
    result
  };

  // Salvar avaliação
  const evaluations = getEvaluations();
  evaluations.push(evaluation);
  saveEvaluations(evaluations);

  // Atualizar status do funcionário
  let newStatus = emp.status;
  if (result === 'recommended') newStatus = 'approved';
  else if (result === 'developing') newStatus = 'ready';

  const updatedEmployees = employees.map(x => x.id === currentEvalEmployeeId ? { ...x, status: newStatus } : x);
  saveEmployees(updatedEmployees);
  updateNotifBadge();

  // Mostrar modal de sucesso
  const resultMap = {
    recommended:     { title: '🎉 Funcionário Recomendado!', msg: `${emp.name} foi recomendado para promoção!`, badge: `<span class="status-badge status-approved" style="font-size:15px;padding:10px 20px">✅ RECOMENDADO PARA PROMOÇÃO</span>` },
    developing:      { title: '📋 Avaliação Registrada', msg: `${emp.name} precisa de mais desenvolvimento.`, badge: `<span class="status-badge status-ready" style="font-size:15px;padding:10px 20px">⚠️ REQUER DESENVOLVIMENTO</span>` },
    not_recommended: { title: '📋 Avaliação Registrada', msg: `${emp.name} não está pronto no momento.`, badge: `<span class="status-badge status-period" style="font-size:15px;padding:10px 20px">❌ NÃO RECOMENDADO NO MOMENTO</span>` }
  };

  const r = resultMap[result];
  document.getElementById('success-title').textContent = r.title;
  document.getElementById('success-message').textContent = `${r.msg} (${pct}% critérios atendidos)`;
  document.getElementById('success-badge-container').innerHTML = r.badge;
  document.getElementById('modal-eval-success').classList.remove('hidden');
}

function closeEvalSuccess() {
  document.getElementById('modal-eval-success').classList.add('hidden');
  if (currentUser.role === 'supervisor') navigateTo('supervisor-home');
  else navigateTo('admin-evaluations');
}

// ─── MODALS ───────────────────────────────────
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function closeModalOverlay(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

// ─── KEYBOARD ────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modal-employee', 'modal-career', 'modal-employee-view'].forEach(m => {
      const el = document.getElementById(m);
      if (el && !el.classList.contains('hidden')) closeModal(m);
    });
  }
  if (e.key === 'Enter' && currentPage === 'login') doLogin();
});
