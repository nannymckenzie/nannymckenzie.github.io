# McKenzie Ochoa Conner — Nanny Landing Page

Lead-capture funnel for McKenzie Ochoa Conner's full-time nanny care business in
Bellingham / Whatcom County, WA. All free tier: Vite static site on GitHub Pages,
Supabase (Postgres + edge function) backend, Resend email, QR-coded print flyers.

- **Live site**: https://mckenzie-conner.github.io/mckenzie-ochoa-conner/
- **Backend**: Supabase project `mckenzie-ochoa-conner` (ref `oxamipkpkkyhfjrmvbgs`)
- **Figma**: file `y9TlQQYHCMzbldA5Dy5Qq7` (design system + mobile/desktop frames)

## Commands

```sh
npm run dev      # local dev server
npm run build    # production build to dist/
npm run qr       # regenerate QR codes into flyers/out/
npm run flyers   # re-render flyer PDFs into flyers/out/
```

Deploys happen automatically on push to `main` via GitHub Actions. A second
workflow pings the Supabase function Mon + Thu so the free project never pauses.

## Human to-do list (parameterized)

1. **Resend API key** — sign in to resend.com as antonio.ochoa2804@gmail.com,
   create an API key, then run:
   `supabase secrets set RESEND_API_KEY=re_... --project-ref oxamipkpkkyhfjrmvbgs`
   Until then the function stores leads but skips the email (logged, never fails).
2. **Gmail forward rule** — on antonio.ochoa2804@gmail.com, add a filter that
   auto-forwards emails with subject "New family inquiry" to
   mckenzie.ochoa.conner@gmail.com.
3. **Real photos** — the hero has a marked placeholder.
4. **Rates** — decide whether/how to show rates on the page and flyers.
5. **Copy review** — every copy block in `index.html` and the flyers is a
   placeholder draft marked `<!-- REVIEW -->`.
6. **Optional later** — custom domain on Pages (old QR codes keep working via
   GitHub's 301 redirect from the github.io URL).

## Spam protection

Honeypot field + minimum time-to-submit + per-IP-hash rate limit (3/hour),
all enforced in the `submit-lead` edge function. No CAPTCHA needed for QR-level
traffic.
