import { create } from "zustand";
type RoomState = {
    loading: boolean;
    room: any;
    getRoom: () => void;
    deleteRoom: () => void;
    
}
const useRoomStore = create<RoomState>(() => ({
    loading: false,
    room: null,
    getRoom: async () => {

    },
    deleteRoom: async () => {

    },
}))

export default useRoomStore;