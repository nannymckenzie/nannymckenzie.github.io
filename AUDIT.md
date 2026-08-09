# UX/UI Design Audit — mckenzie-ochoa-conner landing page

Reviewed as a senior product/brand designer, mobile-first lens. Goal: a parent
landing here should think "this person is exceptional, my child would be in
great hands." Current state is clean and competent, but reads "nice template,"
not "top-tier professional." Findings below, ordered by impact. Each item maps
to a change applied in the redesign.

## A. Brand & first impression

1. **No identity anchor.** The page has no header, wordmark, or monogram. On
   mobile the first paint is an eyebrow and a paragraph-length headline —
   nothing that says "this is a considered brand."
   → Add a slim sticky header: monogram + name lockup, persistent "Say hello"
   CTA, backdrop blur.
2. **The photo placeholder is a liability.** A sage blob with "Photo of
   McKenzie coming soon" is the single most trust-damaging element on the page.
   → Replace with a deliberate composition: layered organic frame, botanical
   accents, serif monogram — reads as art direction, not a missing asset.
   Swaps 1:1 for the real photo later.
3. **Generic shapes, no signature.** The inspiration boards (Matisse-style
   botanical cutouts, arc lockups) never made it into the design; only plain
   CSS blobs did. → Introduce a small family of hand-cut botanical SVG sprigs
   and organic section dividers used consistently across site, form, posters,
   and Figma.

## B. Hierarchy & typography

4. **H1 is a 13-word sentence.** It's metadata, not a headline; on mobile it's
   six lines. → Short emotional headline with an italic accent word; the
   credential sentence moves to the lede where it scans.
5. **Monotone rhythm.** Every section: same padding, same h2-with-blob, same
   card shadow. No landmarks, no breathing variation. → Alternating band
   colors with organic dividers, one full-bleed pull-quote section as a
   mid-page landmark, fluid clamp() spacing.
6. **Timid mobile scale.** h1 at 1.9rem with body at 1.06rem gives weak
   contrast between levels. → Larger fluid display scale, refined
   letter-spacing, eyebrow treated as a proper overline.

## C. Trust & conversion

7. **Credentials are plain text chips.** No iconography, flat blue band feels
   dated. → Icon badges (certificate, star, cross-heart) on a cream band tied
   into the hero.
8. **No human voice / social proof.** Nothing breaks the "brochure" register.
   → Full-width pull-quote section in Fraunces italic (her real philosophy
   line) — human, memorable, honest (no fabricated testimonials).
9. **One conversion point.** Single CTA in hero; the form is ~7 mobile screens
   down with nothing in between. → Persistent header CTA + mid-page CTA after
   "Is this a fit?" + sticky mobile CTA bar that hides while the form is on
   screen.
10. **Fit columns have equal weight.** The "not a match" card competes with
    the "great fit" card. → Emphasize the positive card (white, check icons);
    de-emphasize the negative (ghost card, muted markers).

## D. Form UX (the money moment)

11. **Ten stacked full-width fields = perceived length.** → Two-column pairs
    on ≥560px, logical grouping kept, single column on small screens.
12. **Default browser chrome everywhere.** Unstyled select arrows, raw date
    input, no custom focus. → Custom chevron, consistent field styling,
    branded focus ring.
13. **No inline validation.** Only native popups. → `:user-invalid` styling +
    friendly hint text, error color reserved for errors.
14. **No reassurance at the point of commitment.** → Microcopy under submit:
    response-time promise + "your details go only to McKenzie."
15. **Submit under-weighted.** → Full-width (mobile) large button with arrow,
    loading state preserved.

## E. Accessibility (WCAG 2.2 AA)

16. **Input borders fail non-text contrast.** Sage #b6b791 on white ≈ 1.8:1
    (needs 3:1). → Ink-tinted border ≥3:1.
17. **Focus indicator fails.** Pale blue outline ≈ 1.6:1. → 2px brown ring
    with offset, ≥3:1 everywhere, `:focus-visible`.
18. **No reduced-motion handling.** `scroll-behavior: smooth` and JS
    `scrollIntoView` run unconditionally. → `prefers-reduced-motion` guards in
    CSS and JS; reveals disabled for those users.
19. **Disclosure affordance.** Default `details` marker only; add clear +/−
    indicator, larger tap targets (≥44px rows).

## F. Motion & polish

20. **Zero motion design.** → Restrained IntersectionObserver reveals
    (opacity + 12px rise, stagger on card grids), card hover lift, FAQ open
    transition. All gated behind reduced-motion.
21. **Radius inconsistency.** Blob vs 28 vs 16 vs 8 with no rule. → Radius
    scale with intent: fields 12, cards 20, feature cards 28, pills 999,
    blobs only for illustration.
22. **Success state is an anticlimax.** Gray blob + text. → Check-mark badge,
    warm headline, clear "what happens next."

## Verdict

Solid foundation (palette, tone, structure, a11y basics like skip-link and
honeypot are already right). What separates it from top-tier is identity,
art direction, conversion architecture, and micro-craft — all addressed in
the applied redesign.

---

# Poster Audit — Figma poster variations (2026-07-26)

Reviewed against the redesigned landing page. Verdict: functional but generic —
they read as "text on a colored rectangle," not as the same brand as the site.

1. **No brand identity.** None of the three carries the monogram + name lockup.
   Poster A never states her name outside the URL. → Every poster gets the
   brand lockup and the "McK" portrait blob signature.
2. **The site's visual language is missing.** No wave dividers, no botanical
   sprigs, barely any organic shapes — the exact elements that make the site
   feel crafted. → Bring waves, blobs, and sprigs into every layout.
3. **QR placeholders look like missing assets.** Solid black squares read as
   errors. → Styled QR placeholder with finder-pattern corners inside a card
   with a clear "scan" affordance + a human-typable URL fallback.
4. **Weak typographic hierarchy.** No overline system, no italic accent in
   headlines ("teacher's" treatment), flat single-size body runs. → Reuse the
   site's type system: overline, display with accent, lede, small.
5. **Dead space with no rhythm.** A has a large empty cream span; B a white
   void; C floats a quote in green. → Band-based compositions with wave
   transitions, matching the site's alternating rhythm.
6. **Credentials inconsistent with site.** Plain checks and meaningless color
   dots vs. the site's icon badges. → Icon badge treatment on all three.
7. **Poster-craft basics.** A physical poster needs the who/what/where
   scannable in 3 seconds and one clear CTA. C buries the name in the cite
   line. → Name, area, and "full-time, Mon–Fri" always visible; single strong
   scan CTA per poster.
