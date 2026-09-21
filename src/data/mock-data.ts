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

export const todayLabel = "Wednesday, 19 August 2026";

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
  hasImage?: boolean;
}

export const learningPortfolio: LearningObservation[] = [
  {
    title: "Sensory play",
    date: "Today",
    note: "Ava explored the water table and shared tools with two friends, showing good turn-taking.",
    author: "Ms. Lee",
    tag: "Social & emotional development",
    hasImage: true,
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

export const hasUnreadNotifications = familyNotifications.some((group) =>
  group.items.some((item) => item.unread),
);

// ---------------------------------------------------------------------------
// Shared — Enquiries (Family <-> Staff, backed by a localStorage-persisted
// React Context in src/components/shared/enquiry-store.tsx)
// ---------------------------------------------------------------------------

export const enquiryTypes = [
  "Fees & payments",
  "Room availability & places per room",
  "Waitlist status",
  "New enrolment / waitlist",
  "Enrolment & booking changes",
  "CCS (Child Care Subsidy) question",
  "Attendance & absences",
  "Health, safety & incidents",
  "Programs & learning",
  "Other",
] as const;

export type EnquiryType = (typeof enquiryTypes)[number];

export type EnquiryStatus = "New" | "In progress" | "Waiting on family" | "Resolved";
export type EnquiryPriority = "Normal" | "Urgent";
export type ContactPreference = "Email" | "Phone" | "Portal";

export interface EnquiryMessage {
  from: "family" | "staff";
  text: string;
  date: string;
}

export interface Enquiry {
  id: string;
  reference: string;
  type: EnquiryType;
  family: string;
  childName?: string;
  room?: string;
  message: string;
  priority: EnquiryPriority;
  contactPreference: ContactPreference;
  status: EnquiryStatus;
  date: string;
  internalNotes: string;
  assignedTo: string | null;
  /** True once staff has updated the enquiry since the family last viewed it. */
  familyUnread: boolean;
  thread: EnquiryMessage[];
}

export const staffDirectory = [
  "Maria Reyes",
  "Ms. Lee",
  "Mr. Diaz",
  "Ms. Ferreira",
  "Mr. Nolan",
  "Ms. Okafor",
];

export const enquiryReplyTemplates: Record<EnquiryType, string[]> = {
  "Fees & payments": [
    "Thanks for reaching out. I've reviewed your account — you can see the latest balance and invoices in the Billing tab.",
    "I've applied the adjustment to your account. The updated balance should appear within 24 hours.",
  ],
  "Room availability & places per room": [
    "Thanks for checking in — that room currently has limited availability. I'll confirm exact vacancies shortly.",
    "Good news — a place has opened up in the room you asked about. Let us know if you'd like us to hold it for you.",
  ],
  "Waitlist status": [
    "You're still on the waitlist — I've confirmed your current position and will update you as soon as it changes.",
    "Your waitlist position has moved up. We'll be in touch as soon as a place becomes available.",
  ],
  "New enrolment / waitlist": [
    "Thanks for your enquiry! I've added your child to our waitlist and will be in touch as soon as a place becomes available.",
    "We're pleased to offer your child a place — please confirm by replying here or calling the centre.",
  ],
  "Enrolment & booking changes": [
    "I've noted your requested booking change and will confirm availability shortly.",
    "Your booking has been updated as requested. Let us know if anything else needs adjusting.",
  ],
  "CCS (Child Care Subsidy) question": [
    "Thanks for your question — I've checked your CCS details and everything looks up to date on our end.",
    "It looks like your CCS assessment may need updating with Services Australia. Happy to help if you'd like guidance.",
  ],
  "Attendance & absences": [
    "Thanks for letting us know — I've recorded the absence against your child's attendance record.",
    "Noted, thank you. Please remember to notify us by 9am on the day where possible.",
  ],
  "Health, safety & incidents": [
    "Thank you for flagging this — I've logged it and our team is following up today.",
    "I've reviewed this with the room leader. Please let us know if you have any further questions.",
  ],
  "Programs & learning": [
    "Thanks for your interest — I've passed this on to the educators in your child's room.",
    "Great question! I've asked the room leader to share more detail on the program with you directly.",
  ],
  Other: ["Thanks for reaching out — I'll look into this and get back to you shortly."],
};

export const seedEnquiries: Enquiry[] = [
  {
    id: "enq-seed-leo",
    reference: "ENQ-10231",
    type: "New enrolment / waitlist",
    family: "Thompson",
    childName: "Leo Thompson",
    room: "Toddlers",
    message:
      "Preferred start date: Term 4, 2026\nWe'd like to add Leo to the Toddlers waitlist ahead of his 2nd birthday.",
    priority: "Normal",
    contactPreference: "Email",
    status: "Resolved",
    date: "12 Jul 2026",
    internalNotes: "Added to Toddlers waitlist at position #3.",
    assignedTo: "Maria Reyes",
    familyUnread: false,
    thread: [
      {
        from: "family",
        text: "We'd like to add Leo to the Toddlers waitlist ahead of his 2nd birthday.",
        date: "12 Jul 2026",
      },
      {
        from: "staff",
        text: "Thanks for your enquiry! I've added Leo to our Toddlers waitlist — he's currently #3 of 11. We'll be in touch as soon as a place becomes available.",
        date: "13 Jul 2026",
      },
    ],
  },
  {
    id: "enq-seed-maya",
    reference: "ENQ-10254",
    type: "New enrolment / waitlist",
    family: "Chen",
    childName: "Maya Chen",
    room: "Nursery",
    message: "Preferred start date: Term 1, 2027\nLooking for a Nursery place starting early next year.",
    priority: "Normal",
    contactPreference: "Phone",
    status: "In progress",
    date: "20 Jul 2026",
    internalNotes: "Checking Nursery capacity for Term 1 2027 before confirming a waitlist position.",
    assignedTo: "Ms. Ferreira",
    familyUnread: false,
    thread: [
      { from: "family", text: "Looking for a Nursery place starting early next year.", date: "20 Jul 2026" },
    ],
  },
  {
    id: "enq-seed-noah",
    reference: "ENQ-10267",
    type: "New enrolment / waitlist",
    family: "Ali",
    childName: "Noah Ali",
    room: "Kindergarten",
    message:
      "Preferred start date: Term 4, 2026\nCould you confirm what documents you need from us to finalise the enrolment?",
    priority: "Urgent",
    contactPreference: "Email",
    status: "Waiting on family",
    date: "25 Jul 2026",
    internalNotes: "Awaiting an up-to-date immunisation record before we can confirm the offer.",
    assignedTo: "Maria Reyes",
    familyUnread: false,
    thread: [
      {
        from: "family",
        text: "Could you confirm what documents you need from us to finalise the enrolment?",
        date: "25 Jul 2026",
      },
      {
        from: "staff",
        text: "Thanks for reaching out — we just need an up-to-date immunisation record before we can confirm the offer. Could you upload or email that through?",
        date: "26 Jul 2026",
      },
    ],
  },
  {
    id: "enq-seed-zara",
    reference: "ENQ-10289",
    type: "New enrolment / waitlist",
    family: "Nguyen",
    childName: "Zara Nguyen",
    room: "Preschool",
    message: "Preferred start date: Term 4, 2026\nHoping to join the Preschool waitlist.",
    priority: "Normal",
    contactPreference: "Portal",
    status: "Resolved",
    date: "28 Jul 2026",
    internalNotes: "Added to Preschool waitlist at position #2.",
    assignedTo: "Ms. Okafor",
    familyUnread: false,
    thread: [
      { from: "family", text: "Hoping to join the Preschool waitlist.", date: "28 Jul 2026" },
      {
        from: "staff",
        text: "You're on the list! Zara is currently #2 on the Preschool waitlist — we'll reach out as soon as a place opens.",
        date: "29 Jul 2026",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Staff Portal — ICMS
// ---------------------------------------------------------------------------

export const currentStaffUser = {
  name: "Maria Reyes",
  role: "Admin Officer",
  initials: "MR",
  email: "m.reyes@littleexplorer.edu.au",
};

export const staffDashboardDate = "Wed, 19 August 2026";
export const staffAttendanceDate = "19 Aug 2026";

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
