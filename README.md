# Konsultan.co

House construction consultancy platform for the end-to-end workflow between a **homeowner** and a **consultant**: document intake, quotation & surat lantikan, multi-stage endorsements, then 20 km contractor matching.

## Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui + Lucide
- Firebase Auth, Cloud Firestore, and Firebase Storage
- React Server Components and Server Actions
- Cookie-based RBAC (`HOMEOWNER` | `CONSULTANT`) via Firebase session cookies

## Firebase setup

1. Create a Firebase project and enable **Authentication** (Email/Password), **Firestore**, and **Storage**.
2. Project settings → General → copy the **Web API key** and project ID.
3. Project settings → Service accounts → **Generate new private key**. Save it as `service-account.json` in the repo root (gitignored).
4. Storage → copy the bucket name (e.g. `your-project-id.appspot.com`).
5. Copy `.env.example` to `.env` and fill in:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_WEB_API_KEY="your-web-api-key"
FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
FIREBASE_SERVICE_ACCOUNT_PATH="./service-account.json"
APP_BASE_URL="http://localhost:3000"
```

Deploy `firestore.rules` (deny all client access — the app uses the Admin SDK) and `storage.rules`.

## Setup

```bash
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Homeowner | ahmad@example.com | demo123 |
| Consultant | admin@konsultan.co | demo123 |

## Portals

- `/homeowner` — project submission, stepper, endorsed downloads, contractor radius
- `/consultant` — project review, quotation uploads, stage pipeline, contractor directory

## Geolocation

`src/lib/geo.ts` implements the Haversine formula and filters contractors to 20 km of the project pin. Seed data includes KL/Selangor builders plus a Johor listing that should fall outside a Bangsar/Damansara radius.
