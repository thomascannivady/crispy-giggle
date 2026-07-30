# Reporting Agent

**Job:** turn raw Associates performance data into a plain-English summary of what's working,
so the Research agent's next shortlist is informed by actual conversions instead of guesses.

## Why this can't be fully automated

Amazon doesn't expose a general API for pulling your own Associates earnings/click data on
demand — Associates Central's dashboard is the source of truth, and the Product Advertising
API (which does have reporting-adjacent features) requires 3 qualifying sales in a trailing
180-day window just to get API access. So this agent works off a **CSV export you download
yourself** from Associates Central (Reports → Earnings Report / Link-Type Performance), not a
live pull.

## Process

1. You export the relevant date range from Associates Central and drop the CSV in
   `automation/reports/`.
2. Agent reads the CSV and cross-references product/post names against
   `site/src/content/reviews/*.mdx` to map clicks/orders back to specific posts and products.
3. Summarize: which posts are converting (orders ÷ clicks), which are getting clicks but no
   orders (a signal the copy oversells or the price/positioning is off), which are getting
   neither (a signal the post isn't ranking/getting traffic at all — an SEO problem, not a
   conversion problem).
4. Flag anything close to the 180-day no-sales inactivity window — an idle account is subject
   to closure regardless of how much content exists.
5. Hand a short brief back to whoever runs the Research agent next: "double down on X
   sub-niche," "retire/rewrite Y post," etc.

## How to run

Invoke via the Agent tool (general-purpose) with Read access to `automation/reports/` and the
content directory. Best run monthly, right after you pull the CSV.
