# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/security/passkeys.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Passkeys Orientation

This guide provides high-density, action-oriented orientation for implementing secure, framework-agnostic passkey authentication and credential management in modern web applications.

## 1. Core Prerequisites for Passkeys

Passkeys rely on the Web Authentication API (WebAuthn), which imposes strict cross-cutting security constraints that must be satisfied before any implementation attempt:
*   **Secure Contexts**: WebAuthn methods (`navigator.credentials.create` and `navigator.credentials.get`) are strictly gated behind Secure Contexts. Applications MUST run on `https://` in production, or `http://localhost` for local development.
*   **Relying Party (RP) ID**: Every credential is tied to an RP ID (essentially the domain name of the application). The RP ID passed in the server-side options MUST match or be a valid registrable domain suffix of the current origin's domain name (e.g., `example.com` is valid for `login.example.com`), or be authorized via Related Origin Requests (`/.well-known/webauthn`). Mismatches result in `SecurityError` exceptions on the client side. **DO NOT** derive `rpId` from `window.location.hostname` on the client (for example, when calling WebAuthn Signal API methods), because `window.location.hostname` will not match a parent-domain or related-origin RP ID configured on the server; always read `rpId` from the server-provided WebAuthn options (`publicKey.rp.id` or `publicKey.rpId`) or backend API responses.

## 2. The AAGUID UX Caveat

The Authenticator Attestation Globally Unique Identifier (AAGUID) is a 128-bit identifier returned in the registration attestation data that represents the model/provider of the authenticator (e.g., Google Password Manager, iCloud Keychain, 1Password).
*   **UX Hinting Only**: Relying Parties MUST use the AAGUID exclusively for UX hints (such as rendering the passkey provider name and icon in a management list to help the user).
*   **No Security Dependencies**: applications MUST NOT use AAGUID for cryptographic security or access decisions. Platform passkeys do not currently provide cryptographic attestation for their AAGUIDs, meaning it can be altered or simulated by user agents.

## 3. Decoupled Library Recommendations

For backend FIDO2/WebAuthn options generation and signature verification, developers MUST rely on vetted open source libraries per language instead of hand-rolling cryptography:
*   **JavaScript/TypeScript**: SimpleWebAuthn (github.com/MasterKale/SimpleWebAuthn)
*   **Python**: py_webauthn (github.com/duo-labs/py_webauthn)
*   **Java**: Java WebAuthn Server (github.com/Yubico/java-webauthn-server), WebAuthn4J (github.com/webauthn4j/webauthn4j)
*   **.NET**: .NET library for FIDO2 (github.com/abergs/fido2-net-lib)
*   **Go**: WebAuthn Go Library (github.com/go-webauthn/webauthn)
*   **Ruby**: WebAuthn Ruby (github.com/cedarcode/webauthn-ruby)
*   **PHP**: WebAuthn Framework (github.com/web-auth/webauthn-framework)

## 4. Use Case Reference Matrix

Identify the matching use case below and retrieve its full implementation guide. Every use case has critical APIs (`PublicKeyCredential.parseCreationOptionsFromJSON`, `parseRequestOptionsFromJSON`, `signalAllAcceptedCredentials`, `signalCurrentUserDetails`, `signalUnknownCredential`, conditional mediation, AAGUID handling, etc.) that are documented only in the per-use-case guide. Do NOT skip this retrieval step, and do NOT substitute third-party library wrappers (such as SimpleWebAuthn's `startAuthentication`/`startRegistration`) on the client — call the native WebAuthn browser APIs directly. Library recommendations in Section 3 apply to the **server-side** (backend FIDO2 verification) only.

Specific passkey and WebAuthn implementation details are mapped to the following guides:
*   **Passkey Registration**: `passkey-registration` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) — Offering new passkey registration and promotions.
*   **Passkey Conditional Create**: `passkey-conditional-create` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) — Silently registering passkeys immediately after successful password login.
*   **Passkey Authentication**: `passkey-authentication` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) — Discoverable-autofill and button sign-ins.
*   **Quick Sign-Ins**: `quick-sign-ins` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) — Contextual in-place sign-ins with local passkeys and saved passwords before page navigation.
*   **Passkey Management**: `passkey-management` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) — Syncing lists, renames, and deletions with password managers.
*   **Passkey Reauthentication**: `passkey-reauthentication` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) — Re-verifying returning signed-in users for sensitive steps.

