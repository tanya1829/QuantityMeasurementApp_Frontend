function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginTab').classList.toggle('active',   isLogin);
  document.getElementById('signupTab').classList.toggle('active', !isLogin);
  document.getElementById('loginForm').classList.toggle('active',  isLogin);
  document.getElementById('signupForm').classList.toggle('active', !isLogin);
  clearMessages();
}

function togglePass(inputId, btn) {
  const input  = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type        = isText ? 'password' : 'text';
  btn.style.opacity = isText ? '1' : '0.5';
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className   = 'msg-box ' + type;
}

function clearMessages() {
  ['loginMsg','signupMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'msg-box'; }
  });
  ['loginEmailErr','loginPassErr','signupNameErr',
   'signupEmailErr','signupPassErr','signupMobileErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function showFieldErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone)  { return /^[+]?[\d\s\-]{7,15}$/.test(phone); }

/* ---------- LOGIN ---------- */
async function handleLogin(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  let valid   = true;

  if (!isValidEmail(email)) { showFieldErr('loginEmailErr', 'Enter a valid email.'); valid = false; }
  if (pass.length < 6)      { showFieldErr('loginPassErr',  'Min 6 characters.');    valid = false; }
  if (!valid) return;

  const btn = document.querySelector('#loginForm .submit-btn');
  btn.disabled = true; btn.textContent = 'Logging in...';

  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email, password: pass })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg('loginMsg', data?.message || data?.title || 'Invalid email or password.', 'error');
      btn.disabled = false; btn.textContent = 'Login';
      return;
    }

    /* Store JWT tokens */
    setTokens(data.accessToken, data.refreshToken);

    /* Get user info from /me */
    try {
      const meRes  = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': 'Bearer ' + data.accessToken }
      });
      const meData = await meRes.json();
      setCurrentUser({ username: meData.username, email: meData.email, id: meData.id });
    } catch {
      setCurrentUser({ username: email, email: email });
    }

    showMsg('loginMsg', 'Login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);

  } catch (err) {
    showMsg('loginMsg', 'Cannot connect to server. Is API running on port 5071?', 'error');
    btn.disabled = false; btn.textContent = 'Login';
  }
}

/* ---------- SIGNUP ---------- */
async function handleSignup(event) {
  event.preventDefault();
  clearMessages();

  const name   = document.getElementById('signupName').value.trim();
  const email  = document.getElementById('signupEmail').value.trim();
  const pass   = document.getElementById('signupPass').value;
  const mobile = document.getElementById('signupMobile').value.trim();
  let valid    = true;

  if (name.length < 2)       { showFieldErr('signupNameErr',   'Enter a username (min 2 chars).'); valid = false; }
  if (!isValidEmail(email))  { showFieldErr('signupEmailErr',  'Enter a valid email.');            valid = false; }
  if (pass.length < 6)       { showFieldErr('signupPassErr',   'Min 6 characters.');              valid = false; }
  if (!isValidPhone(mobile)) { showFieldErr('signupMobileErr', 'Enter a valid mobile number.');   valid = false; }
  if (!valid) return;

  const btn = document.querySelector('#signupForm .submit-btn');
  btn.disabled = true; btn.textContent = 'Creating account...';

  try {
    const res  = await fetch(`${API_BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        username: name,
        email:    email,
        password: pass
      })
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg('signupMsg', data?.message || data?.title || 'Registration failed.', 'error');
      btn.disabled = false; btn.textContent = 'Signup';
      return;
    }

    showMsg('signupMsg', 'Account created! Please login now.', 'success');
    setTimeout(() => {
      btn.disabled = false; btn.textContent = 'Signup';
      switchTab('login');
      document.getElementById('loginEmail').value = email;
    }, 1200);

  } catch (err) {
    showMsg('signupMsg', 'Cannot connect to server. Is API running on port 5071?', 'error');
    btn.disabled = false; btn.textContent = 'Signup';
  }
}