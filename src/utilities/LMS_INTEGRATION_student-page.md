# LMS → Proctoring Tool Integration (Simplified, No OIDC)

This document is everything the LMS team needs to plug their LMS into the **Innovation Proctoring tool**.

The LMS authenticates its own students. When a student clicks **"Start Exam"**, the LMS hands the student off to the proctoring tool **already authenticated** — there is no OIDC handshake, no `/lti/login`, no `/lti/auth`. The LMS just signs a JWT describing the student and exam, and POSTs the browser to the proctoring tool.

A working reference implementation lives in this repo at `backend/lti.py` (a FastAPI mock LMS). Treat it as the contract.

---

## 1. The launch flow

```
Student is signed in to the LMS and clicks "Start Exam"
        │
        ▼  (LMS server mints & signs an id_token JWT for this student + this exam)
LMS returns HTML page with an auto-submitting form:
        <form method="POST" action="https://<TOOL_HOST>/api/lti/launch">
          <input name="id_token" value="<RS256 JWT signed by the LMS>">
        </form>
        │
        ▼  POST
https://<TOOL_HOST>/api/lti/launch
        │
        ▼  302  (tool validates the JWT, creates a session, mints its own short-lived JWT)
https://<TOOL_HOST>/session/<sid>?t=<session_jwt>&quiz=<exam_url>
        │
        ▼  the tool's student-web iframes the exam:
<iframe src="https://<LMS_PUBLIC_URL>/exam/<exam_id>?embedded=1">
```

One round trip from the LMS, one signed JWT. That's the whole integration.

---

## 2. Identifiers (fill these in together)

| Field                  | Owner          | Example (mock)                         | Your value                              |
| ---------------------- | -------------- | -------------------------------------- | --------------------------------------- |
| `LMS_PUBLIC_URL`       | LMS team       | `https://128.15.0.199`                 |                                         |
| `LMS_ISSUER` (`iss`)   | LMS team       | `https://128.15.0.199`                 |                                         |
| `LMS_DEPLOYMENT_ID`    | LMS team       | `1`                                    |                                         |
| `LMS_KID`              | LMS team       | `lms-key-1`                            |                                         |
| LMS public key (PEM)   | LMS team       | `backend/keys/lms_public.pem`          |                                         |
| `TOOL_HOST`            | Proctoring     | `https://128.15.0.50`                  | `https://128.15.0.50`                   |
| `TOOL_LAUNCH_URL`      | Proctoring     | `https://128.15.0.50/api/lti/launch`   | `https://128.15.0.50/api/lti/launch`    |
| `TOOL_CLIENT_ID`       | Proctoring     | `6pYIe1G3jBG7XrK`                      | `6pYIe1G3jBG7XrK`                       |

### 2.1 How to choose each value

**`LMS_PUBLIC_URL`** — the public HTTPS origin where your LMS and the exam page in §4 are reachable from the proctoring host. Single origin, no path, no trailing slash. The proctoring host must be able to reach this URL.

**`LMS_ISSUER`** — the `iss` claim you'll sign every JWT with. In practice, **set it equal to `LMS_PUBLIC_URL`**. It is an opaque string that identifies your LMS to the proctoring side. Must be stable; every JWT you sign must use exactly this value.

**`LMS_DEPLOYMENT_ID`** — any short string. For a single deployment, **use `"1"`**.

**`LMS_KID`** — a "key id" label your JWT header carries so the verifier knows which public key to use. Any short string. **Use `"lms-key-1"`** for the first key; bump to `lms-key-2` on rotation. Must match the `kid` registered on the proctoring side.

**LMS public key (PEM)** — one half of an RSA 2048-bit keypair. Generate once:

```bash
mkdir -p keys
# Private key (KEEP SECRET, signs JWTs)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out keys/lms_private.pem
# Public key (share with the proctoring team)
openssl rsa -in keys/lms_private.pem -pubout -out keys/lms_public.pem
```

Result:
- `lms_private.pem` — stays on the LMS server, signs every JWT in §3.
- `lms_public.pem` — what you send the proctoring team. Format:
  ```
  -----BEGIN PUBLIC KEY-----
  MIIBIjANBgkq…
  …AQAB
  -----END PUBLIC KEY-----
  ```

**`TOOL_*` values** — fixed by the proctoring side. Hardcode them in your LMS config.

The LMS keeps the **private** key. Only the **public** PEM is shared with the proctoring side.

---

## 3. The "Start Exam" handler — the only endpoint you implement

When a signed-in student clicks **Start Exam** for a specific exam, your backend:

1. Looks up the student and the exam in your own DB (your auth, your data).
2. Builds the JWT payload below.
3. Signs it as RS256 with your private key (`kid` in the JWT header).
4. Returns an HTML page that auto-submits a form-POST to `<TOOL_LAUNCH_URL>` carrying the JWT.

### 3.1 JWT claims to mint

```json
{
  "iss": "<LMS_ISSUER>",
  "aud": "<TOOL_CLIENT_ID>",
  "sub": "<your stable student id>",
  "iat": <unix now>,
  "exp": <unix now + 600>,

  "name": "<student full name>",
  "given_name": "<first name>",
  "picture": "https://<LMS_PUBLIC_URL>/api/students/<student_id>/photo",

  "https://purl.imsglobal.org/spec/lti/claim/message_type":  "LtiResourceLinkRequest",
  "https://purl.imsglobal.org/spec/lti/claim/version":       "1.3.0",
  "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "<LMS_DEPLOYMENT_ID>",
  "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": "<TOOL_LAUNCH_URL>",

  "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
    "id":          "exam-<exam_id>",
    "title":       "<exam title>",
    "description": "<subject or short description>"
  },
  "https://purl.imsglobal.org/spec/lti/claim/context": {
    "id":    "<course id>",
    "label": "<course code>",
    "title": "<course name>"
  },
  "https://purl.imsglobal.org/spec/lti/claim/roles": [
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"
  ],

  "https://purl.imsglobal.org/spec/lti/claim/custom": {
    "quiz_url": "https://<LMS_PUBLIC_URL>/exam/<exam_id>?embedded=1&user_id=<sub>"
  }
}
```

JWT header:

```json
{ "alg": "RS256", "typ": "JWT", "kid": "<LMS_KID>" }
```

### 3.2 What each field is for (the answer to "what do I send?")

| What the proctoring tool needs | Where it lives in the JWT                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| **Student id**                 | `sub` — stable per-user identifier; keys the user row              |
| **Student name**               | `name` (+ optional `given_name`)                                   |
| **Student photo URL**          | `picture` — tool fetches this server-side as the reference photo   |
| **Exam id**                    | `…/claim/resource_link.id`                                         |
| **Exam name**                  | `…/claim/resource_link.title`                                      |
| **Exam URL (iframed)**         | `…/claim/custom.quiz_url`                                          |
| **Course info**                | `…/claim/context.{id,label,title}`                                 |

The `iss`, `aud`, `kid`, `deployment_id`, `message_type`, `version`, `roles`, `target_link_uri` fields are constant per-LMS (set once in config) and don't change per-launch.

### 3.3 Strict requirements

- **`iss`** must match exactly what's registered on the proctoring side (the registered value in §5).
- **`aud`** must equal `TOOL_CLIENT_ID` (`6pYIe1G3jBG7XrK`).
- **`message_type`** must be `LtiResourceLinkRequest`.
- **`resource_link.id`**, **`context.id`**, **`roles`**, **`deployment_id`** are all required. Missing any one → tool responds 400.
- **`custom.quiz_url`** must be an absolute https URL pointing at your iframeable exam page (§4). If you omit it, no exam will render.
- **`picture`** (optional) — if set, the tool fetches it server-side to seed identity verification. If omitted, the tool falls back to a local file lookup by `sub`.

### 3.4 Optional custom claims that tune detection

All optional, clamped server-side. Add to the `…/claim/custom` block if you want to override defaults:

```
identity_check_period, identity_consecutive_fails, identity_lock_enabled,
gaze_yaw_threshold, gaze_pitch_threshold, gaze_duration, gaze_tracking_enabled,
multi_face_enabled, multi_face_duration,
objects_enabled, objects_check_period, objects_confidence, objects_detect_laptop,
voice_enabled, voice_duration, voice_energy_threshold,
audio_alerts_enabled, terminate_on_identity_mismatch
```

### 3.5 The auto-submit HTML

Return this from the "Start Exam" handler (server-rendered):

```html
<!doctype html>
<html>
<body>
  <form id="ltiform" method="POST" action="<TOOL_LAUNCH_URL>">
    <input type="hidden" name="id_token" value="<JWT-you-just-signed>">
  </form>
  <script>document.getElementById('ltiform').submit();</script>
  <noscript>
    <button type="submit" form="ltiform">Continue to proctoring</button>
  </noscript>
</body>
</html>
```

Reference: `backend/lti.py:148` (`lti_auth`, the HTML template starts at line 219).

> Why HTML form-POST and not a 302 redirect? Browsers cap URL length and put `Referer` headers all over GETs. A `POST` with a hidden field is the standard LTI carrier and avoids both issues.

---

## 4. The iframeable exam page — `GET /exam/<exam_id>?embedded=1`

This is the URL you put into `custom.quiz_url`. The proctoring student-web renders it inside an iframe. Three rules:

1. **Strip `X-Frame-Options`** and set `Content-Security-Policy: frame-ancestors *` (or scope to the tool origin). Reference: `backend/main.py:48`.
2. **Cookies the iframe needs must be `SameSite=None; Secure`**. `SameSite=Lax` is silently dropped in cross-site iframes; the student will appear logged out.
3. **Hide LMS chrome when `embedded=1`** — no nav, no header. The student should see only the exam. Reference: `frontend/src/App.tsx:9-10`.

---

## 5. Registration with the proctoring side (one-time)

The proctoring tool only trusts an LMS that has a row in its `tenants` table. **Send the proctoring team these six values** and they'll register you:

| # | Field           | What it is                                                | Example                                                                 |
| - | --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1 | `tenant_name`   | A friendly label for the row in our DB                    | `lms-acme-university`                                                   |
| 2 | `issuer`        | The `iss` you sign every JWT with (= `LMS_PUBLIC_URL`)    | `https://lms.acme.edu`                                                  |
| 3 | `client_id`     | `TOOL_CLIENT_ID` echoed back as-is                        | `6pYIe1G3jBG7XrK`                                                       |
| 4 | `deployment_id` | Whatever you chose in §2.1                                | `1`                                                                     |
| 5 | `kid`           | The key id in your JWT header                             | `lms-key-1`                                                             |
| 6 | `public_pem`    | Contents of `lms_public.pem` (the file body, not the path)| `-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----\n`       |

Easiest delivery — one JSON blob:

```json
{
  "tenant_name":   "lms-acme-university",
  "issuer":        "https://lms.acme.edu",
  "client_id":     "6pYIe1G3jBG7XrK",
  "deployment_id": "1",
  "kid":           "lms-key-1",
  "public_pem":    "-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----\n"
}
```

> Note: the old OIDC `auth_url` field is **no longer needed** with this simplified flow — the proctoring tool never redirects back to you, so it never calls an auth endpoint.

**Sanity check before sending:**
- `client_id` is the value we gave you (`6pYIe1G3jBG7XrK`), NOT something you generated.
- `public_pem` starts with `-----BEGIN PUBLIC KEY-----` and ends with `-----END PUBLIC KEY-----`. If it says `RSA PUBLIC KEY` instead, re-export with `openssl rsa -pubout`.
- The `kid` in this JSON must equal the `kid` your JWTs actually carry in their header.

The proctoring team registers you, confirms, and you're live. No restart/rebuild needed on their side — the `/api/lti/launch` handler re-reads the tenants table on every request.

---

## 6. What the proctoring side does (FYI — nothing for you to implement)

- `POST /api/lti/launch` looks up your tenant by the JWT's `iss`, validates the signature using your `public_pem`, validates `aud`/`kid`/`exp`/required claims.
- It upserts a `User` row keyed by `(tenant_id, lms_user_id=sub)` and an `Exam` row keyed by `(tenant_id, resource_link.id)`.
- It creates a `Session` row and 302-redirects the browser to `https://<TOOL_HOST>/session/<sid>?t=<session_jwt>&quiz=<custom.quiz_url>`. The student-web on that page iframes your exam.

---

## 7. Checklist for the LMS team

- [ ] Decide the public origin for the LMS (HTTPS, single host:port).
- [ ] Generate an RSA 2048-bit keypair (§2.1). Private stays on the server.
- [ ] Pick `issuer`, `deployment_id`, `kid` and commit them to config.
- [ ] Implement the "Start Exam" handler (§3) — mint signed JWT, return auto-POST HTML.
- [ ] Implement the iframeable `/exam/<id>?embedded=1` route (§4).
- [ ] Implement `/api/students/<id>/photo` (or whatever URL you put in the JWT `picture` claim).
- [ ] Send the proctoring team your six registration values (§5).
- [ ] Test the launch end-to-end (§8).

---

## 8. Test plan

1. **Sign-in works**: open the LMS and confirm you are logged in as a student.
2. **Start Exam triggers POST**: open devtools → Network → click Start Exam. You should see exactly one `POST https://<TOOL_HOST>/api/lti/launch` with `id_token=…` in the form body, followed by a `302` to `https://<TOOL_HOST>/session/<uuid>?t=…&quiz=…`.
3. **JWT is valid**: copy `id_token` from the request → paste into jwt.io → confirm header `kid` matches your config, `iss`/`aud`/`sub` are correct, signature verifies against your public PEM.
4. **Iframe shows the exam logged in**: the session page must iframe your exam in its authenticated state. If it shows a login screen, your cookies aren't crossing the iframe — fix `SameSite=None; Secure`.
5. **Wrong issuer is rejected**: temporarily change `iss` to something unregistered → tool responds 400 `no registered platform for issuer …`.
6. **Wrong audience is rejected**: temporarily change `aud` → tool responds 400 `invalid launch: …`.

---

## 9. Common pitfalls

- **`aud` mismatch** — `aud` must equal `6pYIe1G3jBG7XrK`. It is **not** your own LMS client id.
- **`iss` mismatch** — must equal exactly what's in the proctoring DB. Trailing slashes matter; `http://` vs `https://` is tolerated.
- **`kid` mismatch** — the `kid` in your JWT header must equal the `kid` registered on the proctoring side. If you ever rotate keys, send a new `public_pem` + new `kid`.
- **`exp` too short** — under 60 seconds and clock skew will randomly reject. 10 minutes (`iat + 600`) is the sweet spot.
- **Cookies dropped in iframe** — `SameSite=Lax` will silently break the embedded exam. Use `SameSite=None; Secure`.
- **`X-Frame-Options: DENY` from a security middleware** — many frameworks add it by default. Strip it on the `embedded=1` response.
- **CSP `frame-ancestors 'self'`** — same problem; the tool origin must be allowed.
- **Mixing up `quiz_url` and `target_link_uri`** — `target_link_uri` is `<TOOL_LAUNCH_URL>` (the tool); `custom.quiz_url` is your iframeable exam page (your LMS).
- **Sending the JWT as GET in the URL** — don't. Use the form-POST in §3.5. Some browsers and ALBs truncate long query strings.
- **Self-signed certs in dev** — both sides must trust each other's CA, or you'll see `SSL: CERTIFICATE_VERIFY_FAILED` when the tool tries to fetch your `picture` URL.

---

## 10. Reference files in the mock LMS repo

| Concern                            | File                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| Full LMS implementation            | `backend/lti.py`                                          |
| Iframe headers stripping           | `backend/main.py:48`                                      |
| Embedded UI handling               | `frontend/src/App.tsx:9-10`                               |
| Caddy reverse proxy config         | `Caddyfile`                                               |
| End-to-end local setup notes       | `INTEGRATION.md`                                          |

> The reference `backend/lti.py` still contains the old OIDC `/lti/login`+`/lti/auth` flow. For the simplified flow in this doc, you only need to implement the JWT-minting half (see `lti_auth` from line 148 onward — that's the part that actually signs the JWT and renders the form-POST HTML). The OIDC initiation half is no longer used.

---

## 11. Contact

When you've got an exam ready to test:
1. Send the proctoring team your registration JSON + public PEM (§5).
2. They register it and confirm.
3. You click **Start Exam** — both sides watch the proctoring logs for the first launch.

If anything in §8 fails, capture:
- the request URL,
- the decoded JWT (header + payload),
- the proctoring error response.

Those three together are usually enough to diagnose in one round trip.
