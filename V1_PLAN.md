# ApplyPilot — V1 Product Plan

## Product promise

ApplyPilot is a Chrome extension that helps a candidate complete job applications in one click while keeping the candidate in control. It understands the application in context, fills information it can support confidently, guides the user through uncertain cases, and **never submits an application**. The final Submit action always requires the user's explicit review and confirmation.

## V1 goals

- Autofill job applications with the candidate's saved profile, resume, documents, and answer history.
- Understand questions by meaning, rather than relying on exact wording.
- Generate job-specific answers when a factual profile answer is not enough (for example, “Why do you want to join this organization?”).
- Navigate multi-step forms, validate progress, and recover from ordinary validation errors.
- Keep user data local to the user's PC by default; ApplyPilot has no product backend or database.

## Candidate experience

1. The candidate installs the extension and completes a short onboarding flow.
2. They enter or verify their personal, professional, education, work-authorization, links, and preferences data. They may upload a resume to prefill and review this profile.
3. On a supported application page, the candidate clicks ApplyPilot.
4. ApplyPilot scans the current form and relevant job context, fills supported fields, and gives each decision a confidence level.
5. It answers known questions from the profile, creates contextual suggestions where appropriate, and asks the candidate about genuinely unknown or sensitive fields.
6. The candidate can accept, edit, or decline generated answers. Accepted answers may be remembered locally for future applications.
7. ApplyPilot progresses through Next steps, validates each page, and fixes recoverable field errors.
8. At the final review/Submit step, it stops. The candidate reviews the completed application and submits it themselves.

## Profile and local vault

The local profile is the source of truth. Resume parsing is an onboarding convenience, not an unverified authority: extracted values are shown to the candidate for review.

### Core profile data

- Personal: legal/preferred name, email, phone, address, location.
- Professional: current title/company, work history, skills, total experience, notice period, current and expected compensation where provided.
- Education: institution, degree, major, graduation date/year, GPA where provided.
- Work authorization: authorized countries, sponsorship requirement, visa status where the candidate chooses to store it, and relocation preference.
- Links: LinkedIn, GitHub, portfolio, and other selected URLs.
- Documents: resume variants and optional cover-letter/supporting documents.
- Preferences and saved answers: work location, compensation, demographic disclosure preferences, and candidate-approved reusable answers.

## Form coverage

V1 supports detection, mapping, and filling for:

- Text, email, telephone, number, URL, and textarea fields.
- Select/dropdown controls, including searchable/custom select controls when safely recognizable.
- Radio buttons and checkboxes.
- Date and date-like controls.
- Resume and permitted supporting-document uploads from the locally selected document vault.

Values are only filled where a match is sufficiently reliable. Required fields are never invented merely to make a form appear complete.

## Context-aware answer engine

Questions are interpreted semantically. Different phrasings such as “Do you need visa sponsorship now or later?” and “Will you require sponsorship in the future?” map to the same work-authorization intent, then are answered from the candidate's chosen profile facts.

### Answer sources, in priority order

1. **Deterministic profile facts** — direct, candidate-verified values (name, contact details, degree, sponsorship setting).
2. **Contextual profile answers** — facts combined with form/job context (availability, location preference, experience summaries).
3. **Candidate-approved saved answers** — reusable answers tied to an intent or a narrow context.
4. **AI-generated suggestions** — contextual prose using the minimum necessary local profile, resume, and job-description context; the candidate may review/edit before acceptance.
5. **Candidate prompt** — used when the field is unknown, ambiguous, sensitive, or insufficiently supported.

When a candidate answers an unknown question and chooses “remember,” ApplyPilot stores the intent/value pairing locally with appropriate scope. It does not treat a one-off answer as universal unless the candidate says it is reusable.

## Confidence and safe handling

- **High confidence:** fill automatically, while recording the reason/source for review.
- **Medium confidence:** propose or fill with a visible review cue; avoid consequential guesses.
- **Low confidence / ambiguity:** ask the candidate instead of guessing.
- **Sensitive data:** require an explicit candidate choice and respect saved disclosure preferences.
- **Conflicts:** surface the conflict (for example, resume versus profile) and request the candidate's decision.

The extension provides a review view showing filled fields, unanswered required fields, generated text, and any decisions needing attention.

## Multi-step navigation and recovery

ApplyPilot treats an application as a sequence of pages rather than a single form. For each step it will:

1. scan and classify fields;
2. fill only supported, sufficiently confident values;
3. validate visible requirements;
4. activate Next/Continue when the candidate has allowed progress;
5. detect validation feedback and retry safe corrections or ask the candidate; and
6. preserve progress and context across steps.

The extension stops at any final Submit/Apply action. It must not click or trigger final submission; the candidate reviews and confirms directly in the site UI.

## Privacy and data controls

### Local-first rule

- Profile data, resume files, parsed resume data, application answers, answer history, and learned mappings remain on the candidate's device by default.
- ApplyPilot V1 has no ApplyPilot-operated backend, account database, analytics store, or server-side user profile.
- Local data should be protected with browser/platform storage practices and clear controls to view, edit, export, and delete it.

### Minimum-context principle

Only the data necessary to fill a field or generate a requested answer is used. The extension should minimize access to page content and minimize the context supplied to any model.

### AI mode

Local AI is preferred for parsing and generated answers so the local-first promise remains intact. Cloud AI, if offered, is strictly optional: it must be opt-in, disclose exactly what context will leave the device and which provider receives it, and never be silently enabled. Deterministic filling and locally stored answers must continue to work without cloud AI.

## Technical architecture

```text
Chrome extension
├── Extension UI
│   ├── Onboarding and profile editor
│   ├── Local document vault
│   ├── In-page progress/review controls
│   └── Privacy, export, and delete controls
├── Local application engine
│   ├── Form scanner and field normalizer
│   ├── Semantic intent mapper
│   ├── Profile/answer resolver
│   ├── Confidence and policy engine
│   ├── Filler and validation-recovery controller
│   └── Multi-step navigation coordinator
├── Site integration layer
│   ├── ATS-specific adapters
│   └── Generic DOM/ARIA/label-based fallback
└── Local storage layer
    ├── Encrypted/protected profile and preferences where platform support allows
    ├── Parsed resume facts and local answer memory
    ├── Document references/handling
    └── Optional local model runtime and model settings
```

### ATS adapters and generic fallback

Adapters encapsulate site/ATS-specific page patterns, navigation, field quirks, and validation behavior. The generic fallback uses standards-oriented signals—labels, names, ARIA attributes, input types, nearby question text, and DOM structure—to provide limited support on unfamiliar sites. The adapter interface keeps site-specific logic isolated and makes new ATS support incremental.

## Proposed local data model

```text
CandidateProfile
  personal, professional, education, authorization, links, preferences
DocumentRecord
  id, local reference, type, parsed facts, candidate verification state
AnswerMemory
  intent, value/template, scope, source, confirmation status, last used
ApplicationSession
  site/ATS, job context, current step, field decisions, validation state
FieldDecision
  field fingerprint, inferred intent, candidate value, source, confidence, review state
PrivacySettings
  AI mode, provider consent, disclosed context categories, retention/export controls
```

## V1 scope

### Included

- Chrome extension onboarding and editable local profile.
- Resume upload, local parsing, and candidate verification.
- Local persistence, review, export, and delete controls.
- Field support listed above, including selected local document uploads.
- Semantic intent mapping with deterministic and contextual answers.
- Candidate-reviewed AI answer suggestions, with local AI preferred and optional, disclosed cloud AI only.
- Unknown-field prompts and locally learned, candidate-approved answers.
- Confidence cues, review, multi-step navigation, and validation recovery.
- Initial ATS adapters plus a generic fallback.
- Absolute stop before final submission.

### Excluded from V1

- Automatic final submission or bypassing site safeguards.
- An ApplyPilot backend, user accounts, cloud profile database, or hidden telemetry.
- Broad job discovery, job scraping, job ranking, or auto-apply campaigns.
- Guarantees of support for every ATS or every custom form.
- Unattended agent behavior that makes consequential application decisions.
- Silent cloud AI usage or transmitting full profiles/resumes by default.

## Milestones and implementation sequence

1. **Privacy and extension foundation** — define permissions, local storage boundaries, data export/delete, profile schema, and consent model.
2. **Onboarding and profile vault** — build profile editing, resume selection/parsing, verification, and local document handling.
3. **Generic form engine** — implement scanning, field classification, controlled filling, review states, and the generic fallback.
4. **Intent and answer resolver** — add semantic intent mapping, deterministic profile answers, scoped answer memory, confidence policy, and unknown-field prompts.
5. **Contextual answer workflow** — add job-context extraction and reviewed local-AI suggestions; introduce optional cloud mode only after explicit consent UX is complete.
6. **Application flow controller** — add multi-step navigation, page persistence, validation detection/recovery, and final-submit hard stop.
7. **Initial ATS adapters and quality pass** — implement targeted adapters, test against representative forms, validate accessibility and privacy behavior, and refine failure states.

## Acceptance criteria for V1

- A candidate can create and verify a local profile from typed data and a resume.
- The extension fills supported form controls accurately from verified data and requests confirmation for uncertainty.
- Equivalent questions are answered by intent, not exact wording.
- Generated answers are contextual, reviewable, and based only on permitted minimum context.
- Unknown answers can be captured and remembered locally by candidate choice.
- Multi-step applications progress safely and recover from common validation errors.
- No user data is sent to an ApplyPilot backend because none exists; any cloud AI use is opt-in and clearly disclosed.
- Final submission is never automated and always remains a deliberate candidate action.
