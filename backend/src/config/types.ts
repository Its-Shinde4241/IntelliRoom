declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email: string;
                name?: string;
                // Add other Firebase user properties as needed
            };
        }
    }
}

export { };