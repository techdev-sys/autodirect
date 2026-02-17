import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require('cors')({ origin: true });

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

export const createOrgUser = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).send({ error: 'Method Not Allowed' });
        }

        try {
            const {
                email,
                password,
                displayName,
                role,
                organizationId,
                licenseNumber,
                phoneNumber
            } = req.body;

            // Validate required fields
            if (!email || !password || !organizationId) {
                return res.status(400).send({ error: 'Missing required parameters' });
            }

            // 1. Create the user in Firebase Auth
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: displayName || email,
            });

            // 2. Create the user document in 'companies' collection as requested
            // Note: In some systems this might be 'users', but following prompt's 'companies'
            await db.collection('companies').doc(userRecord.uid).set({
                uid: userRecord.uid,
                email,
                displayName: displayName || email,
                role: role || 'driver',
                organizationId,
                licenseNumber: licenseNumber || '',
                phoneNumber: phoneNumber || '',
                isCompanySetupComplete: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Also create in 'users' collection to ensure app compatibility
            await db.collection('users').doc(userRecord.uid).set({
                uid: userRecord.uid,
                email,
                displayName: displayName || email,
                role: role || 'driver',
                organizationId,
                licenseNumber: licenseNumber || '',
                phoneNumber: phoneNumber || '',
                isCompanySetupComplete: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.status(200).send({
                success: true,
                uid: userRecord.uid
            });

        } catch (error: any) {
            console.error('Error creating org user:', error);
            return res.status(500).send({
                error: error.message || 'Internal Server Error'
            });
        }
    });
});