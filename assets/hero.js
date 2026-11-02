/* 首页专用：弧形卡片轮播 + 入场动画 */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var heroMode = SITE.heroMode || 'video';
  var MP4 = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/04fd3d5f-99d7-476e-98a4-46c08518ffb3.mp4';

  var stage = document.getElementById('stage');
  var row = document.getElementById('row');
  var hero = document.querySelector('.hero');
  if (!stage || !row) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = [];
  var videos = [];

/* 尺寸与缩放 ---------- */
  var scale = 1;
  function isPhone() { return window.innerWidth <= 820; }

  function fit() {
    var cw = document.documentElement.clientWidth;
    if (isPhone()) {
      scale = 1;
      stage.style.setProperty('--s', 1);
      row.style.width = cw + 'px';
      row.style.left = '0px';
      return;
    }
    var hh = hero.clientHeight || (window.innerHeight - 72);
    scale = Math.min(cw / 1440, hh / 950);
    stage.style.setProperty('--s', scale);
    var w = cw / scale;                 // 卡片行铺满屏幕左右
    row.style.width = w + 'px';
    row.style.left = ((1440 - w) / 2) + 'px';
  }

  /* ---------- 3. 卡片 ---------- */
  var CARD_COUNT = 10;

  function buildCards() {
    row.innerHTML = '';
    cards = [];
    videos = [];

    for (var i = 0; i < CARD_COUNT; i++) {
      var el = document.createElement('article');
      el.className = 'card';

      var media;
      if (heroMode === 'images') {
        var src = SITE.heroImages[i % SITE.heroImages.length];
        media = '<img class="shot" src="' + src + '" alt="" decoding="async">';
      } else {
        media =
          '<div class="grid" style="--c:' + (i % 5) + ';--r:' + Math.floor(i / 5) + '">' +
            '<div class="poster"></div>' +
            (reduce ? '' : '<video muted playsinline loop preload="auto" disablepictureinpicture></video>') +
          '</div>';
      }

      el.innerHTML =
        media +
        '<div class="play" aria-hidden="true">' +
          '<svg viewBox="0 0 10 12" width="9" height="11"><path d="M0.8 1.1 9 6 0.8 10.9Z" fill="#fff"/></svg>' +
        '</div>';

      row.appendChild(el);
      cards.push(el);
    }

    if (heroMode === 'video' && !reduce) {
      var vids = row.querySelectorAll('video');
      for (var j = 0; j < vids.length; j++) {
        (function (v) {
          v.addEventListener('loadeddata', function () { v.classList.add('is-ready'); }, { once: true });
          v.src = MP4;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
          videos.push(v);
        })(vids[j]);
      }
      setInterval(syncVideos, 1400);
    }
  }

  function syncVideos() {
    if (videos.length < 2) return;
    var ref = videos[0];
    if (!ref || ref.readyState < 2) return;
    for (var i = 1; i < videos.length; i++) {
      var v = videos[i];
      if (!v || v.readyState < 2) continue;
      if (Math.abs(v.currentTime - ref.currentTime) > 0.22) {
        try { v.currentTime = ref.currentTime; } catch (e) {}
      }
    }
  }

  /* ---------- 4. 曲线布局 ---------- */
  var cfg = null;
  var offset = 0;
  var velocity = 0;
  var dragging = false;
  var lastPointer = 0;
  var lastPointerAt = 0;
  var AUTO_SPEED = 50;
  var DECAY = 0.05;

  function buildCfg() {
    var cw = row.clientWidth;
    var ch = row.clientHeight;

    if (!isPhone()) {
      cfg = {
        center: cw / 2,
        norm: Math.max(360, cw / 2 - 14),
        pitch: 196,
        baseW: 170, growW: 48,
        baseH: 280, growH: 92,
        cy: 237, sag: 12, r: 15
      };
    } else {
      var u = cw / 640;
      cfg = {
        center: cw / 2, norm: 313 * u, pitch: 196 * u,
        baseW: 170 * u, growW: 48 * u,
        baseH: 280 * u, growH: 92 * u,
        cy: ch / 2, sag: 12 * u, r: 15 * u
      };
    }
  }

  function roundedQuad(w, h, hl, hr, r) {
    var pts = [
      [0, h / 2 - hl / 2],
      [w, h / 2 - hr / 2],
      [w, h / 2 + hr / 2],
      [0, h / 2 + hl / 2]
    ];
    var n = 4, entry = [], exit = [], i;
    for (i = 0; i < n; i++) {
      var c = pts[i], p = pts[(i - 1 + n) % n], q = pts[(i + 1) % n];
      var pp = [p[0] - c[0], p[1] - c[1]];
      var qq = [q[0] - c[0], q[1] - c[1]];
      var lp = Math.hypot(pp[0], pp[1]) || 1;
      var lq = Math.hypot(qq[0], qq[1]) || 1;
      var rr = Math.min(r, lp / 2, lq / 2);
      entry.push([c[0] + pp[0] / lp * rr, c[1] + pp[1] / lp * rr]);
      exit.push([c[0] + qq[0] / lq * rr, c[1] + qq[1] / lq * rr]);
    }
    var d = 'M' + entry[0][0].toFixed(2) + ' ' + entry[0][1].toFixed(2);
    for (i = 0; i < n; i++) {
      var nx = (i + 1) % n;
      var rr2 = Math.min(r, Math.hypot(pts[i][0] - entry[i][0], pts[i][1] - entry[i][1]));
      d += 'A' + rr2.toFixed(2) + ' ' + rr2.toFixed(2) + ' 0 0 1 ' + exit[i][0].toFixed(2) + ' ' + exit[i][1].toFixed(2);
      d += 'L' + entry[nx][0].toFixed(2) + ' ' + entry[nx][1].toFixed(2);
    }
    return d + 'Z';
  }

  function render() {
    if (!cfg) return;
    var total = cfg.pitch * CARD_COUNT;
    var half = total / 2;
    var cw = row.clientWidth;

    for (var i = 0; i < CARD_COUNT; i++) {
      var t = i * cfg.pitch + offset;
      t = ((t + half) % total + total) % total - half;

      var k = t / cfg.norm;
      var x = cfg.center + t * (1 + 0.083 * k * k);
      var d = Math.abs(x - cfg.center) / cfg.norm;

      var w = cfg.baseW + cfg.growW * d * d;
      var xl = x - w / 2;
      var xr = x + w / 2;

      var el = cards[i];
      if (xr < -60 || xl > cw + 60) { el.style.visibility = 'hidden'; continue; }
      el.style.visibility = 'visible';

      var ql = Math.abs(xl - cfg.center) / cfg.norm;
      var qr = Math.abs(xr - cfg.center) / cfg.norm;
      var hl = cfg.baseH + cfg.growH * Math.pow(ql, 2.6);
      var hr = cfg.baseH + cfg.growH * Math.pow(qr, 2.6);
      var h = Math.max(hl, hr);
      var top = (cfg.cy - cfg.sag * d * d) - h / 2;

      el.style.width = w.toFixed(2) + 'px';
      el.style.height = h.toFixed(2) + 'px';
      el.style.transform = 'translate3d(' + xl.toFixed(2) + 'px,' + top.toFixed(2) + 'px,0)';
      el.style.clipPath = 'path("' + roundedQuad(w, h, hl, hr, cfg.r) + '")';
    }
  }

  /* ---------- 5. 时间基准 ---------- */
  var clock = null;
  try {
    clock = document.documentElement.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1e9 });
  } catch (e) { clock = null; }

  function now() {
    if (clock && clock.currentTime != null) return clock.currentTime;
    return performance.now();
  }

  var last = now();

  function tick() {
    var t = now();
    var dt = (t - last) / 1000;
    last = t;
    if (!isFinite(dt) || dt <= 0) dt = 1 / 60;
    dt = Math.min(dt, 0.05);

    if (!dragging) {
      offset -= AUTO_SPEED * dt;
      offset += velocity * dt;
      velocity *= Math.pow(DECAY, dt);
      if (Math.abs(velocity) < 1) velocity = 0;
    }

    render();
    requestAnimationFrame(tick);
  }

  /* ---------- 6. 拖拽 ---------- */
  row.addEventListener('pointerdown', function (e) {
    dragging = true; velocity = 0;
    lastPointer = e.clientX; lastPointerAt = now();
    row.classList.add('is-dragging');
    if (row.setPointerCapture) row.setPointerCapture(e.pointerId);
  });

  row.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = (e.clientX - lastPointer) / (scale || 1);
    offset += dx;
    lastPointer = e.clientX;
    var t = now();
    var dt = Math.max((t - lastPointerAt) / 1000, 0.001);
    velocity = velocity * 0.7 + (dx / dt) * 0.3;
    lastPointerAt = t;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    row.classList.remove('is-dragging');
    if (row.releasePointerCapture && e && e.pointerId != null) {
      try { row.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    velocity = Math.max(-2400, Math.min(2400, velocity));
    if (now() - lastPointerAt > 120) velocity = 0;
  }

  row.addEventListener('pointerup', endDrag);
  row.addEventListener('pointercancel', endDrag);
  row.addEventListener('pointerleave', function (e) { if (dragging && e.buttons === 0) endDrag(e); });
  row.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---------- 7. 入场 ---------- */
  function drawIn(el, delay, duration) {
    if (!el) return;
    var paths = el.querySelectorAll('path');
    for (var i = 0; i < paths.length; i++) {
      (function (p) {
        var len = p.getTotalLength ? p.getTotalLength() : 200;
        p.style.strokeDasharray = len;
        p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: duration, delay: delay + i * 90, fill: 'both', easing: 'cubic-bezier(.45,0,.2,1)' });
      })(paths[i]);
    }
  }

  function entrance() {
    if (reduce) return;
    var E = 'cubic-bezier(.22,1,.36,1)';
    var POP = 'cubic-bezier(.34,1.5,.64,1)';
    function run(el, kf, opt) {
      if (!el) return;
      var o = { duration: 700, fill: 'both', easing: E };
      for (var key in opt) o[key] = opt[key];
      el.animate(kf, o);
    }
    var UP = [{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'translateY(0)' }];

    run(document.querySelector('.logo'), UP, { duration: 600, delay: 60 });
    var links = document.querySelectorAll('.nav a');
    for (var i = 0; i < links.length; i++) {
      run(links[i], UP, { duration: 560, delay: 130 + i * 55 });
    }
    run(document.querySelector('.header-right'), UP, { duration: 560, delay: 200 });

    run(document.querySelector('.badge'),
      [{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 680, delay: 260, easing: POP });

    var lines = document.querySelectorAll('.headline .lw');
    for (var j = 0; j < lines.length; j++) {
      run(lines[j],
        [{ opacity: 0, transform: 'translateY(34px)', filter: 'blur(14px)' },
         { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }],
        { duration: 950, delay: 340 + j * 115 });
    }

    run(document.querySelector('.subline'),
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 800, delay: 620 });

    run(row, [{ opacity: 0, transform: 'translateY(56px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 1000, delay: 660 });

    run(document.querySelector('.cta-ring'),
      [{ opacity: 0, transform: 'scale(.84)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 720, delay: 880, easing: POP });

    run(document.querySelector('.note--seen'), [{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 1000 });
    run(document.querySelector('.note--zero'), [{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 1120 });

    drawIn(document.getElementById('slash'), 520, 620);
    drawIn(document.getElementById('arrowSeen'), 780, 1000);
    drawIn(document.getElementById('arrowZero'), 1010, 620);
  }

   /* 启动 ---------- */
  fit();
  buildCards();
  buildCfg();
  render();
  entrance();
  requestAnimationFrame(tick);

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { fit(); buildCfg(); render(); }, 90);
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { fit(); buildCfg(); render(); }).observe(row);
  }
})();
