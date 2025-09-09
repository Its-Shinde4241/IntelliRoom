import { create } from "zustand";
import { axiosJudge0 } from "../lib/axiosInstance";
interface Judge0SubmissionResponse {
    token: string;
}

interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    status: {
        id: number;
        description: string;
    };
}

type CodeStore = {
    loading: boolean;
    output: string | null;
    error: string | null;
    language: string;
    runCode: (code: string, langId: string, stdIn: string) => Promise<void>;
    saveCode: (code: string, roomId: string) => void;
};

const JS_LANG_IDS = [63, 74]; // Example: Judge0 language IDs for JS/TS

const useCodeStore = create<CodeStore>((set) => ({
    loading: false,
    output: null,
    error: null,
    language: "",

    runCode: async (code: string, langId: string, stdIn: string) => {
        set({ loading: true, output: null, error: null });

        try {
            // If language is JS or TS (run in-browser)
            if (Number(langId) === 63) {
                try {
                    let output = "";
                    // Redirect console.log
                    const originalLog = console.log;
                    console.log = (...args: any[]) => {
                        output += args.join(" ") + "\n";
                    };

                    // Run the code safely
                    eval(code);

                    console.log = originalLog; // restore
                    set({ output, error: null });
                } catch (e: any) {
                    set({ output: null, error: e.message || String(e) });
                }
                return;
            }

            // Otherwise, use Judge0
            const { data } = await axiosJudge0.post<Judge0SubmissionResponse>(
                "/submissions",
                {
                    source_code: code,
                    language_id: Number(langId),
                    stdin: stdIn,
                }
            );

            const token = data.token;

            let result: Judge0Result | null = null;
            while (true) {
                const res = await axiosJudge0.get<Judge0Result>(
                    `/submissions/${token}?base64_encoded=false&fields=*`
                );

                if (res.data.status.id <= 2) {
                    await new Promise((r) => setTimeout(r, 1500));
                } else {
                    result = res.data;
                    break;
                }
            }

            set({
                output: result?.stdout || null,
                error: result?.stderr || result?.compile_output || null,
            });
        } catch (err: any) {
            console.error("Error while running code:", err.response?.data || err);
            throw err.response.data.message;
            // set({ output: null, error: err.message || "Unknown error" });
        } finally {
            set({ loading: false });
        }
    },

    saveCode: (code: string, roomId: string) => {
        localStorage.setItem(`room-${roomId}-code`, code);
        console.log("Code saved for room", roomId);
    },
}));

export default useCodeStore;
