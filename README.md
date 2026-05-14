# RemoteFlex 🚀
### High-Performance Remote Job Platform & Career Intelligence System

[![CI](https://github.com/tendocalvin1/RemoteFlex/actions/workflows/ci.yml/badge.svg)](https://github.com/tendocalvin1/RemoteFlex/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

RemoteFlex is a high-performance remote job platform and AI-powered career intelligence system engineered for software developers and technology professionals. In addition to job discovery, applicant tracking, and real-time notifications, RemoteFlex includes an AI Career Copilot built with Python and FastAPI that performs semantic resume-to-job matching, skill gap analysis, and personalized career recommendations.

---

## 🌟 Key Features

- **Advanced Search**: MongoDB Text Search with relevance scoring.
- **Employer ATS**: Comprehensive dashboard for posting and managing job applicants.
- **Job Seeker Dashboard**: Real-time tracking of application statuses.
- **Instant Notifications**: Powered by Socket.io for live feedback loops.
- **Secure Auth**: JWT authentication using HTTP-only cookies and CSRF protection.
- **Modern UI**: Built with Next.js 15, Tailwind CSS, and TanStack Query.
- **AI Career Copilot**: Semantic resume-to-job matching using transformer embeddings.
- **Skill Gap Analysis**: Identifies missing skills required for target roles.
- **Explainable AI Matching**: Human-readable explanations for every match score.
- **Career Recommendations**: Personalized guidance to improve employability.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    A[Client - Next.js 15] -->|Socket.io / REST| B[Backend - Node.js/Express]
    B --> C[(MongoDB - Primary Store)]
    B --> D[Cloudinary - Document Storage]
    B --> E[Real-time Notification Hub]
```

Detailed technical documentation can be found in [RemoteFlex_Documentation.md](./RemoteFlex_Documentation.md).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, TanStack Query, Zustand |
| **Backend** | Node.js, Express.js, Socket.io, Mongoose |
| **Database** | MongoDB Atlas |
| **Storage** | Cloudinary |
| **DevOps** | Docker, GitHub Actions (CI) |
| **AI Services** | Python, FastAPI, Sentence Transformers, Scikit-learn, Pytest |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MongoDB Atlas Account
- Cloudinary Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tendocalvin1/RemoteFlex.git
   cd RemoteFlex
   ```

2. **Setup Backend:**
   ```bash
   cd job-portal-backend
   cp .env.example .env
   # Configure your environment variables
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../job-portal-frontend
   cp .env.example .env.local
   # Configure your environment variables
   npm install
   ```

### Running Locally

**Using Docker (Recommended):**
```bash
docker-compose up --build
```

**Manual Start:**
- Backend: `npm run dev` (Port 8000)
- Frontend: `npm run dev` (Port 3000)

---

## 🧪 Testing

```bash
cd job-portal-backend
npm test
cd career-copilot
pytest -v
```

---

## 📡 API Documentation

Interactive Swagger UI is available at:
`http://localhost:8000/api-docs`

---

### AI Career Copilot API
Interactive Swagger UI:
http://localhost:8000/docs

## 🤝 Contributing

We welcome contributions! Please see our [Technical Debt & Recommendations](./RemoteFlex_Documentation.md#26-technical-debt-and-recommendations) section for areas where you can help.

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Tendo Calvin**
- GitHub: [@tendocalvin1](https://github.com/tendocalvin1)
- Role: Full-stack Engineer

---
*Built with ❤️ for the global remote workforce.*
