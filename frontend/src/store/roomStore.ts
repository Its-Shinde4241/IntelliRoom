import { create } from "zustand";
import { type File } from './fileStore';
import { api } from '@/lib/axiosInstance';
import { toast } from "sonner";

type FileInfo = {
  id: string;
  name: string;
  type: string;
}
interface Room {
  id: string;
  name: string; // Changed from 'title' to match backend
  password?: string;
  userId: string;
  files: FileInfo[];
  createdAt?: string;
  updatedAt?: string;
}

interface RoomState {
  rooms: Room[];
  activeRoom: Room | null;
  roomsLoading: boolean;
  roomLoading: boolean;
  roomActionLoading: boolean;
  error: string | null;

  getUserRooms: (userId: string) => Promise<void>;
  getRoom: (roomId: string) => Promise<void>;
  createRoom: (name: string, password?: string) => Promise<void>;
  updateRoom: (roomId: string, updates: { name?: string; password?: string }) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;

  getRoomFiles: (roomId: string) => Promise<void>;
  updateFileInRoom: (fileId: string, updates: Partial<FileInfo>) => void;
  removeFileFromRoom: (fileId: string) => void;
  addFileToRoom: (roomId: string, file: FileInfo) => void;

  clearError: () => void;
  clearRooms: () => void;
}

const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  roomsLoading: false,
  roomLoading: false,
  roomActionLoading: false,
  error: null,

  getUserRooms: async (userId: string) => {
    try {
      set({ roomsLoading: true, error: null });
      const response = await api.get<Room[]>(`/rooms/user/${userId}`);
      set({ rooms: response.data });
      // toast.success("Rooms loaded successfully", { duration: 2000, style: { width: "auto", minWidth: "fit-content", padding: 10 }, });
    } catch (error) {
      toast.error("Failed to fetch rooms", { duration: 2000, style: { width: "auto", minWidth: "fit-content", padding: 10 }, });
      set({ error: error instanceof Error ? error.message : 'Failed to fetch rooms' });
    } finally {
      set({ roomsLoading: false });
    }
  },

  getRoom: async (roomId: string) => {
    try {
      set({ roomLoading: true, error: null });
      const response = await api.get<Room>(`/rooms/${roomId}`);
      set({ activeRoom: response.data });

      const rooms = get().rooms;
      const updatedRooms = rooms.map(room =>
        room.id === roomId ? response.data : room
      );
      set({ rooms: updatedRooms });
      toast.success("Room loaded successfully");
    } catch (error) {
      toast.error("Failed to fetch room");
      set({ error: error instanceof Error ? error.message : 'Failed to fetch room' });
    } finally {
      set({ roomLoading: false });
    }
  },

  createRoom: async (name: string, password?: string) => {
    try {
      set({ roomActionLoading: true, error: null });
      const response = await api.post<Room>('/rooms', {
        name,
        password,
      });
      const newRoom = {
        ...response.data,
        files: response.data.files || [] // Initialize files as empty array if undefined
      };
      const rooms = get().rooms;
      set({ rooms: [...rooms, newRoom] });
      toast.success(`Room "${name}" created successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error; // Re-throw to allow caller to handle
    } finally {
      set({ roomActionLoading: false });
    }
  },

  updateRoom: async (roomId: string, updates: { name?: string; password?: string }) => {
    try {
      set({ roomActionLoading: true, error: null });
      const response = await api.put<Room>(`/rooms/${roomId}`, updates);

      const rooms = get().rooms.map(room =>
        room.id === roomId ? { ...room, ...response.data } : room
      );
      set({ rooms });

      if (get().activeRoom?.id === roomId) {
        set({ activeRoom: { ...get().activeRoom!, ...response.data } });
      }
      toast.success("Room updated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ roomActionLoading: false });
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      set({ roomActionLoading: true, error: null });
      const roomName = get().rooms.find(room => room.id === roomId)?.name || 'Room';
      await api.delete(`/rooms/${roomId}`);

      const rooms = get().rooms.filter(room => room.id !== roomId);
      set({ rooms });

      if (get().activeRoom?.id === roomId) {
        set({ activeRoom: null });
      }
      toast.success(`"${roomName}" deleted successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ roomActionLoading: false });
    }
  },

  getRoomFiles: async (roomId: string) => {
    try {
      set({ roomLoading: true, error: null });
      const response = await api.get<File[]>(`/rooms/${roomId}/files`);

      if (get().activeRoom?.id === roomId) {
        set({ activeRoom: { ...get().activeRoom!, files: response.data } });
      }

      const rooms = get().rooms.map(room =>
        room.id === roomId ? { ...room, files: response.data } : room
      );
      set({ rooms });
      toast.success("Files loaded successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room files';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ roomLoading: false });
    }
  },

  updateFileInRoom: (fileId: string, updates: Partial<FileInfo>) => {
    const state = get();
    const updatedRooms = state.rooms.map(room => ({
      ...room,
      files: room.files.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    }));

    set({ rooms: updatedRooms });

    // Also update active room if it contains this file
    if (state.activeRoom) {
      const updatedActiveRoom = {
        ...state.activeRoom,
        files: state.activeRoom.files.map(file =>
          file.id === fileId ? { ...file, ...updates } : file
        )
      };
      set({ activeRoom: updatedActiveRoom });
    }
  },

  removeFileFromRoom: (fileId: string) => {
    const state = get();
    const updatedRooms = state.rooms.map(room => ({
      ...room,
      files: room.files.filter(file => file.id !== fileId)
    }));

    set({ rooms: updatedRooms });

    // Also update active room if it contains this file
    if (state.activeRoom) {
      const updatedActiveRoom = {
        ...state.activeRoom,
        files: state.activeRoom.files.filter(file => file.id !== fileId)
      };
      set({ activeRoom: updatedActiveRoom });
    }
  },

  addFileToRoom: (roomId: string, file: FileInfo) => {
    const state = get();
    const updatedRooms = state.rooms.map(room => ({
      ...room,
      files: room.id === roomId ? [...room.files, file] : room.files
    }));

    set({ rooms: updatedRooms });

    // Also update active room if it's the target room
    if (state.activeRoom?.id === roomId) {
      const updatedActiveRoom = {
        ...state.activeRoom,
        files: [...state.activeRoom.files, file]
      };
      set({ activeRoom: updatedActiveRoom });
    }
  },

  setActiveRoom: (room: Room | null) => {
    set({ activeRoom: room });
  },

  clearError: () => set({ error: null }),

  clearRooms: () => set({ rooms: [], activeRoom: null }),
}));

export default useRoomStore;
export type { Room };