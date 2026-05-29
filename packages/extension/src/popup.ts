// Luminary Chrome Extension Controller

const API_BASE_URL = 'http://localhost:8080';

// DOM Elements
const elBtnToggleSettings = document.getElementById('btn-toggle-settings') as HTMLButtonElement;
const elSettingsDrawer = document.getElementById('settings-drawer') as HTMLDivElement;
const elInputApiKey = document.getElementById('input-api-key') as HTMLInputElement;
const elBtnSaveKey = document.getElementById('btn-save-key') as HTMLButtonElement;
const elSettingsStatus = document.getElementById('settings-status') as HTMLDivElement;

const elViewSetup = document.getElementById('view-setup') as HTMLDivElement;
const elViewReady = document.getElementById('view-ready') as HTMLDivElement;
const elViewScanning = document.getElementById('view-scanning') as HTMLDivElement;
const elViewResults = document.getElementById('view-results') as HTMLDivElement;

const elBtnOpenSettings = document.getElementById('btn-open-settings') as HTMLButtonElement;
const elTabTitle = document.getElementById('tab-title') as HTMLHeadingElement;
const elTabUrl = document.getElementById('tab-url') as HTMLParagraphElement;
const elBtnStartScan = document.getElementById('btn-start-scan') as HTMLButtonElement;

const elScoreValue = document.getElementById('score-value') as HTMLSpanElement;
const elScoreCircleFill = document.getElementById('score-circle-fill') as SVGElement | null;
const elTierBadge = document.getElementById('tier-badge') as HTMLSpanElement;
const elTierLabel = document.getElementById('tier-label') as HTMLSpanElement;

const elCountCritical = document.getElementById('count-critical') as HTMLSpanElement;
const elCountSerious = document.getElementById('count-serious') as HTMLSpanElement;
const elCountModerate = document.getElementById('count-moderate') as HTMLSpanElement;
const elCountMinor = document.getElementById('count-minor') as HTMLSpanElement;

const elBtnReScan = document.getElementById('btn-re-scan') as HTMLButtonElement;
const elBtnViewDashboard = document.getElementById('btn-view-dashboard') as HTMLAnchorElement;
const elViolationBadgeCount = document.getElementById('violation-badge-count') as HTMLSpanElement;
const elViolationsList = document.getElementById('violations-list') as HTMLDivElement;

let activeTabUrl = '';
let activeTabTitle = '';

// Initialize Extension
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkApiKey();
  await updateActiveTabInfo();
});

// Setup Events
function setupEventListeners() {
  // Toggle Settings drawer
  elBtnToggleSettings.addEventListener('click', () => {
    elSettingsDrawer.classList.toggle('hidden');
  });

  elBtnOpenSettings.addEventListener('click', () => {
    elSettingsDrawer.classList.remove('hidden');
    elInputApiKey.focus();
  });

  // Save API Key
  elBtnSaveKey.addEventListener('click', saveApiKey);

  // Start Audit
  elBtnStartScan.addEventListener('click', runAudit);
  elBtnReScan.addEventListener('click', runAudit);
}

// Retrieve saved API Key
async function checkApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['luminary_api_key'], (result) => {
      const key = result.luminary_api_key || null;
      if (key) {
        elInputApiKey.value = key;
        showView(elViewReady);
      } else {
        showView(elViewSetup);
      }
      resolve(key);
    });
  });
}

// Save API Key locally
function saveApiKey() {
  const rawKey = elInputApiKey.value.trim();
  
  if (!rawKey) {
    showStatus('Please enter a key.', 'error');
    return;
  }

  if (!rawKey.startsWith('lum_live_')) {
    showStatus('Key must start with lum_live_', 'error');
    return;
  }

  chrome.storage.local.set({ luminary_api_key: rawKey }, () => {
    showStatus('API Key saved successfully.', 'success');
    setTimeout(() => {
      elSettingsDrawer.classList.add('hidden');
      elSettingsStatus.className = 'status-msg';
      elSettingsStatus.textContent = '';
      showView(elViewReady);
    }, 1000);
  });
}

function showStatus(message: string, type: 'success' | 'error') {
  elSettingsStatus.className = `status-msg ${type}`;
  elSettingsStatus.textContent = message;
}

// Retrieve active browser tab details
async function updateActiveTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url) {
      activeTabUrl = activeTab.url;
      activeTabTitle = activeTab.title || 'Active Page';
      
      elTabTitle.textContent = activeTabTitle;
      elTabUrl.textContent = activeTabUrl;
      
      // If user is trying to scan a chrome internal page
      if (activeTabUrl.startsWith('chrome://') || activeTabUrl.startsWith('about:')) {
        elBtnStartScan.disabled = true;
        elBtnStartScan.classList.remove('btn-glow');
        elBtnStartScan.style.opacity = '0.5';
        elTabTitle.textContent = 'System Page Restricted';
        elTabUrl.textContent = 'Chrome extensions cannot audit internal browser settings.';
      } else {
        elBtnStartScan.disabled = false;
        elBtnStartScan.classList.add('btn-glow');
        elBtnStartScan.style.opacity = '1';
      }
    } else {
      elTabTitle.textContent = 'No Webpage Active';
      elTabUrl.textContent = 'Navigate to a website first';
      elBtnStartScan.disabled = true;
    }
  });
}

// Trigger standard WCAG scan from background
async function runAudit() {
  try {
    const keyResult = await new Promise<{ luminary_api_key?: string }>((res) => {
      chrome.storage.local.get(['luminary_api_key'], (result) => {
        res(result);
      });
    });

    const apiKey = keyResult.luminary_api_key;
    if (!apiKey) {
      elSettingsDrawer.classList.remove('hidden');
      elInputApiKey.focus();
      showStatus('API Key is required to run a scan.', 'error');
      return;
    }

    showView(elViewScanning);

    const res = await fetch(`${API_BASE_URL}/api/public/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ url: activeTabUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Scan failed.');
    }

    renderScanResults(data);
    showView(elViewResults);

  } catch (err: any) {
    console.error('[Luminary Extension] Error performing scan:', err);
    alert(`Audit Error: ${err.message || 'Check your API Key and backend connection.'}`);
    showView(elViewReady);
  }
}

// Render dynamic scorecard panel
function renderScanResults(data: any) {
  const score = data.score ?? 0;
  
  // Overall score text
  elScoreValue.textContent = score.toString();

  // Circular progress ring dash calculation
  if (elScoreCircleFill) {
    const r = 42;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (circumference * score) / 100;
    
    elScoreCircleFill.setAttribute('style', `stroke-dashoffset: ${offset}px;`);
    
    // Set score ring colors based on score tiers
    let color = 'var(--critical)';
    if (score >= 90) color = 'var(--success)';
    else if (score >= 70) color = 'var(--serious)';
    
    elScoreCircleFill.style.stroke = color;
  }

  // Tier metadata setup
  let badgeText = 'Critical Issues';
  let badgeClass = 'critical';
  let tierLabel = 'Severe access restrictions found. Remediation required.';

  if (score >= 90) {
    badgeText = 'Excellent';
    badgeClass = 'success';
    tierLabel = 'Great accessibility! Keep maintaining high standards.';
  } else if (score >= 80) {
    badgeText = 'Good';
    badgeClass = 'minor';
    tierLabel = 'Minor visual contrast or nesting issues spotted.';
  } else if (score >= 60) {
    badgeText = 'Moderate';
    badgeClass = 'moderate';
    tierLabel = 'Nesting or interactive button flaws require attention.';
  }

  elTierBadge.textContent = badgeText;
  elTierBadge.className = `tier-badge ${badgeClass}`;
  elTierLabel.textContent = tierLabel;

  // Breakdown severity summaries
  const counts = data.counts || { critical: 0, serious: 0, moderate: 0, minor: 0 };
  elCountCritical.textContent = (counts.critical ?? 0).toString();
  elCountSerious.textContent = (counts.serious ?? 0).toString();
  elCountModerate.textContent = (counts.moderate ?? 0).toString();
  elCountMinor.textContent = (counts.minor ?? 0).toString();

  // Load violations list details
  elViolationsList.innerHTML = '';
  const violations = data.violations || [];
  elViolationBadgeCount.textContent = `${violations.length} items`;

  if (violations.length === 0) {
    const cleanState = document.createElement('div');
    cleanState.className = 'text-center p-4 text-xs text-muted';
    cleanState.textContent = '🎉 No accessibility violations found on this page!';
    elViolationsList.appendChild(cleanState);
  } else {
    violations.forEach((violation: any) => {
      const card = createViolationCard(violation);
      elViolationsList.appendChild(card);
    });
  }

  // Point "Remediation Workspace" link to our main web dashboard (e.g. settings/scan view or home)
  elBtnViewDashboard.href = `http://localhost:3000/dashboard`;
}

// Scaffold a detailed violation card
function createViolationCard(violation: any): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'violation-card';

  const severity = violation.impact || 'minor';
  const ruleId = violation.id || 'rule';
  const description = violation.description || 'No description provided';
  const elementContext = violation.nodes?.[0]?.html || '';

  card.innerHTML = `
    <div class="violation-meta">
      <span class="v-badge ${severity}">${severity}</span>
      <span class="v-rule">${ruleId}</span>
    </div>
    <div class="v-desc">${description}</div>
    ${elementContext ? `<div class="v-context" title="${elementContext.replace(/"/g, '&quot;')}">${escapeHtml(elementContext)}</div>` : ''}
  `;

  return card;
}

// Safely escape markup text
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to switch view containers
function showView(targetView: HTMLDivElement) {
  const views = [elViewSetup, elViewReady, elViewScanning, elViewResults];
  views.forEach((v) => {
    if (v) v.classList.add('hidden');
  });
  if (targetView) targetView.classList.remove('hidden');
}
