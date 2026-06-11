# Personalized Book Platform Prototype

Working MVP prototype for this flow:

Customer form -> AstroAPI -> Claude AI -> PDF generation -> email delivery

This is intentionally small. It does not include authentication, payment, admin tools, or production SaaS infrastructure.

## Tech Stack

- Next.js App Router
- TypeScript
- Zod validation
- Direct Anthropic Claude Messages API call
- PDFKit for PDF generation
- Transactional email abstraction using a Resend-compatible HTTP request

## Local Setup

Prerequisite: Node.js with npm installed.

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env.local
```

3. Keep mock mode enabled for local testing without external credentials:

```bash
MOCK_MODE=true
```

4. Run the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`, submit the form, and the mock workflow should complete.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `ASTRO_API_URL` | Base URL for the selected astrology API provider. |
| `ASTRO_API_KEY` | API key for the astrology provider. |
| `ANTHROPIC_API_KEY` | API key for Claude generation. |
| `EMAIL_PROVIDER_API_KEY` | Transactional email API key. The prototype uses a Resend-compatible request shape. |
| `EMAIL_FROM` | Sender email address used for book delivery. |
| `APP_BASE_URL` | Base app URL for future links or callbacks. |
| `MOCK_MODE` | Set to `true` to mock AstroAPI, Claude, and email delivery. |

## Mock Mode

With `MOCK_MODE=true`, the app:

- Returns realistic mock birth chart data from `lib/astro.ts`.
- Returns structured mock book content from `lib/claude.ts`.
- Generates a real PDF buffer using `lib/pdf.ts`.
- Logs the email payload and attachment size instead of sending email.

This lets the entire prototype run locally without real API keys.

## Integration Points

### AstroAPI

`lib/astro.ts` contains `getBirthChartData(customerData)`.

The real request currently posts to:

```text
POST {ASTRO_API_URL}/birth-chart
```

Adjust the endpoint and payload once the final astrology API documentation is selected.

### Claude

`lib/claude.ts` contains `generateBookContent({ customerData, birthChartData, quizAnswers })`.

When `ANTHROPIC_API_KEY` is present and mock mode is off, it calls Claude and asks for structured JSON book content. The final production prompt and book structure should be refined before launch.

### PDF

`lib/pdf.ts` contains `generateBookPdf(bookContent, customerData)`.

It creates a simple readable PDF with title, customer name, date, sections, and closing note.

### Email

`lib/email.ts` contains `sendBookEmail({ to, customerName, pdfBuffer })`.

The real request uses a Resend-compatible `/emails` payload. Replace the endpoint and payload if the final provider is SendGrid, Mailgun, or another service.

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Smoke Testing

With the dev server running, test the API directly:

```bash
curl -X POST http://localhost:3000/api/generate-book \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Maya Santos",
    "email": "maya@example.com",
    "birthDate": "1992-04-12",
    "birthTime": "09:30",
    "birthPlace": "Denver, Colorado, USA",
    "quizAnswers": {
      "lifeFocus": "Career and calling",
      "readingTone": "Warm and reflective",
      "currentChallenge": "I am deciding what direction to take next.",
      "personalIntention": "I want more clarity and self-trust."
    }
  }'
```

Plain HTML can be used as a test client, but the Next.js dev server still needs
to be running because `/api/generate-book` performs the server-side workflow.
Have the HTML page submit JSON to `http://localhost:3000/api/generate-book`.

## Routes

- `/` - customer form and workflow status UI
- `/api/generate-book` - validates input and runs AstroAPI, Claude, PDF, and email steps
