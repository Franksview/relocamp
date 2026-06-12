# Relocamp — Learnings

## Format
- **Insight:**
- **Source:** (validated / assumption / unknown)
- **Impact:**

---

## Learnings

### 2026-04-04: Subscribe form was missing from hero state
- **Insight:** Relocamp had subscribe CSS and JS code but the actual HTML form element was never added to the hero/welcome state. Only the contextual subscribe (after search results) worked.
- **Source:** validated (code inspection)
- **Impact:** Fixed — subscribe form now visible on landing page. Should increase subscribe conversions from Relocamp visitors.

### 2026-04-04: 68% of Relocamp visitors don't search
- **Insight:** Only 32% of visitors (23/72 in 14d) actually perform a search. Two-thirds land on the homepage and leave without interacting.
- **Source:** validated (dashboard data, 14-day window ending March 30)
- **Impact:** Hero text/onboarding needs to be more compelling or interactive. The popular chips + cheapest deals button aren't triggering enough action.

### 2026-04-04: 0 deal clicks despite 6 trip adds
- **Insight:** People build trips but nobody clicks through to the provider ("Book →" button). This means the trip planner is interesting but fails to convert to actual bookings.
- **Source:** validated (dashboard data)
- **Impact:** Need to investigate: is "Book →" unclear? Is it hidden? Do people not understand it leads to a real booking? This is the #1 revenue-blocking issue.

### 2026-04-04: Share feature had 0 usage
- **Insight:** The share button in the trip-bar was too subtle (plain border, just said "Share") and only did clipboard copy on desktop. No prompt to share after building a trip.
- **Source:** validated (dashboard: 0 trips shared)
- **Impact:** Improved: orange accent button, popup with WhatsApp/email/copy link, and "Share your trip" option in What's Next card after 2+ legs. Monitor for improvement.

### 2026-04-04: Relocamp not indexed by Google despite GSC setup
- **Insight:** site:relocamp.nl returns 0 results. GSC shows 4 clicks but the site is not appearing in search results. Sitemap was submitted, blog posts are crawled, but full indexing hasn't happened.
- **Source:** validated (Google search + GSC)
- **Impact:** SEO traffic can't grow until this is resolved. Scheduled check for April 7.

### 2026-04-04: Travelpayouts rejected movacamper.com
- **Insight:** Travelpayouts requires content-driven sites with active blogs. Movacamper (tool-only, no blog) was rejected. They said: "Most brands only connect content-driven websites with an active blog."
- **Source:** validated (rejection email)
- **Impact:** Reapply with relocamp.nl (7 blog posts) end of April. Scheduled reminder for April 28.

### 2026-04-04: Chauffeur referral programs don't exist
- **Insight:** Relocatie-bedrijven (Movacar, Transfercar, Imoova) have no "bring a driver" referral programs. They have more drivers than they need — the bottleneck is available vehicles, not drivers.
- **Source:** validated (web research)
- **Impact:** Don't pursue driver referrals. Focus on booking affiliates instead.
