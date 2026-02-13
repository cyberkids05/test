/**
 * Absensi Santri - Akun (Account) Script
 * Handles logout and menu interactions
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Logout Button ---
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      var confirmLogout = confirm('Apakah Anda yakin ingin keluar dari akun?');
      if (confirmLogout) {
        window.location.href = 'index.html';
      }
    });
  }

  // --- Menu Item Ripple Effect ---
  var menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
      }
    });
  });
});
