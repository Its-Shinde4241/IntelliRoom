import { api } from "@/lib/axiosInstance";
import { create } from "zustand";

interface AgentStore {
    Indexfile: string;
    setIndexFile: (file: string) => void;
    Stylefile: string;
    setStyleFile: (file: string) => void;
    Scriptfile: string;
    setScriptFile: (file: string) => void;
    getProjectfromagent: (prompt: string) => Promise<void>;
}

const useAgentStore = create<AgentStore>((set) => ({
    Indexfile: "",
    Stylefile: "",
    Scriptfile: "",
    setIndexFile: (file: string) => set({ Indexfile: file }),
    setStyleFile: (file: string) => set({ Stylefile: file }),
    setScriptFile: (file: string) => set({ Scriptfile: file }),

    getProjectfromagent: async (prompt: string) => {
        try {
            const response = await api.post("/agent/generate", { prompt });

            if (!response.status.toString().startsWith("2")) {
                throw new Error("Network response was not ok");
            }

            const data = response.data as {
                indexfile: string;
                stylefile: string;
                scriptfile: string;
            };

            set({
                Indexfile: data.indexfile,
                Stylefile: data.stylefile,
                Scriptfile: data.scriptfile,
            });
        } catch (error) {
            console.error("Error fetching project from agent:", error);
            throw error;
        }
    },
}));

export default useAgentStore;
