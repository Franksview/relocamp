#!/usr/bin/env node
/**
 * Generate SEO city landing pages for Relocamp.
 *
 * For each top search city: creates /public/deals/{slug}.html
 * (Vercel serves this as /deals/{slug} with clean URL).
 *
 * Each page:
 * - City-specific <title>, meta description, H1
 * - Static SEO content (for Googlebot)
 * - Live deal fetch on page load (for users)
 * - Internal links to main Relocamp app
 * - FAQ + BreadcrumbList schema.org
 */

const fs = require('fs');
const path = require('path');

// Top search cities from Movacamper dashboard data (30-day window)
// Format: [slug, displayName, country, countryFlag, popularDestinations]
const CITIES = [
  {
    slug: 'munich',
    name: 'Munich',
    country: 'Germany',
    flag: '🇩🇪',
    intro: 'Munich is the top starting point for campervan relocations in Europe. With rental bases here serving Bavaria, the Alps, and the Mediterranean, you can pick up a campervan for €1/day and drive it to Barcelona, Milan, Vienna, or Lisbon.',
    destinations: ['Barcelona', 'Milan', 'Vienna', 'Hamburg', 'Lisbon', 'Paris'],
  },
  {
    slug: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    flag: '🇩🇪',
    intro: 'Berlin is a major hub for campervan relocation deals heading south and west across Europe. Rental companies regularly need vehicles moved from Berlin to Munich, Amsterdam, Prague, and the Mediterranean coast.',
    destinations: ['Munich', 'Amsterdam', 'Prague', 'Hamburg', 'Copenhagen', 'Warsaw'],
  },
  {
    slug: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    flag: '🇳🇱',
    intro: 'Amsterdam is a key departure city for European campervan relocations. From here you can find €1/day deals to Germany, France, Belgium, and deeper into Southern Europe — perfect for backpackers and budget road-trippers.',
    destinations: ['Berlin', 'Paris', 'Brussels', 'Hamburg', 'Frankfurt', 'Barcelona'],
  },
  {
    slug: 'milan',
    name: 'Milan',
    country: 'Italy',
    flag: '🇮🇹',
    intro: 'Milan is the Italian gateway for campervan relocations. Rental companies need vehicles moved from Milan to the Alps, the Adriatic coast, southern Italy, and across the Mediterranean — all bookable from €1/day.',
    destinations: ['Rome', 'Venice', 'Florence', 'Barcelona', 'Munich', 'Nice'],
  },
  {
    slug: 'paris',
    name: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    intro: 'Paris offers regular campervan relocation deals heading to the French Riviera, the Alps, Spain, and the Benelux. For €1/day you can drive a campervan from Paris to Marseille, Barcelona, Amsterdam, or Geneva.',
    destinations: ['Marseille', 'Barcelona', 'Amsterdam', 'Geneva', 'Nice', 'Lyon'],
  },
  {
    slug: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    flag: '🇪🇸',
    intro: 'Barcelona is a key Mediterranean hub for campervan relocations. Because so many travelers fly here and drop off vehicles, rental companies often need them moved north — to France, Germany, or back up the Iberian peninsula — for as little as €1/day.',
    destinations: ['Madrid', 'Valencia', 'Paris', 'Lisbon', 'Munich', 'Milan'],
  },
  // Added 2026-06-12 — Imoova inventory analysis showed these as recurring
  // departure hubs missing from our coverage. See EXP-010 + project-overview.
  {
    slug: 'florence',
    name: 'Florence',
    country: 'Italy',
    flag: '🇮🇹',
    intro: 'Florence has become one of the most reliable departure cities for campervan relocations in Italy. Rental companies regularly need vehicles moved north toward Germany and the Alps, or south toward Rome and the Adriatic coast — often for €1/day with a flexible date window.',
    destinations: ['Rome', 'Milan', 'Venice', 'Munich', 'Barcelona', 'Nice'],
  },
  {
    slug: 'dusseldorf',
    name: 'Düsseldorf',
    country: 'Germany',
    flag: '🇩🇪',
    intro: 'Düsseldorf is a steady source of campervan relocation deals heading south into France, Italy, and Spain. With rental fleets concentrated in the Rhine-Ruhr area, one-way drops to Mediterranean cities come up regularly for €1/day.',
    destinations: ['Nantes', 'Paris', 'Milan', 'Barcelona', 'Lyon', 'Stuttgart'],
  },
  {
    slug: 'stuttgart',
    name: 'Stuttgart',
    country: 'Germany',
    flag: '🇩🇪',
    intro: 'Stuttgart is a major German departure hub for campervan relocations. Rental companies frequently need vehicles moved across the Alps to Italy, west to France, or onward to the Spanish coast — usually at €1/day with flexible pickup dates.',
    destinations: ['Munich', 'Milan', 'Barcelona', 'Lyon', 'Vienna', 'Paris'],
  },
];

function buildPage(city) {
  const title = `${city.name} Campervan Relocation Deals · Drive from €1/day | Relocamp`;
  const description = `Find cheap campervan relocation deals from ${city.name}, ${city.country}. Drive a camper from €1/day to destinations across Europe. Live deals updated daily.`;
  const url = `https://relocamp.nl/deals/${city.slug}`;
  const canonicalUrl = url;

  const destLinks = city.destinations
    .map(d => `<li><a href="/?from=${city.slug}">${city.name} → ${d}</a></li>`)
    .join('\n          ');

  // Schema.org: BreadcrumbList + FAQPage + Place
  const schemaJson = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://relocamp.nl' },
          { '@type': 'ListItem', position: 2, name: 'Deals', item: 'https://relocamp.nl/deals' },
          { '@type': 'ListItem', position: 3, name: city.name, item: canonicalUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How do campervan relocation deals from ${city.name} work?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Rental companies need their campervans moved between cities to rebalance their fleets. They offer these moves as "relocation deals" — you drive the camper from ${city.name} to another city, usually within a set date window, for a symbolic €1/day. You cover fuel, they cover the vehicle.`,
            },
          },
          {
            '@type': 'Question',
            name: `How much does a campervan relocation from ${city.name} cost?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Most relocation deals from ${city.name} cost €1/day. Some include a fuel allowance or free ferry crossings. The catch: dates are fixed by the rental company, and you usually have 3–10 days to complete the trip.`,
            },
          },
          {
            '@type': 'Question',
            name: `Where can I drive a relocation campervan from ${city.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Popular destinations from ${city.name} include ${city.destinations.slice(0, 4).join(', ')}, and more. Destinations depend on where the rental companies currently need vehicles — check the live deals on Relocamp for current routes.`,
            },
          },
          {
            '@type': 'Question',
            name: `Do I need a special license?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `For most campervans under 3.5 tonnes, a standard EU driving license is sufficient. You'll typically need to be 21 or older and have held your license for at least 2 years.`,
            },
          },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://relocamp.nl/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">

<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<script type="application/ld+json">
${JSON.stringify(schemaJson, null, 2)}
</script>

<style>
:root {
  --ink: #1b4332;
  --paper: #faf9f7;
  --sand: #ede6dd;
  --stone: #64748b;
  --forest: #2d6a4f;
  --forest-light: #e6f0ea;
  --sunset: #e8734a;
  --gold: #f5b731;
  --radius: 14px;
  --radius-sm: 10px;
  --transition: 0.2s ease;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--forest); }

.nav {
  background: white;
  border-bottom: 1px solid var(--sand);
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-wrap {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-logo {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.4rem;
  color: var(--forest);
  text-decoration: none;
}
.nav-logo span { color: var(--sunset); }
.nav-cta {
  background: var(--sunset);
  color: white;
  padding: 9px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all var(--transition);
  min-height: 40px;
  display: inline-flex;
  align-items: center;
}
.nav-cta:hover { background: #d4623b; color: white; }

.hero {
  background: linear-gradient(135deg, var(--forest) 0%, #1b4332 100%);
  color: white;
  padding: 60px 20px 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '🗺️';
  position: absolute;
  top: -20px;
  right: -40px;
  font-size: 12rem;
  opacity: 0.08;
  transform: rotate(-8deg);
}
.hero-flag {
  font-size: 3rem;
  margin-bottom: 8px;
}
.hero h1 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 400;
  line-height: 1.15;
  max-width: 720px;
  margin: 0 auto 14px;
}
.hero-sub {
  font-size: clamp(1rem, 2.2vw, 1.15rem);
  opacity: 0.92;
  max-width: 560px;
  margin: 0 auto 28px;
}
.hero-price {
  color: var(--gold);
  font-weight: 700;
}
.hero-cta {
  display: inline-block;
  background: var(--sunset);
  color: white;
  padding: 16px 32px;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(232,115,74,0.4);
  transition: all var(--transition);
  min-height: 52px;
}
.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(232,115,74,0.5);
  color: white;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
}

.intro {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #334155;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-left: 4px solid var(--sunset);
  border-radius: 8px;
}

.section-h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(1.4rem, 3.5vw, 1.8rem);
  font-weight: 400;
  color: var(--ink);
  margin: 40px 0 18px;
}

.live-deals {
  background: white;
  border: 1.5px solid var(--sand);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 24px;
}

.live-deals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.live-deals-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--forest);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: live-pulse 2s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.deal-card {
  background: var(--paper);
  border: 1px solid var(--sand);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  transition: all var(--transition);
  text-decoration: none;
  color: var(--ink);
  display: block;
}
.deal-card:hover {
  border-color: var(--forest);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.deal-route {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--ink);
  margin-bottom: 4px;
}
.deal-meta {
  font-size: 0.78rem;
  color: var(--stone);
}
.deal-price {
  display: inline-block;
  margin-top: 8px;
  background: linear-gradient(135deg, #fff8e6, #fff3d0);
  color: #b8860b;
  padding: 3px 10px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.82rem;
  border: 1px solid rgba(245,183,49,0.3);
}

.deals-loading {
  color: var(--stone);
  font-size: 0.9rem;
  text-align: center;
  padding: 20px;
}

.route-list {
  columns: 2;
  gap: 20px;
  list-style: none;
  padding: 0;
  margin-bottom: 32px;
}
.route-list li {
  padding: 10px 14px;
  margin-bottom: 6px;
  background: white;
  border: 1px solid var(--sand);
  border-radius: 8px;
  break-inside: avoid;
}
.route-list li a {
  text-decoration: none;
  color: var(--ink);
  font-weight: 500;
  font-size: 0.92rem;
}
.route-list li:hover {
  border-color: var(--forest);
}

.faq {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.faq details {
  background: white;
  border: 1px solid var(--sand);
  border-radius: 10px;
  padding: 14px 18px;
}
.faq summary {
  font-weight: 600;
  cursor: pointer;
  color: var(--ink);
  font-size: 0.98rem;
  list-style: none;
  position: relative;
  padding-right: 28px;
  min-height: 24px;
}
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after {
  content: '+';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.3rem;
  color: var(--forest);
  transition: transform var(--transition);
}
.faq details[open] summary::after {
  content: '−';
}
.faq details p {
  margin-top: 10px;
  color: #475569;
  line-height: 1.65;
}

.final-cta {
  background: linear-gradient(135deg, #f5b731 0%, #e8734a 100%);
  color: white;
  padding: 40px 28px;
  border-radius: var(--radius);
  text-align: center;
  margin: 40px 0;
}
.final-cta h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 10px;
}
.final-cta p {
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 22px;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}
.final-cta-btn {
  display: inline-block;
  background: white;
  color: var(--forest);
  padding: 14px 32px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  transition: all var(--transition);
  min-height: 48px;
}
.final-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  color: var(--forest);
}

footer {
  background: white;
  border-top: 1px solid var(--sand);
  padding: 24px 20px;
  text-align: center;
  color: var(--stone);
  font-size: 0.85rem;
}
footer a { color: var(--forest); }

@media (max-width: 600px) {
  .route-list { columns: 1; }
  .hero { padding: 40px 20px 60px; }
  .container { padding: 24px 16px; }
  .intro { padding: 18px; }
  .final-cta { padding: 32px 20px; }
}
</style>
</head>
<body>

<nav class="nav">
  <div class="nav-wrap">
    <a href="/" class="nav-logo">Relo<span>camp</span></a>
    <a href="/" class="nav-cta">Plan a trip →</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-flag">${city.flag}</div>
  <h1>Campervan Relocation Deals from ${city.name}</h1>
  <p class="hero-sub">Drive a campervan across Europe from <span class="hero-price">€1/day</span>. Live deals departing ${city.name} — updated daily.</p>
  <a href="/?from=${city.slug}" class="hero-cta">See live deals from ${city.name} →</a>
</section>

<main class="container">

  <p class="intro">${city.intro}</p>

  <h2 class="section-h2">Live deals from ${city.name}</h2>
  <div class="live-deals">
    <div class="live-deals-header">
      <span class="live-deals-label"><span class="live-dot"></span>Live · fetched now</span>
      <a href="/?from=${city.slug}" style="font-size:0.88rem;color:var(--forest);text-decoration:none;font-weight:600;">Plan a full trip →</a>
    </div>
    <div id="liveDeals" class="deals-loading">Loading current deals from ${city.name}…</div>
  </div>

  <h2 class="section-h2">Popular routes from ${city.name}</h2>
  <ul class="route-list">
          ${destLinks}
  </ul>

  <h2 class="section-h2">Frequently asked questions</h2>
  <div class="faq">
    <details>
      <summary>How do campervan relocation deals from ${city.name} work?</summary>
      <p>Rental companies need their campervans moved between cities to rebalance their fleets. They offer these moves as "relocation deals" — you drive the camper from ${city.name} to another city, usually within a set date window, for a symbolic €1/day. You cover fuel, they cover the vehicle.</p>
    </details>
    <details>
      <summary>How much does a campervan relocation from ${city.name} cost?</summary>
      <p>Most relocation deals from ${city.name} cost €1/day. Some include a fuel allowance or free ferry crossings. The catch: dates are fixed by the rental company, and you usually have 3–10 days to complete the trip.</p>
    </details>
    <details>
      <summary>Where can I drive a relocation campervan from ${city.name}?</summary>
      <p>Popular destinations from ${city.name} include ${city.destinations.slice(0, 4).join(', ')}, and more. Destinations depend on where the rental companies currently need vehicles — check the live deals on Relocamp for current routes.</p>
    </details>
    <details>
      <summary>Do I need a special license?</summary>
      <p>For most campervans under 3.5 tonnes, a standard EU driving license is sufficient. You'll typically need to be 21 or older and have held your license for at least 2 years.</p>
    </details>
    <details>
      <summary>Can I chain multiple relocations into a trip?</summary>
      <p>Yes — this is exactly what Relocamp helps you do. Build a multi-leg trip by chaining relocations from ${city.name} to other hub cities. Each leg costs ~€1/day, so a week-long trip across 3 cities can cost under €10 in rental fees.</p>
    </details>
  </div>

  <section class="final-cta">
    <h2>Ready to plan your ${city.name} road trip?</h2>
    <p>Relocamp shows you live deals, helps you chain multiple relocations into one trip, and alerts you when new deals appear.</p>
    <a href="/?from=${city.slug}" class="final-cta-btn">Start planning →</a>
  </section>

</main>

<footer>
  <p><a href="/">Relocamp</a> · Powered by <a href="https://movacamper.com">Movacamper</a> · Campervan relocation deals across Europe</p>
</footer>

<script>
// ─── HTML-escape helper ───
function escHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
// Additional sanitization for URL attribute values — block javascript: and data: URIs
function safeUrl(u){if(typeof u!=='string')return '#';const t=u.trim().toLowerCase();if(t.startsWith('javascript:')||t.startsWith('data:')||t.startsWith('vbscript:'))return '#';return u;}

// ─── Live deals hydration ───
(async function() {
  const el = document.getElementById('liveDeals');
  if (!el) return;
  try {
    const res = await fetch('https://www.movacamper.com/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: '${city.slug}', radius: 100 }),
    });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const deals = (data.deals || []).slice(0, 8);
    if (deals.length === 0) {
      el.innerHTML = '<p style="color:var(--stone);text-align:center;">No live deals from ${city.name} right now — check back soon, or <a href="/" style="color:var(--forest);font-weight:600;">browse all deals</a>.</p>';
      return;
    }
    el.className = 'deals-grid';
    el.innerHTML = deals.map(d => {
      const toSafe = (d.to || '').replace(/'/g, '').replace(/[<>"]/g,'');
      const providerSafe = (d.provider || '').replace(/'/g,'').replace(/[<>"]/g,'');
      const rawUrl = (d.url && d.url.startsWith('http'))
        ? (d.url.includes('imoova.com') ? d.url + (d.url.includes('?') ? '&' : '?') + 'via=relocamp' : d.url)
        : '/?from=${city.slug}';
      const affiliateUrl = safeUrl(rawUrl);
      return \`
        <a href="\${escHtml(affiliateUrl)}" target="_blank" rel="noopener" class="deal-card" onclick="if(window.gtag)gtag('event','deal_click',{provider:'\${providerSafe}',from:'${city.slug}',to:'\${toSafe}'})">
          <div class="deal-route">${city.name} → \${escHtml(d.to)}</div>
          <div class="deal-meta">\${escHtml(d.date_range || 'Flexible dates')} · \${escHtml(d.vehicle || 'Campervan')}</div>
          <div class="deal-price">\${escHtml(d.price || '€1/day')}</div>
        </a>
      \`;
    }).join('');
  } catch (err) {
    el.innerHTML = '<p style="color:var(--stone);text-align:center;">Could not load live deals. <a href="/" style="color:var(--forest);font-weight:600;">Visit Relocamp →</a></p>';
  }
})();

// ─── Simple pageview tracking ───
try {
  fetch('https://www.movacamper.com/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: '/deals/${city.slug}', source: 'relocamp', event: 'pageview' }),
    keepalive: true,
  }).catch(() => {});
} catch (e) {}
</script>

</body>
</html>
`;
}

// ─── Generate all pages ───
const outputDir = path.join(__dirname, '..', 'public', 'deals');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

CITIES.forEach(city => {
  const html = buildPage(city);
  const outPath = path.join(outputDir, `${city.slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`✓ Generated: /deals/${city.slug}.html (${Math.round(html.length / 1024)} KB)`);
});

// ─── Also generate an index page listing all deal cities ───
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Campervan Relocation Deals by City | Relocamp</title>
<meta name="description" content="Browse campervan relocation deals by departure city across Europe. From €1/day — live deals from Munich, Berlin, Amsterdam, Paris, and more.">
<link rel="canonical" href="https://relocamp.nl/deals">
<meta property="og:title" content="Campervan Relocation Deals by City | Relocamp">
<meta property="og:description" content="Browse campervan relocation deals by departure city. From €1/day.">
<meta property="og:image" content="https://relocamp.nl/og-image.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --ink: #1b4332;
  --paper: #faf9f7;
  --sand: #ede6dd;
  --forest: #2d6a4f;
  --sunset: #e8734a;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', sans-serif;
  background: var(--paper);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
.nav { background: white; border-bottom: 1px solid var(--sand); padding: 14px 20px; }
.nav-wrap { max-width: 960px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--forest); text-decoration: none; }
.nav-logo span { color: var(--sunset); }
.nav-cta { background: var(--sunset); color: white; padding: 9px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.88rem; min-height: 40px; display: inline-flex; align-items: center; }
.hero { padding: 60px 20px; text-align: center; }
.hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 5vw, 2.5rem); font-weight: 400; max-width: 680px; margin: 0 auto 12px; }
.hero p { color: #475569; font-size: 1.05rem; max-width: 540px; margin: 0 auto; }
.grid { max-width: 960px; margin: 0 auto; padding: 0 20px 60px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.city-card { background: white; border: 1.5px solid var(--sand); border-radius: 14px; padding: 24px 20px; text-decoration: none; color: var(--ink); transition: all 0.2s; }
.city-card:hover { border-color: var(--forest); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
.city-flag { font-size: 2rem; margin-bottom: 8px; }
.city-name { font-family: 'DM Serif Display', serif; font-size: 1.3rem; margin-bottom: 4px; }
.city-country { color: #64748b; font-size: 0.85rem; }
.city-arrow { color: var(--forest); font-weight: 700; margin-top: 12px; font-size: 0.9rem; }
footer { background: white; border-top: 1px solid var(--sand); padding: 24px 20px; text-align: center; color: #64748b; font-size: 0.85rem; }
footer a { color: var(--forest); }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-wrap">
    <a href="/" class="nav-logo">Relo<span>camp</span></a>
    <a href="/" class="nav-cta">Plan a trip →</a>
  </div>
</nav>
<section class="hero">
  <h1>Campervan Relocation Deals by City</h1>
  <p>Pick your departure city to see live campervan relocation deals from €1/day.</p>
</section>
<div class="grid">
${CITIES.map(c => `  <a href="/deals/${c.slug}" class="city-card">
    <div class="city-flag">${c.flag}</div>
    <div class="city-name">${c.name}</div>
    <div class="city-country">${c.country}</div>
    <div class="city-arrow">See deals →</div>
  </a>`).join('\n')}
</div>
<footer>
  <p><a href="/">Relocamp</a> · Campervan relocation deals across Europe</p>
</footer>
</body>
</html>
`;
fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');
console.log(`✓ Generated: /deals/index.html (${Math.round(indexHtml.length / 1024)} KB)`);

console.log(`\n${CITIES.length + 1} pages generated in ${outputDir}`);
