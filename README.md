# SafeSpace — Anonymous Peer Support Platform

A full-stack web application for African youth to share mental health stories anonymously and support each other.

---

## Project Structure

```
safespace/
├── backend/              ← Node.js / Express API server
│   ├── server.js         ← Entry point, middleware, route mounting
│   ├── .env              ← Environment variables (see below)
│   ├── package.json      ← npm dependencies
│   ├── data/
│   │   └── store.js      ← In-memory data store (replace with DB in production)
│   ├── middleware/
│   │   ├── auth.js       ← JWT authentication helpers
│   │   └── moderation.js ← Profanity filter + crisis keyword detection
│   └── routes/
│       ├── auth.js       ← Register / Login / Profile
│       ├── stories.js    ← Story CRUD, likes, categories
│       ├── comments.js   ← Comment CRUD, likes
│       ├── reports.js    ← Content reporting
│       ├── admin.js      ← Moderation dashboard (admin/mod only)
│       └── dashboard.js  ← User's own content & stats
└── frontend/
    └── index.html        ← Single-page app (vanilla HTML/CSS/JS, no build step)
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

---

## Quick Start

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

The `.env` file is pre-configured for local development:

```env
PORT=3001
JWT_SECRET=safespace_super_secret_key_change_in_production_use_a_random_256bit_value
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500
```

> ⚠️ **Before deploying to production**, replace `JWT_SECRET` with a long random string:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 3. Start the backend server

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

The server starts at **http://localhost:3001**

### 4. Open the frontend

**Option A — Served by Express (recommended):**
Open http://localhost:3001 in your browser. The backend already serves the frontend as static files.

**Option B — VS Code Live Server:**
Open `frontend/index.html` with the Live Server extension (runs on port 5500). The frontend API points to `http://localhost:3001/api`.

---

## Default Credentials

| Role      | Email                   | Password    |
|-----------|-------------------------|-------------|
| Admin     | admin@safespace.org     | admin  

---

## API Endpoints

| Method | Path                                      | Auth         | Description                  |
|--------|-------------------------------------------|--------------|------------------------------|
| POST   | /api/auth/register                        | —            | Create account               |
| POST   | /api/auth/login                           | —            | Login, receive JWT           |
| GET    | /api/auth/me                              | User         | Get current user             |
| PATCH  | /api/auth/me                              | User         | Update profile               |
| GET    | /api/stories                              | Optional     | List approved stories        |
| GET    | /api/stories/categories                   | —            | Category counts              |
| GET    | /api/stories/:id                          | Optional     | Story detail + comments      |
| POST   | /api/stories                              | Optional     | Submit story                 |
| PATCH  | /api/stories/:id/overcome                 | User         | Add overcome update          |
| POST   | /api/stories/:id/like                     | Optional     | Like a story                 |
| DELETE | /api/stories/:id                          | User/Mod     | Delete story                 |
| POST   | /api/stories/:storyId/comments            | Optional     | Post comment                 |
| POST   | /api/stories/:storyId/comments/:id/like   | Optional     | Like a comment               |
| DELETE | /api/stories/:storyId/comments/:id        | User/Mod     | Delete comment               |
| POST   | /api/reports                              | Optional     | File a report                |
| GET    | /api/reports                              | Mod/Admin    | List reports                 |
| PATCH  | /api/reports/:id/resolve                  | Mod/Admin    | Resolve a report             |
| GET    | /api/admin/stats                          | Mod/Admin    | Platform stats               |
| GET    | /api/admin/stories                        | Mod/Admin    | All stories (incl. pending)  |
| PATCH  | /api/admin/stories/:id/status             | Mod/Admin    | Approve/reject/remove        |
| GET    | /api/admin/comments                       | Mod/Admin    | All comments                 |
| PATCH  | /api/admin/comments/:id/status            | Mod/Admin    | Moderate comment             |
| GET    | /api/admin/users                          | Admin only   | List all users               |
| GET    | /api/admin/logs                           | Mod/Admin    | Moderation audit log         |
| GET    | /api/dashboard                            | User         | User's stories & stats       |
| GET    | /api/health                               | —            | Health check                 |

---

## Frontend Dependencies

The frontend is **pure vanilla HTML/CSS/JS** — no build step, no npm, no bundler required.

| Resource              | Source          | Purpose                  |
|-----------------------|-----------------|--------------------------|
| Playfair Display font | Google Fonts    | Display headings         |
| DM Sans font          | Google Fonts    | Body text                |

All other UI code (components, routing, API calls) is written inline in `index.html`.

---

## Backend Dependencies

| Package             | Version  | Purpose                               |
|---------------------|----------|---------------------------------------|
| express             | ^4.18.2  | HTTP server & routing                 |
| cors                | ^2.8.5   | Cross-origin resource sharing         |
| helmet              | ^7.1.0   | Security HTTP headers                 |
| express-rate-limit  | ^7.1.5   | Rate limiting (auth, stories, comments) |
| bcryptjs            | ^2.4.3   | Password hashing                      |
| jsonwebtoken        | ^9.0.0   | JWT auth tokens                       |
| express-validator   | ^7.0.1   | Input validation & sanitisation       |
| uuid                | ^9.0.0   | UUID generation for IDs               |
| dotenv              | ^16.3.1  | Environment variable loading          |
| bad-words           | ^3.0.4   | Profanity filtering                   |
| nodemon *(dev)*     | ^3.0.2   | Auto-restart on file changes          |

---

## Production Checklist

- [ ] Replace `JWT_SECRET` with a cryptographically random 256-bit value
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Replace in-memory `store.js` with a real database (PostgreSQL recommended)
- [ ] Set `FRONTEND_URL` to your actual domain
- [ ] Run behind a reverse proxy (nginx/Caddy) with HTTPS
- [ ] Add proper logging (winston / pino)
- [ ] Set up database backups
