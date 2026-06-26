import {
  ADMIN_STAFF,
  type StaffRecord,
  type StaffRole,
} from "@/components/dashboard/admin/admin-entities-data";
import { getMutableClasses } from "@/lib/api/admin-entity-store";

let staff: StaffRecord[] = [...ADMIN_STAFF];

function nextEmployeeId() {
  const seq = staff.length + 1;
  return `EMP-${String(1000 + seq)}`;
}

export function getMutableStaff() {
  return staff;
}

export function getStaffById(id: string) {
  return staff.find((member) => member.id === id);
}

export function getStaffAssignedClasses(member: StaffRecord) {
  return getMutableClasses().filter((c) => c.homeroomTeacher === member.name);
}

export function addStaff(input: {
  name: string;
  role: StaffRole;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  status?: StaffRecord["status"];
  employeeId?: string;
}): StaffRecord {
  const record: StaffRecord = {
    id: `st${Date.now()}`,
    employeeId: input.employeeId ?? nextEmployeeId(),
    name: input.name,
    role: input.role,
    designation: input.designation,
    department: input.department,
    email: input.email,
    phone: input.phone,
    joiningDate: input.joiningDate,
    status: input.status ?? "active",
  };
  staff = [record, ...staff];
  return record;
}

export function updateStaff(id: string, patch: Partial<StaffRecord>) {
  if (!staff.some((member) => member.id === id)) return null;
  staff = staff.map((member) => (member.id === id ? { ...member, ...patch } : member));
  return staff.find((member) => member.id === id) ?? null;
}
