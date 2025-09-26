import { create } from "zustand";
import { axiosJudge0 } from "../lib/axiosInstance";
import { toast } from "sonner";

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
        console.log("Running code with language ID:", langId);

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
                    toast.success("Code executed successfully!", {
                        duration: 1000,
                        style: { width: "auto", minWidth: "fit-content", padding: 6 },
                    });
                } catch (e: any) {
                    const errorMessage = e.message || String(e);
                    set({ output: null, error: errorMessage });
                    toast.error(`Execution error: ${errorMessage}`);
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
            let attempts = 0;
            const maxAttempts = 20; // Prevent infinite loop

            while (attempts < maxAttempts) {
                try {
                    const res = await axiosJudge0.get<Judge0Result>(
                        `/submissions/${token}?base64_encoded=true&fields=*`
                    );

                    if (res.data.status.id <= 2) {
                        await new Promise((r) => setTimeout(r, 1500));
                        attempts++;
                    } else {
                        result = res.data;
                        break;
                    }
                } catch (pollError: any) {
                    console.error("Error polling submission:", pollError);
                    toast.error("Error checking code execution status");
                    throw new Error("Failed to check execution status");
                }
            }

            if (attempts >= maxAttempts) {
                toast.error("Code execution timed out");
                set({ output: null, error: "Execution timed out" });
                return;
            }

            if (!result) {
                toast.error("No result received from code execution");
                set({ output: null, error: "No result received" });
                return;
            }

            const decode = (val: string | null) => {
                try {
                    return val ? atob(val) : null;
                } catch (decodeError) {
                    console.error("Error decoding base64:", decodeError);
                    return val; // Return original if decode fails
                }
            };

            const decodedOutput = decode(result.stdout);
            const decodedError = decode(result.stderr) || decode(result.compile_output);

            set({
                output: decodedOutput,
                error: decodedError,
            });

            // Show appropriate toast based on result
            if (decodedError) {
                toast.error("Code execution failed with errors");
            } else if (decodedOutput) {
                toast.success("Code executed successfully!");
            } else {
                toast.success("Code executed (no output)");
            }

        } catch (err: any) {
            console.error("Error while running code:", err);

            let errorMessage = "Unknown error occurred";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMessage = err.message;
            }

            set({ output: null, error: errorMessage });
            toast.error(`Execution failed: ${errorMessage}`);

        } finally {
            set({ loading: false });
        }
    },

    saveCode: (code: string, roomId: string) => {
        try {
            if (!code || !roomId) {
                toast.error("Invalid code or room ID");
                return;
            }

            localStorage.setItem(`room-${roomId}-code`, code);
            console.log("Code saved for room", roomId);
            toast.success("File saved!", {
                duration: 1000,
                style: { width: "auto", minWidth: "fit-content", padding: 6 },
            });

        } catch (saveError: any) {
            console.error("Error saving code:", saveError);
            // toast.error("Failed to save code");
        }
    },
}));

export default useCodeStore;