# Security Fixes — ssd-harsha

Role: software engineer
Task: fix the given 2 scenarios only
Date: 2026-09-23

## 1. Non-Functional WAF — Injection Payloads Not Actually Blocked

**Tool:** Static Code Analysis / OWASP ZAP Active Scan
**Fix:** Move the malicious payload inspection to run synchronously _before_ `next()` is called, and return a `400` response to terminate the request.

**Found:** `server/middleware/WAFMiddleware.js` — the SQL/NoSQL injection pattern check was placed inside an asynchronous `trackIP(...).then(...)` callback. Because `next()` was already called unconditionally before that `.then()` resolved, the route handler had already received and began processing the request by the time the check ran. The result was that `req.waf_blocked = true` was set but never read by anything — the WAF provided **zero actual protection** against injection payloads. Any request containing patterns like `$where`, `union select`, `1=1`, or `--` passed straight through to the database layer.

**Fix applied:**

- `server/middleware/WAFMiddleware.js` — extracted the payload inspection out of the `.then()` callback and placed it synchronously between the IP blacklist check and the `next()` call. Malicious requests now receive an immediate `400 Request blocked` response and never reach a route handler. The geo-tracking `trackIP()` call remains asynchronous (fire-and-forget) for logging only, so it no longer gates the blocking decision.

## 2. Broken Authentication — Deleted-Account Tokens Bypass Auth + TypeError Crash

**Tool:** Static Code Analysis / Postman
**Fix:** Add a `null` check for `req.user` after the DB lookup in `protect()`, and harden `authorize()` to guard against a `null` user reference.

**Found:** `server/middleware/authMiddleware.js` — the `protect` middleware verified the JWT signature and then called `User.findById(decoded.id)`, but never checked whether a user document was actually returned. If an admin deleted a user account after the user had already logged in, their JWT would still pass signature validation. `User.findById()` would return `null` and `req.user` would be set to `null`. Two consequences followed:

1. The user continued into the route handler as if fully authenticated (authentication bypass for deleted accounts).
2. The `authorize()` middleware would then crash with `TypeError: Cannot read properties of null (reading 'role')` because it accessed `req.user.role` directly with no null guard — potentially leaking a stack trace in the error response.

**Fix applied:**

- `server/middleware/authMiddleware.js` — after `req.user = await User.findById(decoded.id)`, added an explicit check: if `req.user` is `null`, call `next(new ErrorResponse('User account no longer exists', 401))` and return immediately. This ensures deleted-account tokens are rejected at the `protect` layer.
- `server/middleware/authMiddleware.js` — changed `authorize()` to check `!req.user || !roles.includes(req.user.role)` before accessing `.role`, and used optional chaining (`req.user?.role ?? 'unknown'`) in the error message to prevent any downstream TypeError even if `req.user` somehow reaches `authorize()` as `null`.
