# Devpost submission draft — Nhắc Đúng Việc

## Title
Nhắc Đúng Việc — Class Notices Into Confirmed Reminders

## One-line pitch
A screenshot of a class-group announcement becomes a cited parent checklist and calendar reminders, with conflicting meeting times flagged for human confirmation.

## Inspiration
Parents can miss a task when class-group announcements mix meeting details, supplies, and submission deadlines. A particularly confusing case is two messages giving different hours for the same meeting.

## What it does
Upload a screenshot or use the fictional example. Local OCR extracts readable lines; the app presents the meeting date, both competing hours, supplies, and deadline alongside the original line for each. It blocks calendar export until the parent verifies and chooses one hour. The resulting checklist can be checked off, and the app downloads an `.ics` file with meeting and deadline alerts.

## How we built it
The app is a small Node.js HTTP server with Tesseract OCR and bundled Vietnamese and English language data. Its browser interface uses plain HTML, CSS, and JavaScript. A narrow rule-based parser keeps every fact tied to an OCR source line, and a calendar module generates the `.ics` download. The image is processed on the user's computer without a remote API.

## Challenges and limitations
The application does not know which disputed hour is correct; a person must check with the teacher. OCR can make mistakes, so users can edit the recognized text and re-analyze it. The extraction rules target this demo and similarly formatted Vietnamese notices, not arbitrary chat messages. The calendar is a downloadable file to import, not an account integration.

## Links and assets
- Source: https://github.com/hoangdelima09/nhac-dung-viec
- Demo video: **add public YouTube/Vimeo URL after recording**
- English translation of the Vietnamese demo: `demo/english-captions.srt`; align and attach to the video.
- Built with the challenge Learn Skill Pack; scope, PRD, and spec are in `devpost/`.

## Personal reflection
**The entrant should add their own true sentence about what they learned or would change after trying the app. Do not publish a fabricated learning claim.**
