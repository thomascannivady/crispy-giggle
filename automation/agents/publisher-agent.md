# Publisher Agent

**Job:** once a human has reviewed a post and flipped `draft: false` in its frontmatter, verify
it's actually safe to ship and get it build-ready. This agent does not deploy — deploying
(pushing live, changing hosting config) is a "publish public content" action and needs the
site owner's explicit go-ahead each time, not a standing automation.

## Process

1. Confirm the post's `draft` field is `false` — if it's still `true`, stop; this post hasn't
   been approved yet.
2. Run the link checker on this post's products: `cd automation && node link-check.mjs`. Any
   `FLAG` result on a non-placeholder ASIN blocks publishing until resolved.
3. Run `cd site && npx astro check` — zero errors required (warnings about deprecated zod
   typings from Astro's own content-collection types are expected and fine).
4. Run `cd site && npm run build` — must complete without errors. This is also the real
   enforcement point for the draft gate: `src/pages/reviews/[...slug].astro` filters out any
   post where `draft !== false` at build time, so even a forgotten draft flag can't leak into
   the production output.
5. Spot-check the built output for the required disclosure text and at least one
   `rel="sponsored"` link, e.g. `grep -r "Amazon Associate" site/dist` and
   `grep -r "sponsored" site/dist`.
6. Report status back to the human: ready to deploy, or what blocked it. Do not run any deploy
   command (`git push`, hosting CLI, etc.) — hand that decision back.

## How to run

Invoke via the Agent tool (general-purpose) with Bash access, prompt = this file + the slug of
the post to check. Runs after every `draft: false` flip, ideally as part of the same session
where the human approved the post.
