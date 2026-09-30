Little Explorer ICMS – Interactive Prototype

Live demo: https://little-explorer-icms.vercel.app

Interactive prototype of the Integrated Childcare Management System (ICMS) for Little Explorer Early Learning Centre. Built for PRT631 Information Systems Practice, Charles Darwin University – Darwin Group 13 (Prototype, Weeks 7–8).

Important: this is a clickable design prototype, not a working system. There is no backend, no database and no real login or payments. All names, figures and records are made-up sample data. It shows how the ICMS would look and how each user would move through it.

1. What the prototype shows

The ICMS has two user areas. The landing page (/) lets you choose either one.

Area	Who uses it	Devices	Sample user
Family Portal (/family)	Parents and guardians	Mobile and desktop (responsive)	Sarah Thompson, mother of Ava Thompson
Staff Portal (/staff)	Admin, educators, finance, centre director	Desktop and tablet only	Maria Reyes, Admin Officer

This follows our requirements: the parent portal works on mobile and web (NF009, TR002), and staff use the system in a web browser only (TR001).

Family Portal screens
Login – with a "Forgot password" option
Home – summary of the child's day, balance and quick actions
Enquiry & Waitlist – submit a new enquiry and track its status
My Child – attendance calendar and learning portfolio
Billing – invoices (with preview), payment history and a demo payment flow (card, PayPal, Apple Pay)
Notifications – centre notices and payment alerts, which link to Billing or My Child
Profile – personal details, children, notification preferences, change password, feedback, help and Log Out
Staff Portal screens
Login
Dashboard – enrolments, attendance, room occupancy and quick actions
Enrolments & Bookings – enquiries, waitlist, enrolled children, room filter and room detail
Attendance – daily check-in/check-out and dated attendance history
CCS & Payments – CCS billing periods, invoices and payments
Staff Management – rosters, leave requests and payroll
Compliance & Reporting – NQF compliance records, staff profiles and downloadable reports (PDF/CSV)

The two portals are connected. When a parent submits an enquiry in the Family Portal, the staff member receives it in the Staff Portal and can reply, and the parent then sees the reply.

2. How to try it (step by step)
Open https://little-explorer-icms.vercel.app.
Choose Family Portal. The login details are already filled in, so just click Sign In.
Try this path: Home → Enquiry → submit a New Enquiry → My Child → Billing → Pay now → Notifications → Profile → Log Out.
Go back to the landing page and choose Staff Portal, then click Sign In.
Try this path: Dashboard → Enrolments & Bookings (open the enquiry you just sent and reply) → Attendance → CCS & Payments → Staff Management → Compliance & Reporting (download a report).
Open the Family Portal again. The staff reply appears on your enquiry.

Tip: the Family Portal can be viewed on a phone, or with a narrow browser window, to see the mobile layout with the bottom navigation bar.

Changes you make (such as enquiries or payments) are saved only in your own browser, so the demo stays consistent while you click through. Nothing is sent anywhere.

3. How it was built (process)
Step	What was done
1. Requirements (Week 4)	Functional, non-functional and technical requirements and user stories defined in the group report
2. System design (Week 5)	Use case, activity and sequence diagrams
3. UX/UI design (Week 6)	Sitemaps, user-flow diagrams and 21 high-fidelity wireframes (7 mobile, 7 family web, 7 staff web). Saved in the design/ folder of this repository
4. Build – Phase 1	Project set-up, colour theme, reusable components and sample data, plus the landing page
5. Build – Phase 2	Family Portal: 7 responsive screens
6. Build – Phase 3	Staff Portal: 7 screens with sidebar navigation
7. Build – Phase 4	Polish: back links, page titles, 404 page and icon
8. Improvements	Demo payment flow, Family–Staff enquiry connection, date pickers, invoice preview, attendance calendar, PDF/CSV export, room detail, roster/leave/payroll and compliance reports
9. Deployment	Published on Vercel. Every push to main redeploys the site automatically

The full step-by-step history is in the Commits tab of this repository.

Design: sage/teal 
#2F6F5E with a coral accent 
#E8875A. Headings use Baloo 2 and body text uses Manrope, for a warm, family-friendly look.

4. Technology
Part	Tool
Framework	Next.js (App Router) + React
Language	TypeScript
Styling	Tailwind CSS
UI components	Custom reusable components (buttons, cards, tabs, dialogs, date picker, toasts) with Radix UI and Lucide icons
Data	Sample data in src/data/ (no database)
Hosting	Vercel
Development	Built with the help of Claude Code (AI coding assistant), following the approved wireframes
5. Repository structure
design/           Approved wireframes and user-flow diagrams (the visual reference)
src/app/          Pages: landing (/), Family Portal (/family), Staff Portal (/staff)
src/components/   Reusable UI parts (family, staff, shared, ui)
src/data/         Sample data: children, rooms, invoices, compliance records
src/lib/          Helpers: dates, validation, PDF/CSV export
6. Run it locally (optional)

Requires Node.js 20 or newer.

bash
git clone https://github.com/Paul-Flores-Sinche/little-explorer-icms.git
cd little-explorer-icms
npm install
npm run dev

Then open http://localhost:3000.

7. Limitations
Prototype only: no real accounts, database, CCS connection or payment gateway.
The sample data is fictional.
Some features from the report (for example educators recording observations, ED002) are shown only from the family side.

PRT631 – Darwin Group 13: Simran, Hena Akter, Lamia Sawar, Paul Flores Sinche
