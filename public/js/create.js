  (() => {
    const page = document.getElementById("create-page");
    const card = document.getElementById("create-card");
    const form = document.getElementById("create-form");
    const submit = document.getElementById("create-submit");
    const fileInput = document.getElementById("image");
    const preview = document.getElementById("imagePreview");
    const previewImg = preview?.querySelector("img");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (fileInput && preview && previewImg) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file && file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          previewImg.src = url;
          preview.hidden = false;
        } else {
          preview.hidden = true;
        }
      });
    }

    if (reduceMotion) {
      form?.addEventListener("submit", () => submit?.classList.add("is-loading"));
      return;
    }

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

    form?.addEventListener("submit", () => {
      submit?.classList.add("is-loading");
      submit?.setAttribute("aria-busy", "true");
    });
  })();