# 🐾 PetNest — Full-Stack MERN Pet Marketplace

A modern, responsive, SEO-friendly pet marketplace platform where users can browse pets (dogs, cats, birds, rabbits, fish, exotic pets), view detailed profiles, and submit enquiries to adopt/buy — plus a full-featured admin dashboard to manage the entire catalog.

The project is split into three independent applications:

| App | Description | Port |
|---|---|---|
| `client` | Customer-facing website (React + Vite + Tailwind) | `5173` |
| `admin` | Admin dashboard (React + Vite + Tailwind) | `5174` |
| `server` | REST API (Node.js + Express + MongoDB) | `5000` |

---

## ✨ Features

**Customer Website**
- Premium animated homepage (hero, categories, featured/latest pets, why-choose-us, testimonials, FAQ, contact)
- Category browsing with live pet counts
- Pet listing with search, filters (category, gender, breed, price, availability), and sorting
- Pet detail page with image gallery + zoom, related pets, full specs
- Buy/Enquire modal with validation → saved to MongoDB **and** appended to an Excel file
- Floating WhatsApp + Call buttons with pulse animation (always visible)
- Animated top announcement bar (pet-delivery themed) with dismiss control
- Compare Pets tool — select up to 4 pets from any card or detail page, compare side-by-side on `/compare`
- Pet detail page includes Quick Facts, "Why Buy From Us" trust badges, Care Tips, Recommended Diet / Foods-to-Avoid, and a pet-specific FAQ accordion
- Wishlist (localStorage), Back-to-top, Breadcrumbs, Skeleton loaders, 404 page
- Customer login / signup via **phone or email OTP** (OTP stored in MongoDB only — no SMS/email gateway in demo)
- My Account page (`/account`) with profile summary and logout
- About, Contact, Privacy Policy, Terms & Conditions pages
- SEO meta tags + Open Graph tags on every page

**Admin Dashboard**
- JWT-authenticated login with protected routes
- Dashboard overview: total pets/categories/enquiries, 7-day enquiry trend chart, status breakdown pie chart, latest enquiries
- Pet management: add/edit/delete, multi-image upload with preview/replace/delete, assign category, availability & featured toggles, SEO fields
- Category management: add/edit/delete, image upload, enable/disable
- Enquiry management: search, filter by status, inline status update, view details, delete, **Export to Excel**

**Backend**
- REST API with Express + Mongoose
- JWT auth + bcrypt password hashing
- Multer multi-image upload (pets & categories)
- Every enquiry is saved to MongoDB **and** appended to `server/exports/enquiries.xlsx` automatically (via `exceljs`)
- Optional **Google Sheets live sync** — new enquiries (and status changes) appear in a shared spreadsheet you can open in the browser
- **Resend** transactional emails — OTP (email login), welcome, login alerts, enquiry confirmations, status updates, donation thank-yous + admin alerts
- Security: Helmet, rate limiting, Mongo sanitization, input validation (express-validator), CORS allow-list
- Seed script with sample categories, pets, and an admin user

---

## 🗂️ Folder Structure

```
pets-website/
├── client/                # Customer website (Vite + React)
│   └── src/
│       ├── components/    # layout, home, pets, modals, common
│       ├── pages/
│       ├── context/       # WishlistContext
│       ├── hooks/
│       ├── services/      # axios API calls
│       └── utils/
├── admin/                 # Admin dashboard (Vite + React)
│   └── src/
│       ├── components/    # layout, common
│       ├── pages/
│       ├── context/       # AuthContext
│       ├── hooks/
│       ├── services/
│       └── utils/
└── server/                # Express API
    ├── src/
    │   ├── config/        # db.js
    │   ├── controllers/
    │   ├── middleware/    # auth, upload, error handling
    │   ├── models/        # User, Pet, Category, Enquiry
    │   ├── routes/
    │   ├── seed/           # seed data + script
    │   ├── utils/          # excelExport, generateToken
    │   └── validators/
    ├── uploads/            # pet & category images (multer)
    ├── exports/            # enquiries.xlsx auto-generated here
    └── server.js
```

---

## 🚀 Getting Started

> 💡 **Quick start:** After configuring the `.env` files (see below) and running `npm run seed --prefix server` once, you can run `npm install` at the repo root followed by `npm run dev` to launch the server, client, and admin dashboard together (via `concurrently`). Otherwise, follow the manual per-app steps below.

### Prerequisites
- Node.js 18+
- A MongoDB database — either:
  - Local MongoDB (`mongodb://127.0.0.1:27017`), or
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended if you don't have MongoDB installed locally)

### 1. Backend Setup

```bash
cd server
npm install
copy .env.example .env      # Windows (use `cp` on macOS/Linux)
```

Edit `server/.env` and set `MONGO_URI` to your MongoDB connection string, and update `JWT_SECRET` to a long random string.

Seed the database with sample categories, pets, and an admin user:

```bash
npm run seed
```

This prints the seeded admin login credentials (default: `admin@petnest.com` / `Admin@12345` — change these in `.env` before seeding for production).

Start the API server:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API will be available at `http://localhost:5000/api`.

### 2. Customer Website Setup

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Visit `http://localhost:5173`.

### 3. Admin Dashboard Setup

```bash
cd admin
npm install
copy .env.example .env
npm run dev
```

Visit `http://localhost:5174/login` and sign in with the seeded admin credentials.

---

## 🔑 Environment Variables

See `.env.example` in each folder. Key variables:

**server/.env**
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` / `ADMIN_URL` | Allowed CORS origins |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by `npm run seed` to create the first admin user |
| `WHATSAPP_NUMBER` / `PHONE_NUMBER` | Contact numbers (informational) |

**client/.env** & **admin/.env**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number (with country code, no `+` or spaces) used by floating button |
| `VITE_PHONE_NUMBER` | Phone number used by the floating call button |

---

## 📖 API Documentation

Base URL: `http://localhost:5000/api`

### Auth (Admin)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Admin login, returns JWT + user |
| GET | `/auth/me` | Private | Get current admin profile |
| PUT | `/auth/profile` | Private | Update admin name/email/password |

### Auth (Customer OTP)
OTP codes are stored in the `otps` collection only (no SMS/email provider). In development (`NODE_ENV !== production`), `send-otp` also returns the OTP in the JSON response for testing.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/customer/auth/send-otp` | Public | Generate OTP for `channel: "phone"` or `"email"` |
| POST | `/customer/auth/verify-otp` | Public | Verify OTP — existing users get JWT; new users get `signupToken` |
| POST | `/customer/auth/complete-signup` | Public | New users only — submit name (+ optional other contact) with `signupToken` |
| GET | `/customer/auth/me` | Customer | Current customer profile |
| PUT | `/customer/auth/profile` | Customer | Update name / link email or phone |

**Example — send OTP (phone):**
```json
POST /api/customer/auth/send-otp
{ "channel": "phone", "phone": "9876543210" }
```

**Example — send OTP (email):**
```json
POST /api/customer/auth/send-otp
{ "channel": "email", "email": "you@example.com" }
```

**Example — verify:**
```json
POST /api/customer/auth/verify-otp
{ "channel": "phone", "phone": "9876543210", "otp": "123456" }
```

Existing users receive `token` + `customer`. New users receive `isNewUser: true` + `signupToken`.

**Example — complete signup (new users only):**
```json
POST /api/customer/auth/complete-signup
{ "signupToken": "<from verify-otp>", "name": "Riya Sharma", "email": "riya@example.com" }
```

Customer site: `http://localhost:5173/login?return_url=/account`

### Categories
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Public | List categories (add `?all=true` to include disabled, admin use) |
| GET | `/categories/:id` | Public | Get category by id or slug |
| POST | `/categories` | Private | Create category (`multipart/form-data`, field `image`) |
| PUT | `/categories/:id` | Private | Update category |
| DELETE | `/categories/:id` | Private | Delete category (blocked if it has pets) |

### Pets
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/pets` | Public | List pets. Query params: `search, category, gender, breed, minPrice, maxPrice, availability, featured, sort, page, limit` |
| GET | `/pets/featured` | Public | Featured pets |
| GET | `/pets/latest` | Public | Latest pets |
| GET | `/pets/:id` | Public | Get pet by id or slug + related pets |
| POST | `/pets` | Private | Create pet (`multipart/form-data`, field `images`, up to 10) |
| PUT | `/pets/:id` | Private | Update pet (supports adding new images + `removedImages[]`) |
| DELETE | `/pets/:id` | Private | Delete pet |

`sort` accepts: `newest`, `oldest`, `price-asc`, `price-desc`, `name-asc`, `name-desc`.

### Enquiries
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/enquiry` | Public | Submit an enquiry — saved to MongoDB + appended to Excel |
| GET | `/enquiry` | Private | List enquiries. Query params: `search, status, page, limit` |
| GET | `/enquiry/export/excel` | Private | Download all enquiries as `.xlsx` |
| GET | `/enquiry/stats/dashboard` | Private | Dashboard stats (totals, trend, status breakdown, latest) |
| GET | `/enquiry/:id` | Private | Get single enquiry |
| PUT | `/enquiry/:id` | Private | Update enquiry status (`Pending`, `Contacted`, `Completed`, `Rejected`) |
| DELETE | `/enquiry/:id` | Private | Delete enquiry |

**Private** routes require header: `Authorization: Bearer <token>`.

---

## 📊 MongoDB Collections

- `users` — Admin accounts
- `customers` — Customer accounts (email and/or phone, verified via OTP)
- `otps` — One-time passwords (TTL index on `expiresAt`; demo stores codes in DB only)
- `categories` — Pet categories (name, slug, image, active flag)
- `pets` — Pet listings (full specs, images, pricing, SEO fields)
- `enquiries` — Buy/enquiry submissions with status tracking

---

## 📁 Excel + Google Sheets

Every enquiry submission is saved to MongoDB and also:

1. **Local Excel backup** — appended to `server/exports/enquiries.xlsx` (auto-created if missing)
2. **Google Sheet (optional)** — appended as a live row when `GOOGLE_SHEETS_WEBHOOK_URL` is set

Admins can still download a fresh Excel anytime from **Enquiries → Export to Excel**, or click **Open Google Sheet** when `GOOGLE_SHEETS_URL` is configured.

### Setup Google Sheets (5 minutes)

1. Create a new Google Spreadsheet (or open an existing one).
2. **Extensions → Apps Script** → delete the stub code → paste everything from `server/scripts/google-sheets-appscript.gs`.
3. Optional: set `WEBHOOK_SECRET` in the script to a random string (match it in `.env`).
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the **Web app URL** into `server/.env`:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=your-optional-secret
GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
```

6. Restart the API server. Submit a test enquiry — a new row should appear in the **Enquiries** tab of your sheet.

Status updates and deletes from the admin panel sync to the same sheet (matched by enquiry ID).

---

## ✉️ Resend emails

Set in `server/.env`:

```env
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=My Duke <no-reply@your-verified-domain.com>
ADMIN_NOTIFY_EMAIL=you@example.com
SITE_NAME=My Duke
```

| Event | Recipient |
|---|---|
| Email OTP | Customer |
| Welcome (new signup) | Customer (if email on file) |
| Login alert | Customer (if email on file) |
| Enquiry submitted | Customer + admin |
| Enquiry status changed | Customer |
| Donation “I’ve donated” | Donor + admin |

`RESEND_FROM_EMAIL` must use a [domain verified in Resend](https://resend.com/domains).


---

## 🛡️ Security

- `helmet` for secure HTTP headers
- `express-rate-limit` (general API + stricter limit on login)
- `express-mongo-sanitize` to prevent NoSQL injection
- `express-validator` for input validation on all write endpoints
- JWT auth + `bcryptjs` password hashing
- CORS restricted to configured client/admin origins
- Environment variables for all secrets (never committed — see `.env.example`)

---

## 🏗️ Production Build

```bash
# Client
cd client && npm run build     # outputs to client/dist

# Admin
cd admin && npm run build      # outputs to admin/dist

# Server
cd server && npm start         # run with a process manager like PM2 in production
```

Serve `client/dist` and `admin/dist` behind your web server / CDN (e.g. Nginx, Vercel, Netlify) and point `VITE_API_URL` to your deployed API domain. Ensure `uploads/` and `exports/` on the server are persisted (e.g. via a mounted volume) in production.

---

## 🧰 Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Framer Motion, React Icons, React Hot Toast, React Helmet Async, Recharts (admin)

**Backend:** Node.js, Express, MongoDB + Mongoose, Multer, JWT, bcryptjs, ExcelJS, Helmet, express-rate-limit, express-mongo-sanitize, express-validator

---

## 📄 License

This project is provided as-is for educational and commercial use.
