# 🅿️ SmartPark MS — Enterprise Parking Management System

A commercial-grade, multi-floor parking automation and analytics platform engineered for high-traffic facilities such as shopping malls, airports, hospitals, and corporate campuses.

Built as a **unified single-project** Node.js/JavaScript application — one `package.json`, one `node_modules`, one command to run everything.

---

## 🌟 Key Features

- **Smart Slot Allocation** — Automatically assigns the nearest available slot (Ground → First → Second floor) matching vehicle type (car/bike).
- **Zero-Config Database** — Runs an in-memory MongoDB server automatically. Optionally connect to a persistent MongoDB URI via `.env`.
- **5,000+ Demo Records** — Auto-seeded on first boot with 6 months of realistic Indian vehicle traffic data, weekend peaks, entry rush hours, and 100 currently parked vehicles.
- **Nightly Auto-Backups** — `node-cron` takes a full JSON snapshot of all collections at midnight. Admins can trigger, download, or restore backups from the UI.
- **Role-Based Access Control** — Three tiers (Admin / Supervisor / Staff) enforced via JWT middleware on every API route.
- **Live Parking Map** — Real-time color-coded floor grids (Ground: A001–A070, First: B001–B070, Second: C001–C060). Click any occupied slot to open a checkout calculator.
- **Printable Receipts** — Clean invoice tickets with duration, hourly rate, and total charge. Browser-native print + Save-to-PDF supported.
- **Revenue Analytics** — Interactive charts (Recharts) for daily/monthly earnings, car vs bike ratio, peak traffic hours, top-used slots, and average duration.
- **Dark Mode** — Full dark/light theme toggle, persisted across sessions.

---

## 🔑 Demo Credentials

| Role | Username | Password | Access |
|:---|:---|:---|:---|
| **Admin** | `admin` | `admin123` | Full control — settings, backups, users, logs, analytics, entry/exit |
| **Supervisor** | `supervisor` | `supervisor123` | Dashboard, analytics, reports, live map |
| **Staff** | `staff` | `staff123` | Vehicle entry, checkout, print tickets |

> **Quick Reset**: Any logged-in user can click the orange **"Reset Demo Database"** button in the header to wipe and re-seed 5,000+ records instantly.

---

## 📁 Project Structure

```
SmartParkMS/
├── client/                   # React 19 + Vite + Tailwind CSS
│   ├── components/           # DashboardCard, LoadingSkeleton, Receipt Modal, Layout
│   ├── context/              # JWT AuthContext session manager
│   ├── pages/                # Dashboard, Map, Entry, Exit, Analytics, Reports, Settings, Backups, Logs
│   ├── utils/                # API fetch helpers
│   ├── App.jsx               # Route definitions and role guards
│   ├── main.jsx              # React DOM entry point
│   └── index.css             # Tailwind + glassmorphism design tokens
│
├── server/                   # Express API
│   ├── controllers/          # Business logic (auth, parking, analytics)
│   ├── middleware/           # JWT verification and role enforcement
│   ├── models/               # Mongoose schemas (User, Vehicle, Slot, Setting, ActivityLog, BackupLog)
│   ├── routes/               # REST endpoint definitions
│   ├── services/             # Backup engine and demo data seeder
│   ├── utils/                # Slot allocation algorithm and DB connector
│   └── index.js              # Express server entry point
│
├── public/                   # Static assets
├── index.html                # App shell (root entry)
├── package.json              # Single unified dependencies + scripts
├── vite.config.js            # Vite config with /api proxy to Express
├── tailwind.config.js        # Tailwind theme (brand colors, fonts, shadows)
├── postcss.config.js         # PostCSS pipeline
├── .env                      # Environment variables (port, JWT secret, MongoDB URI)
├── .env.example              # Template for contributors
├── .gitignore                # Excludes node_modules, dist, .env, backups
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18.0 or higher
- **npm** v9.0 or higher

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/SmartParkMS.git
cd SmartParkMS
```

### 2. Install all dependencies (one command)
```bash
npm install
```

### 3. Configure environment (optional)
The app works out of the box with sensible defaults. To customize, create a `.env` file at the project root:
```env
PORT=5001
JWT_SECRET=your_secret_key_here
NODE_ENV=development

# Uncomment to connect to a persistent MongoDB instance instead of in-memory:
# MONGODB_URI=mongodb://localhost:27017/smartpark
```

### 4. Run the app
```bash
npm run dev
```

This starts **both servers concurrently**:
| Service | URL |
|---|---|
| React Frontend | http://localhost:5173 |
| Express API | http://localhost:5001 |

Open **http://localhost:5173** in your browser. The database will auto-seed on first run.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend + backend together in dev mode |
| `npm run dev:client` | Start only the Vite frontend |
| `npm run dev:server` | Start only the Express backend |
| `npm run build` | Build frontend for production |
| `npm run start` | Run compiled production server |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS |
| **UI Library** | Lucide React, Framer Motion, Recharts |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB via Mongoose (in-memory or external) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Scheduling** | node-cron (nightly backups) |
| **Dev Tools** | concurrently, PostCSS, Autoprefixer |

---

## ☁️ Deployment

### Full-Stack on Render / Railway
1. Connect your GitHub repo to your host.
2. Build command:
   ```bash
   npm run build
   ```
3. Start command:
   ```bash
   npm run start
   ```
4. Add environment variables: `JWT_SECRET`, `MONGODB_URI` (use MongoDB Atlas for persistence).

### Separate Frontend + Backend

**Frontend → Vercel**
- Build Command: `npm run build`
- Output Directory: `dist/client`
- Set `VITE_API_URL` env var to your backend URL

**Backend → Render/Railway**
- Start: `npm run start`
- Add `JWT_SECRET` and `MONGODB_URI` env vars

---

## ⚙️ API Overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Login and get JWT token |
| `/api/auth/me` | GET | Any | Get current user profile |
| `/api/parking/live-slots` | GET | Any | Real-time slot grid data |
| `/api/parking/check-in` | POST | Any | Vehicle entry |
| `/api/parking/check-out` | POST | Any | Vehicle exit + payment |
| `/api/analytics/stats` | GET | Admin/Supervisor | Dashboard KPIs |
| `/api/analytics/charts` | GET | Admin/Supervisor | Chart data |
| `/api/reports` | GET | Admin/Supervisor | Period reports |
| `/api/settings` | GET/POST | Admin | Rate configuration |
| `/api/backups` | GET/POST | Admin | Backup management |
| `/api/logs` | GET | Admin | Activity audit logs |

---

## 📄 License

MIT License — free for personal and commercial use.
