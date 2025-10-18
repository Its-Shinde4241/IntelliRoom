import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}


export const verifyIdToken = async (Idtoken: string) => {
    try {
        const user = await admin.auth().verifyIdToken(Idtoken);
        return user;
    } catch (error) {
        throw new Error("Invalid token : " + error);
    }
}