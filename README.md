# Vantage HRMS

*Every workday, perfectly aligned.*

Vantage is a complete Human Resource Management System designed around two dedicated experiences — one for **Employees** and one for **Admin/HR** — bringing authentication, attendance, leave management, payroll, and reporting together under a single portal.

---

## 🚀 What It Does

Vantage replaces manual, spreadsheet-driven HR processes with a digital workflow that handles:

- Role-based sign up and login
- Live attendance tracking with check-in/check-out
- Complete leave application and approval cycle
- Payroll visibility for both employees and administrators
- A centralized employee directory
- HR analytics and reporting
- In-app alerts for important updates

---

## 🏗️ System Architecture

The frontend is built as four independent, stacked layers, so a real backend can eventually be swapped in without rewriting the UI.

---

## 🌟 Core Modules

### For Employees
- **Dashboard** — today's attendance state, a running check-in timer, leave balances at a glance, and recent activity
- **Attendance** — clock in/out, with a full history browsable by month and year
- **Leave Requests** — submit a request with real-time balance checks, follow its status (Pending → Approved/Rejected/Cancelled), withdraw pending ones
- **Payroll** — a read-only breakdown of salary, downloadable pay slips, and past payment records
- **Profile** — manage personal info, update password, upload supporting documents

### For Admin / HR
- **Overview** — a snapshot of workforce size, who's present today, and requests awaiting approval
- **Employee Management** — search the directory, add or edit employee records, toggle active/inactive status
- **Attendance Overview** — company-wide attendance data with filtering and export
- **Leave Management** — approve or reject requests (rejections require a reason), with balances and attendance records updating automatically
- **Payroll Management** — review and adjust salary structures, process payroll runs
- **Reports & Analytics** — pull attendance and leave data into exportable reports
- **Settings** — configure company info, attendance rules, default leave allowances, and notification preferences
- **Profile** — personal details, password and 2FA management, session control

### Security
- Routes are gated by role (`ProtectedRoute`, `RoleRoute`)
- Authentication relies on session state — there's no way to switch roles from the client
- Employees are fully blocked from reaching any admin route

---

## 🛠️ Built With

- **Frontend:** React + Vite
- **State:** React Context and custom hooks
- **Styling:** Tailwind CSS
- **Storage today:** browser `localStorage`, plus `IndexedDB` for file attachments
- **Storage next:** a real REST/GraphQL backend, slotting into the existing Storage Adapter layer

---

## 📦 Running It Locally

### You'll need
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone it
git clone https://github.com/suhasr024/Odoo-Hackathon-.git
cd Odoo-Hackathon-

# Install packages
npm install

# Run in dev mode
npm run dev

# Build for production
npm run build
```

Once running, open `http://localhost:5173` (or whatever port your terminal shows).

---

## Deploying to Vercel

1. Import this GitHub repository into Vercel.
2. Keep the framework preset as **Vite**.
3. Use `npm run vercel-build` as the build command.
4. Use `dist` as the output directory.
5. Deploy without adding environment variables; the current demo app uses browser storage and does not yet connect to Supabase.

The included `vercel.json` handles client-side route refreshes for paths such as `/dashboard` and `/admin`.

---

## 👥 Try It With Demo Logins

| Role | Email | Password | Can Access |
|---|---|---|---|
| Employee | alex.morgan@vantage.io | DemoPassword123! | Dashboard, Attendance, Leave Requests, Payroll, Profile |
| Admin | sarah.admin@vantage.io | AdminPassword123! | Overview, Employee Management, Attendance, Leave Requests, Payroll, Reports, Settings, Profile |

The Login page also has one-click demo buttons for both accounts.

---

## 📁 How the Code Is Organized

---

## 🗺️ What's Next

- [ ] Swap in a real backend (REST/GraphQL) behind the storage adapter
- [ ] Send actual verification and notification emails
- [ ] Introduce Manager / Super Admin tiers
- [ ] Build out a fuller permissions system
- [ ] Add a responsive sliding nav drawer for mobile

---

## 📄 License

Submitted as a hackathon project — license not yet finalized.

---

## 🙌 Credits

Styled with the Vantage / Executive Zenith design system: Slate (`#1e293b`) and Electric Blue (`#0ea5e9`), set in Inter.