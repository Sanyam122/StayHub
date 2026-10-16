(() => {
  "use strict";

  // Global form validation handler
  function setupFormValidation(form) {
    if (!form || form.dataset.validated === "true") return;
    form.dataset.validated = "true";

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    // Add inline error message elements
    inputs.forEach(input => {
      if (!input.parentNode.querySelector('.ds-field-error')) {
        const errorEl = document.createElement('div');
        errorEl.className = 'ds-field-error';
        errorEl.style.cssText = 'margin-top:6px; font-size:13px; color:#c62828; display:none;';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
        input.parentNode.appendChild(errorEl);
      }
    });

    function showError(input, message) {
      const errorEl = input.parentNode.querySelector('.ds-field-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      }
      input.setAttribute('aria-invalid', 'true');
      input.style.borderColor = '#d70466';
    }

    function clearError(input) {
      const errorEl = input.parentNode.querySelector('.ds-field-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
      input.removeAttribute('aria-invalid');
      input.style.borderColor = '';
    }

    function validateInput(input) {
      if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          showError(input, 'Please enter a valid email address.');
          return false;
        }
      }
      if (input.type === 'number' && input.hasAttribute('min')) {
        const min = parseFloat(input.getAttribute('min'));
        if (parseFloat(input.value) < min) {
          showError(input, 'Please enter a value greater than or equal to ' + min + '.');
          return false;
        }
      }
      if (input.hasAttribute('minlength')) {
        const minLen = parseInt(input.getAttribute('minlength'), 10);
        if (input.value.length < minLen) {
          showError(input, 'Please enter at least ' + minLen + ' characters.');
          return false;
        }
      }
      if (input.required && !input.value.trim()) {
        const label = input.labels?.[0]?.textContent || 'This field';
        showError(input, label.replace('*', '').trim() + ' is required.');
        return false;
      }
      clearError(input);
      return true;
    }

    inputs.forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') {
          validateInput(input);
        }
      });
    });

    form.addEventListener('submit', (event) => {
      let isValid = true;
      let firstInvalid = null;

      inputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!isValid) {
        event.preventDefault();
        event.stopPropagation();
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;
      }

      form.classList.add('was-validated');
    });
  }

  // Setup validation for all forms with novalidate
  document.querySelectorAll('form[novalidate]').forEach(setupFormValidation);

  // Also handle forms that get added dynamically
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.matches && node.matches('form[novalidate]')) {
          setupFormValidation(node);
        }
        if (node.nodeType === 1 && node.querySelectorAll) {
          node.querySelectorAll('form[novalidate]').forEach(setupFormValidation);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
