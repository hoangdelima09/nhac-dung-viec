---
doc: prd
status: approved
---
# Nhắc Đúng Việc — Product Requirements

For a parent who needs to turn class-group screenshots into preparations and confirmed reminders. Source: `scope.md > The Core Loop`.

## The Core Journey
1. Open the app and upload a screenshot, or open its clearly labeled example screenshot.
2. See the screenshot and its OCR lines; correct OCR text if needed and re-analyze.
3. See a meeting card showing date, both disputed hours and the exact line behind each, plus supplies and deadline cards with their source lines.
4. Select the verified meeting hour. The checklist becomes useful immediately; the calendar button remains unavailable until the disputed hour is resolved.
5. Check off supplies and download an `.ics` calendar file for the chosen meeting and submission deadline, both with alerts.

## Screens and Layout
One responsive workspace: image and editable extracted text on the left; results and action cards on the right. On a narrow screen, these stack. A compact status area explains OCR progress, errors, and whether the calendar is ready.

## Look and Feel
No visual preferences supplied. Implementation may use a calm paper and ink style to make source citations legible; this is an implementation choice, not a stated learner preference.

## Features and Behavior
- OCR reads Vietnamese text from one uploaded image. Each source citation preserves the extracted line verbatim.
- A meeting candidate requires a meeting phrase, date, and hour on the same line. Distinct hours on one date are a visible conflict; no default selection is made.
- Supplies and deadline lines become checklist entries, with original source text alongside them.
- Edits to OCR text trigger a fresh analysis and clear any prior meeting confirmation.
- Calendar export uses only the selected meeting hour, plus the detected deadline. A downloaded file imports into standard calendar apps; it is not a direct account integration.

## States and Boundaries
- **First use:** a sample button makes the intended demonstration reproducible.
- **OCR running:** progress and disabled analysis controls.
- **No readable facts:** show extracted text, explain that it can be corrected, and do not invent a date.
- **Conflict:** show both choices and block calendar export until one is selected.
- **Reload:** checklist and confirmation may be kept locally on this device; no account or cloud sync.

## Product Decisions
- Learner's choice: prioritize a specific two-time conflict and show the original line for every extracted fact.
- Learner's choice: require user confirmation before reminders.
- Implementation choice: export an `.ics` file to supply a working reminder flow without requesting calendar-account access.

## What We're Building
An upload and demo image flow, OCR and editable text, source-backed extraction, conflict resolution, checklist, and calendar download.

## Deferred From the POC
Arbitrary notice formats and external notifications require broader language coverage and user account integrations.

## Open Questions
None blocks the demonstration. OCR accuracy on other screenshots is a known limitation to disclose.
