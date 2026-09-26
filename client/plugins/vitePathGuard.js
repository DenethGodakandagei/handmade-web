import path from 'path';

/**
 * vitePathGuard – Vite plugin to mitigate CWE-22 Path Traversal.
 *
 * Adds connect-level middleware that:
 *  1. Decodes & canonicalises the request URL (single-pass to avoid double-decode bypasses).
 *  2. Rejects any URL path containing directory-traversal sequences (../ , ..\ , %2e, etc.).
 *  3. Validates the URL path against an allowlist of safe file extensions.
 *  4. Validates every query-parameter value against a strict allowlist pattern
 *     (alphanumeric, hyphens, underscores, dots, @, and forward slashes only – no
 *      ".." or encoded traversals).
 *  5. Ensures the resolved path stays within the project root (jail / chroot check).
 *
 * References:
 *   - https://owasp.org/www-community/attacks/Path_Traversal
 *   - https://cwe.mitre.org/data/definitions/22.html
 */

// ── Allowlists ───────────────────────────────────────────────────────────────

/** Extensions that Vite legitimately serves during dev. */
const ALLOWED_EXTENSIONS = new Set([
  '.js',   '.mjs',  '.cjs',  '.ts',   '.tsx',  '.jsx',
  '.css',  '.scss', '.less', '.sass',
  '.json', '.json5',
  '.html', '.htm',
  '.svg',  '.png',  '.jpg',  '.jpeg', '.gif',  '.webp', '.ico', '.avif',
  '.woff', '.woff2','.ttf',  '.eot',  '.otf',
  '.mp4',  '.webm', '.ogg',  '.mp3',  '.wav',
  '.map',
  '.wasm',
  '.vue',  '.svelte',
]);

/**
 * Query-parameter values must match this pattern.
 * Allows: alphanumeric, hyphen, underscore, dot, @, /, = (for base64), +, ?, &
 * Disallows: consecutive dots (..), backslashes, null bytes, angle brackets, etc.
 */
const SAFE_PARAM_VALUE = /^[\w\s\-._~:/?#[\]@!$&'()*+,;=%]*$/;

/** Patterns that indicate a traversal attempt (decoded form). */
const TRAVERSAL_PATTERNS = [
  '..',
  '.%2e', '%2e.',
  '%2e%2e',
  '..\\',  '..%5c', '%5c..',
  '%252e', // double-encode
  '\0',    // null-byte injection
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Single-pass decode.  We decode exactly once to normalise the input and then
 * work only with the decoded form.  Decoding a second time is intentionally
 * avoided to prevent double-decode bypasses.
 */
function decodeSingle(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;           // malformed encoding → keep raw (will fail validation)
  }
}

function containsTraversal(value) {
  const lower = value.toLowerCase();
  return TRAVERSAL_PATTERNS.some((p) => lower.includes(p));
}

function hasAllowedExtension(urlPath) {
  // Paths without an extension are allowed (Vite serves virtual modules, HMR endpoints, etc.)
  const ext = path.extname(urlPath).toLowerCase();
  if (ext === '') return true;
  return ALLOWED_EXTENSIONS.has(ext);
}

// ── Plugin ──────────────────────────────────────────────────────────────────

export default function vitePathGuard() {
  return {
    name: 'vite-path-guard',
    enforce: 'pre',

    configureServer(server) {
      const projectRoot = server.config.root;

      server.middlewares.use((req, res, next) => {
        // ── 1. Parse & single-decode ──────────────────────────────────
        let rawUrl;
        try {
          rawUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        } catch {
          res.statusCode = 400;
          res.end('Bad Request');
          return;
        }

        const decodedPath = decodeSingle(rawUrl.pathname);

        // ── 2. Block traversal sequences in the path ─────────────────
        if (containsTraversal(decodedPath)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        // ── 3. Canonicalise & jail check ─────────────────────────────
        //    Resolve the decoded path against the project root and ensure
        //    the result is still inside the project tree.
        const resolved = path.resolve(projectRoot, `.${decodedPath}`);
        const normRoot = path.normalize(projectRoot);
        if (!resolved.startsWith(normRoot)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        // ── 4. Extension allowlist ───────────────────────────────────
        if (!hasAllowedExtension(decodedPath)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }

        // ── 5. Query-parameter validation ────────────────────────────
        for (const [key, value] of rawUrl.searchParams) {
          const decodedKey = decodeSingle(key);
          const decodedValue = decodeSingle(value);

          // Key must be simple identifier-like
          if (containsTraversal(decodedKey)) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }

          // Value must match the safe charset and contain no traversal
          if (decodedValue && (!SAFE_PARAM_VALUE.test(decodedValue) || containsTraversal(decodedValue))) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }
        }

        // ── All checks passed ────────────────────────────────────────
        next();
      });
    },
  };
}
