(() => {
  const text = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const norm = (value) => text(value).toLowerCase();
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const fire = (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  const toast = (message, warn = false) => {
    document.querySelector('#applypilot-toast')?.remove();
    const el = document.createElement('div'); el.id = 'applypilot-toast'; el.className = warn ? 'warn' : ''; el.textContent = message;
    document.body.append(el); setTimeout(() => el.remove(), 7000);
  };
  const labelFor = (el) => {
    const byFor = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    const closest = el.closest('label');
    const aria = el.getAttribute('aria-label') || el.getAttribute('placeholder') || '';
    const group = el.closest('fieldset, [role="group"], .field, .form-group, li, div')?.innerText || '';
    return text([byFor?.innerText, closest?.innerText, el.name, el.id, aria, group].filter(Boolean).join(' '));
  };
  const intentFor = (question, el) => {
    const q = norm(question);
    const type = (el.type || '').toLowerCase();
    if (type === 'email' || /e-?mail/.test(q)) return 'email';
    if (type === 'tel' || /phone|mobile|telephone/.test(q)) return 'phone';
    if (/first.?name|given.?name/.test(q)) return 'firstName';
    if (/last.?name|family.?name|surname/.test(q)) return 'lastName';
    if (/full.?name|legal.?name|name of applicant/.test(q)) return 'fullName';
    if (/linkedin/.test(q)) return 'linkedin'; if (/github/.test(q)) return 'github'; if (/portfolio|personal website|website url/.test(q)) return 'portfolio';
    if (/current (job )?title|current position/.test(q)) return 'currentTitle';
    if (/current (employer|company|organization)/.test(q)) return 'currentCompany';
    if (/years? (of )?(work |professional )?experience/.test(q)) return 'yearsExperience';
    if (/university|college|school( name)?/.test(q)) return 'school';
    if (/degree/.test(q)) return 'degree'; if (/major|field of study|discipline/.test(q)) return 'major';
    if (/graduat/.test(q)) return 'graduationYear';
    if (/address line|street address/.test(q)) return 'address'; if (/postal|zip/.test(q)) return 'postalCode';
    if (/city/.test(q)) return 'city'; if (/state|province|region/.test(q)) return 'region'; if (/country/.test(q)) return 'country';
    if (/sponsor(ship)?|visa.*require|require.*visa/.test(q)) return 'requiresSponsorship';
    if (/authorized to work|work authorization|right to work/.test(q)) return 'authorizedCountry';
    if (/relocat/.test(q)) return 'relocation'; if (/notice period|start date|available to start/.test(q)) return 'noticePeriod';
    return null;
  };
  const answer = (intent, profile) => {
    if (intent === 'fullName') return text(`${profile.firstName || ''} ${profile.lastName || ''}`);
    const val = profile[intent];
    if (intent === 'requiresSponsorship' || intent === 'relocation') return val === 'yes' ? 'Yes' : val === 'no' ? 'No' : '';
    return val || '';
  };
  const setValue = (el, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    descriptor?.set ? descriptor.set.call(el, value) : el.value = value; fire(el); el.classList.add('applypilot-filled');
  };
  const yesNoChoice = (el, value) => {
    const group = el.closest('fieldset, [role="radiogroup"], .field, .form-group, li, div') || el.parentElement;
    const inputs = [...group.querySelectorAll('input[type="radio"],input[type="checkbox"]')];
    const desired = norm(value);
    const match = inputs.find((input) => norm(labelFor(input)).includes(desired) || norm(input.value) === desired);
    if (!match) return false; match.click(); match.classList.add('applypilot-filled'); return true;
  };
  function fill(profile) {
    const controls = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea, select')].filter(visible);
    let filled = 0; const unknown = []; const visitedGroups = new Set();
    for (const el of controls) {
      if (el.disabled || el.readOnly || (el.value && el.type !== 'radio' && el.type !== 'checkbox')) continue;
      const question = labelFor(el); const intent = intentFor(question, el); const value = answer(intent, profile);
      if (!intent || !value) { if (el.required && !el.value) unknown.push(question || 'an unlabeled required field'); continue; }
      if (['radio', 'checkbox'].includes(el.type)) {
        const groupKey = `${el.name}|${intent}`; if (visitedGroups.has(groupKey)) continue; visitedGroups.add(groupKey);
        if (intent === 'requiresSponsorship' || intent === 'relocation') { if (yesNoChoice(el, value)) filled++; }
        continue;
      }
      if (el.tagName === 'SELECT') {
        const option = [...el.options].find((o) => norm(o.text).includes(norm(value)) || norm(o.value) === norm(value));
        if (option) { el.value = option.value; fire(el); el.classList.add('applypilot-filled'); filled++; } else if (el.required) unknown.push(question);
      } else { setValue(el, value); filled++; }
    }
    const resumeInputs = [...document.querySelectorAll('input[type="file"]')].filter(visible);
    if (resumeInputs.length && profile.resumeName) toast(`Resume upload detected: choose “${profile.resumeName}” yourself. Browsers prevent extensions from attaching files silently.`, true);
    const message = `Filled ${filled} field${filled === 1 ? '' : 's'} locally.${unknown.length ? ` ${unknown.length} required field${unknown.length === 1 ? '' : 's'} still need your input.` : ''}`;
    toast(message, Boolean(unknown.length)); return { message, unresolved: unknown.length };
  }
  function next() {
    const buttons = [...document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]')].filter(visible);
    const final = buttons.find((b) => /^(submit|apply|send application|finish)$/i.test(text(b.innerText || b.value || b.getAttribute('aria-label'))));
    if (final) { const message = 'Final submission detected. ApplyPilot has stopped—review the application and submit it yourself.'; toast(message, true); return { message, isFinal: true }; }
    const nextButton = buttons.find((b) => /^(next|continue|review|save and continue|proceed)/i.test(text(b.innerText || b.value || b.getAttribute('aria-label'))));
    if (!nextButton) { const message = 'No safe Next or Continue button was found on this step.'; toast(message, true); return { message, isFinal: false }; }
    nextButton.click(); const message = 'Moving to the next application step. ApplyPilot will not submit the application.'; toast(message); return { message, isFinal: false };
  }
  chrome.runtime.onMessage.addListener((request, _sender, respond) => {
    if (request.action === 'fill') respond(fill(request.profile || {}));
    if (request.action === 'next') respond(next());
  });
})();
