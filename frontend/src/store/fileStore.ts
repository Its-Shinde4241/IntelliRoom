import { create } from "zustand";

export interface File {
  id: string;
  name: string;  // includes extension
  type: string;  // e.g., "html", "css", "js"
  content: string;
  roomId?: string;
  projectId?: string;
  language?: string;  // Used for syntax highlighting
  lastModified?: Date;
}

interface FileState {
  files: File[];  // All files
  activeFile: File | null;
  loading: boolean;
  error: string | null;
  getFile: (fileId: string) => Promise<void>;
  getFilesByRoom: (roomId: string) => Promise<void>;
  getFilesByProject: (projectId: string) => Promise<void>;
  updateFileName: (fileId: string, newName: string) => Promise<void>;
  updateFileContent: (fileId: string, content: string) => Promise<void>;
  createFile: (file: Omit<File, 'id'>) => Promise<string>;
  deleteFile: (fileId: string) => Promise<void>;
  clearError: () => void;
}

const useFileStore = create<FileState>((set, get) => ({
  files: [],
  activeFile: null,
  loading: false,
  error: null,

  getFile: async (fileId: string) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const file = {
        id: fileId,
        name: 'example.js',
        type: 'javascript',
        content: '// Your code here',
        roomId: '123',
        language: 'javascript',
        lastModified: new Date()
      };
      set({ activeFile: file, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getFilesByRoom: async (roomId: string) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const roomFiles = [
        {
          id: '1',
          name: 'index.html',
          type: 'html',
          content: '',
          roomId,
          language: 'html',
          lastModified: new Date()
        },
        {
          id: '2',
          name: 'styles.css',
          type: 'css',
          content: '',
          roomId,
          language: 'css',
          lastModified: new Date()
        }
      ];
      set({ files: roomFiles, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getFilesByProject: async (projectId: string) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const projectFiles = [
        {
          id: '1',
          type: 'html',
          name: 'index.html',
          content: '',
          projectId,
          language: 'html',
          lastModified: new Date()
        },
        {
          id: '2',
          type: 'css',
          name: 'styles.css',
          content: '',
          projectId,
          language: 'css',
          lastModified: new Date()
        }
      ];
      set({ files: projectFiles, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateFileName: async (fileId: string, newName: string) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const currentFile = get().activeFile;
      if (currentFile && currentFile.id === fileId) {
        set({
          activeFile: { ...currentFile, name: newName },
          loading: false
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateFileContent: async (fileId: string, content: string) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const currentFile = get().activeFile;
      if (currentFile && currentFile.id === fileId) {
        set({
          activeFile: { ...currentFile, content },
          loading: false
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createFile: async (file: Omit<File, 'id'>) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const newId = Math.random().toString();
      const newFile = {
        ...file,
        id: newId,
        lastModified: new Date()
      };
      set(state => ({ 
        files: [...state.files, newFile],
        loading: false 
      }));
      return newId;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      set(state => ({ 
        files: state.files.filter(f => f.id !== fileId),
        activeFile: state.activeFile?.id === fileId ? null : state.activeFile,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useFileStore;