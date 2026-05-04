// ============================================================
// APP.JS — Lógica principal SmartTerra (versión completa + mascota)
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  // ── SUPABASE & AUTH ────────────────────────────────────── 
    const { data: { session } } = await db.auth.getSession()
    if (!session) { 
      location.href = 'index.html'; 
      return 
    }
  const user = session.user

  // ── ESTADO GLOBAL ────────────────────────────────────────
  let profile      = null
  let petData      = null
  let allEntries   = []
  let achievements = []
  let isFirstLogin = sessionStorage.getItem('first_login') === '1'

  // ── ELEMENTOS DOM ────────────────────────────────────────
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')
  const pages   = document.querySelectorAll('.page')

  // ── TOAST SYSTEM ─────────────────────────────────────────
  window.showToast = function(msg, type = 'success') {
    const wrap = document.getElementById('toast-container')
    if (!wrap) return
    const t = document.createElement('div')
    t.className = `toast toast-${type}`
    t.textContent = msg
    wrap.appendChild(t)
    setTimeout(() => t.remove(), 3100)
  }

  // ── NAVEGACIÓN ───────────────────────────────────────────
  function goToPage(pageId, skipLoad = false) {
    pages.forEach(p => p.classList.remove('active'))
    const target = document.getElementById('page-' + pageId)
    if (target) target.classList.add('active')
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
    document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active')
    
    sidebar.classList.remove('open')
    overlay.classList.remove('visible')
    
    if (!skipLoad) onPageLoad(pageId)
  }

  // ── EVENTOS DE NAVEGACIÓN ────────────────────────────────
  document.querySelectorAll('[data-page]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault()
      goToPage(item.dataset.page)
    })
  })

  document.getElementById('menu-btn')?.addEventListener('click', () => {
    sidebar.classList.add('open')
    overlay.classList.add('visible')
  })

  document.getElementById('sidebar-close')?.addEventListener('click', closeSidebar)
  overlay?.addEventListener('click', closeSidebar)

  function closeSidebar() {
    sidebar.classList.remove('open')
    overlay.classList.remove('visible')
  }

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await db.auth.signOut()
    location.href = 'index.html'
  })

  // ── INICIALIZACIÓN ────────────────────────────────────────
  async function init() {
    await loadProfile()
    await loadPetData()
    await loadEntries()
    await loadAchievements()

    updateUI()
    
    if (isFirstLogin) {
      sessionStorage.removeItem('first_login')
      showFirstLoginModal()
      return
    }

    loadDashboard()
    goToPage('dashboard', true)
  }

  // ── CARGA DE DATOS ───────────────────────────────────────
  async function loadProfile() {
    const { data } = await db.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  async function loadPetData() {
    // PET SYSTEM: Crear si no existe (STAGE0)
    let { data } = await db.from('pet_status').select('*').eq('user_id', user.id).single()
    
    if (!data) {
      const newPet = {
        user_id: user.id,
        xp: 0,
        pet_name: 'Arumi',
        streak_days: 0,
        total_co2_saved: 0,
        level: 1,
        active_accessories: [],
        created_at: new Date().toISOString()
      }
      const { error } = await db.from('pet_status').insert([newPet])
      if (!error) {
        showToast('¡Tu mascota ha nacido!')
        data = newPet
      }
    }
    
    petData = data
    PetSystem.renderPetMini(petData)
  }

  async function loadEntries() {
    const { data } = await db.from('carbon_entries')
      .select('*').eq('user_id', user.id)
      .order('entry_date', { ascending: false }).limit(90)
    allEntries = data || []
  }

  async function loadAchievements() {
    const { data } = await db.from('achievements').select('*').eq('user_id', user.id)
    achievements = data || []
  }

  // ── UPDATE UI ────────────────────────────────────────────
  function updateUI() {
    const initial = (profile?.full_name || profile?.email || '?')[0].toUpperCase()
    document.getElementById('nav-avatar').textContent = initial
    document.getElementById('nav-name').textContent   = profile?.full_name || 'Usuario'
    document.getElementById('nav-role').textContent   = profile?.role === 'admin' ? 'Administrador' : 'Usuario'
    document.getElementById('dash-greeting').innerHTML = `Hola, ${(profile?.full_name || 'Usuario').split(' ')[0]} 👋`

    // Admin
    if (profile?.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = '')
    }
  }

  // ── FIRST LOGIN MODAL ────────────────────────────────────
  function showFirstLoginModal() {
    goToPage('registrar', true)
    loadRegistrarPage()

    const form = document.querySelector('#page-registrar')
    const banner = document.createElement('div')
    banner.className = 'alert alert-success'
    banner.style.cssText = 'margin-bottom:20px;font-size:.95rem;padding:16px'
    banner.innerHTML = `
      <strong>¡Bienvenido/a a SmartTerra!</strong><br>
      Para conocer tu huella de carbono, completa este registro de tus hábitos de hoy.
      Solo tomará unos minutos y obtendrás recomendaciones personalizadas.
    `
    form.insertBefore(banner, form.firstChild)
  }

  // ── DASHBOARD ────────────────────────────────────────────
  function loadDashboard() {
    const today = allEntries[0]
    const last7 = allEntries.slice(0, 7)
    const avg7  = last7.reduce((s, e) => s + (e.total_co2_kg || 0), 0) / Math.max(last7.length, 1)
    const saved = allEntries.reduce((s, e) => s + Math.max(0, GLOBAL_CO2.daily - (e.total_co2_kg || 0)), 0)

    document.getElementById('stat-today').textContent  = today ? today.total_co2_kg?.toFixed(1) : '—'
    document.getElementById('stat-avg').textContent    = avg7.toFixed(1)
    document.getElementById('stat-saved').textContent  = saved.toFixed(1)
    document.getElementById('stat-streak').textContent = petData?.streak_days || 0
    document.getElementById('ref-you').textContent     = avg7.toFixed(1) + ' kg'

    if (today) {
      const badge = document.getElementById('stat-today-badge')
      badge.innerHTML = `<span class="badge ${co2BadgeClass(today.total_co2_kg)}">${co2Label(today.total_co2_kg)}</span>`
    }

    // Chart
    const chartData = [...last7].reverse().map(e => ({
      date: shortDate(e.entry_date),
      total: e.total_co2_kg || 0
    }))
    renderBarChart('dash-chart', chartData)

    // Pet mini dashboard
    PetSystem.renderPetMini(petData)

    // Recomendaciones
    if (today) {
      const recs = getRecommendations(today, { total: today.total_co2_kg })
      const recsEl = document.getElementById('dash-recs')
      const recsList = document.getElementById('dash-recs-list')
      recsList.innerHTML = recs.slice(0, 3).map(recCardHTML).join('')
      recsEl.style.display = ''
    }

    document.getElementById('dash-cta').style.display = allEntries.length === 0 ? '' : 'none'
  }

  // ── REGISTRAR FORM ───────────────────────────────────────
  let currentStep = 0
  const TOTAL_STEPS = 5

  function loadRegistrarPage() {
    currentStep = 0
    showStep(0)
    document.getElementById('entry-form')?.reset()
  }

  function showStep(n) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'))
    document.querySelectorAll('.step').forEach((s, i) => {
      s.classList.toggle('active', i === n)
      s.classList.toggle('done', i < n)
    })
    document.querySelector(`.form-step[data-step="${n}"]`)?.classList.add('active')

    const nav = document.getElementById('form-nav')
    const prev = document.getElementById('step-prev')
    const next = document.getElementById('step-next')

    if (n === TOTAL_STEPS - 1) {
      nav.style.display = 'none'
    } else {
      nav.style.display = ''
      prev.style.visibility = n === 0 ? 'hidden' : 'visible'
      next.textContent = n === TOTAL_STEPS - 2 ? 'Ver resultados' : 'Siguiente →'
    }
  }

  // ── EVENTOS FORM ────────────────────────────────────────
  document.getElementById('step-next')?.addEventListener('click', async () => {
    if (currentStep < TOTAL_STEPS - 2) {
      currentStep++
      showStep(currentStep)
    } else {
      await calcAndShowResult()
    }
  })

  document.getElementById('step-prev')?.addEventListener('click', () => {
    if (currentStep > 0) { currentStep--; showStep(currentStep) }
  })

  document.getElementById('result-edit-btn')?.addEventListener('click', () => {
    currentStep = 0; showStep(0)
  })

  document.getElementById('result-save-btn')?.addEventListener('click', saveEntry)

  // ── FORM HELPERS ────────────────────────────────────────
  function getFormData() {
    const f = document.getElementById('entry-form')
    const g = name => parseFloat(f.elements[name]?.value) || 0
    const s = name => f.elements[name]?.value || ''
    return {
      car_km: g('car_km'), car_type: s('car_type') || 'gasoline',
      moto_km: g('moto_km'), bus_urban_km: g('bus_urban_km'), 
      bus_inter_km: g('bus_inter_km'), metro_km: g('metro_km'),
      taxi_moto_km: g('taxi_moto_km'), bike_km: g('bike_km'),
      ebike_km: g('ebike_km'), flight_dom_km: g('flight_dom_km'),
      flight_sh_km: g('flight_sh_km'), flight_lh_km: g('flight_lh_km'),
      elec_kwh: g('elec_kwh'), renewable_pct: g('renewable_pct'),
      gas_m3: g('gas_m3'), glp_kg: g('glp_kg'), lena_kg: g('lena_kg'),
      beef_g: g('beef_g'), pork_g: g('pork_g'), poultry_g: g('poultry_g'),
      fish_g: g('fish_g'), eggs_g: g('eggs_g'),
      dairy_milk_g: g('dairy_milk_g'), dairy_cheese_g: g('dairy_cheese_g'),
      dairy_yogurt_g: g('dairy_yogurt_g'), rice_g: g('rice_g'),
      legumes_g: g('legumes_g'), veg_g: g('veg_g'), fruits_g: g('fruits_g'),
      proc_g: g('proc_g'), waste_kg: g('waste_kg'), recycled_kg: g('recycled_kg'),
      composted_kg: g('composted_kg'), burned_kg: g('burned_kg'),
      hot_water_min: g('hot_water_min')
    }
  }

  async function calcAndShowResult() {
    const data = getFormData()
    const co2  = calcCarbon(data)
    const recs = getRecommendations(data, co2)

    // Resultado principal
    const co2El = document.getElementById('result-co2-value')
    co2El.textContent = co2.total.toFixed(1)
    co2El.style.color = co2Color(co2.total)

    document.getElementById('result-vs').innerHTML = `
      vs objetivo: <strong style="color:var(--green)">${GLOBAL_CO2.target} kg</strong> ·
      Colombia: <strong style="color:var(--amber)">${GLOBAL_CO2.colombia} kg</strong>
    `

    // Desglose
    const breakdown = document.getElementById('result-breakdown')
    const cats = [
      {l:'Transporte',v:co2.transport,color:'#60a5fa'},
      {l:'Energía',v:co2.energy,color:'#f59e0b'},
      {l:'Comida',v:co2.food,color:'#34d399'},
      {l:'Residuos',v:co2.waste,color:'#a78bfa'},
      {l:'Agua',v:co2.water,color:'#06b6d4'}
    ]
    breakdown.innerHTML = cats.map(c => `
      <div class="breakdown-item" style="border-top-color:${c.color}">
        <div>${c.l}</div>
        <div class="breakdown-val" style="color:${c.color}">${c.v.toFixed(1)}</div>
        <small>kg CO₂</small>
      </div>
    `).join('')

    // Recomendaciones
    const recsEl = document.getElementById('result-recs')
    recsEl.innerHTML = '<h3 style="margin-bottom:12px">Recomendaciones</h3>'
    recs.slice(0, 5).forEach(rec => recsEl.insertAdjacentHTML('beforeend', recCardHTML(rec)))

    currentStep = TOTAL_STEPS - 1
    showStep(currentStep)
  }

  async function saveEntry() {
    const saveBtn = document.getElementById('result-save-btn')
    saveBtn.disabled = true

    const data = getFormData()
    const co2  = calcCarbon(data)

    const entry = {
      user_id: user.id,
      entry_date: new Date().toISOString().split('T')[0],
      total_co2_kg: co2.total,
      transport_co2_kg: co2.transport,
      energy_co2_kg: co2.energy,
      food_co2_kg: co2.food,
      waste_co2_kg: co2.waste,
      water_co2_kg: co2.water,
      ...data,
      car_type: data.car_type
    }

    const { error } = await db.from('carbon_entries').insert([entry])
    if (error) {
      showToast('Error: ' + error.message, 'error')
      saveBtn.disabled = false
      return
    }

    await updatePet(co2.total)
    await loadEntries()

    const existingKeys = achievements.map(a => a.achievement_key)
      const newOnes = checkAchievements(entry, petData, allEntries.length, existingKeys)
      for (const ach of newOnes) {
        await db.from('achievements').insert([{
          user_id: user.id,
          achievement_key: ach.key,
          xp: ach.xp,
          unlocked_at: new Date().toISOString()
        }])
        showToast(`🏆 ${ach.name}`, 'success')
      }
    await loadAchievements() 

    document.getElementById('result-saved').style.display = ''
    showToast('Guardado!')
    
    setTimeout(() => {
      loadDashboard()
      goToPage('dashboard')
    }, 1500)
  }

  // ── PET UPDATE ───────────────────────────────────────────
  async function updatePet(totalCO2) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    const newStreak = petData?.last_entry_date === yesterday 
      ? (petData.streak_days || 0) + 1 
      : petData?.last_entry_date === today 
      ? petData.streak_days 
      : 1

    const xpGain = PetSystem.calcXPGain(totalCO2, newStreak)
    const newXP = (petData?.xp || 0) + xpGain

    const { data } = await db.from('pet_status').update({
      xp: newXP,
      streak_days: newStreak,
      last_entry_date: today,
      total_co2_saved: parseFloat(((petData?.total_co2_saved || 0) + Math.max(0, GLOBAL_CO2.daily - totalCO2)).toFixed(2)),
      level: Math.floor(newXP / 100) + 1
    }).eq('user_id', user.id).select().single()

    petData = data
    if (xpGain > 0) showToast(`+${xpGain} XP`)
    PetSystem.renderPetMini(petData)
  }

  // ── MASCOTA PAGE ────────────────────────────────────────
  function loadMascota() {
    PetSystem.renderPetPage(petData)

    // Name editor
    document.getElementById('pet-name-edit-btn')?.addEventListener('click', () => {
      document.getElementById('pet-name-display').style.display = 'none'
      document.getElementById('pet-name-edit').style.display = 'flex'
      document.getElementById('pet-name-input').value = petData?.pet_name || ''
      document.getElementById('pet-name-input').focus()
    })

    document.getElementById('pet-name-save')?.addEventListener('click', async () => {
      const newName = document.getElementById('pet-name-input').value.trim()
      if (!newName) return
      
      await db.from('pet_status').update({ pet_name: newName }).eq('user_id', user.id)
      petData.pet_name = newName
      document.getElementById('pet-name-display').textContent = newName
      document.getElementById('pet-name-edit').style.display = 'none'
      
      PetSystem.renderPetMini(petData)
      showToast('Nombre actualizado!')
    })

    document.getElementById('pet-name-cancel')?.addEventListener('click', () => {
      document.getElementById('pet-name-edit').style.display = 'none'
      document.getElementById('pet-name-display').style.display = ''
    })

    document.getElementById('clear-accessories')?.addEventListener('click', PetSystem.clearAccessories)
  }

  // ── HISTORIAL ───────────────────────────────────────────
  function loadHistorial() {
    const n = allEntries.length
    document.getElementById('h-total').textContent = n
    if (n === 0) {
      document.getElementById('h-avg').textContent  = '—'
      document.getElementById('h-best').textContent = '—'
      document.getElementById('h-worst').textContent= '—'
      document.getElementById('h-count').textContent = '0 registros'
      document.getElementById('hist-list').innerHTML = '<p class="text-center text-muted" style="padding:32px">Sin registros aún</p>'
      return
    }
    const vals = allEntries.map(e => e.total_co2_kg)
    document.getElementById('h-avg').textContent   = (vals.reduce((a,b)=>a+b,0)/n).toFixed(1)
    document.getElementById('h-best').textContent  = Math.min(...vals).toFixed(1)
    document.getElementById('h-worst').textContent = Math.max(...vals).toFixed(1)
    document.getElementById('h-count').textContent = `${n} registro${n!==1?'s':''}`

    // Line chart
    const chartData = [...allEntries].reverse().slice(-30).map(e => ({
      label: shortDate(e.entry_date),
      total: e.total_co2_kg,
    }))
    renderLineChart('hist-chart', chartData)

    // Lista
    const list = document.getElementById('hist-list')
    list.innerHTML = ''
    allEntries.forEach(e => {
      const color = e.total_co2_kg <= GLOBAL_CO2.target ? 'var(--green)'
                  : e.total_co2_kg <= GLOBAL_CO2.colombia ? 'var(--amber)' : 'var(--red)'
      const row = document.createElement('div')
      row.className = 'entry-row'
      row.style.borderLeftColor = color
      row.innerHTML = `
        <div style="flex:1">
          <div class="entry-date">${longDate(e.entry_date)}</div>
          <div class="entry-cats"> ${e.transport_co2_kg} ·  ${e.energy_co2_kg} ·  ${e.food_co2_kg} ·  ${e.waste_co2_kg} kg CO₂</div>
        </div>
        <div class="entry-val" style="color:${color}">${e.total_co2_kg} kg</div>
      `
      list.appendChild(row)
    })
  }

  // ── LOGROS ───────────────────────────────────────────────
  function loadLogros() {
    renderAchievementsPage(achievements)
  }

  // ── ADMIN ────────────────────────────────────────────────
  async function loadAdmin() {
    if (profile?.role !== 'admin') return

    const [{ count: uCount }, { count: eCount }, { data: eAll }, { count: aCount }] = await Promise.all([
      db.from('profiles').select('id', { count:'exact' }),
      db.from('carbon_entries').select('id', { count:'exact' }),
      db.from('carbon_entries').select('total_co2_kg').limit(1000),
      db.from('achievements').select('id', { count:'exact' }),
    ])

    const avg = eAll?.length
      ? (eAll.reduce((s, e) => s + (e.total_co2_kg || 0), 0) / eAll.length).toFixed(1)
      : '—'

    document.getElementById('a-users').textContent       = uCount || 0
    document.getElementById('a-entries').textContent     = eCount || 0
    document.getElementById('a-avg').textContent         = avg + ' kg'
    document.getElementById('a-achievements').textContent= aCount || 0

    // Distribución
    const buckets = [
      { label:'< 4 kg (Óptimo)',   count: eAll?.filter(e => e.total_co2_kg <= 4).length || 0 },
      { label:'4–5.5 kg (Bueno)',  count: eAll?.filter(e => e.total_co2_kg > 4 && e.total_co2_kg <= 5.5).length || 0 },
      { label:'5.5–15 kg (Medio)', count: eAll?.filter(e => e.total_co2_kg > 5.5 && e.total_co2_kg <= 15).length || 0 },
      { label:'> 15 kg (Alto)',    count: eAll?.filter(e => e.total_co2_kg > 15).length || 0 },
    ]
    renderDistChart('admin-dist-chart', buckets)

    // Lista usuarios
    const { data: users } = await db.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
    const list = document.getElementById('admin-users-list')
    list.innerHTML = ''
    users?.forEach(u => {
      const row = document.createElement('div')
      row.className = 'admin-user-row'
      row.innerHTML = `
        <div class="admin-user-avatar">${(u.full_name || u.email || '?')[0].toUpperCase()}</div>
        <div class="admin-user-info">
          <div class="admin-user-name">${u.full_name || '(sin nombre)'}</div>
          <div class="admin-user-email">${u.email}</div>
        </div>
        <div class="admin-user-meta">
          <span class="badge ${u.role === 'admin' ? 'badge-amber' : 'badge-green'}">${u.role}</span>
          <div style="font-size:.72rem;color:var(--txt-3);margin-top:3px">${shortDate(u.created_at)}</div>
        </div>
      `
      list.appendChild(row)
    })

    // Buscador
    document.getElementById('admin-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase()
      list.querySelectorAll('.admin-user-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'
      })
    })
  }

  // ── PAGE DISPATCH ────────────────────────────────────────
  function onPageLoad(pageId) {
    switch (pageId) {
      case 'dashboard': loadDashboard(); break
      case 'registrar': loadRegistrarPage(); break
      case 'historial': loadHistorial(); break
      case 'mascota':   loadMascota(); break
      case 'logros':    loadLogros(); break
      case 'admin':     loadAdmin(); break
    }
  }

  // ── HELPERS ──────────────────────────────────────────────
  function recCardHTML(rec) {
    return `
      <div class="rec-card ${rec.priority}">
        <span class="rec-icon">${rec.icon}</span>
        <div>
          <div class="rec-title">${rec.title}</div>
          <div class="rec-desc">${rec.desc}</div>
          <div class="rec-action">${rec.action}</div>
        </div>
      </div>`
  }
  window.recCardHTML = recCardHTML

  function shortDate(iso) {
    return iso ? new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short' }) : '—'
  }

  function longDate(iso) {
    if (!iso) return '—'
    return new Date(iso.includes('T') ? iso : iso + 'T12:00').toLocaleDateString('es-CO', { 
      weekday:'short', day:'2-digit', month:'long', year:'numeric' 
    })
  }

  // ── ARRANCAR ────────────────────────────────────────────
  await init()
})