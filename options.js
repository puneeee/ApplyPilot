const form = document.querySelector('#profile-form');
const fields = [...form.elements].filter((el) => el.name);
const status = document.querySelector('#saved');
let existing = {};
const send = (message) => chrome.runtime.sendMessage(message);

async function load() {
  existing = (await chrome.storage.local.get('profile')).profile || {};
  for (const field of fields) {
    if (field.type === 'checkbox') field.checked = Boolean(existing[field.name]);
    else field.value = existing[field.name] || '';
  }
  const resume = await send({ action: 'resumeInfo' });
  if (resume?.name) document.querySelector('#resume-name').textContent = `Saved locally: ${resume.name}`;
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const profile = { ...existing };
  for (const field of fields) profile[field.name] = field.type === 'checkbox' ? field.checked : field.value.trim();
  const file = document.querySelector('#resume').files[0];
  if (file) {
    if (file.size > 15 * 1024 * 1024) { status.textContent = 'Choose a resume smaller than 15 MB.'; return; }
    const base64 = (await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); }));
    await send({ action: 'saveResume', resume: { name: file.name, type: file.type || 'application/octet-stream', base64 } });
    profile.resumeName = file.name;
  }
  await chrome.storage.local.set({ profile });
  existing = profile; status.textContent = 'Saved locally.'; setTimeout(() => status.textContent = '', 2200);
});
document.querySelector('#export').onclick = async () => {
  const data = JSON.stringify({ profile: (await chrome.storage.local.get('profile')).profile || {}, exportedAt: new Date().toISOString() }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'applypilot-profile.json' }); a.click(); URL.revokeObjectURL(url);
};
document.querySelector('#clear').onclick = async () => { if (confirm('Delete your locally stored ApplyPilot profile? This cannot be undone.')) { await chrome.storage.local.clear(); await send({ action: 'deleteResume' }); existing = {}; form.reset(); document.querySelector('#resume-name').textContent = ''; status.textContent = 'Local data deleted.'; } };
document.querySelector('#delete-resume').onclick = async () => { if (confirm('Remove the saved local resume?')) { await send({ action: 'deleteResume' }); delete existing.resumeName; await chrome.storage.local.set({ profile: existing }); document.querySelector('#resume').value = ''; document.querySelector('#resume-name').textContent = 'Saved resume removed.'; } };
load();
