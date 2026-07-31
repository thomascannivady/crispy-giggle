# Home Cook House — Amazon.ca Associates affiliate site

A content site + agent pipeline for Amazon Associates affiliate marketing, niche: **Home & Kitchen**,
targeting the **Canadian marketplace (amazon.ca)**. Domain: **homecookhouse.com** (live on
Cloudflare Pages). Associates tag: **homecookhou03-20**.

Read this whole file before publishing anything with real affiliate links — the Associates
Operating Agreement treats most violations as instant, warning-free account termination.

## Why amazon.ca, not amazon.com

Originally set up against the US program (amazon.com), tag `homecookhouse-20` — that account
still exists and is untouched, just unused. Pivoted to amazon.ca because Amazon's US direct
deposit doesn't support Canadian-domiciled bank accounts (confirmed directly in the Associates
Central payment form — Canada isn't in the supported country list at all), and the Payoneer
workaround adds ongoing fees and complexity. Amazon.ca pays in CAD to a normal Canadian bank
account, no workaround needed — confirmed: the Canadian bank account was accepted cleanly on the
Amazon.ca payment form. Trade-off: the Canadian e-commerce market is roughly **28x smaller**
than the US one — fewer buyers, but a payout that actually works cleanly.

## Reality check

- **24-hour cookie window.** Content has to target real buying intent (comparisons, "best X
  for Y," reviews) — general traffic won't convert in time.
- **Commissions are thin.** Home & Kitchen is ~4.5% on the US rate card; Amazon.ca's card may
  differ slightly — check it once approved.
- **Zero-tolerance enforcement.** Missing disclosure, cloaked links, incentivized clicks, or
  scraping Amazon's own pages for content/prices/images can all trigger immediate closure.
- **Agents can do the labor, not the accountability.** The account, the domain, and final
  publish decisions are yours.

## What only you can do

1. ~~Apply for Amazon.ca Associates~~ — done, tracking tag **homecookhou03-20** issued, payment
   method (Canadian bank account) confirmed accepted.
2. ~~Buy a domain~~ — done: **homecookhouse.com**, live on Cloudflare Pages with HTTPS.
3. ~~Get your Amazon.ca tracking tag~~ — done: `homecookhou03-20`, wired into every affiliate
   link.
4. **Get real product images**, once approved: either the SiteStripe browser toolbar (built
   into Associates Central once you're approved) or the Product Advertising API (requires 3
   qualifying sales in the trailing 180 days first — a genuine chicken-and-egg problem early
   on). Never hotlink or scrape Amazon's image URLs directly.
5. **Approve every post** before it goes live. `draft: false` is the publish switch — see the
   review gate below.
6. **Deploy.** Nothing in `automation/` pushes anything live; the Publisher agent stops at
   "build succeeded, ready for you to deploy."

## What's built here

```
AmazonProject/
├── site/                        Astro site (content-collection driven)
│   └── src/
│       ├── content.config.ts    Schema every review post must match
│       ├── content/reviews/     One .mdx file per roundup post
│       ├── components/          AffiliateLink, Disclosure, ProductCard, JsonLd
│       ├── layouts/             BaseLayout, ReviewLayout
│       └── pages/                index + dynamic [...slug] review route
└── automation/
    ├── link-check.mjs           Flags dead/delisted affiliate links
    ├── indexnow-ping.mjs        Pushes new/updated URLs to Bing + Yandex instantly
    └── agents/                  Self-contained prompt specs — Research, Writer,
                                  Publisher, Reporting (see each .md for details)
```

Compliance is baked into the structure, not left to memory:
- `Disclosure.astro` renders the required "As an Amazon Associate I earn from qualifying
  purchases" wording site-wide, plus an inline version per post.
- `AffiliateLink.astro` marks every outbound link `rel="sponsored noopener nofollow"` and adds
  a visible "(paid link)" tag.
- The content schema has no `price` field on purpose — prices go stale, don't hardcode them.
- `[...slug].astro` filters `draft !== false` out of production builds — a forgotten draft flag
  can't leak into the live site even if someone forgets to check.
- `JsonLd.astro` never fabricates `aggregateRating` — no data, no claim.

## The review gate

Every post starts `draft: true`. Nothing with `draft: true` builds into the production output
(dev mode shows drafts so you can review them locally). You explicitly flip the flag once
you've read the post and are comfortable with it going out under your Associates account.

## Roadmap

**Phase 0 — done**
~~Domain purchase~~ → ~~host + deploy~~ → ~~US Associates signup~~ (abandoned, payment method
didn't support Canada) → ~~Amazon.ca Associates signup~~ → ~~Amazon.ca tracking tag~~
(`homecookhou03-20`) → ~~Canadian bank payment confirmed accepted~~.

**Phase 1 — first real content — done**
Research agent found real, sourced candidates for a gooseneck-kettle roundup → Writer agent
(with human editing) turned it into a post → reviewed and approved → published against
amazon.com, then converted to amazon.ca when the pivot happened (all 3 ASINs re-verified live
on amazon.ca, not assumed) → real `homecookhou03-20` tag wired in → re-approved and live at
[homecookhouse.com/reviews/best-electric-kettles-2026](https://homecookhouse.com/reviews/best-electric-kettles-2026/).

**Phase 2 — establish cadence**
Once you trust the pipeline, schedule the Research → Writer loop weekly (see the `schedule`
skill) for new posts, and `automation/link-check.mjs` daily via cron/scheduled task so dead
links get caught fast.

**Phase 3 — close the loop**
Monthly: export an Associates Central earnings report, run the Reporting agent against it,
feed its brief back into what the Research agent targets next.

**Phase 4 — scale carefully**
Only after Phase 1–3 have run cleanly for a while should you consider loosening the review
gate (e.g., auto-publish for well-established post types) — and even then, keep the link
checker and a periodic manual audit of live posts.

## Running the site locally

```bash
cd site
npm run dev
```

## Running IndexNow

Notifies Bing + Yandex immediately about new/updated live URLs, instead of waiting for normal
crawl discovery. Key file lives at `site/public/<key>.txt` and must already be deployed before
this runs (IndexNow checks it's actually reachable). Run this after every deploy that adds or
changes a published post — the Publisher agent does this automatically as its last step.

```bash
cd automation
npm install   # first time only
node indexnow-ping.mjs
```

## Running the link checker

```bash
cd automation
npm install   # first time only
node link-check.mjs
```
