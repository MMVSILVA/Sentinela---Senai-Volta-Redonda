# Security Specification - Sentinela

## 1. Data Invariants
- Users must have a profile in the `/users/` collection.
- Alerts must be associated with a valid user.
- Only admins can resolve or reset alerts.
- Users can only edit their own profiles.
- Any user can trigger an alert, but they must be authenticated.

## 2. The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Spoofing**: Creating a profile for another user UID.
2. **Privilege Escalation**: Setting `role: 'admin'` during registration without authorization.
3. **Ghost Field Injection**: Adding `isVerified: true` to a user profile.
4. **ID Poisoning**: Using a 2KB string as a `userId` or `alertId`.
5. **Relational Bypass**: Creating an alert with `triggeredBy` set to another user's ID.
6. **State Shortcutting**: Updating an alert to `active: false` without being the admin.
7. **Unauthorized Deletion**: Deleting someone else's profile.
8. **PII Leakage**: Reading other users' phone numbers or emails without being an admin.
9. **Denial of Wallet**: Flooding the `alerts` collection with 1MB notes.
10. **Timestamp Fraud**: Setting a `createdAt` in the future.
11. **Orphaned Writes**: Creating an alert without a valid user profile.
12. **Immutable Field Tampering**: Changing the `email` or `userId` of an existing profile.

## 3. Test Runner (Conceptual)
All the above payloads must return `PERMISSION_DENIED`.
