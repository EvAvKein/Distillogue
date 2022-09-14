Remaining tasks before each stage of the project:

### Proof-of-concept deployment:
* Flagship/core features:
  * Identities system (already planned)
  * Mindmap layout using D3.js (name TBD)
  * More config options (many already planned, specifics TBA and/or TBD)
  * Add feedback form
* Security:
  * Data validation (API & some preemptive in frontend)
  * HTTP headers checkup (API & frontend)
  * Proper registration/authentication (likely only via third parties)
  * Probably others (i.e actively look for more)
* Regulation:
  * Legal obligations (there's likely a comprehensive resource on this)
  * Placeholder terms-of-service/code-of-conduct
* Optimization:
  * Look into updating "interacted" timestamps within the same database operation as the interaction updates (supposedly with MongoDB's aggregation pipeline)
  * Complete the draftsAndPresets test by finishing the latter portion

### Release-candidate deployment
* All proof-of-concept tasks
* Flagship/core features:
  * Another layout? (ideas welcome)
  * More config options (many already planned, specifics TBA and/or TBD)
  * User & user-to-user functionalities (latter added very cautiously)
  * Others? (ideas welcome)
* Security:
  * DDoS mitigation & maybe a CDN (consider Cloudflare)
* Regulation:
  * Platform moderation
  * User-to-user moderation (post owner & any appointed)
  * Concise terms-of-service (and potentially code-of-conduct)
* Resources & Transparency:
  * Front page
  * Footer (with contact details at least)
  * Publicly display *all* aggregate data collected e.g weeky/monthly active users, configs by popularity
  * A 'why'/core-principles/core-values/project-philosophy page
  * Other ideas (especially transparency-related) welcome!
* Accessibility:
  * Aria attributes & accessibility tree checkup (need to find free, toggleable, configurable software for testing. devtools accessibility tree is insufficient)
* Design makeover:
  * General UI style
  * Color palette
  * Long-term logo & icons (possibly commissioned/paid)
* Ease of Contributing:
  * Prettier (local & CI)
  * Dockerized dev setup (see https://github.com/EvAvKein/Distillogue/issues/1)