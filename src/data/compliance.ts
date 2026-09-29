// Compliance & reporting demo data (NQF / ACECQA). Dates are expressed as
// offsets from "today" so statuses always look current whenever the demo runs.

import {
  addDays,
  diffInDays,
  formatRange,
  formatShort,
  isWeekend,
  pick,
  seededRandom,
  toKey,
} from "@/lib/dates";
import type { ReportDocument } from "@/lib/documents";
import type { Now } from "@/lib/use-now";

import {
  attended,
  childrenInRoom,
  getAttendance,
  getFamilyCharges,
  staffById,
  staffMembers,
  type Room,
  type StaffMember,
} from "./centre";
import { attendanceRooms } from "./mock-data";

// ---------------------------------------------------------------------------
// NQF quality areas
// ---------------------------------------------------------------------------

export interface QualityArea {
  code: string;
  title: string;
  summary: string;
  standards: { code: string; title: string; met: boolean }[];
  status: "Complete" | "In progress";
  responsibleId: string;
  updatedDaysAgo: number;
  evidence: { name: string; kind: "Policy" | "Record" | "Photo" | "Report" | "Plan"; uploadedBy: string; daysAgo: number }[];
  nextAction?: string;
}

export const qualityAreas: QualityArea[] = [
  {
    code: "QA1",
    title: "Educational program & practice",
    summary: "The program is based on the EYLF, responds to each child's interests and is documented through observations, planning and critical reflection.",
    standards: [
      { code: "1.1", title: "Program", met: true },
      { code: "1.2", title: "Practice", met: true },
      { code: "1.3", title: "Assessment and planning", met: true },
    ],
    status: "Complete",
    responsibleId: "lee",
    updatedDaysAgo: 6,
    evidence: [
      { name: "Kindergarten program – Term 3 planning cycle", kind: "Plan", uploadedBy: "Ms. Lee", daysAgo: 6 },
      { name: "Learning portfolio sample (de-identified)", kind: "Record", uploadedBy: "Ms. Lee", daysAgo: 12 },
      { name: "Critical reflection journal – August", kind: "Report", uploadedBy: "Ms. Okafor", daysAgo: 29 },
    ],
  },
  {
    code: "QA2",
    title: "Children's health & safety",
    summary: "Each child's health and physical activity is supported, and children are protected from harm through supervision, risk management and emergency procedures.",
    standards: [
      { code: "2.1", title: "Health", met: true },
      { code: "2.2", title: "Safety", met: true },
    ],
    status: "Complete",
    responsibleId: "harrington",
    updatedDaysAgo: 3,
    evidence: [
      { name: "Emergency evacuation drill record – Q3", kind: "Record", uploadedBy: "Maria Reyes", daysAgo: 3 },
      { name: "Medical conditions register", kind: "Record", uploadedBy: "Ms. Singh", daysAgo: 9 },
      { name: "Sun protection & heat policy (NT)", kind: "Policy", uploadedBy: "Helen Harrington", daysAgo: 41 },
      { name: "Outdoor play space risk assessment", kind: "Report", uploadedBy: "Mr. Diaz", daysAgo: 18 },
    ],
  },
  {
    code: "QA3",
    title: "Physical environment",
    summary: "The design and maintenance of indoor and outdoor spaces support play-based learning, safety and sustainable practice.",
    standards: [
      { code: "3.1", title: "Design", met: true },
      { code: "3.2", title: "Use", met: true },
    ],
    status: "Complete",
    responsibleId: "harrington",
    updatedDaysAgo: 22,
    evidence: [
      { name: "Daily safety checklist – outdoor areas", kind: "Record", uploadedBy: "Ms. Ferreira", daysAgo: 1 },
      { name: "Sustainability action plan 2026", kind: "Plan", uploadedBy: "Ms. Okafor", daysAgo: 22 },
    ],
  },
  {
    code: "QA4",
    title: "Staffing arrangements",
    summary: "Staffing enables children's learning and development, meets educator-to-child ratios and qualification requirements, and supports a professional culture.",
    standards: [
      { code: "4.1", title: "Staffing arrangements", met: true },
      { code: "4.2", title: "Professionalism", met: false },
    ],
    status: "In progress",
    responsibleId: "reyes",
    updatedDaysAgo: 2,
    evidence: [
      { name: "Staff qualifications register", kind: "Record", uploadedBy: "Maria Reyes", daysAgo: 2 },
      { name: "Ratio compliance audit – September", kind: "Report", uploadedBy: "Maria Reyes", daysAgo: 5 },
    ],
    nextAction: "Two staff certifications need renewal before the register can be signed off.",
  },
  {
    code: "QA5",
    title: "Relationships with children",
    summary: "Respectful, equitable relationships are maintained with each child, and children are supported to build positive relationships with each other.",
    standards: [
      { code: "5.1", title: "Relationships between educators and children", met: true },
      { code: "5.2", title: "Relationships between children", met: true },
    ],
    status: "Complete",
    responsibleId: "okafor",
    updatedDaysAgo: 15,
    evidence: [
      { name: "Behaviour guidance policy", kind: "Policy", uploadedBy: "Helen Harrington", daysAgo: 60 },
      { name: "Room observation photos – Preschool", kind: "Photo", uploadedBy: "Ms. Okafor", daysAgo: 15 },
    ],
  },
  {
    code: "QA6",
    title: "Collaborative partnerships",
    summary: "Respectful relationships with families are developed and maintained, and families are supported in their parenting role; community links are fostered.",
    standards: [
      { code: "6.1", title: "Supportive relationships with families", met: true },
      { code: "6.2", title: "Collaborative partnerships", met: true },
    ],
    status: "Complete",
    responsibleId: "harrington",
    updatedDaysAgo: 11,
    evidence: [
      { name: "Family feedback survey results – Term 2", kind: "Report", uploadedBy: "Helen Harrington", daysAgo: 11 },
      { name: "Larrakia Nation community visit notes", kind: "Record", uploadedBy: "Ms. Lee", daysAgo: 34 },
    ],
  },
  {
    code: "QA7",
    title: "Governance & leadership",
    summary: "Effective leadership builds and promotes a positive organisational culture, and governance supports the operation of a quality service.",
    standards: [
      { code: "7.1", title: "Governance", met: true },
      { code: "7.2", title: "Leadership", met: false },
    ],
    status: "In progress",
    responsibleId: "harrington",
    updatedDaysAgo: 8,
    evidence: [
      { name: "Quality Improvement Plan (QIP) 2026 – draft v3", kind: "Plan", uploadedBy: "Helen Harrington", daysAgo: 8 },
      { name: "Policy review schedule", kind: "Record", uploadedBy: "Maria Reyes", daysAgo: 20 },
    ],
    nextAction: "Finalise the QIP self-assessment and upload the signed version before the A&R visit.",
  },
];

// ---------------------------------------------------------------------------
// Required documentation (Education and Care Services National Regulations)
// ---------------------------------------------------------------------------

export interface RequiredDocument {
  name: string;
  regulation: string;
  ownerId: string;
  reviewedDaysAgo: number;
  /** Review cycle in days. */
  cycle: number;
  missing?: boolean;
}

export const requiredDocuments: RequiredDocument[] = [
  { name: "Quality Improvement Plan", regulation: "Reg 55–56", ownerId: "harrington", reviewedDaysAgo: 8, cycle: 365 },
  { name: "Policies & procedures (all 20+)", regulation: "Reg 168–172", ownerId: "harrington", reviewedDaysAgo: 20, cycle: 365 },
  { name: "Enrolment records", regulation: "Reg 160–162", ownerId: "reyes", reviewedDaysAgo: 4, cycle: 90 },
  { name: "Attendance records (sign in/out)", regulation: "Reg 158", ownerId: "reyes", reviewedDaysAgo: 1, cycle: 7 },
  { name: "Incident, injury, trauma & illness register", regulation: "Reg 87", ownerId: "harrington", reviewedDaysAgo: 5, cycle: 30 },
  { name: "Medication records", regulation: "Reg 92", ownerId: "singh", reviewedDaysAgo: 12, cycle: 30 },
  { name: "Staff record & WWCC register", regulation: "Reg 145–147", ownerId: "reyes", reviewedDaysAgo: 2, cycle: 30 },
  { name: "Emergency & evacuation drills", regulation: "Reg 97", ownerId: "harrington", reviewedDaysAgo: 3, cycle: 90 },
  { name: "Excursion risk assessments", regulation: "Reg 100–102", ownerId: "lee", reviewedDaysAgo: 0, cycle: 60, missing: true },
  { name: "Educational program documentation", regulation: "Reg 74", ownerId: "lee", reviewedDaysAgo: 6, cycle: 30 },
];

export function documentStatus(document: RequiredDocument): "Current" | "Review due" | "Missing" {
  if (document.missing) return "Missing";
  return document.reviewedDaysAgo > document.cycle * 0.85 ? "Review due" : "Current";
}

// ---------------------------------------------------------------------------
// Staff certifications
// ---------------------------------------------------------------------------

export type CertStatus = "Current" | "Renew soon" | "Expiring soon" | "Expired";

export interface Certification {
  name: string;
  detail: string;
  validityDays: number | null;
  /** Days from today until expiry (negative = expired). */
  expiresIn: number | null;
}

const CERTS = [
  { name: "WWCC (NT Ochre Card)", detail: "Working With Children Clearance", validityDays: 730 },
  { name: "First Aid (HLTAID012)", detail: "Provide First Aid in an education and care setting", validityDays: 1095 },
  { name: "CPR (HLTAID009)", detail: "Annual CPR refresher", validityDays: 365 },
  { name: "Anaphylaxis & asthma", detail: "ACECQA-approved emergency management training", validityDays: 1095 },
  { name: "Child protection", detail: "Annual mandatory reporting training (NT)", validityDays: 365 },
] as const;

const EXPIRY_OVERRIDES: Record<string, Partial<Record<string, number>>> = {
  diaz: { "WWCC (NT Ochre Card)": 4 },
  ferreira: { "First Aid (HLTAID012)": 22 },
  okafor: { "WWCC (NT Ochre Card)": 186 },
  kowalski: { "CPR (HLTAID009)": -3 },
  walsh: { "Child protection": 12 },
  clarke: { "Anaphylaxis & asthma": 38 },
};

export function certificationsFor(member: StaffMember): Certification[] {
  const random = seededRandom(`certs|${member.id}`);
  const certs: Certification[] = CERTS.map((cert) => ({
    name: cert.name,
    detail: cert.detail,
    validityDays: cert.validityDays,
    expiresIn: EXPIRY_OVERRIDES[member.id]?.[cert.name] ?? 60 + Math.floor(random() * (cert.validityDays - 60)),
  }));
  if (member.id === "karim") {
    certs.push({ name: "Food Safety Supervisor", detail: "SITXFSA005/006 – NT Health", validityDays: 1825, expiresIn: 410 });
  }
  certs.push({ name: "Qualification", detail: member.qualification, validityDays: null, expiresIn: null });
  return certs;
}

export function certStatus(cert: Certification): CertStatus {
  if (cert.expiresIn === null) return "Current";
  if (cert.expiresIn < 0) return "Expired";
  if (cert.expiresIn <= 14) return "Expiring soon";
  if (cert.expiresIn <= 45) return "Renew soon";
  return "Current";
}

const severity: Record<CertStatus, number> = { Expired: 0, "Expiring soon": 1, "Renew soon": 2, Current: 3 };

export function staffComplianceSummary(member: StaffMember) {
  const certs = certificationsFor(member);
  const worst = certs.reduce<Certification | null>(
    (current, cert) => (!current || severity[certStatus(cert)] < severity[certStatus(current)] ? cert : current),
    null,
  );
  const status = worst ? certStatus(worst) : "Current";
  return { member, certs, worst, status, issues: certs.filter((cert) => certStatus(cert) !== "Current").length };
}

export function allStaffCompliance() {
  return staffMembers
    .map(staffComplianceSummary)
    .sort((a, b) => severity[a.status] - severity[b.status] || a.member.surname.localeCompare(b.member.surname));
}

export function renewalHistory(cert: Certification, today: Date) {
  if (cert.expiresIn === null || cert.validityDays === null) return [];
  const expiry = addDays(today, cert.expiresIn);
  const history: { date: string; event: string }[] = [];
  let issued = addDays(expiry, -cert.validityDays);
  for (let i = 0; i < 3 && issued > new Date(2018, 0, 1); i += 1) {
    history.push({ date: formatShort(issued), event: i === 0 ? "Current certificate issued" : "Renewed" });
    issued = addDays(issued, -cert.validityDays);
  }
  return history;
}

export const statusVariantFor: Record<CertStatus, "success" | "warning" | "danger"> = {
  Current: "success",
  "Renew soon": "warning",
  "Expiring soon": "danger",
  Expired: "danger",
};

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export interface Incident {
  id: string;
  date: Date;
  room: Room;
  child: string;
  type: string;
  action: string;
  recordedBy: string;
  notified: string;
}

const INCIDENT_TYPES = [
  { type: "Minor injury – fall (graze)", action: "First aid, ice pack applied" },
  { type: "Minor injury – bump to head", action: "Cold compress, monitored 2 hrs" },
  { type: "Bite from another child", action: "Washed, antiseptic applied" },
  { type: "Illness – temperature 38.4°C", action: "Parent called, collected within 1 hr" },
  { type: "Illness – vomiting", action: "Isolated, parent collected" },
  { type: "Allergic reaction – mild rash", action: "Antihistamine per action plan" },
  { type: "Asthma – mild episode", action: "Ventolin per action plan" },
];

export function incidentsBetween(from: Date, to: Date): Incident[] {
  const incidents: Incident[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    if (isWeekend(date)) continue;
    const random = seededRandom(`incident|${toKey(date)}`);
    if (random() > 0.38) continue;
    const room = pick(random, attendanceRooms);
    const child = pick(random, childrenInRoom(room));
    const detail = pick(random, INCIDENT_TYPES);
    const educator = pick(random, staffMembers.filter((member) => member.room === room));
    incidents.push({
      id: `INC-${toKey(date).replaceAll("-", "")}`,
      date,
      room,
      child: child.name,
      type: detail.type,
      action: detail.action,
      recordedBy: educator.displayName,
      notified: `${formatShort(date)} · ${6 + Math.floor(random() * 50)} min after`,
    });
  }
  return incidents;
}

// ---------------------------------------------------------------------------
// Operational reports
// ---------------------------------------------------------------------------

export const reportTypes = [
  { id: "ar", label: "Assessment & Rating summary", roomFilter: false },
  { id: "qip", label: "QA documentation (QIP evidence)", roomFilter: false },
  { id: "incidents", label: "Incident, injury, trauma & illness", roomFilter: true },
  { id: "attendance", label: "Attendance summary", roomFilter: true },
  { id: "ccs", label: "CCS reconciliation", roomFilter: false },
  { id: "staff", label: "Staff compliance & qualifications", roomFilter: false },
] as const;

export type ReportTypeId = (typeof reportTypes)[number]["id"];

export interface ReportRequest {
  type: ReportTypeId;
  from: Date;
  to: Date;
  room: Room | null;
}

let reportCounter = 1040;

export function buildReport(request: ReportRequest, now: Now, generatedBy: string): ReportDocument {
  const typeInfo = reportTypes.find((entry) => entry.id === request.type)!;
  const period = formatRange(request.from, request.to);
  const scope = request.room && typeInfo.roomFilter ? `${request.room} room` : "Whole centre";
  const minutes = now.minutes;
  const generatedAt = `${formatShort(now.today)}, ${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, "0")}${minutes >= 720 ? "pm" : "am"}`;
  reportCounter += 1;
  const base = {
    reference: `RPT-${toKey(now.today).replaceAll("-", "").slice(2)}-${reportCounter}`,
    title: typeInfo.label,
    scope,
    period,
    generatedAt,
    generatedBy,
  };
  const days = diffInDays(request.to, request.from) + 1;

  switch (request.type) {
    case "ar": {
      const met = qualityAreas.flatMap((area) => area.standards).filter((standard) => standard.met).length;
      const total = qualityAreas.flatMap((area) => area.standards).length;
      return {
        ...base,
        summary: `Self-assessment against the National Quality Standard for the period. ${met} of ${total} standards are currently rated as met; outstanding actions relate to staffing professionalism (4.2) and leadership (7.2).`,
        metrics: [
          { label: "Standards met", value: `${met} / ${total}` },
          { label: "Quality areas complete", value: `${qualityAreas.filter((area) => area.status === "Complete").length} / 7` },
          { label: "Evidence items", value: String(qualityAreas.reduce((sum, area) => sum + area.evidence.length, 0)) },
        ],
        tables: [
          {
            title: "Quality areas",
            columns: ["Area", "Title", "Status", "Responsible"],
            rows: qualityAreas.map((area) => [area.code, area.title, area.status, staffById[area.responsibleId].name]),
          },
        ],
      };
    }
    case "qip":
      return {
        ...base,
        summary: "Evidence register supporting the Quality Improvement Plan, grouped by quality area, with owners and upload dates.",
        metrics: [
          { label: "Evidence items", value: String(qualityAreas.reduce((sum, area) => sum + area.evidence.length, 0)) },
          { label: "Documents current", value: `${requiredDocuments.filter((doc) => documentStatus(doc) === "Current").length} / ${requiredDocuments.length}` },
          { label: "Open actions", value: String(qualityAreas.filter((area) => area.nextAction).length) },
        ],
        tables: [
          {
            title: "Evidence register",
            columns: ["Area", "Document", "Type", "Uploaded by"],
            rows: qualityAreas.flatMap((area) =>
              area.evidence.map((item) => [area.code, item.name, item.kind, item.uploadedBy]),
            ),
          },
          {
            title: "Required documentation",
            columns: ["Document", "Regulation", "Status", "Owner"],
            rows: requiredDocuments.map((doc) => [doc.name, doc.regulation, documentStatus(doc), staffById[doc.ownerId].name]),
          },
        ],
      };
    case "incidents": {
      const incidents = incidentsBetween(request.from, request.to).filter(
        (incident) => !request.room || incident.room === request.room,
      );
      return {
        ...base,
        summary: `${incidents.length} incidents, injuries or illnesses were recorded during the period. All parents were notified within 24 hours as required by Regulation 86. No notifiable serious incidents occurred.`,
        metrics: [
          { label: "Incidents recorded", value: String(incidents.length) },
          { label: "Illness", value: String(incidents.filter((incident) => incident.type.startsWith("Illness")).length) },
          { label: "Serious incidents (Reg 12)", value: "0" },
        ],
        tables: [
          {
            title: "Incident register",
            columns: ["Date", "Room", "Child", "Type", "Recorded by"],
            rows: incidents.map((incident) => [formatShort(incident.date), incident.room, incident.child, incident.type, incident.recordedBy]),
          },
        ],
      };
    }
    case "attendance": {
      const rooms = request.room ? [request.room] : [...attendanceRooms];
      const rows = rooms.map((room) => {
        let booked = 0;
        let present = 0;
        let absent = 0;
        for (let offset = 0; offset < days; offset += 1) {
          const date = addDays(request.from, offset);
          for (const child of childrenInRoom(room)) {
            const record = getAttendance(child, date, now);
            if (record.status === "Not booked" || record.status === "Closed" || record.status === "Booked") continue;
            booked += 1;
            if (attended(record)) present += 1;
            if (record.status.startsWith("Absent")) absent += 1;
          }
        }
        return { room, booked, present, absent };
      });
      const booked = rows.reduce((sum, row) => sum + row.booked, 0);
      const present = rows.reduce((sum, row) => sum + row.present, 0);
      return {
        ...base,
        summary: `Attendance across ${rooms.length === 1 ? "the room" : "all rooms"} for ${days} days. Booked sessions are compared with signed-in attendance from the digital register.`,
        metrics: [
          { label: "Booked sessions", value: booked.toLocaleString() },
          { label: "Attended", value: present.toLocaleString() },
          { label: "Attendance rate", value: `${booked ? Math.round((present / booked) * 100) : 0}%` },
        ],
        tables: [
          {
            title: "By room",
            columns: ["Room", "Booked", "Attended", "Absent", "Rate"],
            rows: rows.map((row) => [
              row.room,
              String(row.booked),
              String(row.present),
              String(row.absent),
              `${row.booked ? Math.round((row.present / row.booked) * 100) : 0}%`,
            ]),
          },
        ],
      };
    }
    case "ccs": {
      const charges = [];
      for (let offset = 0; offset < days; offset += 7) {
        const weekStart = addDays(request.from, offset - ((request.from.getDay() + 6) % 7));
        charges.push(...getFamilyCharges(weekStart, 7, now.today));
      }
      const gross = charges.reduce((sum, charge) => sum + charge.grossFee, 0);
      const ccs = charges.reduce((sum, charge) => sum + charge.ccsSubsidy, 0);
      const unpaid = charges.filter((charge) => charge.status !== "Paid");
      return {
        ...base,
        summary: "Reconciliation of fees charged, Child Care Subsidy received from Services Australia and family gap fees outstanding.",
        metrics: [
          { label: "Fees charged", value: `$${Math.round(gross).toLocaleString()}` },
          { label: "CCS received", value: `$${Math.round(ccs).toLocaleString()}` },
          { label: "Gap fees outstanding", value: `$${Math.round(unpaid.reduce((sum, charge) => sum + charge.balance, 0)).toLocaleString()}` },
        ],
        tables: [
          {
            title: "Unpaid invoices",
            columns: ["Invoice", "Family", "Gap fee", "Status"],
            rows: unpaid.map((charge) => [charge.invoiceNumber, charge.family.guardian, `$${charge.balance.toFixed(2)}`, charge.status]),
          },
        ],
      };
    }
    case "staff": {
      const summaries = allStaffCompliance();
      return {
        ...base,
        summary: `Qualification and certification register for all ${summaries.length} staff members as required under Regulations 145–147.`,
        metrics: [
          { label: "Staff fully compliant", value: `${summaries.filter((entry) => entry.status === "Current").length} / ${summaries.length}` },
          { label: "Expiring within 14 days", value: String(summaries.filter((entry) => entry.status === "Expiring soon").length) },
          { label: "Expired", value: String(summaries.filter((entry) => entry.status === "Expired").length) },
        ],
        tables: [
          {
            title: "Staff register",
            columns: ["Staff member", "Role", "Status", "Next expiry"],
            rows: summaries.map((entry) => [
              entry.member.name,
              entry.member.role,
              entry.status,
              entry.worst && entry.worst.expiresIn !== null
                ? `${entry.worst.name.split(" (")[0]} – ${formatShort(addDays(now.today, entry.worst.expiresIn))}`
                : "—",
            ]),
          },
        ],
      };
    }
  }
}
