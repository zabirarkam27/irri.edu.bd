import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/utils/catchAsync";

const escapeText = (text: string) => text.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
const timestamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

function foldLine(line: string) {
  let folded = "";
  let bytes = 0;
  for (const point of line) {
    const width = Buffer.byteLength(point);
    if (bytes + width > 75) {
      folded += "\r\n ";
      bytes = 1;
    }
    folded += point;
    bytes += width;
  }
  return folded;
}

export const downloadAcademicCalendar = catchAsync(async (_req, res) => {
  const entries = await prisma.event.findMany({
    where: { status: "PUBLISHED", academicCalendar: true },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    select: { id: true, title: true, content: true, venue: true, startsAt: true, endsAt: true, updatedAt: true }
  });
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IRRI//Academic Calendar//EN", "CALSCALE:GREGORIAN",
    ...entries.flatMap((entry) => [
      "BEGIN:VEVENT", `UID:${entry.id}@irri.edu.bd`, `DTSTAMP:${timestamp(entry.updatedAt)}`, `DTSTART:${timestamp(entry.startsAt)}`,
      ...(entry.endsAt && entry.endsAt > entry.startsAt ? [`DTEND:${timestamp(entry.endsAt)}`] : []),
      `SUMMARY:${escapeText(entry.title)}`, `DESCRIPTION:${escapeText(entry.content)}`,
      ...(entry.venue ? [`LOCATION:${escapeText(entry.venue)}`] : []), "END:VEVENT"
    ]), "END:VCALENDAR"];
  res.set({ "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="irri-academic-calendar.ics"', "Cache-Control": "no-store" });
  res.send(lines.map(foldLine).join("\r\n") + "\r\n");
});
