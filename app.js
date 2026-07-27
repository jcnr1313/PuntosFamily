const SUPABASE_URL = 'https://dwfpellkjknjoownvra.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZnBlbGxramtuanNvb3dudnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQwMDYsImV4cCI6MjEwMDcxMDAwNn0.x75ND4DNtptpxVtf-tK2FNr_33zxhk5SF7_-sAb8-jY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
  currentUser: 'hijo1',
  users: {},
  tasks: [],
  rewards: []
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  setupRealtime();
});

async function loadAllData() {
  const { data: users, error: errU } = await supabase.from('users').select('*');
  const { data: tasks, error: errT } = await supabase.from('tasks').select('*');
  const { data: rewards, error: errR } = await supabase.from('rewards').select('*');

  if (users) {
    state.users = {};
    users.forEach(u => state.users[u.id] = u);
  }
  if (tasks) state.tasks = tasks;
  if (rewards) state.rewards = rewards;

  initUserSelect();
  renderApp();
}

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
    document.getElementById(`tab${capitalize(t)}Btn`).className = "py-2.5 rounded-xl transition-all text-slate-500 font-bold";
  });

  document.getElementById(`${tab}Tab`).classList.remove('hidden');
  document.getElementById(`tab${capitalize(tab)}Btn`).className = "py-2.5 rounded-xl bg-white text-indigo-600 font-extrabold shadow-sm transition-all";
}

function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

  document.getElementById('currentAvatar').innerText = user.avatar;
  document.getElementById('userPoints').innerText = user.points;
  document.getElementById('roleBadge').innerText = user.role.toUpperCase();

  const parentBtn = document.getElementById('tabParentBtn');
  const quickAdd = document.getElementById('quickAddContainer');

  if (user.role === 'padre') {
    parentBtn.classList.remove('hidden');
    quickAdd.classList.remove('hidden');
  } else {
    parentBtn.classList.add('hidden');
    quickAdd.classList.add('hidden');
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
  const user = state.users[state.currentUser];

  // Si es padre ve todas las tareas, si es hijo ve las suyas
  const myTasks = user.role === 'padre' 
    ? state.tasks 
    : state.tasks.filter(t => t.assigned_to === state.currentUser);

  document.getElementById('taskCountText').innerText = `${myTasks.filter(t => t.status === 'pendiente').length} pendientes`;

  if (myTasks.length === 0) {
    taskList.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-slate-400 text-sm border border-slate-100 shadow-sm">🎉 ¡Sin tareas pendientes por ahora!</div>`;
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
      ${getTaskAction(task, user)}
    </div>
  `).join('');
}

function getTaskAction(task, user) {
  if (task.status === 'pendiente') {
    return `<button onclick="completeTask(${task.id})" class="bg-indigo-50 text-indigo-600 font-extrabold text-xs py-2 px-3.5 rounded-xl hover:bg-indigo-100 transition active:scale-95">Completar</button>`;
  }
  if (task.status === 'revisando') {
    return `<span class="bg-amber-100 text-amber-800 font-extrabold text-xs py-1.5 px-3 rounded-xl">Revisando...</span>`;
  }
  return `<span class="bg-emerald-100 text-emerald-700 font-extrabold text-xs py-1.5 px-3 rounded-xl">✓ Hecho</span>`;
}

async function completeTask(id) {
  await supabase.from('tasks').update({ status: 'revisando' }).eq('id', id);
}

function renderRewards() {
  const rewardList = document.getElementById('rewardList');
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
          class="w-full py-2 bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Canjear
        </button>
      </div>
    `;
  }).join('');
}

async function claimReward(id, cost) {
  const user = state.users[state.currentUser];
  if (user && user.points >= cost) {
    const newPoints = user.points - cost;
    await supabase.from('users').update({ points: newPoints }).eq('id', user.id);
    alert(`🎉 ¡Has canjeado el premio! Avisa a tus padres.`);
  }
}

function renderParentPanel() {
  const approvalList = document.getElementById('parentApprovalList');
  const pendingTasks = state.tasks.filter(t => t.status === 'revisando');

  if (pendingTasks.length === 0) {
    approvalList.innerHTML = `<p class="text-xs text-amber-800/70 font-medium">No hay tareas pendientes de revisar.</p>`;
    return;
  }

  approvalList.innerHTML = pendingTasks.map(task => `
    <div class="bg-white p-3 rounded-xl border border-amber-200/60 flex justify-between items-center text-xs shadow-sm">
      <div>
        <p class="font-bold text-slate-800">${task.title}</p>
        <span class="text-slate-400">Para: ${state.users[task.assigned_to]?.name}</span>
      </div>
      <button onclick="approveTask(${task.id}, '${task.assigned_to}', ${task.points})" class="bg-emerald-600 text-white font-extrabold py-2 px-3 rounded-lg shadow-sm hover:bg-emerald-700">
        Aprobar (+${task.points}⭐)
      </button>
    </div>
  `).join('');
}

async function approveTask(taskId, assignedTo, points) {
  const user = state.users[assignedTo];
  await supabase.from('tasks').update({ status: 'completada' }).eq('id', taskId);
  await supabase.from('users').update({ points: (user?.points || 0) + points }).eq('id', assignedTo);
}

async function quickPoints(pts) {
  const user = state.users[state.currentUser];
  if (user) {
    await supabase.from('users').update({ points: user.points + pts }).eq('id', user.id);
  }
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
    status: 'pendiente',
    category: 'Hogar'
  }]);

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskPoints').value = '';
}

async function addNewReward(e) {
  e.preventDefault();
  const title = document.getElementById('newRewardTitle').value;
  const cost = parseInt(document.getElementById('newRewardCost').value);
  const icon = document.getElementById('newRewardIcon').value || '🎁';

  await supabase.from('rewards').insert([{
    id: Date.now(),
    title,
    cost,
    icon
  }]);

  document.getElementById('newRewardTitle').value = '';
  document.getElementById('newRewardCost').value = '';
  document.getElementById('newRewardIcon').value = '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
