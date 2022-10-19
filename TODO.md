Remaining tasks before each stage of the project:

<hr>

## Pre-alpha/for-junior-portfolio's-sake deployment
* ### Infrastructure
  * Docker network setup for prod (nginx, TLS)
* ### Resources & Transparency:
  * Basic front page (e.g pre-alpha disclaimers)
  * Basic about page
  * Contact info
* ### Regulation:
  * Basic legal obligations
  * Placeholder terms-of-service/code-of-conduct
* ### Optimization:
  * Update "interacted" timestamps within the same database operation as the interaction updates (supposedly with MongoDB's aggregation pipeline)
  * Complete the draftsAndPresets test by finishing the latter portion

## Proof-of-concept deployment
* ### All of the above
* ### Flagship/core features:
  * Identities system (already planned)
  * Mindmap layout using D3.js (name TBD), and potentially another? (ideas welcome)
  * More post config options (many already planned, specifics TBA and/or TBD)
  * User & user-to-user functionalities (latter added very cautiously)
  * Others? (ideas welcome)
* ### Regulation:
  * Platform moderation
  * User-to-user moderation (post owner & any appointed)
* ### Resources & Transparency:
  * Publicly display any and all aggregate data collected e.g weeky/monthly active users, configs by popularity
  * A 'why'/core-principles/core-values/project-philosophy page
  * Contact page (e.g feedback/contact form)
* ### Design makeover:
  * General UI style
  * Color palette
  * Long-term logo & icons (possibly commissioned/paid)
* ### Accessibility:
  * Aria attributes & accessibility tree checkup (need to find free, toggleable, configurable software for testing. devtools accessibility tree is insufficient)
* ### Ease of Contributing:
  * Prettier (local & CI)
  * Dockerized dev setup (see https://github.com/EvAvKein/Distillogue/issues/1)
<hr>

## Release-candidate deployment
* ### All of the above
* ### Security:
  * Proper registration/authentication (likely only via third parties)
  * DDoS mitigation & maybe a CDN (consider Cloudflare)
* ### Regulation:
  * Comprehensive legal obligations
  * Concise terms-of-service (and potentially code-of-conduct)
* ### Resources & Transparency:
  * Proper front page
  * Proper about page
  * Concise footer
  * Versioned API
  * Other ideas (especially transparency-related) welcome!
* ### Optimization:
  * Client-side input validation (for preemptive human-readable errors)