---
doc: spec
status: approved
---
# Nhắc Đúng Việc — Technical Spec

## How This Works, In Plain Language
A small local web server receives an image and asks Tesseract OCR to read its Vietnamese text. The browser analyzes the returned lines, showing the exact line beside each proposed fact. The browser never resolves disagreement by itself; it generates an importable calendar file only after the parent selects the time.

## The Core Journey Through the System
Image → `/api/ocr` → source lines and positions → client extraction rules → cited cards → user confirms disputed time → checklist and `.ics` download. PRD ref: `prd.md > The Core Journey`.

## Stack
Node.js 20+ built-in HTTP server, no runtime npm dependencies. Tesseract OCR 5+ binary with local Vietnamese and English language data (Tesseract docs: https://tesseract-ocr.github.io/tessdoc/). Vanilla JavaScript and CSS for a browser UI. This stack keeps OCR local and avoids paid API keys.

## Where It Runs and How Someone Tries It
Install Node.js 20+ and Tesseract 5+, run `npm start`, then open `http://localhost:4173`. The `tessdata/vie.traineddata` and `eng.traineddata` files are included. Use the sample screenshot for recording; no API key or paid account is needed.

## Look and Feel
Readable editorial UI with warm paper, deep navy, and coral for a conflict. These are implementation defaults pending human feedback.

## Components
### OCR endpoint
Validates a single image of at most 8 MB and runs Tesseract with fixed arguments, a timeout, and a private temporary file. Returns line text and bounding boxes. PRD ref: `prd.md > Features and Behavior`.

### Extraction engine
Finds meeting times, supply phrases, and submission dates, groups competing times by date, and retains source line IDs. Does not guess on missing data. PRD ref: `prd.md > Features and Behavior`.

### Review and calendar
Shows source lines, allows correction, stores checklist state locally, blocks export until confirmation, creates a standards-based `.ics` with meeting and deadline alarms. PRD ref: `prd.md > The Core Journey`.

## Data Model
`lines: {id,text,bbox?}[]`; `meetingCandidates: {date,time,sourceIds}[]`; `tasks: {id,label,date?,sourceIds,done}[]`; `selectedMeetingKey: string|null`. Only checklist state and the chosen meeting key persist in browser local storage for the current analyzed text fingerprint.

## File Structure
`server.mjs` serves `public/` and OCR; `public/app.js`, `extract.js`, `calendar.js`, `style.css`, `index.html`, and `sample.png` implement the UI; `tessdata/` contains OCR models; `devpost/` contains the planning work.

## External Services and Dependencies
No remote service at runtime. Node and Tesseract must be installed locally. Devpost, GitHub, and YouTube/Vimeo are needed to submit, not to run the app.

## Important Failure Modes
- OCR fails or reads a line badly → show a clear error or editable extracted text; never fabricate a fact.
- Meeting hours disagree → export stays blocked until the user confirms one.
- The screenshot has no recognizable meeting → retain text and ask for correction instead of inventing a date.

## What Was Simplified and Why
An `.ics` download stands in for direct calendar access, preserving a working reminder without OAuth. Narrow extraction rules support a trustworthy demo; a production app would require more languages, more examples, and stronger validation.

## Decisions and Open Issues
The learner specified the conflict and cited-fact behavior. The local server and downloadable calendar are implementation choices used to deliver that behavior. Other screenshot styles may need OCR correction.
