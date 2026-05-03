# RemoteFlex — Full Stack Job Portal
### Project Documentation
**Author:** Tendo Calvin  
**Stack:** Node.js · Express.js · MongoDB · Next.js · Tailwind CSS  
**Repository:** https://github.com/tendocalvin1/RemoteFlex.git  
**Live Backend:** https://remoteflex.onrender.com

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [DevOps & Deployment](#5-devops--deployment)
6. [Environment Variables](#6-environment-variables)
7. [API Endpoints](#7-api-endpoints)
8. [What's Remaining](#8-whats-remaining)

---

## 1. Project Overview

RemoteFlex is a full-stack job portal connecting African talent to global remote work opportunities. It allows job seekers to find and apply for remote jobs, and employers to post and manage job listings with a complete application tracking system.

**Core Problem Solved:**
- Centralized platform for remote jobs only
- Role-based access for job seekers and employers
- Real-time application status notifications
- Secure authentication with email verification

---

## 2. System Architecture

```
job-portal/
├── job-portal-backend/       ← Express.js REST API
│   ├── config/
│   │   ├── database.js       ← MongoDB Atlas connection
│   │   ├── email.js          ← Nodemailer transporter
│   │   ├── email-templates.js← HTML email templates
│   │   ├── cloudinary.js     ← Cloudinary config
│   │   ├── constants.js      ← App constants
│   │   └── env.js            ← Environment variable exports
│   ├── controllers/
│   │   ├── users.controllers.js
│   │   ├── jobs.controllers.js
│   │   └── applications.controllers.js
│   ├── middleware/
│   │   └── auth.middleware.js ← JWT protect middleware
│   ├── models/
│   │   ├── users.models.js
│   │   ├── jobs.models.js
│   │   └── applications.models.js
│   ├── routes/
│   │   ├── users.routes.js
│   │   ├── jobs.routes.js
│   │   ├── applications.routes.js
│   │   └── upload.routes.js
│   ├── app.js                ← Express app setup
│   ├── index.js              ← Server entry point + Socket.io
│   └── Dockerfile
│
└── job-portal-frontend/      ← Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── page.js           ← Homepage (job listings)
        │   ├── layout.js         ← Root layout + Navbar
        │   ├── login/page.js     ← Login page
        │   ├── register/page.js  ← Register page
        │   ├── jobs/[id]/page.js ← Job detail page
        │   └── dashboard/
        │       ├── employer/page.js     ← Employer dashboard
        │       └── jobseeker/page.js    ← Job seeker dashboard
        ├── components/
        │   └── Navbar.js         ← Global navigation
        ├── lib/
        │   └── axios.js          ← Axios instance + interceptors
        └── store/
            └── authStore.js      ← Zustand auth state
```

---

## 3. Backend

### 3.1 Tech Stack
| Package | Purpose |
|---------|---------|
| Express.js | REST API framework |
| MongoDB + Mongoose | Database + ODM |
| JWT + jsonwebtoken | Access & refresh token auth |
| bcryptjs | Password hashing (12 rounds) |
| Nodemailer | Email service (Gmail App Password) |
| Cloudinary + Multer | Resume file uploads |
| Socket.io | Real-time notifications |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| cookie-parser | HTTP-only cookie handling |
| dotenvx | Environment variable management |
| Docker | Containerization |

### 3.2 Authentication System

**Registration Flow:**
1. User registers with name, email, password, role
2. Crypto token generated and stored (24hr expiry)
3. Verification email sent via Nodemailer
4. Account blocked until email verified

**Login Flow:**
1. Credentials validated
2. Email verification check
3. Access token generated (15 min expiry)
4. Refresh token generated (7 days expiry)
5. Refresh token stored in DB + sent as HTTP-only cookie
6. Access token returned in response body

**Token Refresh Flow:**
1. Frontend detects 401 response
2. Axios interceptor calls `/refresh-token` automatically
3. New access token issued silently
4. Original request retried with new token

**Logout Flow:**
1. Refresh token cleared from DB
2. HTTP-only cookie cleared
3. Frontend clears localStorage

### 3.3 Security Measures
- Helmet for security headers
- CORS with whitelisted origins
- Rate limiting: 100 req/15min globally, 10 req/15min on auth routes
- Body size limit: 3MB
- JWT secret via environment variables
- Password minimum 8 characters, hashed with bcrypt (12 rounds)
- Mass assignment protection via field whitelisting
- Ownership checks on all protected routes
- Sensitive fields hidden via `toJSON()` model method
- `select: false` on password, tokens, resumePublicId

### 3.4 Email Templates
| Template | Trigger |
|----------|---------|
| emailVerificationTemplate | On registration |
| passwordResetTemplate | On forgot password request |
| passwordResetSuccessTemplate | On successful password reset |
| applicationStatusTemplate | On employer status update |

### 3.5 Database Models

**User Model Fields:**
- email, password, role (job_seeker/employer)
- name, bio, avatar
- resumeUrl, resumePublicId
- isEmailVerified, lastLoginAt
- refreshToken
- emailVerificationToken + Expires
- passwordResetToken + Expires
- applicationsCount

**Job Model Fields:**
- employer (ref: User)
- companyName, companyLogo, companyWebsite
- title, description, requirements[], responsibilities[]
- salaryMin, salaryMax, currency
- remoteType (remote/onsite/hybrid)
- location, category, status (active/closed)
- expiresAt, views, applicationsCount
- tags[]

**Application Model Fields:**
- job (ref: Job), applicant (ref: User)
- resumeUrl, resumePublicId
- status (pending/reviewed/shortlisted/rejected)
- appliedAt
- Composite unique index on {job, applicant} — prevents duplicate applications

### 3.6 Real-time Notifications (Socket.io)
- Socket.io attached to HTTP server in `index.js`
- `connectedUsers` Map tracks userId → socketId
- On login: frontend emits `register` event with userId
- On application status update: server emits `applicationStatusUpdate` to specific socket
- Notification payload: message, status, jobTitle, companyName

---

## 4. Frontend

### 4.1 Tech Stack
| Package | Purpose |
|---------|---------|
| Next.js 14 (App Router) | Framework + SSR for SEO |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP requests + interceptors |
| TanStack React Query | Data fetching + caching |
| Zustand | Global auth state |
| React Hook Form | Form handling + validation |
| Socket.io Client | Real-time notifications |

### 4.2 Pages Built

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Homepage with job listings, search, category filters | ✅ Done |
| `/login` | Login form with validation | ✅ Done |
| `/register` | Registration with role selection | ✅ Done |
| `/jobs/[id]` | Job detail page with apply button | ✅ Done |
| `/dashboard/employer` | Employer dashboard with job stats | ✅ Done |
| `/dashboard/jobseeker` | Job seeker dashboard with application tracking | ✅ Done |
| `/forgot-password` | Forgot password form | ⏳ Pending |
| `/reset-password` | Reset password form | ⏳ Pending |
| `/verify-email` | Email verification handler | ⏳ Pending |
| `/dashboard/employer/jobs/create` | Post a new job form | ⏳ Pending |
| `/dashboard/employer/jobs/[id]/applicants` | View job applicants | ⏳ Pending |
| `/dashboard/jobseeker/profile` | Edit profile + upload resume | ⏳ Pending |

### 4.3 Key Components

**Navbar** (`src/components/Navbar.js`)
- Sticky top navigation
- Logo with RemoteFlex branding
- Find Jobs link
- Role-based Dashboard link (employer vs job seeker)
- Login/Register buttons when logged out
- User name + Logout button when logged in

**Axios Instance** (`src/lib/axios.js`)
- Base URL from `NEXT_PUBLIC_API_URL` env variable
- `withCredentials: true` for cookie support
- Request interceptor: auto-attaches Bearer token from localStorage
- Response interceptor: auto-refreshes token on 401, redirects to login on failure

**Auth Store** (`src/store/authStore.js`)
- Zustand with `persist` middleware
- Stores: `user`, `accessToken`
- Actions: `setAuth()`, `logout()`
- Persisted to localStorage as `auth-storage`

### 4.4 Homepage Features
- Hero section with headline and search bar
- Category filter pills (All, Engineering, Design, Marketing, Sales, Finance, Ops, Other)
- Job cards showing: remote badge, category, title, company, salary range, tags
- Total jobs count
- Empty state handling
- Error state when backend is unreachable

### 4.5 Job Detail Page Features
- Full job information display
- Requirements list with checkmarks
- Responsibilities list with arrows
- Salary range display
- Tags
- "Apply for this Job" button for logged-in job seekers
- "Login to Apply" button for unauthenticated users
- Back navigation link

---

## 5. DevOps & Deployment

### 5.1 Docker
- `Dockerfile` in backend root using `node:20-alpine`
- Multi-stage: copy package.json → npm install --production → copy source
- `.dockerignore` excludes node_modules, .env, .git
- CMD: `node index.js`

### 5.2 Deployment
| Service | Platform | URL |
|---------|----------|-----|
| Backend API | Render (Docker) | https://remoteflex.onrender.com |
| Database | MongoDB Atlas | cluster0.xhwfjz9.mongodb.net |
| File Storage | Cloudinary | cloud: demo |
| Frontend | Not deployed yet | localhost:3000 |

### 5.3 CI/CD
- GitHub repository: https://github.com/tendocalvin1/RemoteFlex.git
- Branch: `main`
- Render auto-deploys on push to main
- Conventional Commits format throughout

---

## 6. Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...
CLIENT_URL=http://localhost:3000
PORT=8000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 7. API Endpoints

### Auth Routes (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | Public | Register new user |
| POST | /login | Public | Login + get tokens |
| GET | /verify-email?token= | Public | Verify email |
| POST | /forgot-password | Public | Send reset email |
| PATCH | /reset-password?token= | Public | Reset password |
| POST | /refresh-token | Cookie | Refresh access token |
| POST | /logout | Cookie | Logout + clear tokens |
| GET | /currentUser | Protected | Get logged-in user |

### Job Routes (`/api/jobs`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /create | Employer | Create job |
| GET | /get | Public | Get all jobs (search, filter, paginate) |
| GET | /job/:id | Public | Get single job |
| PATCH | /job/:id/close | Employer | Close a job |

### Application Routes (`/api/applications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /apply | Job Seeker | Apply to a job |
| GET | /getApplications | Job Seeker | Get my applications |
| GET | /:jobId/applications | Employer | Get applications for a job |
| PATCH | /update/:id | Employer | Update application status |

### Upload Routes (`/api/upload`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /resume | Job Seeker | Upload resume to Cloudinary |

---

## 8. What's Remaining

### Backend
- [ ] Remove debug logs from `applications.controllers.js`
- [ ] Change access token back to `"15m"` expiry
- [ ] Add `NODE_ENV=production` on Render
- [ ] Push final commits

### Frontend Pages to Build
- [ ] `/forgot-password` — forgot password form
- [ ] `/reset-password` — reset password form
- [ ] `/verify-email` — handle email verification token from URL
- [ ] `/dashboard/employer/jobs/create` — post a new job form
- [ ] `/dashboard/employer/jobs/[id]/applicants` — view and manage applicants
- [ ] `/dashboard/jobseeker/profile` — edit profile, upload resume

### Frontend Features to Add
- [ ] Socket.io client integration for real-time notifications
- [ ] Notification bell in Navbar
- [ ] Resume upload on profile page
- [ ] Pagination on job listings
- [ ] Loading skeletons

### Deployment
- [ ] Deploy frontend to Vercel
- [ ] Update `CLIENT_URL` on Render to live frontend URL
- [ ] Update CORS origins on backend for production frontend URL

---

*Documentation generated: May 2026*  
*Author: Tendo Calvin — RemoteFlex Project*
