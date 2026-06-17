import type { UserRole } from "./index";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  address?: string;
  dateOfBirth?: Date;
  gender?: string;
  bio?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}
