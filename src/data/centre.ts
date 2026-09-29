// Deterministic, generated demo data for the whole centre.
//
// Everything here is derived from fixed seeds, so the same child, day or week
// always produces the same records — in both the Family and Staff portals, on
// every reload. Nothing is persisted and nothing leaves the browser.

import {
  addDays,
  diffInDays,
  formatShort,
  fromKey,
  isWeekend,
  pick,
  seededRandom,
  startOfWeek,
  toKey,
  weekdayIndex,
} from "@/lib/dates";
import type { Now } from "@/lib/use-now";

import { attendanceRooms } from "./mock-data";

export type Room = (typeof attendanceRooms)[number];

export const centreDetails = {
  name: "Little Explorer Early Learning Centre",
  address: "25 Mitchell Street, Darwin City NT 0800",
  phone: "(08) 8981 4420",
  email: "hello@littleexplorer.edu.au",
  abn: "12 345 678 901",
  providerApproval: "PR-00012345",
  serviceApproval: "SE-00067890",
  hours: "Mon–Fri, 7:00am – 6:00pm",
};

export interface RoomConfig {
  room: Room;
  slug: string;
  /** Children enrolled in the room (some are part-time). */
  enrolled: number;
  /** Licensed places per day. */
  capacity: number;
  /** Children booked on any given weekday. */
  bookedPerDay: number;
  dailyFee: number;
  ratio: string;
  ageRange: string;
  minAgeMonths: number;
  maxAgeMonths: number;
}

export const roomConfig: Record<Room, RoomConfig> = {
  Nursery: {
    room: "Nursery",
    slug: "nursery",
    enrolled: 22,
    capacity: 20,
    bookedPerDay: 18,
    dailyFee: 142,
    ratio: "1:4",
    ageRange: "6 weeks – 2 years",
    minAgeMonths: 8,
    maxAgeMonths: 24,
  },
  Toddlers: {
    room: "Toddlers",
    slug: "toddlers",
    enrolled: 28,
    capacity: 24,
    bookedPerDay: 24,
    dailyFee: 136,
    ratio: "1:5",
    ageRange: "2 – 3 years",
    minAgeMonths: 24,
    maxAgeMonths: 36,
  },
  Kindergarten: {
    room: "Kindergarten",
    slug: "kindergarten",
    enrolled: 34,
    capacity: 32,
    bookedPerDay: 30,
    dailyFee: 128,
    ratio: "1:11",
    ageRange: "3 – 4 years",
    minAgeMonths: 36,
    maxAgeMonths: 48,
  },
  Preschool: {
    room: "Preschool",
    slug: "preschool",
    enrolled: 28,
    capacity: 26,
    bookedPerDay: 26,
    dailyFee: 122,
    ratio: "1:11",
    ageRange: "4 – 5 years",
    minAgeMonths: 48,
    maxAgeMonths: 62,
  },
};

export const WEEKLY_LEVY = 8;

export function roomFromSlug(slug: string): Room | null {
  return attendanceRooms.find((room) => roomConfig[room].slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export interface StaffMember {
  id: string;
  name: string;
  /** How the rest of the app refers to them, e.g. "Ms. Lee". */
  displayName: string;
  surname: string;
  role: string;
  room: Room | null;
  employment: "Full-time" | "Part-time" | "Casual";
  hourlyRate: number;
  qualification: string;
  email: string;
  phone: string;
  startDate: string;
}

function staff(
  id: string,
  title: "Ms." | "Mr.",
  first: string,
  surname: string,
  role: string,
  room: Room | null,
  employment: StaffMember["employment"],
  hourlyRate: number,
  qualification: string,
  phone: string,
  startDate: string,
): StaffMember {
  return {
    id,
    name: `${first} ${surname}`,
    displayName: `${title} ${surname}`,
    surname,
    role,
    room,
    employment,
    hourlyRate,
    qualification,
    email: `${first[0].toLowerCase()}.${surname.toLowerCase().replace(/[^a-z]/g, "")}@littleexplorer.edu.au`,
    phone,
    startDate,
  };
}

export const staffMembers: StaffMember[] = [
  staff("harrington", "Ms.", "Helen", "Harrington", "Centre Director", null, "Full-time", 52.4, "Bachelor of Early Childhood Education", "0401 220 118", "2019-01-14"),
  staff("reyes", "Ms.", "Maria", "Reyes", "Admin Officer", null, "Full-time", 36.2, "Cert IV Business Administration", "0402 331 904", "2021-03-01"),
  staff("singh", "Ms.", "Priya", "Singh", "Room Leader", "Nursery", "Full-time", 38.9, "Diploma of Early Childhood Education and Care", "0403 118 552", "2020-07-20"),
  staff("walsh", "Ms.", "Emily", "Walsh", "Educator", "Nursery", "Full-time", 33.1, "Cert III Early Childhood Education and Care", "0404 902 337", "2022-02-07"),
  staff("haddad", "Ms.", "Layla", "Haddad", "Educator", "Nursery", "Part-time", 34.6, "Diploma of Early Childhood Education and Care", "0405 667 120", "2023-05-15"),
  staff("clarke", "Ms.", "Ruby", "Clarke", "Trainee Educator", "Nursery", "Part-time", 27.8, "Cert III (in progress)", "0406 450 981", "2025-08-04"),
  staff("ferreira", "Ms.", "Ana", "Ferreira", "Room Leader", "Toddlers", "Full-time", 38.9, "Diploma of Early Childhood Education and Care", "0407 823 446", "2020-02-10"),
  staff("nolan", "Mr.", "James", "Nolan", "Educator", "Toddlers", "Full-time", 33.1, "Cert III Early Childhood Education and Care", "0408 110 725", "2022-09-12"),
  staff("oconnor", "Mr.", "Liam", "O'Connor", "Educator", "Toddlers", "Part-time", 34.6, "Diploma of Early Childhood Education and Care", "0409 356 218", "2024-01-22"),
  staff("martin", "Ms.", "Hannah", "Martin", "Educator", "Toddlers", "Full-time", 33.1, "Cert III Early Childhood Education and Care", "0410 774 093", "2023-11-06"),
  staff("lee", "Ms.", "Grace", "Lee", "Room Leader / ECT", "Kindergarten", "Full-time", 44.7, "Bachelor of Early Childhood Education", "0411 238 660", "2019-06-03"),
  staff("diaz", "Mr.", "Daniel", "Diaz", "Educator", "Kindergarten", "Full-time", 34.6, "Diploma of Early Childhood Education and Care", "0412 590 174", "2021-10-18"),
  staff("brooks", "Ms.", "Sophie", "Brooks", "Educator", "Kindergarten", "Part-time", 33.1, "Cert III Early Childhood Education and Care", "0413 845 302", "2024-04-29"),
  staff("park", "Ms.", "Olivia", "Park", "Educator", "Kindergarten", "Part-time", 33.1, "Cert III Early Childhood Education and Care", "0414 219 587", "2025-02-03"),
  staff("okafor", "Ms.", "Chioma", "Okafor", "Room Leader / ECT", "Preschool", "Full-time", 44.7, "Bachelor of Early Childhood Education", "0415 673 841", "2020-01-28"),
  staff("tanaka", "Mr.", "Kenji", "Tanaka", "Educator", "Preschool", "Full-time", 34.6, "Diploma of Early Childhood Education and Care", "0416 302 759", "2022-06-27"),
  staff("rossi", "Ms.", "Giulia", "Rossi", "Educator", "Preschool", "Part-time", 33.1, "Cert III Early Childhood Education and Care", "0417 918 426", "2023-08-14"),
  staff("whitfield", "Mr.", "Ben", "Whitfield", "Educator", "Preschool", "Full-time", 33.1, "Cert III Early Childhood Education and Care", "0418 461 035", "2024-10-07"),
  staff("kowalski", "Mr.", "Tom", "Kowalski", "Casual Educator", null, "Casual", 41.4, "Cert III Early Childhood Education and Care", "0419 587 212", "2025-03-17"),
  staff("karim", "Ms.", "Nadia", "Karim", "Cook", null, "Part-time", 31.5, "Cert III Commercial Cookery", "0420 136 978", "2021-05-24"),
];

export const staffById = Object.fromEntries(staffMembers.map((member) => [member.id, member]));

export const roomEducators: Record<Room, StaffMember[]> = {
  Nursery: staffMembers.filter((member) => member.room === "Nursery"),
  Toddlers: staffMembers.filter((member) => member.room === "Toddlers"),
  Kindergarten: staffMembers.filter((member) => member.room === "Kindergarten"),
  Preschool: staffMembers.filter((member) => member.room === "Preschool"),
};

// ---------------------------------------------------------------------------
// Children & families
// ---------------------------------------------------------------------------

export interface EnrolledChild {
  id: string;
  firstName: string;
  surname: string;
  name: string;
  room: Room;
  dob: string;
  familyId: string;
  /** 0 = Monday … 4 = Friday. */
  bookedDays: number[];
  startDate: string;
  ccsPercent: number;
  ccsStatus: "Active" | "Pending CWA" | "Not claimed";
  crn: string;
  allergies: string | null;
  medical: string | null;
}

export interface FamilyAccount {
  id: string;
  surname: string;
  guardian: string;
  email: string;
  phone: string;
  address: string;
  children: EnrolledChild[];
}

const FIRST_NAMES = [
  "Olivia", "Charlotte", "Amelia", "Isla", "Mila", "Grace", "Chloe", "Ella", "Zoe", "Ruby", "Evie", "Lily",
  "Matilda", "Willow", "Isabella", "Sienna", "Ivy", "Hazel", "Aria", "Frankie", "Penelope", "Georgia", "Sadie",
  "Poppy", "Eloise", "Luna", "Scarlett", "Hannah", "Layla", "Aaliyah", "Priya", "Anika", "Mei", "Yuki", "Sofia",
  "Lucia", "Elena", "Nina", "Freya", "Alice", "Emily", "Stella", "Violet", "Maeve", "Rosie", "Imogen", "Harriet",
  "Ada", "Leila", "Amira", "Esther", "Nora", "Clara", "Jasmine", "Jack", "Henry", "William", "Thomas", "Lucas",
  "James", "Hudson", "Oscar", "Charlie", "Archie", "Theodore", "Levi", "Harrison", "Max", "Hugo", "Louis", "Arlo",
  "Isaac", "Mason", "Elijah", "Samuel", "Finn", "Ryan", "Xavier", "Muhammad", "Omar", "Arjun", "Rohan", "Kai",
  "Hiroshi", "Minh", "Daniel", "Mateo", "Luca", "Nico", "Felix", "Jasper", "Sebastian", "Toby", "Harvey", "Ezra",
  "Rafael", "Aiden", "Zayn", "Angus", "Patrick", "Declan", "George", "Edward", "Benjamin", "Alexander", "Riley",
  "Beau", "Jude", "Callum", "Tariq",
];

const SURNAMES = [
  "Smith", "Jones", "Williams", "Taylor", "Wilson", "Anderson", "White", "Walker", "Harris", "Wright", "Robinson",
  "Mitchell", "Young", "Campbell", "Kelly", "Murphy", "Cooper", "Evans", "Hughes", "Edwards", "Scott", "Baker",
  "Morris", "Ward", "Hall", "Turner", "Russell", "Stewart", "Bennett", "Johnston", "Gray", "Chapman", "Hunt",
  "Dixon", "Fraser", "Hudson", "Lloyd", "Reid", "Watson", "Bailey", "Ross", "Henderson", "Tran", "Pham", "Le",
  "Wong", "Liu", "Zhang", "Wang", "Sharma", "Gupta", "Kaur", "Ahmed", "Hassan", "Rahman", "Costa", "Romano",
  "Esposito", "Papadopoulos", "O'Brien", "Fitzgerald", "Doyle", "Novak", "Santos", "Silva", "Garcia", "Lopez",
  "Sato", "Yamamoto", "Mahmoud", "Jackson", "Thomas", "Moore", "Murray", "Collins", "Graham", "Byrne", "Nair",
  "Okoye", "Mendes",
];

const GUARDIAN_NAMES = [
  "Emma", "Jessica", "Rebecca", "Laura", "Michelle", "Nicole", "Hayley", "Kate", "Rachel", "Amy", "Megan",
  "Lauren", "Anh", "Mai", "Fatima", "Aisha", "Deepa", "Sunita", "Lucy", "David", "Michael", "Chris", "Matt",
  "Andrew", "Tom", "Ben", "Josh", "Sam", "Raj", "Hamid", "Jenna", "Tessa", "Carla", "Yasmin",
];

const SUBURBS = [
  "Nightcliff NT 0810", "Parap NT 0820", "Fannie Bay NT 0820", "Stuart Park NT 0820", "Larrakeyah NT 0820",
  "Rapid Creek NT 0810", "Millner NT 0810", "Coconut Grove NT 0810", "Jingili NT 0810", "Nakara NT 0810",
  "Alawa NT 0810", "Leanyer NT 0812", "Wulagi NT 0812", "Malak NT 0812", "Karama NT 0812", "Woolner NT 0820",
];

const STREETS = [
  "Casuarina Drive", "Trower Road", "Dick Ward Drive", "Bagot Road", "Progress Drive", "Rothdale Road",
  "Nemarluk Drive", "McMillans Road", "Lee Point Road", "Parap Road", "Gilruth Avenue", "Kurringal Street",
];

const ALLERGIES = ["Peanuts & tree nuts", "Dairy", "Egg", "Sesame", "Shellfish"];
const MEDICAL = ["Asthma – Ventolin in bag", "Eczema – sorbolene only", "Anaphylaxis action plan on file"];

interface FixedChild {
  first: string;
  surname: string;
  room: Room;
  dob: string;
  /** Weekdays (0–4) this child is NOT booked. */
  offDays: number[];
  guardian: string;
  startDate: string;
  ccsPercent: number;
  allergies?: string;
}

// Children that already appear elsewhere in the demo (designs, attendance
// list, CCS table) keep their names so every screen stays consistent.
const FIXED_CHILDREN: FixedChild[] = [
  { first: "Ava", surname: "Thompson", room: "Kindergarten", dob: "2022-06-14", offDays: [2, 4], guardian: "Sarah Thompson", startDate: "2025-02-03", ccsPercent: 56.25 },
  { first: "Leo", surname: "Nguyen", room: "Kindergarten", dob: "2022-09-02", offDays: [], guardian: "Anh Nguyen", startDate: "2024-07-15", ccsPercent: 60 },
  { first: "Mia", surname: "Patel", room: "Kindergarten", dob: "2022-04-21", offDays: [], guardian: "Deepa Patel", startDate: "2024-01-29", ccsPercent: 55, allergies: "Peanuts & tree nuts" },
  { first: "Oliver", surname: "Grant", room: "Kindergarten", dob: "2022-11-30", offDays: [], guardian: "Kate Grant", startDate: "2025-01-13", ccsPercent: 58.2 },
  { first: "Sophie", surname: "Kim", room: "Kindergarten", dob: "2022-08-09", offDays: [], guardian: "Jenna Kim", startDate: "2024-10-07", ccsPercent: 72 },
  { first: "Ethan", surname: "Wallace", room: "Kindergarten", dob: "2022-05-17", offDays: [], guardian: "Chris Wallace", startDate: "2024-03-04", ccsPercent: 64 },
  { first: "Harper", surname: "Brown", room: "Preschool", dob: "2021-07-11", offDays: [], guardian: "Rebecca Brown", startDate: "2023-08-21", ccsPercent: 65 },
];

function crnFor(seed: string) {
  const random = seededRandom(`crn-${seed}`);
  const digits = Array.from({ length: 9 }, () => Math.floor(random() * 10)).join("");
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}${"ABCDEFGHJK"[Math.floor(random() * 10)]}`;
}

function familyIdFor(surname: string) {
  return surname.toLowerCase().replace(/[^a-z]/g, "");
}

function buildChildren() {
  const random = seededRandom("little-explorer-children");
  const firstNames = [...FIRST_NAMES].sort(() => random() - 0.5);
  const surnames = [...SURNAMES].sort(() => random() - 0.5);
  const reference = new Date(2026, 8, 1);
  const children: EnrolledChild[] = [];
  let firstIndex = 0;
  let surnameIndex = 0;

  for (const room of attendanceRooms) {
    const config = roomConfig[room];
    const fixed = FIXED_CHILDREN.filter((child) => child.room === room);
    const roomChildren: { child: EnrolledChild; offDays: Set<number>; fixed: boolean }[] = [];

    for (const entry of fixed) {
      roomChildren.push({
        fixed: true,
        offDays: new Set(entry.offDays),
        child: {
          id: `${entry.first}-${entry.surname}`.toLowerCase(),
          firstName: entry.first,
          surname: entry.surname,
          name: `${entry.first} ${entry.surname}`,
          room,
          dob: entry.dob,
          familyId: familyIdFor(entry.surname),
          bookedDays: [],
          startDate: entry.startDate,
          ccsPercent: entry.ccsPercent,
          ccsStatus: "Active",
          crn: crnFor(entry.first + entry.surname),
          allergies: entry.allergies ?? null,
          medical: null,
        },
      });
    }

    while (roomChildren.length < config.enrolled) {
      const first = firstNames[firstIndex++ % firstNames.length];
      const surname = surnames[surnameIndex++ % surnames.length];
      const ageMonths =
        config.minAgeMonths + Math.floor(random() * (config.maxAgeMonths - config.minAgeMonths));
      const dob = addDays(new Date(reference.getFullYear(), reference.getMonth() - ageMonths, 1), Math.floor(random() * 28));
      const monthsEnrolled = Math.min(ageMonths - 4, 2 + Math.floor(random() * 30));
      const start = startOfWeek(new Date(reference.getFullYear(), reference.getMonth() - monthsEnrolled, 10));
      const statusRoll = random();
      roomChildren.push({
        fixed: false,
        offDays: new Set(),
        child: {
          id: `${first}-${surname}`.toLowerCase().replace(/[^a-z-]/g, ""),
          firstName: first,
          surname,
          name: `${first} ${surname}`,
          room,
          dob: toKey(dob),
          familyId: familyIdFor(surname),
          bookedDays: [],
          startDate: toKey(start),
          ccsPercent: Math.round((50 + random() * 40) * 4) / 4,
          ccsStatus: statusRoll < 0.9 ? "Active" : statusRoll < 0.96 ? "Pending CWA" : "Not claimed",
          crn: crnFor(first + surname),
          allergies: random() < 0.12 ? pick(random, ALLERGIES) : null,
          medical: random() < 0.08 ? pick(random, MEDICAL) : null,
        },
      });
    }

    // Spread "days off" so exactly `bookedPerDay` children are booked each weekday.
    const quota = config.enrolled - config.bookedPerDay;
    const flexible = roomChildren.filter((entry) => !entry.fixed);
    let pointer = 0;
    for (let day = 0; day < 5; day += 1) {
      let taken = roomChildren.filter((entry) => entry.offDays.has(day)).length;
      let guard = 0;
      while (taken < quota && guard < flexible.length * 2) {
        const entry = flexible[pointer % flexible.length];
        pointer += 1;
        guard += 1;
        if (!entry.offDays.has(day)) {
          entry.offDays.add(day);
          taken += 1;
        }
      }
    }

    for (const entry of roomChildren) {
      entry.child.bookedDays = [0, 1, 2, 3, 4].filter((day) => !entry.offDays.has(day));
      if (entry.child.ccsStatus === "Not claimed") entry.child.ccsPercent = 0;
      children.push(entry.child);
    }
  }

  return children;
}

export const enrolledChildren: EnrolledChild[] = buildChildren();
export const childById = Object.fromEntries(enrolledChildren.map((child) => [child.id, child]));
export const ava = childById["ava-thompson"];

export function childrenInRoom(room: Room) {
  return enrolledChildren.filter((child) => child.room === room);
}

function buildFamilies() {
  const map = new Map<string, FamilyAccount>();
  for (const child of enrolledChildren) {
    let family = map.get(child.familyId);
    if (!family) {
      const random = seededRandom(`family-${child.familyId}`);
      const fixed = FIXED_CHILDREN.find((entry) => familyIdFor(entry.surname) === child.familyId);
      const first = fixed ? fixed.guardian.split(" ")[0] : pick(random, GUARDIAN_NAMES);
      const guardian = `${first} ${child.surname}`;
      family = {
        id: child.familyId,
        surname: child.surname,
        guardian,
        email: `${first.toLowerCase()}.${child.familyId}@email.com`,
        phone: `04${Math.floor(random() * 10)}${Math.floor(random() * 10)} ${String(Math.floor(random() * 1000)).padStart(3, "0")} ${String(Math.floor(random() * 1000)).padStart(3, "0")}`,
        address: `${1 + Math.floor(random() * 120)} ${pick(random, STREETS)}, ${pick(random, SUBURBS)}`,
        children: [],
      };
      if (child.familyId === "thompson") {
        family.email = "sarah.thompson@email.com";
        family.phone = "0412 345 678";
        family.address = "14 Casuarina Drive, Nightcliff NT 0810";
      }
      map.set(child.familyId, family);
    }
    family.children.push(child);
  }
  return [...map.values()].sort((a, b) => a.surname.localeCompare(b.surname));
}

export const familyAccounts: FamilyAccount[] = buildFamilies();
export const familyById = Object.fromEntries(familyAccounts.map((family) => [family.id, family]));

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export type AttendanceStatus =
  | "Present"
  | "Checked out"
  | "Not checked in"
  | "Absent – notified"
  | "Absent – no notice"
  | "Not booked"
  | "Booked"
  | "Closed";

export interface AttendanceRecord {
  status: AttendanceStatus;
  checkIn: number | null;
  checkOut: number | null;
  checkInBy: string | null;
  checkOutBy: string | null;
  note: string | null;
  signedOff: boolean;
}

const ABSENCE_REASONS = ["Sick – parent notified", "Family holiday", "Medical appointment", "Unwell – parent called"];

function emptyRecord(status: AttendanceStatus): AttendanceRecord {
  return { status, checkIn: null, checkOut: null, checkInBy: null, checkOutBy: null, note: null, signedOff: false };
}

export function isBooked(child: EnrolledChild, date: Date) {
  if (isWeekend(date)) return false;
  if (date < fromKey(child.startDate)) return false;
  return child.bookedDays.includes(weekdayIndex(date));
}

export function getAttendance(child: EnrolledChild, date: Date, now: Now): AttendanceRecord {
  if (isWeekend(date)) return emptyRecord("Closed");
  if (!isBooked(child, date)) return emptyRecord("Not booked");

  const daysFromToday = diffInDays(date, now.today);
  if (daysFromToday > 0) return emptyRecord("Booked");

  const random = seededRandom(`att|${child.id}|${toKey(date)}`);
  const roll = random();
  const checkIn = 420 + Math.floor(random() * 135);
  const checkOut = 900 + Math.floor(random() * 165);
  const educators = roomEducators[child.room].map((member) => member.displayName);
  const recorders = ["Parent – kiosk", "Parent – kiosk", "Front Desk", ...educators];
  const checkInBy = pick(random, recorders);
  const checkOutBy = pick(random, recorders);
  const signedOff = random() < 0.9;

  if (roll < 0.05) {
    return { ...emptyRecord("Absent – notified"), note: pick(random, ABSENCE_REASONS) };
  }
  if (roll < 0.065) {
    return emptyRecord(daysFromToday < 0 ? "Absent – no notice" : "Not checked in");
  }

  const isToday = daysFromToday === 0;
  if (isToday && now.minutes < checkIn) return emptyRecord("Not checked in");
  if (isToday && now.minutes < checkOut) {
    return { status: "Present", checkIn, checkOut: null, checkInBy, checkOutBy: null, note: null, signedOff: false };
  }
  return { status: "Checked out", checkIn, checkOut, checkInBy, checkOutBy, note: null, signedOff };
}

/** End-of-day snapshot, used when looking at past dates. */
export function endOfDay(date: Date): Now {
  return { today: date, minutes: 24 * 60 };
}

export function attended(record: AttendanceRecord) {
  return record.status === "Present" || record.status === "Checked out";
}

/** The day the dashboard should describe (weekends fall back to Friday). */
export function operatingDay(today: Date) {
  const index = weekdayIndex(today);
  return index >= 5 ? addDays(today, 4 - index) : today;
}

export interface RoomDaySummary {
  room: Room;
  booked: number;
  present: number;
  checkedOut: number;
  notCheckedIn: number;
  absent: number;
  signedOff: number;
}

export function summariseRoomDay(room: Room, date: Date, now: Now): RoomDaySummary {
  const summary: RoomDaySummary = {
    room,
    booked: 0,
    present: 0,
    checkedOut: 0,
    notCheckedIn: 0,
    absent: 0,
    signedOff: 0,
  };
  for (const child of childrenInRoom(room)) {
    const record = getAttendance(child, date, now);
    if (record.status === "Not booked" || record.status === "Closed") continue;
    summary.booked += 1;
    if (record.status === "Present") summary.present += 1;
    if (record.status === "Checked out") summary.checkedOut += 1;
    if (record.status === "Not checked in" || record.status === "Booked") summary.notCheckedIn += 1;
    if (record.status.startsWith("Absent")) summary.absent += 1;
    if (record.signedOff || record.status === "Absent – notified") summary.signedOff += 1;
  }
  return summary;
}

// ---------------------------------------------------------------------------
// Learning portfolio (Family Portal – Ava)
// ---------------------------------------------------------------------------

export const eylfOutcomes = [
  "Identity",
  "Community",
  "Wellbeing",
  "Learning",
  "Communication",
] as const;
export type EylfOutcome = (typeof eylfOutcomes)[number];

export const eylfLabels: Record<EylfOutcome, string> = {
  Identity: "EYLF 1 · Strong sense of identity",
  Community: "EYLF 2 · Connected with their world",
  Wellbeing: "EYLF 3 · Strong sense of wellbeing",
  Learning: "EYLF 4 · Confident, involved learner",
  Communication: "EYLF 5 · Effective communicator",
};

interface ObservationTemplate {
  title: string;
  note: string;
  outcome: EylfOutcome;
  tags: string[];
  photos: number;
  nextStep?: string;
}

const OBSERVATION_TEMPLATES: ObservationTemplate[] = [
  { title: "Sensory play at the water table", note: "{name} explored pouring and measuring at the water table and shared the jugs with two friends, showing lovely turn-taking.", outcome: "Community", tags: ["Social skills", "Sharing"], photos: 2, nextStep: "Introduce measuring cups with volume markings." },
  { title: "Counting game", note: "During group time {name} confidently counted to 10 and helped a peer match numerals to groups of objects.", outcome: "Learning", tags: ["Numeracy", "Peer support"], photos: 1 },
  { title: "Obstacle course", note: "{name} climbed, balanced and jumped through the outdoor obstacle course, trying the high beam twice until she felt confident.", outcome: "Wellbeing", tags: ["Gross motor", "Resilience"], photos: 3 },
  { title: "Storytelling with puppets", note: "{name} used the puppet theatre to retell 'The Very Hungry Caterpillar', adding her own ending with a butterfly party.", outcome: "Communication", tags: ["Oral language", "Imagination"], photos: 2, nextStep: "Offer story stones to extend her retelling." },
  { title: "Painting at the easel", note: "{name} mixed blue and yellow and was delighted to discover green. She named her painting 'The Rainforest'.", outcome: "Learning", tags: ["Creative arts", "Colour mixing"], photos: 2 },
  { title: "Gardening group", note: "{name} helped water the vegetable patch and noticed the first tomatoes. She asked why some leaves were yellow.", outcome: "Community", tags: ["Sustainability", "Curiosity"], photos: 2, nextStep: "Research plant care together using picture books." },
  { title: "Block construction", note: "{name} worked with Leo to build a tall tower, testing which blocks made the strongest base.", outcome: "Learning", tags: ["Problem solving", "Collaboration"], photos: 1 },
  { title: "Letter recognition", note: "{name} found the letter 'A' in five places around the room and proudly told us it starts her name.", outcome: "Communication", tags: ["Literacy", "Phonics"], photos: 1 },
  { title: "Yoga and mindfulness", note: "{name} followed the animal yoga poses and chose 'sleepy koala' as her favourite calming pose.", outcome: "Wellbeing", tags: ["Self-regulation", "Body awareness"], photos: 1 },
  { title: "Dramatic play – the café", note: "{name} took orders at our pretend café, writing 'menus' with marks and letters and counting play money.", outcome: "Identity", tags: ["Role play", "Emergent writing"], photos: 2 },
  { title: "Music and movement", note: "{name} kept the beat with clapsticks and suggested a new verse for our 'Five Little Ducks' song.", outcome: "Communication", tags: ["Music", "Rhythm"], photos: 1 },
  { title: "Bug hunt", note: "{name} used a magnifying glass to find ants and a beetle, and drew what she saw in her nature journal.", outcome: "Learning", tags: ["Science", "Observation"], photos: 3, nextStep: "Set up a mini-beast hotel in the garden." },
  { title: "Helping at lunch", note: "{name} set the table for her group and served herself independently, trying the new vegetable curry.", outcome: "Wellbeing", tags: ["Independence", "Healthy eating"], photos: 1 },
  { title: "Acknowledgement of Country", note: "{name} joined our morning Acknowledgement of Country and talked about the Larrakia people and the sea.", outcome: "Identity", tags: ["Culture", "Belonging"], photos: 1 },
  { title: "Playdough creations", note: "{name} rolled, cut and shaped playdough into 'birthday cakes', counting candles for each friend.", outcome: "Learning", tags: ["Fine motor", "Numeracy"], photos: 2 },
  { title: "Comforting a friend", note: "When a friend was upset at drop-off, {name} brought them a book and sat with them — a beautiful moment of empathy.", outcome: "Identity", tags: ["Empathy", "Relationships"], photos: 0 },
];

const PORTFOLIO_AUTHORS = ["Ms. Lee", "Ms. Lee", "Mr. Diaz", "Ms. Brooks", "Ms. Park"];

export interface Observation {
  id: string;
  date: string;
  time: number;
  title: string;
  note: string;
  outcome: EylfOutcome;
  tags: string[];
  photos: number;
  author: string;
  nextStep?: string;
}

/** Two observations for each day the child attended (only those already posted today). */
export function getObservations(child: EnrolledChild, date: Date, now: Now): Observation[] {
  const record = getAttendance(child, date, now);
  if (!attended(record)) return [];
  const random = seededRandom(`obs|${child.id}|${toKey(date)}`);
  const first = Math.floor(random() * OBSERVATION_TEMPLATES.length);
  const second = (first + 1 + Math.floor(random() * (OBSERVATION_TEMPLATES.length - 1))) % OBSERVATION_TEMPLATES.length;
  const times = [570 + Math.floor(random() * 80), 810 + Math.floor(random() * 70)];
  const authors = [pick(random, PORTFOLIO_AUTHORS), pick(random, PORTFOLIO_AUTHORS)];
  const isToday = diffInDays(date, now.today) === 0;

  return [first, second]
    .map((templateIndex, index) => {
      const template = OBSERVATION_TEMPLATES[templateIndex];
      return {
        id: `${child.id}-${toKey(date)}-${index}`,
        date: toKey(date),
        time: times[index],
        title: template.title,
        note: template.note.replaceAll("{name}", child.firstName),
        outcome: template.outcome,
        tags: template.tags,
        photos: template.photos,
        author: authors[index],
        nextStep: template.nextStep,
      };
    })
    .filter((observation) => !isToday || observation.time <= now.minutes);
}

// ---------------------------------------------------------------------------
// Billing & CCS (Staff Portal)
// ---------------------------------------------------------------------------

export type ChargeStatus = "Paid" | "Due" | `Overdue – ${number} days`;

export interface ChargeLine {
  childName: string;
  room: Room;
  date: string;
  fee: number;
}

export interface FamilyCharge {
  family: FamilyAccount;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  lines: ChargeLine[];
  levy: number;
  grossFee: number;
  ccsSubsidy: number;
  balance: number;
  status: ChargeStatus;
  dueDate: string;
  paidWith: string | null;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const CURRENT_WEEK_OVERRIDES: Record<string, ChargeStatus> = {
  thompson: "Due",
  nguyen: "Paid",
  patel: "Overdue – 6 days",
  brown: "Paid",
  grant: "Due",
};

function weekStatus(familyId: string, weekStart: Date, today: Date): { status: ChargeStatus; paidWith: string | null } {
  const random = seededRandom(`pay|${familyId}|${toKey(weekStart)}`);
  const weeksAgo = Math.round(diffInDays(startOfWeek(today), weekStart) / 7);
  const roll = random();
  const method = pick(random, ["Direct debit", "Direct debit", "Card", "BPAY"]);
  const dueDate = addDays(weekStart, 14);
  const overdueDays = Math.max(1, diffInDays(today, dueDate));

  if (weeksAgo <= 0) {
    const override = CURRENT_WEEK_OVERRIDES[familyId];
    if (override) return { status: override, paidWith: override === "Paid" ? method : null };
    if (weeksAgo < 0) return { status: "Due", paidWith: null };
    return roll < 0.8 ? { status: "Paid", paidWith: method } : { status: "Due", paidWith: null };
  }
  if (familyId === "thompson") return { status: "Paid", paidWith: "Card" };
  if (weeksAgo === 1) {
    if (roll < 0.78) return { status: "Paid", paidWith: method };
    return diffInDays(today, dueDate) > 0
      ? { status: `Overdue – ${overdueDays} days`, paidWith: null }
      : { status: "Due", paidWith: null };
  }
  if (roll < 0.97) return { status: "Paid", paidWith: method };
  return { status: `Overdue – ${overdueDays} days`, paidWith: null };
}

/**
 * Charges for every family over `days` days starting at `start`. A 7-day
 * range starting on a Monday is a weekly invoice (includes the weekly levy).
 */
export function getFamilyCharges(start: Date, days: number, today: Date): FamilyCharge[] {
  const weekStart = startOfWeek(start);
  const isWeek = days === 7;
  const end = addDays(start, days - 1);

  return familyAccounts
    .map((family, familyIndex) => {
      const lines: ChargeLine[] = [];
      for (let offset = 0; offset < days; offset += 1) {
        const date = addDays(start, offset);
        for (const child of family.children) {
          if (isBooked(child, date)) {
            lines.push({ childName: child.name, room: child.room, date: toKey(date), fee: roomConfig[child.room].dailyFee });
          }
        }
      }
      if (lines.length === 0) return null;

      const levy = isWeek ? WEEKLY_LEVY : 0;
      const sessions = lines.reduce((sum, line) => sum + line.fee, 0);
      let ccsSubsidy = round2(
        lines.reduce((sum, line) => {
          const child = family.children.find((entry) => entry.name === line.childName);
          return sum + (line.fee * (child?.ccsPercent ?? 0)) / 100;
        }, 0),
      );
      const { status, paidWith } = weekStatus(family.id, weekStart, today);
      const weeksAgo = Math.round(diffInDays(startOfWeek(today), weekStart) / 7);
      if (family.id === "thompson" && isWeek && weeksAgo === 0) ccsSubsidy = 207.5;

      const grossFee = round2(sessions + levy);
      return {
        family,
        invoiceNumber: `INV-${toKey(weekStart).replaceAll("-", "").slice(2)}-${String(familyIndex + 101).padStart(3, "0")}`,
        periodStart: toKey(start),
        periodEnd: toKey(end),
        lines,
        levy,
        grossFee,
        ccsSubsidy,
        balance: round2(grossFee - ccsSubsidy),
        status,
        dueDate: toKey(addDays(weekStart, 14)),
        paidWith,
      } satisfies FamilyCharge;
    })
    .filter((charge): charge is FamilyCharge => charge !== null);
}

export function isUnpaid(status: ChargeStatus) {
  return status !== "Paid";
}

/** Outstanding current-week balance attributable to children in a room. */
export function outstandingForRoom(charges: FamilyCharge[], room: Room | null) {
  let total = 0;
  for (const charge of charges) {
    if (!isUnpaid(charge.status)) continue;
    if (!room) {
      total += charge.balance;
      continue;
    }
    const sessions = charge.lines.reduce((sum, line) => sum + line.fee, 0);
    const roomSessions = charge.lines.filter((line) => line.room === room).reduce((sum, line) => sum + line.fee, 0);
    if (sessions > 0) total += (charge.balance * roomSessions) / sessions;
  }
  return Math.round(total);
}

// ---------------------------------------------------------------------------
// Roster, leave & payroll (Staff Portal)
// ---------------------------------------------------------------------------

const ROSTER_EPOCH = new Date(2026, 0, 5); // a Monday

export function weekNumber(weekStart: Date) {
  return Math.round(diffInDays(weekStart, ROSTER_EPOCH) / 7);
}

export interface RosterCell {
  date: string;
  educators: StaffMember[];
  /** Staff removed by approved leave who still need cover. */
  onLeave: StaffMember[];
}

export interface RosterRow {
  room: Room;
  cells: RosterCell[];
}

/** Room staff on shift for a day: 3 of each room's 4 educators, rotating. */
function educatorsFor(room: Room, date: Date) {
  const pool = roomEducators[room];
  const day = weekdayIndex(date);
  const offIndex = (day + weekNumber(startOfWeek(date))) % 5;
  return pool.filter((_, index) => index !== offIndex);
}

export function getRoster(weekStart: Date, approvedLeave: LeaveRequest[] = []): RosterRow[] {
  return attendanceRooms.map((room) => ({
    room,
    cells: [0, 1, 2, 3, 4].map((offset) => {
      const date = addDays(weekStart, offset);
      const key = toKey(date);
      const scheduled = educatorsFor(room, date);
      const onLeave = scheduled.filter((member) =>
        approvedLeave.some(
          (request) => request.staffId === member.id && key >= request.start && key <= request.end,
        ),
      );
      return {
        date: key,
        educators: scheduled.filter((member) => !onLeave.includes(member)),
        onLeave,
      };
    }),
  }));
}

/** All staff working on a given day (room educators + centre-wide staff). */
export function staffOnShift(date: Date, room: Room | null = null) {
  if (isWeekend(date)) return [];
  if (room) return educatorsFor(room, date);
  const kowalskiDays = [0, 2, 4];
  const centreWide = staffMembers.filter(
    (member) =>
      member.room === null &&
      (member.id !== "kowalski" || kowalskiDays.includes(weekdayIndex(date))),
  );
  return [...attendanceRooms.flatMap((r) => educatorsFor(r, date)), ...centreWide];
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: "Annual leave" | "Sick leave" | "Personal leave" | "Professional development";
  start: string;
  end: string;
  submitted: string;
  reason: string;
  status: "Pending" | "Approved" | "Declined";
}

const LEAVE_TYPES: LeaveRequest["type"][] = ["Annual leave", "Sick leave", "Personal leave", "Professional development"];
const LEAVE_REASONS: Record<LeaveRequest["type"], string[]> = {
  "Annual leave": ["Family trip to Cairns", "School holidays with the kids", "Visiting family interstate"],
  "Sick leave": ["Medical certificate provided", "Flu – GP certificate attached"],
  "Personal leave": ["Moving house", "Family commitment"],
  "Professional development": ["NQS workshop – ACECQA", "Trauma-informed practice course", "First Aid refresher"],
};

export function getLeaveRequests(weekStart: Date, today: Date): LeaveRequest[] {
  const random = seededRandom(`leave|${toKey(weekStart)}`);
  const count = 2 + Math.floor(random() * 2);
  const candidates = staffMembers.filter((member) => member.room !== null);
  const used = new Set<string>();
  const requests: LeaveRequest[] = [];

  for (let i = 0; i < count; i += 1) {
    let member = pick(random, candidates);
    while (used.has(member.id)) member = pick(random, candidates);
    used.add(member.id);
    const type = pick(random, LEAVE_TYPES);
    const startOffset = Math.floor(random() * 5);
    const length = type === "Annual leave" ? 1 + Math.floor(random() * 3) : 1;
    const start = addDays(weekStart, startOffset);
    const end = addDays(start, Math.min(length, 5 - startOffset) - 1);
    const submitted = addDays(start, type === "Sick leave" ? -1 : -(7 + Math.floor(random() * 14)));
    const decisionRoll = random();
    const decision = decisionRoll < 0.85 ? "Approved" : "Declined";
    const status: LeaveRequest["status"] =
      start <= today
        ? decision
        : i === 0 || diffInDays(today, submitted) <= 3
          ? "Pending"
          : decision;
    requests.push({
      id: `leave-${toKey(weekStart)}-${i}`,
      staffId: member.id,
      type,
      start: toKey(start),
      end: toKey(end),
      submitted: toKey(submitted),
      reason: pick(random, LEAVE_REASONS[type]),
      status,
    });
  }
  return requests.sort((a, b) => a.start.localeCompare(b.start));
}

export function formatLeaveDates(request: LeaveRequest) {
  const start = fromKey(request.start);
  const end = fromKey(request.end);
  return request.start === request.end
    ? formatShort(start)
    : `${start.getDate()}–${formatShort(end)}`;
}

const PAY_EPOCH = new Date(2026, 0, 5);
export const SUPER_RATE = 0.12;
const SHIFT_HOURS = 7.6;

export interface PayPeriod {
  start: Date;
  end: Date;
  payDate: Date;
  index: number;
}

export function getPayPeriod(date: Date): PayPeriod {
  const index = Math.floor(diffInDays(date, PAY_EPOCH) / 14);
  const start = addDays(PAY_EPOCH, index * 14);
  const end = addDays(start, 13);
  return { start, end, payDate: addDays(end, 4), index };
}

export interface PayrollLine {
  member: StaffMember;
  shifts: number;
  hours: number;
  gross: number;
  superannuation: number;
}

export function getPayroll(period: PayPeriod): PayrollLine[] {
  return staffMembers.map((member) => {
    let shifts = 0;
    for (let offset = 0; offset < 14; offset += 1) {
      const date = addDays(period.start, offset);
      if (staffOnShift(date).some((entry) => entry.id === member.id)) shifts += 1;
    }
    const random = seededRandom(`overtime|${member.id}|${period.index}`);
    const extra = member.employment === "Casual" ? 0 : Math.round(random() * 4) / 2;
    const hours = Math.round((shifts * SHIFT_HOURS + extra) * 10) / 10;
    const gross = round2(hours * member.hourlyRate);
    return { member, shifts, hours, gross, superannuation: round2(gross * SUPER_RATE) };
  });
}

export function payrollTotals(lines: PayrollLine[]) {
  return lines.reduce(
    (totals, line) => ({
      hours: Math.round((totals.hours + line.hours) * 10) / 10,
      gross: round2(totals.gross + line.gross),
      superannuation: round2(totals.superannuation + line.superannuation),
    }),
    { hours: 0, gross: 0, superannuation: 0 },
  );
}
