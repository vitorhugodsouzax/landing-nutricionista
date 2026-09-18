/* =========================================================
   Landing Page Nutricionista — interações
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Configuração (troque pelos dados reais) ---------- */
  const WHATSAPP_NUMBER = "5500000000000"; // DDI + DDD + número, só dígitos

  // 8 opções de headline — teste com ?h=1 … ?h=8 na URL
  const HEADLINES = [
    "Emagrecer sem viver de dieta é possível — e começa com um plano feito para a sua rotina.",
    "Chega de recomeçar toda segunda-feira. Vamos construir um jeito de comer que dure.",
    "Emagrecimento com equilíbrio: comida de verdade, sem proibições e sem culpa.",
    "Você não precisa de mais uma dieta. Precisa de um plano que caiba na sua vida.",
    "Cuide do seu peso e da sua saúde sem abrir mão do prazer de comer.",
    "Resultados que se mantêm começam com escolhas que você consegue sustentar.",
    "Nutrição personalizada para quem quer emagrecer com saúde e autonomia.",
    "Menos restrição, mais consciência: aprenda a comer bem e mantenha seus resultados.",
  ];

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Links de WhatsApp ---------- */
  $$(".js-wa").forEach((el) => {
    const msg = el.dataset.msg || "Olá! Gostaria de agendar uma consulta.";
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Headline por parâmetro de URL ---------- */
  const h = parseInt(new URLSearchParams(location.search).get("h"), 10);
  if (h >= 1 && h <= HEADLINES.length) $("#heroTitle").textContent = HEADLINES[h - 1];

  /* ---------- Header: sombra ao rolar ---------- */
  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Voltar ao topo (logo) ---------- */
  $$('a[href="#topo"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", location.pathname + location.search);
    })
  );

  /* ---------- Menu mobile ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Cards de identificação ---------- */
  $$(".id-card").forEach((card) => {
    const btn = $(".id-card__inner", card);
    btn.addEventListener("click", () => {
      const open = !card.classList.contains("is-open");
      card.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Carrossel (mobile) ---------- */
  const carousel = $("[data-carousel]");
  if (carousel) {
    const track = $(".carousel__track", carousel);
    const cards = $$(".id-card", track);
    const dotsWrap = $(".carousel__dots", carousel);
    const [prev, next] = $$(".carousel__btn", carousel);

    cards.forEach(() => dotsWrap.appendChild(document.createElement("span")));
    const dots = [...dotsWrap.children];

    const step = () => cards[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 14);
    const current = () => Math.round(track.scrollLeft / step());

    const update = () => {
      const i = Math.min(current(), cards.length - 1);
      dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };

    [prev, next].forEach((b) =>
      b.addEventListener("click", () => {
        track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduceMotion ? "auto" : "smooth" });
      })
    );

    let raf;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- FAQ: um item aberto por vez ---------- */
  const faqItems = $$(".faq__item");
  faqItems.forEach((item) =>
    item.addEventListener("toggle", () => {
      if (item.open) faqItems.forEach((o) => o !== item && (o.open = false));
    })
  );

  /* ---------- Contadores ---------- */
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) return;
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = $$(".reveal", el.parentElement);
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
        el.classList.add("is-visible");
        $$("[data-count]", el).forEach(animateCount);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Fallback de imagens ---------- */
  $$("img").forEach((img) =>
    img.addEventListener("error", () => { img.style.visibility = "hidden"; }, { once: true })
  );

  /* ---------- Ano no rodapé ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
