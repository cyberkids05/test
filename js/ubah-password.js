/**
 * Absensi Santri - Ubah Password Script
 * Handles password toggle, strength check, and form save
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Password Toggle ---
  var toggleBtns = document.querySelectorAll('.field-pwd-toggle');
  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = this.getAttribute('data-target');
      var input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.add('active');
      } else {
        input.type = 'password';
        this.classList.remove('active');
      }
    });
  });

  // --- Password Strength ---
  var newPwd = document.getElementById('newPwd');
  var strengthBar = document.getElementById('pwdStrength');
  var strengthText = document.getElementById('pwdStrengthText');

  var strengthLabels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];

  newPwd.addEventListener('input', function () {
    var val = this.value;
    var score = 0;

    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

    if (val.length === 0) score = 0;

    strengthBar.setAttribute('data-strength', score);
    strengthText.textContent = strengthLabels[score] || '';
  });

  // --- Save ---
  var btnSave = document.getElementById('btnSave');
  var toast = document.getElementById('toast');

  btnSave.addEventListener('click', function () {
    var current = document.getElementById('currentPwd').value;
    var newVal = newPwd.value;
    var confirm = document.getElementById('confirmPwd').value;

    if (!current) {
      alert('Masukkan password saat ini.');
      return;
    }
    if (!newVal) {
      alert('Masukkan password baru.');
      return;
    }
    if (newVal.length < 6) {
      alert('Password baru minimal 6 karakter.');
      return;
    }
    if (newVal !== confirm) {
      alert('Konfirmasi password tidak cocok.');
      return;
    }

    toast.classList.add('visible');
    setTimeout(function () {
      toast.classList.remove('visible');
    }, 2500);
  });
});
