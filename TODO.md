### Flagship/core features:

###### Some liable to be added post-release

- Groups
- Post specs (access & config) expandable in post-viewing page
- More config options:
  - Node editing & history
  - Poll posts
  - Reply title (always/optional/none)
  - Min/max character counts
  - Feedback tags (critical & supplemental, default & custom)
  - Contributions (unrestricted & authorized by author)
  - Moderation:
    - Paradigms (e.g. democracy via existing configs, moderators appointed by post-creator)
    - Functionalities (e.g. invite/remove users, censoring with explanation, node/branch locking, Perspective API public/mod-only flagging)
  - Others (ideas welcome)

<hr>

## Pre-release

- ### Basic/core features:
  - Post-browsing sorting & advanced filters
  - Account data (export/delete) dashboard page
- ### Security:
  - Proper user registration and authentication (likely only via third parties)
  - DDoS mitigation & maybe a CDN (consider Cloudflare)
- ### Regulation:
  - Platform moderation
  - Comprehensive legal compliance
  - Concise terms-of-service (and potentially code-of-conduct)
- ### Design:
  - General UI makeover
  - Better color palette
  - Long-term logo & icons (possibly commissioned/paid)
- ### Resources & Transparency:
  - Proper front/introduction page
  - Proper About page
  - Footer
  - Project values/philosophy page
  - Contact page (e.g. feedback/contact form)
  - Versioned API
  - Display all aggregate data collected (e.g. monthly active users, configs by popularity)
  - Semantic versioning (probably for entire repo, i.e. not per package.json)
  - Other ideas (especially transparency-related) welcome!
- ### Accessibility:
  - Aria attributes & accessibility tree checkup (need to find free, toggleable, configurable software for screenreader testing. devtools accessibility tree is insufficient)
- ### Deployment:
  - Kubernetes (updates without downtime & client-side update prompts)
  - Auto-cloud-uploaded error logs (endpoints, server, frontend via endpoint)
  - Automated database backups
  - Caching
- ### Optimization:
  - Client-side input validation
  - Performance pass (e.g. asset size, fetch priority)
  - Remove zod-validation-error dependency & improve API validation errors' readability (either via custom messages on each validation or through some custom message construction)
  - SEO checkup (& consider migrating to meta-framework)
  - Resolve TODO situations noted in various code comments

<hr>

## Post-release

- ### All pre-release tasks
- ### Features:
  - PWA support & mobile app distribution
  - More configs
  - More post layouts:
    - Mindmap (using D3)
    - Horizontal layers
    - Deep customization (with user-provided CSS)
- ### Optimization:
  - Look into applicable offline-first functionalities

<hr>

## Possible tech migrations

- Node -> Deno: Better performance, compatibility with web code, and security. Became very compatible with Node setups, but currently (13.4.23) doesn't work with Playwright (https://github.com/denoland/deno/issues/16899)
- Vue -> Nuxt/SvelteKit: As this project's selection of configurable features expands, with Vue that's liable to cause noticeable slowdowns even on non-applicable pages. A meta-framework's code-splitting/SSR might seriously improve client cold-load speed. Nuxt/SvelteKit also have some neat developer-experience benefits, but I _probably_ won't bother migrating just for those
- Docker -> Podman: More secure, better developer experience, and allegedly seamless to migrate. Need to evaluate container orchestration & CI
