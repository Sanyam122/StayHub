
  (() => {
    const page = document.getElementById("login-page");
    const card = document.getElementById("login-card");
    const form = document.getElementById("login-form");
    const submit = document.getElementById("login-submit");
    const passwordInput = document.getElementById("password");
    const toggleButton = document.getElementById("toggle-password");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Show / hide password */
    if (passwordInput && toggleButton) {
      toggleButton.addEventListener("click", () => {
        const hidden = passwordInput.type === "password";
        passwordInput.type = hidden ? "text" : "password";
        toggleButton.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
        toggleButton.setAttribute("aria-pressed", String(hidden));
      });
    }

    if (reduceMotion) {
      form?.addEventListener("submit", () => submit?.classList.add("is-loading"));
      return;
    }

    /* Background parallax: orbs drift gently against the pointer */
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

    /* Card spotlight follows the pointer */
    if (card) {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--cx", (e.clientX - r.left) + "px");
        card.style.setProperty("--cy", (e.clientY - r.top) + "px");
      });
    }

    /* Submit button: gradient tracks the pointer, click ripples out */
    if (submit) {
      submit.addEventListener("pointermove", (e) => {
        const r = submit.getBoundingClientRect();
        submit.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        submit.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });

      submit.addEventListener("pointerleave", () => {
        submit.style.setProperty("--mx", "50%");
        submit.style.setProperty("--my", "50%");
      });

      submit.addEventListener("click", (e) => {
        const r = submit.getBoundingClientRect();
        const dot = document.createElement("span");
        dot.className = "ripple";
        dot.style.left = (e.clientX - r.left) + "px";
        dot.style.top = (e.clientY - r.top) + "px";
        submit.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove());
      });
    }

    /* Loading state once the form is valid and sending */
    form?.addEventListener("submit", () => {
      submit?.classList.add("is-loading");
      submit?.setAttribute("aria-busy", "true");
    });
  })();
