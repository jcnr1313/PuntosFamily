const SUPABASE_URL = 'https://dwfpellkjknjoownvra.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZnBlbGxramtuanNvb3dudnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQwMDYsImV4cCI6MjEwMDcxMDAwNn0.x75ND4DNtptpxVtf-tK2FNr_33zxhk5SF7_-sAb8-jY';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Datos locales por defecto para garantizarnos que SIEMPRE aparezcan en pantalla
let state = {
  currentUser: 'hijo1',
  users: {
    'hijo1': { id: 'hijo1', name: 'Lucas', role: 'hijo', avatar: '👦', points: 35 },
    'hijo2': { id: 'hijo2', name: 'Sofía', role: 'hijo', avatar: '👧', points: 60 },
    'padre': { id: 'padre', name: 'Papá / Mamá', role: 'padre', avatar: '👑', points: 0 }
  },
  tasks: [
    { id: 1, title: 'Hacer la cama', points: 10, assigned_to: 'hijo1', status: 'pendiente', category: 'Habitación' },
    { id: 2, title: 'Recoger los juguetes', points: 15, assigned_to: 'hijo1', status: 'revisando', category: 'Hogar' },
    { id: 3, title: 'Hacer los deberes', points: 20, assigned_to: 'hijo2', status: 'pendiente', category: 'Colegio' }
  ],
  rewards: [
    { id: 1, title: '30 min de Consola', cost: 50, icon: '🎮' },
    { id: 2, title: 'Elegir la cena', cost: 80, icon: '🍕' },
    { id: 3, title: 'Ir al parque / Cine', cost: 120, icon: '🍿' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dibujar inmediatamente con los datos locales
  renderAll();

  // 2. Intentar cargar de Supabase en segundo plano
  loadFromSupabase();
});

function renderAll() {
  initUserSelect();
  renderApp();
}

async function loadFromSupabase() {
  if (!supabaseClient) return;

  try {
    const { data: users } = await supabaseClient.from('users').select('*');
    const { data: tasks } = await supabaseClient.from('tasks').select('*');
    const { data: rewards } = await supabaseClient.from('rewards').select('*');

    if (users && users.length > 0) {
      state.users = {};
      users.forEach(u => state.users[u.id] = u);
    }
    if (tasks && tasks.length > 0) state.tasks = tasks;
    if (rewards && rewards.length > 0) state.rewards = rewards;

    renderAll();
  } catch (err) {
    console.log('Usando datos locales por error de red:', err);
  }
}

function initUserSelect() {
  const select = document.getElementById('userSelect');
  const assigneeSelect = document.getElementById('newTaskAssignee');

  if (select) {
    select.innerHTML = Object.entries(state.users)
      .map(([id, u]) => `<option value="${id}">${u.name}</option>`)
      .join('');
    select.value = state.currentUser;
  }

  if (assigneeSelect) {
    assigneeSelect.innerHTML = Object.entries(state.users)
      .filter(([_, u]) => u.role === 'hijo')
      .map(([id, u]) => `<option value="${id}">${u.name}</option>`)
      .join('');
  }
}

function switchUser() {
  const select = document.getElementById('userSelect');
  if (select) {
    state.currentUser = select.value;
    renderApp();
  }
}

function switchTab(tab) {
  ['tasks', 'rewards', 'parent'].forEach(t => {
    const el = document.getElementById(`${t}Tab`);
    const btn = document.getElementById(`tab${capitalize(t)}Btn`);
    if (el) el.classList.add('hidden');
    if (btn) btn.className = "py-2.5 rounded-xl transition-all text-slate-500 font-bold";
  });

  const targetEl = document.getElementById(`${tab}Tab`);
  const targetBtn = document.getElementById(`tab${capitalize(tab)}Btn`);
  if (targetEl) targetEl.classList.remove('hidden');
  if (targetBtn) targetBtn.className = "py-2.5 rounded-xl bg-white text-indigo-600 font-extrabold shadow-sm transition-all";
}

function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

  const avatarEl = document.getElementById('currentAvatar');
  const pointsEl = document.getElementById('userPoints');
  const roleEl = document.getElementById('roleBadge');

  if (avatarEl) avatarEl.innerText = user.avatar;
  if (pointsEl) pointsEl.innerText = user.points;
  if (roleEl) roleEl.innerText = user.role.toUpperCase();

  const parentBtn = document.getElementById('tabParentBtn');
  const quickAdd = document.getElementById('quickAddContainer');

  if (user.role === 'padre') {
    if (parentBtn) parentBtn.classList.remove('hidden');
    if (quickAdd) quickAdd.classList.remove('hidden');
  } else {
    if (parentBtn) parentBtn.classList.add('hidden');
    if (quickAdd) quickAdd.classList.add('hidden');
    const parentTab = document.getElementById('parentTab');
    if (parentTab && !parentTab.classList.contains('hidden')) {
      switchTab('tasks');
    }
  }

  renderTasks();
  renderRewards();
  renderParentPanel();
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  if (!taskList) return;

  const user = state.users[state.currentUser];
  const myTasks = user.role === 'padre' 
    ? state.tasks 
    : state.tasks.filter(t => t.assigned_to === state.currentUser);

  const taskCountText = document.getElementById('taskCountText');
  if (taskCountText) {
    taskCountText.innerText = `${myTasks.filter(t => t.status === 'pendiente').length} pendientes`;
  }

  if (myTasks.length === 0) {
    taskList.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-slate-400 text-sm border border-slate-100 shadow-sm">🎉 ¡Sin tareas pendientes!</div>`;
    return;
  }

  taskList.innerHTML = myTasks.map(task => `
    <div class="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">${task.category || 'Rutina'}</span>
        <p class="font-bold text-slate-800 text-sm">${task.title}</p>
        <div class="flex items-center space-x-1">
          <span class="text-xs text-amber-500 font-black">+${task.points} ⭐</span>
          ${user.role === 'padre' ? `<span class="text-[10px] text-slate-400">(${state.users[task.assigned_to]?.name || ''})</span>` : ''}
        </div>
      </div>
      ${getTaskAction(task)}
    </div>
  `).join('');
}

function getTaskAction(task) {
  if (task.status === 'pendiente') {
    return `<button onclick="completeTask(${task.id})" class="bg-indigo-50 text-indigo-600 font-extrabold text-xs py-2 px-3.5 rounded-xl hover:bg-indigo-100 transition">Completar</button>`;
  }
  if (task.status === 'revisando') {
    return `<span class="bg-amber-100 text-amber-800 font-extrabold text-xs py-1.5 px-3 rounded-xl">Revisando...</span>`;
  }
  return `<span class="bg-emerald-100 text-emerald-700 font-extrabold text-xs py-1.5 px-3 rounded-xl">✓ Hecho</span>`;
}

async function completeTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) task.status = 'revisando';
  renderApp();

  if (supabaseClient) {
    await supabaseClient.from('tasks').update({ status: 'revisando' }).eq('id', id);
  }
}

function renderRewards() {
  const rewardList = document.getElementById('rewardList');
  if (!rewardList) return;

  const user = state.users[state.currentUser];

  rewardList.innerHTML = state.rewards.map(reward => {
    const canAfford = user.points >= reward.cost;
    const progress = Math.min(100, Math.round((user.points / reward.cost) * 100));

    return `
      <div class="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm flex flex-col justify-between space-y-2">
        <div class="text-4xl my-1">${reward.icon || '🎁'}</div>
        <div>
          <p class="font-bold text-xs text-slate-800 line-clamp-1">${reward.title}</p>
          <span class="text-xs font-black text-amber-500">${reward.cost} ⭐</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-amber-400 h-full rounded-full transition-all" style="width: ${progress}%"></div>
        </div>
        <button 
          onclick="claimReward(${reward.id}, ${reward.cost})"
          ${!canAfford || user.role === 'padre' ? 'disabled' : ''}
          class="w-full py-2 bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm disabled:opacity-40">
          Canjear
        </button>
      </div>
    `;
  }).join('');
}

async function claimReward(id, cost) {
  const user = state.users[state.currentUser];
  if (user && user.points >= cost) {
    user.points -= cost;
    renderApp();

    if (supabaseClient) {
      await supabaseClient.from('users').update({ points: user.points }).eq('id', user.id);
    }
    alert(`🎉 ¡Premio solicitado!`);
  }
}

function renderParentPanel() {
  const approvalList = document.getElementById('parentApprovalList');
  if (!approvalList) return;

  const pendingTasks = state.tasks.filter(t => t.status === 'revisando');

  if (pendingTasks.length === 0) {
    approvalList.innerHTML = `<p class="text-xs text-amber-800/70 font-medium">No hay tareas pendientes de revisar.</p>`;
    return;
  }

  approvalList.innerHTML = pendingTasks.map(task => `
    <div class="bg-white p-3 rounded-xl border border-amber-200/60 flex justify-between items-center text-xs shadow-sm">
      <div>
        <p class="font-bold text-slate-800">${task.title}</p>
        <span class="text-slate-400">Para: ${state.users[task.assigned_to]?.name || ''}</span>
      </div>
      <button onclick="approveTask(${task.id}, '${task.assigned_to}', ${task.points})" class="bg-emerald-600 text-white font-extrabold py-2 px-3 rounded-lg">
        Aprobar (+${task.points}⭐)
      </button>
    </div>
  `).join('');
}

async function approveTask(taskId, assignedTo, points) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) task.status = 'completada';

  if (state.users[assignedTo]) {
    state.users[assignedTo].points += points;
  }

  renderApp();

  if (supabaseClient) {
    await supabaseClient.from('tasks').update({ status: 'completada' }).eq('id', taskId);
    await supabaseClient.from('users').update({ points: state.users[assignedTo].points }).eq('id', assignedTo);
  }
}

async function quickPoints(pts) {
  const user = state.users[state.currentUser];
  if (user) {
    user.points += pts;
    renderApp();
    if (supabaseClient) {
      await supabaseClient.from('users').update({ points: user.points }).eq('id', user.id);
    }
  }
}

async function addNewTask(e) {
  e.preventDefault();
  const title = document.getElementById('newTaskTitle').value;
  const points = parseInt(document.getElementById('newTaskPoints').value);
  const assigned_to = document.getElementById('newTaskAssignee').value;

  const newTask = {
    id: Date.now(),
    title,
    points,
    assigned_to,
    status: 'pendiente',
    category: 'Hogar'
  };

  state.tasks.push(newTask);
  renderApp();

  if (supabaseClient) {
    await supabaseClient.from('tasks').insert([newTask]);
  }

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskPoints').value = '';
}

async function addNewReward(e) {
  e.preventDefault();
  const title = document.getElementById('newRewardTitle').value;
  const cost = parseInt(document.getElementById('newRewardCost').value);
  const icon = document.getElementById('newRewardIcon').value || '🎁';

  const newReward = { id: Date.now(), title, cost, icon };
  state.rewards.push(newReward);
  renderApp();

  if (supabaseClient) {
    await supabaseClient.from('rewards').insert([newReward]);
  }

  document.getElementById('newRewardTitle').value = '';
  document.getElementById('newRewardCost').value = '';
  document.getElementById('newRewardIcon').value = '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
