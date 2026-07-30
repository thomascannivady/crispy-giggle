# Home Cook House — Amazon Associates affiliate site

A content site + agent pipeline for Amazon Associates affiliate marketing, niche: **Home & Kitchen**.
Domain: **homecookhouse.com** (live on Cloudflare Pages). Associates tag: **homecookhouse-20**.

Read this whole file before publishing anything with real affiliate links — the Associates
Operating Agreement treats most violations as instant, warning-free account termination.

## Reality check

- **24-hour cookie window.** Content has to target real buying intent (comparisons, "best X
  for Y," reviews) — general traffic won't convert in time.
- **Commissions are thin.** Home & Kitchen is ~4.5%. This needs real traffic volume over time,
  not a one-time setup.
- **Zero-tolerance enforcement.** Missing disclosure, cloaked links, incentivized clicks, or
  scraping Amazon's own pages for content/prices/images can all trigger immediate closure.
- **Agents can do the labor, not the accountability.** The account, the domain, and final
  publish decisions are yours.

## What only you can do

1. ~~Create the Amazon Associates account~~ — applied, tracking tag **homecookhouse-20** issued
   and wired into every affiliate link. Account is in the unpaid trial period until 3 qualifying
   sales land within 180 days — see the Reality Check above.
2. ~~Buy a domain~~ — done: **homecookhouse.com**, live on Cloudflare Pages with HTTPS.
3. ~~Get your Associates tracking tag~~ — done: `homecookhouse-20`.
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
~~Amazon Associates signup~~ → ~~domain purchase~~ → ~~host + deploy~~ → ~~tracking tag~~.
Account is in the unpaid trial period now — needs 3 qualifying sales within 180 days to stay
active, so driving real traffic to what's published matters more than adding more posts blind.

**Phase 1 — first real content — done**
Research agent found real, sourced candidates for a gooseneck-kettle roundup → Writer agent
(with human editing) turned it into a post → reviewed and approved → published live at
[homecookhouse.com/reviews/best-electric-kettles-2026](https://homecookhouse.com/reviews/best-electric-kettles-2026/).
This was done manually end-to-end once so the pipeline's output quality is known before
automating the cadence.

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

## Running the link checker

```bash
cd automation
npm install   # first time only
node link-check.mjs
```
