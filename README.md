<<<<<<< HEAD
# WorkSphere - Employee Management Platform

WorkSphere is a production-ready, commercial-grade Full Stack Human Resource Management System (HRMS) built using **React 19 (Vite, Tailwind, Recharts)** on the frontend and **Spring Boot 3 (Java 21, Spring Data JPA, Spring Security)** on the backend, integrated with **Supabase PostgreSQL**.

Designed with rich glassmorphism aesthetics, dynamic dark/light themes, and role-based access control, WorkSphere replicates the premium SaaS experience of corporate HR management platforms.

---

## 🚀 Key Features

* **Premium SaaS Dashboard**: Real-time KPI widgets representing headcount, active roster size, pending requests, and daily attendance percentages.
* **Interactive Data Visualization**: Dynamic graphs rendered using Recharts displaying hiring growth curves, department allocations, daily attendance logs, and leave type distributions.
* **Role-Based Authorization & Security**: Full security integration with stateless JWT sessions, refresh tokens, BCrypt password encryption, and endpoint route protection.
* **Supabase Row Level Security (RLS)**: Fine-grained PostgreSQL policies restricting access:
  * *Admin / HR*: Full CRUD access on all tables.
  * *Employee*: Read/Update own profile, own attendance, own leave applications, and read-only access to department/designation structures.
* **Employee Directory**: Advanced table filtering by department, status, type, query search, sort parameters, and pagination.
* **Reports Export & Import**: Standard endpoints to download the employee directory in formatted Microsoft Excel (`.xlsx`) or Adobe PDF (`.pdf`) formats, alongside a CSV upload feature for bulk employee creation.
* **Time & Attendance Tracking**: Employee clock-in/out dashboard. Automatic flag mapping for late arrivals (past 9:15 AM).
* **Leave Management Portal**: Tracks allowance balances for Annual, Casual, Sick, and Maternity leaves, supporting PENDING, APPROVED, and REJECTED states.
* **Admin Control Center**: Active status toggles, user role changes, and system-wide Audit logs tracing user logins and operations.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v3, Recharts, Lucide Icons, React Toastify, Axios, React Router v6.
* **Backend**: Java 21, Spring Boot 3.3.0, Spring Data JPA, Hibernate, Spring Security, JJWT (JWT), Apache POI (Excel), OpenPDF (PDF), Lombok, Springdoc OpenAPI (Swagger).
* **Database**: Supabase PostgreSQL (Cloud Database).

---

## 📁 Project Directory Structure

```text
WorkSphere/
├── database/                   # Database Scripts
│   ├── schema.sql              # Tables and relationships
│   ├── seed.sql                # Seed data & credentials
│   └── rls_policies.sql        # Supabase RLS policies
├── backend/                    # Spring Boot 3 API Project
│   ├── pom.xml                 # Maven configuration
│   └── src/main/java/com/worksphere/platform/
│       ├── WorkSphereApplication.java
│       ├── config/             # OpenAPI, Audit configurations
│       ├── controller/         # REST Controllers
│       ├── dto/                # Data Transfer Objects & Mapper
│       ├── entity/             # JPA Entities
│       ├── exception/          # Global Exception Handlers
│       ├── repository/         # Spring Data JPA Repositories
│       ├── security/           # JWT, filters, and UserDetails
│       └── service/            # Core business logic services
├── frontend/                   # React 19 + Vite App
│   ├── package.json            # Node dependencies
│   ├── tailwind.config.js      # CSS Theme styling configuration
│   └── src/
│       ├── App.jsx             # Main Router and Shell
│       ├── index.css           # Global typography and styles
│       ├── context/            # AuthContext & ThemeContext
│       ├── components/common/  # Sidebar, Navbar, Skeleton loaders
│       └── pages/              # Platform page modules
├── setup-tools.ps1             # Windows toolchain PATH helper
├── setup-guide.md              # Detailed local launch instructions
└── README.md                   # Project overview
```

---

## ⚙️ Getting Started

Check out [setup-guide.md](file:///d:/PROJECT%2001/setup-guide.md) for full, step-by-step instructions on setting up your local database instance and running both backend and frontend servers.

### Default Login Accounts:
* **Admin**: `admin@worksphere.com` / `password123`
* **HR Manager**: `hr@worksphere.com` / `password123`
* **Employee**: `employee@worksphere.com` / `password150` (or `password123`)

*All default passwords are set to `password123` in the seed script.*
=======
# WORKSPHERE-EMPLOYEE-MANAGEMENT-SYSTEM
>>>>>>> 71b09164f954ab065687ce05226b01a06d0571bc
