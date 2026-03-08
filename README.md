# Admin Dashboard

A production-ready, role-based administration dashboard built with **Node.js**, **Express**, and **EJS**. Covers user and access management, dynamic form templates, system branding settings, and built-in observability — all deployable in a single command with Docker Compose.

---

## Features

| Module | Description |
|---|---|
| **Authentication** | Session-based login and registration with bcrypt password hashing |
| **User Management** | Create, view, edit, and delete users; assign roles; server-side search, sort, and pagination |
| **Role & Permission System** | Define custom roles; attach granular permissions per resource and action |
| **Forms Manager** | Build dynamic form templates with typed fields; one active form enforced at a time; per-user ownership with admin override |
| **System Settings** | Configure branding (logo, system name, primary color, default theme) — stored in the database and applied globally on every request |
| **Profile** | Each user manages their own name, email, and password independently |
| **Access Control** | Permission-gated UI — sidebar links, header nav, and action buttons are hidden or shown based on the user's role |
| **Observability** | Prometheus metrics endpoint (`/metrics`) + Grafana pre-wired out of the box |
| **Logging** | Structured application logging via Winston |

---

## Tech Stack

- **Runtime** — Node.js 20 (Alpine)
- **Framework** — Express 5
- **Templating** — EJS
- **ORM** — Prisma with MySQL
- **Auth** — express-session + bcrypt
- **Monitoring** — prom-client → Prometheus → Grafana
- **Logging** — Winston
- **Container** — Docker + Docker Compose

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A running **MySQL** database (external host or managed service)

> The application does **not** bundle a MySQL container. Point `DATABASE_URL` at any MySQL 8+ instance you already have running.

---

## Quick Start

### 1. Configure the environment

Create a `.env` file at the project root. The only value you **must** set is `DATABASE_URL` — everything else has a default:

```env
# ── Application ─────────────────────────────────────────────────────
APP_PORT=3000
BASE_URL=http://localhost
ENV=production               # change to "dev" for nodemon + verbose logs

# ── Database (required) ─────────────────────────────────────────────
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"

# ── Monitoring ───────────────────────────────────────────────────────
PROMETHEUS_PORT=9090
GRAFANA_PORT=4000

# ── UI Defaults (overridden by System Settings once saved in the DB) ─
SYSTEM_NAME=Admin Console
LOGO_URL=                    # leave empty to use the built-in icon
UI_THEME=light               # light | dark | system
PRIMARY_COLOR=#2563eb
```

### 2. Start

```bash
docker compose up -d
```

On first boot the container automatically:

1. Installs Node dependencies
2. Pushes the Prisma schema to your database
3. Seeds all permissions, built-in roles, and a super admin account
4. Starts the Express server

### 3. Open the app

| Service | Default URL |
|---|---|
| Dashboard | `http://localhost:3000` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:4000` |

---

## Default Super Admin

| Field | Value |
|---|---|
| Email | `superadmin@system.local` |
| Password | `123456` |

> Change this password immediately after first login via **Profile → Change Password**.
> The super admin account is hidden from all user lists and bypasses all permission checks. It is reserved for system maintenance only.

---

## Permission System

Permissions follow a `resource:action` convention. The seeder creates the full matrix automatically:

```
user:list       user:view       user:create     user:update     user:delete
role:list       role:view       role:create     role:update     role:delete
form:list       form:view       form:create     form:update     form:delete
form:activate   form:manage_all
settings:list   settings:view   settings:create settings:update settings:delete
dashboard:view
```

**Built-in roles:**

| Role | Access |
|---|---|
| `super admin` | Full access — bypasses all permission checks |
| `admin` | All permissions except role and permission management |
| `user` | Dashboard view only |

Custom roles with any combination of permissions can be created from the **Roles** page.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | MySQL connection string |
| `APP_PORT` | | `3000` | Port the Node server listens on |
| `BASE_URL` | | `http://localhost` | Public base URL |
| `ENV` | | `production` | `dev` enables hot reload via nodemon |
| `PROMETHEUS_PORT` | | `9090` | Prometheus UI port |
| `GRAFANA_PORT` | | `4000` | Grafana UI port |
| `SYSTEM_NAME` | | `Admin Console` | Branding name shown in header and sidebar |
| `LOGO_URL` | | _(built-in icon)_ | URL of the brand logo image |
| `UI_THEME` | | `light` | Default theme — `light`, `dark`, or `system` |
| `PRIMARY_COLOR` | | `#2563eb` | Hex accent color used throughout the UI |

> UI variables are **fallbacks only**. Once settings are saved through the System Settings page, the database values take precedence on every request without a restart.

---

## Project Structure

```
admin_dashboard/
├── prisma/
│   └── schema.prisma          # Database models (Prisma + MySQL)
├── public/
│   └── css/                   # Theme variables and component styles
├── src/
│   ├── configs/               # App config and Prisma client
│   ├── controllers/           # Request handlers per resource
│   ├── middlewares/           # Auth, error handler, settings loader
│   ├── routes/                # Express routers
│   ├── seeders/               # Permissions, roles, super admin, settings
│   ├── services/              # Business logic layer
│   ├── errors/                # Custom error classes
│   ├── enums/                 # HTTP status codes
│   ├── validators/            # Input validation rules
│   └── utilities.js           # Shared helpers (can, isSuperAdmin, buildQuery…)
├── views/
│   ├── layouts/               # main.ejs (dashboard), auth.ejs (login/register)
│   ├── partials/              # Header, sidebar, pagination, icons
│   ├── auth/                  # Login, register
│   ├── users/                 # Index, create, show/edit
│   ├── roles/                 # Index, create, edit
│   ├── form/                  # Index, create, show, edit
│   ├── profile/               # User profile
│   ├── settings/              # System settings
│   ├── dashboard/             # Overview
│   └── error/                 # Error page
├── Dockerfile
├── docker-compose.yml         # App + Prometheus + Grafana
├── prometheus.yml             # Prometheus scrape config
└── .env                       # Environment configuration
```

---

## Useful Commands

```bash
# Start in background
docker compose up -d

# View application logs
docker compose logs -f app

# Re-run seeders only (without rebuilding)
docker exec -it node_app npm run seed

# Stop all containers
docker compose down

# Stop and wipe persistent volumes (Grafana data etc.)
docker compose down -v
```
