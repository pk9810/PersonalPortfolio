(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // --- Mobile menu ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  const setMenuOpen = (open) => {
    mobileMenu.classList.toggle("open", open);
    mobileMenu.hidden = !open;
    mobileMenuButton.setAttribute("aria-expanded", String(open));
    mobileMenuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  mobileMenuButton.addEventListener("click", () => {
    setMenuOpen(!mobileMenu.classList.contains("open"));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  // --- Header scroll state + progress ---
  const header = document.querySelector(".site-header");
  const progress = document.getElementById("scroll-progress");
  const pinSection = document.getElementById("pin-story");
  const pinWords = [...document.querySelectorAll(".pin-word")];

  const updatePinWords = () => {
    if (!pinSection || !pinWords.length) return;
    const rect = pinSection.getBoundingClientRect();
    const span = Math.max(pinSection.offsetHeight - window.innerHeight, 1);
    const pct = Math.min(1, Math.max(0, -rect.top / span));
    const activeCount = Math.ceil(pct * pinWords.length) - 1;

    pinWords.forEach((word, i) => {
      word.classList.toggle("active", i <= activeCount);
    });
  };

  const onScroll = () => {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle("scrolled", scrolled > 12);

    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    }

    if (!reduceMotion) updatePinWords();
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updatePinWords, { passive: true });

  if (reduceMotion) {
    pinWords.forEach((w) => w.classList.add("active"));
  }

  // --- Cursor glow + custom voltage cursor ---
  const glow = document.getElementById("cursor-glow");
  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");

  if (finePointer && !reduceMotion && (glow || cursorDot || cursorRing)) {
    let x = -1000;
    let y = -1000;
    let tx = x;
    let ty = y;
    let rx = x;
    let ry = y;
    let raf = 0;

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      rx += (tx - rx) * 0.1;
      ry += (ty - ry) * 0.1;
      if (glow) glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (cursorDot) cursorDot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (cursorRing) cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        glow?.classList.add("on");
        cursorDot?.classList.add("on");
        cursorRing?.classList.add("on");
        if (!raf) raf = requestAnimationFrame(tick);
      },
      { passive: true }
    );

    window.addEventListener("pointerleave", () => {
      glow?.classList.remove("on");
      cursorDot?.classList.remove("on");
      cursorRing?.classList.remove("on");
    });

    document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        if (cursorRing) cursorRing.style.width = "64px";
        if (cursorRing) cursorRing.style.height = "64px";
        if (cursorRing) cursorRing.style.margin = "-32px 0 0 -32px";
      });
      el.addEventListener("pointerleave", () => {
        if (cursorRing) cursorRing.style.width = "42px";
        if (cursorRing) cursorRing.style.height = "42px";
        if (cursorRing) cursorRing.style.margin = "-21px 0 0 -21px";
      });
    });
  }

  // --- Magnetic buttons ---
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 18;
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${mx / strength}px, ${my / strength}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  // --- Light parallax on hero stage ---
  const parallax = document.querySelector("[data-parallax]");
  if (parallax && finePointer && !reduceMotion) {
    const hero = document.getElementById("home");
    hero?.addEventListener(
      "pointermove",
      (e) => {
        const rect = hero.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        parallax.style.transform = `translate3d(${px * 16}px, ${py * 12}px, 0)`;
      },
      { passive: true }
    );
    hero?.addEventListener("pointerleave", () => {
      parallax.style.transform = "";
    });
  }

  // --- Zeus-style appear + stagger ---
  const revealElements = document.querySelectorAll(".reveal");
  const staggerGroups = document.querySelectorAll("[data-stagger]");

  const showEl = (el, delay = 0) => {
    if (el.classList.contains("visible")) return;
    if (delay) el.style.transitionDelay = `${delay}ms`;
    el.classList.add("visible");
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("visible"));
    document.querySelectorAll(".stagger-item").forEach((el) => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showEl(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));

    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const items = entry.target.querySelectorAll(".stagger-item");
          items.forEach((item, i) => showEl(item, i * 90));
          staggerObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    staggerGroups.forEach((group) => staggerObserver.observe(group));
  }

  // --- Animated counters (Zeus metrics) ---
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el) => {
    if (el.dataset.done === "true") return;
    el.dataset.done = "true";
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = target * easeOutCubic(t);
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    };

    if (reduceMotion) {
      el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      return;
    }
    requestAnimationFrame(frame);
  };

  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  // --- Active nav underline ---
  const sections = ["home", "about", "journey", "projects", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll("[data-nav]");

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === `#${id}`);
    });
  };

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveNav(visible.target.id);
      },
      { threshold: [0.25, 0.45, 0.6], rootMargin: "-20% 0px -45% 0px" }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  // --- Lazy-load contact model-viewer ---
  const contactHost = document.getElementById("contact-model-host");
  const contactPlaceholder = document.getElementById("contact-model-placeholder");

  const mountContactModel = () => {
    if (!contactHost || contactHost.dataset.loaded === "true") return;
    contactHost.dataset.loaded = "true";

    const viewer = document.createElement("model-viewer");
    viewer.className = "contact-model";
    viewer.setAttribute("src", "models/RobotExpressive.glb");
    viewer.setAttribute("alt", "Interactive 3D robot model");
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("interaction-prompt", "none");
    viewer.setAttribute("shadow-intensity", "1");
    viewer.setAttribute("loading", "lazy");
    if (reduceMotion) {
      viewer.removeAttribute("auto-rotate");
    }

    contactPlaceholder?.remove();
    contactHost.appendChild(viewer);
  };

  if (contactHost) {
    if (!("IntersectionObserver" in window)) {
      mountContactModel();
    } else {
      const modelObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            mountContactModel();
            modelObserver.disconnect();
          }
        },
        { rootMargin: "200px 0px" }
      );
      modelObserver.observe(contactHost);
    }
  }

  if (reduceMotion) {
    document.querySelectorAll("model-viewer[auto-rotate]").forEach((el) => {
      el.removeAttribute("auto-rotate");
    });
  }

  // --- Modal ---
  const openModalButton = document.getElementById("open-modal-button");
  const closeModalButton = document.getElementById("close-modal-button");
  const modal = document.getElementById("bullet-points-modal");
  let lastFocus = null;

  const openModal = () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
    closeModalButton.focus();
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      modal.hidden = true;
      lastFocus?.focus?.();
    }, 300);
  };

  openModalButton?.addEventListener("click", openModal);
  closeModalButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("open")) {
      closeModal();
    }
  });
})();
