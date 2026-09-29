export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Australian mobile or landline, with or without spaces / +61. */
export function isValidPhone(value: string) {
  const digits = value.replace(/[\s()-]/g, "");
  return /^(\+?61|0)[2-478]\d{8}$/.test(digits);
}

export function maskEmail(value: string) {
  const [user, domain] = value.trim().split("@");
  if (!domain) return value;
  return `${user.slice(0, 1)}${"•".repeat(Math.max(user.length - 1, 3))}@${domain}`;
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return `•••• ••• ${digits.slice(-3)}`;
}
