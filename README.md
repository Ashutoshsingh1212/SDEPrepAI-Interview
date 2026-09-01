#         SDEPrepAI Interview

<div align="center">

### AI-Powered Mock Interview & Technical Interview Preparation Platform

Practice realistic interviews, improve communication, receive AI-powered feedback, and manage technical interviews through dedicated Candidate, Recruiter, and Admin portals.

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Website-success?style=for-the-badge)](https://sdeprepai-interview.netlify.app/)
[![Backend](https://img.shields.io/badge/Backend-API-blue?style=for-the-badge)](https://sdeprepai-interview-backend.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Ashutoshsingh1212/SDEPrepAI-Interview)

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](#tech-stack)
[![Express](https://img.shields.io/badge/API-Express.js-000000?logo=express&logoColor=white)](#tech-stack)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](#tech-stack)

</div>

---

## 🌐 Live Application

| Service | Deployment |
|---|---|
| 🚀 **Frontend** | [sdeprepai-interview.netlify.app](https://sdeprepai-interview.netlify.app/) |
| ⚙️ **Backend API** | [sdeprepai-interview-backend.onrender.com](https://sdeprepai-interview-backend.onrender.com) |
| 💻 **Source Code** | [GitHub Repository](https://github.com/Ashutoshsingh1212/SDEPrepAI-Interview) |

> **Note:** The backend is deployed on Render's free tier, so the first request after inactivity may take some time while the service wakes up.

---

# 📖 About The Project

**SDEPrepAI Interview** is a full-stack AI-powered mock interview platform designed to help students and aspiring software engineers prepare for technical interviews in a more realistic and interactive environment.

The application supports three different user roles:

-  Candidate
-  Recruiter
-  Administrator

Candidates can participate in practice interviews, answer AI-generated questions, use voice interaction and camera features, and receive interview evaluation and feedback.

Recruiters can create and manage interviews, invite candidates, and review candidate performance.

Administrators can monitor users, interviews, platform activity, and statistics through a dedicated dashboard.

---

#    Key Features

##  AI-Powered Interview Experience

- AI-generated interview questions
- AI-based answer evaluation
- Technical interview practice
- Dynamic interview workflow
- Offline fallback when the AI service is unavailable
- Interview feedback and evaluation

---

## 🎙️ Voice-Based Interview Interaction

The platform supports browser-based voice interaction.

Features include:

-   Speech recognition
-   Speech synthesis
-   Voice-based answers
-   Interview transcript generation
-   Transcript persistence

---

##  Camera Support

Candidates can enable their webcam during an interview to simulate a more realistic interview environment.

Features include:

- Webcam access
- Live camera preview
- Browser permission handling
- Interview environment simulation

---

# 👨‍💻 Candidate Portal

Candidates can:

-  Login using Email OTP authentication
-  Participate in practice interviews
-  Open recruiter-issued interview invitations
-  Answer AI-generated interview questions
-  Use voice interaction
-  Enable camera during interviews
-  View interview transcripts
-  Receive AI evaluation
-  Track interview performance
-  Access interview history

---

# 🧑‍💼 Recruiter Portal

Recruiters have access to a dedicated dashboard for managing interviews and candidates.

Features include:

-  Secure recruiter authentication
-  Multi-step interview builder
-  Candidate management
-  Candidate interview invitations
-  Email-based invitations
-  Interview management
-  Candidate performance review
-  Interview reports
-  Candidate evaluation

---

#  Admin Portal

Administrators can monitor and manage the platform.

Features include:

- 🔐 Secure admin authentication
- 👥 User management
- 🧑‍💼 Recruiter monitoring
- 📊 Platform statistics
- 📈 Interview activity monitoring
- 🗂️ Interview history
- 🎯 Performance insights

Admin and recruiter accounts can be automatically initialized using environment variables.

---

# 🔐 Authentication & Authorization

The application implements role-based authentication.

```text
                     ┌─────────────┐
                     │    User     │
                     └──────┬──────┘
                            │
                            ▼
                 ┌──────────────────┐
                 │ Authentication   │
                 └────────┬─────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         Candidate     Recruiter     Admin
              │           │           │
              ▼           ▼           ▼
           Candidate   Recruiter    Admin
            Portal      Portal      Portal
```

### Authentication Methods

| User Role | Authentication |
|---|---|
| 👨‍💻 Candidate | Email OTP + JWT |
| 🧑‍💼 Recruiter | Email + Password + JWT |
| 👑 Admin | Email + Password + JWT |

Role-protected backend API routes help ensure users can only access authorized resources.

---

# 🏗️ System Architecture

```text
                              👤 USERS
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      React + Vite       │
                    │        Frontend         │
                    │        Netlify          │
                    └────────────┬────────────┘
                                 │
                             REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Node.js Backend     │
                    │       Express.js        │
                    │         Render          │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
          ┌──────────────┐ ┌────────────┐ ┌──────────────┐
          │   SQLite DB  │ │ OpenAI API │ │ Email Service│
          └──────────────┘ └────────────┘ └──────────────┘
```

---

# 🔄 Application Workflow

```text
User
 │
 ▼
Authentication
 │
 ▼
Select User Role
 │
 ├──────────────┬──────────────┐
 ▼              ▼              ▼
Candidate     Recruiter       Admin
 │              │              │
 ▼              ▼              ▼
Interview     Create         Platform
Practice      Interview      Management
 │              │              │
 ▼              ▼              ▼
AI Questions   Invite        Statistics
 │              Candidates
 ▼
Voice / Text Answer
 │
 ▼
AI Evaluation
 │
 ▼
Feedback + Transcript
 │
 ▼
Interview History
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript
- CSS
- Browser Speech APIs
- Browser Media / Camera APIs

## Backend

- Node.js
- Express.js

## Database

- SQLite

## Artificial Intelligence

- OpenAI API
- AI-generated interview questions
- AI answer evaluation
- Offline fallback system

## Authentication

- JWT
- Email OTP authentication
- Role-based access control

## Email

- Email-based candidate invitations
- OTP authentication
- Email service integration

## Deployment

- **Netlify** — Frontend
- **Render** — Backend
- **GitHub** — Source control and version management

---

# 📂 Project Structure

```text
SDEPrepAI-Interview
│
├── client
│   │
│   ├── src
│   │   ├── pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── styles.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server
│   │
│   ├── controllers
│   ├── routes
│   ├── src
│   ├── uploads
│   │
│   ├── package.json
│   └── .env.example
│
├── docs
│
├── .gitignore
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Ashutoshsingh1212/SDEPrepAI-Interview.git
```

Move into the project:

```bash
cd SDEPrepAI-Interview
```

---

## 2️⃣ Install Dependencies

From the project root:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

---

# 🔐 Environment Setup

Create the environment file:

```bash
cp server/.env.example server/.env
```

Edit:

```text
server/.env
```

Example:

```env
PORT=3001

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

CLIENT_URL=http://localhost:5173

JWT_SECRET=your_secure_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password

ADMIN_NAME=Admin
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

RECRUITER_NAME=Recruiter
RECRUITER_EMAIL=your_recruiter_email
RECRUITER_PASSWORD=your_recruiter_password
```

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

> ⚠️ Never upload your `.env` file, API keys, email passwords, or JWT secrets to GitHub.

---

# 💻 Run Locally

## Start Everything

From the project root:

```bash
npm run dev
```

The application should be available at:

| Service | Local URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:3001` |

---

# 🩺 Backend Health Check

Open:

```text
http://localhost:3001/api/health
```

A correctly configured backend may return:

```json
{
  "ok": true,
  "openaiConfigured": true,
  "database": true
}
```

Depending on your email configuration, additional email-related status fields may also be returned.

---

# 🔗 Application Routes

## Candidate

```text
/candidate/login
```

## Recruiter

```text
/recruiter/login
```

## Admin

```text
/admin/login
```

---

# 🌍 Production Deployment

## Frontend — Netlify

The React/Vite frontend is deployed on Netlify.

**Live Website:**

https://sdeprepai-interview.netlify.app/

---

## Backend — Render

The Express backend is deployed on Render.

**Live Backend:**

https://sdeprepai-interview-backend.onrender.com

---

# 🔄 Continuous Deployment

This project is connected to GitHub for automatic deployment.

Whenever changes are pushed to the `main` branch:

```text
Developer
    │
    ▼
VS Code Changes
    │
    ▼
git add .
    │
    ▼
git commit
    │
    ▼
git push origin main
    │
    ▼
GitHub Repository Updated
    │
    ├───────────────────┐
    ▼                   ▼
Netlify              Render
Frontend             Backend
Deploy               Deploy
    │                   │
    └─────────┬─────────┘
              ▼
      Live Application
```

---

# 🔒 Security

The following sensitive information should **never** be committed to GitHub:

- OpenAI API keys
- Email passwords
- Gmail App Passwords
- JWT secrets
- `.env` files
- Production credentials

Always use environment variables for secrets.

---

# 📈 Future Improvements

Potential future improvements include:

- 🎥 Advanced video interview analysis
- 🧠 Facial expression analysis
- 🎙️ Improved speech-to-text
- 📄 AI-powered resume analysis
- 💡 Personalized interview preparation roadmap
- 📊 Advanced platform analytics
- 🏆 Candidate leaderboards
- 🌐 Multi-language interview support
- 📱 Mobile application
- 🔔 Real-time notifications
- 🗄️ Cloud database migration
- 📈 Advanced recruiter analytics

---

# 👨‍💻 Developer

**Ashutosh Singh**

GitHub:  
https://github.com/Ashutoshsingh1212

Project Repository:  
https://github.com/Ashutoshsingh1212/SDEPrepAI-Interview

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐.

Your support helps motivate future improvements and development.

---

<div align="center">

### 🚀 Practice. Prepare. Perform. Improve.

**SDEPrepAI Interview — AI-Powered Interview Preparation Platform**

</div>