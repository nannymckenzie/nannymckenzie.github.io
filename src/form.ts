// Lead form wiring: posts JSON to the Supabase edge function, tracks time
// on page for the spam check, and falls back to a mailto link on hard errors.

const FUNCTION_URL = 'https://oxamipkpkkyhfjrmvbgs.supabase.co/functions/v1/submit-lead'
const ADMIN_MAILTO = 'antonio.ochoa2804@gmail.com'

export function wireLeadForm(): void {
  const form = document.getElementById('lead-form') as HTMLFormElement | null
  const status = document.getElementById('form-status')
  const success = document.getElementById('form-success')
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null
  if (!form || !status || !success || !submitBtn) return

  const t0 = Date.now()
  // Lowercased so the poster QR can use uppercase (QR alphanumeric mode).
  const source = new URLSearchParams(window.location.search.toLowerCase()).get('src') || 'website'

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    status.textContent = ''

    if (!form.reportValidity()) return

    const data = new FormData(form)
    const payload: Record<string, unknown> = {
      parent_name: data.get('parent_name'),
      email: data.get('email'),
      phone: data.get('phone'),
      contact_method: data.get('contact_method'),
      town: data.get('town'),
      neighborhood: data.get('neighborhood'),
      children_ages: data.get('children_ages'),
      start_date: data.get('start_date'),
      schedule: data.get('schedule'),
      message: data.get('message'),
      website: data.get('website'),
      source,
      elapsed_ms: Date.now() - t0,
    }

    const submitLabel = submitBtn.innerHTML
    submitBtn.disabled = true
    submitBtn.textContent = 'Sending...'

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        form.hidden = true
        success.hidden = false
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        success.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
        return
      }

      const body = await res.json().catch(() => ({}))
      status.textContent =
        typeof body.error === 'string'
          ? body.error
          : 'Something went wrong. Please try again in a moment.'
    } catch {
      const subject = encodeURIComponent('Nanny care inquiry')
      const body = encodeURIComponent(
        `Hi McKenzie,\n\nName: ${payload.parent_name}\nPhone: ${payload.phone}\n\n${payload.message ?? ''}`,
      )
      status.innerHTML =
        'It looks like the form could not reach the server. You can email me directly instead: ' +
        `<a href="mailto:${ADMIN_MAILTO}?subject=${subject}&body=${body}">send an email</a>.`
    } finally {
      submitBtn.disabled = false
      submitBtn.innerHTML = submitLabel
    }
  })
}
