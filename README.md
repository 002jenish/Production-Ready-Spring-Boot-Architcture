# ArchForge 🔨

> **Spring Boot Project Architecture Generator** — A lightweight Spring Initializr + JHipster hybrid focused on industry-standard backend scaffolding.

---

## 🚀 What It Does

ArchForge generates production-ready Spring Boot starter projects via a beautiful 3-step visual wizard. Select your architecture pattern and dependencies, then download a compilable ZIP in under 2 seconds.

### Features

- **4 Architecture Patterns**: Layered, Hexagonal (Ports & Adapters), Clean Architecture, Modular Monolith
- **18+ Dependencies**: JWT Security, Spring Data JPA, PostgreSQL, MySQL, MongoDB, Flyway, Actuator, OpenAPI, Docker, GitHub Actions CI
- **Real-time Preview**: Live file tree updates as you configure
- **Dark/Light Theme**: Glassmorphism design with animated accents

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend & API | Next.js 15 (App Router) + TypeScript |
| Styling | TailwindCSS v4 + shadcn/ui |
| Form Validation | React Hook Form + Zod |
| ZIP Generation | JSZip (server-side in API routes) |
| Deployment | Single Next.js deployment (Vercel / Railway / Docker) |

---

## 📦 Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Run

```bash
# 1. Clone the repo
cd "frontend"

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker (Generator App)

Run the ArchForge generator itself with Docker:

```bash
# From the root directory
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
archforge/
├── frontend/                    ← Next.js 15 App (UI + API)
│   ├── app/
│   │   ├── page.tsx             ← Landing page
│   │   ├── generate/page.tsx    ← 3-step wizard
│   │   └── api/generate/        ← ZIP generation API route
│   ├── components/
│   │   ├── wizard/              ← Step components
│   │   └── preview/             ← FolderPreview
│   └── lib/
│       ├── templates/           ← All code generation logic
│       │   ├── zip-generator.ts ← Main orchestrator
│       │   ├── pom-generator.ts ← pom.xml
│       │   ├── yml-generator.ts ← application.yml
│       │   ├── security-generator.ts ← JWT classes
│       │   ├── source-generator.ts   ← Java source files
│       │   └── devops-generator.ts   ← Docker / CI
│       ├── schema.ts            ← Zod validation schemas
│       ├── types.ts             ← TypeScript types
│       └── constants.ts         ← Dependency & arch definitions
└── README.md                    ← This file
```

---

## 🔌 API

### POST `/api/generate`

**Request Body:**
```json
{
  "projectName": "inventory-service",
  "groupId": "com.java",
  "artifactId": "inventory-service",
  "javaVersion": "21",
  "springBootVersion": "3.5.3",
  "architecture": "layered",
  "dependencies": ["web", "jpa", "security", "jwt", "postgresql", "swagger", "docker", "flyway"]
}
```

**Response:** `application/zip` binary stream

---

## 📋 Generated Project

The downloaded ZIP is immediately compilable:

```bash
cd my-project
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Generated files include:
- ✅ `pom.xml` with all selected dependencies
- ✅ Multi-profile `application.yml` (main / dev / prod)
- ✅ JWT Security classes (if selected)
- ✅ Multi-stage `Dockerfile` (if selected)
- ✅ `docker-compose.yml` with DB service (if selected)
- ✅ GitHub Actions CI workflow (if selected)
- ✅ Flyway migration `V1__init.sql` (if selected)
- ✅ Global exception handler
- ✅ README + `.gitignore` + Maven wrapper

---

## 📄 License

MIT License — Use freely, contribute back!
