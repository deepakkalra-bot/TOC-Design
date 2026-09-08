/* ============================================================
   fi-scripts.js — Nexdigm Market Research Widget Scripts
   Prefix: fi  |  Requires: Chart.js CDN
   Updated: Reverted back to Brand Purple Chart Palette
   ============================================================ */

(function () {
  'use strict';

  /* ── TOC ACCORDION ──────────────────────────────────────── */
  window.fiToggleToc = function (header) {
    var body   = header.nextElementSibling;
    var isOpen = header.classList.contains('fi-open');
    document.querySelectorAll('.fi-toc-header').forEach(function (h) {
      h.classList.remove('fi-open');
      if (h.nextElementSibling) h.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) { header.classList.add('fi-open'); body.style.display = 'block'; }
  };

  window.fiToggleCh = function (hdr) {
    var body   = hdr.nextElementSibling;
    var isOpen = hdr.classList.contains('fi-open');
    document.querySelectorAll('.fi-ch-hdr').forEach(function (h) {
      h.classList.remove('fi-open');
      if (h.nextElementSibling) h.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) { hdr.classList.add('fi-open'); body.style.display = 'block'; }
  };

  window.fiExpandAll = function () {
    document.querySelectorAll('.fi-ch-hdr').forEach(function (h) {
      h.classList.add('fi-open');
      if (h.nextElementSibling) h.nextElementSibling.style.display = 'block';
    });
  };
  window.fiCollapseAll = function () {
    document.querySelectorAll('.fi-ch-hdr').forEach(function (h) {
      h.classList.remove('fi-open');
      if (h.nextElementSibling) h.nextElementSibling.style.display = 'none';
    });
  };

  /* ── FAQ ACCORDION ──────────────────────────────────────── */
  window.fiToggleFaq = function (qEl) {
    var ans    = qEl.nextElementSibling;
    var isOpen = qEl.classList.contains('fi-open');
    document.querySelectorAll('.fi-faq-q').forEach(function (q) {
      q.classList.remove('fi-open');
      if (q.nextElementSibling) q.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) { qEl.classList.add('fi-open'); ans.style.display = 'block'; }
  };

  /* ── RESEARCH METHODOLOGY TABS ───────────────────────────── */
  window.fiPhaseTab = function (btn, index) {
    document.querySelectorAll('.fi-phase-tab').forEach(function (t, i) {
      t.classList.toggle('fi-phase-active', i === index);
    });
    document.querySelectorAll('.fi-phase-card').forEach(function (c, i) {
      c.classList.toggle('fi-phase-card-active', i === index);
    });
  };

  /* ── GENERIC HORIZONTAL CAROUSEL HELPER ───────────────────── */
  function createHorizontalCarousel(sectionSel, wrapId, prevId, nextId, dotsSel) {
    var section = document.querySelector(sectionSel);
    var wrap    = document.getElementById(wrapId);
    if (!section || !wrap) return;

    var cards = wrap.querySelectorAll('.fi-opp-hcard, .fi-ch-hcard');
    var total = cards.length;
    if (total === 0) return;

    var PHASES           = total - 1;
    var progress         = 0;
    var animFrame        = null;
    var autoTimer        = null;
    var currentCardIndex = 0;
    var isHovered        = false;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

    function initHeight() {
      var maxH = 0;
      cards.forEach(function (c) {
        if (c.offsetHeight > maxH) maxH = c.offsetHeight;
      });
      if (maxH > 0) wrap.style.height = (maxH + 4) + 'px';
    }

    function render(gp) {
      var phase = clamp(Math.floor(gp * PHASES), 0, PHASES - 1);
      var pp    = clamp(gp * PHASES - phase, 0, 1);

      cards.forEach(function (card, i) {
        var tx, sc, op;
        if (i < phase) {
          tx = -100; sc = 0.90; op = 0;
        } else if (i === phase && gp < 1) {
          tx = lerp(0, -100, pp);
          sc = lerp(1, 0.90, pp);
          op = lerp(1, 0, pp);
        } else if (i === phase + 1 && gp < 1) {
          tx = lerp(100, 0, pp);
          sc = lerp(0.93, 1, pp);
          op = lerp(0, 1, pp);
        } else if (i > phase + 1 || (gp >= 1 && i > phase)) {
          tx = 100; sc = 0.93; op = 0;
        } else {
          tx = 0; sc = 1; op = 1;
        }
        card.style.transform = 'translateX(' + tx + '%) scale(' + sc + ')';
        card.style.opacity   = op;
      });

      var dotIdx = gp >= 1 ? total - 1 : (pp >= 0.5 ? phase + 1 : phase);
      document.querySelectorAll(dotsSel).forEach(function (d, i) {
        d.classList.toggle('fi-opp-hdot-active', i === dotIdx);
        d.classList.toggle('fi-ch-hdot-active', i === dotIdx);
      });
    }

    function animateToProgress(targetP) {
      if (animFrame) cancelAnimationFrame(animFrame);
      var startP = progress;
      var startTime = null;
      var duration = 350;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var t = Math.min(elapsed / duration, 1);
        var ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        progress = lerp(startP, targetP, ease);
        render(progress);
        if (t < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          progress = targetP;
          render(progress);
          animFrame = null;
        }
      }
      animFrame = requestAnimationFrame(step);
    }

    function goToCard(idx) {
      currentCardIndex = idx;
      var targetP = idx / PHASES;
      animateToProgress(targetP);
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoTimer = setInterval(function () {
        if (!isHovered) {
          var nextIdx = (currentCardIndex + 1) % total;
          goToCard(nextIdx);
        }
      }, 3500);
    }

    function stopAutoScroll() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    section.addEventListener('mouseenter', function () { isHovered = true; });
    section.addEventListener('mouseleave', function () { isHovered = false; });

    var dots = document.querySelectorAll(dotsSel);
    dots.forEach(function (d, i) {
      d.addEventListener('click', function (e) {
        e.preventDefault();
        goToCard(i);
        startAutoScroll();
      });
    });

    var prevBtn = document.getElementById(prevId);
    var nextBtn = document.getElementById(nextId);

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var prevIdx = (currentCardIndex - 1 + total) % total;
        goToCard(prevIdx);
        startAutoScroll();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var nextIdx = (currentCardIndex + 1) % total;
        goToCard(nextIdx);
        startAutoScroll();
      });
    }

    initHeight();
    window.addEventListener('resize', initHeight);
    render(0);
    startAutoScroll();
  }

  /* ── INITIALIZE CAROUSELS ────────────────────────────────── */
  window.fiInitOppHStack = function () {
    createHorizontalCarousel('.fi-opp-section', 'fi-opp-hstack-wrap', 'fi-opp-prev', 'fi-opp-next', '#fi-opp-hdots .fi-opp-hdot');
  };

  window.fiInitChallengeHStack = function () {
    createHorizontalCarousel('.fi-challenge-section', 'fi-ch-hstack-wrap', 'fi-ch-prev', 'fi-ch-next', '#fi-ch-hdots .fi-opp-hdot');
  };

  /* ── CHARTS — Nexdigm Brand Color Palette ────────────────── */
  window.fiInitCharts = function () {
    var noNumTip = { callbacks: { label: function (c) { return '  ' + c.label; } } };

    /* Brand Donut Color Palette:
       1. Nexdigm Purple (#4012A6)
       2. Nexdigm Magenta Tint (#C86AA9)
       3. Vivid Orange (#F0AA31)
       4. Dark Teal (#26AD8B)
       5. Laurel Green (#2D7D3E)
    */
    var brandPalette = ['#4012A6', '#C86AA9', '#F0AA31', '#26AD8B', '#2D7D3E'];

    /* Chart 0 — Market Size Bar + Line (Solid Brand Purple #4012A6 & Soft Purple Tint #9F91C6) */
    (function () {
      var el = document.getElementById('fi-chartMarketSize');
      if (!el) return;
      var d       = window.fiChartData ? window.fiChartData.marketSize : {};
      var labels  = d.labels  || [];
      var revenue = d.revenue || [];
      var growth  = d.growth  || [];
      new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Market Revenue',
              data: revenue,
              /* Solid Nexdigm Purple (#4012A6) for historical, Soft Purple Tint (#9F91C6) for forecast */
              backgroundColor: labels.map(function(l, i) {
                return i <= 5 ? '#4012A6' : '#9F91C6';
              }),
              borderColor: '#211C48', borderWidth: 1, yAxisID: 'y', order: 2
            },
            {
              label: 'YoY Growth Trend',
              data: growth,
              type: 'line', borderColor: '#26AD8B',
              backgroundColor: 'rgba(38,173,139,0.12)',
              pointRadius: 4, pointBackgroundColor: '#26AD8B',
              borderWidth: 2, tension: 0.4, yAxisID: 'y1', order: 1, spanGaps: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12, family: 'Roboto' }, color: '#333333' } },
            tooltip: { callbacks: { label: function () { return '  Available in full report'; } } }
          },
          scales: {
            y:  { beginAtZero: true, title: { display: true, text: 'Market Value', font: { size: 11, family: 'Roboto' }, color: '#58585B' }, grid: { color: 'rgba(64,18,166,0.07)' }, ticks: { display: false } },
            y1: { position: 'right', title: { display: true, text: 'Growth Trend', font: { size: 11, family: 'Roboto' }, color: '#58585B' }, grid: { drawOnChartArea: false }, ticks: { display: false } }
          }
        }
      });
    })();

    /* Chart 1 — School Type Donut */
    (function () {
      var el = document.getElementById('fi-chartSchoolType');
      var st = window.fiChartData ? window.fiChartData.businessType : {};
      var typeLabel = st.labels || [];
      var typeData  = st.data   || [];
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: typeLabel,
          datasets: [{ data: typeData, backgroundColor: brandPalette, borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11, family: 'Roboto' }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();

    /* Chart 2 — Distribution Channel Donut */
    (function () {
      var el = document.getElementById('fi-chartChannel');
      var ch = window.fiChartData ? window.fiChartData.businessChannel : {};
      var chanelLabel = ch.labels || [];
      var chanelData  = ch.data   || [];
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: chanelLabel,
          datasets: [{ data: chanelData, backgroundColor: brandPalette, borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11, family: 'Roboto' }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();

    /* Chart 3 — Competitive Landscape Donut */
    (function () {
      var el = document.getElementById('fi-chartCompetitive');
      var cp = window.fiChartData ? window.fiChartData.competitive : {};
      var compLabels = cp.labels || [];
      var compData   = cp.data   || [];
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: compLabels,
          datasets: [{
            data: compData,
            backgroundColor: brandPalette,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11, family: 'Roboto' }, color: '#333333', padding: 12 } },
            tooltip: noNumTip
          },
          cutout: '55%'
        }
      });
    })();
  };

  /* ── AUTO-INIT ON DOM LOAD ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.fiInitOppHStack === 'function') window.fiInitOppHStack();
    if (typeof window.fiInitChallengeHStack === 'function') window.fiInitChallengeHStack();
    if (typeof window.fiInitCharts === 'function') window.fiInitCharts();
  });

})();
