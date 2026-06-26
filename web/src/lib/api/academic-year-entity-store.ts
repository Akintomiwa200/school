import {
  ADMIN_ACADEMIC_YEARS,
  type AcademicYearRecord,
  type TermRecord,
} from "@/components/dashboard/admin/admin-entities-data";
import { getMutableClasses } from "@/lib/api/admin-entity-store";

let academicYears: AcademicYearRecord[] = [...ADMIN_ACADEMIC_YEARS];

function splitDateRange(startDate: string, endDate: string, termCount: number): TermRecord[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const span = end - start;
  const chunk = Math.floor(span / termCount);

  return Array.from({ length: termCount }, (_, index) => {
    const termStart = new Date(start + chunk * index);
    const termEnd = new Date(index === termCount - 1 ? end : start + chunk * (index + 1) - 86400000);
    return {
      id: `term-${Date.now()}-${index}`,
      name: `Term ${index + 1}`,
      startDate: termStart.toISOString().slice(0, 10),
      endDate: termEnd.toISOString().slice(0, 10),
      status: "upcoming" as const,
    };
  });
}

export function getMutableAcademicYears() {
  return academicYears;
}

export function getAcademicYearById(id: string) {
  return academicYears.find((year) => year.id === id);
}

export function getCurrentAcademicYear() {
  return academicYears.find((year) => year.status === "active");
}

export function getClassesForAcademicYear(academicYearId: string) {
  return getMutableClasses().filter((c) => (c.academicYearId ?? "ay1") === academicYearId);
}

export function addAcademicYear(input: {
  name: string;
  startDate: string;
  endDate: string;
  termCount?: number;
}): AcademicYearRecord {
  const terms = splitDateRange(input.startDate, input.endDate, input.termCount ?? 3);
  const record: AcademicYearRecord = {
    id: `ay${Date.now()}`,
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "upcoming",
    terms,
  };
  academicYears = [record, ...academicYears];
  return record;
}

export function setCurrentAcademicYear(id: string) {
  const target = academicYears.find((year) => year.id === id);
  if (!target) return null;

  academicYears = academicYears.map((year) => {
    if (year.id === id) return { ...year, status: "active" as const };
    if (year.status === "active") return { ...year, status: "archived" as const };
    return year;
  });

  return academicYears.find((year) => year.id === id) ?? null;
}

export function updateAcademicYear(id: string, patch: Partial<Omit<AcademicYearRecord, "id">>) {
  if (!academicYears.some((year) => year.id === id)) return null;
  academicYears = academicYears.map((year) => (year.id === id ? { ...year, ...patch } : year));
  return academicYears.find((year) => year.id === id) ?? null;
}

export function addTerm(
  academicYearId: string,
  input: { name: string; startDate: string; endDate: string; status?: TermRecord["status"] },
) {
  const year = academicYears.find((item) => item.id === academicYearId);
  if (!year) return null;

  const term: TermRecord = {
    id: `term-${Date.now()}`,
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status ?? "upcoming",
  };

  const updated: AcademicYearRecord = { ...year, terms: [...year.terms, term] };
  academicYears = academicYears.map((item) => (item.id === academicYearId ? updated : item));
  return updated;
}

export function updateTerm(academicYearId: string, termId: string, patch: Partial<TermRecord>) {
  const year = academicYears.find((item) => item.id === academicYearId);
  if (!year) return null;

  const updated: AcademicYearRecord = {
    ...year,
    terms: year.terms.map((term) => (term.id === termId ? { ...term, ...patch } : term)),
  };
  academicYears = academicYears.map((item) => (item.id === academicYearId ? updated : item));
  return updated;
}

export function setActiveTerm(academicYearId: string, termId: string) {
  const year = academicYears.find((item) => item.id === academicYearId);
  if (!year) return null;

  const updated: AcademicYearRecord = {
    ...year,
    terms: year.terms.map((term) => {
      if (term.id === termId) return { ...term, status: "active" as const };
      if (term.status === "active") return { ...term, status: "completed" as const };
      return term;
    }),
  };
  academicYears = academicYears.map((item) => (item.id === academicYearId ? updated : item));
  return updated;
}
