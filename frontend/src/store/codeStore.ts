import { create } from "zustand";

type codestore = {
    loading: boolean;
    output: string | null;
    error: string | null;
    language: string | "";
    runCode: (code: string, langId: string) => void;
    saveCode: (code: string, roomId: string) => void;
}

const useCodeStore = create<codestore>((set) => ({
    loading: false,
    output: null,
    error: null,
    language: "",
    runCode: async (code: string) => {
        try {
            set({ loading: true })
            const response = await axios.post("", {

            }, {

            })

        } catch (error) {
            console.log("Error while running code ", error);
            throw error;
        }
        finally {
            set({ loading: false });
        }
    },
    saveCode: async (code: string, roomId: string) => {

    }
}));

export default useCodeStore;