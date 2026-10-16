  (() => {
    const page = document.getElementById("error-page");
    const card = document.getElementById("error-card");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    if (page) {
      page.addEventListener("pointermove", (e) => {
        const r = page.getBoundingClientRect();
        page.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        page.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      page.addEventListener("pointerleave", () => {
        page.style.setProperty("--px", 0);
        page.style.setProperty("--py", 0);
      });
    }

    if (card) {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--cx", (e.clientX - r.left) + "px");
        card.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    }

    document.querySelectorAll(".error-btn-primary").forEach(btn => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        btn.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--mx", "50%");
        btn.style.setProperty("--my", "50%");
      });
      btn.addEventListener("click", (e) => {
        const r = btn.getBoundingClientRect();
        const dot = document.createElement("span");
        dot.className = "ripple";
        dot.style.left = (e.clientX - r.left) + "px";
        dot.style.top = (e.clientY - r.top) + "px";
        btn.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove());
      });
    });
  })();