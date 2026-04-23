const snippetInput = document.getElementById('snippetInput');
const previewFrame = document.getElementById('previewFrame');
const eventLog = document.getElementById('eventLog');
const eventCount = document.getElementById('eventCount');
const statusPill = document.getElementById('statusPill');
const showDemoButton = document.getElementById('showDemoButton');
const clearButton = document.getElementById('clearButton');
const applyButton = document.getElementById('applyButton');
const copyButton = document.getElementById('copyButton');
const liveSnippetInput = document.getElementById('liveSnippetInput');
const runLiveButton = document.getElementById('runLiveButton');
const diagnoseButton = document.getElementById('diagnoseButton');
const loadLiveSampleButton = document.getElementById('loadLiveSampleButton');
const requestAdButton = document.getElementById('requestAdButton');
const adSlotInput = document.getElementById('adSlotInput');
const liveMount = document.getElementById('liveMount');
const adSlotStage = document.getElementById('adSlotStage');
const sampleTemplate = document.getElementById('sampleTemplate');

const storageKey = 'offerwall-test-lab-snippet';
const liveStorageKey = 'offerwall-test-lab-live-snippet';
const slotStorageKey = 'offerwall-test-lab-slot';
const adsenseScriptSelector = 'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';
const defaultSnippet = sampleTemplate.innerHTML.trim();
const defaultLiveSnippet = `<section style="padding:16px; border-radius:14px; background:#0d1429; border:1px solid rgba(173,198,255,.3); color:#f4f7ff;">
  <p style="margin:0 0 8px; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:#8bb3ff;">Live page integration</p>
  <h3 style="margin:0 0 8px; font-size:20px;">Top-level AdSense test surface</h3>
  <p style="margin:0; color:#aab6d3; line-height:1.5;">This runs directly in the page (not in iframe sandbox), so use it to validate integration behavior on your deployed domain.</p>
</section>`;
const maxEvents = 6;
let events = [];
let adsenseScriptState = 'unknown';

function addEvent(label, message, tone = 'status-ok') {
  const item = { label, message, tone, time: new Date() };
  events = [item, ...events].slice(0, maxEvents);
  renderEvents();
}

function renderEvents() {
  eventLog.innerHTML = events
    .map(
      (entry) => `
        <article class="event-item">
          <span class="label ${entry.tone}">${entry.label}</span>
          <div class="message">${entry.message}</div>
        </article>
      `,
    )
    .join('');

  eventCount.textContent = `${events.length} event${events.length === 1 ? '' : 's'}`;
}

function setStatus(text, tone = 'status-ok') {
  statusPill.textContent = text;
  statusPill.className = tone;
}

function applyPreview(html) {
  previewFrame.innerHTML = '';
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals');
  frame.style.width = '100%';
  frame.style.minHeight = '280px';
  frame.style.border = '0';
  frame.style.background = 'transparent';
  frame.srcdoc = html;
  previewFrame.appendChild(frame);
}

function saveSnippet(value) {
  localStorage.setItem(storageKey, value);
}

function loadSnippet() {
  return localStorage.getItem(storageKey) || defaultSnippet;
}

function saveLiveSnippet(value) {
  localStorage.setItem(liveStorageKey, value);
}

function loadLiveSnippet() {
  return localStorage.getItem(liveStorageKey) || defaultLiveSnippet;
}

function saveSlot(value) {
  localStorage.setItem(slotStorageKey, value);
}

function loadSlot() {
  return localStorage.getItem(slotStorageKey) || '';
}

function getAdsByGoogleScript() {
  return document.querySelector(adsenseScriptSelector);
}

function hasAdsByGoogleScript() {
  return Boolean(getAdsByGoogleScript());
}

function ensureAdsQueue() {
  if (!window.adsbygoogle) {
    window.adsbygoogle = [];
  }

  return window.adsbygoogle;
}

function isAdsQueueReady() {
  const queue = window.adsbygoogle;
  return Boolean(queue && typeof queue.push === 'function');
}

function wireAdSenseScriptLifecycle() {
  const script = getAdsByGoogleScript();
  if (!script) {
    adsenseScriptState = 'missing';
    return;
  }

  adsenseScriptState = script.dataset.loadState || 'loading';
  if (script.dataset.wired === 'true') {
    return;
  }

  script.dataset.wired = 'true';
  script.addEventListener('load', () => {
    script.dataset.loadState = 'loaded';
    adsenseScriptState = 'loaded';
    addEvent('AdSense script', 'AdSense script loaded.', 'status-ok');
    runDiagnostics();
  });

  script.addEventListener('error', () => {
    script.dataset.loadState = 'error';
    adsenseScriptState = 'error';
    addEvent('AdSense script', 'AdSense script failed to load. Check ad blocker or CSP.', 'status-warn');
    runDiagnostics();
  });
}

function getPageContextSummary() {
  const secure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  return {
    host: window.location.host,
    protocol: window.location.protocol,
    secure,
  };
}

function runLiveSnippet() {
  const html = liveSnippetInput.value.trim();
  if (!html) {
    addEvent('Live validation', 'Add a live snippet first.', 'status-warn');
    setStatus('Live snippet missing', 'status-warn');
    return;
  }

  liveMount.innerHTML = html;
  saveLiveSnippet(html);
  addEvent('Live snippet', 'Snippet rendered in top-level page context.');
  setStatus('Live snippet running', 'status-ok');
}

function runDiagnostics() {
  const context = getPageContextSummary();
  const hasScript = hasAdsByGoogleScript();
  if (hasScript) {
    ensureAdsQueue();
  }
  const queueReady = isAdsQueueReady();

  const lines = [
    `Host: ${context.host || 'unknown'}`,
    `Protocol: ${context.protocol}`,
    `Secure context: ${context.secure ? 'yes' : 'no'}`,
    `AdSense script tag: ${hasScript ? 'found' : 'missing'}`,
    `AdSense script state: ${adsenseScriptState}`,
    `window.adsbygoogle queue: ${queueReady ? 'ready' : 'not ready'}`,
  ];

  const tone = hasScript && queueReady && adsenseScriptState !== 'error' ? 'status-ok' : 'status-warn';
  addEvent('Diagnostics', lines.join(' | '), tone);
  setStatus(tone === 'status-ok' ? 'Diagnostics ok' : 'Diagnostics warn', tone);
}

function clearAdSlot() {
  adSlotStage.innerHTML = '<div style="color:#aab6d3;">Ad slot area is ready. Add your slot ID and request an ad.</div>';
}

function requestDisplayAd() {
  const slot = adSlotInput.value.trim();
  if (!slot) {
    addEvent('Ad request', 'Enter your AdSense slot ID first.', 'status-warn');
    setStatus('Missing slot ID', 'status-warn');
    return;
  }

  if (!hasAdsByGoogleScript()) {
    addEvent('Ad request', 'AdSense script is missing on this page.', 'status-warn');
    setStatus('Script missing', 'status-warn');
    return;
  }

  saveSlot(slot);
  adSlotStage.innerHTML = `<ins class="adsbygoogle" style="display:block; min-height:90px;" data-ad-client="ca-pub-3567573687988202" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;

  try {
    const queue = ensureAdsQueue();
    queue.push({});
    addEvent('Ad request', `Ad request pushed for slot ${slot}.`);
    setStatus('Ad request sent', 'status-ok');
  } catch {
    addEvent('Ad request', 'Ad request failed. Check console, domain approval, and policy status.', 'status-warn');
    setStatus('Ad request failed', 'status-warn');
  }
}

function loadLiveSample() {
  liveSnippetInput.value = defaultLiveSnippet;
  runLiveSnippet();
}

function applyCurrentSnippet(source = 'manual update') {
  const html = snippetInput.value.trim();
  if (!html) {
    setStatus('Snippet missing', 'status-warn');
    addEvent('Validation', 'Paste an offerwall snippet before applying it.', 'status-warn');
    return;
  }

  saveSnippet(html);
  applyPreview(html);
  setStatus('Preview updated', 'status-ok');
  addEvent('Preview updated', `Applied snippet from ${source}.`);
}

function showDemoOfferwall() {
  snippetInput.value = defaultSnippet;
  applyCurrentSnippet('demo mode');
  addEvent('Demo offerwall', 'Loaded the built-in sample offerwall message.', 'status-ok');
}

function clearWorkspace() {
  snippetInput.value = '';
  liveSnippetInput.value = '';
  adSlotInput.value = '';
  previewFrame.innerHTML = '<div style="color:#aab6d3; padding:8px 2px;">Preview cleared. Paste a snippet and apply it to render your offerwall test state.</div>';
  liveMount.innerHTML = '<div style="color:#aab6d3;">Live area cleared. Add snippet and run on live page.</div>';
  clearAdSlot();
  events = [];
  renderEvents();
  setStatus('Ready', 'status-ok');
  localStorage.removeItem(storageKey);
  localStorage.removeItem(liveStorageKey);
  localStorage.removeItem(slotStorageKey);
}

snippetInput.value = loadSnippet();
liveSnippetInput.value = loadLiveSnippet();
adSlotInput.value = loadSlot();
applyPreview(snippetInput.value);
liveMount.innerHTML = '<div style="color:#aab6d3;">Click Run on live page to execute your snippet in top-page context.</div>';
clearAdSlot();
addEvent('Session ready', 'Loaded your last saved snippet into the preview area.');
wireAdSenseScriptLifecycle();

applyButton.addEventListener('click', () => applyCurrentSnippet('the editor'));
showDemoButton.addEventListener('click', showDemoOfferwall);
clearButton.addEventListener('click', clearWorkspace);
runLiveButton.addEventListener('click', runLiveSnippet);
diagnoseButton.addEventListener('click', runDiagnostics);
loadLiveSampleButton.addEventListener('click', loadLiveSample);
requestAdButton.addEventListener('click', requestDisplayAd);
adSlotInput.addEventListener('change', () => saveSlot(adSlotInput.value.trim()));
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(defaultSnippet);
    addEvent('Copied', 'Sample snippet copied to your clipboard.');
    setStatus('Sample copied', 'status-ok');
  } catch {
    snippetInput.value = defaultSnippet;
    snippetInput.focus();
    snippetInput.select();
    addEvent('Copy fallback', 'Clipboard access was blocked, so the sample snippet was loaded into the editor instead.', 'status-warn');
    setStatus('Clipboard blocked', 'status-warn');
  }
});

window.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'offerwall-demo-click') {
    addEvent('Offerwall action', 'The preview button was clicked inside the sandboxed frame.');
    setStatus('Demo interaction captured', 'status-ok');
  }
});

runDiagnostics();
setTimeout(runDiagnostics, 1500);
