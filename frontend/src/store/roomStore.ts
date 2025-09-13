import { create } from "zustand";
import { type File } from './fileStore';
import { api } from '@/lib/axiosInstance';

interface Room {
  id: string;
  title: string;
  files: File[];
}

interface RoomState {
  rooms: Room[];
  activeRoom: Room | null;
  loading: boolean;
  error: string | null;
  getRooms: () => Promise<void>;
  getRoom: (roomId: string) => Promise<void>;
  createRoom: (title: string) => Promise<void>;
  updateRoomTitle: (roomId: string, newTitle: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  clearError: () => void;
}

const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  loading: false,
  error: null,

  getRooms: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<Room[]>('/api/rooms');
      set({ rooms: response.data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch rooms' });
    } finally {
      set({ loading: false });
    }
  },

  getRoom: async (roomId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<Room>(`/api/rooms/${roomId}`);
      set({ activeRoom: response.data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch room' });
    } finally {
      set({ loading: false });
    }
  },

  createRoom: async (title: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<Room>('/api/rooms', { title });
      const rooms = get().rooms;
      set({ rooms: [...rooms, response.data] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create room' });
    } finally {
      set({ loading: false });
    }
  },

  updateRoomTitle: async (roomId: string, newTitle: string) => {
    try {
      set({ loading: true, error: null });
      await api.patch(`/api/rooms/${roomId}`, { title: newTitle });
      const rooms = get().rooms.map(room => 
        room.id === roomId ? { ...room, title: newTitle } : room
      );
      set({ rooms });
      if (get().activeRoom?.id === roomId) {
        set({ activeRoom: { ...get().activeRoom!, title: newTitle } });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update room title' });
    } finally {
      set({ loading: false });
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/api/rooms/${roomId}`);
      const rooms = get().rooms.filter(room => room.id !== roomId);
      set({ rooms });
      if (get().activeRoom?.id === roomId) {
        set({ activeRoom: null });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete room' });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRoomStore;