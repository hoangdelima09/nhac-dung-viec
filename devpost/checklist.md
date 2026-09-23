---
doc: checklist
status: draft
---
# Build Checklist

Build mode: fast (requested direct implementation and submission). The learner's hands-on review remains open.

## Slices

- [x] **1. An image becomes cited source lines**
  Becomes usable: The sample and uploaded images can be OCRed locally and reviewed as editable lines.
  Why now: Establishes the genuine image-to-text path.
  PRD ref: `prd.md > The Core Journey` (steps 1–2)
  Spec ref: `spec.md > OCR endpoint`
  Build: Node server, local Tesseract models, upload UI, editable transcript.
  Verify (mechanical): `tests/server.test.mjs` sends the sample image through OCR and sees both meeting lines.
  Learner check: Click the sample button and inspect the lines against the image.
  Commit: `Add local screenshot OCR and source review`

- [x] **2. Competing hours require a choice**
  Becomes usable: Two times on the same meeting date appear with their sources, and export stays unavailable until a selection.
  Why now: This is the distinctive decision point.
  PRD ref: `prd.md > Features and Behavior`
  Spec ref: `spec.md > Extraction engine`, `spec.md > Review and calendar`
  Build: Extract cited facts, render conflict choices and checklist, persist checked state locally.
  Verify (mechanical): `tests/core.test.mjs` verifies candidates, citations, deadline and supplies; OCR integration confirms both times.
  Learner check: Confirm the warning appears, inspect both citations, then select an hour.
  Commit: `Add cited conflict and preparation checklist`

- [x] **3. Confirmation produces reminders**
  Becomes usable: The selected hour and the deadline are exported in an importable calendar file.
  Why now: Completes the end-to-end action.
  PRD ref: `prd.md > The Core Journey` (steps 4–5)
  Spec ref: `spec.md > Review and calendar`
  Build: ICS events and alarms, downloadable file, README and tests.
  Verify (mechanical): `tests/core.test.mjs` checks the selected hour, all-day end, and alarms.
  Learner check: Download and import the file into a calendar to verify how its local time appears.
  Commit: `Export confirmed meeting and deadline reminders`

## Hands-on Checkpoints

- [ ] Early behavior explored by learner — sample OCR, citations, and conflict.
- [ ] Final kick-the-tires exploration and feedback completed.

## Final Review

- [ ] Final review complete — learner confirms the interface and calendar are ready to ship.

## Code Tour and App Map

- [ ] Learner learning activity or recap complete.
- [ ] Optional edit and transfer reflection addressed.
- [x] `devpost/app-map.html` generated with references to completed code.

Activity and evidence: mechanical tests passed; learner review pending.
Route and stops: `server.mjs > recognize`, `public/extract.js > extract`, `public/app.js > render`, `public/calendar.js > makeCalendar`.
Edit outcome: not applicable yet.
Reflection: not yet offered.
Activity mode: reference-only map until the learner runs it.

## Revisions

- Tesseract plain text appeared instead of TSV when the `tsv` config followed language flags in the first server implementation; the server now sets TSV output explicitly. The sample OCR integration test verifies the corrected path.
