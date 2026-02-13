/**
 * Absensi Santri - QR Scanner
 * Uses html5-qrcode library for camera-based QR scanning
 * Falls back to file upload when camera is unavailable
 * Integrates with AttendanceStore for persistence
 */

(function () {
  'use strict';

  var scanner = null;
  var isScanning = false;
  var cameraFailed = false;

  // --- Build Modal HTML ---
  function createScanModal() {
    var overlay = document.createElement('div');
    overlay.className = 'scan-overlay';
    overlay.id = 'scanOverlay';
    overlay.innerHTML =
      '<div class="scan-modal">' +
        '<div class="scan-header">' +
          '<span class="scan-header-title">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 14h2v2h-2z"/><path d="M20 14h2v2h-2z"/><path d="M14 20h2v2h-2z"/><path d="M20 20h2v2h-2z"/><path d="M17 17h2v2h-2z"/></svg>' +
            'Scan QR Code' +
          '</span>' +
          '<button class="scan-close-btn" id="scanCloseBtn" aria-label="Tutup">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="scan-body">' +
          '<div class="scan-tabs" id="scanTabs">' +
            '<button class="scan-tab active" data-tab="camera" id="tabCamera">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
              'Kamera' +
            '</button>' +
            '<button class="scan-tab" data-tab="upload" id="tabUpload">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
              'Upload Gambar' +
            '</button>' +
          '</div>' +
          '<div class="scan-panel" id="panelCamera">' +
            '<div class="scan-viewfinder" id="scanViewfinder">' +
              '<div id="scan-reader"></div>' +
              '<div class="scan-frame">' +
                '<div class="scan-line"></div>' +
                '<span class="scan-corner scan-corner--tl"></span>' +
                '<span class="scan-corner scan-corner--tr"></span>' +
                '<span class="scan-corner scan-corner--bl"></span>' +
                '<span class="scan-corner scan-corner--br"></span>' +
              '</div>' +
              '<div class="scan-permission" id="scanPermission" style="display:none;">' +
                '<div class="scan-permission-icon">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
                '</div>' +
                '<div class="scan-permission-title">Kamera Tidak Tersedia</div>' +
                '<div class="scan-permission-text">Gunakan tab <b>Upload Gambar</b> untuk memindai QR Code dari file.</div>' +
              '</div>' +
            '</div>' +
            '<p class="scan-instruction">Arahkan kamera ke QR Code untuk melakukan presensi kehadiran</p>' +
          '</div>' +
          '<div class="scan-panel" id="panelUpload" style="display:none;">' +
            '<div class="scan-upload-area" id="scanUploadArea">' +
              '<input type="file" id="scanFileInput" accept="image/*" hidden />' +
              '<div class="scan-upload-icon">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
              '</div>' +
              '<div class="scan-upload-title">Upload Gambar QR Code</div>' +
              '<div class="scan-upload-text">Pilih atau ambil foto yang berisi QR Code presensi</div>' +
              '<button class="scan-btn scan-btn-primary scan-upload-btn" id="scanUploadBtn">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
                'Pilih Gambar' +
              '</button>' +
            '</div>' +
            '<p class="scan-instruction">Pilih gambar yang mengandung QR Code kehadiran</p>' +
          '</div>' +
          '<div class="scan-status" id="scanStatus"></div>' +
          '<div class="scan-result" id="scanResult">' +
            '<div class="scan-result-icon">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' +
            '</div>' +
            '<div class="scan-result-label" id="scanResultLabel">QR Code Terdeteksi!</div>' +
            '<div class="scan-result-text" id="scanResultText"></div>' +
          '</div>' +
        '</div>' +
        '<div class="scan-footer">' +
          '<button class="scan-btn scan-btn-secondary" id="scanCancelBtn">Batal</button>' +
          '<button class="scan-btn scan-btn-primary" id="scanAgainBtn" style="display:none;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>' +
            'Scan Ulang' +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    return overlay;
  }

  // --- Load html5-qrcode library ---
  function loadQrLibrary(callback) {
    if (window.Html5Qrcode) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.onload = callback;
    script.onerror = function () {
      setStatus('Gagal memuat library scanner.', 'error');
    };
    document.head.appendChild(script);
  }

  // --- Set status text ---
  function setStatus(text, type) {
    var el = document.getElementById('scanStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'scan-status';
    if (type) el.classList.add(type);
  }

  // --- Switch tab ---
  function switchTab(tabName) {
    var tabCamera = document.getElementById('tabCamera');
    var tabUpload = document.getElementById('tabUpload');
    var panelCamera = document.getElementById('panelCamera');
    var panelUpload = document.getElementById('panelUpload');

    if (tabName === 'camera') {
      tabCamera.classList.add('active');
      tabUpload.classList.remove('active');
      panelCamera.style.display = '';
      panelUpload.style.display = 'none';
      setStatus('');
      startScanner();
    } else {
      tabUpload.classList.add('active');
      tabCamera.classList.remove('active');
      panelUpload.style.display = '';
      panelCamera.style.display = 'none';
      stopScanner();
      setStatus('');
      var resultEl = document.getElementById('scanResult');
      if (resultEl) resultEl.classList.remove('visible');
      var againBtn = document.getElementById('scanAgainBtn');
      if (againBtn) againBtn.style.display = 'none';
    }
  }

  // --- Start Camera Scan ---
  function startScanner() {
    var readerEl = document.getElementById('scan-reader');
    var permissionEl = document.getElementById('scanPermission');
    var frameEl = document.querySelector('.scan-frame');

    if (!readerEl) return;

    if (permissionEl) permissionEl.style.display = 'none';
    if (frameEl) frameEl.style.display = 'block';
    setStatus('Mempersiapkan kamera...', 'loading');

    var resultEl = document.getElementById('scanResult');
    if (resultEl) resultEl.classList.remove('visible');
    var againBtn = document.getElementById('scanAgainBtn');
    if (againBtn) againBtn.style.display = 'none';

    loadQrLibrary(function () {
      try {
        scanner = new Html5Qrcode('scan-reader');

        var config = {
          fps: 10,
          qrbox: function (viewfinderWidth, viewfinderHeight) {
            var minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            var size = Math.floor(minEdge * 0.7);
            return { width: size, height: size };
          },
          aspectRatio: 1.0
        };

        scanner.start(
          { facingMode: 'environment' },
          config,
          onScanSuccess,
          function () { /* ignore scan failures */ }
        ).then(function () {
          isScanning = true;
          cameraFailed = false;
          setStatus('Siap memindai — arahkan ke QR Code', '');
        }).catch(function (err) {
          handleCameraError(err);
        });
      } catch (err) {
        handleCameraError(err);
      }
    });
  }

  // --- Handle Camera Errors ---
  function handleCameraError(err) {
    var permissionEl = document.getElementById('scanPermission');
    var frameEl = document.querySelector('.scan-frame');

    console.warn('[Scan] Camera error:', err);
    cameraFailed = true;

    if (permissionEl) permissionEl.style.display = 'flex';
    if (frameEl) frameEl.style.display = 'none';

    var msg = String(err);
    if (msg.indexOf('NotAllowed') !== -1 || msg.indexOf('Permission') !== -1) {
      setStatus('Akses kamera ditolak. Gunakan tab Upload Gambar.', 'error');
    } else if (msg.indexOf('NotFound') !== -1 || msg.indexOf('DevicesNotFound') !== -1) {
      setStatus('Kamera tidak ditemukan. Gunakan tab Upload Gambar.', 'error');
    } else if (msg.indexOf('NotReadable') !== -1 || msg.indexOf('TrackStartError') !== -1) {
      setStatus('Kamera sedang digunakan. Gunakan tab Upload Gambar.', 'error');
    } else {
      setStatus('Kamera tidak tersedia. Gunakan tab Upload Gambar.', 'error');
    }

    setTimeout(function () {
      switchTab('upload');
    }, 1500);
  }

  // --- Scan from uploaded file ---
  function scanFromFile(file) {
    if (!file) return;

    setStatus('Memindai QR Code dari gambar...', 'loading');

    loadQrLibrary(function () {
      var fileScanner = new Html5Qrcode('scan-reader');

      fileScanner.scanFile(file, true)
        .then(function (decodedText) {
          onScanSuccess(decodedText);
          fileScanner.clear();
        })
        .catch(function () {
          setStatus('QR Code tidak ditemukan dalam gambar. Coba gambar lain.', 'error');
          fileScanner.clear();
        });
    });
  }

  // --- Show error result styling ---
  function showErrorResult(label, text) {
    var resultEl = document.getElementById('scanResult');
    var resultText = document.getElementById('scanResultText');
    var resultLabel = document.getElementById('scanResultLabel');
    var againBtn = document.getElementById('scanAgainBtn');

    if (resultLabel) resultLabel.textContent = label;
    if (resultText) resultText.textContent = text;
    if (resultEl) {
      resultEl.classList.add('visible');
      resultEl.style.background = 'var(--color-error-bg)';
      resultEl.style.borderColor = 'var(--color-error)';
      var icon = resultEl.querySelector('.scan-result-icon');
      if (icon) icon.style.background = 'var(--color-error)';
      var lbl = resultEl.querySelector('.scan-result-label');
      if (lbl) lbl.style.color = 'var(--color-error)';
    }
    if (againBtn) againBtn.style.display = 'flex';
  }

  // --- On Successful Scan ---
  function onScanSuccess(decodedText) {
    stopScanner();

    var resultEl = document.getElementById('scanResult');
    var resultText = document.getElementById('scanResultText');
    var resultLabel = document.getElementById('scanResultLabel');
    var againBtn = document.getElementById('scanAgainBtn');

    // Try to process attendance via AttendanceStore
    if (typeof AttendanceStore !== 'undefined') {
      var nis = AttendanceStore.parseQRCode(decodedText);

      if (nis && AttendanceStore.isValidNIS(nis)) {
        var studentName = AttendanceStore.getStudentName(nis);

        // Check if scan is allowed (time slot + once-per-slot)
        var scanCheck = AttendanceStore.canScan(nis);
        if (!scanCheck.allowed) {
          showErrorResult('Scan Tidak Diizinkan', scanCheck.reason);
          setStatus(scanCheck.reason, 'error');
          return;
        }

        var slot = scanCheck.slot;

        // Check punctuality (Tepat Waktu / Terlambat)
        var now = new Date();
        var punct = AttendanceStore.checkPunctuality(slot, now);
        var timeStr = AttendanceStore.formatFullTime(now);

        // Mark as Hadir (present)
        AttendanceStore.markAttendance(nis, 'h');

        // Record that this student has scanned for this slot
        AttendanceStore.recordScan(nis, slot.id);

        // Show success with student info + punctuality
        if (resultLabel) resultLabel.textContent = 'Presensi Berhasil!';
        var resultInfo = studentName + '\n' +
          '🕐 ' + timeStr + ' — ' + punct.punctuality;
        if (punct.isLate) {
          resultInfo += '\n⏱️ Terlambat ' + punct.lateBy + ' menit';
        }
        resultInfo += '\n📚 ' + slot.mapel + ' (' + slot.start + ' - ' + slot.end + ')';
        if (resultText) resultText.textContent = resultInfo;

        // Style result based on punctuality
        if (resultEl) {
          resultEl.classList.add('visible');
          if (punct.isLate) {
            resultEl.style.background = '#FFF7ED';
            resultEl.style.borderColor = '#F97316';
            var iconEl = resultEl.querySelector('.scan-result-icon');
            if (iconEl) iconEl.style.background = '#F97316';
            var lblEl = resultEl.querySelector('.scan-result-label');
            if (lblEl) lblEl.style.color = '#F97316';
          }
        }
        if (againBtn) againBtn.style.display = 'flex';

        setStatus(punct.isLate ? 'Kehadiran dicatat — Terlambat ' + punct.lateBy + ' menit.' : 'Kehadiran dicatat — Tepat Waktu!', '');

        // If on absensi page, update the UI immediately
        updateAbsensiPageUI(nis, 'h');

        // Also update dashboard stats if on dashboard
        updateDashboardStats();

        // Share to WhatsApp realtime
        AttendanceStore.shareToWhatsApp(nis, 'h', 'scan', slot);

        return;
      } else if (nis) {
        // NIS found but not in student registry
        showErrorResult('NIS Tidak Ditemukan', 'NIS ' + nis + ' tidak terdaftar dalam sistem.');
        setStatus('Silakan scan ulang dengan QR Code yang valid.', 'error');
        return;
      }
    }

    // Fallback: show raw QR content
    if (resultLabel) resultLabel.textContent = 'QR Code Terdeteksi!';
    if (resultText) resultText.textContent = decodedText;
    if (resultEl) resultEl.classList.add('visible');
    if (againBtn) againBtn.style.display = 'flex';
    setStatus('QR Code berhasil dipindai.', '');
  }

  // --- Update absensi page UI if currently on it ---
  function updateAbsensiPageUI(nis, status) {
    var absensiList = document.getElementById('absensiList');
    if (!absensiList) return; // Not on absensi page

    var cards = absensiList.querySelectorAll('.ab-card');
    cards.forEach(function (card) {
      var nisEl = card.querySelector('.ab-student-nis');
      if (nisEl && nisEl.textContent.trim() === nis) {
        // Clear previous active states
        var btns = card.querySelectorAll('.ab-status-btn');
        btns.forEach(function (btn) {
          btn.classList.remove('active-h', 'active-i', 'active-s', 'active-a');
        });

        // Set the correct status button as active
        var targetBtn = card.querySelector('.ab-status-btn[data-status="' + status + '"]');
        if (targetBtn) {
          targetBtn.classList.add('active-' + status);
        }

        // Highlight the card briefly
        card.style.borderColor = '#22C55E';
        card.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.2)';
        setTimeout(function () {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }, 3000);
      }
    });

    // Update absensi stats counters
    if (typeof updateAbsensiStats === 'function') {
      updateAbsensiStats();
    }
  }

  // --- Update dashboard stats if on dashboard ---
  function updateDashboardStats() {
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

  // --- Stop Scanner ---
  function stopScanner() {
    if (scanner && isScanning) {
      scanner.stop().then(function () {
        isScanning = false;
        scanner.clear();
      }).catch(function (err) {
        console.warn('[Scan] Error stopping scanner:', err);
        isScanning = false;
      });
    }
  }

  // --- Reset result styling ---
  function resetResultStyle() {
    var resultEl = document.getElementById('scanResult');
    if (resultEl) {
      resultEl.classList.remove('visible');
      resultEl.style.background = '';
      resultEl.style.borderColor = '';
      var icon = resultEl.querySelector('.scan-result-icon');
      if (icon) icon.style.background = '';
      var label = resultEl.querySelector('.scan-result-label');
      if (label) label.style.color = '';
    }
  }

  // --- Open Modal ---
  function openScanModal() {
    var overlay = document.getElementById('scanOverlay');
    if (!overlay) {
      overlay = createScanModal();
      bindModalEvents();
    }

    // Reset UI state
    resetResultStyle();
    var againBtn = document.getElementById('scanAgainBtn');
    if (againBtn) againBtn.style.display = 'none';
    var permissionEl = document.getElementById('scanPermission');
    if (permissionEl) permissionEl.style.display = 'none';
    var frameEl = document.querySelector('.scan-frame');
    if (frameEl) frameEl.style.display = 'block';
    var fileInput = document.getElementById('scanFileInput');
    if (fileInput) fileInput.value = '';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (cameraFailed) {
      setTimeout(function () { switchTab('upload'); }, 100);
    } else {
      var tabCamera = document.getElementById('tabCamera');
      var tabUpload = document.getElementById('tabUpload');
      var panelCamera = document.getElementById('panelCamera');
      var panelUpload = document.getElementById('panelUpload');
      if (tabCamera) tabCamera.classList.add('active');
      if (tabUpload) tabUpload.classList.remove('active');
      if (panelCamera) panelCamera.style.display = '';
      if (panelUpload) panelUpload.style.display = 'none';
      setTimeout(startScanner, 300);
    }
  }

  // --- Close Modal ---
  function closeScanModal() {
    stopScanner();
    var overlay = document.getElementById('scanOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  // --- Bind Modal Events ---
  function bindModalEvents() {
    document.getElementById('scanCloseBtn').addEventListener('click', closeScanModal);
    document.getElementById('scanCancelBtn').addEventListener('click', closeScanModal);

    var againBtn = document.getElementById('scanAgainBtn');
    againBtn.addEventListener('click', function () {
      resetResultStyle();
      againBtn.style.display = 'none';
      var fileInput = document.getElementById('scanFileInput');
      if (fileInput) fileInput.value = '';

      var tabUpload = document.getElementById('tabUpload');
      if (tabUpload && tabUpload.classList.contains('active')) {
        setStatus('');
      } else {
        startScanner();
      }
    });

    document.getElementById('tabCamera').addEventListener('click', function () {
      switchTab('camera');
    });
    document.getElementById('tabUpload').addEventListener('click', function () {
      switchTab('upload');
    });

    document.getElementById('scanUploadBtn').addEventListener('click', function () {
      document.getElementById('scanFileInput').click();
    });

    document.getElementById('scanUploadArea').addEventListener('click', function (e) {
      if (e.target.closest('#scanUploadBtn')) return;
      document.getElementById('scanFileInput').click();
    });

    document.getElementById('scanFileInput').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (file) {
        resetResultStyle();
        scanFromFile(file);
      }
    });

    var uploadArea = document.getElementById('scanUploadArea');
    uploadArea.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', function () {
      uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        resetResultStyle();
        scanFromFile(file);
      } else {
        setStatus('File harus berupa gambar (JPG, PNG, dll).', 'error');
      }
    });

    var overlay = document.getElementById('scanOverlay');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeScanModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeScanModal();
      }
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    var scanBtns = document.querySelectorAll('.nav-qr-btn');
    scanBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openScanModal();
      });
    });
  });
})();
