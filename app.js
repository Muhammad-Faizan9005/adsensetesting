const snippetInput = document.getElementById('snippetInput');
const previewFrame = document.getElementById('previewFrame');
const eventLog = document.getElementById('eventLog');
const eventCount = document.getElementById('eventCount');
const statusPill = document.getElementById('statusPill');
const showDemoButton = document.getElementById('showDemoButton');
const clearButton = document.getElementById('clearButton');
const applyButton = document.getElementById('applyButton');
const copyButton = document.getElementById('copyButton');
const sampleTemplate = document.getElementById('sampleTemplate');

const storageKey = 'offerwall-test-lab-snippet';
const defaultSnippet = sampleTemplate.innerHTML.trim();
const maxEvents = 6;
let events = [];

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
  previewFrame.innerHTML = '<div style="color:#aab6d3; padding:8px 2px;">Preview cleared. Paste a snippet and apply it to render your offerwall test state.</div>';
  events = [];
  renderEvents();
  setStatus('Ready', 'status-ok');
  localStorage.removeItem(storageKey);
}

snippetInput.value = loadSnippet();
applyPreview(snippetInput.value);
addEvent('Session ready', 'Loaded your last saved snippet into the preview area.');

applyButton.addEventListener('click', () => applyCurrentSnippet('the editor'));
showDemoButton.addEventListener('click', showDemoOfferwall);
clearButton.addEventListener('click', clearWorkspace);
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
