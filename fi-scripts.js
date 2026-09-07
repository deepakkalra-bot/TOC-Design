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

  /* ── OPPORTUNITY HORIZONTAL CAROUSEL ────────────────────────── */
  /* ── OPPORTUNITY HORIZONTAL STACK — Swag-style, scroll-driven ──── */
  /*
     Flow (scrolling DOWN into section):
       1. Page scrolls normally until section top hits viewport midpoint.
       2. Page LOCKS. Each further scroll tick slides the next card in from
          the RIGHT while the current card exits to the LEFT with a scale-down.
       3. After all 3 cards are shown → page UNLOCKS, scroll continues.
     Reverse (scrolling UP) reverses each transition symmetrically.
  */
  window.fiInitOppHStack = function () {
    var section = document.querySelector('.fi-opp-section');
    var wrap    = document.getElementById('fi-opp-hstack-wrap');
    if (!section || !wrap) return;

    var cards   = wrap.querySelectorAll('.fi-opp-hcard');
    var total   = cards.length;          /* 3 */
    var PHASES  = total - 1;             /* 2 transitions */
    var locked  = false;
    var lockY   = 0;
    var progress = 0;                    /* 0 = Card 1, 1 = Card 3 */
    var SENSITIVITY = 0.0045;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

    /* Set container height to the tallest card */
    function initHeight() {
      var maxH = 0;
      cards.forEach(function (c) { maxH = Math.max(maxH, c.offsetHeight); });
      if (maxH > 0) wrap.style.height = maxH + 'px';
    }

    /* Render all cards based on global progress 0→1 */
    function render(gp) {
      var phase = clamp(Math.floor(gp * PHASES), 0, PHASES - 1);
      var pp    = clamp(gp * PHASES - phase, 0, 1);  /* 0→1 within phase */

      cards.forEach(function (card, i) {
        var tx, sc, op;

        if (i < phase) {
          /* Already exited left — fully off screen */
          tx = -100; sc = 0.90; op = 0.7;
        } else if (i === phase && gp < 1) {
          /* Currently exiting */
          tx = lerp(0, -100, pp);
          sc = lerp(1, 0.90, pp);
          op = lerp(1, 0.7, pp);
        } else if (i === phase + 1 && gp < 1) {
          /* Currently entering from right */
          tx = lerp(100, 0, pp);
          sc = lerp(0.93, 1, pp);
          op = lerp(0.8, 1, pp);
        } else if (i > phase + 1 || (gp >= 1 && i > phase)) {
          /* Waiting off-screen right */
          tx = 100; sc = 0.93; op = 0.8;
        } else {
          /* gp === 1: last card active */
          tx = 0; sc = 1; op = 1;
        }

        card.style.transform = 'translateX(' + tx + '%) scale(' + sc + ')';
        card.style.opacity   = op;
      });

      /* Update dots */
      var dotIdx = gp >= 1 ? total - 1 : (pp >= 0.5 ? phase + 1 : phase);
      document.querySelectorAll('#fi-opp-hdots .fi-opp-hdot').forEach(function (d, i) {
        d.classList.toggle('fi-opp-hdot-active', i === dotIdx);
      });
    }

    /* ── Momentum / inertia guard while locked ──────────────── */
    window.addEventListener('scroll', function () {
      if (locked) window.scrollTo(0, lockY);
    }, { passive: true });

    /* ── Main wheel driver ──────────────────────────────────── */
    window.addEventListener('wheel', function (e) {
      var rect  = section.getBoundingClientRect();
      var wh    = window.innerHeight;

      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      if (e.deltaMode === 2) delta *= 600;

      if (!locked) {
        var reachedMid = rect.top <= wh / 2 && rect.bottom > 0;
        var needsAnim  = (delta > 0 && progress < 1) || (delta < 0 && progress > 0);
        if (!reachedMid || !needsAnim) return;
        lockY  = window.pageYOffset;
        locked = true;
      }

      e.preventDefault();

      var next = progress + delta * SENSITIVITY;

      if (next <= 0 && delta < 0) {
        progress = 0; render(0); locked = false; return;
      }
      if (next >= 1 && delta > 0) {
        progress = 1; render(1); locked = false; return;
      }

      progress = clamp(next, 0, 1);
      render(progress);
    }, { passive: false });

    initHeight();
    render(0); /* initial state — Card 1 visible */
  };

  /* ── CHALLENGE VERTICAL CARD STACK — 3-card Swag-style scroll lock ─ */
  /*
     3 phases using 3 cards:
       Phase 1 (progress 0→0.5):
         Box1 scales back 1.0→0.96 (stays in place, peek zone)
         Box2 slides up: translateY(stackH → peekH)   [becomes front card]
       Phase 2 (progress 0.5→1.0):
         Box1 rises above container: translateY(0 → -box1Height) [disappears]
         Box2 moves up to peek:      translateY(peekH → 0)       [becomes peek card]
         Box3 slides up:             translateY(stackH → peekH)  [becomes front card]
     Page is locked as soon as section midpoint hits screen centre.
     Fast scrollers are held at the section until animation finishes.
  */
  window.fiInitChallengeAnim = function () {
    var section = document.querySelector('.fi-challenge-section');
    var stackEl = document.querySelector('.fi-challenge-stack');
    if (!section || !stackEl) return;

    var box1 = stackEl.querySelector('.fi-ch-box-1');
    var box2 = stackEl.querySelector('.fi-ch-box-2');
    var box3 = stackEl.querySelector('.fi-ch-box-3');
    var dot1 = document.getElementById('fi-dot-1');
    var dot2 = document.getElementById('fi-dot-2');
    var dot3 = document.getElementById('fi-dot-3');

    var peekH       = 52;
    var progress    = 0;
    var SENSITIVITY = 0.0045;
    var locked      = false;
    var lockY       = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

    function render(p) {
      var stackH   = stackEl.offsetHeight;    /* container height (Box1 + padding) */
      var box1H    = box1 ? box1.offsetHeight : stackH - 20;

      var p1 = clamp(p / 0.5, 0, 1);          /* 0→1 during progress 0→0.5 */
      var p2 = clamp((p - 0.5) / 0.5, 0, 1); /* 0→1 during progress 0.5→1 */

      /* ── Box 1 ─────────────────────────────────────────────── */
      /* Phase 1: stays in place, scales 1.0→0.96 (pushed back)  */
      /* Phase 2: rises above container, scales 0.96→0.90        */
      if (box1) {
        var ty1 = p <= 0.5 ? 0 : lerp(0, -box1H, p2);
        var sc1 = p <= 0.5 ? lerp(1.0, 0.96, p1) : lerp(0.96, 0.90, p2);
        box1.style.transform = 'translateY(' + ty1 + 'px) scale(' + sc1 + ')';
      }

      /* ── Box 2 ─────────────────────────────────────────────── */
      /* Phase 1: slides from stackH→peekH (becomes front card)  */
      /* Phase 2: moves peekH→0 (becomes peek card behind Box 3) */
      if (box2) {
        var ty2 = p <= 0.5
          ? lerp(stackH, peekH, p1)   /* Phase 1: slide up */
          : lerp(peekH, 0, p2);       /* Phase 2: rise to peek */
        var sc2 = p <= 0.5 ? 1.0 : lerp(1.0, 0.96, p2);
        box2.style.transform = 'translateY(' + ty2 + 'px) scale(' + sc2 + ')';
      }

      /* ── Box 3 ─────────────────────────────────────────────── */
      /* Phase 1: waits below (stackH)                            */
      /* Phase 2: slides from stackH→peekH (becomes front card)  */
      if (box3) {
        var ty3 = p <= 0.5 ? stackH : lerp(stackH, peekH, p2);
        box3.style.transform = 'translateY(' + ty3 + 'px) scale(1)';
      }

      /* ── Progress dots ─────────────────────────────────────── */
      var active = p < 0.5 ? 0 : (p < 1 ? 1 : 2);
      [dot1, dot2, dot3].forEach(function (d, i) {
        if (d) d.classList.toggle('fi-ch-dot-active', i === active);
      });
    }

    /* ── Momentum / inertia guard while locked ──────────────── */
    window.addEventListener('scroll', function () {
      if (locked) window.scrollTo(0, lockY);
    }, { passive: true });

    /* ── Main wheel driver ──────────────────────────────────── */
    window.addEventListener('wheel', function (e) {
      var rect = section.getBoundingClientRect();
      var wh   = window.innerHeight;

      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      if (e.deltaMode === 2) delta *= 600;

      if (!locked) {
        /* Lock when section top crosses screen midpoint */
        var reachedMid = rect.top <= wh / 2 && rect.bottom > 0;
        var needsAnim  = (delta > 0 && progress < 1) || (delta < 0 && progress > 0);
        if (!reachedMid || !needsAnim) return;
        lockY  = window.pageYOffset;
        locked = true;
      }

      e.preventDefault(); /* stop ALL page scroll while locked */

      var next = progress + delta * SENSITIVITY;

      if (next <= 0 && delta < 0) {
        progress = 0; render(0); locked = false; return;
      }
      if (next >= 1 && delta > 0) {
        progress = 1; render(1); locked = false; return;
      }

      progress = clamp(next, 0, 1);
      render(progress);
    }, { passive: false });

    render(0); /* initial state */
  };

    /* ── GROWTH DRIVERS VERTICAL CARD STACK — 4 BOXES ──────── */
  window.fiInitGrowthAnim = function () {
    var section = document.querySelector('.fi-growth-section');
    var box2    = document.querySelector('.fi-gr-box-2');
    var box3    = document.querySelector('.fi-gr-box-3');
    var box4    = document.querySelector('.fi-gr-box-4');
    var stackEl = document.querySelector('.fi-growth-stack');
    if (!section || !box2 || !box3 || !box4 || !stackEl) return;

    var dot1 = document.getElementById('fi-gr-dot-1');
    var dot2 = document.getElementById('fi-gr-dot-2');
    var dot3 = document.getElementById('fi-gr-dot-3');
    var dot4 = document.getElementById('fi-gr-dot-4');

    var peekH       = 52;   /* px — header peek height */
    var scrollRange = 360; /* px of rect.top travel to complete all 4 cards */

    function update() {
      var rect   = section.getBoundingClientRect();
      var wh     = window.innerHeight;
      var stackH = stackEl.offsetHeight;   /* Box1H + peekH */
      var box1H  = stackH - peekH;         /* actual Box 1 height */

      if (rect.bottom <= 0 || rect.top >= wh) return;

      var triggerAt = wh * 0.3;
      var progress  = Math.min(1, Math.max(0, (triggerAt - rect.top) / scrollRange));

      var startY = box1H;
      var endY   = peekH;

      /* Phase 1 (progress 0..0.333): Box 2 slides UP over Box 1 */
      var p2  = Math.min(1, Math.max(0, progress * 3));
      var ty2 = startY + (endY - startY) * p2;

      /* Phase 2 (progress 0.333..0.666): Box 3 slides UP over Box 2 */
      var p3  = Math.min(1, Math.max(0, (progress - 0.333) * 3));
      var ty3 = startY + (endY - startY) * p3;

      /* Phase 3 (progress 0.666..1.0): Box 4 slides UP over Box 3 */
      var p4  = Math.min(1, Math.max(0, (progress - 0.666) * 3));
      var ty4 = startY + (endY - startY) * p4;

      box2.style.transition = 'none';
      box2.style.transform  = 'translateY(' + ty2 + 'px)';

      box3.style.transition = 'none';
      box3.style.transform  = 'translateY(' + ty3 + 'px)';

      box4.style.transition = 'none';
      box4.style.transform  = 'translateY(' + ty4 + 'px)';

      if (dot1) dot1.classList.toggle('fi-gr-dot-active', progress < 0.25);
      if (dot2) dot2.classList.toggle('fi-gr-dot-active', progress >= 0.25 && progress < 0.5);
      if (dot3) dot3.classList.toggle('fi-gr-dot-active', progress >= 0.5 && progress < 0.75);
      if (dot4) dot4.classList.toggle('fi-gr-dot-active', progress >= 0.75);
    }

    window.addEventListener('scroll', update, { passive: true });
    update(); /* run once on load */
  };

  /* ── CHARTS ─────────────────────────────────────────────── */
  window.fiInitCharts = function () {

    /* Tooltip: label only, no numbers on face (#4 from prev feedback) */
    var noNumTip = { callbacks: { label: function (c) { return '  ' + c.label; } } };

    /* Chart 0 — Market Size Bar + Line (richer purple matching original file) */
    (function () {
      var el = document.getElementById('fi-chartMarketSize');
      if (!el) return;
      // var labels = ['2020','2021','2022','2023','2024','2025E','2026F','2027F','2028F','2029F','2030F'];
      var d      = window.fiChartData ? window.fiChartData.marketSize : {};
var labels = d.labels  || [];
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
              /* Rich purple matching original: #6b21a8 historical, #9333ea forecast */
              backgroundColor: labels.map(function(l,i){
                return i<=5 ? 'rgba(107,33,168,0.82)' : 'rgba(147,51,234,0.55)';
              }),
              borderColor: '#4a0d8f', borderWidth: 1, yAxisID: 'y', order: 2
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
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 12 }, color: '#333333' } },
            tooltip: { callbacks: { label: function () { return '  Available in full report'; } } }
          },
          scales: {
            y:  { beginAtZero: true,
                  title: { display: true, text: 'Market Value', font: { size: 11 }, color: '#467082' },
                  grid: { color: 'rgba(107,33,168,0.07)' }, ticks: { display: false } },
            y1: { position: 'right',
                  title: { display: true, text: 'Growth Trend', font: { size: 11 }, color: '#467082' },
                  grid: { drawOnChartArea: false }, ticks: { display: false } }
          }
        }
      });
    })();

    /* Chart 1 — School Type Donut (rich purple as primary) */
    (function () {
      var el = document.getElementById('fi-chartSchoolType');
      var st = window.fiChartData ? window.fiChartData.businessType : {};
      var typeLabel=st.labels || [];
      var typeData= st.data || [];
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: typeLabel,
          datasets: [{ data: typeData,
            /* Rich purple primary, then brand family palette */
            backgroundColor: ['#6b21a8','#C86AA9','#F0AA31','#26AD8B','#C6BDDD'],
            borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();

    /* Chart 2 — Distribution Channel Donut (rich purple primary) */
    (function () {
      var el = document.getElementById('fi-chartChannel');
      var ch = window.fiChartData ? window.fiChartData.businessChannel : {};
      var chanelLabel=ch.labels || [];
      var chanelData= ch.data || [];
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: chanelLabel,
          datasets: [{ data: chanelData,
            backgroundColor: ['#6b21a8','#C86AA9','#F0AA31','#26AD8B','#2D7D3E'],
            borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();

    /* Chart 3 — Competitive Landscape Donut (matches screenshot style) */
    (function () {
      var el = document.getElementById('fi-chartCompetitive');
      var ch = window.fiChartData ? window.fiChartData.competitive : {};
      var chanelLabel=ch.labels || [];
      var chanelData= ch.data || [];
      if (!el) return;
      new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: chanelLabel,
          datasets: [{ data: chanelData,
            backgroundColor: ['#6b21a8','#C86AA9','#F0AA31','#26AD8B','#2D7D3E'],
            borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#333333', padding: 12 } }, tooltip: noNumTip }, cutout: '55%' }
      });
    })();


    // (function () {
    //   var el = document.getElementById('fi-chartCompetitive');
    //   var cp = window.fiChartData ? window.fiChartData.competitive : {};
    //   var compLabels = cp.labels || [];
    //   var compData   = cp.data   || [];
    //   if (!el) return;
    //   new Chart(el.getContext('2d'), {
    //     type: 'doughnut',
    //     data: {
    //       labels: compLabels,
    //       datasets: [{
    //         data: compData,
    //         backgroundColor: ['#6b21a8', '#C86AA9', '#F0AA31', '#26AD8B', '#2D7D3E'],
    //         borderWidth: 3,
    //         borderColor: '#ffffff'
    //       }]
    //     },
    //     options: {
    //       responsive: true,
    //       plugins: {
    //         legend: {
    //           position: 'right',
    //           labels: {
    //             font: { size: 12 },
    //             color: '#333333',
    //             padding: 16,
    //             usePointStyle: true,
    //             pointStyleWidth: 12
    //           }
    //         },
    //         tooltip: { callbacks: { label: function (c) { return '  ' + c.label; } } }
    //       },
    //       cutout: '52%'
    //     }
    //   });
    // })();

  }; /* end fiInitCharts */

  /* ── AUTO-INIT ──────────────────────────────────────────── */
  function fiInit() {
    window.fiInitCharts();
    window.fiInitOppHStack();
    window.fiInitChallengeAnim();
    window.fiInitGrowthAnim();
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