# Stripe Connect Integration Guide

## 1. Overview
This integration allows "Haulers" (Service Providers) to receive payouts via Stripe Express Accounts.

- **Account Type**: Express (Platform controls the experience, User gets a dashboard)
- **Flow**: User signs up -> User clicks "Verify Payments" -> Redirected to Stripe -> Returns to App.

## 2. Firestore Schema Updates
We have updated the `users` collection to support this.

### `users/{userId}`
```json
{
  "uid": "user_123",
  ...
  "stripeConnectId": "acct_12345...",  // The Hauler's Connect Account ID
  "isStripeVerified": true,            // TRUE only if fully onboarded (payouts enabled)
  "stripeDetailsSubmitted": true       // Intermediate step
}
```

## 3. Stripe Dashboard Configuration
You MUST configure these settings in your [Stripe Dashboard](https://dashboard.stripe.com/settings/connect):

1.  **Enable Connect**: Go to Connect Settings and enable it.
2.  **Account Types**: Enable **Express** accounts.
3.  **Branding**: Upload your Logo and Icon (AutoDirect) in Settings -> Branding. This appears on the onboarding page.
4.  **Redirect URLs**:
    *   Add your local and production URLs to the Redirect whitelist.
    *   Example: `http://localhost:5173/` and `https://your-app.web.app/`

## 4. Environment Configuration
Run these commands to set your secrets for Cloud Functions:

```bash
# Set your Stripe Secret Key (SK_LIVE_...)
firebase functions:config:set stripe.secret="sk_test_..."

# Set your Stripe Webhook Signing Secret (whsec_...)
# Get this from Stripe Dashboard -> Developers -> Webhooks -> Add endpoint (Your Function URL)
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

## 5. Deployment
Deploy the new functions:
```bash
firebase deploy --only functions
```

## 6. Frontend Implementation (Brief)
1. Add a button "Verify Payments".
2. On click, call `createStripeAccount()`.
3. Then call `getStripeOnboardingLink()`.
4. Redirect user to `result.url`.
