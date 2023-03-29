# Remaining tasks for each stage of the project

<hr>

## ~~Minimal initial deployment~~ COMPLETE

## Proof-of-concept

- ### Flagship/core features:
  - More config options:
    - Polls
    - Feedback tags (critical & supplemental, default & custom, feedback rejection)
    - Contributions (unrestricted & authorized by author)
    - Moderation:
      - Paradigms (e.g democracy via existing configs, moderators appointed by post-creator)
      - Functionalities (e.g censoring with explanation, node/branch locking, Perspective API public/mod-only flagging)
    - Others (ideas welcome)
  - User & user-to-user functionalities (latter added very cautiously)
- ### Regulation:
  - Platform moderation
- ### Resources & Transparency:
  - A 'why'/core-principles/core-values/project-philosophy page
- ### Ease of Contributing:
  - Dockerized dev setup (see https://github.com/EvAvKein/Distillogue/issues/1)
- ### Tests:
  - Write test for site navigation (URL & UI)

<hr>

## Release-worthy

- ### All of the above
- ### Basic features:
  - Session-management dashboard page
- ### Security:
  - Proper registration/authentication (likely only via third parties)
  - DDoS mitigation & maybe a CDN (consider Cloudflare)
- ### Regulation:
  - Comprehensive legal compliance
  - Concise terms-of-service (and potentially code-of-conduct)
- ### Design:
  - General UI makeover
  - Better color palette
  - Long-term logo & icons (possibly commissioned/paid)
- ### Resources & Transparency:
  - Proper introduction/advertising page
  - Proper about page
  - Footer
  - Contact page (e.g feedback/contact form)
  - Versioned API
  - Display all aggregate data collected (e.g monthly active users, configs by popularity)
  - Semantic versioning (probably for entire repo, i.e not per package.json)
  - Other ideas (especially transparency-related) welcome!
- ### Accessibility:
  - Aria attributes & accessibility tree checkup (need to find free, toggleable, configurable software for screenreader testing. devtools accessibility tree is insufficient)
- ### Optimization:
  - Client-side input validation
  - Remove zod-validation-error dependency & improve API validation errors' readability (either via custom messages on each validation or through some custom message construction)
  - Serve posts page as root (for UX)
  - Resolve TODO situations noted in various code comments

<hr>

## Post-release

- ### All of the above
- ### Features:
  - PWA support & mobile app distribution
  - Identities system
  - More configs
  - More layouts:
    - Mindmap (using D3)
    - Horizontal layers
    - Others? (ideas welcome)
- ### Optimization:
  - Look into applicable offline-first functionalities
- ### Tech changes:
  - Node -> Deno: Better performance, compatibility with web code, and security. Became very compatible with Node setups
  - Vue -> SvelteKit: Whether this happens would depend on _a lot_, we'll see
