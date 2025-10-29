# Rewards Pre-Lander (Static)

A simple, production-ready static landing page to warm up traffic and send visitors to an affiliate tracking link. Mobile-first, accessible, deployable on Vercel/Netlify with no build step.

## Files
- `index.html`
- `styles.css`
- `main.js`
- `assets/`
  - `hero-placeholder.jpg` (placeholder image 2000×1200)
  - `icon-step1.svg`
  - `icon-step2.svg`
  - `icon-step3.svg`

## Quick start
1) Set your affiliate URL
- Open `main.js`
- Update line 1:
```js
const AFFILIATE_URL = "https://your-tracking-link.example";
```

2) Replace the hero image (optional)
- Replace `assets/hero-placeholder.jpg` with a 2000×1200 JPG. Keep the same filename.

3) Run locally
- Open `index.html` in your browser (double-click or serve via any static server).

## Deploy
- Vercel: drag-and-drop the folder into the Vercel dashboard or run `vercel` from this directory.
- Netlify: drag-and-drop the folder into the Netlify dashboard.
- Any static host works (no server-side code required).

## Configuration
- `AFFILIATE_URL` (line 1 in `main.js`) controls where the primary CTA sends users.
- If `AFFILIATE_URL` is empty, an admin modal instructs you to set it.

## Testing & Dev Tools
- Dev mode: append `?dev=true` to the URL to show a "Simulate Conversion" button.
- A/B headline variant: append `?variant=b` to swap the H1 copy variant.

### Acceptance tests
- Responsive: Layout readable and touch-friendly at 320–480, 768, 1024 widths.
- CTA: Clicking primary CTA opens `AFFILIATE_URL` in a new tab; falls back to current tab if pop-up blocked. Local event stored with any UTM params.
- SMS modal: Opens from "Sign up for SMS progress alerts" button; validates U.S. phone numbers (10 digits or +1 format); on submit saves event and shows a toast.
- Cookie banner: Shows on first load; Accept/Dismiss choices stored.
- Dev conversion: `?dev=true` exposes Simulate Conversion; clicking stores event and shows toast.
- Keyboard/focus: All interactive elements reachable by keyboard and have visible focus.
- Admin modal: If `AFFILIATE_URL` is empty, CTA opens the admin modal with setup instructions.

## What this page does NOT do
- No exaggerated claims, no guaranteed rewards, no unethical persuasion.
- Does not collect or send data to external services; events are stored in `localStorage` only.

## Notes
- System fonts (Inter/Roboto fallbacks) are used. No external dependencies.
- JSON-LD and analytics placeholders are included. Insert your snippets where indicated in `index.html` if needed.

## Troubleshooting
- Popups blocked: Browser may block new tabs; the CTA will fall back to redirect in the same tab.
- localStorage unavailable: The page degrades gracefully and logs a console message.
