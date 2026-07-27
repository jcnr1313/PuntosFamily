const SUPABASE_URL = 'https://dwfpellkjknjoownvra.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZnBlbGxramtuanNvb3dudnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQwMDYsImV4cCI6MjEwMDcxMDAwNn0.x75ND4DNtptpxVtf-tK2FNr_33zxhk5SF7_-sAb8-jY';

let supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.warn("No se pudo inicializar Supabase:", e);
}

let isManagerUnlocked = false;

let state = {
  currentUser: 'joan',
  previousUser: 'joan',
  parentPin: '1234',
  currentTaskFilter: 'positive',
  users: {
    'joan': { id: 'joan', name: 'Joan', role: 'hijo', avatar: '👦', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null },
    'martina': { id: 'martina', name: 'Martina', role: 'hijo', avatar: '👧', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null },
    'papa': { id: 'papa', name: 'Papá', role: 'padre', avatar: '🐍', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null },
    'mama': { id: 'mama', name: 'Mamá', role: 'padre', avatar: '👩', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null }
  },
  actions: [
    // --- GANAR PUNTOS (POSITIVAS) ---
    { id: 1, title: 'Leer 30 min', points: 20, type: 'positive', icon: '📖' },
    { id: 2, title: 'Ayudar con la compra', points: 15, type: 'positive', icon: '🛒' },
    { id: 3, title: 'Ayudar a tu hermano/a', points: 20, type: 'positive', icon: '👥' },
    { id: 4, title: 'Sacar sobresalientes', points: 35, type: 'positive', icon: '📝' },
    { id: 5, title: 'Hacer caso a la primera', points: 25, type: 'positive', icon: '✋' },
    { id: 6, title: 'Limpiar a los animales', points: 25, type: 'positive', icon: '🦜' },
    { id: 7, title: 'Limpiar y ordenar la habitación', points: 30, type: 'positive', icon: '🏡' },
    { id: 8, title: 'Tirar la basura', points: 10, type: 'positive', icon: '🗑️' },
    { id: 9, title: 'Ropa recogida', points: 15, type: 'positive', icon: '👕' },
    { id: 10, title: 'Poner la mesa', points: 15, type: 'positive', icon: '🍽️' },
    { id: 11, title: 'Deberes hechos', points: 30, type: 'positive', icon: '📖' },
    { id: 12, title: 'Pasar la aspiradora', points: 20, type: 'positive', icon: '💨' },
    { id: 13, title: 'Regar plantas', points: 10, type: 'positive', icon: '💧' },

    // --- PENALIZACIONES (NEGATIVAS) ---
    { id: 101, title: 'Llegar tarde a comer/cenar', points: -20, type: 'negative', icon: '🍽️' },
    { id: 102, title: 'Levantarse tarde', points: -20, type: 'negative', icon: '🛏️' },
    { id: 103, title: 'Responder mal', points: -20, type: 'negative', icon: '⛔' },
    { id: 104, title: 'Olvidar deberes', points: -25, type: 'negative', icon: '📚' },
    { id: 105, title: 'Mentir', points: -30, type: 'negative', icon: '🤥' },
    { id: 106, title: 'Pelearse', points: -25, type: 'negative', icon: '🤼' },
    { id: 107, title: 'No recoger el cuarto ni limpiarlo', points: -30, type: 'negative', icon: '🏡' },
    { id: 108, title: 'No hacer caso a la primera', points: -25, type: 'negative', icon: '✋' },
    { id: 109, title: 'Dejó las luces encendidas', points: -5, type: 'negative', icon: '⚡' },
    { id: 110, title: 'No tiró de la cadena', points: -10, type: 'negative', icon: '⚠️' },
    { id: 111, title: 'Llegó tarde a cenar', points: -15, type: 'negative', icon: '⏰' },
    { id: 112, title: 'Gritar', points: -20, type: 'negative', icon: '🔊' },
    { id: 113, title: 'Demasiada TV', points: -15, type: 'negative', icon: '📺' },
    { id: 114, title: 'No limpiar a los animales', points: -25, type: 'negative', icon: '🦜' },
    { id: 115, title: 'No hacer los deberes', points: -30, type: 'negative', icon: '📖' },
    { id: 116, title: 'No poner la mesa', points: -15, type: 'negative', icon: '🍽️' },
    { id: 117, title: 'No recoger la ropa', points: -15, type: 'negative', icon: '👕' },
    { id: 118, title: 'No tirar la basura', points: -10, type: 'negative', icon: '🗑️' }
  ],
  rewards: [
    { id: 1, title: 'Elegir la cena', cost: 80, icon: '🍕' },
    { id: 2, title: 'Día libre de tareas', cost: 150, icon: '⭐' },
    { id: 3, title: 'Ir al cine', cost: 350, icon: '🎬' },
    { id: 4, title: '1h de tablet', cost: 250, icon: '📱' },
    { id: 5, title: '1h de consola', cost: 250, icon: '🎁' },
    { id: 6, title: '1 partida de bolos', cost: 300, icon: '🎳' }
  ],
  redemptions: [],
  history: []
};

function loadLocalStorage() {
  const savedState = localStorage.getItem('family_points_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed.users) state.users = { ...state.users, ...parsed.users };
      if (parsed.parentPin) state.parentPin = parsed.parentPin;
      if (parsed.actions) state.actions = parsed.actions;
      if (parsed.rewards) state.rewards = parsed.rewards;
      if (parsed.redemptions) state.redemptions = parsed.redemptions;
      if (parsed.history) state.history = parsed.history;
    } catch (e) {
      console.error("Error al leer localStorage", e);
    }
  }
}

async function saveLocalStorage() {
  localStorage.setItem('family_points_state', JSON.stringify({
    users: state.users,
    parentPin: state.parentPin,
    actions: state.actions,
    rewards: state.rewards,
    redemptions: state.redemptions,
    history: state.history
  }));
  await syncFullStateToCloud();
}

async function fetchCloudData() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('app_state')
      .select('data')
      .eq('id', 'main_config')
      .maybeSingle();

    if (error) {
      console.warn("Error leyendo de Supabase:", error);
      return;
    }

    if (data && data.data) {
      const remote = data.data;
      if (remote.users) state.users = { ...state.users, ...remote.users };
      if (remote.parentPin) state.parentPin = remote.parentPin;
      if (remote.actions && remote.actions.length > 0) state.actions = remote.actions;
      if (remote.rewards && remote.rewards.length > 0) state.rewards = remote.rewards;
      if (remote.redemptions) state.redemptions = remote.redemptions;
      if (remote.history) state.history = remote.history;

      localStorage.setItem('family_points_state', JSON.stringify(state));
      renderApp();
    } else {
      await syncFullStateToCloud();
    }
  } catch (err) {
    console.warn("Error general al consultar Supabase", err);
  }
}

async function syncFullStateToCloud() {
  if (!supabaseClient) return;
  try {
    const payload = {
      users: state.users,
      parentPin: state.parentPin,
      actions: state.actions,
      rewards: state.rewards,
      redemptions: state.redemptions,
      history: state.history
    };

    const { error } = await supabaseClient
      .from('app_state')
      .upsert({ id: 'main_config', data: payload, updated_at: new Date() });

    if (error) {
      console.error("Error al guardar en Supabase:", error);
    }
  } catch (err) {
    console.warn("Error al conectar con Supabase:", err);
  }
}

function setupRealtimeListener() {
  if (!supabaseClient) return;

  supabaseClient
    .channel('public:app_state')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_state' }, payload => {
      if (payload.new && payload.new.data) {
        const remote = payload.new.data;
        if (remote.users) state.users = { ...state.users, ...remote.users };
        if (remote.parentPin) state.parentPin = remote.parentPin;
        if (remote.actions && remote.actions.length > 0) state.actions = remote.actions;
        if (remote.rewards && remote.rewards.length > 0) state.rewards = remote.rewards;
        if (remote.redemptions) state.redemptions = remote.redemptions;
        if (remote.history) state.history = remote.history;

        localStorage.setItem('family_points_state', JSON.stringify(state));
        renderApp();
      }
    })
    .subscribe();
}

function renderAvatarHtml(avatarStr, sizeClasses = "w-full h-full text-2xl") {
  if (!avatarStr) return `<span class="${sizeClasses} flex items-center justify-center">👤</span>`;
  if (avatarStr.startsWith('http://') || avatarStr.startsWith('https://') || avatarStr.startsWith('data:image')) {
    return `<img src="${avatarStr}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
  }
  return `<span class="${sizeClasses} flex items-center justify-center">${avatarStr}</span>`;
}

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
  if (!select) return;

  const targetUserId = select.value;
  const targetUser = state.users[targetUserId];

  if (targetUser && targetUser.role === 'padre') {
    const pinEntered = prompt(`Para acceder al perfil de ${targetUser.name} introduce el PIN parental:`);
    if (pinEntered === state.parentPin) {
      state.previousUser = targetUserId;
      state.currentUser = targetUserId;
    } else {
      if (pinEntered !== null) alert("PIN incorrecto. Acceso denegado.");
      select.value = state.previousUser;
      return;
    }
  } else {
    state.previousUser = targetUserId;
    state.currentUser = targetUserId;
  }

  renderApp();
}

function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

  initUserSelect();

  const avatarEl = document.getElementById('currentAvatar');
  if (avatarEl) avatarEl.innerHTML = renderAvatarHtml(user.avatar, "text-xl");

  const pointsEl = document.getElementById('userPointsRewardTab');
  if (pointsEl) pointsEl.innerText = `${user.points} ⭐`;

  renderLeaderboard();
  renderPodium();
  renderUserStats();
  renderTasks();
  renderRewards();
  updateActivityLog();
  renderManagerPanel();
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboardList');
  if (!container) return;

  const sorted = Object.values(state.users).sort((a, b) => b.points - a.points);

  container.innerHTML = sorted.map((u, index) => {
    const isLeader = index === 0;
    const posLabel = isLeader ? '🏆 LÍDER' : index === 1 ? '🥈 2º' : index === 2 ? '🥉 3º' : `${index + 1}º`;
    const ringColor = isLeader ? 'border-amber-400 ring-4 ring-amber-400/40 animate-pulse' : 'border-zinc-700/80';
    const leaderBg = isLeader ? 'bg-gradient-to-b from-amber-500/20 via-zinc-950 to-zinc-950 border-amber-500/50 shadow-xl shadow-amber-500/10' : 'bg-zinc-950/40 border-white/5';

    return `
      <div class="flex flex-col items-center text-center ${leaderBg} p-3 rounded-2xl border backdrop-blur-sm relative overflow-hidden">
        ${isLeader ? `<div class="absolute top-1 right-1 text-xs animate-trophy">🏆</div>` : ''}
        <div class="relative mt-1">
          <div class="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border-2 ${ringColor} overflow-hidden shadow-inner">
            ${renderAvatarHtml(u.avatar, "text-3xl")}
          </div>
          <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-[9px] font-black px-2 py-0.5 rounded-full border border-zinc-700 text-amber-300 shadow whitespace-nowrap">
            ${posLabel}
          </span>
        </div>
        <p class="font-bold text-xs pt-3 truncate w-full text-zinc-100">${u.name}</p>
        <p class="text-xs font-black text-blue-200 mt-0.5">${u.points} pts</p>
      </div>
    `;
  }).join('');
}

function renderPodium() {
  const container = document.getElementById('podiumList');
  if (!container) return;

  const sorted = Object.values(state.users).sort((a, b) => b.points - a.points);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  if (!first) return;

  container.innerHTML = `
    ${second ? `
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-zinc-900 border-2 border-slate-300 flex items-center justify-center overflow-hidden shadow-md">
          ${renderAvatarHtml(second.avatar, "text-lg")}
        </div>
        <span class="text-[10px] font-extrabold text-slate-300 mt-1">${second.name}</span>
        <div class="w-20 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-xl h-16 mt-1 flex flex-col justify-end items-center pb-2 border-t border-slate-400">
          <span class="text-xs font-black text-white">🥈 2º</span>
          <span class="text-[10px] font-bold text-slate-300">${second.points} pts</span>
        </div>
      </div>
    ` : ''}

    <div class="flex flex-col items-center">
      <div class="relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-base animate-trophy">👑</span>
        <div class="w-14 h-14 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20">
          ${renderAvatarHtml(first.avatar, "text-2xl")}
        </div>
      </div>
      <span class="text-xs font-black text-amber-300 mt-1">${first.name}</span>
      <div class="w-24 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-xl h-24 mt-1 flex flex-col justify-end items-center pb-2 border-t-2 border-amber-300 shadow-xl shadow-amber-500/20">
        <span class="text-sm font-black text-zinc-950">🏆 1º</span>
        <span class="text-xs font-black text-zinc-900">${first.points} pts</span>
      </div>
    </div>

    ${third ? `
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 rounded-full bg-zinc-900 border-2 border-amber-700 flex items-center justify-center overflow-hidden shadow-md">
          ${renderAvatarHtml(third.avatar, "text-lg")}
        </div>
        <span class="text-[10px] font-extrabold text-amber-600 mt-1">${third.name}</span>
        <div class="w-20 bg-gradient-to-t from-amber-900 to-amber-800 rounded-t-xl h-12 mt-1 flex flex-col justify-end items-center pb-2 border-t border-amber-600">
          <span class="text-xs font-black text-white">🥉 3º</span>
          <span class="text-[10px] font-bold text-amber-300">${third.points} pts</span>
        </div>
      </div>
    ` : ''}
  `;
}

function renderUserStats() {
  const container = document.getElementById('userStatsGrid');
  const nameLabel = document.getElementById('statsUserName');
  const user = state.users[state.currentUser];

  if (!container || !user) return;
  if (nameLabel) nameLabel.innerText = user.name;

  let streakBadge = '💤 Sin Racha';
  let streakColor = 'text-zinc-400 border-zinc-800 bg-zinc-950';

  if (user.streakType === 'positive') {
    streakBadge = `🔥 Racha Positiva (${user.streakDays} días)`;
    streakColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
  } else if (user.streakType === 'negative') {
    streakBadge = `⚠️ Racha de Penalizaciones (${user.streakDays} días)`;
    streakColor = 'text-red-400 border-red-500/30 bg-red-950/30';
  } else if (user.streakType === 'idle') {
    streakBadge = `💤 Sin actividad (${user.streakDays} días)`;
    streakColor = 'text-amber-400 border-amber-500/30 bg-amber-950/30';
  }

  container.innerHTML = `
    <div class="col-span-2 ${streakColor} p-3 rounded-2xl border flex justify-between items-center">
      <span class="font-bold text-xs">Estado de Racha</span>
      <span class="font-black text-xs">${streakBadge}</span>
    </div>
    <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 flex flex-col justify-center">
      <span class="text-zinc-500 text-[10px]">Tareas Completadas</span>
      <span class="text-lg font-black text-white mt-0.5">${user.totalCompleted || 0}</span>
    </div>
    <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 flex flex-col justify-center">
      <span class="text-zinc-500 text-[10px]">Puntos Acumulados</span>
      <span class="text-lg font-black text-amber-400 mt-0.5">${user.points} ⭐</span>
    </div>
  `;
}

function toggleTaskType(type) {
  state.currentTaskFilter = type;
  const btnPos = document.getElementById('btnTaskPositive');
  const btnNeg = document.getElementById('btnTaskNegative');

  if (type === 'positive') {
    if (btnPos) btnPos.className = "py-3 rounded-xl text-xs font-black transition-all bg-zinc-800 text-white shadow-md flex items-center justify-center gap-2";
    if (btnNeg) btnNeg.className = "py-3 rounded-xl text-xs font-black transition-all text-zinc-400 hover:text-white flex items-center justify-center gap-2";
  } else {
    if (btnNeg) btnNeg.className = "py-3 rounded-xl text-xs font-black transition-all bg-red-950/80 text-red-200 border border-red-800/50 shadow-md flex items-center justify-center gap-2";
    if (btnPos) btnPos.className = "py-3 rounded-xl text-xs font-black transition-all text-zinc-400 hover:text-white flex items-center justify-center gap-2";
  }
  renderTasks();
}

function renderTasks() {
  const container = document.getElementById('tasksGrid');
  if (!container) return;

  const filtered = state.actions.filter(a => a.type === state.currentTaskFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<p class="col-span-2 text-center text-xs text-zinc-500 py-6">No hay tareas creadas en esta sección.</p>`;
    return;
  }

  container.innerHTML = filtered.map(action => {
    const isPos = action.type === 'positive';
    const pointsClass = isPos ? 'text-emerald-400' : 'text-red-400';
    const ptsText = isPos ? `+${action.points}` : `${action.points}`;

    return `
      <div onclick="applyAction(${action.id})" class="bg-zinc-900 hover:bg-zinc-800/90 p-4 rounded-[1.75rem] border border-zinc-800/80 cursor-pointer transition active:scale-95 flex flex-col justify-between space-y-4 shadow-md">
        <div class="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-2xl border border-zinc-800/50 shadow-inner">
          ${action.icon || (isPos ? '⭐' : '⚠️')}
        </div>
        <div>
          <h4 class="font-bold text-xs text-zinc-100 leading-snug">${action.title}</h4>
          <p class="text-xs font-black ${pointsClass} mt-1">${ptsText} puntos</p>
        </div>
      </div>
    `;
  }).join('');
}

async function applyAction(actionId) {
  const activeUser = state.users[state.currentUser];

  if (activeUser && activeUser.role !== 'padre') {
    const pinEntered = prompt("🔒 Introduce el PIN parental para confirmar la tarea:");
    if (pinEntered !== state.parentPin) {
      if (pinEntered !== null) alert("PIN incorrecto. No se asignaron puntos.");
      return;
    }
  }

  const action = state.actions.find(a => a.id === actionId);
  if (!action) return;

  const targetChildId = prompt("¿A quién quieres aplicar esta tarea?\nEscribe '1' para Joan o '2' para Martina:");
  let child = null;

  if (targetChildId === '1') child = state.users['joan'];
  else if (targetChildId === '2') child = state.users['martina'];
  else {
    if (targetChildId !== null) alert("Opción no válida.");
    return;
  }

  if (child) {
    child.points += action.points;
    if (child.points < 0) child.points = 0;

    child.totalCompleted = (child.totalCompleted || 0) + 1;
    if (action.type === 'positive') {
      if (child.streakType === 'positive') child.streakDays += 1;
      else { child.streakType = 'positive'; child.streakDays = 1; }
    } else {
      if (child.streakType === 'negative') child.streakDays += 1;
      else { child.streakType = 'negative'; child.streakDays = 1; }
    }

    const performerName = activeUser ? activeUser.name : 'Padre/Madre';
    const log = `${performerName} registró para ${child.name}: ${action.title} (${action.points > 0 ? '+' : ''}${action.points} pts)`;
    state.history.unshift(log);

    await saveLocalStorage();
    renderApp();
  }
}

function updateActivityLog() {
  const container = document.getElementById('activityList');
  const countEl = document.getElementById('activityCount');
  if (!container) return;

  if (countEl) countEl.innerText = state.history.length;

  if (state.history.length === 0) {
    container.innerHTML = '<p class="text-xs text-zinc-500 py-2">Aún no hay movimientos registrados.</p>';
    return;
  }

  container.innerHTML = state.history.slice(0, 5).map(item => `
    <div class="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 text-left text-zinc-300 font-medium text-xs">
      ${item}
    </div>
  `).join('');
}

function renderRewards() {
  const container = document.getElementById('rewardsGrid');
  if (!container) return;

  const user = state.users[state.currentUser];

  container.innerHTML = state.rewards.map(reward => {
    const canAfford = user.points >= reward.cost;

    return `
      <div class="bg-zinc-900 p-4 rounded-[1.75rem] border border-zinc-800/80 flex flex-col justify-between space-y-3 text-center shadow-md">
        <div class="text-4xl my-1">${reward.icon || '🎁'}</div>
        <div>
          <p class="font-bold text-xs text-zinc-100">${reward.title}</p>
          <p class="text-xs font-black text-amber-400 mt-0.5">${reward.cost} ⭐</p>
        </div>
        <button 
          onclick="claimReward(${reward.id})"
          ${!canAfford ? 'disabled' : ''}
          class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-600/20">
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

    let dateStr = "";
    try {
      dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      dateStr = new Date().toISOString().slice(0, 10);
    }

    state.redemptions.unshift({
      id: Date.now(),
      userName: user.name,
      userAvatar: user.avatar,
      rewardTitle: reward.title,
      rewardIcon: reward.icon || '🎁',
      cost: reward.cost,
      date: dateStr
    });

    state.history.unshift(`${user.name} canjeó: ${reward.title} (-${reward.cost} pts)`);

    await saveLocalStorage();
    renderApp();
  }
}

function unlockManager() {
  const pinInput = document.getElementById('pinInput');
  if (!pinInput) return;

  if (pinInput.value === state.parentPin) {
    isManagerUnlocked = true;
    document.getElementById('pinLockScreen')?.classList.add('hidden');
    document.getElementById('pinUnlockedContent')?.classList.remove('hidden');
    pinInput.value = '';
    renderManagerPanel();
  } else {
    alert("PIN incorrecto.");
    pinInput.value = '';
  }
}

function lockManager() {
  isManagerUnlocked = false;
  document.getElementById('pinLockScreen')?.classList.remove('hidden');
  document.getElementById('pinUnlockedContent')?.classList.add('hidden');
}

function changePinPrompt() {
  const current = prompt("Introduce el PIN actual:");
  if (current === state.parentPin) {
    const newPin = prompt("Introduce el nuevo PIN de 4 dígitos:");
    if (newPin && newPin.length === 4 && !isNaN(newPin)) {
      state.parentPin = newPin;
      saveLocalStorage();
      alert("¡PIN actualizado con éxito!");
    } else {
      alert("El PIN debe ser un número de exactamente 4 dígitos.");
    }
  } else if (current !== null) {
    alert("PIN incorrecto.");
  }
}

function renderManagerPanel() {
  if (!isManagerUnlocked) return;

  const redemptionsContainer = document.getElementById('redemptionsList');
  const redemptionsCount = document.getElementById('redemptionsCount');
  if (redemptionsContainer) {
    if (redemptionsCount) redemptionsCount.innerText = state.redemptions.length;

    if (state.redemptions.length === 0) {
      redemptionsContainer.innerHTML = `<p class="text-center text-xs text-zinc-500 py-3">No hay canjes registrados.</p>`;
    } else {
      redemptionsContainer.innerHTML = state.redemptions.map(item => `
        <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
              ${renderAvatarHtml(item.userAvatar, "text-sm")}
            </div>
            <div>
              <p class="font-bold text-xs text-white">${item.userName} <span class="text-zinc-400 font-normal">canjeó</span> ${item.rewardIcon} ${item.rewardTitle}</p>
              <p class="text-[10px] text-zinc-500">${item.date}</p>
            </div>
          </div>
          <span class="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">-${item.cost} ⭐</span>
        </div>
      `).join('');
    }
  }

  const avatarContainer = document.getElementById('avatarCustomizerList');
  if (avatarContainer) {
    avatarContainer.innerHTML = Object.values(state.users).map(u => `
      <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
            ${renderAvatarHtml(u.avatar, "text-xl")}
          </div>
          <span class="font-bold text-xs text-white">${u.name}</span>
        </div>
        <button onclick="changeUserAvatar('${u.id}')" class="text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-xl font-bold transition">
          Cambiar Foto / Emoji
        </button>
      </div>
    `).join('');
  }

  const pointsContainer = document.getElementById('manualPointsControl');
  if (pointsContainer) {
    const kids = Object.values(state.users).filter(u => u.role === 'hijo');
    pointsContainer.innerHTML = kids.map(kid => `
      <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
            ${renderAvatarHtml(kid.avatar, "text-base")}
          </div>
          <div>
            <p class="font-bold text-xs text-white">${kid.name}</p>
            <span class="text-[11px] text-amber-400 font-bold">${kid.points} pts</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="modifyPoints('${kid.id}', -10)" class="bg-zinc-900 hover:bg-zinc-800 text-red-400 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-zinc-800">-10</button>
          <button onclick="modifyPoints('${kid.id}', 10)" class="bg-zinc-900 hover:bg-zinc-800 text-emerald-400 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-zinc-800">+10</button>
        </div>
      </div>
    `).join('');
  }

  const rewardsContainer = document.getElementById('manageRewardsList');
  if (rewardsContainer) {
    rewardsContainer.innerHTML = state.rewards.map(r => `
      <div class="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex justify-between items-center gap-2">
        <div class="flex items-center gap-2 truncate">
          <span class="text-xl bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">${r.icon || '🎁'}</span>
          <div class="truncate">
            <p class="text-xs text-zinc-100 font-bold truncate">${r.title}</p>
            <p class="text-[10px] text-amber-400 font-bold">${r.cost} ⭐</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="editReward(${r.id})" class="text-[11px] text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20 font-bold">
            ✏️ Editar
          </button>
          <button onclick="deleteReward(${r.id})" class="text-[11px] text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 font-bold">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  const actionsContainer = document.getElementById('manageActionsList');
  if (actionsContainer) {
    actionsContainer.innerHTML = state.actions.map(a => `
      <div class="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex justify-between items-center gap-2">
        <div class="flex items-center gap-2 truncate">
          <span class="text-xl bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">${a.icon || '📌'}</span>
          <div class="truncate">
            <p class="text-xs text-zinc-100 font-bold truncate">${a.title}</p>
            <p class="text-[10px] ${a.points > 0 ? 'text-emerald-400' : 'text-red-400'} font-bold">${a.points > 0 ? '+' : ''}${a.points} pts</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="editAction(${a.id})" class="text-[11px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg border border-blue-500/20 font-bold">
            ✏️ Editar
          </button>
          <button onclick="deleteAction(${a.id})" class="text-[11px] text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 font-bold">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }
}

async function editReward(rewardId) {
  const reward = state.rewards.find(r => r.id === rewardId);
  if (!reward) return;

  const newTitle = prompt("Nuevo nombre del premio:", reward.title);
  if (newTitle === null || newTitle.trim() === "") return;

  const newCostStr = prompt("Nuevos puntos necesarios:", reward.cost);
  const parsedCost = parseInt(newCostStr);
  if (newCostStr === null || isNaN(parsedCost)) return;

  const newIcon = prompt("Nuevo emoji:", reward.icon || '🎁');

  reward.title = newTitle.trim();
  reward.cost = Math.abs(parsedCost);
  if (newIcon && newIcon.trim() !== "") reward.icon = newIcon.trim();

  await saveLocalStorage();
  renderApp();
}

async function editAction(actionId) {
  const action = state.actions.find(a => a.id === actionId);
  if (!action) return;

  const newTitle = prompt("Nuevo nombre de la tarea/penalización:", action.title);
  if (newTitle === null || newTitle.trim() === "") return;

  const newPointsStr = prompt("Nuevos puntos (usa signo - si es penalización):", action.points);
  const parsedPoints = parseInt(newPointsStr);
  if (newPointsStr === null || isNaN(parsedPoints)) return;

  const newIcon = prompt("Nuevo emoji:", action.icon || '⭐');

  action.title = newTitle.trim();
  action.points = parsedPoints;
  action.type = parsedPoints < 0 ? 'negative' : 'positive';
  if (newIcon && newIcon.trim() !== "") action.icon = newIcon.trim();

  await saveLocalStorage();
  renderApp();
}

async function addNewReward() {
  const titleEl = document.getElementById('newRewardTitle');
  const iconEl = document.getElementById('newRewardIcon');
  const costEl = document.getElementById('newRewardCost');

  const title = titleEl ? titleEl.value.trim() : '';
  const icon = (iconEl && iconEl.value.trim()) || '🎁';
  const cost = parseInt(costEl ? costEl.value : '');

  if (!title || isNaN(cost) || cost <= 0) {
    alert("Por favor, introduce un nombre y una cantidad de puntos válida.");
    return;
  }

  state.rewards.push({
    id: Date.now(),
    title,
    icon,
    cost
  });

  if (titleEl) titleEl.value = '';
  if (iconEl) iconEl.value = '';
  if (costEl) costEl.value = '';

  await saveLocalStorage();
  renderApp();
}

async function deleteReward(id) {
  if (confirm("¿Seguro que deseas eliminar este premio?")) {
    state.rewards = state.rewards.filter(r => r.id !== id);
    await saveLocalStorage();
    renderApp();
  }
}

async function changeUserAvatar(userId) {
  const user = state.users[userId];
  if (!user) return;

  const input = prompt(`Cambiar avatar de ${user.name}.\nPuedes escribir un emoji o pegar una URL de foto:`, user.avatar);
  
  if (input !== null && input.trim() !== '') {
    user.avatar = input.trim();
    await saveLocalStorage();
    renderApp();
  }
}

async function modifyPoints(userId, delta) {
  const user = state.users[userId];
  if (user) {
    user.points += delta;
    if (user.points < 0) user.points = 0;
    await saveLocalStorage();
    renderApp();
  }
}

async function deleteAction(id) {
  if (confirm("¿Seguro que deseas eliminar esta tarea?")) {
    state.actions = state.actions.filter(a => a.id !== id);
    await saveLocalStorage();
    renderApp();
  }
}

async function addNewAction() {
  const titleEl = document.getElementById('newActionTitle');
  const iconEl = document.getElementById('newActionIcon');
  const pointsEl = document.getElementById('newActionPoints');
  const typeEl = document.getElementById('newActionType');

  const title = titleEl ? titleEl.value.trim() : '';
  const icon = (iconEl && iconEl.value.trim()) || '⭐';
  const points = parseInt(pointsEl ? pointsEl.value : '');
  const type = typeEl ? typeEl.value : 'positive';

  if (!title || isNaN(points)) {
    alert("Por favor, introduce un título y los puntos válidos.");
    return;
  }

  const finalPoints = type === 'negative' ? -Math.abs(points) : Math.abs(points);

  state.actions.unshift({
    id: Date.now(),
    title,
    points: finalPoints,
    type,
    icon
  });

  if (titleEl) titleEl.value = '';
  if (iconEl) iconEl.value = '';
  if (pointsEl) pointsEl.value = '';

  await saveLocalStorage();
  renderApp();
}

async function resetMonthlyPoints() {
  if (confirm("¿Deseas reiniciar la puntuación mensual y rachas a 0 para todos los miembros?")) {
    Object.keys(state.users).forEach(k => {
      state.users[k].points = 0;
      state.users[k].streakDays = 0;
      state.users[k].streakType = 'none';
      state.users[k].totalCompleted = 0;
    });
    state.history = [];
    state.redemptions = [];
    await saveLocalStorage();
    renderApp();
  }
}

window.addEventListener('focus', () => {
  fetchCloudData();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    fetchCloudData();
  }
});

async function startApp() {
  loadLocalStorage();
  initUserSelect();
  setActiveTab('home');
  renderApp();
  
  await fetchCloudData();
  setupRealtimeListener();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
