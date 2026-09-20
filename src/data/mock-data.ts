// Mock data for the Little Explorer ICMS demo.
// Everything here is static/illustrative — no backend, no persistence.

// ---------------------------------------------------------------------------
// Family Portal — Sarah Thompson
// ---------------------------------------------------------------------------

export const currentFamilyUser = {
  name: "Sarah Thompson",
  email: "sarah.thompson@email.com",
  initials: "ST",
};

export interface FamilyChild {
  id: string;
  name: string;
  room: string;
  status: "enrolled" | "waitlisted";
  checkedInAt?: string;
  checkedOutAt?: string;
  enrolledSince?: string;
  waitlistPosition?: number;
  waitlistTotal?: number;
  submittedOn?: string;
  preferredStart?: string;
}

export const familyChildren: FamilyChild[] = [
  {
    id: "ava",
    name: "Ava Thompson",
    room: "Kindergarten",
    status: "enrolled",
    checkedInAt: "8:02am",
    enrolledSince: "3 Feb 2025",
  },
  {
    id: "leo",
    name: "Leo Thompson",
    room: "Toddlers",
    status: "waitlisted",
    waitlistPosition: 3,
    waitlistTotal: 11,
    submittedOn: "12 Jul 2026",
    preferredStart: "Term 4, 2026",
  },
];

export const attendanceWeek = [
  { day: "Mon", status: "present" as const },
  { day: "Tue", status: "present" as const },
  { day: "Wed", status: "none" as const },
  { day: "Thu", status: "present" as const, today: true },
  { day: "Fri", status: "none" as const },
];

export const todayAttendance = {
  checkedIn: "8:02am",
  checkedOut: null as string | null,
};

export interface LearningObservation {
  title: string;
  date: string;
  note: string;
  author: string;
  tag: string;
}

export const learningPortfolio: LearningObservation[] = [
  {
    title: "Sensory play",
    date: "Today",
    note: "Ava explored the water table and shared tools with two friends, showing good turn-taking.",
    author: "Ms. Lee",
    tag: "Social & emotional development",
  },
  {
    title: "Counting game",
    date: "Tue",
    note: "Confidently counted to 10 during group time and helped a peer with number recognition.",
    author: "Ms. Lee",
    tag: "Numeracy",
  },
  {
    title: "Outdoor exploration",
    date: "Mon",
    note: "Enjoyed climbing and balance activities in the garden, building gross motor confidence.",
    author: "Mr. Diaz",
    tag: "Physical development",
  },
];

export interface Invoice {
  period: string;
  grossFee: number;
  ccsSubsidy: number;
  balance: number;
  status: "Due" | "Paid" | "Overdue";
}

export const familyBilling = {
  currentBalance: 184.5,
  dueDate: "15 Sep 2026",
  invoices: [
    { period: "1–7 Sep 2026", grossFee: 392.0, ccsSubsidy: 207.5, balance: 184.5, status: "Due" },
    { period: "25–31 Aug 2026", grossFee: 392.0, ccsSubsidy: 216.0, balance: 176.0, status: "Paid" },
    { period: "18–24 Aug 2026", grossFee: 392.0, ccsSubsidy: 216.0, balance: 176.0, status: "Paid" },
    { period: "11–17 Aug 2026", grossFee: 392.0, ccsSubsidy: 216.0, balance: 176.0, status: "Paid" },
  ] satisfies Invoice[],
};

export interface FamilyNotification {
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  icon: "invoice" | "portfolio" | "notice" | "alert";
  link?: string;
}

export const familyNotifications: { group: string; items: FamilyNotification[] }[] = [
  {
    group: "Today",
    items: [
      {
        icon: "invoice",
        title: "Invoice due reminder",
        body: "Your balance of $184.50 is due on 15 Sep. Pay securely from the Billing tab.",
        time: "1:15pm",
        unread: true,
        link: "/family/billing",
      },
      {
        icon: "portfolio",
        title: "Ava's portfolio was updated",
        body: 'Ms. Lee added a new observation: "Sensory play".',
        time: "10:42am",
        link: "/family/my-child",
      },
    ],
  },
  {
    group: "Yesterday",
    items: [
      {
        icon: "notice",
        title: "Kindergarten excursion notice",
        body: "A permission form for the Botanic Gardens excursion is now available.",
        time: "3:20pm",
      },
      {
        icon: "alert",
        title: "Centre closed — public holiday",
        body: "Little Explorer will be closed on Mon 5 Oct. Normal fees apply.",
        time: "9:00am",
      },
    ],
  },
];

export const familyProfile = {
  name: "Sarah Thompson",
  email: "sarah.thompson@email.com",
  linkedChildren: ["Ava", "Leo"],
  faceIdLogin: true,
};

// ---------------------------------------------------------------------------
// Staff Portal — ICMS
// ---------------------------------------------------------------------------

export const currentStaffUser = {
  name: "Maria Reyes",
  role: "Admin Officer",
  initials: "MR",
};

export const dashboardStats = {
  enrolledChildren: 112,
  attendanceToday: { present: 98, total: 112 },
  outstandingBalances: 4320,
  staffOnRoster: { present: 18, total: 20 },
};

export interface RoomOccupancy {
  room: string;
  occupied: number;
  capacity: number;
}

export const roomOccupancy: RoomOccupancy[] = [
  { room: "Nursery", occupied: 18, capacity: 20 },
  { room: "Toddlers", occupied: 24, capacity: 24 },
  { room: "Kindergarten", occupied: 30, capacity: 32 },
  { room: "Preschool", occupied: 26, capacity: 26 },
];

export const signOffStatus = { signedOff: 87, pending: 13 };

export interface WaitlistEntry {
  child: string;
  family: string;
  room: string;
  status: "Waitlisted #1" | "Waitlisted #2" | "Waitlisted #3" | "New enquiry" | "Enrolled";
  date: string;
}

export const waitlistEnquiries: WaitlistEntry[] = [
  { child: "Leo Thompson", family: "Thompson", room: "Toddlers", status: "Waitlisted #3", date: "12 Jul 2026" },
  { child: "Maya Chen", family: "Chen", room: "Nursery", status: "Waitlisted #1", date: "20 Jul 2026" },
  { child: "Noah Ali", family: "Ali", room: "Kindergarten", status: "New enquiry", date: "25 Jul 2026" },
  { child: "Zara Nguyen", family: "Nguyen", room: "Preschool", status: "Waitlisted #2", date: "28 Jul 2026" },
  { child: "Ava Thompson", family: "Thompson", room: "Kindergarten", status: "Enrolled", date: "3 Feb 2025" },
  { child: "Isla Brown", family: "Brown", room: "Preschool", status: "Enrolled", date: "14 Jan 2024" },
];

export const attendanceRooms = ["Nursery", "Toddlers", "Kindergarten", "Preschool"] as const;

export interface RoomAttendanceChild {
  name: string;
  checkIn: string;
  checkOut: string;
  recordedBy: string;
  status: "Present" | "Not checked in" | "Absent – notified";
  note?: string;
}

export interface RoomAttendance {
  present: number;
  notCheckedIn: number;
  absent: number;
  occupied: number;
  capacity: number;
  children: RoomAttendanceChild[];
}

export const attendanceByRoom: Record<(typeof attendanceRooms)[number], RoomAttendance> = {
  Nursery: { present: 16, notCheckedIn: 1, absent: 1, occupied: 18, capacity: 20, children: [] },
  Toddlers: { present: 22, notCheckedIn: 1, absent: 1, occupied: 24, capacity: 24, children: [] },
  Kindergarten: {
    present: 28,
    notCheckedIn: 2,
    absent: 2,
    occupied: 30,
    capacity: 32,
    children: [
      { name: "Ava Thompson", checkIn: "8:02am", checkOut: "–", recordedBy: "Front Desk", status: "Present" },
      { name: "Leo Nguyen", checkIn: "7:48am", checkOut: "–", recordedBy: "Ms. Lee", status: "Present" },
      { name: "Mia Patel", checkIn: "8:10am", checkOut: "3:40pm", recordedBy: "Ms. Lee", status: "Present", note: "Picked up" },
      { name: "Oliver Grant", checkIn: "–", checkOut: "–", recordedBy: "–", status: "Not checked in" },
      { name: "Sophie Kim", checkIn: "–", checkOut: "–", recordedBy: "–", status: "Absent – notified", note: "Sick leave" },
      { name: "Ethan Wallace", checkIn: "8:05am", checkOut: "–", recordedBy: "Front Desk", status: "Present" },
    ],
  },
  Preschool: { present: 24, notCheckedIn: 1, absent: 1, occupied: 26, capacity: 26, children: [] },
};

export interface FamilyInvoiceRow {
  family: string;
  grossFee: number;
  ccsSubsidy: number;
  balance: number;
  status: "Due" | "Paid" | "Overdue – 6 days";
}

export const ccsPayments = {
  billingPeriod: "1–7 Sep 2026",
  totalInvoiced: 18960,
  ccsSubsidyApplied: 12340,
  outstandingBalance: 4320,
  submissionStatus: "Submitted – accepted",
  familyInvoices: [
    { family: "Thompson", grossFee: 392.0, ccsSubsidy: 207.5, balance: 184.5, status: "Due" },
    { family: "Nguyen", grossFee: 420.0, ccsSubsidy: 252.0, balance: 168.0, status: "Paid" },
    { family: "Patel", grossFee: 360.0, ccsSubsidy: 198.0, balance: 162.0, status: "Overdue – 6 days" },
    { family: "Brown", grossFee: 400.0, ccsSubsidy: 260.0, balance: 140.0, status: "Paid" },
    { family: "Grant", grossFee: 378.0, ccsSubsidy: 220.0, balance: 158.0, status: "Due" },
  ] satisfies FamilyInvoiceRow[],
};

export const weeklyRoster = {
  weekLabel: "Week of 17–21 Aug 2026",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  rooms: [
    { room: "Nursery", assignments: ["Lee", "Lee", "Diaz", "Lee", "Diaz"] },
    { room: "Toddlers", assignments: ["Ferreira", "Ferreira", "Ferreira", "Nolan", "Nolan"] },
    { room: "Kindergarten", assignments: ["Diaz", "Diaz", "Lee", "Diaz", "Lee"] },
    { room: "Preschool", assignments: ["Okafor", "Okafor", "Okafor", "Okafor", "Unfilled"] },
  ],
};

export const leaveRequests = [
  { staff: "Ms. Okafor", type: "Annual leave", dates: "3–5 Sep", status: "Pending" as const },
  { staff: "Mr. Diaz", type: "Sick leave", dates: "21 Aug", status: "Approved" as const },
];

export const payrollSummary = {
  payPeriod: "4–17 Aug 2026",
  totalHoursWorked: 742.5,
  estimatedPayroll: 27340,
};

export const nqfQualityAreas = [
  { code: "QA1", title: "Educational program & practice", status: "Complete" as const },
  { code: "QA2", title: "Children's health & safety", status: "Complete" as const },
  { code: "QA4", title: "Staffing arrangements", status: "In progress" as const },
  { code: "QA6", title: "Collaborative partnerships", status: "Complete" as const },
  { code: "QA7", title: "Governance & leadership", status: "In progress" as const },
];

export const staffComplianceAlerts = [
  { staff: "Mr. Diaz", credential: "WWCC", detail: "Expires 2 Sep 2026", status: "Expiring soon" as const },
  { staff: "Ms. Ferreira", credential: "First Aid", detail: "Expires 20 Sep 2026", status: "Renew soon" as const },
  { staff: "Ms. Okafor", credential: "WWCC", detail: "Valid until Mar 2027", status: "Current" as const },
];
