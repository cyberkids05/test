/**
 * Absensi Santri - Attendance Store
 * Shared localStorage utility for attendance data across pages
 *
 * Storage format:
 *   key:   "absensi_YYYY-MM-DD"
 *   value: { "2026001": "h", "2026003": "s", ... }
 *
 * Status codes: h = Hadir, i = Izin, s = Sakit, a = Alpha
 */

var AttendanceStore = (function () {
  'use strict';

  // --- Student registry (NIS → Name) ---
  var students = {
    '2026001': 'Ahmad Ramadhan',
    '2026002': 'Muhammad Fauzan',
    '2026003': 'Aisyah Zahra',
    '2026004': 'Nur Khadijah',
    '2026005': 'Ibrahim Al-Farisi',
    '2026006': 'Bilal Husain',
    '2025010': 'Hafidz Mubarok',
    '2024016': 'Fatimah Azzahra'
  };

  // --- Schedule / Jadwal configuration ---
  // Each slot has a time window during which scanning is allowed
  var schedule = [
    { id: 'fiqih',   mapel: 'Fiqih',            start: '07:00', end: '08:30', guru: 'Ust. Abdullah' },
    { id: 'nahwu',   mapel: 'Nahwu Shorof',     start: '08:30', end: '10:00', guru: 'Ust. Mahmud'  },
    { id: 'hadits',  mapel: 'Hadits',            start: '10:15', end: '11:45', guru: 'Ust. Hasan'   },
    { id: 'tahfidz', mapel: 'Tahfidz Al-Quran',  start: '13:00', end: '14:30', guru: 'Ust. Ibrahim' },
    { id: 'aqidah',  mapel: 'Aqidah Akhlak',     start: '15:30', end: '17:00', guru: 'Ust. Salim'   }
  ];

  // --- WhatsApp config ---
  var WA_SETTINGS_KEY = 'absensi_wa_settings';

  // Default: siswa dianggap terlambat jika datang lebih dari 15 menit setelah jam mulai
  var DEFAULT_LATE_MINUTES = 15;

  function getWASettings() {
    try {
      var data = localStorage.getItem(WA_SETTINGS_KEY);
      var defaults = { phone: '', enabled: true, lateMinutes: DEFAULT_LATE_MINUTES };
      if (!data) return defaults;
      var parsed = JSON.parse(data);
      // ensure lateMinutes always has a value
      if (typeof parsed.lateMinutes !== 'number') parsed.lateMinutes = DEFAULT_LATE_MINUTES;
      return parsed;
    } catch (e) {
      return { phone: '', enabled: true, lateMinutes: DEFAULT_LATE_MINUTES };
    }
  }

  function saveWASettings(settings) {
    try {
      localStorage.setItem(WA_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[AttendanceStore] Failed to save WA settings:', e);
    }
  }

  // --- Helpers ---
  function formatDateKey(date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return 'absensi_' + y + '-' + m + '-' + day;
  }

  function todayKey() {
    return formatDateKey(new Date());
  }

  // --- Format date for display ---
  function formatDateDisplay(date) {
    var d = date || new Date();
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return days[d.getDay()] + ', ' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      months[d.getMonth()] + ' ' +
      d.getFullYear();
  }

  // --- Time helpers ---
  function timeToMinutes(timeStr) {
    var parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function getCurrentTimeMinutes() {
    var now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // --- Get current active schedule slot ---
  function getCurrentSlot() {
    var nowMin = getCurrentTimeMinutes();
    for (var i = 0; i < schedule.length; i++) {
      var slot = schedule[i];
      var startMin = timeToMinutes(slot.start);
      var endMin = timeToMinutes(slot.end);
      if (nowMin >= startMin && nowMin <= endMin) {
        return slot;
      }
    }
    return null;
  }

  // --- Scan tracking (once per student per slot per day) ---
  function getScanLogKey(date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return 'scan_log_' + y + '-' + m + '-' + day;
  }

  function getScanLog(date) {
    try {
      var data = localStorage.getItem(getScanLogKey(date));
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveScanLog(log, date) {
    try {
      localStorage.setItem(getScanLogKey(date), JSON.stringify(log));
    } catch (e) {
      console.warn('[AttendanceStore] Failed to save scan log:', e);
    }
  }

  /**
   * Check if a student can scan right now.
   * Returns { allowed: true, slot: {...} } or { allowed: false, reason: '...' }
   */
  function canScan(nis) {
    var slot = getCurrentSlot();
    if (!slot) {
      // Find next slot info for better message
      var nowMin = getCurrentTimeMinutes();
      var nextSlot = null;
      for (var i = 0; i < schedule.length; i++) {
        if (timeToMinutes(schedule[i].start) > nowMin) {
          nextSlot = schedule[i];
          break;
        }
      }
      if (nextSlot) {
        return {
          allowed: false,
          reason: 'Scan tidak tersedia saat ini. Jadwal berikutnya: ' +
            nextSlot.mapel + ' (' + nextSlot.start + ' - ' + nextSlot.end + ')'
        };
      }
      return {
        allowed: false,
        reason: 'Tidak ada jadwal yang aktif saat ini. Scan hanya bisa dilakukan sesuai jadwal pelajaran.'
      };
    }

    // Check if student already scanned for this slot today
    var log = getScanLog();
    var logKey = nis + '_' + slot.id;
    if (log[logKey]) {
      return {
        allowed: false,
        reason: 'Sudah melakukan scan untuk ' + slot.mapel +
          ' (' + slot.start + ' - ' + slot.end + '). Scan hanya bisa dilakukan sekali per jadwal.'
      };
    }

    return { allowed: true, slot: slot };
  }

  /**
   * Record that a student has scanned for the current slot
   */
  function recordScan(nis, slotId) {
    var log = getScanLog();
    var logKey = nis + '_' + slotId;
    log[logKey] = new Date().toISOString();
    saveScanLog(log);
  }

  // --- Get all records for a date ---
  function getByDate(date) {
    var key = date ? formatDateKey(date) : todayKey();
    try {
      var data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  // --- Save full record for a date ---
  function saveByDate(records, date) {
    var key = date ? formatDateKey(date) : todayKey();
    try {
      localStorage.setItem(key, JSON.stringify(records));
    } catch (e) {
      console.warn('[AttendanceStore] Failed to save:', e);
    }
  }

  // --- Mark a single student's status for today ---
  function markAttendance(nis, status, date) {
    var records = getByDate(date);
    records[nis] = status;
    saveByDate(records, date);
    return records;
  }

  // --- Get student name by NIS ---
  function getStudentName(nis) {
    return students[nis] || null;
  }

  // --- Check if NIS is valid ---
  function isValidNIS(nis) {
    return students.hasOwnProperty(nis);
  }

  // --- Get attendance stats for a date ---
  function getStats(date) {
    var records = getByDate(date);
    var stats = { h: 0, i: 0, s: 0, a: 0 };
    for (var nis in records) {
      if (records.hasOwnProperty(nis)) {
        var s = records[nis];
        if (stats.hasOwnProperty(s)) {
          stats[s]++;
        }
      }
    }
    return stats;
  }

  // --- Punctuality check ---
  /**
   * Determine if a student is on time or late for a given slot.
   * Returns { punctuality: 'Tepat Waktu' | 'Terlambat', lateBy: minutes }
   */
  function checkPunctuality(slot, dateObj) {
    if (!slot) return { punctuality: '-', lateBy: 0 };
    var settings = getWASettings();
    var tolerance = settings.lateMinutes || DEFAULT_LATE_MINUTES;
    var d = dateObj || new Date();
    var nowMin = d.getHours() * 60 + d.getMinutes();
    var slotStart = timeToMinutes(slot.start);
    var diff = nowMin - slotStart;

    if (diff <= tolerance) {
      return { punctuality: 'Tepat Waktu ✅', lateBy: 0, isLate: false };
    }
    return { punctuality: 'Terlambat ⚠️', lateBy: diff, isLate: true };
  }

  // --- Format full time string HH:MM:SS ---
  function formatFullTime(date) {
    var d = date || new Date();
    return String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');
  }

  // --- WhatsApp phone number formatter ---
  function formatWAPhone(rawPhone) {
    var phone = rawPhone.replace(/[\s\-\(\)]/g, '');
    if (phone.charAt(0) === '0') {
      phone = '62' + phone.substring(1);
    }
    if (phone.charAt(0) !== '+' && phone.substring(0, 2) !== '62') {
      phone = '62' + phone;
    }
    return phone.replace('+', '');
  }

  // --- WhatsApp sharing ---

  /**
   * Send attendance data to WhatsApp
   * Message format: Nama Siswa, Waktu (HH:MM:SS), Status (Tepat Waktu / Terlambat)
   *
   * @param {string} nis - Student NIS
   * @param {string} status - Status code (h/i/s/a)
   * @param {string} method - 'scan' or 'manual'
   * @param {object} [slot] - Schedule slot object (optional)
   */
  function shareToWhatsApp(nis, status, method, slot) {
    var settings = getWASettings();
    if (!settings.enabled || !settings.phone) return;

    var studentName = getStudentName(nis) || nis;
    var now = new Date();
    var timeStr = formatFullTime(now);
    var dateStr = formatDateDisplay(now);

    // Determine punctuality
    var punct = checkPunctuality(slot, now);

    var message = '📢 *LAPORAN KEHADIRAN SANTRI*\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '👤 Nama: *' + studentName + '*\n' +
      '🕐 Waktu: *' + timeStr + '*\n' +
      '📊 Status: *' + punct.punctuality + '*\n';

    if (punct.isLate) {
      message += '⏱️ Terlambat: ' + punct.lateBy + ' menit dari jadwal ' + (slot ? slot.start : '') + '\n';
    }

    if (slot) {
      message += '📚 Mapel: ' + slot.mapel + ' (' + slot.start + ' - ' + slot.end + ')\n';
    }

    message += '📅 Tanggal: ' + dateStr + '\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '_Dikirim otomatis oleh Sistem Absensi AKAMID_';

    var phone = formatWAPhone(settings.phone);
    var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank');
  }

  // --- Parse QR code text to extract NIS ---
  function parseQRCode(text) {
    if (!text) return null;
    var trimmed = text.trim();

    // Format: "ABSENSI:2026001" or "NIS:2026001"
    var prefixMatch = trimmed.match(/^(?:ABSENSI|NIS|SANTRI)[:\-](\d+)$/i);
    if (prefixMatch) {
      return prefixMatch[1];
    }

    // Format: plain NIS number
    if (/^\d{6,10}$/.test(trimmed)) {
      return trimmed;
    }

    // Format: JSON with nis field
    try {
      var json = JSON.parse(trimmed);
      if (json.nis) return String(json.nis);
      if (json.NIS) return String(json.NIS);
      if (json.id) return String(json.id);
    } catch (e) {
      // not JSON
    }

    return null;
  }

  // --- Public API ---
  return {
    getByDate: getByDate,
    saveByDate: saveByDate,
    markAttendance: markAttendance,
    getStudentName: getStudentName,
    isValidNIS: isValidNIS,
    getStats: getStats,
    parseQRCode: parseQRCode,
    formatDateKey: formatDateKey,
    students: students,
    schedule: schedule,
    canScan: canScan,
    recordScan: recordScan,
    getCurrentSlot: getCurrentSlot,
    shareToWhatsApp: shareToWhatsApp,
    getWASettings: getWASettings,
    saveWASettings: saveWASettings,
    checkPunctuality: checkPunctuality,
    formatFullTime: formatFullTime,
    formatWAPhone: formatWAPhone
  };
})();
