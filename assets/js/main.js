
(function () {

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(el => observer.observe(el));

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.style.padding = window.scrollY > 40 ? '12px 6%' : '18px 6%';
  });

  /*=====================================
    Contact Form Validation and CAPTCHA
  =======================================*/
  // ── CAPTCHA generator ──────────────────────────────────────────────
  function generateCaptcha() {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const ops = ['+', '−', '×'];
    const opIdx = Math.floor(Math.random() * ops.length);
    let answer;
    if (opIdx === 0) answer = a + b;
    else if (opIdx === 1) answer = a - b;
    else answer = a * b;
    document.getElementById('captchaQ').textContent = `${a} ${ops[opIdx]} ${b}`;
    document.getElementById('captchaExpected').value = answer;
    document.getElementById('captchaAnswer').value = '';
  }

  generateCaptcha();

  // ── Alert helper ───────────────────────────────────────────────────
  function showAlert(type, message) {
    const alertEl = document.getElementById('alert');
    alertEl.className = '';
    alertEl.textContent = '';
    void alertEl.offsetWidth; // reflow to re-trigger animation
    alertEl.className = 'alert ' + type;
    alertEl.textContent = message;
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    const alertEl = document.getElementById('alert');
    alertEl.className = 'alert';
    alertEl.textContent = '';
  }

  // ── AJAX form submission ───────────────────────────────────────────
  document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();

    // 1. Required field validation
    const required = ['first_name', 'last_name', 'email', 'subject', 'message'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.borderColor = '#c8502a';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });

    if (!valid) {
      showAlert('error', '⚠  Please fill in all required fields.');
      return;
    }

    // 2. Email format
    const emailVal = document.getElementById('email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      showAlert('error', '⚠  Please enter a valid email address.');
      document.getElementById('email').style.borderColor = '#c8502a';
      return;
    }

    // 3. CAPTCHA check
    const expected = parseInt(document.getElementById('captchaExpected').value);
    const given = parseInt(document.getElementById('captchaAnswer').value);
    if (isNaN(given) || given !== expected) {
      showAlert('error', '⚠  Incorrect CAPTCHA answer. Please try again.');
      generateCaptcha();
      return;
    }

    // 4. Send via fetch (AJAX)
    const btn = document.querySelector('.form-submit');
    btn.disabled = true;
    btn.innerHTML = 'Sending&hellip;';

    try {
      const response = await fetch('contact_process.php', {
        method: 'POST',
        body: new FormData(this)
      });
      const result = await response.json();

      if (result.status === 'success') {
        showAlert('success', '✓  ' + result.message);
        this.reset();
        generateCaptcha();
      } else {
        showAlert('error', '⚠  ' + result.message);
        generateCaptcha();
      }
    } catch (err) {
      showAlert('error', '⚠  Network error. Please check your connection and try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Send Message';
    }
  });

  //AI Agent
   window.chtlConfig = { chatbotId: "9651246868" };

})();