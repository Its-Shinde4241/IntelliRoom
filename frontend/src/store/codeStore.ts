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
                    let logs: string[] = [];
                    const originalLog = console.log;

                    // Capture logs
                    console.log = (...args: any[]) => {
                        const msg = args.join(" ");
                        logs.push(msg);

                        // Still log to browser console
                        originalLog.apply(console, args);

                        // Update Zustand from our buffer
                        set({ output: logs.join("\n"), error: null });
                    };

                    // Wrap eval in async IIFE so await works
                    await (async () => {
                        eval(code);
                    })();

                    console.log = originalLog; // restore
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
                    `/submissions/${token}?base64_encoded=true&fields=*`
                );
                if (res.data.status.id <= 2) {
                    await new Promise((r) => setTimeout(r, 1500));
                } else {
                    result = res.data;
                    break;
                }
            }

            const decode = (val: string | null) =>
                val ? atob(val) : null;

            set({
                output: decode(result?.stdout) || null,
                error: decode(result?.stderr) || decode(result?.compile_output) || null,
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
