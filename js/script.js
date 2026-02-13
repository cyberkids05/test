/**
 * Absensi Santri - Auth Page Script
 * Handles form toggling, validation, and password visibility
 */

document.addEventListener('DOMContentLoaded', function () {
  // --- DOM Elements ---
  const loginSection = document.getElementById('loginSection');
  const registerSection = document.getElementById('registerSection');
  const showRegisterLink = document.getElementById('showRegister');
  const showLoginLink = document.getElementById('showLogin');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  const toast = document.getElementById('toast');

  // --- Form Toggle ---
  function showForm(formToShow, formToHide) {
    formToHide.classList.add('slide-out-left');

    setTimeout(function () {
      formToHide.classList.add('hidden');
      formToHide.classList.remove('slide-out-left');

      formToShow.classList.remove('hidden');
      formToShow.classList.add('slide-in-right');

      // Force reflow
      formToShow.offsetHeight;

      requestAnimationFrame(function () {
        formToShow.classList.remove('slide-in-right');
      });

      // Clear errors on switch
      clearAllErrors(formToHide);
    }, 200);
  }

  showRegisterLink.addEventListener('click', function (e) {
    e.preventDefault();
    showForm(registerSection, loginSection);
  });

  showLoginLink.addEventListener('click', function (e) {
    e.preventDefault();
    showForm(loginSection, registerSection);
  });

  // --- Password Visibility Toggle ---
  passwordToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var input = this.closest('.input-wrapper').querySelector('input');
      var isPassword = input.type === 'password';

      input.type = isPassword ? 'text' : 'password';
      this.classList.toggle('active', isPassword);
      this.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    });
  });

  // --- Validation Helpers ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(input, message) {
    var formGroup = input.closest('.form-group');
    var errorEl = formGroup.querySelector('.error-message');
    input.classList.add('has-error');
    if (errorEl) {
      errorEl.querySelector('span').textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(input) {
    var formGroup = input.closest('.form-group');
    var errorEl = formGroup.querySelector('.error-message');
    input.classList.remove('has-error');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }

  function clearAllErrors(section) {
    section.querySelectorAll('.form-input').forEach(function (input) {
      clearError(input);
    });
  }

  function showToast(message) {
    toast.querySelector('span').textContent = message;
    toast.classList.add('visible');
    setTimeout(function () {
      toast.classList.remove('visible');
    }, 3000);
  }

  // --- Clear error on input ---
  document.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('input', function () {
      clearError(this);
    });
  });

  // --- Login Form Validation ---
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = true;

    var email = this.querySelector('#loginEmail');
    var password = this.querySelector('#loginPassword');

    // Email validation
    if (!email.value.trim()) {
      showError(email, 'Email wajib diisi');
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Format email tidak valid');
      isValid = false;
    }

    // Password validation
    if (!password.value) {
      showError(password, 'Kata sandi wajib diisi');
      isValid = false;
    } else if (password.value.length < 6) {
      showError(password, 'Kata sandi minimal 6 karakter');
      isValid = false;
    }

    if (isValid) {
      showToast('Berhasil masuk! Mengalihkan...');
      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 1500);
    }
  });

  // --- Register Form Validation ---
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var isValid = true;

    var name = this.querySelector('#registerName');
    var email = this.querySelector('#registerEmail');
    var password = this.querySelector('#registerPassword');
    var confirmPassword = this.querySelector('#registerConfirmPassword');

    // Name validation
    if (!name.value.trim()) {
      showError(name, 'Nama lengkap wajib diisi');
      isValid = false;
    } else if (name.value.trim().length < 3) {
      showError(name, 'Nama minimal 3 karakter');
      isValid = false;
    }

    // Email validation
    if (!email.value.trim()) {
      showError(email, 'Email wajib diisi');
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Format email tidak valid');
      isValid = false;
    }

    // Password validation
    if (!password.value) {
      showError(password, 'Kata sandi wajib diisi');
      isValid = false;
    } else if (password.value.length < 6) {
      showError(password, 'Kata sandi minimal 6 karakter');
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword.value) {
      showError(confirmPassword, 'Konfirmasi kata sandi wajib diisi');
      isValid = false;
    } else if (confirmPassword.value !== password.value) {
      showError(confirmPassword, 'Kata sandi tidak cocok');
      isValid = false;
    }

    if (isValid) {
      showToast('Pendaftaran berhasil! Silakan masuk.');
      setTimeout(function () {
        showForm(loginSection, registerSection);
      }, 1500);
    }
  });
});
