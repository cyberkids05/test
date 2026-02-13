/**
 * Absensi Santri - Presensi Settings
 * Handles WhatsApp settings and scan schedule display
 */

document.addEventListener('DOMContentLoaded', function () {
  if (typeof AttendanceStore === 'undefined') return;

  // --- WhatsApp Settings ---
  var waPhone = document.getElementById('waPhone');
  var waEnabled = document.getElementById('waEnabled');
  var waLateMinutes = document.getElementById('waLateMinutes');
  var waSaveBtn = document.getElementById('waSaveBtn');
  var waToast = document.getElementById('waToast');

  // Load saved settings
  var settings = AttendanceStore.getWASettings();
  if (waPhone && settings.phone) {
    // Remove +62 prefix for display
    var displayPhone = settings.phone.replace(/^(\+?62|0)/, '');
    waPhone.value = displayPhone;
  }
  if (waEnabled) {
    waEnabled.checked = settings.enabled !== false;
  }
  if (waLateMinutes) {
    waLateMinutes.value = settings.lateMinutes || 15;
  }

  // Save settings
  if (waSaveBtn) {
    waSaveBtn.addEventListener('click', function () {
      var phone = waPhone ? waPhone.value.trim() : '';
      var enabled = waEnabled ? waEnabled.checked : true;
      var lateMins = waLateMinutes ? parseInt(waLateMinutes.value, 10) : 15;
      if (isNaN(lateMins) || lateMins < 1) lateMins = 15;

      // Format phone: store with leading 0 for consistency
      if (phone && phone.charAt(0) !== '0') {
        phone = '0' + phone;
      }

      AttendanceStore.saveWASettings({
        phone: phone,
        enabled: enabled,
        lateMinutes: lateMins
      });

      // Show toast
      if (waToast) {
        waToast.classList.add('visible');
        setTimeout(function () {
          waToast.classList.remove('visible');
        }, 2500);
      }
    });
  }

  // --- Scan Schedule Display ---
  var scheduleList = document.getElementById('scanScheduleList');
  if (!scheduleList) return;

  var schedule = AttendanceStore.schedule || [];
  var currentSlot = AttendanceStore.getCurrentSlot();
  var now = new Date();
  var nowMinutes = now.getHours() * 60 + now.getMinutes();

  scheduleList.innerHTML = '';

  schedule.forEach(function (slot) {
    var startParts = slot.start.split(':');
    var endParts = slot.end.split(':');
    var startMin = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    var endMin = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

    var isActive = currentSlot && currentSlot.id === slot.id;
    var isDone = nowMinutes > endMin;
    var isUpcoming = nowMinutes < startMin;

    var div = document.createElement('div');
    div.className = 'scan-slot' + (isActive ? ' active-slot' : '');

    var statusClass = isActive ? 'status-active' : (isDone ? 'status-done' : 'status-upcoming');
    var statusText = isActive ? 'Aktif' : (isDone ? 'Selesai' : 'Belum');

    div.innerHTML =
      '<span class="scan-slot-time">' + slot.start + ' - ' + slot.end + '</span>' +
      '<span class="scan-slot-mapel">' + slot.mapel + '</span>' +
      '<span class="scan-slot-status ' + statusClass + '">' + statusText + '</span>';

    scheduleList.appendChild(div);
  });
});
