import { prisma } from "../db/prisma";

interface FirebaseUser {
    uid: string;
    email: string;
    displayName?: string;
}

export async function upsertUser(firebaseUser: FirebaseUser) {
    try {
        const user = await prisma.user.upsert({
            where: { id: firebaseUser.uid },
            update: {
                name: firebaseUser.displayName || "",
                email: firebaseUser.email,
            },
            create: {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "",
                email: firebaseUser.email,
                createdAt: new Date(),
            },
        });
        return user;
    } catch (error) {
        console.error("Failed to upsert user", error);
        throw error;
    }
}
