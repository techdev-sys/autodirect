"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJobExpirations = exports.captureAndPayout = exports.authorizeJobPayment = exports.handleStripeConnectWebhook = exports.getStripeOnboardingLink = exports.createStripeAccount = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
admin.initializeApp();
const db = admin.firestore();
// Initialize Stripe with your Secret Key (Preferably from Firebase Config)
// To set this: firebase functions:config:set stripe.secret="sk_live_..."
const stripe = new stripe_1.default(((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret) || "sk_test_placeholder", {
    apiVersion: "2022-11-15",
});
/**
 * ------------------------------------------------------------------
 * STRIPE CONNECT ONBOARDING (For Haulers)
 * ------------------------------------------------------------------
 */
/**
 * Step 1: Create Stripe Express Account
 * Trigger: Callable Function
 * Logic: Checks if user has an account, if not creates one and saves ID to Firestore.
 */
exports.createStripeAccount = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    const uid = context.auth.uid;
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    // Check if account already exists
    if (userSnap.exists && ((_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.stripeConnectId)) {
        return { accountId: (_b = userSnap.data()) === null || _b === void 0 ? void 0 : _b.stripeConnectId };
    }
    try {
        const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: context.auth.token.email,
            capabilities: {
                transfers: { requested: true },
            },
        });
        await userRef.set({ stripeConnectId: account.id }, { merge: true });
        return { accountId: account.id };
    }
    catch (error) {
        console.error("Create Account Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Step 2: Generate Onboarding Link
 * Trigger: Callable Function
 * Logic: Generates a link for the user to complete onboarding on Stripe.
 */
exports.getStripeOnboardingLink = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    const uid = context.auth.uid;
    const userSnap = await db.collection("users").doc(uid).get();
    const accountId = (_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.stripeConnectId;
    if (!accountId) {
        throw new functions.https.HttpsError("failed-precondition", "No Stripe Account found. Create one first.");
    }
    try {
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: "https://YOUR_APP_URL/dashboard?stripe_refresh=true",
            return_url: "https://YOUR_APP_URL/dashboard?stripe_return=true",
            type: "account_onboarding",
        });
        return { url: accountLink.url };
    }
    catch (error) {
        console.error("Link Gen Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Step 3: Verification Webhook
 * Trigger: HTTP Request (Stripe Webhook)
 * Logic: Listens for 'account.updated', checks 'payouts_enabled', and updates Firestore.
 */
exports.handleStripeConnectWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    const sig = req.headers["stripe-signature"];
    const endpointSecret = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret; // Set via config
    let event;
    try {
        if (endpointSecret && sig) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
        }
        else {
            event = req.body;
        }
    }
    catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    if (event.type === "account.updated") {
        const account = event.data.object;
        // Find user by stripeConnectId
        const usersRef = db.collection("users");
        const querySnapshot = await usersRef.where("stripeConnectId", "==", account.id).limit(1).get();
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const isVerified = account.payouts_enabled && account.charges_enabled;
            await userDoc.ref.update({
                isStripeVerified: isVerified,
                stripeDetailsSubmitted: account.details_submitted
            });
            console.log(`Updated user ${userDoc.id} verification status: ${isVerified}`);
        }
    }
    res.json({ received: true });
});
/**
 * ------------------------------------------------------------------
 * PHASE 1: THE LOCK (Authorization)
 * ------------------------------------------------------------------
 * Callable Function: authorizeJobPayment
 * Triggered by: Supplier (Frontend) when assigning a driver.
 * Actions:
 * 1. Validates the job and inputs.
 * 2. Creates a PaymentIntent with capture_method: 'manual'.
 * 3. Updates Firestore to 'ASSIGNED' and 'AUTHORIZED'.
 */
exports.authorizeJobPayment = functions.https.onCall(async (data, context) => {
    var _a;
    // 1. Security & Validation
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }
    const { jobId, paymentMethodId, haulerId } = data;
    if (!jobId || !paymentMethodId || !haulerId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }
    try {
        const jobRef = db.collection("transportJobs").doc(jobId);
        const jobSnap = await jobRef.get();
        if (!jobSnap.exists) {
            throw new functions.https.HttpsError("not-found", "Job not found.");
        }
        const jobData = jobSnap.data();
        // Ensure user owns the job
        if ((jobData === null || jobData === void 0 ? void 0 : jobData.supplierId) !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not own this job.");
        }
        // Ensure job is currently Open
        if ((jobData === null || jobData === void 0 ? void 0 : jobData.status) !== "open") {
            throw new functions.https.HttpsError("failed-precondition", "Job is not available for assignment.");
        }
        // 2. Security Check: Hauler Verification
        // The prompt requested this be 'optional' but impactful.
        // We log a warning if the hauler isn't verified.
        const haulerRef = db.collection("users").doc(haulerId);
        const haulerSnap = await haulerRef.get();
        if (!haulerSnap.exists || !((_a = haulerSnap.data()) === null || _a === void 0 ? void 0 : _a.isStripeVerified)) {
            console.warn(`WARNING: Assigning job to unverified hauler ${haulerId}. Payouts will fail until they onboard.`);
            // Uncomment to enforce strict trust layer:
            // throw new functions.https.HttpsError("failed-precondition", "Hauler has not verified their payment details (Stripe Connect).");
        }
        // 3. Calculate Amounts (in cents)
        // Assuming jobData.price is in dollars/base currency.
        const amountInCents = Math.round((jobData === null || jobData === void 0 ? void 0 : jobData.price) * 100);
        // Platform fee (e.g., 10%)
        const applicationFeeAmount = Math.round(amountInCents * 0.10);
        // 3. Create Stripe Customer (Optional: Check if exists first for better UX)
        // For simplicity, we create a customer or attach to existing if you store stripeCustomerId on user profile.
        // Here we assume we are just using the paymentMethodId directly.
        // 4. Create PaymentIntent (The "Escrow" Lock)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            payment_method: paymentMethodId,
            customer: jobData === null || jobData === void 0 ? void 0 : jobData.stripeCustomerId,
            confirm: true,
            capture_method: "manual",
            metadata: {
                jobId: jobId,
                supplierId: context.auth.uid,
                haulerId: haulerId,
                type: "escrow_payment"
            },
            // Application fee is collected later during transfer/payout
        });
        if (paymentIntent.status !== "requires_capture") {
            // If it requires action (3D Secure), send client_secret back to frontend
            if (paymentIntent.status === "requires_action") {
                return {
                    status: "requires_action",
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id
                };
            }
            // If failed
            throw new functions.https.HttpsError("aborted", "Payment Authorization Failed: " + paymentIntent.status);
        }
        // 5. Success - Update Firestore
        await jobRef.update({
            status: "assigned",
            paymentStatus: "AUTHORIZED",
            haulerId: haulerId,
            stripePaymentIntentId: paymentIntent.id,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentAuthorizedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, status: "authorized" };
    }
    catch (error) {
        console.error("Authorize Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * ------------------------------------------------------------------
 * PHASE 2: THE RELEASE (Capture & Payout)
 * ------------------------------------------------------------------
 * Trigger: Firestore onUpdate (jobs/{jobId})
 * Condition: status changes to 'DELIVERED' + ePOD present.
 * Actions:
 * 1. Capture the PaymentIntent (Charge the Supplier).
 * 2. Transfer funds to Hauler (Stripe Connect).
 * 3. Update PaymentStatus to 'PAID'.
 */
exports.captureAndPayout = functions.firestore
    .document("transportJobs/{jobId}")
    .onUpdate(async (change, context) => {
    var _a;
    const before = change.before.data();
    const after = change.after.data();
    // 1. Filter: Run ONLY if status changed to 'delivered' successfully
    if (before.status === "delivered" || after.status !== "delivered") {
        return null;
    }
    // 2. Filter: Ensure ePOD exists (Proof of Delivery)
    // CHECK SUBCOLLECTION
    const proofsSnapshot = await change.after.ref.collection("delivery_proof").limit(1).get();
    if (proofsSnapshot.empty) {
        console.log("Job marked delivered but missing delivery_proof subcollection. Skipping payout.");
        return null;
    }
    const proofData = proofsSnapshot.docs[0].data();
    if (!proofData.signature) {
        console.log("Job marked delivered but proof matches no signature. Skipping payout.");
        return null;
    }
    // 3. Idempotency Check
    if (after.paymentStatus === "PAID" || after.paymentStatus === "CAPTURING") {
        return null;
    }
    const paymentIntentId = after.stripePaymentIntentId;
    if (!paymentIntentId) {
        console.error("No PaymentIntent ID found on job.");
        return null; // Handle manual intervention needed
    }
    const jobId = context.params.jobId;
    const jobRef = change.after.ref;
    try {
        // Set intermediate status to prevent race conditions
        await jobRef.update({ paymentStatus: "CAPTURING" });
        // 4. Retrieve Hauler's Connect ID (Destination)
        const haulerDoc = await db.collection("users").doc(after.haulerId).get();
        const haulerStripeId = (_a = haulerDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeConnectId; // "acct_..."
        if (!haulerStripeId) {
            throw new Error("Hauler does not have a linked Stripe Connect Account.");
        }
        // 5. CAPTURE the funds (Charge the Supplier finally)
        // We capture the full amount.
        const capturedIntent = await stripe.paymentIntents.capture(paymentIntentId);
        if (capturedIntent.status !== "succeeded") {
            throw new Error("Stripe Capture Failed: " + capturedIntent.status);
        }
        // 6. Calculate Payout (Minus Fee)
        // amount_received is in cents
        const totalAmount = capturedIntent.amount_received;
        // 10% Platform Fee
        const platformFee = Math.round(totalAmount * 0.10);
        const haulerPayout = totalAmount - platformFee;
        // 7. TRANSFER to Hauler
        const transfer = await stripe.transfers.create({
            amount: haulerPayout,
            currency: "usd",
            destination: haulerStripeId,
            metadata: {
                jobId: jobId,
                type: "hauler_payout"
            }
        });
        // 8. Final Success Update
        await jobRef.update({
            paymentStatus: "PAID",
            payoutId: transfer.id,
            payoutAmount: haulerPayout,
            platformFee: platformFee,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Payout Success for Job ${jobId}. Transfer: ${transfer.id}`);
        return true;
    }
    catch (error) {
        console.error("Payout Failed:", error);
        // Mark as failed so admin can intervene
        await jobRef.update({
            paymentStatus: "CAPTURE_FAILED",
            paymentError: error.message
        });
        return false;
    }
});
/**
 * ------------------------------------------------------------------
 * JOB EXPIRATION CRON
 * ------------------------------------------------------------------
 * Trigger: Scheduled every 1 minute
 * Logic: Checks for jobs stuck in 'assigned' for > 15 mins.
 * Action: Resets them to 'open' and removes hauler.
 */
exports.checkJobExpirations = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async (context) => {
    const now = Date.now();
    const EXPIRATION_TIME = 15 * 60 * 1000; // 15 Minutes
    const cutoff = now - EXPIRATION_TIME;
    // Query jobs that are 'assigned'
    const jobsRef = db.collection("transportJobs");
    const snapshot = await jobsRef
        .where("status", "==", "assigned")
        .get();
    const batch = db.batch();
    let updateCount = 0;
    snapshot.forEach((doc) => {
        const data = doc.data();
        const acceptedAt = data.acceptedAt;
        // Check if expired
        if (acceptedAt && acceptedAt < cutoff) {
            // Determine if we should also void the payment hold?
            // For now, just reset the job status so it appears on board
            batch.update(doc.ref, {
                status: "open",
                haulerId: null,
                haulerEmail: null,
                haulerProfile: null,
                acceptedAt: null,
                expiredCount: admin.firestore.FieldValue.increment(1) // Track metrics
            });
            updateCount++;
        }
    });
    if (updateCount > 0) {
        await batch.commit();
        console.log(`Reset ${updateCount} expired jobs.`);
    }
    return null;
});
//# sourceMappingURL=index.js.map