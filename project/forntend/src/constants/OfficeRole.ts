// src/constants/officeRoles.ts

export interface OfficeRole {
  id: number;
  name: string;
}

export const OFFICE_ROLES: OfficeRole[] = [

  { id: 101, name: "Admin" },
  { id: 102, name: "Manager" },
  { id: 103, name: "Employee" },
  { id: 104, name: "Guest" },
  { id: 105, name: "Customer" },
  { id: 106, name: "Vendor" },
];
