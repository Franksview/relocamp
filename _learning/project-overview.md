# Relocamp — Project Overview

## What is the project
Interactive trip planner for campervan relocation deals across Europe. Users search a city, see deals on a map, build multi-leg trips, and get linked to booking providers. Also has a blog with SEO-optimized travel content.

## Relationship to Movacamper
Relocamp is a distribution/marketing site that uses Movacamper's backend API for deal search, tracking, and email subscriptions. Relocamp = content + trip planner, Movacamper = deal aggregator + backend.

## Target customer
Budget travellers 18-30, flexible, looking for cheap road trips across Europe.

## Current stage
**MVP** — Live at relocamp.nl. 7 blog posts, trip planner, subscribe feature. Not yet fully indexed by Google. Funnel tracking recently added (April 2026).

## Domain
relocamp.nl (Vercel, static site with API calls to movacamper.com)

## Tech stack
- Single-file HTML app (index.html, ~3000 lines, inline CSS + JS)
- Leaflet.js for map with CARTO Voyager tiles
- Movacamper API for search, subscribe, tracking
- Vercel hosting (static)
- Blog: static HTML pages

## Key features
- Interactive map with deal arcs + text-only markers
- Multi-leg trip builder with "What's next?" flow
- Share popup (WhatsApp, email, copy link) + native share on mobile
- Subscribe for deal alerts (feeds into Movacamper subscriber system)
- Contextual subscribe after search results
- 7 blog posts targeting long-tail SEO keywords

## Affiliates active on Relocamp
- Priceline (CJ) — hotels
- Camperdays (Awin) — campervan rentals (NL/UK/ES)
- Others linked but not yet affiliate: Trainline, FlixBus, Kiwi.com, Hostelworld, GetYourGuide

## Funnel tracking (added April 2026)
Visitors → Searches → search_results / search_no_results → deal_view → trip_add → deal_click → trip_share

## Open items
- Google indexing: relocamp.nl not fully indexed yet (GSC set up, sitemap submitted)
- 0 deal clicks — "Book →" button not converting
- 0 trip shares — share feature just improved, needs monitoring
- More blog posts needed (target 10+)
- Affiliate links: many are direct, not tracked (GetYourGuide, Hostelworld, FlixBus, etc.)
