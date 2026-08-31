# AI Interviewer Pro — Fixed Build

This build includes the role-based authentication and interview flow:

- Candidate login with email OTP + JWT
- Recruiter login with email/password + JWT
- Admin login with email/password + JWT
- Automatic Admin and Recruiter account seeding from `server/.env`
- Recruiter six-step interview builder
- Candidate interview invitations by Gmail
- Invitation links that open the correct interview after candidate OTP login
- Candidate practice interviews
- Browser speech recognition and speech synthesis
- Camera support during interviews
- Transcript persistence
- AI question generation and evaluation with an offline fallback when OpenAI is unavailable
- Admin statistics and interview history
- Role-protected API routes
- SQLite persistence
- Detailed Gmail errors shown to the frontend when email delivery fails
- Reliable `.env` loading from `server/.env` even when the project is started from the project root

## First-time setup

### 1. Install dependencies

From the project root:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Create the environment file

Copy the example:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` and fill in the values.

Generate the JWT secret with:

```bash
openssl rand -hex 32
```

### 3. Gmail

`EMAIL_USER` is your Gmail address.

`EMAIL_PASS` is a Google **16-character App Password**. It is not your normal Gmail password.

The application removes accidental spaces from the App Password before connecting to Gmail.

### 4. Start everything

From the project root:

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## Health check

Open:

```text
http://localhost:3001/api/health
```

A correctly configured environment reports:

```json
{
  "ok": true,
  "emailConfigured": true,
  "emailReady": true,
  "openaiConfigured": true,
  "database": true
}
```

`openaiConfigured` may be false if you intentionally leave OpenAI disabled; the application has an offline question/evaluation fallback.

If Gmail authentication fails, the backend prints the real Gmail/Nodemailer error and the candidate OTP screen shows the backend's diagnostic message. Do not paste secrets into chat when troubleshooting.

## Login URLs

- Candidate: http://localhost:5173/candidate/login
- Recruiter: http://localhost:5173/recruiter/login
- Admin: http://localhost:5173/admin/login

## Security

Never commit `server/.env`, API keys, Gmail App Passwords, JWT secrets, or database files. The ZIP intentionally contains only `server/.env.example` and no real credentials.
