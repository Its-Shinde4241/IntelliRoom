import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export const verifyIdToken = async (Idtoken: string) => {
    try {
        const user = await admin.auth().verifyIdToken(Idtoken);
        return user;
    } catch (error) {
        throw new Error("Invalid token : " + error);
    }
}