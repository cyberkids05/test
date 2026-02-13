/**
 * Absensi Santri - Notifikasi Settings Script
 * Handles toggle save and toast
 */

document.addEventListener('DOMContentLoaded', function () {
  var btnSave = document.getElementById('btnSave');
  var toast = document.getElementById('toast');

  btnSave.addEventListener('click', function () {
    toast.classList.add('visible');
    setTimeout(function () {
      toast.classList.remove('visible');
    }, 2500);
  });
});
