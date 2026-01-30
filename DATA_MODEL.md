# AutoDirect Escrow & Data Architecture

## 1. Data Model (Firestore)


### `users/{userId}`
Stores profile and Stripe Connect info.
```json
{
  "uid": "user_123",
  "displayName": "John Hauler",
  "email": "john@hauler.com",
  "role": "driver", // OPTIONS: 'owner', 'admin', 'dispatcher', 'driver', 'clerk', 'supplier'
  "organizationId": "org_ABC123", // LINKS User to an Organization (Tenant)
  
  // STRIPE
  "stripeCustomerId": "cus_A1...",   // For Suppliers (Paying)
  "stripeConnectId": "acct_B2..."    // For Haulers (Receiving Payouts)
}
```

### `transportJobs/{jobId}`
The core transaction document.
```json
{
  "supplierId": "user_123",
  "haulerOrgId": "org_ABC123", // The Company assigned to the job (not just a user)
  "assignedDriverId": "user_456", // Specific driver within the Org
  "assignedBy": "user_789", // Dispatcher who assigned it
  
  "origin": "Harare",
  "destination": "Bulawayo",
  "price": 100.00,
  
  // STATUS WORKFLOW
  "status": "open", // open -> assigned -> in_transit -> delivered
  
  // PAYMENT FIELDS (Protected)
  "paymentStatus": "PENDING", // PENDING -> AUTHORIZED -> CAPTURING -> PAID
  "stripePaymentIntentId": "pi_3M...", // The 'Escrow' Lock ID
  "payoutId": "tr_...", // The final transfer ID
  
  // PROOF
  "ePOD_url": "https://..." // Required for payout triggers
}
```

### `audit_logs/{logId}`
Tracks critical changes for accountability.
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "jobId": "job_123",
  "actorId": "user_789", // Who made the change
  "action": "UPDATE_STATUS",
  "fieldChanged": "status",
  "oldValue": "open",
  "newValue": "assigned"
}
```

## 2. The Escrow Workflow

### Phase 1: Authorization (The Lock)
1. Supplier selects a driver on the frontend.
2. Frontend calls `authorizeJobPayment({ jobId, haulerId, paymentMethod })`.
3. **Cloud Function** validates ownership and creates a Stripe PaymentIntent with `capture_method: 'manual'`.
   - *This reserves the funds on the Supplier's card but does not take them yet.*
4. Cloud Function updates Job: `status: 'assigned'`, `paymentStatus: 'AUTHORIZED'`.

### Phase 2: Execution
1. Hauler picks up goods -> Updates status to `in_transit`.
2. Hauler delivers goods -> Uploads photo (ePOD) -> Updates status to `delivered`.

### Phase 3: Release (The Capture)
1. **Cloud Function Trigger** detects `status: 'delivered'` AND presence of `ePOD_url`.
2. Captures the funds from Supplier (Supplier is charged).
3. Calculates `10% Platform Fee`.
4. Transfers remainder to Hauler's `stripeConnectId`.
5. Updates Job: `paymentStatus: 'PAID'`.

## 3. Stripe Setup Requirements
To make this work, run these commands in your functions folder:
```bash
firebase functions:config:set stripe.secret="sk_live_..."
```
This stores your secure secret key in the environment constraints.
