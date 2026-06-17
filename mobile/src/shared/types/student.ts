export interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  classId: string;
  sectionId?: string;
  rollNumber?: string;
  parentId?: string;
  dateOfAdmission: Date;
  bloodGroup?: string;
  emergencyContact?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Parent {
  id: string;
  userId: string;
  occupation?: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: Date;
  salary?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  academicYearId: string;
  classTeacherId?: string;
  capacity: number;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  classId?: string;
  teacherId?: string;
}
