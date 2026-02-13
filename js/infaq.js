/**
 * Absensi Santri - Infaq (Donations) Script
 * Handles month filtering of transactions
 */

document.addEventListener('DOMContentLoaded', function () {
  var filterBtns = document.querySelectorAll('.iq-filter');
  var cards = document.querySelectorAll('.iq-card');
  var infaqList = document.getElementById('infaqList');
  var emptyState = document.getElementById('emptyState');
  var txCount = document.getElementById('txCount');

  // --- Month Filter Tabs ---
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var selectedMonth = this.getAttribute('data-month');
      applyFilter(selectedMonth);
    });
  });

  function applyFilter(month) {
    var visibleCount = 0;

    cards.forEach(function (card, index) {
      var cardMonth = card.getAttribute('data-month');

      if (month === 'semua' || cardMonth === month) {
        card.style.display = '';
        // Reset animation
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = 'iq-card-in 0.35s ease forwards';
        card.style.animationDelay = (index * 0.03) + 's';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update transaction count
    txCount.textContent = visibleCount + ' transaksi';

    if (visibleCount === 0) {
      infaqList.style.display = 'none';
      emptyState.style.display = '';
    } else {
      infaqList.style.display = '';
      emptyState.style.display = 'none';
    }
  }
});
