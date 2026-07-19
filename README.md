# Collaborative Project & Task Management Platform

A modern, multi-tenant Project and Task Management application. Users can organize work in distinct organizations/workspaces, create projects, assign tasks to team members with timeline ranges, discuss updates in real-time task comment feeds, and monitor overall workspace progress through interactive dashboards.

---

## 🚀 Key Features

* **Multi-Tenant Workspaces**: Dynamic organization alignment powered by Clerk authentication.
* **Interactive Dashboard**: Modern statistics cards tracking total projects, completed timelines, active tasks assigned to you, and overdue items with lift-hover glowing effects.
* **Project Details & Timelines**: Full editing support for project details, start/due dates, team leads, priorities, and description parameters.
* **Task Board & Workflow Actions**: Real-time task creation, status updates (TODO, IN_PROGRESS, DONE), priorities (LOW, MEDIUM, HIGH), and batch deletions directly linked to PostgreSQL.
* **Task Discussion & Chatbox**: Fully integrated task-specific comment feeds featuring message alignments for active user sessions.
* **Background Notification Jobs**: Event-driven background email deliveries notifying team members when they are assigned to tasks.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Framework**: React.js (Vite)
* **State Management**: Redux Toolkit (Slices & Async Thunks)
* **Styling**: Tailwind CSS v4, Lucide Icons
* **Authentication UI**: Clerk React SDK

### Backend (Server)
* **Framework**: Node.js, Express.js (ES Modules)
* **ORM**: Prisma ORM
* **Database**: PostgreSQL (Serverless Neon DB)
* **Task Scheduling**: Inngest (Event-driven asynchronous runner)
* **Mail Delivery**: Nodemailer (SMTP relay via Brevo)

---

## 📁 Repository Structure

```text
├── client/          # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI widgets (Navbar, Sidebar, StatsGrid, etc.)
│   │   ├── pages/       # Page views (Dashboard, ProjectDetails, TaskDetails)
│   │   ├── features/    # Redux Slices (workspaceSlice, themeSlice)
│   │   └── configs/     # Axios API instances & routing configs
│   └── package.json
│
└── server/          # Backend Node Express API Server
    ├── controllers/ # HTTP Route Controllers (task, project, workspace)
    ├── routes/      # Express API Router paths
    ├── prisma/      # PostgreSQL Prisma Schema & Migrations
    ├── inngest/     # Asynchronous background job triggers
    └── package.json
```

---

## 💻 Local Installation & Setup

### 1. Prerequisite: Clone the repository
```bash
git clone <repository-url>
cd project-management
```

### 2. Backend Configuration (`server`)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server/` directory and configure the environment variables:
   ```env
   DATABASE_URL="your-postgresql-neon-database-url"
   DIRECT_URL="your-postgresql-neon-direct-url"
   CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   CLERK_WEBHOOK_SECRET="your-clerk-webhook-secret"
   SENDER_EMAIL="your-email-address"
   SMTP_USER="smtp-username"
   SMTP_PASS="smtp-password"
   ```
4. Push the database schema and generate the Prisma Client:
   ```bash
   npx prisma db push
   ```
5. Start the backend local development server:
   ```bash
   npm run server
   ```
   *(Running at `http://localhost:8000`)*

---

### 3. Frontend Configuration (`client`)
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `client/` directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   VITE_BASEURL="http://localhost:8000"
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   *(Running at `http://localhost:5173`)*

---

### 4. Run Inngest Dev Server (Optional for Emails)
To test asynchronous emails locally:
```bash
npx inngest-cli dev
```
*(Running at `http://localhost:8288`)*

---

## ☁️ Deployment Guide

### Deploying to Vercel

Because the project is a monorepo containing distinct `client` and `server` folders, you should deploy them as **two separate projects** in Vercel.

#### 1. Backend Server Deployment
1. Import your repository into Vercel.
2. Set the **Root Directory** as `server`.
3. Set the **Framework Preset** as **Other**.
4. Add all environment variables from your server `.env` (like `DATABASE_URL` etc.) under Project Settings -> Environment Variables.
5. Deploy and copy the resulting production URL (e.g. `https://project-mgmt-server.vercel.app`).

#### 2. Frontend Client Deployment
1. Import the same repository into Vercel again as a new project.
2. Set the **Root Directory** as `client`.
3. Set the **Framework Preset** as **Vite**.
4. In the Environment Variables settings, add:
   * `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk publishable key
   * `VITE_BASEURL` = your deployed backend server URL (pasted from step 1)
5. Deploy.
