/**
 * Absensi Santri - Dashboard Script (Mobile App Style)
 * Handles date display, navigation, and attendance stats from store
 */

document.addEventListener('DOMContentLoaded', function () {
  // --- Display Current Date ---
  var dateEl = document.getElementById('currentDate');
  var now = new Date();
  var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  if (dateEl) {
    dateEl.textContent = days[now.getDay()] + ', ' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      months[now.getMonth()] + ' ' +
      now.getFullYear();
  }

  // --- Schedule Day Badge ---
  var scheduleDayEl = document.getElementById('scheduleDay');
  if (scheduleDayEl) {
    scheduleDayEl.textContent = days[now.getDay()];
  }

  // --- Load attendance stats from store ---
  function loadDashboardStats() {
    if (typeof AttendanceStore === 'undefined') return;

    var stats = AttendanceStore.getStats();

    var hadirEl = document.querySelector('.stat-item.hadir .stat-circle');
    var izinEl = document.querySelector('.stat-item.izin .stat-circle');
    var sakitEl = document.querySelector('.stat-item.sakit .stat-circle');
    var alphaEl = document.querySelector('.stat-item.alpha .stat-circle');

    if (hadirEl) hadirEl.textContent = stats.h;
    if (izinEl) izinEl.textContent = stats.i;
    if (sakitEl) sakitEl.textContent = stats.s;
    if (alphaEl) alphaEl.textContent = stats.a;
  }

  loadDashboardStats();

  // --- Listen for storage events (cross-tab sync) ---
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('absensi_') === 0) {
      loadDashboardStats();
    }
  });
});
