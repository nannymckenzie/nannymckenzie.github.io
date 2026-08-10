import '@fontsource-variable/fraunces'
import '@fontsource-variable/nunito-sans'
import '@fontsource-variable/caveat'
import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'
import { wireLeadForm } from './form'

// Reveal styles are scoped under .js so content stays visible without JS
document.documentElement.classList.add('js')

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Scroll reveals
const revealTargets = document.querySelectorAll<HTMLElement>('.reveal')
if (!prefersReduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  revealTargets.forEach((el) => io.observe(el))
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'))
}

// Header shadow once the page scrolls
const header = document.getElementById('site-header')
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

// Sticky mobile CTA: appears after the hero, hides while the form is on screen
const ctaBar = document.getElementById('cta-bar')
const hero = document.querySelector('.hero')
const inquiry = document.getElementById('inquiry')
if (ctaBar && hero && inquiry && 'IntersectionObserver' in window) {
  let pastHero = false
  let formInView = false
  const update = () => ctaBar.classList.toggle('is-hidden', !pastHero || formInView)
  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting
    update()
  }).observe(hero)
  new IntersectionObserver(([entry]) => {
    formInView = entry.isIntersecting
    update()
  }).observe(inquiry)
}

wireLeadForm()
