# Job Board MVP — API

Node.js + Express + MongoDB Atlas + Cloudinary

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your values
cp .env.example .env

# 3. Add MongoDB Atlas connection string
# Example:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/jobboard

# 4. Start dev server
npm run dev
```

---

## Environment Variables

| Variable                | Required | Description                     |
| ----------------------- | -------- | ------------------------------- |
| `MONGO_URI`             | ✓        | MongoDB Atlas connection string |
| `JWT_SECRET`            | ✓        | Min 32 chars, random string     |
| `JWT_EXPIRES_IN`        | ✓        | e.g. `24h`                      |
| `CLOUDINARY_CLOUD_NAME` | ✓        | From Cloudinary dashboard       |
| `CLOUDINARY_API_KEY`    | ✓        | From Cloudinary dashboard       |
| `CLOUDINARY_API_SECRET` | ✓        | From Cloudinary dashboard       |

---

## API Reference

All authenticated routes require:

```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint              | Auth | Role       | Description     |
| ------ | --------------------- | ---- | ---------- | --------------- |
| POST   | `/api/auth/register`  | No   | —          | Create account  |
| POST   | `/api/auth/login`     | No   | —          | Login           |
| POST   | `/api/auth/logout`    | Yes  | Any        | Logout          |
| GET    | `/api/auth/me`        | Yes  | Any        | Get own profile |
| PATCH  | `/api/auth/me`        | Yes  | Any        | Update name/bio |
| POST   | `/api/auth/me/resume` | Yes  | job_seeker | Upload resume   |

---

### Jobs

| Method | Endpoint                     | Auth | Role       | Description             |
| ------ | ---------------------------- | ---- | ---------- | ----------------------- |
| GET    | `/api/jobs`                  | No   | —          | List/search/filter jobs |
| GET    | `/api/jobs/:id`              | No   | —          | Single job              |
| POST   | `/api/jobs`                  | Yes  | employer   | Create job              |
| PATCH  | `/api/jobs/:id`              | Yes  | employer   | Update job              |
| DELETE | `/api/jobs/:id`              | Yes  | employer   | Delete job              |
| GET    | `/api/jobs/employer/mine`    | Yes  | employer   | My jobs                 |
| GET    | `/api/jobs/:id/applications` | Yes  | employer   | View applicants         |
| POST   | `/api/jobs/:id/apply`        | Yes  | job_seeker | Apply                   |

---

### Applications

| Method | Endpoint                 | Auth | Role       | Description     |
| ------ | ------------------------ | ---- | ---------- | --------------- |
| GET    | `/api/applications/mine` | Yes  | job_seeker | My applications |

---

## Database Schema (MongoDB)

---

### Users Collection

```js
{
  _id: ObjectId,
  email: String,        // unique, required
  password_hash: String,
  role: "job_seeker" | "employer",
  name: String,
  bio: String,
  resume_url: String,
  resume_public_id: String,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

* `email` → unique

---

### Jobs Collection

```js
{
  _id: ObjectId,
  employer_id: ObjectId, // ref: users
  title: String,
  description: String,
  company_name: String,
  salary_min: Number,
  salary_max: Number,
  remote_type: "remote" | "onsite" | "hybrid",
  category: "engineering" | "design" | "marketing" | "sales" | "finance" | "ops" | "other",
  status: "active" | "closed",
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

* `employer_id`
* `status`
* `remote_type`
* `category`
* text index on `title`

---

### Applications Collection

```js
{
  _id: ObjectId,
  job_id: ObjectId,        // ref: jobs
  applicant_id: ObjectId,  // ref: users
  resume_url: String,
  resume_public_id: String,
  applied_at: Date
}
```

Indexes:

* `{ job_id: 1, applicant_id: 1 }` → UNIQUE
* `job_id`
* `applicant_id`

---

## Key Design Decisions

**MongoDB instead of SQL**
Faster iteration, flexible schema for MVP. Relationships handled via ObjectId references.

**Unique compound index on applications**
Prevents duplicate applications at DB level:

```js
{ job_id: 1, applicant_id: 1 }
```

**Cloudinary for resumes**
Never store files locally.

**Job status (active/closed)**
Prevents applications to closed jobs.

---

## Project Structure

```
src/
├── app.js
├── config/
│   ├── db.js               # MongoDB connection
│   └── cloudinary.js
├── models/
│   ├── User.js             # Mongoose schemas
│   ├── Job.js
│   └── Application.js
├── controllers/
├── routes/
├── middleware/
└── utils/
```

---

## Notes

* Use Mongoose for schema validation
* Enforce role logic in middleware
* Always validate input (express-validator or Joi)
* Add indexes early — MongoDB performance depends on it
