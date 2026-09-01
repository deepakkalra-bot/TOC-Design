/* ============================================================
   fi-scripts.js — Nexdigm Market Research Widget Scripts
   Prefix: fi  |  Requires: Chart.js CDN
   Updated: 9 new feedback points applied
   ============================================================ */

(function () {
  'use strict';

  /* ── TOC ACCORDION ──────────────────────────────────────── */
  /* Legacy handler kept for fi-toc-header (if any remain) */
  window.fiToggleToc = function (header) {
    var body   = header.nextElementSibling;
    var isOpen = header.classList.contains('fi-open');
    document.querySelectorAll('.fi-toc-header').forEach(function (h) {
      h.classList.remove('fi-open');
      if (h.nextElementSibling) h.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) { header.classList.add('fi-open'); body.style.display = 'block'; }
  };

  /* New chapter accordion — used by fi-html-box2-toc.html */
  window.fiToggleCh = function (hdr) {
    var body   = hdr.nextElementSibling;
    var isOpen = hdr.classList.contains('fi-open');
    document.querySelectorAll('.fi-ch-hdr').forEach(function (h) {
      h.classList.remove('fi-open');
      if (h.nextElementSibling) h.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) { hdr.classList.add('fi-open'); body.style.display = 'block'; }
  };

  /* Expand / Collapse All controls */
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

  /* ── FAQ ACCORDION — new design (#5) ────────────────────── */
  window.fiToggleFaq = function (qEl) {
    var ans    = qEl.nextElementSibling;
    var isOpen = qEl.classList.contains('fi-open');
    document.querySelectorAll('.fi-faq-q').forEach(function (q) {
      q.classList.remove('fi-open');
      if (q.nextElementSibling) q.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) { qEl.classList.add('fi-open'); ans.style.display = 'block'; }
  };

  /* ── RESEARCH METHODOLOGY TAB (#4) ──────────────────────── */
  window.fiPhaseTab = function (btn, index) {
    document.querySelectorAll('.fi-phase-tab').forEach(function (t, i) {
      t.classList.toggle('fi-phase-active', i === index);
    });
    document.querySelectorAll('.fi-phase-card').forEach(function (c, i) {
      c.classList.toggle('fi-phase-card-active', i === index);
    });
  };

  /* ── OPPORTUNITY SCROLL HIGHLIGHT (#3) ──────────────────── */
  /* Re-triggers every time the box enters viewport — not just once */
  window.fiInitOppScroll = function () {
    var boxes = document.querySelectorAll('.fi-opp-box');
    if (!boxes.length) return;

    if (!window.IntersectionObserver) {
      /* Fallback: just show all normally — no opacity:0 so nothing is hidden */
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Box entered viewport → highlight it */
          entry.target.classList.add('fi-opp-active');
        } else {
          /* Box left viewport → remove highlight so it can re-animate next visit */
          entry.target.classList.remove('fi-opp-active');
        }
      });
    }, {
      threshold: 0.35   /* trigger when 35% of the box is visible */
    });

    boxes.forEach(function (b) {
      obs.observe(b);   /* NO unobserve — keeps watching for every scroll */
    });
  };

  /* ── CHARTS ─────────────────────────────────────────────── */
  window.fiInitCharts = function () {

    /* Tooltip: label only, no numbers on face (#4 from prev feedback) */
    var noNumTip = { callbacks: { label: function (c) { return '  ' + c.label; } } };

    /* Chart 0 — Market Size Bar + Line (y-axis values masked, #9: no "Full Report" text) */
    (function () {
      var el = document.getElementById('fi-chartMarketSize');
      if (!el) return;
      var labels = ['2020','2021','2022','2023','2024','2025E','2026F','2027F','2028F','2029F','2030F'];
      new Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Market Revenue',           /* #9: removed "Full Report" */
              data: [4.7, 4.4, 4.9, 5.5, 6.2, 6.8, 7.3, 7.9, 8.5, 9.2, 9.9],
              backgroundColor: labels.map(function(l,i){ return i<=5?'#645BA8':'#9F91C6'; }),
              borderColor: '#211C48', borderWidth: 1, yAxisID: 'y', order: 2
            },
            {
              label: 'YoY Growth Trend',         /* #9: removed "Full Report" */
              data: [null,-6.4,11.4,12.2,12.7,9.7,7.4,8.2,7.6,8.2,7.6],
              type: 'line', borderColor: '#26AD8B',
              backgroundColor: 'rgba(38,173,139,0.12)',
              pointRadius: 4, pointBackgroundColor: '#26AD8B',
              borderWidth: 2, tension: 0.4, yAxisID: 'y1', order: 1, spanGaps: true
            }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12 }, color: '#333333' } },
            tooltip: { callbacks: { label: function () { return '  Available in full report'; } } }
          },
          scales: {
            y:  { beginAtZero: true,
                  title: { display: true, text: 'Market Value', font: { size: 11 }, color: '#467082' },
                  grid: { color: 'rgba(100,91,168,0.08)' }, ticks: { display: false } },
            y1: { position: 'right',
                  title: { display: true, text: 'Growth Trend', font: { size: 11 }, color: '#467082' },
                  grid: { drawOnChartArea: false }, ticks: { display: false } }
          }
        }
      });
    })();

    /* Chart 1 — School Type Donut (no numbers on chart face) */
    (function () {
      var el = document.getElementById('fi-chartSchoolType');
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Govt / National Schools','Supplementary Tuition','Private Schools','International Schools','EdTech Platforms'],
          datasets: [{ data: [62, 18, 10, 7, 3],
            backgroundColor: ['#645BA8','#C86AA9','#F0AA31','#26AD8B','#C6BDDD'],
            borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();

    /* Chart 2 — Distribution Channel Donut */
    (function () {
      var el = document.getElementById('fi-chartChannel');
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Physical Classroom','Online / LMS','Mobile Application','Hybrid / Blended','Retail Franchise'],
          datasets: [{ data: [71, 12, 7, 6, 4],
            backgroundColor: ['#645BA8','#C86AA9','#F0AA31','#26AD8B','#2D7D3E'],
            borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();

  }; /* end fiInitCharts */

  /* ── AUTO-INIT ──────────────────────────────────────────── */
  function fiInit() {
    window.fiInitCharts();
    window.fiInitOppScroll();
    /* Activate first phase card on load */
    var firstCard = document.querySelector('.fi-phase-card');
    if (firstCard) firstCard.classList.add('fi-phase-card-active');
    var firstTab = document.querySelector('.fi-phase-tab');
    if (firstTab) firstTab.classList.add('fi-phase-active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fiInit);
  } else {
    fiInit();
  }

})();