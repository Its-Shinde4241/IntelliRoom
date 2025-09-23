import { prisma } from "../db/prisma";

interface FirebaseUser {
    uid: string;
    email: string;
    displayName?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export async function upsertUser(firebaseUser: FirebaseUser) {
    try {
        await prisma.user.upsert({
            where: { id: firebaseUser.uid },
            update: {
                name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
                email: firebaseUser.email,
                updatedAt: firebaseUser.updatedAt || new Date(),
            },
            create: {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
                email: firebaseUser.email,
                createdAt: firebaseUser.createdAt || new Date(),
                updatedAt: firebaseUser.updatedAt || new Date(),
            },
        });
    } catch (error) {
        console.error("Failed to upsert user", error);
        throw error;
    }
}
