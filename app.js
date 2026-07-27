// ⚙️ CREDENCIALES CONFIGURADAS
const SUPABASE_URL = 'https://dwfpellkjknjoownvra.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZnBlbGxramtuanNvb3dudnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQwMDYsImV4cCI6MjEwMDcxMDAwNn0.x75ND4DNtptpxVtf-tK2FNr_33zxhk5SF7_-sAb8-jY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
  currentUser: 'hijo1',
  users: {},
  tasks: [],
  rewards: []
};

// Cargar datos al iniciar y activar escucha en tiempo real
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  setupRealtime();
});

// Cargar todos los datos desde Supabase
async function loadAllData() {
  const { data: users } = await supabase.from('users').select('*');
  const { data: tasks } = await supabase.from('tasks').select('*');
  const { data: rewards } = await supabase.from('rewards').select('*');

  if (users) {
    state.users = {};
    users.forEach(u => state.users[u.id] = u);
  }
  if (tasks) state.tasks = tasks;
  if (rewards) state.rewards = rewards;

  initUserSelect();
  renderApp();
}

// Suscripción en Tiempo Real (Sincronización instantánea entre móviles)
function setupRealtime() {
  supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      loadAllData();
    })
    .subscribe();
}

function initUserSelect() {
  const select = document.getElementById('userSelect');
  const assigneeSelect = document.getElementById('newTaskAssignee');

  if (!select || !assigneeSelect) return;

  select.innerHTML = Object.entries(state.users)
    .map(([id, u]) => `<option value="${id}">${u.name}</option>`)
    .join('');

  assigneeSelect.innerHTML = Object.entries(state.users)
    .filter(([_, u]) => u.role === 'hijo')
    .map(([id, u]) => `<option value="${id}">${u.name}</option>`)
    .join('');

  select.value = state.currentUser;
}

function switchUser() {
  state.currentUser = document.getElementById('userSelect').value;
  renderApp();
}

function switchTab(tab) {
  ['tasks', 'rewards', 'parent'].forEach(t => {
    document.getElementById(`${t}Tab`).classList.add('hidden');
    document.getElementById(`tab${capitalize(t)}Btn`).className = "flex-1 py-2 rounded-xl transition text-slate-600";
  });

  document.getElementById(`${tab}Tab`).classList.remove('hidden');
  document.getElementById(`tab${capitalize(tab)}Btn`).className = "flex-1 py-2 rounded-xl bg-white text-indigo-600 font-bold shadow-sm transition";
}

function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

  document.getElementById('currentAvatar').innerText = user.avatar;
  document.getElementById('userPoints').innerText = user.points;

  const parentBtn = document.getElementById('tabParentBtn');
  if (user.role === 'padre') {
    parentBtn.classList.remove('hidden');
  } else {
    parentBtn.classList.add('hidden');
    if (!document.getElementById('parentTab').classList.contains('hidden')) {
      switchTab('tasks');
    }
  }

  renderTasks();
  renderRewards();
  renderParentPanel();
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  const myTasks = state.tasks.filter(t => t.assigned_to === state.currentUser);

  document.getElementById('taskCountText').innerText = `${myTasks.filter(t => t.status === 'pendiente').length} pendientes`;

  if (myTasks.length === 0) {
    taskList.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-slate-400 text-sm border border-slate-100">¡No tienes tareas asignadas por ahora! 🎉</div>`;
    return;
  }

  taskList.innerHTML = myTasks.map(task => `
    <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
      <div>
        <p class="font-bold text-slate-700 text-sm">${task.title}</p>
        <span class="text-xs text-indigo-600 font-extrabold">+${task.points} ⭐</span>
      </div>
      ${getTaskAction(task)}
    </div>
  `).join('');
}

function getTaskAction(task) {
  if (task.status === 'pendiente') {
    return `<button onclick="completeTask(${task.id})" class="bg-indigo-50 text-indigo-600 font-bold text-xs py-2 px-3 rounded-xl hover:bg-indigo-100 transition">Completar</button>`;
  }
  if (task.status === 'revisando') {
    return `<span class="bg-amber-100 text-amber-700 font-bold text-xs py-1.5 px-3 rounded-xl">Revisando...</span>`;
  }
  return `<span class="bg-emerald-100 text-emerald-700 font-bold text-xs py-1.5 px-3 rounded-xl">¡Completada!</span>`;
}

async function completeTask(id) {
  await supabase.from('tasks').update({ status: 'revisando' }).eq('id', id);
}

function renderRewards() {
  const rewardList = document.getElementById('rewardList');
  const user = state.users[state.currentUser];

  rewardList.innerHTML = state.rewards.map(reward => `
    <div class="bg-white p-3.5 rounded-2xl border border-slate-100 text-center shadow-sm flex flex-col justify-between">
      <div class="text-3xl mb-1">${reward.icon || '🎁'}</div>
      <p class="font-bold text-xs text-slate-700 mb-1">${reward.title}</p>
      <span class="text-xs font-black text-amber-500 mb-2">${reward.cost} ⭐</span>
      <button 
        onclick="claimReward(${reward.id}, ${reward.cost})"
        ${user.points < reward.cost || user.role === 'padre' ? 'disabled' : ''}
        class="w-full py-1.5 px-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-40">
        Canjear
      </button>
    </div>
  `).join('');
}

async function claimReward(id, cost) {
  const user = state.users[state.currentUser];
  if (user && user.points >= cost) {
    const newPoints = user.points - cost;
    await supabase.from('users').update({ points: newPoints }).eq('id', user.id);
    alert(`🎉 ¡Premio canjeado con éxito!`);
  }
}

function renderParentPanel() {
  const approvalList = document.getElementById('parentApprovalList');
  const pendingTasks = state.tasks.filter(t => t.status === 'revisando');

  if (pendingTasks.length === 0) {
    approvalList.innerHTML = `<p class="text-xs text-amber-800/60 font-medium">No hay tareas pendientes de revisión.</p>`;
    return;
  }

  approvalList.innerHTML = pendingTasks.map(task => `
    <div class="bg-white p-3 rounded-xl border border-amber-100 flex justify-between items-center text-xs">
      <div>
        <p class="font-bold text-slate-700">${task.title}</p>
        <span class="text-slate-400">Para: ${state.users[task.assigned_to]?.name}</span>
      </div>
      <button onclick="approveTask(${task.id}, '${task.assigned_to}', ${task.points})" class="bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm">
        Aprobar (+${task.points}⭐)
      </button>
    </div>
  `).join('');
}

async function approveTask(taskId, assignedTo, points) {
  const user = state.users[assignedTo];
  await supabase.from('tasks').update({ status: 'completada' }).eq('id', taskId);
  await supabase.from('users').update({ points: user.points + points }).eq('id', assignedTo);
}

async function addNewTask(e) {
  e.preventDefault();
  const title = document.getElementById('newTaskTitle').value;
  const points = parseInt(document.getElementById('newTaskPoints').value);
  const assigned_to = document.getElementById('newTaskAssignee').value;

  await supabase.from('tasks').insert([{
    id: Date.now(),
    title,
    points,
    assigned_to,
    status: 'pendiente'
  }]);

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskPoints').value = '';
}

async function addNewReward(e) {
  e.preventDefault();
  const title = document.getElementById('newRewardTitle').value;
  const cost = parseInt(document.getElementById('newRewardCost').value);

  await supabase.from('rewards').insert([{
    id: Date.now(),
    title,
    cost,
    icon: '🎉'
  }]);

  document.getElementById('newRewardTitle').value = '';
  document.getElementById('newRewardCost').value = '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
