import { create } from "zustand";
import { api } from "../lib/axiosInstance"; // Update this path to match your axios file location

export interface File {
  id: string;
  name: string;
  type: string;
  content: string;
  roomId?: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFileData {
  name: string;
  type: string;
  roomId?: string;
  projectId?: string;
}

export interface UpdateFileData {
  id: string;
  name?: string;
  type?: string;
  content?: string;
  roomId?: string;
  projectId?: string;
}

interface FileState {
  files: File[];
  activeFile: File | null;
  fileLoading: boolean;
  filesLoading: boolean;
  fileActionLoading: boolean;
  error: string | null;

  // File API methods
  getFile: (fileId: string) => Promise<void>;
  getFilesByRoom: (roomId: string) => Promise<void>;
  getFilesByProject: (projectId: string) => Promise<void>;
  createFile: (fileData: CreateFileData) => Promise<string>;
  updateFile: (fileData: UpdateFileData) => Promise<void>;
  updateFileName: (fileId: string, newName: string) => Promise<void>;
  updateFileContent: (fileId: string, content: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;

  // Local state methods
  setActiveFile: (file: File | null) => void;
  clearError: () => void;
  clearFiles: () => void;
}

const useFileStore = create<FileState>((set, get) => ({
  files: [],
  activeFile: null,
  fileLoading: false,
  filesLoading: false,
  fileActionLoading: false,
  error: null,

  getFile: async (fileId: string) => {
    set({ fileLoading: true, error: null });
    try {
      const response = await api.get(`/files/${fileId}`);
      const file = response.data as File;

      set({
        activeFile: file,
        fileLoading: false
      });

      // Also update the file in the files array if it exists
      set((state) => ({
        files: state.files.map(f => f.id === fileId ? file as File : f)
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch file";
      set({
        error: errorMessage,
        fileLoading: false
      });
      throw error;
    } finally {
      set({ fileLoading: false });
    }
  },

  getFilesByRoom: async (roomId: string) => {
    set({ filesLoading: true, error: null });
    try {
      const response = await api.get(`/rooms/${roomId}/files`);
      const files = response.data as File[];

      set({
        files,
        filesLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch room files";
      set({
        error: errorMessage,
        filesLoading: false
      });
      throw error;
    }
  },

  getFilesByProject: async (projectId: string) => {
    set({ filesLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/files`);
      const files = response.data as File[];

      set({
        files,
        filesLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch project files";
      set({
        error: errorMessage,
        filesLoading: false
      });
      throw error;
    }
  },

  createFile: async (fileData: CreateFileData) => {
    set({ fileActionLoading: true, error: null });
    try {
      const response = await api.post(`/files`, { ...fileData });
      const newFile = response.data as File;

      set((state) => ({
        files: [...state.files, newFile],
        fileActionLoading: false
      }));

      return newFile.id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to create file";
      set({
        error: errorMessage,
        fileActionLoading: false
      });
      throw error;
    }
  },

  updateFile: async (fileData: UpdateFileData) => {
    set({ fileActionLoading: true, error: null });
    try {
      const response = await api.put(`/files/${fileData.id}`, { name: fileData.name, type: fileData.type, content: fileData.content, roomId: fileData.roomId, projectId: fileData.projectId });
      const updatedFile = response.data as File;

      set((state) => ({
        files: state.files.map(f => f.id === updatedFile.id ? updatedFile : f),
        activeFile: state.activeFile?.id === updatedFile.id ? updatedFile : state.activeFile,
        fileActionLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to update file";
      set({
        error: errorMessage,
        fileActionLoading: false
      });
      throw error;
    }
  },

  updateFileName: async (fileId: string, newName: string) => {
    const currentFile = get().activeFile;
    if (!currentFile || currentFile.id !== fileId) {
      // Try to find file in files array
      const fileInArray = get().files.find(f => f.id === fileId);
      if (!fileInArray) {
        set({ error: "File not found" });
        return;
      }
    }

    await get().updateFile({
      id: fileId,
      name: newName
    });
  },

  updateFileContent: async (fileId: string, content: string) => {
    const currentFile = get().activeFile;
    const originalFiles = get().files;

    if (currentFile && currentFile.id === fileId) {
      set({
        activeFile: { ...currentFile, content }
      });
    }

    // Also update in files array
    set((state) => ({
      files: state.files.map(f =>
        f.id === fileId ? { ...f, content } : f
      )
    }));

    try {
      await get().updateFile({
        id: fileId,
        content
      });
    } catch (error: any) {
      // Revert optimistic updates on error
      console.error("Failed to update file content:", error.message);
      if (currentFile && currentFile.id === fileId) {
        set({
          activeFile: currentFile,
          files: originalFiles
        });
      }
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    set({ fileActionLoading: true, error: null });
    try {
      await api.delete(`/files/${fileId}`);

      set((state) => ({
        files: state.files.filter(f => f.id !== fileId),
        activeFile: state.activeFile?.id === fileId ? null : state.activeFile,
        fileActionLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete file";
      set({
        error: errorMessage,
        fileActionLoading: false
      });
      throw error;
    }
  },

  setActiveFile: (file: File | null) => {
    set({ activeFile: file });
  },

  clearError: () => {
    set({ error: null });
  },

  clearFiles: () => {
    set({ files: [], activeFile: null });
  }
}));

export default useFileStore;