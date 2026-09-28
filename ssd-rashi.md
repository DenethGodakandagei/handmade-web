# Security Fixes — ssd-rashi

Role: Software Engineer  
Assignee: R.R.S. Ranadewa (IT23217522)  
Task: Fix the given 2 scenarios only  
Date: 2026-08-28  

---

## 1. Vulnerability 3 — Missing MIME-Sniffing Protection

- **Assignee:** R.R.S. Ranadewa
- **Where:** Web server / HTTP security response headers (`server/app.js`)
- **OWASP Category:** A05:2021 – Security Misconfiguration
- **CWE:** CWE-693 – Protection Mechanism Failure / CWE-79 – Cross-site Scripting
- **Tool:** OWASP ZAP (Active/Passive Scan)

### What was wrong
The application did not include the `X-Content-Type-Options` HTTP security header in its responses. This header helps prevent browsers from MIME-sniffing the content type of a response away from the declared `Content-Type`.

Without this protection, a browser may attempt to inspect and interpret a resource as a different executable content type (e.g., executing HTML/JavaScript embedded inside a text file or user-uploaded file), which significantly increases the risk of drive-by downloads and cross-site scripting (XSS) attacks.

### How we proved it (before fixing)
We performed a security scan of the application using OWASP ZAP. The scan identified the missing `X-Content-Type-Options` header as a security risk under Security Misconfiguration (A05:2021).

#### Evidence (Before Fix)
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 128
ETag: W/"80-..."
Date: Fri, 28 Aug 2026 12:00:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5
(Missing: X-Content-Type-Options header)
```

### How we fixed it
We configured the Express web server using `helmet` middleware to explicitly send the `X-Content-Type-Options: nosniff` header on all HTTP responses:
- `server/app.js`: Added `app.use(helmet.noSniff());` and updated Helmet configuration.
- Upgraded `helmet` in `server/package.json` to ensure modern security header compliance.

The header was configured as:
```http
X-Content-Type-Options: nosniff
```
This instructs supported browsers not to MIME-sniff the response and strictly follow the declared `Content-Type`.

#### Code Changes Applied
**File:** `server/app.js`
```javascript
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: { ... },
  })
);

// Enforce MIME-sniffing prevention header
app.use(helmet.noSniff());
```

### Proof it's fixed
After applying the security header configuration, we performed another OWASP ZAP scan and inspected the HTTP response headers in developer tools. The missing MIME-sniffing protection alert was resolved and is no longer reported.

#### Evidence (After Fix)
```http
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
Content-Type: application/json; charset=utf-8
Date: Fri, 28 Aug 2026 12:30:00 GMT
Connection: keep-alive
```

---

## 2. Vulnerability 4 — Missing Subresource Integrity (SRI)

- **Assignee:** R.R.S. Ranadewa
- **Where:** Frontend HTML / external resource imports (`client/index.html`, `client/src/main.jsx`)
- **OWASP Category:** A08:2021 – Software and Data Integrity Failures
- **CWE:** CWE-353 – Missing Support for Integrity Check
- **Tool:** OWASP ZAP / Manual Source Inspection

### What was wrong
The application loaded external font stylesheets directly from external Google Fonts CDNs (`https://fonts.googleapis.com` and `https://fonts.gstatic.com`) in `client/index.html` without using Subresource Integrity (`integrity` cryptographic hash attribute).

Without SRI, the browser cannot verify whether an externally loaded resource matches the expected, untampered content. If the third-party CDN or delivery route were compromised or modified maliciously, the client browser would load the modified resource without detecting the tampering, leading to potential CSS injection or data exfiltration.

### How we proved it (before fixing)
We performed a security assessment using OWASP ZAP and inspected external resource references used by the application in `client/index.html`. The scan identified external stylesheet links lacking cryptographic integrity hashes.

#### Evidence (Before Fix)
`client/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,900;1,400&family=Poppins:wght@300;400;500;600;700&display=swap"
  rel="stylesheet">
```
*(No `integrity="sha384-..."` or `crossorigin` attribute configured for font stylesheets).*

### How we fixed it
To completely eliminate dependency on external unvalidated CDN resources and prevent missing SRI risks:
1. Removed the external font links from `client/index.html`.
2. Installed localized, verified font packages `@fontsource/poppins` and `@fontsource/playfair-display` into the client package dependencies.
3. Self-hosted and bundled the fonts directly into the Vite build pipeline via `client/src/main.jsx`.

This completely eliminates reliance on external CDN links and guarantees cryptographic and source code integrity through bundled static assets.

#### Code Changes Applied
**1. Removed external CDN links from `client/index.html`:**
```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/Handmadelogo.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ArtisanConnect | Handmade Treasures</title>
</head>
```

**2. Installed npm packages in `client/package.json`:**
- `@fontsource/poppins: ^5.3.0`
- `@fontsource/playfair-display: ^5.3.0`

**3. Imported self-hosted font assets in `client/src/main.jsx`:**
```javascript
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/900.css";
import "@fontsource/playfair-display/400-italic.css";
```

### Proof it's fixed
After bundling and self-hosting the font resources, we performed another OWASP ZAP scan and inspected network tab requests. All fonts are served locally from the first-party origin `/assets/*`, and the missing Subresource Integrity vulnerability was completely resolved and no longer reported.

#### Evidence (After Fix)
- OWASP ZAP scan reports 0 missing SRI alerts on font/style resources.
- Network inspection confirms all font files load from the application's local bundle with strict local integrity.
