  // Card behaviour: image blur-up, scroll-triggered reveal, cursor spotlight,
  // background parallax and the pointer-following Shortlisted button.
  (function () {
    const page = document.querySelector(".sc-page");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Image blur-up
    document.querySelectorAll(".sc-card").forEach(function (card) {
      const media = card.querySelector(".sc-media");
      const img = card.querySelector(".sc-img");
      const done = () => media.classList.add("is-loaded");
      if (!img) done();
      else if (img.complete && img.naturalWidth) done();
      else { img.addEventListener("load", done); img.addEventListener("error", done); }

      if (reduce) return;
      card.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        card.style.setProperty("--glow", "1");
      });
      card.addEventListener("pointerleave", function () { card.style.setProperty("--glow", "0"); });
    });

    // Scroll reveal: cards (and everything inside them) animate in as they enter view
    const stages = Array.from(document.querySelectorAll(".sc-stage"));
    if (reduce || !("IntersectionObserver" in window)) {
      stages.forEach((s) => s.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(function (entries) {
        entries.filter((e) => e.isIntersecting).forEach(function (e, i) {
          e.target.style.setProperty("--d", Math.min(i, 8) * 80 + "ms");
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
      stages.forEach((s) => io.observe(s));
    }

    if (reduce) return;

    // Background orbs drift against the pointer
    page.addEventListener("pointermove", function (e) {
      const r = page.getBoundingClientRect();
      page.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      page.style.setProperty("--py", ((e.clientY - (r.top < 0 ? 0 : r.top)) / window.innerHeight - 0.5).toFixed(3));
    });
    page.addEventListener("pointerleave", function () {
      page.style.setProperty("--px", 0);
      page.style.setProperty("--py", 0);
    });

    // Shortlisted button: gradient tracks the pointer, click ripples out
    const liked = document.getElementById("likedCards");
    if (liked) {
      liked.addEventListener("pointermove", function (e) {
        const r = liked.getBoundingClientRect();
        liked.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        liked.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
      liked.addEventListener("pointerleave", function () {
        liked.style.setProperty("--mx", "50%");
        liked.style.setProperty("--my", "50%");
      });
      liked.addEventListener("click", function (e) {
        const r = liked.getBoundingClientRect();
        const dot = document.createElement("span");
        dot.className = "ripple";
        dot.style.left = (e.clientX - r.left) + "px";
        dot.style.top = (e.clientY - r.top) + "px";
        liked.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove());
      });
    }
  })();

  // Category chips: selection, overflow fold, spring-driven layout glide, listing filter.
  (function () {
    const root = document.getElementById("categoryChips");
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = root.querySelector(".cg-frame");
    const list = root.querySelector(".cg-list");
    const chips = Array.from(list.querySelectorAll(".cg-chip[data-chip]"));
    const more = list.querySelector(".cg-more");
    const moreText = more ? more.querySelector(".cg-more-text") : null;
    const measure = more ? more.querySelector(".cg-measure") : null;
    const MAX = parseInt(root.dataset.maxVisible, 10) || chips.length;

    const selected = new Set();
    let pinned = new Set();
    let expanded = false;
    let busy = false;
    let active = null;

    function makeSpring(stiffness, damping) {
      const dt = 1 / 240;
      let x = 0, v = 0, t = 0;
      const xs = [0];
      for (let i = 0; i < 2400; i++) {
        v += (-stiffness * (x - 1) - damping * v) * dt;
        x += v * dt;
        t += dt;
        xs.push(x);
        if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
      }
      xs[xs.length - 1] = 1;
      const n = Math.min(xs.length, 64);
      const stops = [];
      for (let i = 0; i < n; i++) stops.push(xs[Math.round(i * (xs.length - 1) / (n - 1))].toFixed(4));
      return { duration: Math.round(t * 1000), easing: "linear(" + stops.join(",") + ")" };
    }
    const supportsLinear = !!(window.CSS && CSS.supports && CSS.supports("animation-timing-function", "linear(0, 1)"));
    const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
    const FALLBACK = { duration: 520, easing: EASE_OUT };
    const MORPH = supportsLinear ? makeSpring(260, 26) : FALLBACK;
    const SNAP = supportsLinear ? makeSpring(420, 24) : FALLBACK;
    if (supportsLinear) root.style.setProperty("--cg-spring", makeSpring(380, 24).easing);

    const run = (el, keyframes, options) => (reduce ? null : el.animate(keyframes, options));
    const done = (anim) => (anim ? anim.finished.catch(function () {}) : Promise.resolve());

    const shownButtons = () => chips.concat(more ? [more] : []).filter((b) => b.offsetParent !== null);
    const snapshot = () => new Map(shownButtons().map((b) => [b, b.getBoundingClientRect()]));

    function flip(first) {
      const out = [];
      first.forEach(function (a, el) {
        if (el.offsetParent === null) return;
        const b = el.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        out.push(done(run(el, [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "none" }], MORPH)));
      });
      return out;
    }

    function enter(els) {
      return els.map((el, i) => done(run(
        el,
        [
          { opacity: 0, transform: "scale(0.9)", filter: "blur(4px)" },
          { opacity: 1, transform: "none", filter: "blur(0px)" }
        ],
        { duration: 420, delay: Math.min(i * 40, 300), easing: EASE_OUT, fill: "backwards" }
      )));
    }

    function morphHeight(h0) {
      const h1 = frame.offsetHeight;
      if (reduce || Math.abs(h0 - h1) < 1) return Promise.resolve();
      frame.style.overflow = "hidden";
      return done(frame.animate([{ height: h0 + "px" }, { height: h1 + "px" }], MORPH))
        .then(function () { frame.style.overflow = ""; });
    }

    function textWidth(text) {
      measure.textContent = text;
      return measure.getBoundingClientRect().width;
    }
    function setMore(text, animated) {
      if (!more) return;
      const cur = moreText.querySelector(".cg-line:not([data-leaving])");
      if (cur && cur.textContent === text) return;
      const w1 = textWidth(text);
      if (!animated || reduce || !cur) {
        if (cur) cur.textContent = text;
        moreText.style.width = w1 + "px";
        return;
      }
      const w0 = moreText.getBoundingClientRect().width;
      const next = cur.cloneNode(false);
      next.textContent = text;
      moreText.appendChild(next);
      cur.setAttribute("data-leaving", "");
      cur.setAttribute("aria-hidden", "true");
      done(cur.animate(
        [{ opacity: 1, transform: "translateY(0)", filter: "blur(0px)" }, { opacity: 0, transform: "translateY(-0.3em)", filter: "blur(2px)" }],
        { duration: 140, easing: "ease-in", fill: "forwards" }
      )).then(function () { cur.remove(); });
      next.animate(
        [{ opacity: 0, transform: "translateY(0.3em)", filter: "blur(4px)" }, { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" }],
        { duration: 220, easing: EASE_OUT, fill: "backwards" }
      );
      moreText.style.width = w1 + "px";
      moreText.animate([{ width: w0 + "px" }, { width: w1 + "px" }], MORPH);
    }

    const hiddenCount = () => chips.filter(function (c, i) {
      const v = c.dataset.chip;
      return !(i < MAX || pinned.has(v) || selected.has(v));
    }).length;

    async function toggleMore() {
      if (busy || !more) return;
      busy = true;
      const first = snapshot();
      const h0 = frame.offsetHeight;

      if (!expanded) {
        expanded = true;
        const incoming = chips.filter((c) => c.hidden);
        incoming.forEach((c) => { c.hidden = false; });
        more.setAttribute("aria-expanded", "true");
        setMore("Show less", true);
        await Promise.all(flip(first).concat(enter(incoming), [morphHeight(h0)]));
      } else {
        pinned = new Set(selected);
        const outgoing = chips.filter((c, i) => c.offsetParent !== null && !(i < MAX || pinned.has(c.dataset.chip)));
        const hadFocus = outgoing.indexOf(document.activeElement) !== -1;
        await Promise.all(outgoing.map((el) => done(run(
          el,
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.9)" }],
          { duration: 120, easing: "ease-in", fill: "forwards" }
        ))));
        expanded = false;
        outgoing.forEach((el) => {
          el.hidden = true;
          el.getAnimations().forEach((a) => a.cancel());
        });
        const left = hiddenCount();
        more.setAttribute("aria-expanded", "false");
        if (left === 0) more.hidden = true;
        else setMore("+" + left + " more", true);
        if (hadFocus) (more.hidden ? chips[0] : more).focus();
        await Promise.all(flip(first).concat([morphHeight(h0)]));
      }

      busy = false;
      syncTabStops();
    }

    function toggle(el) {
      const v = el.dataset.chip;
      const on = selected.has(v);
      if (on) selected.delete(v); else selected.add(v);
      el.setAttribute("aria-pressed", String(!on));
      run(el.querySelector(".cg-body"), [{ transform: "scale(0.94)" }, { transform: "scale(1)" }], SNAP);
      applyFilter();
    }

    function clearAll() {
      selected.clear();
      chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
      applyFilter();
    }

    const cols = Array.from(document.querySelectorAll(".liked-card"));
    const empty = document.getElementById("noResults");
    const status = document.getElementById("chipStatus");

    function applyFilter() {
      const words = chips
        .filter((c) => selected.has(c.dataset.chip))
        .reduce((all, c) => all.concat(c.dataset.match.split(",")), []);

      const first = new Map(cols.filter((c) => c.offsetParent !== null).map((c) => [c, c.getBoundingClientRect()]));
      const incoming = [];
      cols.forEach(function (col) {
        const cat = col.dataset.category || "";
        const show = words.length === 0 || words.some((w) => cat.indexOf(w) !== -1);
        const wasOut = col.classList.contains("sc-out");
        col.classList.toggle("sc-out", !show);
        if (show && wasOut) incoming.push(col);
      });

      first.forEach(function (a, col) {
        if (col.offsetParent === null) return;
        const b = col.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        run(col, [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "none" }], MORPH);
      });
      incoming.forEach((col, i) => run(
        col,
        [{ opacity: 0, transform: "translateY(12px) scale(0.97)" }, { opacity: 1, transform: "none" }],
        { duration: 420, delay: Math.min(i, 8) * 40, easing: EASE_OUT, fill: "backwards" }
      ));

      const count = cols.filter((c) => !c.classList.contains("sc-out")).length;
      if (empty) empty.hidden = count > 0;
      if (status) status.textContent = "Showing " + count + (count === 1 ? " stay" : " stays");
    }

    function syncTabStops() {
      const btns = shownButtons();
      const stop = btns.indexOf(active) !== -1
        ? active
        : (btns.find((b) => b.getAttribute("aria-pressed") === "true") || btns[0]);
      chips.concat(more ? [more] : []).forEach((b) => { b.tabIndex = b === stop ? 0 : -1; });
    }

    root.addEventListener("click", function (e) {
      const btn = e.target.closest(".cg-chip");
      if (!btn || !root.contains(btn)) return;
      if (btn === more) toggleMore(); else toggle(btn);
    });

    root.addEventListener("focusin", function (e) {
      const btn = e.target.closest(".cg-chip");
      if (btn) { active = btn; syncTabStops(); }
    });

    root.addEventListener("keydown", function (e) {
      const btns = shownButtons();
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const last = btns.length - 1;
      const next = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowDown:  i === last ? 0 : i + 1,
        ArrowLeft:  i === 0 ? last : i - 1,
        ArrowUp:    i === 0 ? last : i - 1,
        Home: 0,
        End: last
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      btns[next].focus();
    });

    const clear = document.getElementById("clearChips");
    if (clear) clear.addEventListener("click", clearAll);

    if (more) {
      const line = moreText.querySelector(".cg-line");
      moreText.style.width = textWidth(line.textContent) + "px";
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          const cur = moreText.querySelector(".cg-line:not([data-leaving])");
          if (cur) moreText.style.width = textWidth(cur.textContent) + "px";
        });
      }
    }
    root.classList.add("is-ready");
    syncTabStops();
  })();
