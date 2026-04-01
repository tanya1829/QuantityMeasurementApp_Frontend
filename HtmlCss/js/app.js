const API_BASE     = 'http://localhost:5071/api/v1';
const APP_HISTORY_KEY = 'qma_history';

/* ---------- Token helpers ---------- */
function getToken()        { return localStorage.getItem('qma_token'); }
function getRefreshToken() { return localStorage.getItem('qma_refresh'); }
function setTokens(access, refresh) {
  localStorage.setItem('qma_token',   access);
  localStorage.setItem('qma_refresh', refresh);
}
function clearTokens() {
  localStorage.removeItem('qma_token');
  localStorage.removeItem('qma_refresh');
  localStorage.removeItem('qma_user');
}

/* ---------- User helpers ---------- */
function getCurrentUser() {
  const raw = localStorage.getItem('qma_user');
  return raw ? JSON.parse(raw) : null;
}
function setCurrentUser(user) {
  localStorage.setItem('qma_user', JSON.stringify(user));
}

/* ---------- Auth headers ---------- */
function authHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

/* ---------- Auth Guard ---------- */
(function authGuard() {
  const path        = window.location.pathname;
  const isDashboard = path.includes('dashboard.html');
  const isMeasure   = path.includes('measurement.html');
  const isIndex     = path.includes('index.html') || path === '/' || path.endsWith('/');
  const token       = getToken();

  if ((isDashboard || isMeasure) && !token) {
    window.location.href = 'index.html'; return;
  }
  if (isIndex && token) {
    window.location.href = 'dashboard.html'; return;
  }
  if ((isDashboard || isMeasure) && token) {
    const user = getCurrentUser();
    const el   = document.getElementById('navUser');
    if (el && user) el.textContent = 'Hello, ' + (user.username || user.email);
  }
})();

/* ---------- API call with auto token refresh on 401 ---------- */
async function apiCall(url, options = {}) {
  options.headers = { ...authHeaders(), ...(options.headers || {}) };
  let res = await fetch(url, options);
  if (res.status === 401) {
    const ok = await tryRefresh();
    if (ok) {
      options.headers['Authorization'] = 'Bearer ' + getToken();
      res = await fetch(url, options);
    } else {
      clearTokens();
      window.location.href = 'index.html';
      return null;
    }
  }
  return res;
}

/* ---------- Refresh token ---------- */
async function tryRefresh() {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken: rt })
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch { return false; }
}

/* ---------- Logout ---------- */
async function logout() {
  try {
    await fetch(`${API_BASE}/auth/revoke`, {
      method: 'POST', headers: authHeaders()
    });
  } catch { }
  clearTokens();
  window.location.href = 'index.html';
}

/* ---------- History helpers (local — converter.js uses these) ---------- */
function getHistory() {
  const raw = localStorage.getItem(APP_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveHistory(entry) {
  const list = getHistory();
  list.unshift(entry);
  if (list.length > 50) list.pop();
  localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(list));
}
function clearHistoryStorage() {
  localStorage.removeItem(APP_HISTORY_KEY);
}