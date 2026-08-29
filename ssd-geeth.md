# Security Fixes — ssd-geeth

Role: sniper senior software engineer
Task: fix the given 2 scenarios only
Date: 2026-08-23

## 1. Broken Object Level Authorization (IDOR)

**Tool:** Postman / ZAP Manual Request Editor
**Fix:** Ensure backend queries check ownership: `findOne({ _id: req.params.id, userId: req.user._id })`.

**Found:** `GET /api/v1/chats/:chatId/messages` and `POST /api/v1/chats/message` (chat controller) fetched/inserted
messages by `chatId` alone, with no check that `req.user` was actually a participant (`customer` or `artisan`) of
that chat. Any authenticated user could read or post into another user's chat by guessing/enumerating a `chatId`.

**Fix applied:**
- `server/services/chatService.js` — added `assertChatParticipant(chatId, userId)`, which does
  `Chat.findOne({ _id: chatId, $or: [{ customer: userId }, { artisan: userId }] })` and throws if no match.
  Called from `getMessagesService` and `sendMessageService` before returning/writing messages.
- `server/controllers/chatController.js` — `getMessages` now passes `req.user.id` through to
  `getMessagesService(chatId, userId)` so the ownership check has a user to check against.

## 2. Vulnerable & Outdated Dependencies

**Tool:** npm audit / OWASP Dependency-Check
**Fix:** Run `npm audit fix` and upgrade vulnerable packages in `package.json`.

**Found:** `npm audit` across the three package trees:
- root: 1 high (d3-color ReDoS, transitive)
- client: 16 total (2 low, 2 moderate, 12 high)
- server: 60 total (1 low, 42 moderate, 16 high, 1 critical)

**Fix applied:**
- Root: `npm audit fix` → 0 vulnerabilities remaining.
- Client: `npm audit fix` → down to 1 unresolved high (`d3-color`, transitive dependency of
  `react-simple-maps`/`d3-zoom`). No non-breaking upgrade path exists yet; forcing it would downgrade
  `react-simple-maps`, so left as a tracked residual risk rather than risk breaking the maps feature.
- Server: ran `npm audit fix --legacy-peer-deps` (server has a pre-existing peer conflict between
  `cloudinary@^2.9.0` and `multer-storage-cloudinary@^4.0.0`, which pins `cloudinary@^1`, requiring
  `--legacy-peer-deps` for any install/audit command to run). Result: 0 auto-fixable — all 60 findings
  (1 critical, 16 high, 42 moderate, 1 low) are nested transitive dependencies of core packages
  (`resend`→`svix`→`uuid`, `arcjet`→`@arcjet/*`, `socket.io`→`ws`/`engine.io`), and only resolve via
  `--force`, which would bump those packages' major versions and risks breaking chat/notification/email
  functionality. Left as a tracked residual risk for a scheduled upgrade + regression test pass, rather
  than forced blind in this fix.
