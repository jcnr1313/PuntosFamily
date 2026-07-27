// Estado inicial o carga desde LocalStorage (Persistencia básica)
const defaultData = {
  currentUser: 'hijo1',
  users: {
    'hijo1': { name: 'Lucas', role: 'hijo', avatar: '👦', points: 45 },
    'hijo2': { name: 'Sofia', role: 'hijo', avatar: '👧', points: 30 },
    'padre': { name: 'Papá / Mamá', role: 'padre', avatar: '👑', points: 0 }
  },
  tasks: [
    { id: 1, title: 'Hacer la cama', points: 5, assignedTo: 'hijo1', status: 'pendiente' },
    { id: 2, title: 'Poner la mesa', points: 10, assignedTo: 'hijo1', status: 'revisando' },
    { id: 3, title: 'Hacer los deberes', points: 15, assignedTo: 'hijo2', status: 'pendiente' }
  ],
  rewards: [
    { id: 1, title: '30 min de Consola', cost: 30, icon: '🎮' },
    { id: 2, title: 'Elegir la película', cost: 40, icon: '🍿' },
    { id: 3, title: 'Salida al parque', cost: 50, icon: '🛝' }
  ]
};

// Cargar estado o inicializar
let state = JSON.parse(localStorage.getItem('familyPointsDB')) || defaultData;

function saveState() {
  localStorage.setItem('familyPointsDB', JSON.stringify(state));
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initUserSelect();
  renderApp();
});

function initUserSelect() {
  const select = document.getElementById('userSelect');
  const assigneeSelect = document.getElementById('newTaskAssignee');
  
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
  saveState();
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
  
  // Render Header
  document.getElementById('currentAvatar').innerText = user.avatar;
  document.getElementById('userPoints').innerText = user.points;

  // Visibilidad del modo padre
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
  const myTasks = state.tasks.filter(t => t.assignedTo === state.currentUser);
  
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
    return `<button onclick="completeTask(${task.id})" class="bg-indigo-50 text-indigo-600 font-bold text-xs py-2 px-3 rounded-xl hover:bg-indigo-100 active:scale-95 transition">Completar</button>`;
  }
  if (task.status === 'revisando') {
    return `<span class="bg-amber-100 text-amber-700 font-bold text-xs py-1.5 px-3 rounded-xl">Revisando...</span>`;
  }
  return `<span class="bg-emerald-100 text-emerald-700 font-bold text-xs py-1.5 px-3 rounded-xl">¡Completada!</span>`;
}

function completeTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.status = 'revisando';
    saveState();
    renderApp();
  }
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
        onclick="claimReward(${reward.id})"
        ${user.points < reward.cost || user.role === 'padre' ? 'disabled' : ''}
        class="w-full py-1.5 px-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed">
        Canjear
      </button>
    </div>
  `).join('');
}

function claimReward(id) {
  const reward = state.rewards.find(r => r.id === id);
  const user = state.users[state.currentUser];

  if (user && user.points >= reward.cost) {
    user.points -= reward.cost;
    alert(`🎉 ¡Canjeaste: ${reward.title}! Avisa a tus padres para disfrutarlo.`);
    saveState();
    renderApp();
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
        <span class="text-slate-400">Para: ${state.users[task.assignedTo]?.name}</span>
      </div>
      <button onclick="approveTask(${task.id})" class="bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm">
        Aprobar (+${task.points}⭐)
      </button>
    </div>
  `).join('');
}

function approveTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.status = 'completada';
    state.users[task.assignedTo].points += task.points;
    saveState();
    renderApp();
  }
}

function addNewTask(e) {
  e.preventDefault();
  const title = document.getElementById('newTaskTitle').value;
  const points = parseInt(document.getElementById('newTaskPoints').value);
  const assignedTo = document.getElementById('newTaskAssignee').value;

  state.tasks.push({
    id: Date.now(),
    title,
    points,
    assignedTo,
    status: 'pendiente'
  });

  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskPoints').value = '';
  saveState();
  renderApp();
}

function addNewReward(e) {
  e.preventDefault();
  const title = document.getElementById('newRewardTitle').value;
  const cost = parseInt(document.getElementById('newRewardCost').value);

  state.rewards.push({
    id: Date.now(),
    title,
    cost,
    icon: '🎉'
  });

  document.getElementById('newRewardTitle').value = '';
  document.getElementById('newRewardCost').value = '';
  saveState();
  renderApp();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
