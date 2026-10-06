const $ = (selector) => document.querySelector(selector);

async function profile() { return (await chrome.storage.local.get('profile')).profile || {}; }
async function activeTab() { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); return tab; }
async function send(action) {
  const tab = await activeTab();
  if (!tab?.id || !/^https?:/.test(tab.url || '')) throw new Error('Open a job application page first.');
  return chrome.tabs.sendMessage(tab.id, { action, profile: await profile() });
}
function show(message, type = 'ok') { const out = $('#result'); out.className = `result ${type}`; out.textContent = message; }

async function init() {
  const data = await profile();
  const ready = Boolean(data.firstName && data.email);
  $('#setup-card').classList.toggle('hidden', ready);
  $('#app-card').classList.toggle('hidden', !ready);
  if (ready) $('#profile-summary').textContent = `${data.firstName}, ApplyPilot will only use your saved local details.`;
}
$('#open-setup').onclick = () => chrome.runtime.openOptionsPage();
$('#open-settings').onclick = () => chrome.runtime.openOptionsPage();
$('#fill').onclick = async () => { try { const r = await send('fill'); show(r.message, r.unresolved ? 'warn' : 'ok'); } catch (e) { show(e.message, 'warn'); } };
$('#next').onclick = async () => { try { const r = await send('next'); show(r.message, r.isFinal ? 'warn' : 'ok'); } catch (e) { show(e.message, 'warn'); } };
init();
