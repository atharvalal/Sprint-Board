"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.getElementById("siteHeader");
const burger = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");
const closeButton = document.getElementById("closeMobileNav");
const backToTop = document.getElementById("backTop");
const traceFill = document.getElementById("traceFill");

document.getElementById("year").textContent = new Date().getFullYear();

function setMenu(open) {
  mobileNav.classList.toggle("open", open);
  mobileNav.setAttribute("aria-hidden", String(!open));
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);

  if (open) {
    closeButton.focus();
  } else if (document.activeElement === closeButton) {
    burger.focus();
  }
}

burger.addEventListener("click", () => setMenu(true));
closeButton.addEventListener("click", () => setMenu(false));
mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav.classList.contains("open")) {
    setMenu(false);
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

/* Stagger elements that share a reveal group. */
document.querySelectorAll(".skills-grid, .project-grid").forEach((group) => {
  group.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
  });
});

const revealElements = document.querySelectorAll(".reveal");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("in"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: "0px 0px -7%" });

  revealElements.forEach((element) => revealObserver.observe(element));
}

/* Keep navigation, circuit nodes and the trace synced with scroll position. */
const sections = [...document.querySelectorAll("main > section[id]")];
const navLinks = [...document.querySelectorAll(".desktop-nav a[data-nav]")];
const traceNodes = [...document.querySelectorAll(".trace-node")];

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  const activeId = visible.target.id;
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.nav === activeId));
  traceNodes.forEach((node) => node.classList.toggle("active", node.dataset.target === activeId));
}, { rootMargin: "-25% 0px -55%", threshold: [0, 0.15, 0.5] });

sections.forEach((section) => sectionObserver.observe(section));

let scrollFramePending = false;
function updateScrollEffects() {
  const scrollTop = window.scrollY;
  const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(scrollTop / scrollRange, 0), 1);

  header.classList.toggle("scrolled", scrollTop > 24);
  traceFill.style.strokeDashoffset = String(1000 - (1000 * progress));
  scrollFramePending = false;
}

window.addEventListener("scroll", () => {
  if (scrollFramePending) return;
  scrollFramePending = true;
  window.requestAnimationFrame(updateScrollEffects);
}, { passive: true });
updateScrollEffects();

/* Remove delayed reveals when returning via browser history. */
window.addEventListener("pageshow", (event) => {
  if (event.persisted) updateScrollEffects();
});
