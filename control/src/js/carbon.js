// ============================================================
// CÁLCULO DE HUELLA DE CARBONO — SmartTerra
//
// Fuentes de factores de emisión:
//   [1] IPCC AR6 (2022) — Anexo II, Tabla 2.SM.1
//       https://www.ipcc.ch/report/ar6/wg3/
//   [2] Our World in Data — "Food's carbon footprint" (Poore & Nemecek, 2018, Science)
//       https://ourworldindata.org/food-choice-vs-eating-local
//   [3] UPME (2023) — Factor de emisión red eléctrica Colombia: 0.2330 tCO2/MWh
//       https://www.upme.gov.co/
//   [4] EPA (2023) — Emission Factors for Greenhouse Gas Inventories
//       https://www.epa.gov/climateleadership/ghg-emission-factors-hub
//   [5] DEFRA (2023) — Greenhouse Gas Reporting: Conversion Factors
//       https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting
//   [6] IDEAM (2021) — Inventario Nacional de GEI Colombia
//       https://www.ideam.gov.co/
// ============================================================

const EMISSION_SOURCES = {
  // ── TRANSPORTE ──────────────────────────────────────────
  // Fuente [4][5]: kg CO₂eq por km recorrido (incluye ciclo de vida del combustible)
  car: {
    gasoline: 0.192,  // Promedio vehículo liviano gasolina [DEFRA 2023]
    diesel:   0.171,  // Promedio vehículo liviano diésel [DEFRA 2023]
    hybrid:   0.109,  // Híbrido enchufable promedio [DEFRA 2023]
    electric: 0.053,  // Eléctrico con mix colombiano [UPME 2023 + DEFRA]
    moto:     0.114,  // Motocicleta promedio [EPA 2023]
  },
  bus_urban:    0.089,  // Bus urbano (BRT/MIO tipo) [DEFRA 2023]
  bus_inter:    0.037,  // Bus intermunicipal / largo recorrido [DEFRA 2023]
  metro:        0.028,  // Metro/tren eléctrico [DEFRA 2023]
  taxi_moto:    0.130,  // Mototaxi / taxi moto [EPA 2023]
  bike:         0.000,  // Bicicleta convencional [—]
  ebike:        0.005,  // Bicicleta eléctrica [DEFRA 2023]
  walk:         0.000,  // Caminar [—]
  // Vuelos — por km recorrido (incluye factor de radiación forzada ×1.9) [DEFRA 2023]
  flight_domestic:      0.255,  // <500 km — clase económica
  flight_short_haul:    0.195,  // 500-1500 km — clase económica [DEFRA 2023]
  flight_long_haul:     0.195,  // >1500 km — clase económica [DEFRA 2023]

  // ── ENERGÍA HOGAR ───────────────────────────────────────
  electricity_co: 0.2330, // kg CO₂/kWh — Red eléctrica Colombia [UPME 2023, dato 3]
  gas_natural:    2.0400, // kg CO₂/m³  — Gas natural residencial [IDEAM 2021, dato 6]
  glp:            1.6430, // kg CO₂/kg  — Gas propano (GLP) [DEFRA 2023]
  leña:           0.4070, // kg CO₂/kg  — Leña (biomasa no sostenible) [IPCC AR6]

  // ── ALIMENTACIÓN ────────────────────────────────────────
  // Fuente [2]: kg CO₂eq por kg de alimento (promedio global ponderado por sistema)
  // Poore & Nemecek (2018) — "Reducing food's environmental impacts" — Science 360
  beef:         27.00, // Carne de res (promedio ganadería extensiva/intensiva)
  pork:          7.61, // Cerdo
  poultry:       6.90, // Pollo y otras aves
  fish_farmed:   5.10, // Pescado de acuicultura
  fish_wild:     1.34, // Pescado de pesca extractiva (promedio)
  eggs:          4.21, // Huevos
  dairy_milk:    2.79, // Leche (por litro ≈ kg)
  dairy_cheese: 13.50, // Queso
  dairy_yogurt:  2.19, // Yogurt
  rice:          2.50, // Arroz (incluye metano de cultivo) [IPCC AR6]
  legumes:       0.90, // Leguminosas (fríjol, lenteja, garbanzo)
  vegetables:    0.86, // Verduras promedio
  fruits:        0.43, // Frutas promedio
  processed:     4.20, // Alimentos ultraprocesados (promedio estimado) [DEFRA 2023]
  nuts:          0.26, // Nueces y semillas

  // ── RESIDUOS ────────────────────────────────────────────
  // Fuente [1][6]: kg CO₂eq por kg de residuo
  waste_landfill:  0.58, // Relleno sanitario (incluye CH4) [IPCC AR6]
  waste_recycled: -0.21, // Reciclaje (ahorro por evitar extracción) [DEFRA 2023]
  waste_composted:-0.08, // Compostaje (ahorro vs relleno) [IPCC AR6]
  waste_burned:    0.85, // Quema a cielo abierto [IDEAM 2021]

  // ── AGUA ────────────────────────────────────────────────
  // Fuente [4]: kg CO₂eq por m³
  water_heated:  0.34,  // Agua caliente domiciliaria (gas) [DEFRA 2023]
}
window.EMISSION_SOURCES = EMISSION_SOURCES

const GLOBAL_REF = {
  daily:    15.10,  // kg CO₂eq/día — promedio mundial [Our World in Data 2023]
  colombia:  5.50,  // kg CO₂eq/día — promedio Colombia [IDEAM 2021]
  target:    3.84,  // kg CO₂eq/día — objetivo Paris 1.5°C para 2030 [IPCC AR6 SPM]
  lat_am:    6.10,  // kg CO₂eq/día — promedio Latinoamérica [Our World in Data]
}
window.GLOBAL_CO2 = GLOBAL_REF

// ============================================================
// FUNCIÓN DE CÁLCULO PRINCIPAL
// Recibe el objeto "d" con todos los campos del formulario
// ============================================================
function calcCarbon(d) {

  // ─── TRANSPORTE ──────────────────────────────────────────
  const carFactor = EMISSION_SOURCES.car[d.car_type] ?? EMISSION_SOURCES.car.gasoline
  const transport =
    (d.car_km         || 0) * carFactor +
    (d.moto_km        || 0) * EMISSION_SOURCES.car.moto +
    (d.bus_urban_km   || 0) * EMISSION_SOURCES.bus_urban +
    (d.bus_inter_km   || 0) * EMISSION_SOURCES.bus_inter +
    (d.metro_km       || 0) * EMISSION_SOURCES.metro +
    (d.taxi_moto_km   || 0) * EMISSION_SOURCES.taxi_moto +
    (d.bike_km        || 0) * EMISSION_SOURCES.bike +
    (d.ebike_km       || 0) * EMISSION_SOURCES.ebike +
    (d.flight_dom_km  || 0) * EMISSION_SOURCES.flight_domestic +
    (d.flight_sh_km   || 0) * EMISSION_SOURCES.flight_short_haul +
    (d.flight_lh_km   || 0) * EMISSION_SOURCES.flight_long_haul

  // ─── ENERGÍA ─────────────────────────────────────────────
  const renewFactor = 1 - Math.min(100, Math.max(0, d.renewable_pct || 0)) / 100
  const energy =
    (d.elec_kwh  || 0) * EMISSION_SOURCES.electricity_co * renewFactor +
    (d.gas_m3    || 0) * EMISSION_SOURCES.gas_natural +
    (d.glp_kg    || 0) * EMISSION_SOURCES.glp +
    (d.lena_kg   || 0) * EMISSION_SOURCES.leña

  // ─── ALIMENTACIÓN ────────────────────────────────────────
  // Los campos en gramos → convertimos a kg
  const g = (v) => (v || 0) / 1000
  const food =
    g(d.beef_g)      * EMISSION_SOURCES.beef +
    g(d.pork_g)      * EMISSION_SOURCES.pork +
    g(d.poultry_g)   * EMISSION_SOURCES.poultry +
    g(d.fish_g)      * EMISSION_SOURCES.fish_farmed +
    g(d.eggs_g)      * EMISSION_SOURCES.eggs +
    g(d.dairy_g)     * EMISSION_SOURCES.dairy_milk +
    g(d.cheese_g)    * EMISSION_SOURCES.dairy_cheese +
    g(d.rice_g)      * EMISSION_SOURCES.rice +
    g(d.legumes_g)   * EMISSION_SOURCES.legumes +
    g(d.veg_g)       * EMISSION_SOURCES.vegetables +
    g(d.fruits_g)    * EMISSION_SOURCES.fruits +
    g(d.proc_g)      * EMISSION_SOURCES.processed

  // ─── RESIDUOS ────────────────────────────────────────────
  const waste =
    (d.waste_kg       || 0) * EMISSION_SOURCES.waste_landfill +
    (d.recycled_kg    || 0) * EMISSION_SOURCES.waste_recycled +
    (d.composted_kg   || 0) * EMISSION_SOURCES.waste_composted +
    (d.burned_kg      || 0) * EMISSION_SOURCES.waste_burned

  // ─── AGUA ────────────────────────────────────────────────
  const water =
    (d.hot_water_min || 0) * (10 / 60) * EMISSION_SOURCES.water_heated // 10 L/min promedio ducha

  const total = Math.max(0, transport + energy + food + waste + water)

  return {
    transport: r2(transport),
    energy:    r2(energy),
    food:      r2(food),
    waste:     r2(waste),
    water:     r2(water),
    total:     r2(total),
  }
}

function r2(n) { return Math.round(n * 100) / 100 }

// ============================================================
// RECOMENDACIONES PERSONALIZADAS (con fuentes)
// ============================================================
function getRecommendations(d, co2) {
  const recs = []

  // TRANSPORTE
  if ((d.car_km || 0) > 10 && d.car_type === 'gasoline') {
    recs.push({ priority:'high', icon:'🚌',
      title:'Cambia al transporte público',
      desc:`${d.car_km} km en carro gasolina = ${r2(d.car_km * EMISSION_SOURCES.car.gasoline)} kg CO₂. El bus urbano emite 77% menos por km.`,
      action:'Prueba SITP/MIO/Transmilenio en al menos 2 trayectos esta semana',
      source:'DEFRA (2023)'
    })
  }
  if ((d.car_type === 'gasoline' || d.car_type === 'diesel') && (d.car_km || 0) > 0) {
    recs.push({ priority:'medium', icon:'⚡',
      title:'Considera un vehículo eléctrico',
      desc:`Un eléctrico con la red colombiana emite ${EMISSION_SOURCES.car.electric} kg CO₂/km vs ${EMISSION_SOURCES.car[d.car_type]} en tu vehículo actual (${r2((1 - EMISSION_SOURCES.car.electric/EMISSION_SOURCES.car[d.car_type])*100)}% menos).`,
      action:'Revisa los incentivos tributarios para vehículos eléctricos en Colombia (Ley 1964/2019)',
      source:'UPME 2023 · DEFRA 2023'
    })
  }
  if ((d.flight_dom_km || 0) + (d.flight_sh_km || 0) + (d.flight_lh_km || 0) > 0) {
    const flightCO2 = r2(
      (d.flight_dom_km || 0) * EMISSION_SOURCES.flight_domestic +
      (d.flight_sh_km  || 0) * EMISSION_SOURCES.flight_short_haul +
      (d.flight_lh_km  || 0) * EMISSION_SOURCES.flight_long_haul
    )
    recs.push({ priority:'high', icon:'✈️',
      title:'Los vuelos tienen alto impacto',
      desc:`Tus vuelos de hoy generaron ${flightCO2} kg CO₂eq (factor ×1.9 de radiación forzada incluido).`,
      action:'Compensa tus vuelos en plataformas certificadas Gold Standard o VCS',
      source:'DEFRA 2023 · IPCC AR6'
    })
  }
  if ((d.bike_km || 0) >= 3) {
    recs.push({ priority:'positive', icon:'🚴',
      title:'¡Pedalear es la mejor opción!',
      desc:`${d.bike_km} km en bici ahorraste ${r2(d.bike_km * EMISSION_SOURCES.car.gasoline)} kg CO₂ vs carro. Cero emisiones, cero costo.`,
      action:'¡Sigue pedaleando! Cada km en bici reduce tu huella y mejora tu salud',
      source:'—'
    })
  }

  // ENERGÍA
  if ((d.elec_kwh || 0) > 10) {
    recs.push({ priority:'medium', icon:'💡',
      title:'Reduce tu consumo eléctrico',
      desc:`${d.elec_kwh} kWh × 0.233 kgCO₂/kWh (red colombiana) = ${r2(d.elec_kwh * 0.233)} kg CO₂. El hogar promedio CO consume ~9 kWh/día.`,
      action:'Desconecta dispositivos en stand-by y reemplaza bombillas por LED',
      source:'UPME 2023 · CREG'
    })
  }
  if ((d.renewable_pct || 0) < 20) {
    recs.push({ priority:'medium', icon:'☀️',
      title:'Adopta energía solar',
      desc:'Colombia tiene uno de los mayores potenciales solares de América Latina (4.5–6 kWh/m²/día en muchas regiones).',
      action:'Consulta el FENOGE (Fondo ENE) y la Ley 1715/2014 para incentivos de paneles solares',
      source:'UPME 2023 · MinEnergía'
    })
  }
  if ((d.gas_m3 || 0) > 1.5) {
    recs.push({ priority:'medium', icon:'🔥',
      title:'Alto consumo de gas natural',
      desc:`${d.gas_m3} m³ × 2.04 kgCO₂/m³ = ${r2(d.gas_m3 * 2.04)} kg CO₂. Reducir la temperatura de la ducha y cocinar eficientemente ayuda.`,
      action:'Instala calefactor solar o ducha eléctrica de bajo consumo',
      source:'IDEAM 2021'
    })
  }

  // ALIMENTACIÓN
  if ((d.beef_g || 0) > 80) {
    recs.push({ priority:'high', icon:'🥩',
      title:'La res tiene la mayor huella alimentaria',
      desc:`${d.beef_g}g de res = ${r2(d.beef_g/1000*27)} kg CO₂eq. La ganadería bovina representa ~65% de las emisiones del sector agropecuario en CO.`,
      action:'Sustituye por pollo (74% menos CO₂), fríjol (97% menos) o huevo (84% menos)',
      source:'Poore & Nemecek (2018) Science · IDEAM 2021'
    })
  }
  if ((d.pork_g || 0) > 150) {
    recs.push({ priority:'medium', icon:'🐖',
      title:'Modera el consumo de cerdo',
      desc:`${d.pork_g}g de cerdo = ${r2(d.pork_g/1000*7.61)} kg CO₂eq. Es más eficiente que la res, pero aún supera a legumbres y vegetales.`,
      action:'Alterna con proteínas vegetales como lenteja o garbanzo',
      source:'Poore & Nemecek (2018) Science'
    })
  }
  if ((d.rice_g || 0) > 200) {
    recs.push({ priority:'medium', icon:'🍚',
      title:'El arroz tiene alta huella por el metano',
      desc:`${d.rice_g}g de arroz = ${r2(d.rice_g/1000*2.5)} kg CO₂eq. El arroz inundado libera metano (CH4), un GEI 28× más potente que el CO₂.`,
      action:'Combina con papa, plátano o quinua que tienen menor huella',
      source:'IPCC AR6 · Poore & Nemecek 2018'
    })
  }
  if ((d.veg_g || 0) + (d.fruits_g || 0) + (d.legumes_g || 0) < 200) {
    recs.push({ priority:'medium', icon:'🥦',
      title:'Aumenta vegetales, frutas y legumbres',
      desc:'Una dieta basada en plantas emite 2–3× menos CO₂eq que una dieta omnívora según el metaanálisis de Poore & Nemecek.',
      action:'Incorpora al menos 400g de frutas y verduras diarias (recomendación OMS)',
      source:'Poore & Nemecek (2018) Science · OMS'
    })
  }

  // RESIDUOS
  if ((d.waste_kg || 0) > 0.5) {
    const recycleRatio = (d.recycled_kg || 0) / (d.waste_kg || 1)
    if (recycleRatio < 0.25) {
      recs.push({ priority:'medium', icon:'♻️',
        title:'Recicla más para reducir emisiones',
        desc:`Solo reciclaste ${Math.round(recycleRatio*100)}% de tus residuos. Cada kg en relleno sanitario emite 0.58 kg CO₂eq (incluye metano a 28 años).`,
        action:'Separa en 4 categorías: vidrio, papel/cartón, plásticos, metales. Busca tu punto limpio más cercano.',
        source:'IPCC AR6 · IDEAM 2021'
      })
    }
  }
  if ((d.composted_kg || 0) > 0) {
    recs.push({ priority:'positive', icon:'🌱',
      title:'¡El compostaje reduce tus residuos!',
      desc:'Compostar evita que los residuos orgánicos generen metano en rellenos sanitarios. Cada kg compostado ahorra 0.08 kg CO₂eq vs relleno.',
      action:'¡Sigue compostando! Comparte el compost con jardines o huertas comunitarias',
      source:'IPCC AR6'
    })
  }

  // GENERAL
  if (co2.total <= GLOBAL_REF.target) {
    recs.push({ priority:'positive', icon:'🏆',
      title:'¡Huella por debajo del objetivo climático!',
      desc:`${co2.total} kg CO₂eq está bajo los ${GLOBAL_REF.target} kg/día del objetivo IPCC para 1.5°C. ¡Eres parte de la solución!`,
      action:'Comparte tus hábitos e inspira a tu comunidad',
      source:'IPCC AR6 SPM'
    })
  } else if (co2.total > GLOBAL_REF.daily) {
    recs.push({ priority:'high', icon:'⚠️',
      title:'Tu huella supera el promedio mundial',
      desc:`${co2.total} kg CO₂eq > promedio mundial de ${GLOBAL_REF.daily} kg/día. Para cumplir París necesitamos llegar a ${GLOBAL_REF.target} kg/día.`,
      action:'Elige la recomendación de mayor impacto y comprométete esta semana',
      source:'Our World in Data 2023 · IPCC AR6'
    })
  }

  return recs.sort((a, b) => {
    const o = { high:0, medium:1, positive:2 }
    return (o[a.priority] ?? 3) - (o[b.priority] ?? 3)
  })
}

// ─── Color helpers ───────────────────────────────────────────
function co2Color(kg) {
  if (kg <= GLOBAL_REF.target)   return 'var(--green)'
  if (kg <= GLOBAL_REF.colombia) return 'var(--amber)'
  return 'var(--red)'
}
function co2BadgeClass(kg) {
  if (kg <= GLOBAL_REF.target)   return 'badge-green'
  if (kg <= GLOBAL_REF.colombia) return 'badge-amber'
  return 'badge-red'
}
function co2Label(kg) {
  if (kg <= GLOBAL_REF.target)   return '¡Bajo el objetivo!'
  if (kg <= GLOBAL_REF.colombia) return 'Aceptable'
  if (kg <= GLOBAL_REF.daily)    return 'Por mejorar'
  return 'Alta huella'
}

window.calcCarbon         = calcCarbon
window.getRecommendations = getRecommendations
window.co2Color           = co2Color
window.co2BadgeClass      = co2BadgeClass
window.co2Label           = co2Label