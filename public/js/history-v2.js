(function () {
  'use strict';

  // ===== GET DATA FROM SERVER =====
  var serverData = { analyses: window.historyAnalyses || [] };

  // Transform server data to card format
  var transformedCards = serverData.analyses.map(function (a) {
    var colors = [];
    var fontCount = 0;
    var assetCount = 0;

    if (a.colors) {
      if (a.colors.extracted && a.colors.extracted.length) {
        colors = a.colors.extracted.map(function (c) {
          return c.hex;
        });
      } else if (a.colors.palette) {
        colors = [].concat(
          a.colors.palette.background || [],
          a.colors.palette.primary || [],
          a.colors.palette.secondary || [],
          a.colors.palette.accent || []
        );
      }
    }

    if (a.fonts && a.fonts.length) {
      fontCount = a.fonts.length;
    }

    if (a.resource_recommendations) {
      var recs = a.resource_recommendations;
      assetCount =
        (recs.fonts?.length || 0) +
        (recs.colors?.length || 0) +
        (recs.icons?.length || 0) +
        (recs.stock_photos?.length || 0) +
        (recs.illustrations?.length || 0) +
        (recs.patterns?.length || 0);
    }

    // Determine category from design style
    var category = 'banners';
    if (a.design_style) {
      var topStyle = Object.entries(a.design_style).sort((a, b) => b[1] - a[1])[0];
      if (topStyle) {
        var styleMap = {
          Tech: 'ui',
          Modern: 'ui',
          Minimal: 'ui',
          Corporate: 'web',
          Creative: 'illustrations',
          Luxury: 'logos',
          Editorial: 'web',
          Vintage: 'illustrations',
        };
        category = styleMap[topStyle[0]] || 'banners';
      }
    }

    return {
      id: a.id,
      title: a.title,
      category: category,
      date: new Date(a.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      match: a.confidence_score || 85,
      colors: colors.slice(0, 6),
      fonts: fontCount,
      assets: assetCount,
      status: a.status || 'completed',
      upload_id: a.upload_id || null,
    };
  });

  var allCards = transformedCards;
  var currentCategory = 'all';
  var searchQuery = '';
  var itemsPerPage = 6;
  var currentPage = 0;

  var historyGrid = document.getElementById('historyGrid');
  var emptyState = document.getElementById('emptyState');
  var paginationSection = document.getElementById('paginationSection');
  var showingText = document.getElementById('showingText');
  var loadMoreBtn = document.getElementById('loadMoreBtn');
  var searchInput = document.getElementById('searchInput');
  var categoryPills = document.querySelectorAll('#categoryPills .pill');

  // ===== RENDER =====
  function renderCards(append) {
    var filtered = getFilteredCards();
    var start = append ? currentPage * itemsPerPage : 0;
    var end = (currentPage + 1) * itemsPerPage;
    var pageCards = filtered.slice(start, end);

    if (pageCards.length === 0 && !append) {
      historyGrid.innerHTML = '';
      emptyState.style.display = 'block';
      paginationSection.style.display = 'none';
      return;
    }

    if (!append) {
      historyGrid.innerHTML = '';
    }
    emptyState.style.display = 'none';
    paginationSection.style.display = '';

    pageCards.forEach(function (card) {
      var cardEl = createCardElement(card);
      historyGrid.appendChild(cardEl);
    });

    var total = filtered.length;
    showingText.textContent = 'Showing ' + Math.min(end, total) + ' of ' + total + ' analyses';
    loadMoreBtn.style.display = end >= total ? 'none' : '';
  }

  function getFilteredCards() {
    return allCards.filter(function (card) {
      if (currentCategory !== 'all' && card.category !== currentCategory) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        var match = card.title.toLowerCase().indexOf(q) !== -1;
        if (!match) {
          for (var i = 0; i < card.colors.length; i++) {
            if (card.colors[i].toLowerCase().indexOf(q) !== -1) {
              match = true;
              break;
            }
          }
        }
        if (!match && card.category.indexOf(q) !== -1) match = true;
        return match;
      }
      return true;
    });
  }

  function createCardElement(card) {
    var cardEl = document.createElement('div');
    cardEl.className = 'history-card';
    cardEl.setAttribute('data-id', card.id);
    cardEl.setAttribute('data-category', card.category);

    var statusConfig = {
      completed: { color: 'rgba(16,185,129,0.9)', icon: 'check_circle' },
      processing: { color: 'rgba(245,158,11,0.9)', icon: 'progress_activity' },
      failed: { color: 'rgba(239,68,68,0.9)', icon: 'error' },
      pending: { color: 'rgba(99,102,241,0.9)', icon: 'schedule' },
    };
    var status = statusConfig[card.status] || statusConfig.completed;

    var colorsHtml = '';
    var maxDots = 4;
    card.colors.slice(0, maxDots).forEach(function (c) {
      colorsHtml += '<span class="dot" style="background:' + c + '"></span>';
    });
    if (card.colors.length > maxDots) {
      colorsHtml += '<span class="more">+' + (card.colors.length - maxDots) + '</span>';
    }

    // Build image HTML
    var imageHtml;
    if (card.upload_id) {
      imageHtml =
        '<img src="/api/uploads/' +
        card.upload_id +
        '" alt="' +
        escapeHtml(card.title) +
        '" class="w-full h-full object-cover">';
    } else {
      imageHtml = '<span class="placeholder-icon material-symbols-outlined">image</span>';
    }

    cardEl.innerHTML =
      '<button class="history-card-delete" data-id="' +
      card.id +
      '" aria-label="Delete"><span class="material-symbols-outlined">close</span></button>' +
      '<div class="history-card-image">' +
      imageHtml +
      '<div class="history-card-badge" style="background:' +
      status.color +
      '">' +
      '<span class="material-symbols-outlined">' +
      status.icon +
      '</span>' +
      '<span style="text-transform:capitalize;">' +
      card.status +
      '</span>' +
      '</div>' +
      '</div>' +
      '<div class="history-card-body">' +
      '<h3>' +
      escapeHtml(card.title) +
      '</h3>' +
      '<div class="date">' +
      card.date +
      '</div>' +
      '<div class="history-color-strip">' +
      colorsHtml +
      '</div>' +
      '<div class="history-card-stats">' +
      '<div class="stat"><span class="material-symbols-outlined">text_fields</span> ' +
      card.fonts +
      ' fonts</div>' +
      '<div class="stat"><span class="material-symbols-outlined">inventory_2</span> ' +
      card.assets +
      ' assets</div>' +
      '<div class="stat"><span class="material-symbols-outlined">stars</span> ' +
      card.match +
      '% match</div>' +
      '</div>' +
      '</div>';

    // Delete handler
    cardEl.querySelector('.history-card-delete').addEventListener('click', function (e) {
      e.stopPropagation();
      deleteCard(card.id);
    });

    // Click to view
    cardEl.addEventListener('click', function () {
      window.location.href = '/analysis/' + card.id;
    });

    return cardEl;
  }

  function deleteCard(id) {
    allCards = allCards.filter(function (c) {
      return c.id !== id;
    });
    renderCards(false);
    showToast('Analysis removed from history');
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== EVENT LISTENERS =====
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      currentPage++;
      renderCards(true);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = this.value;
      currentPage = 0;
      renderCards(false);
    });
  }

  categoryPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      categoryPills.forEach(function (p) {
        p.classList.remove('active');
      });
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      currentPage = 0;
      renderCards(false);
    });
  });

  // FAB
  var fabBtn = document.getElementById('fabBtn');
  if (fabBtn) {
    fabBtn.addEventListener('click', function () {
      window.location.href = '/upload';
    });
  }

  // ===== SIDEBAR =====
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  var mobileToggle = document.getElementById('mobileToggle');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  }
  if (mobileToggle) mobileToggle.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  document.querySelectorAll('.dash-nav-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.dash-nav-item').forEach(function (n) {
        n.classList.remove('active');
      });
      item.classList.add('active');
      var route = item.getAttribute('data-route');
      if (route) window.location.href = '/' + route;
      if (window.innerWidth <= 768) toggleSidebar();
    });
  });

  // ===== DARK MODE =====
  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = themeToggle ? themeToggle.querySelector('.material-symbols-outlined') : null;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dash-theme', theme);
    if (themeIcon) themeIcon.textContent = theme === 'dashboard-dark' ? 'light_mode' : 'dark_mode';
  }
  var saved = localStorage.getItem('dash-theme') || 'light';
  setTheme(saved);
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      setTheme(cur === 'dashboard-dark' ? 'light' : 'dashboard-dark');
    });
  }

  // ===== TOAST =====
  function showToast(message, type) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast';
    var icon = type === 'error' ? 'error' : 'check_circle';
    var color = type === 'error' ? '#EF4444' : '#10B981';
    toast.innerHTML =
      '<span class="toast-icon material-symbols-outlined" style="color:' +
      color +
      '">' +
      icon +
      '</span>' +
      message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3000);
  }
  window.showToast = showToast;

  // ===== INIT =====
  renderCards(false);

  console.log('History v2 initialized with ' + allCards.length + ' analyses');
})();
