/**
 * Absensi Santri - Data Siswa QR Code Generator
 * Generates unique QR codes per student for attendance scanning
 * QR data format: ABSENSI:{NIS}
 */

(function () {
  'use strict';

  var QR_PREFIX = 'ABSENSI:';
  var qrModal = null;
  var currentQRInstance = null;

  // --- Load QRCode library from CDN ---
  function loadQRLibrary(callback) {
    if (window.QRCode) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.onload = callback;
    script.onerror = function () {
      console.error('[QR] Failed to load QRCode library');
    };
    document.head.appendChild(script);
  }

  // --- Build QR Modal HTML ---
  function createQRModal() {
    var overlay = document.createElement('div');
    overlay.className = 'qr-modal-overlay';
    overlay.id = 'qrModalOverlay';
    overlay.innerHTML =
      '<div class="qr-modal">' +
        '<div class="qr-modal-header">' +
          '<span class="qr-modal-title">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 14h2v2h-2z"/><path d="M20 14h2v2h-2z"/><path d="M14 20h2v2h-2z"/><path d="M20 20h2v2h-2z"/><path d="M17 17h2v2h-2z"/></svg>' +
            'QR Code Siswa' +
          '</span>' +
          '<button class="qr-modal-close" id="qrCloseBtn" aria-label="Tutup">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="qr-modal-body">' +
          '<div class="qr-student-info">' +
            '<div class="qr-student-avatar" id="qrAvatar"></div>' +
            '<div class="qr-student-name" id="qrStudentName"></div>' +
            '<div class="qr-student-nis" id="qrStudentNIS"></div>' +
          '</div>' +
          '<div class="qr-code-wrapper">' +
            '<div class="qr-code-box" id="qrCodeBox"></div>' +
            '<div class="qr-code-label" id="qrCodeLabel"></div>' +
          '</div>' +
          '<p class="qr-instruction">Tunjukkan QR Code ini ke kamera scanner untuk presensi kehadiran.</p>' +
        '</div>' +
        '<div class="qr-modal-footer">' +
          '<button class="qr-btn qr-btn-secondary" id="qrCloseFooterBtn">Tutup</button>' +
          '<button class="qr-btn qr-btn-primary" id="qrDownloadBtn">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            'Download' +
          '</button>' +
          '<button class="qr-btn qr-btn-accent" id="qrPrintBtn">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>' +
            'Print' +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    return overlay;
  }

  // --- Open QR Modal ---
  function openQRModal(name, nis, avatarText, avatarBg) {
    if (!qrModal) {
      qrModal = createQRModal();
      bindModalEvents();
    }

    // Set student info
    var avatarEl = document.getElementById('qrAvatar');
    var nameEl = document.getElementById('qrStudentName');
    var nisEl = document.getElementById('qrStudentNIS');
    var labelEl = document.getElementById('qrCodeLabel');
    var qrBox = document.getElementById('qrCodeBox');

    if (avatarEl) {
      avatarEl.textContent = avatarText;
      avatarEl.style.background = avatarBg;
    }
    if (nameEl) nameEl.textContent = name;
    if (nisEl) nisEl.textContent = 'NIS: ' + nis;
    if (labelEl) labelEl.textContent = QR_PREFIX + nis;

    // Clear previous QR code
    if (qrBox) qrBox.innerHTML = '';

    // Generate QR Code
    loadQRLibrary(function () {
      if (currentQRInstance) {
        currentQRInstance.clear();
        currentQRInstance = null;
      }
      if (qrBox) {
        currentQRInstance = new QRCode(qrBox, {
          text: QR_PREFIX + nis,
          width: 180,
          height: 180,
          colorDark: '#1E293B',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    });

    // Store current data for download
    qrModal.dataset.studentName = name;
    qrModal.dataset.studentNIS = nis;

    // Show modal
    qrModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // --- Close QR Modal ---
  function closeQRModal() {
    if (qrModal) {
      qrModal.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  // --- Download QR Code as PNG ---
  function downloadQR() {
    var qrBox = document.getElementById('qrCodeBox');
    if (!qrBox) return;

    var canvas = qrBox.querySelector('canvas');
    if (!canvas) {
      // Try img fallback
      var img = qrBox.querySelector('img');
      if (img) {
        var link = document.createElement('a');
        link.download = 'QR_' + (qrModal.dataset.studentNIS || 'siswa') + '.png';
        link.href = img.src;
        link.click();
      }
      return;
    }

    // Create a new canvas with padding and student info
    var exportCanvas = document.createElement('canvas');
    var padding = 40;
    var textHeight = 60;
    exportCanvas.width = canvas.width + padding * 2;
    exportCanvas.height = canvas.height + padding * 2 + textHeight;

    var ctx = exportCanvas.getContext('2d');
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw QR code
    ctx.drawImage(canvas, padding, padding);

    // Draw student name and NIS below
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(qrModal.dataset.studentName || '', exportCanvas.width / 2, canvas.height + padding + 25);

    ctx.fillStyle = '#64748B';
    ctx.font = '13px sans-serif';
    ctx.fillText('NIS: ' + (qrModal.dataset.studentNIS || ''), exportCanvas.width / 2, canvas.height + padding + 48);

    // Download
    var link = document.createElement('a');
    link.download = 'QR_' + (qrModal.dataset.studentNIS || 'siswa') + '.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  // --- Print QR Code ---
  function printQR() {
    var qrBox = document.getElementById('qrCodeBox');
    if (!qrBox) return;

    var canvas = qrBox.querySelector('canvas');
    var imgSrc = '';
    if (canvas) {
      imgSrc = canvas.toDataURL('image/png');
    } else {
      var img = qrBox.querySelector('img');
      if (img) imgSrc = img.src;
    }

    if (!imgSrc) return;

    var name = qrModal.dataset.studentName || '';
    var nis = qrModal.dataset.studentNIS || '';

    var printWindow = window.open('', '_blank');
    printWindow.document.write(
      '<!DOCTYPE html><html><head><title>QR Code - ' + name + '</title>' +
      '<style>' +
        'body { font-family: sans-serif; text-align: center; padding: 40px; }' +
        'img { width: 250px; height: 250px; margin: 20px auto; display: block; }' +
        'h2 { margin: 0 0 4px; color: #1E293B; font-size: 20px; }' +
        'p { color: #64748B; font-size: 14px; margin: 0; }' +
        '.qr-data { margin-top: 8px; font-size: 12px; color: #94A3B8; font-family: monospace; }' +
        '@media print { body { padding: 20px; } }' +
      '</style></head><body>' +
      '<h2>' + name + '</h2>' +
      '<p>NIS: ' + nis + '</p>' +
      '<img src="' + imgSrc + '" />' +
      '<div class="qr-data">' + QR_PREFIX + nis + '</div>' +
      '<script>window.onload = function() { window.print(); }<\/script>' +
      '</body></html>'
    );
    printWindow.document.close();
  }

  // --- Bind Modal Events ---
  function bindModalEvents() {
    document.getElementById('qrCloseBtn').addEventListener('click', closeQRModal);
    document.getElementById('qrCloseFooterBtn').addEventListener('click', closeQRModal);
    document.getElementById('qrDownloadBtn').addEventListener('click', downloadQR);
    document.getElementById('qrPrintBtn').addEventListener('click', printQR);

    qrModal.addEventListener('click', function (e) {
      if (e.target === qrModal) closeQRModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && qrModal && qrModal.classList.contains('active')) {
        closeQRModal();
      }
    });
  }

  // --- Add QR buttons to each student card ---
  function initQRButtons() {
    var cards = document.querySelectorAll('.ds-card');
    cards.forEach(function (card) {
      // Extract student data from the card
      var nameEl = card.querySelector('.ds-name');
      var nisEl = card.querySelector('.ds-nis');
      var avatarEl = card.querySelector('.ds-avatar');

      if (!nameEl || !nisEl) return;

      var name = nameEl.textContent.trim();
      // Extract NIS number (strip SVG text)
      var nisText = nisEl.textContent.trim();
      var nisMatch = nisText.match(/\d{6,10}/);
      var nis = nisMatch ? nisMatch[0] : '';
      var avatarText = avatarEl ? avatarEl.textContent.trim() : '';
      var avatarBg = avatarEl ? avatarEl.style.background : '';

      // Create QR button
      var qrBtn = document.createElement('button');
      qrBtn.className = 'ds-qr-btn';
      qrBtn.setAttribute('aria-label', 'Lihat QR Code ' + name);
      qrBtn.title = 'QR Code';
      qrBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 14h2v2h-2z"/><path d="M20 14h2v2h-2z"/><path d="M14 20h2v2h-2z"/><path d="M20 20h2v2h-2z"/><path d="M17 17h2v2h-2z"/></svg>';

      qrBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openQRModal(name, nis, avatarText, avatarBg);
      });

      // Insert before the status dot
      var statusDot = card.querySelector('.ds-status');
      if (statusDot) {
        card.insertBefore(qrBtn, statusDot);
      } else {
        card.appendChild(qrBtn);
      }
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    initQRButtons();
  });
})();
