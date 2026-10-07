# ApplyPilot

ApplyPilot is a local-first Chrome extension that helps candidates fill job applications from a profile saved in their browser. It never submits an application.

## Run locally

1. Open `chrome://extensions` in Chrome and enable **Developer mode**.
2. Select **Load unpacked** and choose this repository folder.
3. Open ApplyPilot, choose **Set up profile**, save a few details, then visit a job application page.
4. Select **Scan & fill this step**. Use **Continue to next step** only after reviewing the filled page.

## Privacy

Profile data is stored locally in Chrome. The selected resume is held locally in the extension's document vault and can be attached to recognized resume inputs; it is only sent to the job site when the candidate uses Scan & fill. This version has no backend or cloud AI integration.

See [V1_PLAN.md](V1_PLAN.md) for the product plan and scope.
