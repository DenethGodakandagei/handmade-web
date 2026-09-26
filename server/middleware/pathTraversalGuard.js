import path from 'path';

/**
 * Express middleware to prevent Path Traversal attacks (CWE-22).
 *
 * Implements "accept known good" input validation:
 *  1. Single-pass URL decode (prevents double-decode bypass).
 *  2. Reject directory-traversal sequences (.., encoded variants, null bytes).
 *  3. Canonicalise the path and verify it stays within the project root (jail check).
 *  4. Allowlist of safe file extensions for static asset requests.
 *  5. Validate all query-parameter values against a strict pattern.
 *
 * References:
 *   - https://owasp.org/www-community/attacks/Path_Traversal
 *   - https://cwe.mitre.org/data/definitions/22.html
 */

// ── Allowlists ───────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = new Set([
  '.js',   '.mjs',  '.cjs',  '.json',
  '.css',  '.html', '.htm',
  '.svg',  '.png',  '.jpg',  '.jpeg', '.gif',  '.webp', '.ico', '.avif',
  '.woff', '.woff2','.ttf',  '.eot',  '.otf',
  '.mp4',  '.webm', '.ogg',  '.mp3',  '.wav',
  '.map',  '.txt',  '.xml',  '.pdf',
]);

const SAFE_PARAM_VALUE = /^[a-zA-Z0-9\-_.\/@=+?&%,;:!~*'()]+$/;

const TRAVERSAL_PATTERNS = [
  '..',
  '.%2e', '%2e.',
  '%2e%2e',
  '..\\', '..%5c', '%5c..',
  '%252e',
  '\0',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function decodeSingle(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function containsTraversal(value) {
  const lower = value.toLowerCase();
  return TRAVERSAL_PATTERNS.some((p) => lower.includes(p));
}

function hasAllowedExtension(urlPath) {
  const ext = path.extname(urlPath).toLowerCase();
  if (ext === '') return true;         // no extension → API route, allow
  return ALLOWED_EXTENSIONS.has(ext);
}

// ── Middleware ────────────────────────────────────────────────────────────────

const pathTraversalGuard = (req, res, next) => {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1')));

  // 1. Parse URL
  let parsed;
  try {
    parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    return res.status(400).json({ success: false, message: 'Bad Request' });
  }

  const decodedPath = decodeSingle(parsed.pathname);

  // 2. Block traversal sequences
  if (containsTraversal(decodedPath)) {
    return res.status(403).json({ success: false, message: 'Forbidden – path traversal detected' });
  }

  // 3. Canonicalise & jail check
  const resolved = path.resolve(projectRoot, `.${decodedPath}`);
  const normRoot = path.normalize(projectRoot);
  if (!resolved.startsWith(normRoot)) {
    return res.status(403).json({ success: false, message: 'Forbidden – path outside root' });
  }

  // 4. Extension allowlist (only for static-looking paths, not /api/...)
  if (!decodedPath.startsWith('/api/') && !hasAllowedExtension(decodedPath)) {
    return res.status(403).json({ success: false, message: 'Forbidden – disallowed file type' });
  }

  // 5. Query-parameter validation
  for (const [key, value] of parsed.searchParams) {
    const dk = decodeSingle(key);
    const dv = decodeSingle(value);

    if (containsTraversal(dk) || containsTraversal(dv)) {
      return res.status(403).json({ success: false, message: 'Forbidden – traversal in query' });
    }
    if (dv && !SAFE_PARAM_VALUE.test(dv)) {
      return res.status(403).json({ success: false, message: 'Forbidden – invalid query value' });
    }
  }

  next();
};

export default pathTraversalGuard;
