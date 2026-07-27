const SUPABASE_URL = 'https://dwfpellkjknjoownvra.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZnBlbGxramtuanNvb3dudnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQwMDYsImV4cCI6MjEwMDcxMDAwNn0.x75ND4DNtptpxVtf-tK2FNr_33zxhk5SF7_-sAb8-jY';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// PIN por defecto para el Gestor
let parentPin = "1234";
let isManagerUnlocked = false;

let state = {
  currentUser: 'joan',
  currentTaskFilter: 'positive',
  users: {
    'joan': { id: 'joan', name: 'Joan', role: 'hijo', avatar: '👦', points: 0 },
    'martina': { id: 'martina', name: 'Martina', role: 'hijo', avatar: '👧', points: 0 },
    'papa': { id: 'papa', name: 'Papá', role: 'padre', avatar: '🧔', points: 0 },
    'mama': { id: 'mama', name: 'Mamá', role: 'padre', avatar: '👩', points: 0 }
  },
  actions: [
    { id: 1, title: 'Poner la mesa', points: 15, type: 'positive', icon: '🍽️' },
    { id: 2, title: 'Pasear al perro', points: 20, type: 'positive', icon: '🐾' },
    { id: 3, title: 'Limpiar la habitación', points: 25, type: 'positive', icon: '🛏️' },
    { id: 4, title: 'Deberes hechos', points: 30, type: 'positive', icon: '📖' },
    { id: 5, title: 'Pasar la aspiradora', points: 20, type: 'positive', icon: '💨' },
    { id: 6, title: 'Regar plantas', points: 10, type: 'positive', icon: '💧' },
    { id: 7, title: 'Dejó las luces encendidas', points: -5, type: 'negative', icon: '⚡' },
    { id: 8, title: 'No tiró de la cadena', points: -10, type: 'negative', icon: '⚠️' },
    { id: 9, title: 'Llegó tarde a cenar', points: -15, type: 'negative', icon: '⏰' },
    { id: 10, title: 'Gritar', points: -20, type: 'negative', icon: '🔊' },
    { id: 11, title: 'Suelo desordenado', points: -10, type: 'negative', icon: '🗑️' },
    { id: 12, title: 'Demasiada TV', points: -15, type: 'negative', icon: '📺' }
  ],
  rewards: [
    { id: 1, title: '30 min de Consola', cost: 50, icon: '🎮' },
    { id: 2, title: 'Elegir la cena', cost: 80, icon: '🍕' },
    { id: 3, title: 'Ir al parque / Cine', cost: 120, icon: '🍿' },
    { id: 4, title: 'Día libre de tareas', cost: 150, icon: '⭐' }
  ],
  history: []
};

function setActiveTab(tab) {
  const tabs = ['home', 'tasks', 'rewards', 'manager', 'settings'];
  tabs.forEach(t => {
    const section = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (section) section.classList.add('hidden');
    if (navBtn) navBtn.className = "flex flex-col items-center py-1.5 text-zinc-500 hover:text-zinc-300 font-medium";
  });

  const targetSection = document.getElementById(`tab-${tab}`);
  const targetNav = document.getElementById(`nav-${tab}`);
  if (targetSection) targetSection.classList.remove('hidden');
  if (targetNav) targetNav.className = "flex flex-col items-center py-1.5 text-blue-500 font-bold";
}

function initUserSelect() {
  const select = document.getElementById('userSelect');
  if (select) {
    select.innerHTML = Object.entries(state.users)
      .map(([id, u]) => `<option value="${id}">${u.name}</option>`)
      .join('');
    select.value = state.currentUser;
  }
}

function switchUser() {
  const select = document.getElementById('userSelect');
  if (select) {
    state.currentUser = select.value;
    renderApp();
  }
}

function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

  const avatarEl = document.getElementById('currentAvatar');
  if (avatarEl) avatarEl.innerText = user.avatar;

  const pointsEl = document.getElementById('userPointsRewardTab');
  if (pointsEl) pointsEl.innerText = `${user.points} ⭐`;

  renderLeaderboard();
  renderTasks();
  renderRewards();
  renderManagerPanel();
}

// Clasificación
function renderLeaderboard() {
  const container = document.getElementById('leaderboardList');
  if (!container) return;

  const sorted = Object.values(state.users).sort((a, b) => b.points - a.points);

  container.innerHTML = sorted.map((u, index) => {
    const posLabel = index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`;
    const ringColor = index === 0 ? 'border-amber-400' : 'border-blue-300/40';

    return `
      <div class="flex flex-col items-center text-center space-y-1">
        <div class="relative">
          <div class="w-14 h-14 bg-zinc-900/80 rounded-full flex items-center justify-center text-2xl border-2 ${ringColor}">
            ${u.avatar}
          </div>
          <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-zinc-900 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-zinc-700 text-amber-300">
            ${posLabel}
          </span>
        </div>
        <p class="font-bold text-xs pt-1 truncate w-full">${u.name}</p>
        <p class="text-xs font-black text-blue-200">${u.points} pts</p>
      </div>
    `;
  }).join('');
}

// Filtro Tareas
function toggleTaskType(type) {
  state.currentTaskFilter = type;
  const btnPos = document.getElementById('btnTaskPositive');
  const btnNeg = document.getElementById('btnTaskNegative');

  if (type === 'positive') {
    btnPos.className = "py-2.5 rounded-xl text-xs font-extrabold transition-all bg-zinc-800 text-white shadow-sm";
    btnNeg.className = "py-2.5 rounded-xl text-xs font-extrabold transition-all text-zinc-400 hover:text-white";
  } else {
    btnNeg.className = "py-2.5 rounded-xl text-xs font-extrabold transition-all bg-red-950/80 text-red-200 border border-red-800/50 shadow-sm";
    btnPos.className = "py-2.5 rounded-xl text-xs font-extrabold transition-all text-zinc-400 hover:text-white";
  }
  renderTasks();
}

function renderTasks() {
  const container = document.getElementById('tasksGrid');
  if (!container) return;

  const filtered = state.actions.filter(a => a.type === state.currentTaskFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<p class="col-span-2 text-center text-xs text-zinc-500 py-6">No hay acciones registradas en esta categoría.</p>`;
    return;
  }

  container.innerHTML = filtered.map(action => {
    const isPos = action.type === 'positive';
    const pointsClass = isPos ? 'text-emerald-400' : 'text-red-400';
    const ptsText = isPos ? `+${action.points}` : `${action.points}`;

    return `
      <div onclick="applyAction(${action.id})" class="bg-zinc-900 hover:bg-zinc-800/80 p-4 rounded-3xl border border-zinc-800/80 cursor-pointer transition flex flex-col justify-between space-y-3">
        <div class="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center text-xl">
          ${action.icon || (isPos ? '⭐' : '⚠️')}
        </div>
        <div>
          <h4 class="font-bold text-xs text-zinc-100 leading-tight">${action.title}</h4>
          <p class="text-xs font-black ${pointsClass} mt-1">${ptsText} puntos</p>
        </div>
      </div>
    `;
  }).join('');
}

async function applyAction(actionId) {
  const action = state.actions.find(a => a.id === actionId);
  const user = state.users[state.currentUser];

  if (action && user) {
    user.points += action.points;
    if (user.points < 0) user.points = 0;

    const log = `${user.name}: ${action.title} (${action.points > 0 ? '+' : ''}${action.points} pts)`;
    state.history.unshift(log);

    renderApp();
    updateActivityLog();

    if (supabaseClient) {
      await supabaseClient.from('users').update({ points: user.points }).eq('id', user.id);
    }
  }
}

function updateActivityLog() {
  const container = document.getElementById('activityList');
  const countEl = document.getElementById('activityCount');
  if (!container) return;

  if (countEl) countEl.innerText = state.history.length;

  if (state.history.length === 0) {
    container.innerHTML = 'Aún no hay movimientos esta semana.';
    return;
  }

  container.innerHTML = state.history.slice(0, 5).map(item => `
    <div class="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60 text-left text-zinc-300 font-medium">
      ${item}
    </div>
  `).join('');
}

// Premios
function renderRewards() {
  const container = document.getElementById('rewardsGrid');
  if (!container) return;

  const user = state.users[state.currentUser];

  container.innerHTML = state.rewards.map(reward => {
    const canAfford = user.points >= reward.cost;

    return `
      <div class="bg-zinc-900 p-4 rounded-3xl border border-zinc-800/80 flex flex-col justify-between space-y-3 text-center">
        <div class="text-3xl my-1">${reward.icon || '🎁'}</div>
        <div>
          <p class="font-bold text-xs text-zinc-100">${reward.title}</p>
          <p class="text-xs font-black text-amber-400 mt-0.5">${reward.cost} ⭐</p>
        </div>
        <button 
          onclick="claimReward(${reward.id})"
          ${!canAfford ? 'disabled' : ''}
          class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition">
          Canjear
        </button>
      </div>
    `;
  }).join('');
}

async function claimReward(rewardId) {
  const reward = state.rewards.find(r => r.id === rewardId);
  const user = state.users[state.currentUser];

  if (reward && user && user.points >= reward.cost) {
    user.points -= reward.cost;
    state.history.unshift(`${user.name} canjeó: ${reward.title} (-${reward.cost} pts)`);

    renderApp();
    updateActivityLog();

    if (supabaseClient) {
      await supabaseClient.from('users').update({ points: user.points }).eq('id', user.id);
    }
  }
}

// LÓGICA DEL PIN
function unlockManager() {
  const pinInput = document.getElementById('pinInput').value;
  if (pinInput === parentPin) {
    isManagerUnlocked = true;
    document.getElementById('pinLockScreen').classList.add('hidden');
    document.getElementById('pinUnlockedContent').classList.remove('hidden');
    document.getElementById('pinInput').value = '';
    renderManagerPanel();
  } else {
    alert("PIN incorrecto. Inténtalo de nuevo.");
    document.getElementById('pinInput').value = '';
  }
}

function lockManager() {
  isManagerUnlocked = false;
  document.getElementById('pinLockScreen').classList.remove('hidden');
  document.getElementById('pinUnlockedContent').classList.add('hidden');
}

function changePinPrompt() {
  const current = prompt("Introduce el PIN actual:");
  if (current === parentPin) {
    const newPin = prompt("Introduce el nuevo PIN de 4 dígitos:");
    if (newPin && newPin.length === 4) {
      parentPin = newPin;
      alert("¡PIN actualizado con éxito!");
    } else {
      alert("El PIN debe tener 4 dígitos.");
    }
  } else if (current !== null) {
    alert("PIN incorrecto.");
  }
}

// RENDER Y GESTIÓN EN EL PANEL
function renderManagerPanel() {
  if (!isManagerUnlocked) return;

  // 1. Puntos manuales
  const pointsContainer = document.getElementById('manualPointsControl');
  if (pointsContainer) {
    const kids = Object.values(state.users).filter(u => u.role === 'hijo');
    pointsContainer.innerHTML = kids.map(kid => `
      <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-xl">${kid.avatar}</span>
          <div>
            <p class="font-bold text-xs text-white">${kid.name}</p>
            <span class="text-[11px] text-amber-400 font-bold">${kid.points} pts</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="modifyPoints('${kid.id}', -10)" class="bg-zinc-900 hover:bg-zinc-800 text-red-400 text-xs font-extrabold px-2.5 py-1.5 rounded-lg border border-zinc-800">-10</button>
          <button onclick="modifyPoints('${kid.id}', 10)" class="bg-zinc-900 hover:bg-zinc-800 text-emerald-400 text-xs font-extrabold px-2.5 py-1.5 rounded-lg border border-zinc-800">+10</button>
        </div>
      </div>
    `).join('');
  }

  // 2. Administrar / Eliminar tareas
  const actionsContainer = document.getElementById('manageActionsList');
  if (actionsContainer) {
    actionsContainer.innerHTML = state.actions.map(a => `
      <div class="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span>${a.icon || '📌'}</span>
          <span class="text-xs text-zinc-200 font-medium">${a.title} (${a.points > 0 ? '+' : ''}${a.points} pts)</span>
        </div>
        <button onclick="deleteAction(${a.id})" class="text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 transition">
          Eliminar 🗑️
        </button>
      </div>
    `).join('');
  }
}

async function modifyPoints(userId, delta) {
  const user = state.users[userId];
  if (user) {
    user.points += delta;
    if (user.points < 0) user.points = 0;
    renderApp();

    if (supabaseClient) {
      await supabaseClient.from('users').update({ points: user.points }).eq('id', user.id);
    }
  }
}

function deleteAction(id) {
  if (confirm("¿Estás seguro de que quieres eliminar esta tarea/penalización?")) {
    state.actions = state.actions.filter(a => a.id !== id);
    renderApp();
  }
}

function addNewAction() {
  const title = document.getElementById('newActionTitle').value.trim();
  const points = parseInt(document.getElementById('newActionPoints').value);
  const type = document.getElementById('newActionType').value;

  if (!title || isNaN(points)) return;

  const finalPoints = type === 'negative' ? -Math.abs(points) : Math.abs(points);

  const newObj = {
    id: Date.now(),
    title,
    points: finalPoints,
    type,
    icon: type === 'positive' ? '⭐' : '⚠️'
  };

  state.actions.unshift(newObj);
  document.getElementById('newActionTitle').value = '';
  document.getElementById('newActionPoints').value = '';

  renderApp();
}

function resetWeeklyPoints() {
  if (confirm("¿Reiniciar la puntuación de la semana a 0 para todos?")) {
    Object.keys(state.users).forEach(k => state.users[k].points = 0);
    state.history = [];
    renderApp();
    updateActivityLog();
  }
}

function startApp() {
  initUserSelect();
  renderApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
