# Remaining tasks for each stage of the project

<hr>

## ~~Minimal initial deployment~~ COMPLETE

## Proof-of-concept

- ### Flagship/core features:
  - More config options:
    - Node editing & history
    - Poll posts
    - Reply title (always/optional/none)
    - Min/max character count
    - Feedback tags (critical & supplemental, default & custom)
    - Contributions (unrestricted & authorized by author)
    - Moderation:
      - Paradigms (e.g democracy via existing configs, moderators appointed by post-creator)
      - Functionalities (e.g censoring with explanation, node/branch locking, Perspective API public/mod-only flagging)
    - Others (ideas welcome)
  - More scalable config & access layouts in post-creation
  - User & user-to-user functionalities (latter added very cautiously)
- ### Regulation:
  - Platform moderation
- ### Ease of Contributing:
  - Dockerized dev setup (see https://github.com/EvAvKein/Distillogue/issues/1)
- ### Tests:
  - Test post creation and list

<hr>

## Release-worthy

- ### All of the above
- ### Basic/core features:
  - Config tooltips/info-buttons
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
  - Project values/principles/philosophy page
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
  - Serve posts page as root
  - Resolve TODO situations noted in various code comments

<hr>

## Post-release

- ### All of the above
- ### Features:
  - Groups
  - PWA support & mobile app distribution
  - More configs
  - More layouts:
    - Mindmap (using D3)
    - Horizontal layers
    - Others? (ideas welcome)
- ### Optimization:
  - Look into applicable offline-first functionalities
- ### Tech changes:
  - Node -> Deno: Better performance, compatibility with web code, and security. Became very compatible with Node setups, but currently (13.4.23) doesn't work with Playwright (https://github.com/denoland/deno/issues/16899)
  - Vue -> Nuxt/SvelteKit: This project's gimmick of feature configurability/selection (with layout selection in future) is prone to tons of conditionally-unused code, so code-splitting/SSR might seriously improve load times (I'd need to look into whether Nuxt/SvelteKit code-split based on such in-route/page conditionals). Nuxt/SvelteKit also have some neat DX benefits, but I _probably_ won't bother migrating just for those
