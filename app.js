// --- CONFIGURACIÓN Y CLIENTE SUPABASE ---
const SUPABASE_URL = 'https://dwfpellkjknjsoownvra.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dCD5nodKSRF9ZIjNDU6GPw_15k2xcxv';

function getSupabaseClient() {
  if (window.supabaseClient) return window.supabaseClient;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return window.supabaseClient;
  }
  return null;
}

// --- VERIFICACIÓN Y AUTENTICACIÓN AUTOMÁTICA DE SESIÓN (SOLUCIÓN ERROR 401) ---
async function asegurarSesionActiva() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    // Comprobamos si ya hay una sesión guardada y activa
    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session) {
      console.warn("No hay sesión activa detectada. Iniciando sesión anónima automática...");
      // Como la app no tiene login manual, autenticamos de forma transparente al cliente
      const { error: signInError } = await client.auth.signInAnonymously();
      if (signInError) {
        console.error("Error al iniciar sesión anónima en Supabase:", signInError.message);
      } else {
        console.log("Sesión anónima establecida correctamente en este dispositivo.");
      }
    } else {
      console.log("Sesión activa verificada para el usuario:", session.user.id);
    }
  } catch (err) {
    console.error("Excepción comprobando la sesión:", err);
  }
}

let isManagerUnlocked = false;

// --- FRASES MOTIVACIONALES (ANUNCIADOR ARCADE) ---
const MOTIVATIONAL_QUOTES = [
  "¡EN RACHA IMPARABLE! 🔥",
  "¡TRABAJO DE NIVEL LEYENDA! 👑",
  "¡ENERGÍA AL MÁXIMO! ⚡",
  "¡PUNTOS EXTRA CONSEGUIDOS! 🎯",
  "¡IMPRESIONANTE ESFUERZO! 🚀",
  "¡ERES UN SUPERHÉROE DEL HOGAR! 🌟"
];

// --- SISTEMA DE LOGROS (VIDEOJUEGOS) ---
const ACHIEVEMENTS = [
  { id: 'first_task', title: 'Primeros Pasos', desc: 'Completa tu primera tarea', icon: '🥉', check: (u) => u.totalCompleted >= 1 },
  { id: 'tasks_10', title: 'Ayudante Frecuente', desc: 'Completa 10 tareas', icon: '🥈', check: (u) => u.totalCompleted >= 10 },
  { id: 'tasks_50', title: 'Máquina de Ayudar', desc: 'Completa 50 tareas', icon: '🥇', check: (u) => u.totalCompleted >= 50 },
  { id: 'streak_3', title: 'Racha de Fuego', desc: '3 días de racha positiva', icon: '🔥', check: (u) => u.streakType === 'positive' && u.streakDays >= 3 },
  { id: 'streak_7', title: 'Semana Perfecta', desc: '7 días de racha positiva', icon: '🌟', check: (u) => u.streakType === 'positive' && u.streakDays >= 7 },
  { id: 'points_200', title: 'Ahorrador Novato', desc: 'Acumula 200 puntos', icon: '💸', check: (u) => u.points >= 200 },
  { id: 'points_500', title: 'Ahorrador Experto', desc: 'Acumula 500 puntos', icon: '💰', check: (u) => u.points >= 500 }
];

let state = {
  currentUser: 'joan',
  previousUser: 'joan',
  parentPin: '1234',
  currentTaskFilter: 'positive',
  lootboxCost: 30,
  doubleXpActive: false,
  dailyQuest: { title: 'Haz 2 tareas hoy', rewardPts: 15, date: null, completedBy: [] },
  familyGoal: { title: '👾 El Dragón del Desorden (Meta Familiar)', targetPoints: 500 },
  users: {
    'joan': { id: 'joan', name: 'Joan', role: 'hijo', avatar: '👦', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null, lastRouletteDate: null, unlockedAchievements: [] },
    'martina': { id: 'martina', name: 'Martina', role: 'hijo', avatar: '👧', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null, lastRouletteDate: null, unlockedAchievements: [] },
    'papa': { id: 'papa', name: 'Papá', role: 'padre', avatar: '🐍', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null, lastRouletteDate: null, unlockedAchievements: [] },
    'mama': { id: 'mama', name: 'Mamá', role: 'padre', avatar: '👩', points: 0, streakType: 'none', streakDays: 0, totalCompleted: 0, lastActivityDate: null, lastRouletteDate: null, unlockedAchievements: [] }
  },
  actions: [
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
    { id: 118, title: 'No tirar la basura', points: -10, type: 'negative', icon: '🗑️' },
    { id: 119, title: 'Ir descalzo', points: -15, type: 'negative', icon: '🦶' }
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

// --- EFECTOS DE SONIDO Y VIBRACIÓN HÁPTICA ---
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'positive') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'negative') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'reward' || type === 'achievement') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      if(type === 'achievement') osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (type==='achievement'?0.6:0.45));
      osc.start();
      osc.stop(ctx.currentTime + (type==='achievement'?0.6:0.45));
    }
  } catch (e) {}
}

function triggerHaptic() {
  if ('vibrate' in navigator) {
    try { navigator.vibrate([40, 30, 40]); } catch (e) {}
  }
}

// --- SISTEMA DE NIVELES Y XP ---
function getUserLevel(totalCompleted) {
  const completed = totalCompleted || 0;
  const level = Math.floor(completed / 5) + 1;
  const xpPercent = (completed % 5) * 20;
  let rankName = 'Principiante 🐣';
  if (level >= 10) rankName = 'Maestro Supremo 👑';
  else if (level >= 7) rankName = 'Superhéroe del Hogar ⚡';
  else if (level >= 5) rankName = 'Experto Pro 🚀';
  else if (level >= 3) rankName = 'Ayudante Estrella ⭐';
  
  return { level, xpPercent, rankName };
}

// --- ANIMACIONES (PUNTOS, LOGROS Y FRASES) ---
function showPointsAnimation(points, childName, title) {
  const isPositive = points > 0;
  playSound(isPositive ? 'positive' : 'negative');
  triggerHaptic();

  const overlay = document.createElement('div');
  overlay.className = "fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4 transition-all duration-500";
  
  const randomQuote = isPositive ? MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)] : '¡CUIDADO! PENALIZACIÓN';

  const content = document.createElement('div');
  content.className = `transform scale-50 opacity-0 transition-all duration-300 ease-out p-6 rounded-3xl border text-center shadow-2xl backdrop-blur-md flex flex-col items-center justify-center gap-2 ${
    isPositive 
      ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20' 
      : 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-500/20'
  }`;

  content.innerHTML = `
    <div class="text-xs font-black tracking-widest text-amber-300 animate-pulse">${randomQuote}</div>
    <div class="text-5xl animate-bounce mb-1">${isPositive ? '🎉' : '⚠️'}</div>
    <div class="text-xs font-bold uppercase tracking-wider text-zinc-400">${childName}</div>
    <div class="text-4xl font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}">${isPositive ? '+' : ''}${points} PTS</div>
    <div class="text-xs font-medium text-zinc-300 max-w-[200px] truncate">${title}</div>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    content.classList.remove('scale-50', 'opacity-0');
    content.classList.add('scale-100', 'opacity-100');
  });

  setTimeout(() => {
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-75', 'opacity-0');
    setTimeout(() => overlay.remove(), 300);
  }, 2000);
}

function showAchievementToast(ach) {
  playSound('achievement');
  const toast = document.createElement('div');
  toast.className = "fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-yellow-200 transition-all duration-500 transform -translate-y-20 opacity-0";
  toast.innerHTML = `
    <div class="text-4xl animate-pulse">${ach.icon}</div>
    <div class="flex flex-col">
      <span class="text-[10px] font-black uppercase tracking-widest opacity-80">¡Logro Desbloqueado!</span>
      <span class="font-extrabold text-base leading-tight">${ach.title}</span>
    </div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('-translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-20', 'opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

function checkAchievements(user) {
  if (!user.unlockedAchievements) user.unlockedAchievements = [];
  let changed = false;
  
  ACHIEVEMENTS.forEach(ach => {
    if (!user.unlockedAchievements.includes(ach.id) && ach.check(user)) {
      user.unlockedAchievements.push(ach.id);
      changed = true;
      state.history.unshift(`🏆 ${user.name} desbloqueó el logro: ${ach.title}`);
      setTimeout(() => showAchievementToast(ach), 500);
    }
  });
  return changed;
}

// --- SINCRONIZACIÓN Y GUARDADO ---
function loadLocalStorage() {
  try {
    const savedState = localStorage.getItem('family_points_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      mergeStateData(parsed);
    }
  } catch (e) {
    console.warn("Aviso LocalStorage:", e);
  }
}

async function saveLocalStorage() {
  try {
    localStorage.setItem('family_points_state', JSON.stringify(state));
  } catch (e) {
    console.warn("Aviso guardando LocalStorage:", e);
  }
  await syncFullStateToCloud();
}

function mergeStateData(remote) {
  if (remote.lootboxCost !== undefined) state.lootboxCost = remote.lootboxCost;
  if (remote.doubleXpActive !== undefined) state.doubleXpActive = remote.doubleXpActive;
  if (remote.dailyQuest) state.dailyQuest = remote.dailyQuest;
  if (remote.parentPin) state.parentPin = remote.parentPin;
  if (remote.actions && remote.actions.length > 0) state.actions = remote.actions;
  if (remote.rewards && remote.rewards.length > 0) state.rewards = remote.rewards;
  if (remote.redemptions) state.redemptions = remote.redemptions;
  if (remote.history) state.history = remote.history;
  if (remote.familyGoal) state.familyGoal = remote.familyGoal;
  
  if (remote.users) {
    for (const key in remote.users) {
      state.users[key] = {
        ...state.users[key],
        ...remote.users[key],
        unlockedAchievements: remote.users[key].unlockedAchievements || state.users[key].unlockedAchievements || [],
        lastRouletteDate: remote.users[key].lastRouletteDate || state.users[key].lastRouletteDate || null
      };
    }
  }
}

async function fetchCloudData() {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { data, error } = await client
      .from('app_state')
      .select('data')
      .eq('id', 'main_config')
      .maybeSingle();

    if (error) return;

    if (data && data.data && Object.keys(data.data).length > 0) {
      mergeStateData(data.data);
      try { localStorage.setItem('family_points_state', JSON.stringify(state)); } catch (err) {}
      renderApp();
    } else {
      await syncFullStateToCloud();
    }
  } catch (err) {}
}

async function syncFullStateToCloud() {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const payload = {
      users: state.users,
      parentPin: state.parentPin,
      actions: state.actions,
      rewards: state.rewards,
      redemptions: state.redemptions,
      history: state.history,
      familyGoal: state.familyGoal,
      lootboxCost: state.lootboxCost,
      doubleXpActive: state.doubleXpActive,
      dailyQuest: state.dailyQuest
    };
    await client.from('app_state').upsert({ id: 'main_config', data: payload, updated_at: new Date().toISOString() });
  } catch (err) {}
}

function setupRealtimeListener() {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    client
      .channel('public:app_state')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_state' }, payload => {
        if (payload.new && payload.new.data) {
          mergeStateData(payload.new.data);
          try { localStorage.setItem('family_points_state', JSON.stringify(state)); } catch (err) {}
          renderApp();
        }
      }).subscribe();
  } catch (e) {}
}

// --- UTILIDADES UI ---
function renderAvatarHtml(avatarStr, sizeClasses = "w-full h-full text-2xl") {
  if (!avatarStr) return `<span class="${sizeClasses} flex items-center justify-center">👤</span>`;
  if (avatarStr.startsWith('http://') || avatarStr.startsWith('https://') || avatarStr.startsWith('data:image')) {
    return `<img src="${avatarStr}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
  }
  return `<span class="${sizeClasses} flex items-center justify-center">${avatarStr}</span>`;
}

function setActiveTab(tab) {
  const tabs = ['home', 'tasks', 'rewards', 'minigames', 'manager', 'settings'];
  tabs.forEach(t => {
    const section = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (section) {
      section.classList.add('hidden');
      section.classList.remove('animate-fade-in');
    }
    if (navBtn) navBtn.className = "flex flex-col items-center py-1.5 text-zinc-500 hover:text-zinc-300 font-medium transition-all duration-200";
  });

  const targetSection = document.getElementById(`tab-${tab}`);
  const targetNav = document.getElementById(`nav-${tab}`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    targetSection.classList.add('animate-fade-in');
  }
  if (targetNav) targetNav.className = "flex flex-col items-center py-1.5 text-blue-500 font-bold scale-105 transition-all duration-200";
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

function handleUserSelectChange(selectElement) {
  if (!selectElement) return;
  const targetUserId = selectElement.value;
  const targetUser = state.users[targetUserId];

  if (targetUser && targetUser.role === 'padre') {
    const pinEntered = prompt(`Para acceder al perfil de ${targetUser.name} introduce el PIN parental:`);
    if (pinEntered === state.parentPin) {
      state.previousUser = targetUserId;
      state.currentUser = targetUserId;
    } else {
      if (pinEntered !== null) alert("PIN incorrecto. Acceso denegado.");
      selectElement.value = state.previousUser;
      return;
    }
  } else {
    state.previousUser = targetUserId;
    state.currentUser = targetUserId;
  }
  renderApp();
}

// --- LÓGICA DE RULETA SEMANAL ---
function canSpinRoulette(user) {
  if (user.role !== 'hijo') return false;
  if (!user.lastRouletteDate) return true;
  
  const lastDate = new Date(user.lastRouletteDate);
  const now = new Date();
  
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day + 1);
  
  return lastDate < monday;
}

async function spinRoulette() {
  const user = state.users[state.currentUser];
  if (!user || user.role !== 'hijo') return;
  if (!canSpinRoulette(user)) return alert("¡Ya has tirado la ruleta esta semana! Vuelve el lunes que viene.");

  const prizes = [10, 15, 20, 25, 50, 100];
  const wonPoints = prizes[Math.floor(Math.random() * prizes.length)];

  user.points += wonPoints;
  user.lastRouletteDate = new Date().toISOString();
  state.history.unshift(`🎡 ${user.name} giró la ruleta semanal y ganó +${wonPoints} pts`);

  playSound('reward');
  triggerHaptic();
  showPointsAnimation(wonPoints, user.name, "¡Premio de la Ruleta Semanal!");

  checkAchievements(user);
  await saveLocalStorage();
  renderApp();
}

// --- SECCIÓN DEDICADA A MINIJUEGOS ---
function renderMinigamesSection() {
  let container = document.getElementById('tab-minigames');
  if (!container) return;

  const user = state.users[state.currentUser];
  const lootCost = state.lootboxCost || 30;
  const rouletteAvailable = canSpinRoulette(user);

  container.innerHTML = `
    <div class="space-y-4 pb-20">
      <div class="bg-gradient-to-r from-purple-900/60 to-indigo-950 p-4 rounded-3xl border border-purple-500/30 text-center shadow-xl">
        <h2 class="text-lg font-black text-white flex items-center justify-center gap-2">
          <span>🎮</span> ZONA DE MINIJUEGOS <span>🎰</span>
        </h2>
        <p class="text-xs text-purple-200 mt-1">¡Juega, prueba tu suerte y consigue premios o puntos extra!</p>
        <div class="mt-2 inline-block bg-zinc-950/80 px-3 py-1 rounded-full border border-amber-500/30 text-amber-400 text-xs font-black">
          Tus Puntos: ${user ? user.points : 0} ⭐
        </div>
      </div>

      <!-- 1. LA RULETA SEMANAL -->
      <div class="bg-zinc-900 p-4 rounded-3xl border border-pink-500/30 shadow-lg flex flex-col items-center text-center">
        <div class="text-4xl mb-2 animate-spin-slow">🎡</div>
        <h3 class="text-sm font-black text-pink-300">Ruleta Semanal Gratuita</h3>
        <p class="text-[11px] text-zinc-400 mt-1">Gira una vez por semana gratis para conseguir puntos.</p>
        <button 
          onclick="spinRoulette()" 
          ${!rouletteAvailable ? 'disabled' : ''} 
          class="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-40 active:scale-95 transition">
          ${rouletteAvailable ? '¡Girar Ruleta Gratis! 🚀' : 'Ya tiraste esta semana ⏳'}
        </button>
      </div>

      <!-- 2. DADO DE LA SUERTE -->
      <div class="bg-zinc-900 p-4 rounded-3xl border border-blue-500/30 shadow-lg flex flex-col items-center text-center">
        <div class="text-4xl mb-2">🎲</div>
        <h3 class="text-sm font-black text-blue-300">Dado de la Suerte</h3>
        <p class="text-[11px] text-zinc-400 mt-1">Apuesta 5 puntos y lanza el dado. ¡Multiplica tus puntos según la cara que salga!</p>
        <button 
          onclick="playDiceRoll()" 
          class="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition">
          Lanzar Dado (5 ⭐)
        </button>
      </div>

      <!-- 3. COFRES MISTERIOSOS -->
      <div class="bg-zinc-900 p-4 rounded-3xl border border-emerald-500/30 shadow-lg flex flex-col items-center text-center">
        <div class="text-4xl mb-2">🧰</div>
        <h3 class="text-sm font-black text-emerald-300">Cofres Misteriosos</h3>
        <p class="text-[11px] text-zinc-400 mt-1">Por 15 puntos, elige 1 de los 3 cofres y descubre qué recompensa oculta contiene.</p>
        <div class="flex justify-center gap-3 mt-3 w-full">
          <button onclick="playTreasureChest(1)" class="flex-1 py-3 bg-zinc-950 hover:bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-2xl active:scale-90 transition">📦</button>
          <button onclick="playTreasureChest(2)" class="flex-1 py-3 bg-zinc-950 hover:bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-2xl active:scale-90 transition">🎁</button>
          <button onclick="playTreasureChest(3)" class="flex-1 py-3 bg-zinc-950 hover:bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-2xl active:scale-90 transition">🧰</button>
        </div>
      </div>

      <!-- 4. LA TORRE DE LA SUERTE -->
      <div class="bg-zinc-900 p-4 rounded-3xl border border-red-500/30 shadow-lg flex flex-col items-center text-center">
        <div class="text-4xl mb-2">🏰</div>
        <h3 class="text-sm font-black text-red-300">La Torre del Riesgo</h3>
        <p class="text-[11px] text-zinc-400 mt-1">Apuesta 10 puntos y sube escalones. ¡Cuanto más alto subas más puntos ganas, pero si sale la Calavera lo pierdes todo!</p>
        <button 
          onclick="openTowerGameModal()" 
          class="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition">
          Entrar a la Torre (10 ⭐)
        </button>
      </div>

      <!-- 5. CAJA SORPRESA MÁGICA VISUAL -->
      <div class="bg-zinc-900 p-4 rounded-3xl border border-amber-500/30 shadow-lg flex flex-col items-center text-center">
        <div class="text-4xl mb-2">🎁</div>
        <h3 class="text-sm font-black text-amber-300">Caja Sorpresa Mágica</h3>
        <p class="text-[11px] text-zinc-400 mt-1">¡Abre una caja mágica y consigue vales especiales o super botes de puntos!</p>
        <button 
          onclick="openLootboxModal()" 
          class="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition">
          Abrir Caja (${lootCost} ⭐)
        </button>
      </div>

      <!-- 6. RASCA Y GANA DORADO -->
      <div class="bg-zinc-900 p-4 rounded-3xl border border-yellow-500/30 shadow-lg flex flex-col items-center text-center">
        <div class="text-4xl mb-2">🎟️</div>
        <h3 class="text-sm font-black text-yellow-300">Rasca y Gana Dorado</h3>
        <p class="text-[11px] text-zinc-400 mt-1">Rascar una tarjeta por 10 puntos para ganar premios directos.</p>
        <div id="scratchCardArea" class="mt-3 w-full bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl p-3 cursor-pointer active:scale-95 transition-transform border border-yellow-200 shadow-md flex items-center justify-center min-h-[50px]" onclick="playScratchCard()">
          <span id="scratchText" class="text-zinc-950 font-black text-xs uppercase">¡Clic para rascar (10 ⭐)! 🪙</span>
        </div>
      </div>
    </div>
  `;
}

// --- FUNCIONES Y MODALES DE LOS MINIJUEGOS ---
let towerCurrentStep = 0;
let towerAccumulatedPoints = 0;

function openTowerGameModal() {
  const user = state.users[state.currentUser];
  if (!user || user.points < 10) return alert("¡Necesitas al menos 10 puntos para entrar a la Torre!");
  if (!confirm("¿Deseas apostar 10 puntos para escalar La Torre del Riesgo? 🏰")) return;

  user.points -= 10;
  towerCurrentStep = 0;
  towerAccumulatedPoints = 10;

  const modal = document.createElement('div');
  modal.id = 'towerModal';
  modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
  
  modal.innerHTML = `
    <div class="bg-zinc-900 border border-red-500/40 w-full max-w-sm rounded-3xl p-5 text-center flex flex-col items-center gap-4 shadow-2xl relative">
      <h3 class="text-lg font-black text-white flex items-center gap-2">🏰 La Torre del Riesgo</h3>
      <p class="text-xs text-zinc-400">Puntos acumulados: <span id="towerAcumPts" class="text-amber-400 font-extrabold text-sm">10 ⭐</span></p>

      <div class="w-full flex flex-col-reverse gap-2 my-2">
        <div id="step-3" class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-500 flex justify-between items-center"><span>Piso 3</span><span>50 ⭐</span></div>
        <div id="step-2" class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-500 flex justify-between items-center"><span>Piso 2</span><span>25 ⭐</span></div>
        <div id="step-1" class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-500 flex justify-between items-center"><span>Piso 1</span><span>15 ⭐</span></div>
      </div>

      <div id="towerStatusMsg" class="text-xs font-extrabold text-amber-300 min-h-[1.5rem]">¡Haz clic en 'Subir Piso' para arriesgarte!</div>

      <div class="flex gap-2 w-full mt-2">
        <button id="btnTowerClimb" onclick="climbTowerStep()" class="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-xs rounded-xl active:scale-95 shadow-lg">Subir Piso 🚀</button>
        <button id="btnTowerCashout" onclick="cashoutTower()" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl active:scale-95 shadow-lg">Plantarse 💰</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function climbTowerStep() {
  towerCurrentStep++;
  const isTrap = Math.random() < 0.35;
  const statusMsg = document.getElementById('towerStatusMsg');
  const btnClimb = document.getElementById('btnTowerClimb');
  const btnCash = document.getElementById('btnTowerCashout');

  if (isTrap) {
    playSound('negative');
    triggerHaptic();
    if (statusMsg) statusMsg.innerHTML = "💀 ¡OH NO! Has encontrado una trampa y perdiste los puntos apostados.";
    if (btnClimb) btnClimb.disabled = true;
    if (btnCash) btnCash.disabled = true;

    const currentEl = document.getElementById(`step-${towerCurrentStep}`);
    if (currentEl) currentEl.className = "p-3 bg-red-950/80 border-2 border-red-500 rounded-xl text-xs font-black text-red-200 flex justify-between items-center animate-bounce";

    state.history.unshift(`🏰 ${state.users[state.currentUser].name} cayó en la Torre del Riesgo en el Piso ${towerCurrentStep}`);
    await saveLocalStorage();

    setTimeout(() => {
      document.getElementById('towerModal')?.remove();
      renderApp();
    }, 2500);
  } else {
    playSound('positive');
    triggerHaptic();

    if (towerCurrentStep === 1) towerAccumulatedPoints = 15;
    else if (towerCurrentStep === 2) towerAccumulatedPoints = 25;
    else if (towerCurrentStep === 3) towerAccumulatedPoints = 50;

    const acumEl = document.getElementById('towerAcumPts');
    if (acumEl) acumEl.innerText = `${towerAccumulatedPoints} ⭐`;

    const currentEl = document.getElementById(`step-${towerCurrentStep}`);
    if (currentEl) currentEl.className = "p-3 bg-emerald-950/90 border-2 border-emerald-400 rounded-xl text-xs font-black text-emerald-200 flex justify-between items-center shadow-lg shadow-emerald-500/20";

    if (towerCurrentStep >= 3) {
      if (statusMsg) statusMsg.innerHTML = "👑 ¡HAS LLEGADO A LA CIMA DE LA TORRE!";
      if (btnClimb) btnClimb.classList.add('hidden');
    } else {
      if (statusMsg) statusMsg.innerHTML = `¡Piso ${towerCurrentStep} superado! ¿Deseas arriesgarte o plantarte?`;
    }
  }
}

async function cashoutTower() {
  const user = state.users[state.currentUser];
  user.points += towerAccumulatedPoints;

  playSound('reward');
  triggerHaptic();
  showPointsAnimation(towerAccumulatedPoints, user.name, "¡Recompensa de La Torre!");

  state.history.unshift(`🏰 ${user.name} se plantó en la Torre del Riesgo con +${towerAccumulatedPoints} pts`);
  
  checkAchievements(user);
  await saveLocalStorage();
  document.getElementById('towerModal')?.remove();
  renderApp();
}

async function playDiceRoll() {
  const user = state.users[state.currentUser];
  if (!user || user.points < 5) return alert("¡Necesitas al menos 5 puntos para tirar el dado!");
  if (!confirm("¿Deseas gastar 5 puntos para tirar el dado? 🎲")) return;

  user.points -= 5;
  const roll = Math.floor(Math.random() * 6) + 1;
  let wonPts = 0;

  if (roll === 6) wonPts = 30;
  else if (roll === 5) wonPts = 15;
  else if (roll === 4 || roll === 3) wonPts = 5;
  else wonPts = 0;

  if (wonPts > 0) user.points += wonPts;

  state.history.unshift(`🎲 ${user.name} tiró el dado, sacó un ${roll} y obtuvo +${wonPts} pts`);
  playSound(wonPts > 0 ? 'reward' : 'negative');
  triggerHaptic();

  alert(`🎲 ¡Has sacado un ${roll}!\n\n${wonPts > 0 ? `¡Has ganado +${wonPts} Puntos! 🎉` : '¡Sigue intentándolo! 😅'}`);
  checkAchievements(user);
  await saveLocalStorage();
  renderApp();
}

async function playTreasureChest(chestIndex) {
  const user = state.users[state.currentUser];
  if (!user || user.points < 15) return alert("¡Necesitas al menos 15 puntos para abrir un cofre!");
  if (!confirm(`¿Quieres abrir el Cofre #${chestIndex} por 15 puntos? 🧰`)) return;

  user.points -= 15;

  const rewardsList = [
    { name: "¡Ganaste +25 Puntos!", pts: 25 },
    { name: "¡Super Premio! +40 Puntos", pts: 40 },
    { name: "Vale por 30 min de juego", pts: 0 },
    { name: "Comodín: Elegir qué cenar", pts: 0 },
    { name: "¡El cofre estaba vacío!", pts: 0 }
  ];

  const won = rewardsList[Math.floor(Math.random() * rewardsList.length)];
  if (won.pts > 0) user.points += won.pts;

  state.history.unshift(`🧰 ${user.name} abrió el cofre #${chestIndex} y encontró: ${won.name}`);
  playSound('reward');
  triggerHaptic();

  alert(`🧰 ¡ABRISTE EL COFRE #${chestIndex}! 🧰\n\nPremio: ${won.name}`);
  checkAchievements(user);
  await saveLocalStorage();
  renderApp();
}

function openLootboxModal() {
  const user = state.users[state.currentUser];
  const cost = state.lootboxCost || 30;

  if (!user || user.points < cost) {
    alert(`¡Necesitas al menos ${cost} puntos para abrir la Caja Sorpresa!`);
    return;
  }
  if (!confirm(`¿Quieres gastar ${cost} puntos para abrir la Caja Sorpresa Mágica? 🎁`)) return;

  user.points -= cost;

  const prizes = [
    { name: "15 min extra de consola", icon: "🎮", pts: 0 },
    { name: "Elegir el postre hoy", icon: "🍦", pts: 0 },
    { name: "¡Super Bote! +50 Puntos", icon: "💰", pts: 50 },
    { name: "¡Bonus! +20 Puntos", icon: "⭐", pts: 20 },
    { name: "Vale 1 abrazo gigante", icon: "🤗", pts: 0 },
    { name: "Día libre de tirar la basura", icon: "🎉", pts: 0 }
  ];

  const won = prizes[Math.floor(Math.random() * prizes.length)];

  const modal = document.createElement('div');
  modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in";
  modal.innerHTML = `
    <div class="bg-zinc-900 border border-amber-500/40 w-full max-w-sm rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-2xl relative">
      <h3 class="text-lg font-black text-amber-400 uppercase tracking-wider">Caja Sorpresa Mágica</h3>
      
      <div id="boxAnim" class="text-7xl my-4 animate-bounce cursor-pointer">🎁</div>
      <div id="boxText" class="text-xs font-bold text-zinc-300">¡Haciendo magia para abrir tu caja...!</div>

      <button id="btnCloseLoot" onclick="this.closest('.fixed').remove()" class="hidden mt-2 py-2.5 px-6 bg-amber-500 text-zinc-950 font-black text-xs rounded-xl shadow-lg">
        ¡Guardar Premio!
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(async () => {
    const boxAnim = document.getElementById('boxAnim');
    const boxText = document.getElementById('boxText');
    const btnClose = document.getElementById('btnCloseLoot');

    if (boxAnim) {
      boxAnim.classList.remove('animate-bounce');
      boxAnim.innerHTML = won.icon;
      boxAnim.className = "text-8xl my-2 animate-pulse";
    }
    if (boxText) {
      boxText.innerHTML = `<span class="text-base font-black text-amber-300">${won.name}</span>`;
    }
    if (btnClose) btnClose.classList.remove('hidden');

    if (won.pts > 0) user.points += won.pts;

    state.history.unshift(`${user.name} abrió la Caja Sorpresa y ganó: ${won.name}`);
    playSound('reward');
    triggerHaptic();

    checkAchievements(user);
    await saveLocalStorage();
    renderApp();
  }, 1800);
}

function renderRouletteBanner() {
  const user = state.users[state.currentUser];
  let container = document.getElementById('rouletteBannerContainer');
  
  if (!container) {
    const homeTab = document.getElementById('tab-home');
    if (!homeTab) return;
    container = document.createElement('div');
    container.id = 'rouletteBannerContainer';
    const goalWidget = document.getElementById('familyGoalWidget');
    if (goalWidget) goalWidget.after(container);
    else homeTab.insertBefore(container, homeTab.firstChild);
  }

  container.innerHTML = `
    <div onclick="setActiveTab('minigames')" class="mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-3 rounded-[1.75rem] border border-pink-400/40 shadow-lg shadow-pink-500/20 flex items-center justify-between cursor-pointer active:scale-95 transition-all animate-pulse">
      <div class="flex items-center gap-3">
        <div class="text-3xl">🎮</div>
        <div>
          <h3 class="text-xs font-black text-white">¡Zona de MiniJuegos!</h3>
          <p class="text-[10px] text-pink-200 font-bold">Ruleta, Dados, Torre, Cofres y más</p>
        </div>
      </div>
      <span class="bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-xl">Jugar</span>
    </div>
  `;
}

function renderDoubleXpBanner() {
  let container = document.getElementById('doubleXpBanner');
  if (!container) {
    const homeTab = document.getElementById('tab-home');
    if (!homeTab) return;
    container = document.createElement('div');
    container.id = 'doubleXpBanner';
    homeTab.prepend(container);
  }

  if (state.doubleXpActive) {
    container.innerHTML = `
      <div class="mb-4 bg-gradient-to-r from-amber-500 via-red-500 to-pink-500 p-3 rounded-2xl border-2 border-yellow-300 shadow-xl flex items-center justify-between animate-bounce">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🔥</span>
          <div>
            <h4 class="text-xs font-black text-white uppercase tracking-wider">¡EVENTO DOBLE XP ACTIVADO!</h4>
            <p class="text-[10px] text-yellow-100 font-bold">¡Todas las tareas valen el DOBLE de puntos!</p>
          </div>
        </div>
        <span class="bg-black/30 text-yellow-300 text-xs font-black px-2.5 py-1 rounded-xl">x2 PTS</span>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }
}

function renderDailyQuestWidget() {
  let container = document.getElementById('dailyQuestWidget');
  if (!container) {
    const homeTab = document.getElementById('tab-home');
    if (!homeTab) return;
    container = document.createElement('div');
    container.id = 'dailyQuestWidget';
    const goalWidget = document.getElementById('familyGoalWidget');
    if (goalWidget) goalWidget.after(container);
    else homeTab.appendChild(container);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (!state.dailyQuest || state.dailyQuest.date !== todayStr) {
    state.dailyQuest = {
      title: 'Haz al menos 2 tareas hoy',
      rewardPts: 15,
      date: todayStr,
      completedBy: []
    };
  }

  const user = state.users[state.currentUser];
  const isDone = user && state.dailyQuest.completedBy.includes(user.id);

  container.className = "mb-4 bg-gradient-to-r from-amber-950/70 to-zinc-950 p-4 rounded-3xl border border-amber-500/30 shadow-lg";
  container.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="text-3xl">⚔️</div>
        <div>
          <span class="text-[9px] font-black uppercase text-amber-400 tracking-wider">Misión Diaria de Hoy</span>
          <h4 class="text-xs font-black text-white">${state.dailyQuest.title}</h4>
          <p class="text-[10px] text-zinc-400">Recompensa: <span class="text-amber-400 font-bold">+${state.dailyQuest.rewardPts} ⭐</span></p>
        </div>
      </div>
      <button 
        onclick="claimDailyQuest()"
        ${isDone || user.role !== 'hijo' ? 'disabled' : ''}
        class="py-2 px-3 rounded-xl text-xs font-extrabold ${isDone ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md active:scale-95 transition'}">
        ${isDone ? '¡Hecha! ✅' : 'Reclamar'}
      </button>
    </div>
  `;
}

async function claimDailyQuest() {
  const user = state.users[state.currentUser];
  if (!user || user.role !== 'hijo') return;
  if (state.dailyQuest.completedBy.includes(user.id)) return;

  user.points += state.dailyQuest.rewardPts;
  state.dailyQuest.completedBy.push(user.id);
  state.history.unshift(`⚔️ ${user.name} completó la Misión Diaria (+${state.dailyQuest.rewardPts} pts)`);

  playSound('reward');
  triggerHaptic();
  showPointsAnimation(state.dailyQuest.rewardPts, user.name, "¡Misión Diaria Completada!");

  checkAchievements(user);
  await saveLocalStorage();
  renderApp();
}

function renderFamilyGoal() {
  let container = document.getElementById('familyGoalWidget');
  if (!container) {
    const homeTab = document.getElementById('tab-home');
    if (!homeTab) return;
    container = document.createElement('div');
    container.id = 'familyGoalWidget';
    homeTab.insertBefore(container, homeTab.firstChild);
  }

  const goal = state.familyGoal || { title: '👾 El Dragón del Desorden (Meta Co-op)', targetPoints: 500 };
  const totalKidsPoints = Object.values(state.users)
    .filter(u => u.role === 'hijo')
    .reduce((acc, u) => acc + u.points, 0);

  const percent = Math.min(100, Math.round((totalKidsPoints / goal.targetPoints) * 100));
  const hpLeft = Math.max(0, goal.targetPoints - totalKidsPoints);

  container.className = "mb-4 bg-gradient-to-r from-red-950/80 via-purple-950/80 to-zinc-950 p-4 rounded-3xl border border-red-500/40 shadow-xl shadow-red-500/10";
  container.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-2.5">
        <span class="text-3xl animate-bounce">👾</span>
        <div>
          <span class="text-[9px] font-black uppercase tracking-wider text-red-400">Jefe Final Co-Op</span>
          <h3 class="text-xs font-black text-white">${goal.title}</h3>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs font-black text-red-400 bg-red-500/20 px-2.5 py-1 rounded-full border border-red-400/30">HP: ${hpLeft}/${goal.targetPoints}</span>
      </div>
    </div>
    <div class="w-full bg-zinc-900/90 h-3.5 rounded-full overflow-hidden border border-red-500/30 p-0.5">
      <div class="bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-md shadow-red-500/50" style="width: ${percent}%"></div>
    </div>
    <p class="text-[10px] text-zinc-400 font-bold mt-1.5 text-center">¡Suma puntos con tus hermanos para derrotarlo juntos! (${percent}% derrotado)</p>
  `;
}

async function playScratchCard() {
  const user = state.users[state.currentUser];
  if (!user || user.points < 10) return alert("¡Necesitas al menos 10 puntos para rascar una tarjeta!");
  
  if (!confirm("¿Quieres gastar 10 puntos en el Rasca y Gana? 🎟️")) return;

  user.points -= 10;

  const prizes = [
    { title: "¡Ganaste +15 Puntos!", pts: 15 },
    { title: "¡Ganaste +30 Puntos!", pts: 30 },
    { title: "¡Vale por 1 Helado!", pts: 0 },
    { title: "¡Elegir la película de hoy!", pts: 0 },
    { title: "¡Casi! Prueba otra vez", pts: 0 }
  ];

  const won = prizes[Math.floor(Math.random() * prizes.length)];
  if (won.pts > 0) user.points += won.pts;

  const area = document.getElementById('scratchText');
  if (area) area.innerText = `🎉 ¡${won.title}!`;

  state.history.unshift(`🎟️ ${user.name} rascó una tarjeta y obtuvo: ${won.title}`);
  playSound('reward');
  triggerHaptic();

  checkAchievements(user);
  await saveLocalStorage();
  renderApp();
}

// --- RENDERIZADO PRINCIPAL ---
function renderApp() {
  const user = state.users[state.currentUser];
  if (!user) return;

  initUserSelect();

  try {
    const avatarEl = document.getElementById('currentAvatar');
    if (avatarEl) avatarEl.innerHTML = renderAvatarHtml(user.avatar, "text-xl");

    const pointsEl = document.getElementById('userPointsRewardTab');
    if (pointsEl) pointsEl.innerText = `${user.points} ⭐`;
  } catch (e) {}

  try { renderDoubleXpBanner(); } catch (e) {}
  try { renderFamilyGoal(); } catch (e) {}
  try { renderDailyQuestWidget(); } catch (e) {}
  try { renderRouletteBanner(); } catch (e) {}
  try { renderLeaderboard(); } catch (e) {}
  try { renderPodium(); } catch (e) {}
  try { renderUserStats(); } catch (e) {}
  try { renderTasks(); } catch (e) {}
  try { renderMinigamesSection(); } catch (e) {}
  try { renderRewards(); } catch (e) {}
  try { updateActivityLog(); } catch (e) {}
  try { renderManagerPanel(); } catch (e) {}
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
    
    const lvlInfo = getUserLevel(u.totalCompleted);

    return `
      <div class="flex flex-col items-center text-center ${leaderBg} p-3 rounded-2xl border backdrop-blur-sm relative overflow-hidden transition-all duration-300">
        ${isLeader ? `<div class="absolute top-1 right-1 text-xs animate-bounce">🏆</div>` : ''}
        <div class="relative mt-1">
          <div class="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border-2 ${ringColor} overflow-hidden shadow-inner">
            ${renderAvatarHtml(u.avatar, "text-3xl")}
          </div>
          <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-[9px] font-black px-2 py-0.5 rounded-full border border-zinc-700 text-amber-300 shadow whitespace-nowrap">
            ${posLabel}
          </span>
        </div>
        <p class="font-bold text-xs pt-3 truncate w-full text-zinc-100">${u.name}</p>
        <p class="text-[10px] text-blue-300 font-bold mt-0.5">Nivel ${lvlInfo.level}</p>
        <p class="text-xs font-black text-amber-400 mt-0.5">${u.points} pts</p>
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
        <div class="w-20 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-xl h-16 mt-1 flex flex-col justify-end items-center pb-2 border-t border-slate-400 shadow-lg">
          <span class="text-xs font-black text-white">🥈 2º</span>
          <span class="text-[10px] font-bold text-slate-300">${second.points} pts</span>
        </div>
      </div>
    ` : ''}

    <div class="flex flex-col items-center">
      <div class="relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-base animate-bounce">👑</span>
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
        <div class="w-20 bg-gradient-to-t from-amber-900 to-amber-800 rounded-t-xl h-12 mt-1 flex flex-col justify-end items-center pb-2 border-t border-amber-600 shadow-lg">
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
  }

  const lvlInfo = getUserLevel(user.totalCompleted);

  const unlockedMeds = user.unlockedAchievements || [];
  const medalsHtml = unlockedMeds.length === 0 
    ? '<span class="text-[10px] text-zinc-500">Aún no hay medallas</span>'
    : unlockedMeds.map(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        return ach ? `<div title="${ach.title}\n${ach.desc}" class="text-2xl hover:scale-125 transition-transform cursor-help">${ach.icon}</div>` : '';
      }).join('');

  container.innerHTML = `
    <div class="col-span-2 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 p-3.5 rounded-2xl flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div>
          <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Rango Actual</span>
          <p class="font-black text-sm text-white">${lvlInfo.rankName} (Nivel ${lvlInfo.level})</p>
        </div>
        <span class="text-xs font-extrabold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-xl border border-purple-400/30">${lvlInfo.xpPercent}% XP</span>
      </div>
      <div class="w-full bg-zinc-900/90 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
        <div class="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300" style="width: ${lvlInfo.xpPercent}%"></div>
      </div>
    </div>

    <div class="col-span-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 flex flex-col gap-2">
      <span class="font-bold text-[10px] text-zinc-400 uppercase tracking-wider">Logros y Medallas 🏆</span>
      <div class="flex flex-wrap gap-2 items-center min-h-[32px]">
        ${medalsHtml}
      </div>
    </div>

    <div class="col-span-2 ${streakColor} p-3 rounded-2xl border flex justify-between items-center transition-all duration-300">
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
    container.innerHTML = `<p class="col-span-2 text-center text-xs text-zinc-500 py-6">No hay tareas creadas.</p>`;
    return;
  }

  container.innerHTML = filtered.map(action => {
    const isPos = action.type === 'positive';
    const effectivePoints = (isPos && state.doubleXpActive) ? action.points * 2 : action.points;
    const pointsClass = isPos ? 'text-emerald-400' : 'text-red-400';
    const ptsText = isPos ? `+${effectivePoints}` : `${effectivePoints}`;

    return `
      <div onclick="applyAction(${action.id})" class="bg-zinc-900 hover:bg-zinc-800/90 p-4 rounded-[1.75rem] border border-zinc-800/80 cursor-pointer transition-all duration-200 active:scale-90 flex flex-col justify-between space-y-4 shadow-md group relative">
        ${(isPos && state.doubleXpActive) ? `<span class="absolute top-2 right-2 text-[9px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full animate-pulse">2x</span>` : ''}
        <div class="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-2xl border border-zinc-800/50 shadow-inner group-hover:rotate-12 transition-transform">
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
      if (pinEntered !== null) alert("PIN incorrecto.");
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
    let finalPoints = action.points;
    if (action.type === 'positive' && state.doubleXpActive) {
      finalPoints = action.points * 2;
    }

    child.points += finalPoints;
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
    state.history.unshift(`${performerName} registró para ${child.name}: ${action.title} (${finalPoints > 0 ? '+' : ''}${finalPoints} pts)`);

    showPointsAnimation(finalPoints, child.name, action.title);
    checkAchievements(child);

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

  const rewardsHtml = state.rewards.map(reward => {
    const canAfford = user && user.points >= reward.cost;

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
          class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-xl text-xs font-extrabold transition active:scale-95 shadow-lg shadow-emerald-600/20">
          Canjear
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = rewardsHtml;
}

async function claimReward(rewardId) {
  const reward = state.rewards.find(r => r.id === rewardId);
  const user = state.users[state.currentUser];

  if (reward && user && user.points >= reward.cost) {
    user.points -= reward.cost;

    let dateStr = "";
    try { dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } 
    catch (e) { dateStr = new Date().toISOString().slice(0, 10); }

    state.redemptions.unshift({ id: Date.now(), userName: user.name, userAvatar: user.avatar, rewardTitle: reward.title, rewardIcon: reward.icon || '🎁', cost: reward.cost, date: dateStr });
    state.history.unshift(`${user.name} canjeó: ${reward.title} (-${reward.cost} pts)`);

    playSound('reward');
    triggerHaptic();
    showPointsAnimation(-reward.cost, user.name, `Canjeado: ${reward.title}`);

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
    } else { alert("El PIN debe ser un número de exactamente 4 dígitos."); }
  } else if (current !== null) { alert("PIN incorrecto."); }
}

async function editLootboxCost() {
  const current = state.lootboxCost || 30;
  const nuevoStr = prompt("Introduce el nuevo coste en puntos de la Caja Sorpresa:", current);
  const parsed = parseInt(nuevoStr);
  
  if (nuevoStr !== null && !isNaN(parsed) && parsed > 0) {
    state.lootboxCost = parsed;
    await saveLocalStorage();
    renderApp();
  } else if (nuevoStr !== null) {
    alert("Introduce un número válido mayor a 0.");
  }
}

async function toggleDoubleXp() {
  state.doubleXpActive = !state.doubleXpActive;
  await saveLocalStorage();
  renderApp();
}

function renderManagerPanel() {
  if (!isManagerUnlocked) return;

  const lootboxControl = document.getElementById('lootboxControlWidget');
  if (!lootboxControl) {
    const settingsPanel = document.getElementById('pinUnlockedContent');
    const firstSection = settingsPanel ? settingsPanel.querySelector('.space-y-4') : null;
    if (firstSection) {
      const div = document.createElement('div');
      div.id = 'lootboxControlWidget';
      firstSection.prepend(div);
    }
  }
  const lcWidget = document.getElementById('lootboxControlWidget');
  if (lcWidget) {
    lcWidget.innerHTML = `
      <div class="space-y-2 mb-4">
        <div class="bg-gradient-to-r from-amber-950/40 to-zinc-950 p-3 rounded-2xl border border-amber-500/20 flex justify-between items-center">
          <span class="text-xs font-bold text-white flex items-center gap-2">🎁 Coste Caja Sorpresa</span>
          <div class="flex items-center gap-2">
            <span class="text-amber-400 font-black text-sm">${state.lootboxCost || 30} ⭐</span>
            <button onclick="editLootboxCost()" class="text-[11px] text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-bold active:scale-95">Editar</button>
          </div>
        </div>

        <div class="bg-gradient-to-r from-red-950/40 to-zinc-950 p-3 rounded-2xl border border-red-500/20 flex justify-between items-center">
          <span class="text-xs font-bold text-white flex items-center gap-2">🔥 Evento Doble XP (2x Puntos)</span>
          <button onclick="toggleDoubleXp()" class="text-xs font-black px-3 py-1.5 rounded-lg border transition ${state.doubleXpActive ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}">
            ${state.doubleXpActive ? 'ACTIVADO 🔥' : 'DESACTIVADO'}
          </button>
        </div>
      </div>
    `;
  }

  const redemptionsContainer = document.getElementById('redemptionsList');
  if (redemptionsContainer) {
    const redemptionsCount = document.getElementById('redemptionsCount');
    if (redemptionsCount) redemptionsCount.innerText = state.redemptions.length;
    if (state.redemptions.length === 0) redemptionsContainer.innerHTML = `<p class="text-center text-xs text-zinc-500 py-3">No hay canjes registrados.</p>`;
    else {
      redemptionsContainer.innerHTML = state.redemptions.map(item => `
        <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">${renderAvatarHtml(item.userAvatar, "text-sm")}</div>
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
          <div class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">${renderAvatarHtml(u.avatar, "text-xl")}</div>
          <span class="font-bold text-xs text-white">${u.name}</span>
        </div>
        <button onclick="changeUserAvatar('${u.id}')" class="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl font-bold active:scale-95">Cambiar Foto / Emoji</button>
      </div>
    `).join('');
  }

  const pointsContainer = document.getElementById('manualPointsControl');
  if (pointsContainer) {
    const kids = Object.values(state.users).filter(u => u.role === 'hijo');
    pointsContainer.innerHTML = kids.map(kid => `
      <div class="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">${renderAvatarHtml(kid.avatar, "text-base")}</div>
          <div><p class="font-bold text-xs text-white">${kid.name}</p><span class="text-[11px] text-amber-400 font-bold">${kid.points} pts</span></div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="modifyPoints('${kid.id}', -10)" class="bg-zinc-900 text-red-400 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-zinc-800 active:scale-95">-10</button>
          <button onclick="modifyPoints('${kid.id}', 10)" class="bg-zinc-900 text-emerald-400 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-zinc-800 active:scale-95">+10</button>
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
          <div class="truncate"><p class="text-xs text-zinc-100 font-bold truncate">${r.title}</p><p class="text-[10px] text-amber-400 font-bold">${r.cost} ⭐</p></div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="editReward(${r.id})" class="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 font-bold active:scale-95">✏️</button>
          <button onclick="deleteReward(${r.id})" class="text-[11px] text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 font-bold active:scale-95">🗑️</button>
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
          <div class="truncate"><p class="text-xs text-zinc-100 font-bold truncate">${a.title}</p><p class="text-[10px] ${a.points > 0 ? 'text-emerald-400' : 'text-red-400'} font-bold">${a.points > 0 ? '+' : ''}${a.points} pts</p></div>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="editAction(${a.id})" class="text-[11px] text-blue-400 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20 font-bold active:scale-95">✏️</button>
          <button onclick="deleteAction(${a.id})" class="text-[11px] text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 font-bold active:scale-95">🗑️</button>
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
  if (!title || isNaN(cost) || cost <= 0) return alert("Por favor, introduce un nombre y una cantidad válida.");
  state.rewards.push({ id: Date.now(), title, icon, cost });
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
    showPointsAnimation(delta, user.name, "Ajuste manual de puntos");
    checkAchievements(user);
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
  if (!title || isNaN(points)) return alert("Por favor, introduce un título y puntos válidos.");
  const finalPoints = type === 'negative' ? -Math.abs(points) : Math.abs(points);
  state.actions.unshift({ id: Date.now(), title, points: finalPoints, type, icon });
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

// --- FUNCIÓN AÑADIDA PARA EVITAR EL ERROR DE CONSOLA DEL WIDGET VIP ---
function openEventDetails() {
  alert("🎉 ¡Evento VIP Activo! Todas las tareas suman el doble de puntos y puedes conseguir pases abriendo sobres.");
}

window.addEventListener('focus', fetchCloudData);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fetchCloudData(); });

async function startApp() {
  // Aseguramos la sesión activa antes de cargar o pedir nada a la base de datos
  await asegurarSesionActiva();

  loadLocalStorage();
  initUserSelect();
  setActiveTab('home');
  renderApp();
  await fetchCloudData();
  setupRealtimeListener();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp);
else startApp();
