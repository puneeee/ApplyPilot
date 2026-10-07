const DB_NAME = 'applypilot-vault';
const STORE = 'documents';

function db() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function readResume() {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, 'readonly').objectStore(STORE).get('resume');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
async function writeResume(resume) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, 'readwrite').objectStore(STORE).put(resume, 'resume');
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
}
async function removeResume() {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, 'readwrite').objectStore(STORE).delete('resume');
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.action === 'saveResume') { await writeResume(message.resume); sendResponse({ ok: true }); }
    if (message.action === 'getResume') sendResponse({ resume: await readResume() });
    if (message.action === 'resumeInfo') { const resume = await readResume(); sendResponse(resume ? { name: resume.name } : {}); }
    if (message.action === 'deleteResume') { await removeResume(); sendResponse({ ok: true }); }
  })().catch((error) => sendResponse({ error: error.message }));
  return true;
});
