# Vantage — Employee Management System

*Every workday, perfectly aligned.*

Vantage is a full-featured Human Resource Management System (HRMS) built for two distinct user roles — **Employees** and **Admin/HR** — covering authentication, attendance tracking, leave management, payroll visibility, and reporting in a single, unified portal.

---

## 🚀 Overview

Vantage digitizes core HR operations so companies can move away from spreadsheets and manual approvals:

- Secure sign up / sign in with role-based access
- Real-time attendance tracking (check-in / check-out)
- End-to-end leave request and approval workflows
- Employee and Admin payroll visibility
- Centralized employee directory and management
- Reporting & analytics for HR decision-making
- In-app notifications for key events

---

## 🏗️ Architecture

Vantage follows a 4-tier decoupled frontend architecture, designed so a real backend (REST/GraphQL) can be dropped in later with minimal rework.

---

## 🌟 Features

### Employee Portal
- **Dashboard** — daily attendance status, live check-in timer, leave balance overview, recent activity
- **Attendance** — check-in/check-out, monthly attendance history with month/year navigation
- **Leave Requests** — apply for leave with live balance calculation, track status (Pending/Approved/Rejected/Cancelled), cancel pending requests
- **Payroll** — read-only salary breakdown, salary slip downloads, payment history
- **Profile** — personal details, password management, document uploads

### Admin Portal
- **Overview** — company-wide metrics: total workforce, present today, pending approvals
- **Employee Management** — searchable directory, add/edit employees, activate/deactivate accounts
- **Attendance Overview** — enterprise-wide attendance tracking, filters, export
- **Leave Management** — approve/reject requests with mandatory rejection reason, automatic balance & attendance sync
- **Payroll Management** — view and edit employee salary structures, run payroll
- **Reports & Analytics** — attendance and leave reports, exportable data
- **Settings** — organization settings, attendance rules, leave policy defaults, notification preferences
- **Profile** — personal details, password, 2FA, active session management

### Security
- Role-based route protection (`ProtectedRoute`, `RoleRoute`)
- Session-based authentication — no client-side role switching
- Admin routes strictly inaccessible to Employee accounts

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **State Management:** React Context + Custom Hooks
- **Styling:** Tailwind CSS
- **Storage (current):** Browser `localStorage` + `IndexedDB` (for file attachments)
- **Storage (planned):** REST/GraphQL API backend — see Storage Adapter layer

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/suhasr024/Odoo-Hackathon-.git
cd Odoo-Hackathon-

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 👥 Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| Employee | alex.morgan@vantage.io | DemoPassword123! | Dashboard, Attendance, Leave Requests, Payroll, Profile |
| Admin | sarah.admin@vantage.io | AdminPassword123! | Overview, Employee Management, Attendance, Leave Requests, Payroll, Reports, Settings, Profile |

Quick-login demo buttons are also available directly on the Login page.

---

## 📁 Project Structure

---

## 🗺️ Roadmap

- [ ] Backend API integration (replace localStorage adapter with real REST/GraphQL endpoints)
- [ ] Real email verification and notification delivery
- [ ] Manager / Super Admin role tiers
- [ ] Advanced permissions system
- [ ] Mobile-responsive sliding navigation drawer
## 📄 License

This project was built as part of a hackathon submission. License to be determined.

---

## 🙌 Acknowledgements

Built with the Vantage / Executive Zenith design system — Slate (`#1e293b`) and Electric Blue (`#0ea5e9`) on Inter typography.

