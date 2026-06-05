# WorkSphere Platform Setup Guide

This guide will walk you through setting up **WorkSphere - Employee Management Platform** on your local machine.

---

## 1. Prerequisites

Ensure you have the following installed:
* **Java Development Kit (JDK 21)** (Microsoft OpenJDK or Eclipse Temurin)
* **Apache Maven 3.9+** (For building the Spring Boot backend)
* **Node.js LTS (v20+ or v24+)** and **npm** (For running the React frontend)

> [!TIP]
> **Windows Toolchain Helper**:
> If you are on Windows and do not have these tools configured on your system `PATH`, you can use the provided script `setup-tools.ps1` in a PowerShell terminal to automatically configure the environment variables for your current terminal session:
> ```powershell
> .\setup-tools.ps1
> ```

---

## 2. Supabase PostgreSQL Configuration

WorkSphere integrates directly with **Supabase PostgreSQL**. Follow these steps to initialize your database schema, seed data, and Row Level Security:

1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Open your project and navigate to the **SQL Editor** tab.
3. Open the file [schema.sql](file:///d:/PROJECT%2001/database/schema.sql) and paste its contents into the SQL Editor. Click **Run** to create the tables.
4. Next, open the file [rls_policies.sql](file:///d:/PROJECT%2001/database/rls_policies.sql), paste its contents, and click **Run** to set up the Row Level Security policies.
5. Finally, paste the contents of [seed.sql](file:///d:/PROJECT%2001/database/seed.sql) and click **Run** to populate default departments, employees, and user login credentials.

---

## 3. Backend Setup (Spring Boot)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy the `.env.example` template from the workspace root, rename it to `.env` (or set environment variables on your system), and replace the connection parameters with your Supabase credentials:
   ```bash
   DB_URL=jdbc:postgresql://db.psotqdkpduaerahxbfbh.supabase.co:5432/postgres
   DB_USERNAME=postgres
   DB_PASSWORD=your-supabase-db-password
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   ```
3. Compile the Java classes and download dependencies:
   ```bash
   mvn clean compile
   ```
4. Run the Spring Boot backend:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on `http://localhost:8080`.
   * **Swagger OpenAPI Documentation**: `http://localhost:8080/swagger-ui/index.html`

---

## 4. Frontend Setup (React + Vite)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The web portal will boot on `http://localhost:5173`. Open this URL in your web browser.

---

## 5. Seed Login Credentials

Use these seeded employee accounts to explore the platform:

| Role | Username (Email) | Password |
|---|---|---|
| **Admin** | `admin@worksphere.com` | `password123` |
| **HR Manager** | `hr@worksphere.com` | `password123` |
| **Employee** | `employee@worksphere.com` | `password123` |
