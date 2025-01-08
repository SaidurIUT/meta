// src/services/docsService.ts
import { privateAxios } from "./axiosConfig";

export const docsService = {
  // Create a new document
  createDoc: async (doc: {
    title: string;
    content: string;
    teamId: string;
    officeId: string;
    parentId?: string | null;
  }) => {
    const response = await privateAxios.post("/ds/v1/docs", doc);
    return response.data;
  },

  // Get all documents
  getAllDocs: async () => {
    const response = await privateAxios.get("/ds/v1/docs");
    return response.data;
  },

  // Get a document by ID
  getDocById: async (docId: string) => {
    const response = await privateAxios.get(`/ds/v1/docs/${docId}`);
    return response.data;
  },

  // Update a document
  updateDoc: async (
    docId: string,
    updatedData: {
      title: string;
      content: string;
    }
  ) => {
    const response = await privateAxios.put(
      `/ds/v1/docs/${docId}`,
      updatedData
    );
    return response.data;
  },

  // Delete a document
  deleteDoc: async (docId: string) => {
    const response = await privateAxios.delete(`/ds/v1/docs/${docId}`);
    return response.data;
  },

  // Get documents by team ID
  getDocsByTeamId: async (teamId: string) => {
    const response = await privateAxios.get(`/ds/v1/docs/team/${teamId}`);
    return response.data;
  },

  // Get documents by office ID
  getDocsByOfficeId: async (officeId: string) => {
    const response = await privateAxios.get(`/ds/v1/docs/office/${officeId}`);
    return response.data;
  },

  // Search documents by title
  searchDocs: async (query: string) => {
    const response = await privateAxios.get("/ds/v1/docs/search", {
      params: { query },
    });
    return response.data;
  },

  // Move a document to a new parent
  moveDoc: async (docId: string, newParentId: string) => {
    const response = await privateAxios.post(
      `/ds/v1/docs/${docId}/move/${newParentId}`
    );
    return response.data;
  },
};
