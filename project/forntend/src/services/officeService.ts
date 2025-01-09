// src/services/officeService.ts
import { privateAxios } from "./axiosConfig";

// Define TypeScript interfaces for Office and related data
export interface Office {
  id: string;
  name: string;
  physicalAddress: string;
  helpCenterNumber: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  description: string;
}

export interface CreateOfficeData {
  name: string;
  physicalAddress: string;
  helpCenterNumber: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  description: string;
}

export interface UpdateOfficeData {
  name?: string;
  physicalAddress?: string;
  helpCenterNumber?: string;
  email?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export const officeService = {
  // Create a new office
  createOffice: async (office: CreateOfficeData): Promise<Office> => {
    const response = await privateAxios.post("/os/v1/office", office);
    return response.data;
  },

  // Get an office by ID
  getOffice: async (id: string): Promise<Office> => {
    const response = await privateAxios.get(`/os/v1/office/${id}`);
    return response.data;
  },

  // Update an existing office
  updateOffice: async (
    id: string,
    office: UpdateOfficeData
  ): Promise<Office> => {
    const response = await privateAxios.put(`/os/v1/office/${id}`, office);
    return response.data;
  },

  // Delete an office by ID
  deleteOffice: async (id: string): Promise<void> => {
    await privateAxios.delete(`/os/v1/office/${id}`);
  },

  // Get all offices
  getAllOffices: async (): Promise<Office[]> => {
    const response = await privateAxios.get("/os/v1/office");
    return response.data;
  },

  // Get offices associated with the authenticated user
  getOfficesByUserId: async (): Promise<Office[]> => {
    const response = await privateAxios.get("/os/v1/office/user");
    return response.data;
  },
};