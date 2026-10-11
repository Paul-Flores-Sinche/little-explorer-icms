Little Explorer ICMS

Integrated Childcare Management System — a full-stack prototype built for PRT631 Information Systems Practice (Darwin Group 13, Charles Darwin University).

Little Explorer ICMS simulates a real childcare centre's management platform, with two separate portals: one for families and one for centre staff. It's a frontend-only demo (Next.js, no backend/database) designed to show a realistic, interactive user experience end to end.

🔗 Live demo: little-explorer-icms.vercel.app 📋 Jira backlog: project KAN 📖 Documentation (Confluence): Little Explorer ICMS space

About the project

This prototype is part of the business case / information systems practice coursework for a fictional childcare centre, "Little Explorer." It demonstrates how a real Integrated Childcare Management System (ICMS) could work for both parents and staff, covering enrolments, attendance, billing/CCS subsidies, staff rostering, and regulatory compliance (aligned with Australia's NQF/ACECQA framework).

All data is mocked and generated to be internally consistent (same children, families, and staff across every screen), and all interactive actions (payments, approvals, report generation, notifications) are simulated in the browser — there is no real backend, database, or external integration.

Portals
Family Portal (/family)
Home dashboard with quick links and notifications
Enquiry / enrolment form with contact details and date pickers
My Child: attendance calendar (with check-in/check-out history) and Learning Portfolio (daily observations, EYLF tags, likes)
Billing: invoice list, realistic invoice preview/PDF, and a simulated payment flow (card, PayPal, Apple Pay)
Notifications centre (payment confirmations, portfolio updates, centre notices)
Profile & Settings: personal details, linked children, notification preferences, Face ID toggle, change password, feedback, help centre
Forgot password flow (simulated)
Staff Portal (/staff)
Centre dashboard: room filter, clickable room occupancy, enrolled children list, "Send Notice" broadcast tool
Enrolments & Bookings: full enrolled children list with search/filter
Attendance: day navigation (with prev/next arrows), live sign-in/out register, weekly attendance pattern per child
CCS & Payments: Week / Day / Month views, invoice reminders, CSV export, invoice preview
Staff Management: weekly roster (3+ educators per room), leave request approvals (live status updates), payroll summary and detail
Compliance & Reporting: NQF quality area tracking, staff certification/compliance alerts, operational report generator
Staff profile page (Admin Officer): account details, certifications (reusing the compliance module), preferences, log out
Forgot password flow (simulated)
Tech stack
Next.js (App Router) + TypeScript
Tailwind CSS
Client-side state via React context + localStorage for persistence (profile, preferences, enquiries, payments)
Deployed on Vercel
Getting started
bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

Open http://localhost:3000 to view the app locally. The landing page links to both portals; use the demo login screens to access /family or /staff.

Project structure (high level)
src/
  app/
    family/(portal)/   # Family portal pages
    staff/(portal)/    # Staff portal pages
  components/          # Shared UI components + per-portal components
  data/                # Mock data generators (children, staff, invoices, compliance, roster)
  lib/                 # Shared utilities (dates, validation, PDF/CSV generation)
Notes
This is an academic demo, not production software: there is no authentication, backend, or real payment processing.
"Reset demo" (in Profile & Settings) clears locally stored state back to defaults.
Team

PRT631 Darwin Group 13 — Little Explorer ICMS
PRT631 Group Members: Simran, Hena Akter, Lamia Sawar, Paul Flores Sinche
