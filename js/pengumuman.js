/**
 * Absensi Santri - Pengumuman (Announcements) Script
 * Handles filtering, card expand/collapse, and read state
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Filter Tabs ---
  var filterTabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.announcement-card');
  var emptyState = document.getElementById('emptyState');
  var announcementList = document.getElementById('announcementList');

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // Update active tab
      filterTabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      var filter = this.getAttribute('data-filter');
      var visibleCount = 0;

      // Filter cards
      cards.forEach(function (card) {
        var type = card.getAttribute('data-type');
        if (filter === 'semua' || type === filter) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.classList.remove('expanded');
        }
      });

      // Re-trigger staggered animation
      var visibleCards = [];
      cards.forEach(function (card) {
        if (card.style.display !== 'none') {
          visibleCards.push(card);
        }
      });
      visibleCards.forEach(function (card, index) {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = '';
        card.style.animationDelay = (index * 0.05) + 's';
      });

      // Toggle empty state
      if (visibleCount === 0) {
        announcementList.style.display = 'none';
        emptyState.style.display = '';
      } else {
        announcementList.style.display = '';
        emptyState.style.display = 'none';
      }
    });
  });

  // --- Card Expand / Collapse ---
  cards.forEach(function (card) {
    var inner = card.querySelector('.announcement-card-inner');
    inner.addEventListener('click', function () {
      var wasExpanded = card.classList.contains('expanded');

      // Collapse all other cards
      cards.forEach(function (c) { c.classList.remove('expanded'); });

      // Toggle this card
      if (!wasExpanded) {
        card.classList.add('expanded');
      }

      // Mark as read
      if (!card.classList.contains('read')) {
        card.classList.add('read');
        updateBadgeCount();
      }
    });
  });

  // --- Update Badge Count ---
  function updateBadgeCount() {
    var unreadCount = 0;
    cards.forEach(function (card) {
      if (!card.classList.contains('read')) {
        unreadCount++;
      }
    });

    var badgeCount = document.getElementById('badgeCount');
    if (unreadCount > 0) {
      badgeCount.textContent = unreadCount;
      badgeCount.style.display = '';
    } else {
      badgeCount.style.display = 'none';
    }
  }
});
