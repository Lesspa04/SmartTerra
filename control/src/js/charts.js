// ============================================================
// CHARTS — Barras HTML y línea en Canvas
// ============================================================

// ──────────────────────────────────────────
// BAR CHART (HTML puro, apilado)
// data: [{label, transport, energy, food, waste}]
// ──────────────────────────────────────────
function renderBarChart(containerId, data, maxOverride) {
  const wrap = document.getElementById(containerId)
  if (!wrap) return
  if (!data || data.length === 0) {
    wrap.innerHTML = '<div class="chart-empty">Sin datos aún 📊</div>'
    return
  }

  const max = maxOverride || Math.max(...data.map(d => d.total || d.co2 || 0), GLOBAL_CO2.daily) * 1.1
  const H   = wrap.clientHeight || 200

  // Líneas de referencia
  const targetPct = (GLOBAL_CO2.target / max * 100)
  const worldPct  = (GLOBAL_CO2.daily  / max * 100)

  wrap.innerHTML = `
    <div class="chart-ref-line" style="bottom:${targetPct}%">
      <span style="color:var(--green)">↔ ${GLOBAL_CO2.target} kg</span>
    </div>
    <div class="chart-ref-line" style="bottom:${worldPct}%;border-top:1px dashed var(--red)">
      <span style="color:var(--red)">↔ ${GLOBAL_CO2.daily} kg</span>
    </div>
  `

  data.forEach(d => {
    const total = d.total ?? d.co2 ?? 0
    const col   = document.createElement('div')
    col.className = 'bar-col'

    const pct = Math.min(100, (total / max) * 100)
    const color = total <= GLOBAL_CO2.target ? 'var(--green)' :
                  total <= GLOBAL_CO2.colombia ? 'var(--amber)' : 'var(--red)'

    // Si hay desglose, apilamos segmentos
    const hasBreakdown = d.transport !== undefined
    let innerHtml = ''

    if (hasBreakdown) {
      const cats = [
        { key:'waste',     color:'#a78bfa', val: d.waste     || 0 },
        { key:'food',      color:'#34d373', val: d.food      || 0 },
        { key:'energy',    color:'#f59e0b', val: d.energy    || 0 },
        { key:'transport', color:'#60a5fa', val: d.transport || 0 },
      ]
      // Pintamos de abajo a arriba
      cats.filter(c => c.val > 0).forEach(c => {
        const segH = (c.val / max) * 100
        innerHtml += `<div class="bar-segment" style="background:${c.color};height:${segH}%;flex-shrink:0" title="${c.key}: ${c.val} kg CO₂"></div>`
      })
    } else {
      innerHtml = `<div style="width:100%;height:${pct}%;background:${color};border-radius:5px 5px 0 0;min-height:2px"></div>`
    }

    col.innerHTML = `
      <div class="bar-col-inner" style="height:${pct}%;flex-direction:column-reverse;display:flex;align-items:stretch;width:100%;max-width:36px;border-radius:5px 5px 0 0;overflow:hidden"
           title="${d.label || d.date}: ${total} kg CO₂">
        ${innerHtml}
        <div class="bar-col-val">${total}</div>
      </div>
      <div class="bar-col-label">${d.label || d.date}</div>
    `
    wrap.appendChild(col)
  })
}

// ──────────────────────────────────────────
// LINE CHART (Canvas)
// ──────────────────────────────────────────
function renderLineChart(containerId, data) {
  const wrap = document.getElementById(containerId)
  if (!wrap) return
  if (!data || data.length < 2) {
    wrap.innerHTML = '<div class="chart-empty">Necesitas al menos 2 registros para ver la tendencia</div>'
    return
  }

  wrap.innerHTML = '<canvas></canvas>'
  const canvas = wrap.querySelector('canvas')
  const dpr    = window.devicePixelRatio || 1
  const W      = wrap.clientWidth  || 600
  const H      = 260

  canvas.width  = W * dpr
  canvas.height = H * dpr
  canvas.style.width  = W + 'px'
  canvas.style.height = H + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const pad  = { top:20, right:20, bottom:40, left:40 }
  const cW   = W - pad.left - pad.right
  const cH   = H - pad.top  - pad.bottom
  const vals = data.map(d => d.total)
  const max  = Math.max(...vals, GLOBAL_CO2.daily) * 1.1
  const min  = 0

  const xPos = (i) => pad.left + (i / (data.length - 1)) * cW
  const yPos = (v) => pad.top + (1 - (v - min) / (max - min)) * cH

  // Background grid
  ctx.strokeStyle = 'rgba(52,211,115,.07)'
  ctx.lineWidth   = 1
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * cH
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke()
  }

  // Reference lines
  const drawRefLine = (val, color, label) => {
    const y = yPos(val)
    if (y < pad.top || y > pad.top + cH) return
    ctx.strokeStyle = color
    ctx.lineWidth   = 1
    ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = color
    ctx.font = '10px "DM Sans", sans-serif'
    ctx.fillText(label, pad.left + cW - 80, y - 4)
  }
  drawRefLine(GLOBAL_CO2.target, 'rgba(52,211,115,.7)', `Objetivo ${GLOBAL_CO2.target} kg`)
  drawRefLine(GLOBAL_CO2.daily,  'rgba(248,113,113,.7)', `Mundial ${GLOBAL_CO2.daily} kg`)

  // Gradient fill under line
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH)
  grad.addColorStop(0, 'rgba(52,211,115,.18)')
  grad.addColorStop(1, 'rgba(52,211,115,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(xPos(0), yPos(vals[0]))
  data.forEach((d, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(vals[i])) })
  ctx.lineTo(xPos(data.length - 1), pad.top + cH)
  ctx.lineTo(xPos(0), pad.top + cH)
  ctx.closePath(); ctx.fill()

  // Main line
  ctx.strokeStyle = '#34d373'
  ctx.lineWidth   = 2.5
  ctx.lineJoin    = 'round'
  ctx.lineCap     = 'round'
  ctx.setLineDash([])
  ctx.beginPath()
  data.forEach((d, i) => {
    i === 0 ? ctx.moveTo(xPos(i), yPos(vals[i])) : ctx.lineTo(xPos(i), yPos(vals[i]))
  })
  ctx.stroke()

  // Dots
  data.forEach((d, i) => {
    const v   = vals[i]
    const col = v <= GLOBAL_CO2.target ? '#34d373' : v <= GLOBAL_CO2.colombia ? '#f59e0b' : '#f87171'
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(xPos(i), yPos(v), 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#0c1a10'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  // X-axis labels
  ctx.fillStyle = 'rgba(142,184,154,.7)'
  ctx.font = '10px "DM Sans", sans-serif'
  ctx.textAlign = 'center'
  const step = Math.ceil(data.length / 8)
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1) {
      ctx.fillText(d.label, xPos(i), pad.top + cH + 18)
    }
  })

  // Y-axis labels
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) / 4) * (4 - i)
    ctx.fillText(v.toFixed(0), pad.left - 6, pad.top + (i / 4) * cH + 4)
  }
}

// ──────────────────────────────────────────
// ADMIN distribution chart
// ──────────────────────────────────────────
function renderDistChart(containerId, buckets) {
  const wrap = document.getElementById(containerId)
  if (!wrap) return

  const max = Math.max(...buckets.map(b => b.count), 1)
  wrap.innerHTML = '<div class="dist-chart"></div>'
  const chart = wrap.querySelector('.dist-chart')

  const colors = ['var(--green)', 'var(--green-2)', 'var(--amber)', 'var(--red)']
  buckets.forEach((b, i) => {
    const pct = (b.count / max * 100)
    const row = document.createElement('div')
    row.className = 'dist-bar-row'
    row.innerHTML = `
      <div class="dist-label">${b.label}</div>
      <div class="dist-bar-track">
        <div class="dist-bar-fill" style="width:${pct}%;background:${colors[i] || colors[3]}">
          <span class="dist-count">${b.count}</span>
        </div>
      </div>
    `
    chart.appendChild(row)
  })
}

window.renderBarChart  = renderBarChart
window.renderLineChart = renderLineChart
window.renderDistChart = renderDistChart