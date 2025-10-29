const AFFILIATE_URL = "https://uplevelrewarded.com/your-tracking-id-here";

// Utilities
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(k => {
    if (params.has(k)) utm[k] = params.get(k);
  });
  return utm;
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log("localStorage unavailable or quota exceeded", e);
  }
}

function dataLayerPush(obj) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(obj);
  } catch (e) {
    // noop
  }
}

// Sticky header hide on scroll down, show on up
(function setupStickyHeader() {
  const header = qs('#site-header');
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (y > lastY && y > 50) header.classList.add('hidden'); else header.classList.remove('hidden');
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// A/B headline variant via ?variant=b
(function setupHeadlineVariant() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('variant') === 'b') {
    const h1 = qs('#headline');
    if (h1) h1.textContent = 'Try Sponsored Deals and Unlock Real Cash Rewards — Join Free';
  }
})();

// CTA behavior
(function setupCTA() {
  const cta = qs('#primary-cta');
  const adminModal = qs('#admin-modal');
  if (!cta) return;
  cta.addEventListener('click', () => {
    const utm = getUTMParams();
    const evt = { event: 'cta_click', time: new Date().toISOString(), utm };
    safeLocalStorageSet('cta_click_' + Date.now(), evt);
    dataLayerPush(evt);

    if (!AFFILIATE_URL || AFFILIATE_URL.trim() === '') {
      // Show admin modal
      openModal(adminModal);
      return;
    }

    try {
      const newWin = window.open(AFFILIATE_URL, '_blank', 'noopener,noreferrer');
      if (!newWin) window.location.href = AFFILIATE_URL; // popup blocked fallback
    } catch (e) {
      window.location.href = AFFILIATE_URL; // ultimate fallback
    }
  });
})();

// SMS modal
(function setupSMS() {
  const openButtons = [qs('#sms-cta'), qs('#open-sms')].filter(Boolean);
  const modal = qs('#sms-modal');
  const form = qs('#sms-form');
  const phoneInput = qs('#sms-phone');

  openButtons.forEach(btn => btn.addEventListener('click', () => openModal(modal)));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = (phoneInput?.value || '').trim();
    const normalized = normalizeUSPhone(raw);
    if (!normalized) {
      showToast('Please enter a valid U.S. phone number.');
      phoneInput?.focus();
      return;
    }
    const evt = { event: 'sms_optin', phone: normalized, time: new Date().toISOString() };
    safeLocalStorageSet('sms_optin_' + Date.now(), evt);
    dataLayerPush(evt);
    showToast('Thanks! SMS alerts enabled.');
    closeModal(modal);
  });
})();

function normalizeUSPhone(input) {
  const digits = input.replace(/\D+/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return null;
}

// Cookie banner
(function setupCookieBanner() {
  const banner = qs('#cookie-banner');
  const accept = qs('#cookie-accept');
  const dismiss = qs('#cookie-dismiss');
  let choice = null;
  try { choice = localStorage.getItem('cookie_choice'); } catch (_) {}
  if (!choice) banner.classList.add('show');
  function setChoice(val) {
    try { localStorage.setItem('cookie_choice', val); } catch (_) {}
    banner.classList.remove('show');
  }
  accept?.addEventListener('click', () => setChoice('accept'));
  dismiss?.addEventListener('click', () => setChoice('dismiss'));
})();

// Accordion
(function setupAccordion() {
  qsa('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
    });
  });
})();

// Dev-only simulate conversion
(function setupDevTools() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dev') === 'true') {
    const btn = document.createElement('button');
    btn.textContent = 'Simulate Conversion';
    btn.className = 'btn btn-secondary';
    btn.style.margin = '1rem auto';
    btn.setAttribute('aria-label', 'Simulate conversion');
    qs('.container.footer-inner')?.prepend(btn);
    btn.addEventListener('click', () => {
      const evt = { event: 'conversion_simulated', time: new Date().toISOString() };
      safeLocalStorageSet('conversion_' + Date.now(), evt);
      dataLayerPush(evt);
      showToast('Conversion event simulated.');
    });
  }
})();

// Modal helpers with simple focus trap
function openModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  const focusable = getFocusable(modal);
  const prev = document.activeElement;
  modal.dataset.prevFocus = prev && prev instanceof HTMLElement ? '1' : '';
  focusable[0]?.focus();
  function onKey(e) {
    if (e.key === 'Escape') closeModal(modal);
    if (e.key === 'Tab') {
      const elements = getFocusable(modal);
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  modal.addEventListener('keydown', onKey);
  modal.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.dataset.close === 'true') closeModal(modal);
  });
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
}

function getFocusable(root) {
  return qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', root).filter(el => !el.hasAttribute('disabled'));
}

function showToast(message) {
  const toast = qs('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2600);
}


