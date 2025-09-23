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
  loading: boolean;
  error: string | null;

  getUserRooms: (userId: string) => Promise<void>;
  getRoom: (roomId: string) => Promise<void>;
  createRoom: (name: string, password?: string, userId?: string) => Promise<void>;
  updateRoom: (roomId: string, updates: { name?: string; password?: string }) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;

  getRoomFiles: (roomId: string) => Promise<void>;

  setActiveRoom: (room: Room | null) => void;
  clearError: () => void;
  clearRooms: () => void;
}

const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  loading: false,
  error: null,

  getUserRooms: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<Room[]>(`/rooms/user/${userId}`);
      set({ rooms: response.data });
      toast.success("Rooms loaded successfully");
    } catch (error) {
      toast.error("Failed to fetch rooms");
      set({ error: error instanceof Error ? error.message : 'Failed to fetch rooms' });
    } finally {
      set({ loading: false });
    }
  },

  getRoom: async (roomId: string) => {
    try {
      set({ loading: true, error: null });
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
      set({ loading: false });
    }
  },

  createRoom: async (name: string, password?: string, userId?: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<Room>('/rooms', {
        name,
        password,
        userId
      });
      const rooms = get().rooms;
      set({ rooms: [...rooms, response.data] });
      toast.success(`Room "${name}" created successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      toast.error(errorMessage);
      set({ error: errorMessage });
      throw error; // Re-throw to allow caller to handle
    } finally {
      set({ loading: false });
    }
  },

  updateRoom: async (roomId: string, updates: { name?: string; password?: string }) => {
    try {
      set({ loading: true, error: null });
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
      set({ loading: false });
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      set({ loading: true, error: null });
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
      set({ loading: false });
    }
  },

  getRoomFiles: async (roomId: string) => {
    try {
      set({ loading: true, error: null });
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
      set({ loading: false });
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