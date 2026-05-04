// ============================================================
// AUTH — Login & Registro
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  function showErr(el, msg) {
    el.textContent = msg
    el.style.display = 'block'
  }
  function setLoading(btn, loading) {
    btn.disabled = loading
    btn.querySelector('.btn-text').style.display = loading ? 'none' : ''
    btn.querySelector('.btn-spinner').style.display = loading ? '' : 'none'
  }

  // --- TABS ---
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'))
      tab.classList.add('active')
      document.getElementById(`form-${tab.dataset.tab}`).classList.add('active')
    })
  })

  // --- EYE BUTTONS ---
  document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.target)
      inp.type = inp.type === 'password' ? 'text' : 'password'
      btn.textContent = inp.type === 'password' ? '👁' : '🙈'
    })
  })

  // --- LOGIN ---
  const loginForm = document.getElementById('form-login')
  loginForm.addEventListener('submit', async e => {
    e.preventDefault()
    const errEl = document.getElementById('login-error')
    const btn   = document.getElementById('login-btn')
    errEl.style.display = 'none'
    setLoading(btn, true)

    const email    = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value

    const { error } = await db.auth.signInWithPassword({ email, password })
    if (error) {
      errEl.textContent = 'Email o contraseña incorrectos'
      errEl.style.display = 'block'
      setLoading(btn, false)
    } else {
      location.href = '/app.html'
    }
  })

  // --- REGISTRO ---
  const regForm = document.getElementById('form-register')
  regForm.addEventListener('submit', async e => {
    e.preventDefault()
    const errEl = document.getElementById('register-error')
    const sucEl = document.getElementById('register-success')
    const btn   = document.getElementById('register-btn')
    errEl.style.display = 'none'
    sucEl.style.display = 'none'

    const name    = document.getElementById('reg-name').value.trim()
    const email   = document.getElementById('reg-email').value.trim()
    const pass    = document.getElementById('reg-pass').value
    const confirm = document.getElementById('reg-confirm').value

    if (!name) { showErr(errEl, 'Ingresa tu nombre'); return }
    if (pass.length < 6) { showErr(errEl, 'Mínimo 6 caracteres en la contraseña'); return }
    if (pass !== confirm) { showErr(errEl, 'Las contraseñas no coinciden'); return }

    setLoading(btn, true)
    const { error } = await db.auth.signUp({
      email, password: pass,
      options: { data: { full_name: name } }
    })

    if (error) {
      showErr(errEl, error.message)
      setLoading(btn, false)
    } else {
      // Marcar que es primer login para redirigir a encuesta
      sessionStorage.setItem('first_login', '1')
      sucEl.innerHTML = '¡Cuenta creada! Revisa tu email para confirmar tu cuenta y luego inicia sesión.'
      sucEl.style.display = 'block'
      regForm.reset()
      setLoading(btn, false)
    }
  })

  ;(async () => {
    // Si ya hay sesión activa, redirigir a la app
    try {
      const { data: { session } } = await db.auth.getSession()
      if (session) { 
        location.href = 'app.html' 
        return 
      }
    } catch(err) {
      console.log('Auth check error:', err)
    }
  })()
})