const SUPABASE_URL = 'https://dwfpellkjknjoownvra.supabase.co';
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZnBlbGxramtuanNvb3dudnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQwMDYsImV4cCI6MjEwMDcxMDAwNn0.x75ND4DNtptpxVtf-tK2FNr_33zxhk5SF7_-sAb8-jY';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

let parentPin = "1234";
let isManagerUnlocked = false;

let state = {
  currentUser: 'joan',
  currentTaskFilter: 'positive',
  users: {
    'joan': { id: 'joan', name: 'Joan', role: 'hijo', avatar: '👦', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null },
    'martina': { id: 'martina', name: 'Martina', role: 'hijo', avatar: '👧', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null },
    'papa': { id: 'papa', name: 'Papá', role: 'padre', avatar: '🧔', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null },
    'mama': { id: 'mama', name: 'Mamá', role: 'padre', avatar: '👩', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null }
  },
  actions: [
    { id: 1, title: 'Hacer caso a la primera', points: 25, type: 'positive', icon: '✋' },
    { id: 2, title: 'Limpiar a los animales', points: 25, type: 'positive', icon: '🦜' },
    { id: 3, title: 'Limpiar y ordenar la habitación', points: 30, type: 'positive', icon: '🏡' },
    { id: 4, title: 'Tirar la basura', points: 10, type: 'positive', icon: '🗑️' },
    { id: 5, title: 'Ropa recogida', points: 15, type: 'positive', icon: '👕' },
    { id: 6, title: 'Poner la mesa', points: 15, type: 'positive', icon: '🍽️' },
    { id: 7, title: 'Deberes hechos', points: 30, type: 'positive', icon: '📖' },
    { id: 8, title: 'Pasar la aspiradora', points: 20, type: 'positive', icon: '💨' },
    { id: 9, title: 'Regar plantas', points: 10, type: 'positive', icon: '💧' },
    { id: 10, title: 'No recoger el cuarto ni limpiarlo', points: -30, type: 'negative', icon: '🏡' },
    { id: 11, title: 'No hacer caso a la primera', points: -25, type: 'negative', icon: '✋' },
    { id: 12, title: 'Dejó las luces encendidas', points: -5, type: 'negative', icon: '⚡' },
    { id: 13, title: 'No tiró de la cadena', points: -10, type: 'negative', icon: '⚠️' },
    { id: 14, title: 'Llegó tarde a cenar', points: -15, type: 'negative', icon: '⏰' },
    { id: 15, title: 'Gritar', points: -20, type: 'negative', icon: '🔊' },
    { id: 16, title: 'Demasiada TV', points: -15, type: 'negative', icon: '📺' },
    { id: 17, title: 'No limpiar a los animales', points: -25, type: 'negative', icon: '🦜' },
    { id: 18, title: 'No pasar la aspiradora', points: -20, type: 'negative', icon: '💨' },
    { id: 19, title: 'No hacer los deberes', points: -30, type: 'negative', icon: '📖' },
    { id: 20, title: 'No poner la mesa', points: -15, type: 'negative', icon: '🍽️' },
    { id: 21, title: 'No recoger la ropa', points: -15, type: 'negative', icon: '👕' },
    { id: 22, title: 'No tirar la basura', points: -10, type: 'negative', icon: '🗑️' }
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

// Cargar estado local guardado
function loadLocalStorage() {
  const savedState = localStorage.getItem('family_points_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed.users) state.users = { ...state.users, ...parsed.users };
      if (parsed.actions) state.actions = parsed.actions;
      if (parsed.rewards) state.rewards = parsed.rewards;
      if (parsed.redemptions) state.redemptions = parsed.redemptions;
      if (parsed.history) state.history = parsed.history;
    } catch (e) {
      console.error("Error al leer localStorage", e);
    }
  }
}

// Guardar en almacenamiento local
function saveLocalStorage() {
  localStorage.setItem('family_points_state', JSON.stringify({
    users: state.users,
    actions: state.actions,
    rewards: state.rewards,
    redemptions: state.redemptions,
    history: state.history
  }));
}

// Sincronizar desde la nube (Supabase)
async function fetchCloudData() {
  if (!supabaseClient) return;
  try {
    const { data: remoteUsers, error } = await supabaseClient.from('users').select('*');
    if (!error && remoteUsers && remoteUsers.length > 0) {
      remoteUsers.forEach(rUser => {
        if (state.users[rUser.id]) {
          state.users[rUser.id].points = rUser.points ?? state.users[rUser.id].points;
          if (rUser.avatar) state.users[rUser.id].avatar = rUser.avatar;
          if (rUser.name) state.users[rUser.id].name = rUser.name;
          if (rUser.streak_type) state.users[rUser.id].streakType = rUser.streak_type;
          if (rUser.streak_days) state.users[rUser.id].streakDays = rUser.streak_days;
          if (rUser.total_completed) state.users[rUser.id].totalCompleted = rUser.total_completed;
        }
      });
      saveLocalStorage();
      renderApp();
    }
  } catch (err) {
    console.warn("Modo offline o error al consultar Supabase", err);
  }
}

// Helper para sincronizar usuario en Supabase
async function syncUserToCloud(user) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('users').upsert({
      id: user.id,
      points: user.points,
      name: user.name,
      avatar: user.avatar,
      streak_type: user.streakType,
      streak_days: user.streakDays,
      total_completed: user.totalCompleted
    });
  } catch (err) {
    console.warn("Error al guardar en Supabase", err);
  }
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
  if (select) {
    state.currentUser = select.value;
    renderApp();
  }
}

function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

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
  const action = state.actions.find(a => a.id === actionId);
  const user = state.users[state.currentUser];

  if (action && user) {
    user.points += action.points;
    if (user.points < 0) user.points = 0;

    user.totalCompleted = (user.totalCompleted || 0) + 1;
    if (action.type === 'positive') {
      if (user.streakType === 'positive') user.streakDays += 1;
      else { user.streakType = 'positive'; user.streakDays = 1; }
    } else {
      if (user.streakType === 'negative') user.streakDays += 1;
      else { user.streakType = 'negative'; user.streakDays = 1; }
    }

    const log = `${user.name}: ${action.title} (${action.points > 0 ? '+' : ''}${action.points} pts)`;
    state.history.unshift(log);

    saveLocalStorage();
    renderApp();
    await syncUserToCloud(user);
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

    saveLocalStorage();
    renderApp();
    await syncUserToCloud(user);
  }
}

function unlockManager() {
  const pinInput = document.getElementById('pinInput');
  if (!pinInput) return;

  if (pinInput.value === parentPin) {
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
  if (current === parentPin) {
    const newPin = prompt("Introduce el nuevo PIN de 4 dígitos:");
    if (newPin && newPin.length === 4 && !isNaN(newPin)) {
      parentPin = newPin;
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

function editReward(rewardId) {
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

  saveLocalStorage();
  renderApp();
}

function editAction(actionId) {
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

  saveLocalStorage();
  renderApp();
}

function addNewReward() {
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

  saveLocalStorage();
  renderApp();
}

function deleteReward(id) {
  if (confirm("¿Seguro que deseas eliminar este premio?")) {
    state.rewards = state.rewards.filter(r => r.id !== id);
    saveLocalStorage();
    renderApp();
  }
}

async function changeUserAvatar(userId) {
  const user = state.users[userId];
  if (!user) return;

  const input = prompt(`Cambiar avatar de ${user.name}.\nPuedes escribir un emoji o pegar una URL de foto:`, user.avatar);
  
  if (input !== null && input.trim() !== '') {
    user.avatar = input.trim();
    saveLocalStorage();
    initUserSelect();
    renderApp();
    await syncUserToCloud(user);
  }
}

async function modifyPoints(userId, delta) {
  const user = state.users[userId];
  if (user) {
    user.points += delta;
    if (user.points < 0) user.points = 0;
    saveLocalStorage();
    renderApp();
    await syncUserToCloud(user);
  }
}

function deleteAction(id) {
  if (confirm("¿Seguro que deseas eliminar esta tarea?")) {
    state.actions = state.actions.filter(a => a.id !== id);
    saveLocalStorage();
    renderApp();
  }
}

function addNewAction() {
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

  saveLocalStorage();
  renderApp();
}

function resetMonthlyPoints() {
  if (confirm("¿Deseas reiniciar la puntuación mensual y rachas a 0 para todos los miembros?")) {
    Object.keys(state.users).forEach(k => {
      state.users[k].points = 0;
      state.users[k].streakDays = 0;
      state.users[k].streakType = 'none';
      state.users[k].totalCompleted = 0;
      syncUserToCloud(state.users[k]);
    });
    state.history = [];
    state.redemptions = [];
    saveLocalStorage();
    renderApp();
  }
}

async function startApp() {
  loadLocalStorage();
  initUserSelect();
  renderApp();
  await fetchCloudData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
