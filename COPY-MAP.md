# Copy Map

Contract between `index.html` and the Figma replica. Every user-facing text
block carries a `data-copy` anchor. Update this table whenever copy changes.

Source of truth for wording: Figma file `R2SYtD77KvVrU274Gxht8j`, page
`Landing Page`, frame `Landing/Desktop` (desktop is canonical).

2026-08-09 sweep: brand is now **McKenzie Conner** (no "Ochoa") everywhere.
The quote, mid-CTA band, FAQ, and footer sections were dropped; the trust
strip merged into About (3 badges); a sticky rate card joined the Offer
section; the start-date field became free text.

A second section below covers the lead confirmation email (`copy/email.*`).

| Anchor | Current text (first line) |
| --- | --- |
| `misc.skip-link` | Skip to the inquiry form |
| `header.brand-name` | McKenzie Conner |
| `header.brand-tag` | Nanny care · Bellingham, WA |
| `header.cta` | Say hello |
| `hero.eyebrow` | Hello! I'm McKenzie! |
| `hero.h1` | Teacher-Certified Early Childhood Educator |
| `hero.script` | Offering Full-Time Nanny Childcare for One Wonderful Family (Caveat script accent) |
| `hero.lede` | I bring the expertise of an educator and the nurturing, individualized approach of a dedicated caregiver |
| `hero.cta-primary` | Say hello |
| `hero.cta-secondary` | See how I work |
| `hero.meta1` | Bellingham, WA (York Neighborhood) |
| `hero.meta2` | Full-time, Monday to Friday |
| `hero.meta3` | Starting as early as Fall 2026 |
| `about.overline` | About |
| `about.h2` | Passion for early childhood education |
| `about.body1` | As a former primary school teacher with three years experience as a full-time nanny… |
| `about.body2` | References available upon request. (reintroduced 2026-08-15 per Figma annotation) |
| `trust.badge1` | WA State Teacher Certified / Endorsed in Elementary Ed, Visual Arts, English Language Learners |
| `trust.badge3` | STARS Early Childhood Certified (subtitle dropped 2026-08-15) |
| `trust.badge4` | CPR and First Aid Certified (subtitle dropped 2026-08-15) |
| `baby.overline` | Bringing my baby |
| `baby.h2` | Care that comes with a built-in friend |
| `baby.body1` | My little one (born May 2, 2026) will join us most days, creating a small mixed-age environment… |
| `baby.body2` | Our children will be each other’s teachers. With my guided facilitation… |
| `approach.overline` | My approach |
| `approach.h2` | How I care for children (no more `<em>` accent, 2026-08-15) |
| `approach.card1.h3` | Play-based learning |
| `approach.card1.body` | Children do their best learning through play. Our days include projects, art, stories… |
| `approach.card2.h3` | Relationship-centered care |
| `approach.card2.body` | Trusting relationships come first. I love connecting meaningfully with each child… |
| `approach.card3.h3` | Developmentally appropriate practice |
| `approach.card3.body` | With my teaching background, I meet each child exactly where they are at… |
| `offer.overline` | What I offer |
| `offer.h2` | Day-to-day |
| `offer.bullet1` | Full-time nanny care in Whatcom County, at your home and/or at my home. |
| `offer.bullet2` | Age-appropriate activities focused on development of curiosity, creativity, problem-solving… |
| `offer.bullet3` | Strong communication. Daily check-ins along with optional photo and videos sent to you during the day. |
| `offer.bullet4` | Light child-related tidying. Play spaces reset, children's dishes done… |
| `offer.bullet5` | Screen-free fun. Lots of reading, dancing and exploring. |
| `offer.bullet6` | Language development. Intentional language development in English and Spanish (optional). |
| `offer.bullet7` | Healthy nutrition. Optional: I shop, purchase, and prep your child’s homemade plant-based lunches… |
| `rates.card-label` | STARTING HOURLY RATE |
| `rates.amount` | $32 |
| `rates.unit` | per hour |
| `rates.caption` | Full-time · Monday to Friday |
| `rates.legal` | W-2 household employment per Washington law |
| `rates.note` | Happy to collaborate to make this work for the right fit family |
| `fit.overline` | Ideal match |
| `fit.h2` | The right fit matters |
| `fit.yes.h3` | We may be a great fit if you... |
| `fit.yes.item1` | Value play-based learning and time outdoors over screens |
| `fit.yes.item2` | Are excited about a warm mixed-age environment, with my little one joining most days |
| `fit.yes.item3` | Want full-time, long-term care with one consistent, professional caregiver |
| `fit.yes.item4` | Appreciate open, honest communication between parents and caregiver |
| `fit.no.h3` | We may not be the right match if you... |
| `fit.no.item1` | Need care with no other children present |
| `fit.no.item2` | Are looking for occasional babysitting or part-time hours |
| `fit.no.item3` | Need a highly variable or on-call schedule week to week |
| `fit.no.item4` | Prefer a caregiver who focuses on housekeeping beyond the children's needs |
| `inquiry.overline` | Get in touch |
| `inquiry.h2` | Let's connect! Tell me about your family |
| `inquiry.req-note` | * means the field is required. |
| `inquiry.legend1` | About you |
| `inquiry.label.parent-name` | Parents’ names * (free-text, may contain multiple names — José's Figma annotation 2026-08-15) |
| `inquiry.label.email` | Email * |
| `inquiry.label.phone` | Phone * |
| `inquiry.label.contact-method` | Preferred contact method |
| `inquiry.label.town` | Town |
| `inquiry.label.neighborhood` | Neighborhood |
| `inquiry.legend2` | The care you're looking for |
| `inquiry.label.children-ages` | Children and ages (placeholder "e.g. one child, age three") |
| `inquiry.label.start-date` | Desired start date (free-text input, placeholder "e.g. Mid September") |
| `inquiry.label.schedule` | Preferred schedule, Monday to Friday |
| `inquiry.label.message` | Tell me a little about your family and the care you are seeking |
| `inquiry.submit` | Send message |
| `inquiry.privacy` | Your details go only to McKenzie, never shared or added to any list. |
| `inquiry.success.h3` | Thank you! Your note is on its way. |
| `inquiry.success.body` | Thank you so much for reaching out about care for your family! I'm looking forward… |
| `inquiry.success.spam-note` | A confirmation email is on its way to you. If it's not in your inbox in a few minutes… |

Removed 2026-08-09 (sections dropped in Figma, per José's dev annotations):
`trust.badge2`, `trust.badge5`, `about.photo-note`, `about.body2`, `about.body3`,
`quote.*`, `offer.photo-note`, `fit.intro`, `cta.*`, `faq.*`, `inquiry.lede`,
`footer.*`, and `misc.cta-bar` (José dropped the sticky mobile CTA bar —
the header CTA is enough). The old anchors remain only in the stale
`Landing/Mobile` frame (see note at the bottom).

## Share card (Figma page "Share Card", frame `og-card`, exported to public/og-image.png)

| Anchor | Current text (first line) |
| --- | --- |
| `copy/share.script` | Hello! I'm McKenzie! |
| `copy/share.headline` | Teacher-Certified Early Childhood Educator |
| `copy/share.sub` | FULL-TIME NANNY CHILDCARE · BELLINGHAM, WA |
| `copy/share.url` | nannymckenzie.github.io |

## Lead confirmation email (Figma page "Email", frame `Email/Lead Confirmation`)

Source of truth for wording: `emails/lead-confirmation.mjml`. The compiled HTML is
generated, never edited by hand.

Layers named `deco/email.var.<field>` hold sample text for fields interpolated at
send time (first name, summary values) — copy sweeps skip them.
`copy/email.subject` and `copy/email.preheader` live in the side frame
`Email/Meta`; they are email metadata, not rendered layers.

Note: in Figma the three next-steps bullets live in ONE text layer
(`copy/email.next-steps.2`, node 167:295, one line per bullet); the mjml keeps
them as three table rows commented `next-steps.1/2/3`. `copy/email.brand-tag`
and the old `next-steps.1/3` layers were deleted 2026-08-09.

| Anchor | Current text (first line) |
| --- | --- |
| `copy/email.subject` | Thank you for reaching out, {first name}! |
| `copy/email.preheader` | I'm looking forward to reading and responding soon. |
| `copy/email.brand` | McKenzie Conner |
| `copy/email.greeting` | Hi {first name}, |
| `copy/email.thanks` | Thank you so much for reaching out about care for your family! I'm looking forward to reading and responding soon. |
| `copy/email.next-steps.h` | What happens next |
| `copy/email.next-steps.1` | If it feels like we could be a good match, we'll set up a relaxed introductory call… |
| `copy/email.next-steps.2` | From there, we can plan an in-person meeting with your child to see how our fit feels to everyone. |
| `copy/email.next-steps.3` | Lastly, we can schedule a play-date for your child and my baby. |
| `copy/email.summary.h` | What you shared with me |
| `copy/email.summary.label.name` | Name |
| `copy/email.summary.label.email` | Email |
| `copy/email.summary.label.phone` | Phone |
| `copy/email.summary.label.prefers` | Prefers |
| `copy/email.summary.label.town` | Town |
| `copy/email.summary.label.children` | Children |
| `copy/email.summary.label.start-date` | Start date |
| `copy/email.summary.label.schedule` | Schedule |
| `copy/email.cta` | Visit my site |
| `copy/email.signoff` | Warmly, |
| `copy/email.signature` | McKenzie |
| `copy/email.credentials` | WA State Teacher Certified · STARS Early Childhood Education Certified · CPR and First Aid Certified |
| `copy/email.footer.area` | Bellingham, WA (York Neighborhood) |
| `copy/email.footer.reason` | You're receiving this note because you contacted me through nannymckenzie.github.io. |

The receipt renders EVERY form question (Name, Email, Phone, Prefers, Town,
Neighborhood, Children, Start date, Schedule, Message); unanswered fields show
an em dash instead of dropping the row (José's requirement, 2026-08-09). The
Figma frame mirrors the sample preview, which omits Neighborhood and Message.
Summary labels also live in `summaryPairs()` in
`supabase/functions/submit-lead/emails.ts` — keep both in sync.

### Email sweep procedure

When email copy changes (in either direction):

1. Edit wording in `emails/lead-confirmation.mjml` (HTML body), and mirror any
   change to the summary labels, subject, or text version in
   `supabase/functions/submit-lead/emails.ts` (`summaryPairs`,
   `leadConfirmationSubject`, `renderLeadConfirmationText`).
2. Recompile: `npm run email` (regenerates the browser preview and the
   `lead-confirmation-html.ts` template — never edit those two by hand).
3. Update the matching `copy/email.*` layer text on the Figma `Email` page, and
   this table.
4. Redeploy: `supabase functions deploy submit-lead --project-ref oxamipkpkkyhfjrmvbgs`.

## Copy sweep procedure (Figma → index.html)

The Landing Page in Figma (`R2SYtD77KvVrU274Gxht8j`, page `2:2`) holds two replica frames:
`Landing/Desktop` (1440) and `Landing/Mobile` (390). Every text layer that maps to site copy
is named `copy/<anchor>`, matching `data-copy="<anchor>"` in `index.html`. **Desktop is
canonical** — if desktop and mobile disagree, desktop wins.

How a future session applies McKenzie's Figma text edits back to the site:

1. Read all `copy/*` text layers from `Landing/Desktop` via the Figma MCP
   (`get_design_context` on the frame, or a `use_figma` script that returns
   `{name, characters}` for `frame.findAll(n => n.name.startsWith("copy/"))` —
   include invisible layers: `inquiry.success.*` and `misc.skip-link` are
   hidden by design).
2. Also read any **dev-mode annotations** (`node.annotations`, category
   "Development") — José uses them for structural instructions that plain copy
   diffs can't express.
3. For each layer, diff `characters` against the text content of the element with the
   matching `data-copy` attribute in `index.html`.
   - Trust badges (`trust.badge1/3/4`): the Figma layer is two lines — line 1 is the badge
     title, line 2 maps to the `<small>` child.
   - Offer bullets (`offer.bullet1–7`): the leading bold range maps to the `<strong>` child.
   - Labels with a required mark (`inquiry.label.*`, `inquiry.req-note`): the trailing/leading
     `*` belongs to the `<span class="req">` child, not editable text.
   - `approach.h2`: the italic brown range maps to the `<em>` element.
4. Apply **changed strings only** — text edits in place — unless annotations
   call for structural changes.
5. Rebuild (`npm run build`) to confirm nothing breaks.
6. List every applied change (anchor → old text → new text) in the session report.
7. Commit and push (deploys via GitHub Pages).
8. Flag any mobile/desktop mismatches found along the way so the frames can be re-synced.

**STALE FRAME WARNING (2026-08-09):** `Landing/Mobile` (157:210) still shows the
pre-sweep design — old name, old copy, and the dropped sections (quote, CTA
band, FAQ, footer). José's annotations said to drop them "in both", but only
desktop was edited. Sweeps must ignore the mobile frame until it is rebuilt.
