/* ============================================================
   converter.js — All operations via real API
   Loaded only on dashboard.html
============================================================ */

const API_BASE_URL = 'http://localhost:5071/api/v1';

/* ── Unit definitions
   value      = what we send to API (enum string)
   label      = what user sees in dropdown
   toBase/fromBase = local fallback only for compare display
──────────────────────────────────────────────────────────── */
const UNITS = {
  weight: {
    title: 'Weight',
    units: [
      { value: 'KILOGRAM',  label: 'Kilogram (kg)',   toBase: v => v * 1000,    fromBase: v => v / 1000 },
      { value: 'GRAM',      label: 'Gram (g)',         toBase: v => v,           fromBase: v => v },
      { value: 'POUND',     label: 'Pound (lb)',       toBase: v => v * 453.592, fromBase: v => v / 453.592 },
      { value: 'OUNCE',     label: 'Ounce (oz)',       toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
    ]
  },
  volume: {
    title: 'Volume',
    units: [
      { value: 'MILLILITRE', label: 'Millilitre (mL)', toBase: v => v,          fromBase: v => v },
      { value: 'GALLON',     label: 'Gallon (gal)',    toBase: v => v * 3785.41, fromBase: v => v / 3785.41 },
    ]
  },
  length: {
    title: 'Length',
    units: [
      { value: 'CENTIMETERS', label: 'Centimetre (cm)', toBase: v => v,         fromBase: v => v },
      { value: 'INCHES',      label: 'Inch (in)',       toBase: v => v * 2.54,  fromBase: v => v / 2.54 },
      { value: 'FEET',        label: 'Foot (ft)',       toBase: v => v * 30.48, fromBase: v => v / 30.48 },
      { value: 'YARDS',       label: 'Yard (yd)',       toBase: v => v * 91.44, fromBase: v => v / 91.44 },
    ]
  },
  temperature: {
    title: 'Temperature',
    units: [
      { value: 'CELSIUS',    label: 'Celsius (°C)',    toBase: v => v,                  fromBase: v => v },
      { value: 'FAHRENHEIT', label: 'Fahrenheit (°F)', toBase: v => (v-32)*5/9,         fromBase: v => v*9/5+32 },
      { value: 'KELVIN',     label: 'Kelvin (K)',      toBase: v => v - 273.15,         fromBase: v => v + 273.15 },
    ]
  }
};

let currentCategory  = 'weight';
let currentOperation = 'convert';
let lastResults      = {};

/* ══════════════ INIT ══════════════ */
window.addEventListener('DOMContentLoaded', () => {
  setCategory('weight', document.querySelector('.cat-btn.active'));
  loadHistory();
});

/* ══════════════ CATEGORY ══════════════ */
function setCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const data = UNITS[cat];
  document.getElementById('convTitle').textContent = data.title + ' Converter';

  ['fromUnit','toUnit',
   'cmpUnitA','cmpUnitB',
   'addUnitA','addUnitB','addUnitResult',
   'subUnitA','subUnitB','subUnitResult',
   'divUnitA','divUnitB'].forEach(id => populateSelect(id, data.units));

  ['toUnit','cmpUnitB','addUnitB','subUnitB','divUnitB'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.options.length > 1) el.selectedIndex = 1;
  });

  clearAllPanels();
}

function populateSelect(id, units) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '';
  units.forEach(u => {
    const opt = document.createElement('option');
    opt.value       = u.value;
    opt.textContent = u.label;
    sel.appendChild(opt);
  });
}

/* ══════════════ OPERATION TABS ══════════════ */
function setOperation(op, btn) {
  currentOperation = op;
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.op-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + op).classList.add('active');
}

/* ══════════════ BUILD REQUEST BODY ══════════════ */
/*
  QuantityInputDTO:
  {
    thisQuantityDTO: { value: number, unitName: "KILOGRAM" },
    thatQuantityDTO: { value: number, unitName: "GRAM" }
  }
*/
function buildBody(valA, unitA, valB, unitB) {
  return JSON.stringify({
    thisQuantityDTO: { value: parseFloat(valA), unitName: unitA },
    thatQuantityDTO: { value: parseFloat(valB), unitName: unitB }
  });
}

/* ══════════════ CONVERT ══════════════ */
async function convert() {
  const raw     = document.getElementById('inputValue').value;
  const fromVal = document.getElementById('fromUnit').value;
  const toVal   = document.getElementById('toUnit').value;
  const box     = document.getElementById('resultBox');

  if (!raw || isNaN(parseFloat(raw))) {
    document.getElementById('resultValue').textContent = '—';
    document.getElementById('resultUnit').textContent  = '';
    box.classList.remove('has-value');
    lastResults.convert = null;
    return;
  }

  try {
    const res  = await apiCall(`${API_BASE_URL}/quantities/convert`, {
      method: 'POST',
      body:   buildBody(raw, fromVal, 0, toVal)
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) { showToast(data?.message || 'Convert failed.'); return; }

    /* Response: { resultValue, resultUnit, operation, measureType ... } */
    const val   = fmt(data.resultValue);
    const unit  = data.resultUnit || toVal;

    document.getElementById('resultValue').textContent = val;
    document.getElementById('resultUnit').textContent  = unit;
    box.classList.add('has-value');

    lastResults.convert = {
      op: 'convert', category: currentCategory,
      text: `${raw} ${fromVal} → ${val} ${unit}`
    };

    await loadHistory();
  } catch (e) { showToast('API error: ' + e.message); }
}

function swapUnits() {
  const from = document.getElementById('fromUnit');
  const to   = document.getElementById('toUnit');
  const tmp  = from.value;
  from.value = to.value;
  to.value   = tmp;
  if (document.getElementById('inputValue').value) convert();
}

function clearConvert() {
  document.getElementById('inputValue').value        = '';
  document.getElementById('resultValue').textContent = '—';
  document.getElementById('resultUnit').textContent  = '';
  document.getElementById('resultBox').classList.remove('has-value');
  lastResults.convert = null;
}

/* ══════════════ COMPARE ══════════════ */
async function doCompare() {
  const vA = document.getElementById('cmpValA').value;
  const vB = document.getElementById('cmpValB').value;
  const uA = document.getElementById('cmpUnitA').value;
  const uB = document.getElementById('cmpUnitB').value;

  if (!vA || !vB) { showToast('Enter both values to compare.'); return; }

  try {
    const res  = await apiCall(`${API_BASE_URL}/quantities/compare`, {
      method: 'POST',
      body:   buildBody(vA, uA, vB, uB)
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) { showToast(data?.message || 'Compare failed.'); return; }

    /* Response: { resultString: "true"/"false", thisValue, thisUnit, thatValue, thatUnit } */
    const box  = document.getElementById('cmpResult');
    const text = document.getElementById('cmpResultText');
    box.style.display = 'flex';
    box.className     = 'result-box';

    const isEqual = String(data.resultString).toLowerCase() === 'true';
    let msg = '';

    if (isEqual) {
      msg = `${vA} ${uA} = ${vB} ${uB} — They are EQUAL`;
      box.classList.add('equal');
    } else {
      /* API returns false for not equal — use local math to determine which is greater */
      const units = UNITS[currentCategory].units;
      const unitA = units.find(u => u.value === uA);
      const unitB = units.find(u => u.value === uB);
      const baseA = unitA ? unitA.toBase(parseFloat(vA)) : parseFloat(vA);
      const baseB = unitB ? unitB.toBase(parseFloat(vB)) : parseFloat(vB);

      if (baseA > baseB) {
        msg = `${vA} ${uA} > ${vB} ${uB} — Value A is GREATER`;
        box.classList.add('greater');
      } else {
        msg = `${vA} ${uA} < ${vB} ${uB} — Value B is GREATER`;
        box.classList.add('lesser');
      }
    }

    text.textContent = msg;
    lastResults.compare = { op: 'compare', category: currentCategory, text: msg };

    await loadHistory();
  } catch (e) { showToast('API error: ' + e.message); }
}

/* ══════════════ ADD ══════════════ */
async function doAdd() {
  const vA = document.getElementById('addValA').value;
  const vB = document.getElementById('addValB').value;
  const uA = document.getElementById('addUnitA').value;
  const uB = document.getElementById('addUnitB').value;

  if (!vA || !vB) { showToast('Enter both values to add.'); return; }

  try {
    const res  = await apiCall(`${API_BASE_URL}/quantities/add`, {
      method: 'POST',
      body:   buildBody(vA, uA, vB, uB)
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) { showToast(data?.message || 'Add failed.'); return; }

    const val  = fmt(data.resultValue);
    const unit = data.resultUnit || uA;

    document.getElementById('addResult').style.display = 'flex';
    document.getElementById('addResult').className     = 'result-box has-value';
    document.getElementById('addResultText').textContent = val;
    document.getElementById('addResultUnit').textContent = unit;

    lastResults.add = {
      op: 'add', category: currentCategory,
      text: `${vA} ${uA} + ${vB} ${uB} = ${val} ${unit}`
    };

    await loadHistory();
  } catch (e) { showToast('API error: ' + e.message); }
}

/* ══════════════ SUBTRACT ══════════════ */
async function doSubtract() {
  const vA = document.getElementById('subValA').value;
  const vB = document.getElementById('subValB').value;
  const uA = document.getElementById('subUnitA').value;
  const uB = document.getElementById('subUnitB').value;

  if (!vA || !vB) { showToast('Enter both values to subtract.'); return; }

  try {
    const res  = await apiCall(`${API_BASE_URL}/quantities/subtract`, {
      method: 'POST',
      body:   buildBody(vA, uA, vB, uB)
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) { showToast(data?.message || 'Subtract failed.'); return; }

    const val  = fmt(data.resultValue);
    const unit = data.resultUnit || uA;

    document.getElementById('subResult').style.display = 'flex';
    document.getElementById('subResult').className     = 'result-box has-value';
    document.getElementById('subResultText').textContent = val;
    document.getElementById('subResultUnit').textContent = unit;

    lastResults.subtract = {
      op: 'subtract', category: currentCategory,
      text: `${vA} ${uA} − ${vB} ${uB} = ${val} ${unit}`
    };

    await loadHistory();
  } catch (e) { showToast('API error: ' + e.message); }
}

/* ══════════════ DIVIDE ══════════════ */
async function doDivide() {
  const vA = document.getElementById('divValA').value;
  const vB = document.getElementById('divValB').value;
  const uA = document.getElementById('divUnitA').value;
  const uB = document.getElementById('divUnitB').value;

  if (!vA || !vB) { showToast('Enter both values to divide.'); return; }
  if (parseFloat(vB) === 0) { showToast('Cannot divide by zero.'); return; }

  try {
    const res  = await apiCall(`${API_BASE_URL}/quantities/divide`, {
      method: 'POST',
      body:   buildBody(vA, uA, vB, uB)
    });
    if (!res) return;

    const data = await res.json();
    if (!res.ok) { showToast(data?.message || 'Divide failed.'); return; }

    const val = fmt(data.resultValue);

    document.getElementById('divResult').style.display = 'flex';
    document.getElementById('divResult').className     = 'result-box has-value';
    document.getElementById('divResultText').textContent = val;

    lastResults.divide = {
      op: 'divide', category: currentCategory,
      text: `${vA} ${uA} ÷ ${vB} ${uB} = ${val}`
    };

    await loadHistory();
  } catch (e) { showToast('API error: ' + e.message); }
}

/* ══════════════ HISTORY — from SSMS via API ══════════════ */
async function loadHistory() {
  try {
    const res = await apiCall(`${API_BASE_URL}/quantities/history`);
    if (!res || !res.ok) return;
    const data = await res.json();
    renderHistory(Array.isArray(data) ? data : []);
  } catch (e) {
    console.warn('History load failed:', e.message);
  }
}

function renderHistory(records) {
  const body = document.getElementById('historyBody');
  if (!records.length) {
    body.innerHTML = '<p class="no-history">No operations yet.</p>';
    return;
  }

  body.innerHTML = `
    <table class="hist-table">
      <thead>
        <tr><th>Operation</th><th>Type</th><th>Details</th><th>Time</th></tr>
      </thead>
      <tbody>
        ${records.map(e => `
          <tr>
            <td><span class="op-badge ${(e.operation||'').toLowerCase()}">${e.operation || ''}</span></td>
            <td><span class="hist-badge ${(e.measureType||'').toLowerCase()}">${e.measureType || ''}</span></td>
            <td style="font-size:13px">${buildDetailText(e)}</td>
            <td style="color:var(--text-muted);font-size:11px;white-space:nowrap">
              ${e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function buildDetailText(e) {
  const op = (e.operation || '').toLowerCase();
  const v1 = e.thisValue  ?? e.operandOne ?? '';
  const u1 = e.thisUnit   ?? '';
  const v2 = e.thatValue  ?? e.operandTwo ?? '';
  const u2 = e.thatUnit   ?? '';
  const rv = e.resultValue ?? e.result ?? '';
  const ru = e.resultUnit  ?? '';
  const rs = e.resultString ?? '';

  if (op === 'compare') return `${v1} ${u1}  vs  ${v2} ${u2}  →  ${rs}`;
  if (op === 'divide')  return `${v1} ${u1}  ÷  ${v2} ${u2}  =  ${rv}`;
  if (op === 'add')     return `${v1} ${u1}  +  ${v2} ${u2}  =  ${rv} ${ru}`;
  if (op === 'subtract')return `${v1} ${u1}  −  ${v2} ${u2}  =  ${rv} ${ru}`;
  if (op === 'convert') return `${v1} ${u1}  →  ${rv} ${ru}`;
  return `${v1} ${u1}  →  ${rv} ${ru}`;
}

/* ══════════════ SAVE TO HISTORY (re-fetch) ══════════════ */
async function saveToHistory(op) {
  /* History is automatically saved by API on every operation.
     This button just re-fetches to confirm it's saved. */
  await loadHistory();
  showToast('Saved to history!', 'success');
}

async function clearHistory() {
  if (!confirm('Clear all history? (Admin only)')) return;
  try {
    const res = await apiCall(`${API_BASE_URL}/quantities/all`, { method: 'DELETE' });
    if (res && res.ok) {
      renderHistory([]);
      showToast('History cleared.', 'success');
    } else {
      showToast('Only Admin role can delete all records.');
    }
  } catch (e) { showToast('Error: ' + e.message); }
}

/* ══════════════ CLEAR HELPERS ══════════════ */
function clearPanel(op) {
  if (op === 'compare') {
    document.getElementById('cmpValA').value = '';
    document.getElementById('cmpValB').value = '';
    const box = document.getElementById('cmpResult');
    box.style.display = 'none'; box.className = 'result-box';
    document.getElementById('cmpResultText').textContent = '';
  }
  if (op === 'add') {
    document.getElementById('addValA').value = '';
    document.getElementById('addValB').value = '';
    document.getElementById('addResult').style.display = 'none';
    document.getElementById('addResultText').textContent = '';
    document.getElementById('addResultUnit').textContent = '';
  }
  if (op === 'subtract') {
    document.getElementById('subValA').value = '';
    document.getElementById('subValB').value = '';
    document.getElementById('subResult').style.display = 'none';
    document.getElementById('subResultText').textContent = '';
    document.getElementById('subResultUnit').textContent = '';
  }
  if (op === 'divide') {
    document.getElementById('divValA').value = '';
    document.getElementById('divValB').value = '';
    document.getElementById('divResult').style.display = 'none';
    document.getElementById('divResultText').textContent = '';
  }
  lastResults[op] = null;
}

function clearAllPanels() {
  clearConvert();
  ['compare','add','subtract','divide'].forEach(clearPanel);
}

/* ══════════════ UTILITIES ══════════════ */
function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.0001 && n !== 0))
    return Number(n).toExponential(4);
  return parseFloat(Number(n).toFixed(6)).toString();
}

/* ── Toast notification ── */
function showToast(msg, type = 'error') {
  let t = document.getElementById('qma-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'qma-toast';
    t.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:9999;
      padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;
      max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.15);
      transition:opacity 0.3s;font-family:var(--font);`;
    document.body.appendChild(t);
  }
  t.textContent       = msg;
  t.style.background  = type === 'success' ? '#eaf6ef' : '#fcebeb';
  t.style.color       = type === 'success' ? '#1a7a3f' : '#a32d2d';
  t.style.border      = `1px solid ${type === 'success' ? '#1a7a3f' : '#e24b4b'}`;
  t.style.opacity     = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3500);
}