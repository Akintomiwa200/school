import {
  ADMIN_SUBJECTS,
  type SubjectRecord,
} from "@/components/dashboard/admin/admin-entities-data";
import { getStaffById } from "@/lib/api/staff-entity-store";
import type { StaffRecord } from "@/components/dashboard/admin/admin-entities-data";

let subjects: SubjectRecord[] = [...ADMIN_SUBJECTS];

function nextSubjectCode(department: string) {
  const prefix = department.slice(0, 3).toUpperCase();
  const seq = subjects.length + 1;
  return `${prefix}-${String(100 + seq)}`;
}

export type SubjectDetail = SubjectRecord & {
  assignedTeachers: StaffRecord[];
  teacherCount: number;
};

export function enrichSubject(subject: SubjectRecord): SubjectDetail {
  const assignedTeachers = subject.assignedTeacherIds
    .map((id) => getStaffById(id))
    .filter((member): member is StaffRecord => Boolean(member));
  return {
    ...subject,
    assignedTeachers,
    teacherCount: assignedTeachers.length,
  };
}

export function getMutableSubjects() {
  return subjects;
}

export function getSubjectById(id: string) {
  return subjects.find((subject) => subject.id === id);
}

export function getSubjectDetailById(id: string) {
  const subject = getSubjectById(id);
  return subject ? enrichSubject(subject) : null;
}

export function getSubjectsByDepartment(department: string) {
  return subjects.filter((subject) => subject.department === department && subject.status === "active");
}

export function addSubject(input: {
  code?: string;
  name: string;
  description: string;
  credits: number;
  department: string;
  gradeLevels: string[];
  status?: SubjectRecord["status"];
  assignedTeacherIds?: string[];
}): SubjectRecord {
  const record: SubjectRecord = {
    id: `sub${Date.now()}`,
    code: input.code ?? nextSubjectCode(input.department),
    name: input.name,
    description: input.description,
    credits: input.credits,
    department: input.department,
    gradeLevels: input.gradeLevels,
    status: input.status ?? "active",
    assignedTeacherIds: input.assignedTeacherIds ?? [],
  };
  subjects = [record, ...subjects];
  return record;
}

export function updateSubject(id: string, patch: Partial<SubjectRecord>) {
  if (!subjects.some((subject) => subject.id === id)) return null;
  subjects = subjects.map((subject) => (subject.id === id ? { ...subject, ...patch } : subject));
  return subjects.find((subject) => subject.id === id) ?? null;
}

export function assignTeacher(subjectId: string, staffId: string) {
  const subject = getSubjectById(subjectId);
  if (!subject || subject.assignedTeacherIds.includes(staffId)) return null;
  return updateSubject(subjectId, {
    assignedTeacherIds: [...subject.assignedTeacherIds, staffId],
  });
}

export function removeTeacher(subjectId: string, staffId: string) {
  const subject = getSubjectById(subjectId);
  if (!subject) return null;
  return updateSubject(subjectId, {
    assignedTeacherIds: subject.assignedTeacherIds.filter((id) => id !== staffId),
  });
}
