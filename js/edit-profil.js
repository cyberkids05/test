/**
 * Absensi Santri - Edit Profil Script
 * Handles form save and toast
 */

document.addEventListener('DOMContentLoaded', function () {
  var btnSave = document.getElementById('btnSave');
  var toast = document.getElementById('toast');

  btnSave.addEventListener('click', function () {
    var name = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();

    if (!name) {
      alert('Nama lengkap tidak boleh kosong.');
      return;
    }
    if (!email) {
      alert('Email tidak boleh kosong.');
      return;
    }

    // Show success toast
    toast.classList.add('visible');
    setTimeout(function () {
      toast.classList.remove('visible');
    }, 2500);
  });
});
