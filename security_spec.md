# Security Specification for E-Jamia Management System

## Data Invariants
1. A student record must belong to a specific institution (madrassaId).
2. Users can only read data if they are signed in.
3. Only Admins can modify students, system settings, and other core data.
4. Users can update their own profile information.

## The Dirty Dozen Payloads
1. Attempt to create a student without being signed in. (Denied)
2. Attempt to update a student as a non-admin user. (Denied)
3. Attempt to read an institution's data without being signed in. (Denied)
4. Attempt to write to a random top-level collection. (Denied)
5. Attempt to set `madrassaId` to a different institution during update. (Internal consistency check)
6. Attempt to modify another user's profile. (Denied)
7. Attempt to inject a very long string as a student ID. (Denied by isValidId)
8. Attempt to create a student with a missing name. (Denied by schema check)
9. Attempt to update system settings as a teacher. (Denied)
10. Attempt to delete an institution record as a teacher. (Denied)
11. Attempt to read all students globally (if list query is insecure). (Denied by rule scope)
12. Attempt to spoof admin role by passing a `role: Admin` field in a self-update. (Denied by update key logic)

## Test Plan
- Verify that `isSignedIn()` is enforced.
- Verify that `isAdmin()` correctly identifies the master emails.
- Verify that `isValidId()` blocks malicious path variables.
