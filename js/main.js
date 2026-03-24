const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initNavigation() {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');

  if (!nav) {
    return;
  }

  const closeMenu = () => {
    if (!menu || !toggle) {
      return;
    }

    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  const openMenu = () => {
    if (!menu || !toggle) {
      return;
    }

    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  const syncScrolledState = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  syncScrolledState();
  window.addEventListener('scroll', syncScrolledState, { passive: true });

  if (!menu || !toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!menu.classList.contains('is-open')) {
      return;
    }

    const clickedInsideMenu = menu.contains(event.target);
    const clickedToggle = toggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }
  });
}

function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) {
    return;
  }

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  items.forEach((item) => observer.observe(item));
}

function initRotatingWords() {
  if (prefersReducedMotion) {
    return;
  }

  const elements = document.querySelectorAll('[data-rotate]');
  elements.forEach((element) => {
    const values = (element.dataset.rotate || '')
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length < 2) {
      return;
    }

    let index = 0;
    element.textContent = values[index];

    window.setInterval(() => {
      element.classList.add('is-switching');

      window.setTimeout(() => {
        index = (index + 1) % values.length;
        element.textContent = values[index];
        element.classList.remove('is-switching');
      }, 160);
    }, 2200);
  });
}

function initSectionSpy() {
  const navLinks = Array.from(document.querySelectorAll('[data-nav-menu] a[href^="#"]'));
  if (!navLinks.length || !('IntersectionObserver' in window)) {
    return;
  }

  const sectionEntries = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      if (!id) {
        return null;
      }

      const section = document.getElementById(id);
      if (!section) {
        return null;
      }

      return { id, link, section };
    })
    .filter(Boolean);

  if (!sectionEntries.length) {
    return;
  }

  const setActive = (activeId) => {
    sectionEntries.forEach((entry) => {
      entry.link.classList.toggle('is-active', entry.id === activeId);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (visible?.target?.id) {
        setActive(visible.target.id);
      }
    },
    {
      threshold: [0.25, 0.45, 0.65],
      rootMargin: '-30% 0px -45% 0px',
    }
  );

  sectionEntries.forEach((entry) => observer.observe(entry.section));

  if (window.location.hash) {
    const activeId = window.location.hash.slice(1);
    setActive(activeId);
  } else {
    setActive(sectionEntries[0].id);
  }
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) {
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-form-status]');
  const buttonLabel = submitButton?.querySelector('[data-submit-label]');
  const defaultLabel = buttonLabel?.textContent || submitButton?.textContent || 'Send message';

  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) {
      return;
    }

    event.preventDefault();

    if (!submitButton || !status) {
      form.submit();
      return;
    }

    submitButton.disabled = true;
    status.dataset.state = 'loading';
    status.textContent = 'Sending your message...';
    if (buttonLabel) {
      buttonLabel.textContent = 'Sending...';
    } else {
      submitButton.textContent = 'Sending...';
    }

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      form.reset();
      status.dataset.state = 'success';
      status.textContent = 'Message sent successfully. I will get back to you soon.';
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'Message failed to send. You can also email codewithyuv@gmail.com directly.';
    } finally {
      submitButton.disabled = false;
      if (buttonLabel) {
        buttonLabel.textContent = defaultLabel;
      } else {
        submitButton.textContent = defaultLabel;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initReveal();
  initRotatingWords();
  initSectionSpy();
  initContactForm();
});
