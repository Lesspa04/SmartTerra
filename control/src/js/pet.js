// ============================================================
// SISTEMA DE MASCOTA
// 3 etapas de evolución + accesorios combinables en etapa 3
// ============================================================

// ─────────────────────────────────────────
// CONFIGURACIÓN DE ETAPAS
// Cambia los src de las imágenes por tus archivos reales
// ─────────────────────────────────────────
const PET_STAGES = [
  {
    id:      'empty',
    name:    'Sin vida',
    minXP:   0,
    maxXP:   1,
    img:     'control/public/assets/pet/stage0.png',
    speech: ['Aún no existo...', 
      'Registra tu primer día para darme vida', 
      'Estoy esperando que comiences'
    ],
  },
  {
    id:      'baby',
    name:    'Semilla',              
    minXP:   1,
    maxXP:   200,
    img:     'control/public/assets/pet/stage1.png',
    speech: [
      '¡Hola! Soy una pequeña semilla. ¡Ayúdame a crecer con buenos hábitos!',
      'Cada día que cuidas el planeta, yo crezco un poco más...',
      '¡Todavía soy pequeño pero tengo mucho potencial!',
      'Toy chikito'
    ],
  },
  {
    id:      'growing',
    name:    'Brote',                
    minXP:   200,
    maxXP:   600,
    img:     'control/public/assets/pet/stage2.png', 
    speech: [
      '¡Ya estoy brotando! Tus hábitos sostenibles me dan vida.',
      '¡Mira cómo he crecido! Seguimos juntos en este camino verde.',
      '¡Casi llego a la siguiente etapa! Sigue reduciendo tu huella.',
    ],
  },
  {
    id:      'full',
    name:    'Guardián',             
    minXP:   600,
    maxXP:   Infinity,
    img:     'control/public/assets/pet/stage3.png',  
    speech: [
      '¡Soy el Guardián del Planeta!.',
      '¡Has llegado a la etapa final! Ahora puedes personalizarme con accesorios.',
      '¡Tu compromiso con la sostenibilidad es legendario!',
    ],
  },
]

// ─────────────────────────────────────────
// CONFIGURACIÓN DE ACCESORIOS
// Todos tienen una propiedad "layer" (z-index) para superponerse correctamente.
// Solo se muestran cuando la mascota está en etapa 3 (full).
// "category" permite activar solo 1 por categoría (ej: solo 1 sombrero)
// o combinaciones libres (categorías distintas = todas activas a la vez).
// ─────────────────────────────────────────
const ACCESSORIES = [
  // ── Sombreros (solo 1 activo a la vez) ───────────────────
  {
    id:       'hat_vueltiao',
    name:     'Sombrero Vueltiao',
    category: 'hat',          // misma categoría
    layer:    20,              // z-index sobre la mascota
    img:      'control/public/assets/accessories/hat_vueltiao.png',
    unlockXP: 600,             // XP mínimo para desbloquear
  },
  {
    id:       'hat_aguadeño',
    name:     'Sombrero Aguadeño',
    category: 'hat',
    layer:    20,
    img:      'control/public/assets/accessories/hat_aguadeño.png',
    unlockXP: 800,
  },
  // ── Gafas (solo 1 activo a la vez) ───────────────────────
  {
    id:       'glasses_cool',
    name:     'Gafas Cool',
    category: 'glasses',
    layer:    30,
    img:      'control/public/assets/accessories/glasses_cool.png',
    unlockXP: 700,
  },
  {
    id:       'glasses_patriotas',
    name:     'Gafas patriotas',
    category: 'glasses',
    layer:    30,
    img:      'control/public/assets/accessories/glasses_patriotas.png',
    unlockXP: 900,
  },
  // ── Ropa / Cuerpo (solo 1 activo a la vez) ───────────────
  {
    id:       'outfit_pañoleta',
    name:     'Pañoleta',
    category: 'outfit',
    layer:    40,               
    img:      'control/public/assets/accessories/outfit_pañoleta.png',
    unlockXP: 650,
  },
  {
    id:       'outfit_ruana',
    name:     'Ruana',
    category: 'outfit',
    layer:    40,
    img:      'control/public/assets/accessories/outfit_ruana.png',
    unlockXP: 1000,
  },
  {
    id:       'other_colibri',
    name:     'Colibris',
    category: 'animal',
    layer:    25,
    img:      'control/public/assets/accessories/other_colibri.png',
    unlockXP: 620,
  },
  {
    id:       'other_flores',
    name:     'Flores',
    category: 'flor',
    layer:    20,               
    img:      'control/public/assets/accessories/other_flores.png',
    unlockXP: 750,
  },
]

// ─────────────────────────────────────────
// XP y evolución
// ─────────────────────────────────────────
function getStageByXP(xp) {
  if (!xp || xp <= 0) return PET_STAGES[0] 
  for (let i = PET_STAGES.length - 1; i >= 0; i--) {
    if (xp >= PET_STAGES[i].minXP) return PET_STAGES[i]
  }
  return PET_STAGES[0]
}

function calcXPGain(totalCO2, streakDays) {
  const base    = Math.max(0, (GLOBAL_CO2.daily - totalCO2) * 5)
  const streak  = Math.min(streakDays * 2, 50)
  return Math.round(base + streak)
}

function xpProgressPct(xp, stage) {
  if (stage.maxXP === Infinity) return 100
  const range = stage.maxXP - stage.minXP
  const done  = xp - stage.minXP
  return Math.min(100, Math.max(0, (done / range) * 100))
}

function randomSpeech(stage) {
  const lines = stage.speech
  return lines[Math.floor(Math.random() * lines.length)]
}

// ─────────────────────────────────────────
// RENDERIZADO EN pet-page
// ─────────────────────────────────────────
function renderPetPage(petData) {
  if (!petData) {
    petData = {
      xp: 0,
      pet_name: '???',
      streak_days: 0,
      total_co2_saved: 0,
      level: 0,
      active_accessories: []
    }
  }
  const stage = getStageByXP(petData.xp)

  // Badge de etapa
  el('pet-stage-badge').textContent = `✦ Etapa ${PET_STAGES.indexOf(stage) + 1}: ${stage.name}`

  // Imagen base
  const baseImg = el('pet-base-img')
  baseImg.src = stage.img
  baseImg.alt = `Mascota – ${stage.name}`

  // Locked si no es etapa 3
  const canvasWrap = document.querySelector('.pet-canvas-wrap')
  canvasWrap.classList.toggle('locked', stage.id !== 'full')

  // Nombre
  el('pet-name-display').textContent = petData.pet_name || 'Arumi'

  // XP bar
  const pct = xpProgressPct(petData.xp || 0, stage)
  el('pet-xp-fill').style.width = pct + '%'
  el('pet-xp-cur').textContent  = `${petData.xp || 0} XP`
  el('pet-xp-max').textContent  = stage.maxXP === Infinity
    ? '¡Nivel máximo!'
    : `${stage.maxXP - (petData.xp || 0)} XP para evolucionar`

  // Speech
  el('pet-speech').textContent = randomSpeech(stage)

  // Stats
  el('ps-xp').textContent     = petData.xp || 0
  el('ps-streak').textContent = petData.streak_days || 0
  el('ps-saved').textContent  = `${(petData.total_co2_saved || 0).toFixed(1)} kg`
  el('ps-level').textContent  = petData.level || 1

  // Evolution path
  renderEvolutionPath(petData.xp || 0)

  // Accesorios
  const activeAccs = petData.active_accessories || []
  renderAccessories(petData.xp || 0, stage, activeAccs)

  // Mostrar card de accesorios solo en etapa 3
  el('accessories-card').style.display = stage.id === 'full' ? '' : 'none'

  // Aplicar accesorios activos al canvas
  applyAccessoriesToCanvas(activeAccs, petData.xp || 0, stage)
}

function renderEvolutionPath(xp) {
  const wrap = el('evolution-path')
  wrap.innerHTML = ''
  const currentStage = getStageByXP(xp)

  PET_STAGES.forEach((stage, i) => {
    const isCurrent = stage === currentStage
    const isDone    = xp >= stage.maxXP && stage.maxXP !== Infinity
    const isLocked  = xp < stage.minXP

    const div = document.createElement('div')
    div.className = `evo-item ${isCurrent ? 'current' : isDone ? 'done' : 'locked'}`

    const pct = isCurrent ? xpProgressPct(xp, stage) : (isDone ? 100 : 0)

    div.innerHTML = `
      <img class="evo-thumb" src="${stage.img}" alt="${stage.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="evo-thumb-placeholder" style="display:none">${i === 0 ? '<i class="fa-solid fa-lock-open"></i>' : i === 1 ? '<i class="fa-solid fa-lock-open"></i>' : '<i class="fa-solid fa-lock-open"></i>'}</div>
      <div class="evo-info">
        <div class="evo-name">
          Etapa ${i + 1}: ${stage.name}
          ${isCurrent ? '<span class="badge badge-green" style="margin-left:6px">Actual</span>' : ''}
          ${isDone ? '<span class="badge badge-green" style="margin-left:6px">✓</span>' : ''}
          ${isLocked ? '<i class="fa-solid fa-lock"></i>' : ''}
        </div>
        <div class="evo-range">${stage.minXP} – ${stage.maxXP === Infinity ? '∞' : stage.maxXP} XP</div>
        ${isCurrent && stage.maxXP !== Infinity ? `
          <div class="evo-prog">
            <div class="progress-bar" style="height:5px;margin-top:5px">
              <div class="progress-fill" style="width:${pct}%"></div>
            </div>
          </div>` : ''}
      </div>
    `
    wrap.appendChild(div)
  })
}

function renderAccessories(xp, stage, activeAccs) {
  const grid = el('accessories-grid')
  if (!grid) return
  grid.innerHTML = ''

  ACCESSORIES.forEach(acc => {
    const isUnlocked = xp >= acc.unlockXP && stage.id === 'full'
    const isActive   = activeAccs.includes(acc.id)

    const div = document.createElement('div')
    div.className = `acc-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked-acc' : ''}`
    div.title = isUnlocked ? acc.name : `Desbloquea a ${acc.unlockXP} XP`

    div.innerHTML = `
      <img src="${acc.img}" alt="${acc.name}"
           onerror="this.style.fontSize='2rem';this.alt='<i class="fa-solid fa-hat-cowboy"></i>';this.src=''">
      <span class="acc-label">${acc.name}</span>
      ${!isUnlocked ? `<span class="acc-lock-icon"><i class="fa-solid fa-lock"></i></span>` : ''}
    `

    if (isUnlocked) {
      div.addEventListener('click', () => toggleAccessory(acc, activeAccs, xp, stage))
    }
    grid.appendChild(div)
  })
}

function toggleAccessory(acc, activeAccs, xp, stage) {
  const isActive = activeAccs.includes(acc.id)

  if (isActive) {
    // Desactivar
    const idx = activeAccs.indexOf(acc.id)
    activeAccs.splice(idx, 1)
  } else {
    // Si la categoría solo permite 1 activo, quitar el anterior de esa categoría
    const sameCategory = ACCESSORIES
      .filter(a => a.category === acc.category && a.id !== acc.id)
      .map(a => a.id)
    sameCategory.forEach(id => {
      const i = activeAccs.indexOf(id)
      if (i >= 0) activeAccs.splice(i, 1)
    })
    activeAccs.push(acc.id)
  }

  // Guardar en Supabase
  saveActiveAccessories(activeAccs)

  // Re-renderizar UI
  renderAccessories(xp, stage, activeAccs)
  applyAccessoriesToCanvas(activeAccs, xp, stage)
}

async function saveActiveAccessories(activeAccs) {
  const { data: { session } } = await db.auth.getSession()
  if (!session) return
  await db.from('pet_status')
    .update({ active_accessories: activeAccs })
    .eq('user_id', session.user.id)
}

function applyAccessoriesToCanvas(activeAccs, xp, stage) {
  const canvas = el('pet-canvas')
  if (!canvas) return

  // Eliminar capas previas de accesorios
  canvas.querySelectorAll('.pet-acc-layer').forEach(n => n.remove())

  if (stage.id !== 'full') return

  // Añadir capas en orden de z-index
  const sorted = ACCESSORIES
    .filter(acc => activeAccs.includes(acc.id) && xp >= acc.unlockXP)
    .sort((a, b) => a.layer - b.layer)

  sorted.forEach(acc => {
    const img = document.createElement('img')
    img.className   = 'pet-layer pet-acc-layer'
    img.src         = acc.img
    img.alt         = acc.name
    img.style.zIndex = acc.layer
    img.draggable   = false
    // Si la imagen no carga, simplemente no se muestra
    img.onerror = () => img.remove()
    canvas.appendChild(img)
  })
}

// Botón quitar todos los accesorios
async function clearAccessories() {
  const { data: { session } } = await db.auth.getSession()
  if (!session) return
  await db.from('pet_status')
    .update({ active_accessories: [] })
    .eq('user_id', session.user.id)
  showToast('Accesorios quitados')
  // Re-renderizar
  const { data } = await db.from('pet_status').select('*').eq('user_id', session.user.id).single()
  renderPetPage(data)
}

// ─────────────────────────────────────────
// MINI PET (sidebar + dashboard)
// ─────────────────────────────────────────
function renderPetMini(petData) {
  if (!petData) return
  const stage = getStageByXP(petData.xp || 0)
  const name  = petData.pet_name || 'Arumi'

  // Sidebar mini
  const sideEl = el('sidebar-pet-mini')
  if (sideEl) {
    sideEl.innerHTML = `
      <img class="pet-thumb" src="${stage.img}" alt="${name}"
           onerror="this.textContent='🌱';this.style.display='none';this.nextElementSibling.style.display=''">
      <span style="display:none">🌱</span>
      <span>${name} <span style="color:var(--txt-3)">&middot; ${stage.name}</span></span>
    `
  }

  // Topbar pet
  const topEl = el('topbar-pet')
  if (topEl) {
    topEl.innerHTML = `<img src="${stage.img}" style="width:28px;height:28px;object-fit:contain"
      onerror="this.textContent='🌱'" alt="${name}">`
  }

  // Dashboard mini card
  const dashInner = el('dash-pet-inner')
  if (dashInner) {
    const pct = xpProgressPct(petData.xp || 0, stage)
    dashInner.innerHTML = `
      <img class="pet-dash-thumb" src="${stage.img}" alt="${name}"
           onerror="this.style.fontSize='3rem';this.alt='🌱'">
      <div class="pet-dash-info">
        <div class="pet-dash-name">${name}</div>
        <div class="pet-dash-stage">Etapa: ${stage.name} · Nivel ${petData.level || 1}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div style="font-size:.72rem;color:var(--txt-3);margin-top:3px">${petData.xp || 0} XP</div>
      </div>
    `
  }
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function el(id) { return document.getElementById(id) }

// Exportar para uso en app.js
window.PetSystem = {
  PET_STAGES, ACCESSORIES,
  getStageByXP, calcXPGain, xpProgressPct, randomSpeech,
  renderPetPage, renderPetMini, clearAccessories,
  applyAccessoriesToCanvas,
}