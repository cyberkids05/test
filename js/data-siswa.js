/**
 * Absensi Santri - Data Siswa Script
 * Handles search filtering and class filtering
 */

document.addEventListener('DOMContentLoaded', function () {
  var searchInput = document.getElementById('searchInput');
  var filterBtns = document.querySelectorAll('.ds-filter');
  var cards = document.querySelectorAll('.ds-card');
  var emptyState = document.getElementById('emptyState');
  var studentList = document.getElementById('studentList');
  var activeFilter = 'semua';

  // --- Search ---
  searchInput.addEventListener('input', function () {
    applyFilters();
  });

  // --- Class Filter Tabs ---
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      activeFilter = this.getAttribute('data-filter');
      applyFilters();
    });
  });

  function applyFilters() {
    var query = searchInput.value.toLowerCase().trim();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var name = card.querySelector('.ds-name').textContent.toLowerCase();
      var nis = card.querySelector('.ds-nis').textContent.toLowerCase();
      var kelas = card.getAttribute('data-kelas');

      var matchSearch = !query || name.indexOf(query) !== -1 || nis.indexOf(query) !== -1;
      var matchFilter = activeFilter === 'semua' || kelas === activeFilter;

      if (matchSearch && matchFilter) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      studentList.style.display = 'none';
      emptyState.style.display = '';
    } else {
      studentList.style.display = '';
      emptyState.style.display = 'none';
    }
  }
});
