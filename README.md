# Full-Stack Blog Management System

A complete, responsive Blog Management System with an admin dashboard and a public-facing blog.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React, Framer Motion
- **Backend:** Node.js, Express.js, MySQL (`mysql2`), JWT, bcrypt, express-validator, dotenv
- **Database:** MySQL (`blog_management`)

## Project Structure
```
.
├── backend/
│   ├── config/          # Database pool configuration
│   ├── controllers/     # Route handlers (auth, dashboard, posts, categories, public)
│   ├── database/        # schema.sql and seed.js
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Data access layer (MySQL queries)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helpers (slugify, pagination)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # UI and public components
│   │   ├── context/     # Auth context
│   │   ├── layouts/     # Admin and Public layouts
│   │   ├── pages/       # Admin and Public pages
│   │   ├── routes/      # ProtectedRoute
│   │   ├── services/    # Axios API instance
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── API_ROUTES.md
└── README.md
```

## Prerequisites
- Node.js 18+
- npm
- MySQL Server 8+ running locally (or accessible remotely)

## 1. Database Setup
1. Start your MySQL server.
2. Create the database and tables using the schema:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
   (Or run the contents of `backend/database/schema.sql` in your MySQL client.)
3. **If upgrading an existing installation** to include role management, apply the migration (non-destructive):
   ```bash
   mysql -u root -p blog_management < backend/database/migrate_roles.sql
   ```

## 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` with your values:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (use a long random string)
- `CLIENT_URL` (default `http://localhost:5173`)
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used for seeding initial admin)

### Seed initial admin account
```bash
npm run seed
```
This creates an admin using `ADMIN_*` values from `.env` (password is hashed with bcrypt). It skips if an admin with that email already exists. **Do not hardcode production credentials; set them in `.env`.**

### Run backend
```bash
npm run dev   # with nodemon
# or
npm start
```
Backend runs on `http://localhost:5000` by default.

## 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
```
Edit `frontend/.env` if needed:
```
VITE_API_URL=http://localhost:5000/api
```

### Run frontend
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Default Admin Setup
- Configure `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `backend/.env`.
- Run `npm run seed` from the `backend` directory.
- Log in at: `http://localhost:5173/admin/login`

> Change the seeded password and use strong credentials in any non-local environment.

## Features
### Admin
- Secure login (JWT, bcrypt), protected routes, logout
- Dashboard with real-time stats (total/published/draft posts, categories, recent posts)
- Post CRUD: title, auto/unique slug, featured image URL, excerpt, content, category, status (Draft/Published), publish/unpublish toggle, search, filter by category/status, pagination
- Category CRUD: name, auto-slug, duplicate prevention, post counts, safe delete (posts become uncategorized via `ON DELETE SET NULL`)

### Public Blog
- Homepage with hero, latest posts, and categories
- Blog listing with pagination and category filtering (published posts only)
- Blog detail with featured image, metadata, content, related posts, and back navigation
- No login required for visitors; unpublished posts never exposed via public API

## Security Notes
- Passwords hashed with bcrypt; JWT-protected admin endpoints
- Input validation via `express-validator`
- Parameterized SQL queries (`mysql2` prepared statements)
- Secrets and DB credentials stored in `.env` (not committed); `.env.example` provided
- CORS restricted to configured client origin

## Build for Production
```bash
# frontend
cd frontend && npm run build
# backend
cd backend && npm start
```
Serve the `frontend/dist` folder via your preferred static host or configure Express to serve it, and ensure environment variables are set appropriately.
