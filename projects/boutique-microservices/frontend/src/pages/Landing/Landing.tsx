import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/sunfreaks.css';
import './Landing.css';

/**
 * SUNFREAKS — pre-launch waitlist landing page.
 * Clean iOS aesthetic: modern biotech solar protection.
 */

const MANTRA_LINES = [
  { text: 'STAY COVERED', className: 'sf-mantra__line--1' },
  { text: 'STAY PROTECTED', className: 'sf-mantra__line--2' },
  { text: 'STAY ELEVATED', className: 'sf-mantra__line--3' },
];

const MARQUEE_PHRASES = [
  'BIOTECH SPF 50 PA++++',
  '•',
  'NO WHITE CAST EVER',
  '•',
  'FERMENTED ECTOINE',
  '•',
  'MELANIN-RICH FIRST',
  '•',
  'REEF & REFILL SAFE',
  '•',
  'LAB TESTED 8-HOUR STABILITY',
  '•',
];

const GAPS = [
  {
    num: '01',
    title: 'The Formula Gap',
    body:
      'Legacy SPF was engineered for one skin tone and never revisited. Everyone else got a chalky grey film and called it protection.',
  },
  {
    num: '02',
    title: 'The Science Gap',
    body:
      'The category has coasted on 1970s chemistry. Meanwhile biotech learned to build actives that repair photodamage, not just block it.',
  },
  {
    num: '03',
    title: 'The Culture Gap',
    body:
      'Sunscreen got sold as a chore — a beige tube at the back of the cabinet. It should feel like something you actually want to reach for.',
  },
];

const BENEFITS = [
  {
    icon: '🧬',
    title: 'Biotech Actives',
    body:
      'Fermented ectoine and bio-identical peptides that work with your skin barrier instead of sitting on top of it.',
  },
  {
    icon: '🌗',
    title: 'Zero White Cast',
    body:
      'Formulated on melanin-rich skin first, then tested across the full Fitzpatrick range. Invisible is the baseline, not a bonus.',
  },
  {
    icon: '🛡',
    title: 'SPF 50 PA++++',
    body:
      'Broad-spectrum UVA and UVB defence with photostability verified at 8 hours, not 80 minutes.',
  },
  {
    icon: '♻',
    title: 'Reef & Refill',
    body:
      'No oxybenzone, no octinoxate. Aluminium bottle, refill pouches, and a take-back programme from launch day.',
  },
];

const CREDENTIALS = [
  'PhD Molecular Biology',
  '11 Years Dermatological R&D',
  '3 Formulation Patents',
];

const Landing: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email so we can save your spot.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('That email does not look right — check it and try again.');
      return;
    }

    setError(null);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="sf">
      {/* Nav */}
      <header className="sf__shell">
        <nav className="sf-nav" aria-label="Primary">
          <Link to="/" className="sf-nav__mark">
            <span aria-hidden="true">☀</span> SUNFREAKS
          </Link>
          <div className="sf-nav__links">
            <a className="sf-nav__link" href="#science">Science</a>
            <a className="sf-nav__link" href="#founder">Founder</a>
            <Link className="sf-nav__link" to="/products">Shop</Link>
            <a className="sf-btn sf-btn--pink" href="#waitlist">Join Waitlist</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="sf-hero sf__shell">
        <div className="sf-sun" aria-hidden="true" />

        <p className="sf-eyebrow" style={{ justifyContent: 'center' }}>
          LAUNCHING SUMMER 2026 · WAITLIST OPEN
        </p>

        <div className="sf-mantra">
          <h1 className="sf-mantra__line sf-mantra__line--1">
            {MANTRA_LINES[0].text}
          </h1>
          {MANTRA_LINES.slice(1).map((line, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={`sf-mantra__line ${line.className}`}
            >
              {line.text}
            </span>
          ))}
        </div>

        <p className="sf-hero__sub">
          Sunscreen rebuilt from the molecule up — by the people the old
          formulas forgot. Clean, invisible protection you will love to wear.
        </p>

        <div className="sf-hero__actions">
          <a className="sf-btn sf-btn--solar" href="#waitlist">Get Early Access</a>
          <a className="sf-btn sf-btn--teal" href="#science">See the Science</a>
        </div>

        <div className="sf-retro-badge-row">
          <span className="sf-badge-tag sf-badge-tag--orange">BIOTECH SPF 50</span>
          <span className="sf-badge-tag sf-badge-tag--pink">ZERO WHITE CAST</span>
          <span className="sf-badge-tag sf-badge-tag--teal">4,200+ ON WAITLIST</span>
        </div>
      </section>

      {/* Marquee */}
      <div className="sf-marquee" aria-hidden="true">
        <div className="sf-marquee__track">
          {[0, 1].map((copy) => (
            <div className="sf-marquee__item" key={copy}>
              {MARQUEE_PHRASES.map((phrase, index) => (
                <span key={index}>{phrase}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Three gaps */}
      <section className="sf-section sf__shell" id="science">
        <p className="sf-eyebrow">DIAGNOSTIC READOUT</p>
        <h2 className="sf-h2">
          An entire category
          <br />
          <span className="sf-solar">stopped evolving.</span>
        </h2>
        <p className="sf-lead" style={{ maxWidth: '50ch', marginTop: '1rem' }}>
          We found three gaps between what sunscreen is and what it should be.
          Sunfreaks exists to close all three.
        </p>

        <div className="sf-gaps">
          {GAPS.map((gap) => (
            <article className="sf-gap" key={gap.num}>
              <div className="sf-gap__num" aria-hidden="true">{gap.num}</div>
              <h3 className="sf-gap__title">{gap.title}</h3>
              <p className="sf-gap__body">{gap.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="sf-section sf-section--ink" id="founder">
        <div className="sf__shell">
          <div className="sf-founder">
            <div className="sf-founder__portrait">
              <span className="sf-founder__badge">FOUNDER PORTRAIT</span>
            </div>

            <div>
              <p className="sf-eyebrow">THE LAB STORY</p>
              <blockquote className="sf-founder__quote">
                “I spent eleven years studying how UV damage actually works at
                the cellular level. Then I looked at what was on the shelf and
                realised nobody had updated the answer in fifty years.”
              </blockquote>
              <p className="sf-lead">
                Sunfreaks was founded by a molecular biologist who got tired of
                explaining why the sunscreen aisle was failing most of the
                planet. Every formula starts in the lab, gets tested on the skin
                tones the industry treats as an afterthought, and only ships
                when it disappears completely.
              </p>
              <ul className="sf-founder__credentials">
                {CREDENTIALS.map((credential) => (
                  <li className="sf-chip" key={credential}>{credential}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="sf-section sf-section--cream">
        <div className="sf__shell">
          <p className="sf-eyebrow">SPECS & ACTIVES</p>
          <h2 className="sf-h2">Lab-grade.<br />Not beige.</h2>

          <div className="sf-benefits">
            {BENEFITS.map((benefit) => (
              <article className="sf-benefit" key={benefit.title}>
                <div className="sf-benefit__icon" aria-hidden="true">
                  {benefit.icon}
                </div>
                <h3 className="sf-benefit__title">{benefit.title}</h3>
                <p className="sf-benefit__body">{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="sf-section" id="waitlist">
        <div className="sf__shell sf-waitlist">
          <p className="sf-eyebrow" style={{ justifyContent: 'center' }}>
            FIRST DROP · LIMITED 1,000 SPOTS
          </p>
          <h2 className="sf-h2">
            Join the <span className="sf-flare">community</span>.
          </h2>
          <p className="sf-lead" style={{ marginTop: '1rem' }}>
            First 1,000 on the list get founder pricing and early batch access
            before the public release.
          </p>

          {submitted ? (
            <div className="sf-form__success" role="status">
              <strong>YOU ARE ON THE LIST. ☀</strong>
              <p style={{ margin: '0.5rem 0 0' }}>
                Watch your inbox — early access drops before the public launch.
              </p>
            </div>
          ) : (
            <form className="sf-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                className="sf-input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'waitlist-error' : undefined}
              />
              <button className="sf-btn sf-btn--solar" type="submit">
                Claim Spot
              </button>
              {error && (
                <p className="sf-form__error" id="waitlist-error" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}

          <p className="sf-form__note">No spam. Unsubscribe anytime.</p>

          <div>
            <p className="sf-form__note" style={{ marginTop: '2rem' }}>
              Or talk to a human
            </p>
            <a className="sf-hotline" href="tel:+18005557890">
              <span aria-hidden="true">☎</span> 1-800-555-7890
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="sf-footer">
        <div className="sf__shell sf-footer__grid">
          <span className="sf-nav__mark">
            <span aria-hidden="true">☀</span> SUNFREAKS
          </span>
          <Link className="sf-btn sf-btn--ghost" to="/products">
            Browse Shop 🛍
          </Link>
          <p className="sf-footer__note">
            © {new Date().getFullYear()} Sunfreaks — Clean Biotech & Solar Protection.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
