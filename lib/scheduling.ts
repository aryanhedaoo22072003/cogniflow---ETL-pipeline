/**
 * Computes the next UTC instant that corresponds to a given wall-clock time
 * ("HH:mm") in a given IANA timezone (e.g. "Asia/Kolkata", "America/New_York").
 *
 * JS Dates are always UTC internally, so "9am in Mumbai" has to be converted
 * to the right UTC instant — and that offset changes across DST boundaries in
 * timezones that observe it. This uses the standard "guess, then correct"
 * trick with Intl.DateTimeFormat rather than pulling in a date library.
 * Accurate to the minute, which is all a scheduler needs.
 */
export function nextDailyRunUTC(timeZone: string, timeOfDay: string, from: Date = new Date()): Date {
  const [hh, mm] = timeOfDay.split(":").map(Number);

  function offsetMinutesAt(utcGuess: Date): number {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(utcGuess);
    const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
    const asIfUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
    return (asIfUTC - utcGuess.getTime()) / 60000;
  }

  const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const todayParts = dayFmt.formatToParts(from);
  const y = Number(todayParts.find((p) => p.type === "year")!.value);
  const mo = Number(todayParts.find((p) => p.type === "month")!.value);
  const d = Number(todayParts.find((p) => p.type === "day")!.value);

  function candidateFor(day: number): Date {
    const guess = new Date(Date.UTC(y, mo - 1, day, hh, mm, 0));
    const offset = offsetMinutesAt(guess);
    return new Date(guess.getTime() - offset * 60000);
  }

  let result = candidateFor(d);
  if (result.getTime() <= from.getTime()) {
    result = candidateFor(d + 1);
  }
  return result;
}

export const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "Europe/London", label: "UK (GMT/BST)" },
  { value: "Europe/Berlin", label: "Central Europe" },
  { value: "Asia/Dubai", label: "UAE (Gulf)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Japan" },
  { value: "Australia/Sydney", label: "Australia East" },
];