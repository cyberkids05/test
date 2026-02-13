/**
 * Absensi Santri - Mapel (Mata Pelajaran) Script
 * Handles day-based filtering of subjects
 */

document.addEventListener('DOMContentLoaded', function () {
  var filterBtns = document.querySelectorAll('.mp-filter');
  var cards = document.querySelectorAll('.mp-card');
  var mapelList = document.getElementById('mapelList');
  var emptyState = document.getElementById('emptyState');

  // --- Day Filter Tabs ---
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var selectedDay = this.getAttribute('data-day');
      applyFilter(selectedDay);
    });
  });

  function applyFilter(day) {
    var visibleCount = 0;

    cards.forEach(function (card, index) {
      var cardDays = card.getAttribute('data-day');

      if (day === 'semua' || cardDays.indexOf(day) !== -1) {
        card.style.display = '';
        // Reset animation
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = 'mp-card-in 0.35s ease forwards';
        card.style.animationDelay = (index * 0.03) + 's';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      mapelList.style.display = 'none';
      emptyState.style.display = '';
    } else {
      mapelList.style.display = '';
      emptyState.style.display = 'none';
    }
  }
});
