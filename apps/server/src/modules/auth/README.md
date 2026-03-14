## Overview

The authentication system relies on two types of tokens stored in cookies:

1.  **Auth JWT (`authToken`)**:
    *   Short-lived (1 minute).
    *   Stored in an HTTP-only, secure (in production) cookie.
    *   Contains user ID, session ID, and access permissions.
    *   Allows for stateless verification of most requests, reducing database load.

2.  **Session Token (`sessionToken`)**:
    *   Long-lived (10-day inactivity timeout).
    *   Stored in an HTTP-only, secure (in production) cookie.
    *   Format: `sessionId.secret`.
    *   The `secret` is hashed and stored in the database for verification.
    *   Used to refresh the Auth JWT when it expires.

## How it Works

### Sign In
When a user signs in:
1.  Credentials are verified.
2.  A new session is created in the database with a unique `sessionId` and a hashed `secret`.
3.  A `sessionToken` is generated (`sessionId.secret`) and set as a cookie.
4.  An `authToken` (JWT) is signed and set as a cookie.

### Request Authentication (`authGuard`)
The `authGuard` middleware protects routes by:
1.  Checking for a valid `authToken`. If valid, the request proceeds immediately.
2.  If the `authToken` is missing or expired, it looks for a `sessionToken`.
3.  If a `sessionToken` is found:
    *   It's split into `sessionId` and `secret`.
    *   The session is looked up in the database.
    *   The `secret` is verified against the stored hash.
    *   If valid, a new `authToken` is issued and set in the response cookies.
    *   The session's `lastUsedAt` timestamp is updated if more than an hour has passed.
4.  If neither token is valid, a `401 Unauthorized` response is returned.

### Session Management
*   **Sign Out**: Deletes the current session (or a specific one if `sessionId` is provided) from the database and clears cookies.
*   **Sign Out All**: Deletes all sessions associated with the user.
*   **Inactivity Cleanup**: A background cron job runs daily to remove sessions that haven't been used for over 10 days.

### Access Control
Permissions are managed via an `AccessMap` (e.g., `admin`, `wishes`, `f1`). These permissions are embedded in the Auth JWT, allowing the `authGuard` to perform quick permission checks without additional database queries.

## Security Features
*   **HTTP-only Cookies**: Prevents XSS attacks from stealing tokens.
*   **Constant-time Comparison**: Used for verifying session secrets to prevent timing attacks.
*   **Password Hashing**: Passwords are hashed using Argon2 (via `hashPassword`).
*   **Database-backed Sessions**: Allows for immediate revocation of sessions (e.g., sign out all).
