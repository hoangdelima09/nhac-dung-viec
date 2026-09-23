# Nhắc Đúng Việc

A small Vietnamese-language proof of concept for a parent who needs to turn a class-group screenshot into a source-backed checklist and reminder calendar. The included fictional screenshot contains **two different hours for the same meeting**. The app cites the OCR line for each proposal and waits for a parent to choose an hour before exporting a calendar file.

## Run locally

Requirements: Node.js 20 or newer and the [Tesseract OCR](https://tesseract-ocr.github.io/tessdoc/) executable on your `PATH` (version 5 or newer recommended). Language data for Vietnamese and English is included in `tessdata/`, so no API key, npm install, or network call is needed at runtime.

```bash
npm start
```

Open **http://localhost:4173**. Click **Xem tình huống mẫu** to OCR the fictional sample image, choose the confirmed meeting hour, check off a preparation, and download `nhac-dung-viec.ics`. You can also upload a PNG, JPEG or WebP (up to 8 MB). `npm test` verifies the parser, calendar, and the sample image through the OCR endpoint.

On Windows, download Tesseract from the installer linked by [Tesseract's installation guide](https://tesseract-ocr.github.io/tessdoc/Installation.html). If `tesseract` is not on your `PATH`, set `TESSERACT_CMD` in PowerShell before starting the app:

```powershell
$env:TESSERACT_CMD = 'C:\Program Files\Tesseract-OCR\tesseract.exe'
npm start
```

For the contest video, see [`demo/recording-guide.md`](demo/recording-guide.md). The user-facing interface is Vietnamese; [`demo/english-captions.srt`](demo/english-captions.srt) supplies an English translation for the illustrated journey and should be adjusted to match the actual recording.

## How it works

- `server.mjs`: a loopback-only server accepts one image, runs Tesseract in a temporary directory, returns OCR lines and their coordinates, then deletes the upload.
- `public/extract.js`: rules recognize a meeting line with a date and hour, supplies, and a submission deadline. Every extracted item references an OCR line.
- `public/app.js`: displays citations and a conflict, offers OCR correction, stores a checked checklist locally, and blocks export until the hour is selected.
- `public/calendar.js`: exports local-time meeting and all-day deadline events with alerts in an `.ics` file. Importing into a calendar app is a separate user action.

The app does not determine which conflicting message is correct. Its source citations and editable OCR let a parent verify and correct details. Extraction is intentionally narrow: it is designed for the sample scenario and similarly formatted Vietnamese notices, not all real-world chat images.

## Privacy and sample data

OCR runs locally. The app does not upload images to a remote service. The sample class and messages are **fictional**; do not publish screenshots containing real children or family details. Browser local storage only retains checklist and selection state for a given recognized text.

## Project provenance

Built from a new folder for Devpost's Build With AI: Basics submission period. The `devpost/` directory contains the scope, product requirements, and technical specification developed with the challenge's Learn Skill Pack. Skill Pack source: https://github.com/challengepost/learn-ai-basics .

Application source: MIT. OCR language models in `tessdata/` come from [tesseract-ocr/tessdata_fast](https://github.com/tesseract-ocr/tessdata_fast) under Apache 2.0; its license is included in `tessdata/LICENSE`.
