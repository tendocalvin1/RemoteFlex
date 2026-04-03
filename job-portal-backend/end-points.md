AUTH (no token needed)
POST   /api/users/register
POST   /api/users/login

USERS (token required)
GET    /api/users/currentUser

JOBS (public)
GET    /api/jobs/get
GET    /api/jobs/job/:id

JOBS (token required — employer only)
POST   /api/jobs/create
PATCH  /api/jobs/job/:id/close

APPLICATIONS (token required — job seeker only)
POST   /api/applications/apply

APPLICATIONS (token required — employer only)
GET    /api/applications/:jobId/applications
PATCH  /api/applications/update/:id

APPLICATIONS (token required — job seeker only)
GET    /api/applications/getApplications

HEALTH (no token)
GET    /health