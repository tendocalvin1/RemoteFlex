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
8. [Recent Updates & Fixes](#8-recent-updates--fixes)
9. [What's Remaining](#9-whats-remaining)
10. [Known Issues & Workarounds](#10-known-issues--workarounds)

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

**Authentication Strategy:**
Auth has been migrated to **secure HTTP-only cookies** instead of storing tokens in localStorage. This prevents XSS token theft.

**Registration Flow:**
1. User registers with name, email, password, role
2. Crypto token generated and stored (24hr expiry)
3. Verification email sent via Nodemailer
4. Account blocked until email verified (development mode: auto-verified)
5. User can now login

**Login Flow:**
1. Credentials validated
2. Email verification check (auto-verified in dev mode)
3. Access token generated (15 min expiry)
4. Refresh token generated (7 days expiry)
5. **Refresh token stored in DB + sent as HTTP-only, secure cookie**
6. **Access token sent as HTTP-only, secure cookie**
7. CSRF token generated + sent as accessible cookie
8. Message returned to frontend confirming login

**Cookie Configuration (Secure):**
- `sameSite: "none"` — allows cross-site cookie access (frontend on 3000, backend on 8000)
- `secure: true` — cookies only sent over HTTPS (required by browsers with `sameSite: "none"`)
- `httpOnly: true` — JavaScript cannot access (prevents XSS theft)
- `maxAge` — 7 days for refresh token, 15 min for access token

**Token Refresh Flow:**
1. Frontend Axios interceptor detects 401 response
2. Interceptor checks if failed request was not already the refresh endpoint (prevents infinite loops)
3. Axios calls `POST /api/users/refresh-token` with cookies + CSRF header
4. Backend validates refresh token from cookie + CSRF token
5. Backend issues new access token cookie + new refresh token cookie
6. Original request automatically retried with new access token
7. If refresh fails, user is logged out and redirected to login

**Frontend Refresh Logic:**
- `useAuth()` hook attempts refresh once on app mount (with `useRef` guard to prevent retries)
- Axios interceptor handles mid-session refresh on 401
- Refresh endpoint itself is excluded from retry logic to prevent infinite loops

**Logout Flow:**
1. Frontend calls `POST /api/users/logout`
2. Backend clears refresh token from DB
3. Backend clears both access + refresh cookies
4. Backend clears CSRF token cookie
5. Frontend clears auth state
6. User redirected to login page

### 3.3 Security Measures
- Helmet for security headers (CSP, X-Frame-Options, etc.)
- CORS with whitelisted origins (`localhost:3000`, `localhost:8000` for dev)
- Rate limiting: 100 req/15min globally, 10 req/15min on auth routes
- Body size limit: 3MB
- JWT secrets via environment variables
- **HTTP-only cookies with `sameSite: "none"` + `secure: true`** — prevents XSS theft and allows cross-site access
- CSRF protection: tokens generated on login/register/refresh, required on logout/refresh endpoints
- Password minimum 8 characters, hashed with bcrypt (12 rounds)
- Mass assignment protection via field whitelisting in controllers
- Ownership checks on all protected routes (verify user can only access their own data)
- Sensitive fields hidden via `toJSON()` model method
- `select: false` on password, tokens, resumePublicId, email verification token, password reset token
- Input sanitization via xss library to prevent injection attacks
- Rate limit headers returned to frontend for transparency

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
- Socket.io server attached to HTTP server in `index.js` with CORS configuration
- Cookies parsed for socket authentication via `cookieParser()` middleware
- `connectedUsers` Map tracks userId → socketId mapping
- On user login: frontend socket emits `register` event with userId to associate socket with user account
- On application status update: server emits `applicationStatusUpdate` to specific user's socket
- Notification payload includes: message, status, jobTitle, companyName, timestamp
- Socket auth validated using cookies (same auth as HTTP endpoints)

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
- `withCredentials: true` — auto-includes cookies in all requests
- Request interceptor: auto-attaches CSRF token to POST/PUT/PATCH/DELETE requests
- Response interceptor: 
  - Detects 401 responses
  - Prevents infinite retry loops by skipping refresh on the `/refresh-token` endpoint itself
  - Auto-calls `POST /api/users/refresh-token` with cookies + CSRF header
  - Retries original failed request with new access token
  - On refresh failure, logs out user and redirects to login

**Auth Store** (`src/store/authStore.js`)
- Zustand with `persist` middleware
- Stores: `user` object, isLoading, error
- Does NOT store tokens (they're in HTTP-only cookies)
- Actions: `setAuth()`, `logout()`, `setLoading()`
- Persisted to localStorage as `auth-storage` (only user data, not tokens)

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

## 8. Recent Updates & Fixes (May 2026)

### Backend Fixes
- ✅ **Cookie Security:** Fixed token cookies to use `secure: true` with `sameSite: "none"` — browsers reject `sameSite: "none"` without secure flag
- ✅ **Socket Auth:** Fixed typo `oi.use()` → `io.use()` in socket middleware
- ✅ **Email Verification:** Added auto-verification in dev mode to ease testing (checks `NODE_ENV === "development"`)

### Frontend Fixes
- ✅ **Refresh Token Loop Prevention:** 
  - Added `useRef` guard in `useAuth()` hook to prevent retry storms on mount
  - Axios interceptor now skips retry logic for `/refresh-token` endpoint itself
  - Prevents infinite 429 rate limit errors from refresh attempts
- ✅ **Cookie-based Auth:** Migrated from localStorage tokens to HTTP-only cookies
- ✅ **CSRF Integration:** All state-changing requests include `X-CSRF-Token` header automatically

### Testing Checklist (Development)
- ✅ Backend runs on `localhost:8000`
- ✅ Frontend runs on `localhost:3000`
- ✅ Health check: `GET http://localhost:8000/health` returns `200 OK`
- ✅ Registration creates user + auto-verifies in dev mode
- ✅ Login sets `accessToken` + `refreshToken` + `csrfToken` cookies
- ✅ Protected requests include cookies automatically
- ✅ Token refresh works on 401 without infinite retries
- ✅ Logout clears all auth cookies

---

## 9. What's Remaining

### Critical
- [ ] **CI/CD Issue:** Add `job-portal-backend/package-lock.json` to fix GitHub Actions workflow (backend cache path validation)
- [ ] Test full auth flow end-to-end (register → verify → login → refresh → logout)

### Backend
- [ ] Socket.io integration test with frontend
- [ ] Email service integration with actual email provider (currently using console mock)
- [ ] Add `NODE_ENV=production` on Render deployment

### Frontend Pages to Build
- [ ] `/forgot-password` — forgot password form with email validation
- [ ] `/reset-password` — reset password form with token from URL
- [ ] `/verify-email` — email verification handler (token from URL)
- [ ] `/dashboard/employer/jobs/create` — post a new job form
- [ ] `/dashboard/employer/jobs/[id]/applicants` — view and manage applicants
- [ ] `/dashboard/jobseeker/profile` — edit profile, upload resume, manage applications

### Frontend Features to Add
- [ ] Socket.io client integration for real-time application status notifications
- [ ] Notification bell icon in Navbar
- [ ] Resume upload on profile page (Cloudinary integration)
- [ ] Pagination on job listings
- [ ] Loading skeletons instead of plain loaders
- [ ] Advanced job filtering (salary range, date posted, remote type)
- [ ] Search functionality (currently uses simple contains matching)

### Deployment
- [ ] Deploy frontend to Vercel or similar
- [ ] Update `CLIENT_URL` env var on Render to live frontend URL
- [ ] Update CORS origins on backend for production frontend URL
- [ ] Set up environment variables on deployment platforms

### Monitoring & Observability
- [ ] Add request/error logging with structured format
- [ ] Add performance metrics (response times, DB query times)
- [ ] Error tracking (Sentry or similar)

---

## 10. Known Issues & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| Rate limit 429 on `/refresh-token` | Frontend retry storms | Fixed: Axios interceptor skips retry for refresh endpoint |
| Cookies not set on login | `sameSite: "none"` without `secure: true` | Fixed: `secure: true` now always set |
| Infinite auth retries | Hook retrying refresh on mount | Fixed: `useRef` guard prevents multiple attempts |
| Socket auth failure | Typo in socket middleware | Fixed: `oi.use()` changed to `io.use()` |
| Cannot login (email not verified) | Dev mode requires email verification | Fixed: Auto-verify in dev mode when `NODE_ENV === "development"` |

---

*Documentation updated: May 5, 2026*  
*Author: Tendo Calvin — RemoteFlex Project Portfolio*
