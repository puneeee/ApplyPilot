const form = document.querySelector('#profile-form');
const fields = [...form.elements].filter((el) => el.name);
const status = document.querySelector('#saved');
let existing = {};

async function load() {
  existing = (await chrome.storage.local.get('profile')).profile || {};
  for (const field of fields) {
    if (field.type === 'checkbox') field.checked = Boolean(existing[field.name]);
    else field.value = existing[field.name] || '';
  }
  if (existing.resumeName) document.querySelector('#resume-name').textContent = `Selected previously: ${existing.resumeName}`;
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const profile = { ...existing };
  for (const field of fields) profile[field.name] = field.type === 'checkbox' ? field.checked : field.value.trim();
  const file = document.querySelector('#resume').files[0];
  if (file) profile.resumeName = file.name;
  await chrome.storage.local.set({ profile });
  existing = profile; status.textContent = 'Saved locally.'; setTimeout(() => status.textContent = '', 2200);
});
document.querySelector('#export').onclick = async () => {
  const data = JSON.stringify({ profile: (await chrome.storage.local.get('profile')).profile || {}, exportedAt: new Date().toISOString() }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'applypilot-profile.json' }); a.click(); URL.revokeObjectURL(url);
};
document.querySelector('#clear').onclick = async () => { if (confirm('Delete your locally stored ApplyPilot profile? This cannot be undone.')) { await chrome.storage.local.clear(); existing = {}; form.reset(); document.querySelector('#resume-name').textContent = ''; status.textContent = 'Local data deleted.'; } };
load();
