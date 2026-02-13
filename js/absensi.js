/**
 * Absensi Santri - Absensi (Attendance) Script
 * Handles date navigation, status marking, stats, and localStorage sync
 */

// Expose updateAbsensiStats globally so scan.js can call it
var updateAbsensiStats;

document.addEventListener('DOMContentLoaded', function () {
  var currentDate = new Date();
  var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  var dateMainEl = document.getElementById('abDateMain');
  var dateSubEl = document.getElementById('abDateSub');
  var prevBtn = document.getElementById('prevDate');
  var nextBtn = document.getElementById('nextDate');
  var btnSimpan = document.getElementById('btnSimpan');
  var toast = document.getElementById('abToast');

  // --- Display Date ---
  function renderDate() {
    dateMainEl.textContent = days[currentDate.getDay()] + ', ' +
      String(currentDate.getDate()).padStart(2, '0') + ' ' +
      monthsShort[currentDate.getMonth()] + ' ' +
      currentDate.getFullYear();
    dateSubEl.textContent = months[currentDate.getMonth()] + ' ' + currentDate.getFullYear();
  }

  renderDate();

  // --- Date Navigation ---
  prevBtn.addEventListener('click', function () {
    currentDate.setDate(currentDate.getDate() - 1);
    renderDate();
    loadAttendanceFromStore();
  });

  nextBtn.addEventListener('click', function () {
    currentDate.setDate(currentDate.getDate() + 1);
    renderDate();
    loadAttendanceFromStore();
  });

  // --- Status Button Selection ---
  var statusBtns = document.querySelectorAll('.ab-status-btn');

  statusBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = this.closest('.ab-status-group');
      var siblings = group.querySelectorAll('.ab-status-btn');
      var status = this.getAttribute('data-status');

      // Remove active state from siblings
      siblings.forEach(function (s) {
        s.classList.remove('active-h', 'active-i', 'active-s', 'active-a');
      });

      // Set active state on clicked button
      this.classList.add('active-' + status);

      // Get NIS from the card
      var card = this.closest('.ab-card');
      var nisEl = card ? card.querySelector('.ab-student-nis') : null;
      var nis = nisEl ? nisEl.textContent.trim() : null;

      // Save to AttendanceStore
      if (nis && typeof AttendanceStore !== 'undefined') {
        AttendanceStore.markAttendance(nis, status, currentDate);
      }

      // Update stats
      updateStats();
    });
  });

  // --- Update Stats Counts ---
  function updateStats() {
    var h = document.querySelectorAll('.ab-status-btn.active-h').length;
    var i = document.querySelectorAll('.ab-status-btn.active-i').length;
    var s = document.querySelectorAll('.ab-status-btn.active-s').length;
    var a = document.querySelectorAll('.ab-status-btn.active-a').length;

    document.getElementById('countHadir').textContent = h;
    document.getElementById('countIzin').textContent = i;
    document.getElementById('countSakit').textContent = s;
    document.getElementById('countAlpha').textContent = a;
  }

  // Expose globally for scan.js
  updateAbsensiStats = updateStats;

  // --- Load attendance data from localStorage ---
  function loadAttendanceFromStore() {
    if (typeof AttendanceStore === 'undefined') return;

    var records = AttendanceStore.getByDate(currentDate);
    var cards = document.querySelectorAll('.ab-card');

    cards.forEach(function (card) {
      var nisEl = card.querySelector('.ab-student-nis');
      if (!nisEl) return;
      var nis = nisEl.textContent.trim();

      // Clear all active states
      var btns = card.querySelectorAll('.ab-status-btn');
      btns.forEach(function (btn) {
        btn.classList.remove('active-h', 'active-i', 'active-s', 'active-a');
      });

      // Apply saved status
      if (records[nis]) {
        var status = records[nis];
        var targetBtn = card.querySelector('.ab-status-btn[data-status="' + status + '"]');
        if (targetBtn) {
          targetBtn.classList.add('active-' + status);
        }
      }
    });

    // Update stats
    updateStats();
  }

  // Load on page init
  loadAttendanceFromStore();

  // --- Submit / Save ---
  btnSimpan.addEventListener('click', function () {
    // Collect current attendance state and save
    if (typeof AttendanceStore !== 'undefined') {
      var records = {};
      var cards = document.querySelectorAll('.ab-card');
      cards.forEach(function (card) {
        var nisEl = card.querySelector('.ab-student-nis');
        if (!nisEl) return;
        var nis = nisEl.textContent.trim();

        var activeBtn = card.querySelector('.ab-status-btn[class*="active-"]');
        if (activeBtn) {
          var status = activeBtn.getAttribute('data-status');
          records[nis] = status;
        }
      });
      AttendanceStore.saveByDate(records, currentDate);

      // Build bulk summary message for WhatsApp (rekap semua santri)
      var slot = AttendanceStore.getCurrentSlot();
      shareAbsensiBulk(records, slot);
    }

    // Show toast
    toast.classList.add('visible');
    setTimeout(function () {
      toast.classList.remove('visible');
    }, 2500);
  });

  // --- Bulk WhatsApp share for all students at once ---
  function shareAbsensiBulk(records, slot) {
    if (typeof AttendanceStore === 'undefined') return;
    var settings = AttendanceStore.getWASettings();
    if (!settings.enabled || !settings.phone) return;

    var now = new Date();
    var timeStr = AttendanceStore.formatFullTime(now);
    var counts = { h: 0, i: 0, s: 0, a: 0 };
    var lines = [];
    var idx = 1;

    // Get punctuality for hadir students
    var punct = AttendanceStore.checkPunctuality(slot, now);

    for (var nis in records) {
      if (!records.hasOwnProperty(nis)) continue;
      var name = AttendanceStore.getStudentName(nis) || nis;
      var st = records[nis];

      var statusText = '';
      if (st === 'h') {
        statusText = punct.isLate ? 'Terlambat ⚠️' : 'Tepat Waktu ✅';
      } else if (st === 'i') {
        statusText = 'Izin 📋';
      } else if (st === 's') {
        statusText = 'Sakit 🏥';
      } else if (st === 'a') {
        statusText = 'Alpha ❌';
      }

      lines.push(idx + '. ' + name + ' — ' + statusText);
      if (counts.hasOwnProperty(st)) counts[st]++;
      idx++;
    }

    if (lines.length === 0) return;

    var dateStr = days[currentDate.getDay()] + ', ' +
      String(currentDate.getDate()).padStart(2, '0') + ' ' +
      months[currentDate.getMonth()] + ' ' +
      currentDate.getFullYear();

    var message = '📋 *REKAP ABSENSI SANTRI*\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '📅 Tanggal: ' + dateStr + '\n' +
      '🕐 Waktu: *' + timeStr + '*\n';

    if (slot) {
      message += '📚 Mapel: ' + slot.mapel + ' (' + slot.start + ' - ' + slot.end + ')\n';
    }

    message += '\n' + lines.join('\n') + '\n\n' +
      '📊 *Ringkasan:*\n' +
      '✅ Hadir: ' + counts.h + '\n' +
      '📋 Izin: ' + counts.i + '\n' +
      '🏥 Sakit: ' + counts.s + '\n' +
      '❌ Alpha: ' + counts.a + '\n' +
      '📝 Total: ' + (counts.h + counts.i + counts.s + counts.a) + ' santri\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '_Dikirim otomatis oleh Sistem Absensi AKAMID_';

    var phone = AttendanceStore.formatWAPhone(settings.phone);
    var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
  }

  // --- Listen for storage events (cross-tab sync) ---
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('absensi_') === 0) {
      loadAttendanceFromStore();
    }
  });
});
