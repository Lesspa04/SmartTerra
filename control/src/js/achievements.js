// ============================================================
// SISTEMA DE LOGROS 
// ============================================================

const ALL_ACHIEVEMENTS = {
  // ── BÁSICOS ──────────────────────────────────────────────
  first_entry: {
    key:'first_entry', name:'¡Primer Paso!', 
    desc:'Registraste tu primer día de hábitos',
    icon:'<i class="fa-solid fa-seedling"></i>', xp:10, category:'basics'
  },
  
  // ── RACHAS ───────────────────────────────────────────────
  week_streak: {
    key:'week_streak', name:'Semana Verde',
    desc:'7 días consecutivos registrando tu huella',
    icon:'<i class="fa-solid fa-calendar-week"></i>', xp:50, category:'streaks'
  },
  month_streak: {
    key:'month_streak', name:'Mes Sostenible',
    desc:'30 días consecutivos registrando',
    icon:'<i class="fa-regular fa-calendar-check"></i>', xp:200, category:'streaks'
  },

  // ── HUELLA DE CARBONO ────────────────────────────────────
  below_target: {
    key:'below_target', name:'Bajo el Umbral',
    desc:'Mantuviste tu huella bajo 4 kg CO₂ en un día',
    icon:'<i class="fa-solid fa-spa"></i>', xp:30, category:'carbon'
  },
  under_colombia: {
    key:'under_colombia', name:'Mejor que el Promedio',
    desc:'Huella menor al promedio colombiano (5.5 kg)',
    icon:'🇨🇴', xp:20, category:'carbon'
  },
  zero_transport: {
    key:'zero_transport', name:'Día Sin Motor',
    desc:'No usaste ningún vehículo motorizado',
    icon:'<i class="fa-solid fa-person-walking"></i>', xp:40, category:'transport'
  },

  // ── TRANSPORTE  ──────────────────────────────────
  cyclist: {
    key:'cyclist', name:'Ciclista Urbano',
    desc:'Pedaleaste más de 10 km en un día',
    icon:'<i class="fa-solid fa-person-biking"></i>', xp:25, category:'transport'
  },
  public_only: {
    key:'public_only', name:'Transporte Público',
    desc:'Solo usaste transporte público (bus/metro)',
    icon:'<i class="fa-solid fa-bus-simple"></i>', xp:25, category:'transport'
  },
  no_car: {
    key:'no_car', name:'Sin Carro',
    desc:'Un día completo sin usar carro particular',
    icon:'<i class="fa-solid fa-car-side"></i>', xp:20, category:'transport'
  },

  // ── ALIMENTACIÓN  ────────────────────────────────
  zero_beef: {
    key:'zero_beef', name:'Lunes Sin Res',
    desc:'Un día sin carne de res',
    icon:'<i class="fa-solid fa-stroopwafel"></i>', xp:20, category:'food'
  },
  veggie_day: {
    key:'veggie_day', name:'Día Vegetariano',
    desc:'Sin carne roja ni pollo (solo pescado/huevos)',
    icon:'<i class="fa-solid fa-fish"></i>', xp:35, category:'food'
  },
  low_food: {
    key:'low_food', name:'Comida Ligera',
    desc:'Emisiones alimenticias < 1.5 kg CO₂',
    icon:'<i class="fa-solid fa-bone"></i>', xp:25, category:'food'
  },
  fruits_lover: {
    key:'fruits_lover', name:'Amante de las Frutas',
    desc:'Consumiste más de 400g de frutas',
    icon:'<i class="fa-solid fa-apple-whole"></i>', xp:15, category:'food'
  },

  // ── ENERGÍA ─────────────────────────────────────
  solar: {
    key:'solar', name:'Energía Limpia',
    desc:'Usaste más de 50% de energía renovable',
    icon:'<i class="fa-solid fa-sun"></i>', xp:30, category:'energy'
  },
  low_energy: {
    key:'low_energy', name:'Ahorro Energético',
    desc:'Consumo eléctrico < 5 kWh',
    icon:'<i class="fa-regular fa-lightbulb"></i>', xp:20, category:'energy'
  },
  no_gas: {
    key:'no_gas', name:'Sin Gas',
    desc:'Día sin gas natural ni GLP',
    icon:'<i class="fa-solid fa-fire-flame-curved"></i>', xp:25, category:'energy'
  },

  // ── RESIDUOS  ────────────────────────────────────
  recycler: {
    key:'recycler', name:'Rey del Reciclaje',
    desc:'Reciclaste más del 50% de tus residuos',
    icon:'<i class="fa-solid fa-recycle"></i>', xp:25, category:'waste'
  },
  zero_waste: {
    key:'zero_waste', name:'Cero Basura',
    desc:'Todo reciclado o compostado (0% basura general)',
    icon:'<i class="fa-solid fa-trash"></i>', xp:50, category:'waste'
  },

  // ── REGISTROS ────────────────────────────────────────────
  ten_entries: {
    key:'ten_entries', name:'Comprometido',
    desc:'10 registros completados',
    icon:'<i class="fa-solid fa-check"></i>', xp:40, category:'milestones'
  },
  fifty_entries: {
    key:'fifty_entries', name:'Guardián del Clima',
    desc:'50 registros completados',
    icon:'<i class="fa-solid fa-check-double"></i>', xp:150, category:'milestones'
  },
  hundred_entries: {
    key:'hundred_entries', name:'Veterano',
    desc:'100 registros completados',
    icon:'<i class="fa-solid fa-medal"></i>', xp:300, category:'milestones'
  },

  // ── MASCOTA ──────────────────────────────────────────────
  stage2_pet: {
    key:'stage2_pet', name:'¡Brote!',
    desc:'Tu mascota evolucionó a Etapa 2',
    icon:'<i class="fa-brands fa-pagelines"></i>', xp:60, category:'pet'
  },
  stage3_pet: {
    key:'stage3_pet', name:'¡Guardián!',
    desc:'Tu mascota alcanzó la Etapa 3 (¡máxima!)',
    icon:'<i class="fa-solid fa-tree"></i>', xp:150, category:'pet'
  }
}

window.ALL_ACHIEVEMENTS = ALL_ACHIEVEMENTS

// Evalúa qué logros nuevos se deben otorgar
function checkAchievements(entry, petData, totalEntries, existingKeys) {
  const newOnes = []
  const has = (k) => existingKeys.includes(k)

  // BÁSICOS
  if (totalEntries === 1 && !has('first_entry')) 
    newOnes.push(ALL_ACHIEVEMENTS.first_entry)

  // RACHAS
  if (petData.streak_days >= 7 && !has('week_streak')) 
    newOnes.push(ALL_ACHIEVEMENTS.week_streak)
  if (petData.streak_days >= 30 && !has('month_streak')) 
    newOnes.push(ALL_ACHIEVEMENTS.month_streak)

  // HUELLA GENERAL
  if (entry.total_co2_kg <= GLOBAL_CO2.target && !has('below_target'))
    newOnes.push(ALL_ACHIEVEMENTS.below_target)
  if (entry.total_co2_kg <= GLOBAL_CO2.colombia && !has('under_colombia'))
    newOnes.push(ALL_ACHIEVEMENTS.under_colombia)

  // TRANSPORTE (NUEVOS)
  const transportUsed = (entry.car_km || 0) + (entry.moto_km || 0) + 
                       (entry.bus_urban_km || 0) + (entry.bus_inter_km || 0) + 
                       (entry.taxi_moto_km || 0) + (entry.metro_km || 0)
  const motorized = (entry.car_km || 0) + (entry.moto_km || 0) + (entry.taxi_moto_km || 0)
  
  if (transportUsed > 0 && motorized === 0 && !has('zero_transport'))
    newOnes.push(ALL_ACHIEVEMENTS.zero_transport)
  if ((entry.bike_km || 0) >= 10 && !has('cyclist'))
    newOnes.push(ALL_ACHIEVEMENTS.cyclist)
  if (entry.car_km === 0 && !has('no_car'))
    newOnes.push(ALL_ACHIEVEMENTS.no_car)
  if ((entry.bus_urban_km || 0) + (entry.bus_inter_km || 0) + (entry.metro_km || 0) > 0 &&
      motorized === 0 && (entry.bike_km || 0) === 0 && !has('public_only'))
    newOnes.push(ALL_ACHIEVEMENTS.public_only)

  // ALIMENTACIÓN (NUEVOS)
  if ((entry.beef_g || 0) === 0 && !has('zero_beef'))
    newOnes.push(ALL_ACHIEVEMENTS.zero_beef)
  if ((entry.beef_g || 0) === 0 && (entry.poultry_g || 0) === 0 && !has('veggie_day'))
    newOnes.push(ALL_ACHIEVEMENTS.veggie_day)
  if ((entry.fruits_g || 0) >= 400 && !has('fruits_lover'))
    newOnes.push(ALL_ACHIEVEMENTS.fruits_lover)

  // ENERGÍA (NUEVOS)
  if ((entry.renewable_pct || 0) >= 50 && !has('solar'))
    newOnes.push(ALL_ACHIEVEMENTS.solar)
  if ((entry.elec_kwh || 0) < 5 && !has('low_energy'))
    newOnes.push(ALL_ACHIEVEMENTS.low_energy)
  if ((entry.gas_m3 || 0) === 0 && (entry.glp_kg || 0) === 0 && !has('no_gas'))
    newOnes.push(ALL_ACHIEVEMENTS.no_gas)

  // RESIDUOS (NUEVOS)
  const wasteTotal = (entry.waste_kg || 0) + (entry.recycled_kg || 0) + 
                    (entry.composted_kg || 0) + (entry.burned_kg || 0)
  if (wasteTotal > 0 && (entry.recycled_kg || 0) >= wasteTotal * 0.5 && !has('recycler'))
    newOnes.push(ALL_ACHIEVEMENTS.recycler)
  if ((entry.waste_kg || 0) === 0 && wasteTotal > 0 && !has('zero_waste'))
    newOnes.push(ALL_ACHIEVEMENTS.zero_waste)

  // REGISTROS
  if (totalEntries >= 10 && !has('ten_entries'))
    newOnes.push(ALL_ACHIEVEMENTS.ten_entries)
  if (totalEntries >= 50 && !has('fifty_entries'))
    newOnes.push(ALL_ACHIEVEMENTS.fifty_entries)
  if (totalEntries >= 100 && !has('hundred_entries'))
    newOnes.push(ALL_ACHIEVEMENTS.hundred_entries)

  // MASCOTA
  const newXP = petData.xp || 0
  if (newXP >= 200 && !has('stage2_pet'))
    newOnes.push(ALL_ACHIEVEMENTS.stage2_pet)
  if (newXP >= 600 && !has('stage3_pet'))
    newOnes.push(ALL_ACHIEVEMENTS.stage3_pet)

  return newOnes
}

// Renderizar página de logros (MEJORADO con grises)
function renderAchievementsPage(userAchievements) {
  const grid  = document.getElementById('achievements-grid')
  const count = document.getElementById('logros-count')
  if (!grid) return

  const unlockedKeys = userAchievements.map(a => a.achievement_key)
  const total = Object.keys(ALL_ACHIEVEMENTS).length
  count.innerHTML = `<strong>${unlockedKeys.length}</strong> de ${total} desbloqueados`

  // Agrupar por categorías
  const categories = {}
  Object.values(ALL_ACHIEVEMENTS).forEach(ach => {
    categories[ach.category] = categories[ach.category] || []
    categories[ach.category].push(ach)
  })

  grid.innerHTML = ''

  // Render por categoría
  Object.entries(categories).forEach(([catName, achs]) => {
    // Header categoría
    const catDiv = document.createElement('div')
    catDiv.className = 'ach-category-header'
    catDiv.innerHTML = `<h3>${getCategoryName(catName)}</h3>`
    grid.appendChild(catDiv)

    // Logros de la categoría
    achs.forEach(ach => {
      const unlocked = unlockedKeys.includes(ach.key)
      const userAch  = userAchievements.find(a => a.achievement_key === ach.key)

      const div = document.createElement('div')
      div.className = `ach-card ${unlocked ? 'unlocked' : 'locked'}`
      div.innerHTML = `
        <div class="ach-card-icon ${unlocked ? '' : 'locked-icon'}">${ach.icon}</div>
        <div class="ach-card-content">
          <div class="ach-card-name ${unlocked ? '' : 'locked-text'}">${ach.name}</div>
          <div class="ach-card-desc ${unlocked ? '' : 'locked-text'}">${ach.desc}</div>
          ${unlocked ? 
            `<div class="ach-card-xp">+${ach.xp} XP <span class="ach-date">${formatDate(userAch.unlocked_at)}</span></div>` :
            `<div class="ach-card-xp locked-text">+${ach.xp} XP</div>`
          }
        </div>
        ${unlocked ? '<div class="ach-glow"></div>' : ''}
      `
      grid.appendChild(div)
    })

    // Espaciador
    grid.appendChild(document.createElement('div')).className = 'ach-spacer'
  })
}

// Helpers
function getCategoryName(cat) {
  const names = {
    basics: '<i class="fa-solid fa-plant-wilt"></i> Primeros Pasos',
    streaks: '<i class="fa-solid fa-fire"></i> Rachas',
    carbon: '<i class="fa-solid fa-globe"></i> Huella General',
    transport: '<i class="fa-solid fa-road"></i> Transporte',
    food: '<i class="fa-solid fa-utensils"></i> Alimentación',
    energy: '<i class="fa-solid fa-bolt-lightning"></i> Energía',
    waste: '<i class="fa-regular fa-trash-can"></i> Residuos',
    milestones: '<i class="fa-solid fa-trophy"></i> Hitos',
    pet: '<i class="fa-solid fa-leaf"></i> Mascota'
  }
  return names[cat] || cat
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { 
    day:'2-digit', month:'short', year:'numeric' 
  })
}

window.checkAchievements = checkAchievements
window.renderAchievementsPage = renderAchievementsPage