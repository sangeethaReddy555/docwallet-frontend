import apiClient from "./apiClient";

export const documentService = {
  list: () => apiClient.get("/documents/list"),

  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/documents/upload", formData, { isFormData: true });
  },

  remove: (documentId) => apiClient.post("/documents/delete", { documentId }),

  rename: (documentId, newName) => apiClient.post("/documents/update", { documentId, newName }),

  fetchFile: (documentId, download = false) => {
    const flag = download ? "1" : "0";
    return apiClient.blob(`/documents/view?documentId=${encodeURIComponent(documentId)}&download=${flag}`);
  },
};

