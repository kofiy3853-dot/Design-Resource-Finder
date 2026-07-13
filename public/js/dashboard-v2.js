(function () {
  'use strict';

  // ===== SIDEBAR =====
  var sidebar = document.querySelector('.dash-sidebar');
  var overlay = document.querySelector('.dash-sidebar-overlay');
  var sidebarToggle = document.querySelector('[data-sidebar-toggle]');

  function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  if (overlay) {
    overlay.addEventListener('click', toggleSidebar);
  }

  // Close sidebar on nav link click (mobile)
  document.querySelectorAll('.dash-nav-item').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 768) toggleSidebar();
    });
  });

  // ===== UPLOAD DRAG & DROP =====
  var uploadArea = document.getElementById('uploadArea');
  var fileInput = document.getElementById('fileInput');
  var uploadPreview = document.getElementById('uploadPreview');
  var previewImage = document.getElementById('previewImage');
  var previewName = document.getElementById('previewName');
  var previewSize = document.getElementById('previewSize');
  var deleteBtn = document.getElementById('deleteUpload');
  var isUploading = false;

  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', function (e) {
      if (e.target.closest('.dash-upload-delete')) return;
      if (e.target.closest('.dash-upload-preview')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (file) handleFile(file);
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(function (evt) {
      uploadArea.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(function (evt) {
      uploadArea.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
      });
    });

    uploadArea.addEventListener('drop', function (e) {
      var files = e.dataTransfer.files;
      if (files.length > 0) handleFile(files[0]);
    });

    if (deleteBtn) {
      deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        resetUpload();
      });
    }

    async function handleFile(file) {
      if (isUploading) return;

      var validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
        showToast('Invalid file type. Please upload JPG, PNG, WEBP, or PDF.', 'error');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        showToast('File too large. Maximum size is 25MB.', 'error');
        return;
      }

      isUploading = true;
      previewName.textContent = file.name;
      previewName.title = file.name;
      previewSize.textContent = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      if (file.type.match(/image\//)) {
        var reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
        previewImage.style.display = 'block';
        document.getElementById('pdfIcon').style.display = 'none';
      } else if (file.type === 'application/pdf' || file.name.match(/\.pdf$/i)) {
        previewImage.style.display = 'none';
        document.getElementById('pdfIcon').style.display = 'block';
      }
      uploadPreview.classList.add('show');

      var formData = new FormData();
      formData.append('file', file);

      showToast('Uploading...', 'loading');

      try {
        var res = await fetch('/upload', { method: 'POST', body: formData });
        var data = await res.json();

        if (res.ok) {
          showToast('Upload successful! Starting analysis...');
          // Poll for progress
          if (data.analysisId) {
            pollAnalysisProgress(data.analysisId);
          }
        } else {
          showToast(data.error || 'Upload failed', 'error');
          resetUpload();
        }
      } catch (err) {
        console.error('Upload error:', err);
        showToast('Upload failed. Please try again.', 'error');
        resetUpload();
      } finally {
        isUploading = false;
      }
    }

    function pollAnalysisProgress(analysisId) {
      var interval = setInterval(async function () {
        try {
          var res = await fetch('/api/analysis/' + analysisId + '/progress');
          var data = await res.json();

          if (data.status === 'completed') {
            clearInterval(interval);
            showToast('Analysis complete!');
            setTimeout(function () {
              window.location.href = '/analysis/' + analysisId;
            }, 1000);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            showToast('Analysis failed: ' + (data.lastError || 'Unknown error'), 'error');
          } else {
            // Update progress UI if needed
            if (data.currentStep) {
              showToast('Processing: ' + data.currentStep + ' (' + data.progress + '%)', 'loading');
            }
          }
        } catch (err) {
          console.error('Progress poll error:', err);
        }
      }, 2000);
    }

    function resetUpload() {
      fileInput.value = '';
      uploadPreview.classList.remove('show');
      previewImage.src = '';
      previewImage.style.display = 'block';
      var pdfIcon = uploadPreview.querySelector('.material-symbols-outlined');
      if (pdfIcon && pdfIcon.textContent === 'picture_as_pdf') {
        pdfIcon.remove();
      }
      previewName.textContent = '';
      previewSize.textContent = '';
    }
  }

  // ===== COUNTER ANIMATION =====
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.dash-stat-number[data-target]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }

      requestAnimationFrame(step);
    });
  }

  // Observer for counter animation
  if (typeof IntersectionObserver !== 'undefined') {
    var statsRow = document.querySelector('#dashStats');
    if (statsRow) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounters();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(statsRow);
    }
  } else {
    animateCounters();
  }

  // ===== RESOURCE TAB FILTERING =====
  var resourceTabs = document.querySelectorAll('#resourceTabs .dash-tab');
  var resourceCards = document.querySelectorAll('#resourceGrid .dash-resource-card');

  resourceTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      resourceTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      var filter = tab.getAttribute('data-tab');
      resourceCards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });

    // Keyboard navigation: arrow keys
    tab.addEventListener('keydown', function (e) {
      var tabs = Array.from(resourceTabs);
      var currentIndex = tabs.indexOf(this);
      var nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        e.preventDefault();
      }

      if (nextIndex !== currentIndex) {
        tabs[nextIndex].click();
        tabs[nextIndex].focus();
      }
    });
  });

  // ===== DARK MODE TOGGLE =====
  // Handled by shared theme.js now

  // ===== TOAST NOTIFICATIONS =====
  function showToast(message, type) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'dash-toast';
    var icon = type === 'error' ? 'error' : type === 'loading' ? 'sync' : 'check_circle';
    var color =
      type === 'error' ? '#EF4444' : type === 'loading' ? 'var(--primary)' : 'var(--success)';
    var spin = type === 'loading' ? ' style="animation: spin 1s linear infinite;"' : '';
    toast.innerHTML =
      '<span class="toast-icon material-symbols-outlined"' +
      spin +
      ' style="color:' +
      color +
      '">' +
      icon +
      '</span>' +
      message;
    container.appendChild(toast);
    setTimeout(
      function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(function () {
          toast.remove();
        }, 300);
      },
      type === 'loading' ? 10000 : 3000
    );
  }

  // ===== RIPPLE EFFECT =====
  document.querySelectorAll('.dash-ripple').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var ripple = document.createElement('span');
      ripple.style.cssText =
        'position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);width:60px;height:60px;left:' +
        (x - 30) +
        'px;top:' +
        (y - 30) +
        'px;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none';
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });

  // ===== USER DROPDOWN MENU =====
  var userMenuToggle = document.getElementById('userMenuToggle');
  var userDropdown = document.getElementById('userDropdown');
  var userCard = document.querySelector('.dash-user-card');

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = userDropdown.style.display !== 'none';
      userDropdown.style.display = isOpen ? 'none' : 'block';
      userMenuToggle.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    document.addEventListener('click', function (e) {
      if (!userCard.contains(e.target)) {
        userDropdown.style.display = 'none';
        userMenuToggle.style.transform = 'rotate(0deg)';
      }
    });
  }

  console.log('Dashboard v2 initialized');
})();
