/* Patagonia Seaweeds SpA */
(function () {
  'use strict';

  /* English text lives in en/index.html, generated from the Spanish page */

  var MSG = {
    es: { sending: 'Enviando...', ok: 'Mensaje enviado. Le responderemos pronto.', err: 'No se pudo enviar. Escríbanos a jinfante@patagoniaseaweeds.com.', missing: 'Complete nombre, correo y mensaje.' },
    en: { sending: 'Sending...', ok: 'Message sent. We will reply soon.', err: 'The message could not be sent. Write to jinfante@patagoniaseaweeds.com.', missing: 'Please fill in name, email and message.' }
  };

  /* each language is its own static page ("/" and "/en/"), so search engines index both */
  var lang = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' && lang === 'es' && /^https?:/.test(location.protocol)) location.replace('/en/' + location.hash);
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () { if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash; });
  });

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });

  /* ---------- depth meter and dark nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[data-depth]'));
  var depthVal = document.getElementById('depthVal');
  function updateDepth() {
    var maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var d = 15 * Math.min(1, Math.max(0, window.scrollY / maxS));
    depthVal.textContent = Math.round(d);
    nav.classList.toggle('scrolled', window.scrollY > 40);
    var navY = window.scrollY + 30, dark = false;
    sections.forEach(function (s) { if (navY >= s.offsetTop && navY < s.offsetTop + s.offsetHeight) dark = /band-(mid|deep|fjord)/.test(s.className); });
    nav.classList.toggle('on-dark', dark);
  }

  /* ---------- the growing kelp lane (Macrocystis pyrifera) ---------- */
  var K = window.PSWKelp;
  var lane = document.getElementById('kelpLane');
  var stipes = [], blades = [], laneTop = 0, laneH = 0, holdfast = null, holdfasts = [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canopyDone = false, canopyBlades = [], canopyStipes = [], swayOn = false, CAN = 46, BEND = 170, bottomY = 0;
  function waterlineY() {
    var svg = document.querySelector('.sea svg');
    var rc = svg.getBoundingClientRect();
    var sc = Math.max(rc.width / 1440, rc.height / 380);
    return rc.top + window.scrollY;
  }

  /* lateral sway of a vertical stipe: free above, anchored at the holdfast */
  function swayV(y, t, ph, bot) {
    var anchor = Math.min(1, Math.max(0, ((bot || bottomY) - y) / 420));
    return anchor * (9 * Math.sin(t * 0.75 + y / 260 + ph) + 3 * Math.sin(t * 1.6 + y / 90 + ph * 2));
  }
  /* canopy bobbing with surface waves; the root follows the stipe */
  function swayC(x, x0, t, ph, bot) {
    var f = Math.min(1, Math.abs(x - x0) / 180);
    return [swayV(CAN + BEND, t, ph, bot) * (1 - f) + 4 * f * Math.sin(t * 0.6 + x / 300 + ph),
            f * (3.5 * Math.sin(t * 1.1 + x / 150 + ph) + 1.5 * Math.sin(t * 2.1 + x / 55))];
  }
  function dPath(pts, dxy) {
    var d = '';
    for (var i = 0; i < pts.length; i++) {
      var o = dxy(pts[i], i);
      d += (i ? 'L' : 'M') + (pts[i][0] + o[0]).toFixed(1) + ' ' + (pts[i][1] + o[1]).toFixed(1);
    }
    return d;
  }

  /* heterogeneous fronds on the side kelp: 1 in 4 is a third longer, another 1 in 4 is half again as wide */
  var laneR = null, sporoLayerArgs = null;
  function laneBlade(parent, x, y, ang, len, wid, seed, bend) {
    var v = (laneR || Math.random)();
    wid *= 1.25;
    if (v < 0.2) { len *= 1.8; wid *= 1.2; }
    else if (v < 0.4) len *= 1.35;
    else if (v < 0.6) wid *= 1.5;
    return K.addBlade(parent, x, y, ang, len, wid, seed, bend);
  }

  function buildLane() {
    if (!K) return;
    laneR = K.rnd(97531);
    var main = document.getElementById('main');
    var laneLeft = Math.max(0, (window.innerWidth - 1180) / 2 + 24);
    laneTop = waterlineY();
    laneH = main.offsetHeight - laneTop - 70;
    lane.setAttribute('viewBox', '0 0 120 ' + laneH);
    lane.style.top = laneTop + 'px';
    lane.style.left = laneLeft + 'px';
    lane.style.height = laneH + 'px';
    while (lane.firstChild) lane.removeChild(lane.firstChild);
    stipes = []; blades = []; canopyBlades = []; canopyStipes = [];
    bottomY = laneH - 34;
    holdfasts = [];
    var reach = window.innerWidth - laneLeft + 40;
    var clip = K.el('clipPath', { id: 'belowSurface' }, K.el('defs', {}, lane));
    K.el('rect', { x: -laneLeft - 40, y: 1, width: reach + laneLeft + 800, height: laneH + 400 }, clip);
    var baseLayer = K.el('g', {}, lane);
    var canopyLayer = K.el('g', { 'class': 'canopy', 'clip-path': 'url(#belowSurface)' }, null);
    var stipeLayer = K.el('g', {}, lane);
    var bladeLayer = K.el('g', { 'clip-path': 'url(#belowSurface)' }, null);

    /* two plants side by side: restoration (on rock) and farming (on a culture line) */
    var plants = [{ dx: 0, bot: bottomY, base: 'rock', seed: 1337, cyShift: 0, ph: 0 }];
    var nPlants = plants.length;

    plants.forEach(function (P, pi) {
      var r = K.rnd(P.seed);
      var defs = [
        { x0: 56, x1: 60, amp: 11, seed: 1.3, w: 3, cy: 6, run: 1.0, op: 1 },
        { x0: 63, x1: 62, amp: 10, seed: 4.4, w: 2.6, cy: 11, run: 0.9, op: .92 },
        { x0: 59, x1: 61, amp: 9, seed: 2.6, w: 2.2, cy: 16, run: 0.78, op: .84 },
        { x0: 66, x1: 60, amp: 12, seed: 5.9, w: 2, cy: 21, run: 0.66, op: .76 },
        { x0: 53, x1: 62, amp: 8, seed: 0.4, w: 1.8, cy: 26, run: 0.54, op: .68 }
      ];
      var bot = P.bot;
      defs.slice().reverse().forEach(function (sd, ri) {
        var si = defs.length - 1 - ri;
        var ph = sd.seed * 1.7 + P.ph;
        var vp = K.stipePoints(sd.x0 + P.dx, CAN + BEND, sd.x1 + P.dx, bot, sd.amp, sd.seed + P.ph, 16);
        var path = K.el('path', { d: K.pointsToPath(vp), 'class': 'stipe', 'stroke-width': sd.w }, stipeLayer);
        var len = path.getTotalLength();
        path.style.strokeDasharray = len + 40;
        stipes.push({ path: path, len: len + 40, pts: vp, ph: ph, bot: bot });
        var side = (si + pi) % 2 ? -1 : 1;
        for (var y = CAN + BEND + 12 + si * 17; y < bot - 110; y += 62 + r() * 26) {
          var idx = Math.min(vp.length - 1, Math.round((y - CAN - BEND) / (bot - CAN - BEND) * (vp.length - 1)));
          var p = vp[idx];
          var mv = K.el('g', {}, bladeLayer);
          var a2 = side > 0 ? -Math.PI * (0.34 + r() * 0.1) : -Math.PI * (0.66 - r() * 0.1);
          var len2 = side < 0 && pi === 0 && nPlants > 1 ? 80 + r() * 30 : 100 + r() * 42;
          var g2 = laneBlade(mv, p[0], p[1], a2, len2, 13 + r() * 5, Math.floor(r() * 1000), side * (0.08 + r() * 0.16));
          blades.push({ y: p[1], g: g2, mv: mv, ph: ph, bot: bot });
          side = -side;
        }
        var x0 = vp[0][0], end = 60 + (reach - 60) * sd.run;
        var cp = K.arcPoints(x0, CAN + BEND, 1, sd.cy + P.cyShift, BEND * (0.8 + si * 0.12), end - x0 - BEND * 1.4, si * 2 + P.ph);
        var sub = K.el('g', { opacity: sd.op }, canopyLayer);
        var cpath = K.el('path', { d: K.pointsToPath(cp), 'class': 'stipe canopy-stipe', 'stroke-width': sd.w }, sub);
        var cl = cpath.getTotalLength();
        var order = ri + pi * 5;
        cpath.style.strokeDasharray = cl + 40;
        cpath.style.strokeDashoffset = (canopyDone || reduce) ? 0 : cl + 40;
        cpath.getBoundingClientRect();
        cpath.style.transition = 'stroke-dashoffset 3.2s cubic-bezier(.3,.6,.2,1) ' + (0.2 + order * 0.12) + 's';
        cpath.style.strokeDashoffset = 0;
        canopyStipes.push({ path: cpath, pts: cp, x0: x0, ph: ph, bot: bot });
        var flip = si % 2 ? 1 : -1;
        /* blades along the curved part of the stipe: alternate sides, pointing toward the tip */
        for (var c = 1 + (si % 2); c < 15; c += 2) {
          var qa = cp[c], qb = cp[c + 1];
          var tg = Math.atan2(qb[1] - qa[1], qb[0] - qa[0]);
          var mva = K.el('g', {}, sub);
          var a3 = tg + flip * (0.55 + r() * 0.25);
          var ga = laneBlade(mva, qa[0], qa[1], a3, 80 + r() * 50, 12 + r() * 5, Math.floor(r() * 1000), flip * (0.1 + r() * 0.1));
          canopyBlades.push({ x: qa[0], x0: x0, y: qa[1], g: ga, mv: mva, ri: order, ph: ph, bot: bot });
          flip = -flip;
        }
        for (var c = 16 + (si % 3); c < cp.length - 2; c += 3 + Math.floor(r() * 2)) {
          var q = cp[c];
          var mvc = K.el('g', {}, sub);
          var ang = flip > 0 ? 0.26 + r() * 0.42 : 0.05 + r() * 0.14;
          var g = laneBlade(mvc, q[0], q[1], ang, 85 + r() * 70, 13 + r() * 5, Math.floor(r() * 1000), flip > 0 ? 0.12 + r() * 0.12 : -0.04 + r() * 0.08);
          canopyBlades.push({ x: q[0], x0: x0, y: q[1], g: g, mv: mvc, ri: order, ph: ph, bot: bot });
          flip = -flip;
        }
        var tip = cp[cp.length - 1];
        var mvt = K.el('g', {}, sub);
        K.addApical(mvt, tip[0], tip[1], 0.04, 62, 1).setAttribute('class', 'apical');
        canopyBlades.push({ x: tip[0], x0: x0, y: tip[1], mv: mvt, ri: order, ph: ph, bot: bot, apical: true });
      });
      var hx = 61 + P.dx;
      if (P.base === 'rock') {
        holdfasts.push({ g: K.addHoldfast(baseLayer, hx, laneH - 6, 92, 40, 11), y: laneH - 12 });
        sporoLayerArgs = [hx, laneH - 30];
      } else {
        holdfasts.push({ g: buildCultureLine(baseLayer, hx, bot, laneLeft, K.rnd(99)), y: bot - 6 });
      }
    });
    /* culture line at about 5 m (one third of the 15 m page), right of the text */
    var wrapRight = Math.min(window.innerWidth, (window.innerWidth + 1180) / 2) - 40 - laneLeft;
    if (window.innerWidth >= 1300) buildRopeFarm(baseLayer, stipeLayer, bladeLayer, canopyLayer, wrapRight + 30, reach + 30, Math.round(laneH / 3), laneH / 15, reach);

    lane.appendChild(bladeLayer);
    lane.appendChild(canopyLayer);
    /* sporophylls removed at user request */
    sporoLayerArgs = null;

    canopyBlades.forEach(function (b) {
      var node = b.apical ? b.mv.firstChild : b.g;
      if (canopyDone || reduce) { node.classList.add('on'); return; }
      setTimeout(function () { node.classList.add('on'); }, b.apical ? 3200 + b.ri * 120 : 350 + b.ri * 120 + (b.x / reach) * 2900);
    });
    canopyDone = true;
    growLane();
    if (!swayOn && !reduce) { swayOn = true; requestAnimationFrame(swayLoop); }
  }

  /* farmed kelp on a culture line: some plants already formed canopy (drifting left), others still 1 to 2 m below the surface */
  function buildRopeFarm(baseLayer, stipeLayer, bladeLayer, canopyLayer, rx0, rx1, ry, oneMeter, reach) {
    var r = K.rnd(4242);
    var g = K.el('g', { 'class': 'holdfast' }, baseLayer);
    K.el('path', { d: 'M' + rx0 + ' ' + ry + ' L' + rx1 + ' ' + ry, stroke: '#7F6A44', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    K.el('path', { d: 'M' + rx0 + ' ' + ry + ' L' + rx1 + ' ' + ry, stroke: '#B8A276', 'stroke-width': 7, 'stroke-dasharray': '2.5 4.5' }, g);
    /* dropper line to a surface buoy and anchor line to the seabed */
    K.el('path', { d: 'M' + rx0 + ' ' + ry + ' L' + (rx0 - 6) + ' 4', stroke: '#9FB6B5', 'stroke-width': 1.6, fill: 'none' }, g);
    K.el('ellipse', { cx: rx0 - 6, cy: 2, rx: 13, ry: 8, fill: '#C9561F' }, g);
    K.el('ellipse', { cx: rx0 - 9, cy: -1, rx: 5, ry: 2.4, fill: '#F3A06A' }, g);
    K.el('path', { d: 'M' + rx0 + ' ' + ry + ' Q ' + (rx0 - 60) + ' ' + (ry + 260) + ' ' + (rx0 - 90) + ' ' + (ry + 520), stroke: '#9FB6B5', 'stroke-width': 1.4, 'stroke-dasharray': '6 5', fill: 'none' }, g);
    holdfasts.push({ g: g, y: ry - 6 });
    var i = 0;
    for (var x = rx0 + 16; x < rx1 - 4; x += 20 + r() * 12, i++) {
      var ph = 2.1 + i * 0.9;
      /* small holdfast on the rope */
      var hd = '';
      for (var k = 0; k < 6; k++) { var ex = x + (r() - 0.5) * 16; hd += 'M' + x.toFixed(1) + ' ' + (ry - 8) + 'Q' + ((x + ex) / 2).toFixed(1) + ' ' + (ry - 3) + ' ' + ex.toFixed(1) + ' ' + (ry + (r() > 0.5 ? 4 : -3)) + ' '; }
      K.el('path', { d: hd, stroke: K.colors.hapt, 'stroke-width': 1.4, fill: 'none', 'stroke-linecap': 'round' }, g);
      var tall = i % 2 === 0 || r() < 0.25;
      var ns = tall ? 2 : 1;
      for (var s = 0; s < ns; s++) {
        var sx = x + (s - 0.5) * 3, ph2 = ph + s * 0.7, w = tall ? 2.2 - s * 0.3 : 1.6;
        if (tall) {
          var top = CAN + BEND * 0.75;
          var vp = K.stipePoints(sx, top, sx + (r() - 0.5) * 6, ry - 6, 6, ph2, 14);
          var path = K.el('path', { d: K.pointsToPath(vp), 'class': 'stipe', 'stroke-width': w }, stipeLayer);
          var len = path.getTotalLength(); path.style.strokeDasharray = len + 40;
          stipes.push({ path: path, len: len + 40, pts: vp, ph: ph2, bot: ry });
          verticalBlades(vp, ry, top, ph2, r, s);
          /* bend left into a floating canopy that overlaps the wild kelp canopy */
          var cy = 8 + r() * 26, R = BEND * (0.55 + r() * 0.3);
          var run = 220 + r() * 520;
          var cp = K.arcPoints(vp[0][0], top, -1, cy, R, run, ph2);
          var sub = K.el('g', { opacity: (0.72 + r() * 0.28).toFixed(2) }, canopyLayer);
          var cpath = K.el('path', { d: K.pointsToPath(cp), 'class': 'stipe canopy-stipe', 'stroke-width': w }, sub);
          var cl = cpath.getTotalLength();
          cpath.style.strokeDasharray = cl + 40;
          cpath.style.strokeDashoffset = (canopyDone || reduce) ? 0 : cl + 40;
          cpath.getBoundingClientRect();
          cpath.style.transition = 'stroke-dashoffset 3.4s cubic-bezier(.3,.6,.2,1) ' + (0.6 + i * 0.08) + 's';
          cpath.style.strokeDashoffset = 0;
          var x0 = vp[0][0];
          canopyStipes.push({ path: cpath, pts: cp, x0: x0, ph: ph2, bot: ry });
          var flip = s ? 1 : -1;
          for (var c = 1; c < cp.length - 2; c += (c < 15 ? 2 : 3 + Math.floor(r() * 2))) {
            var qa = cp[c], qb = cp[c + 1];
            var tg = Math.atan2(qb[1] - qa[1], qb[0] - qa[0]);
            var mva = K.el('g', {}, sub);
            var a3 = c < 15 ? tg + flip * (0.55 + r() * 0.25) : (flip > 0 ? Math.PI - 0.26 - r() * 0.42 : Math.PI - 0.05 - r() * 0.14);
            var ga = laneBlade(mva, qa[0], qa[1], a3, 75 + r() * 60, 12 + r() * 5, Math.floor(r() * 1000), -flip * (0.08 + r() * 0.1));
            canopyBlades.push({ x: reach - qa[0], x0: x0, y: qa[1], g: ga, mv: mva, ri: 6 + i, ph: ph2, bot: ry });
            flip = -flip;
          }
          var tip = cp[cp.length - 1];
          var mvt = K.el('g', {}, sub);
          K.addApical(mvt, tip[0], tip[1], Math.PI - 0.04, 54, -1).setAttribute('class', 'apical');
          canopyBlades.push({ x: reach - tip[0], x0: x0, y: tip[1], mv: mvt, ri: 6 + i, ph: ph2, bot: ry, apical: true });
        } else {
          /* still growing: tip 1 to 2 m below the surface */
          var topG = oneMeter * (1 + r() * 1.2);
          var vg = K.stipePoints(sx, topG, sx + (r() - 0.5) * 8, ry - 6, 5, ph2, 14);
          var pg = K.el('path', { d: K.pointsToPath(vg), 'class': 'stipe', 'stroke-width': w }, stipeLayer);
          var lg = pg.getTotalLength(); pg.style.strokeDasharray = lg + 40;
          stipes.push({ path: pg, len: lg + 40, pts: vg, ph: ph2, bot: ry });
          verticalBlades(vg, ry, topG, ph2, r, s + i);
          var mvg = K.el('g', {}, bladeLayer);
          var ap = K.addApical(mvg, vg[0][0], vg[0][1], -Math.PI / 2 + (r() - 0.5) * 0.3, 30 + r() * 10, r() < 0.5 ? 1 : -1);
          ap.setAttribute('class', 'apical');
          blades.push({ y: vg[0][1], g: ap, mv: mvg, ph: ph2, bot: ry });
        }
      }
    }
    function verticalBlades(vp, bot, top, ph, r, s0) {
      var side = s0 % 2 ? -1 : 1;
      for (var y = top + 14; y < bot - 30; y += 48 + r() * 22) {
        var idx = Math.min(vp.length - 1, Math.round((y - top) / (bot - top) * (vp.length - 1)));
        var p = vp[idx];
        var mv = K.el('g', {}, bladeLayer);
        var a2 = side > 0 ? -Math.PI * (0.34 + r() * 0.1) : -Math.PI * (0.66 - r() * 0.1);
        var g2 = laneBlade(mv, p[0], p[1], a2, 60 + r() * 40, 10 + r() * 4, Math.floor(r() * 1000), side * (0.08 + r() * 0.16));
        blades.push({ y: p[1], g: g2, mv: mv, ph: ph, bot: bot });
        side = -side;
      }
    }
  }

  /* culture line: twisted rope with the holdfast gripping it, seedlings along it, and the anchor line */
  function buildCultureLine(parent, hx, ry, laneLeft, r) {
    var g = K.el('g', { 'class': 'holdfast' }, parent);
    var x0 = -laneLeft - 30, x1 = hx + 34;
    /* rope */
    K.el('path', { d: 'M' + x0 + ' ' + ry + ' L' + x1 + ' ' + ry, stroke: '#7F6A44', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    K.el('path', { d: 'M' + x0 + ' ' + ry + ' L' + x1 + ' ' + ry, stroke: '#B8A276', 'stroke-width': 7, 'stroke-dasharray': '2.5 4.5' }, g);
    K.el('path', { d: 'M' + x0 + ' ' + (ry + 2.5) + ' L' + x1 + ' ' + (ry + 2.5), stroke: 'rgba(40,30,10,.35)', 'stroke-width': 2 }, g);
    K.el('circle', { cx: x1 + 2, cy: ry, r: 5.5, fill: '#7F6A44' }, g);
    K.el('path', { d: 'M' + (x1 + 5) + ' ' + (ry + 2) + ' q 6 4 4 12', stroke: '#7F6A44', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    /* holdfast gripping the rope */
    var d = '';
    for (var i = 0; i < 22; i++) {
      var sx = hx + (r() - 0.5) * 6, sy = ry - 26 - r() * 10;
      var ex = hx + (r() - 0.5) * 50, below = r() > 0.45;
      var ey = below ? ry + 5 + r() * 3 : ry - 3;
      var mx = (sx + ex) / 2 + (r() - 0.5) * 12;
      d += 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + (ry - 8).toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ' ';
    }
    K.el('path', { d: d, stroke: K.colors.hapt, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
    /* the line is full: young plants of mixed sizes, each gripping the rope */
    var crowd = K.el('g', { opacity: .72 }, g);
    var front = K.el('g', {}, g);
    for (var x = hx - 26; x > x0 + 6; x -= 7 + r() * 8) {
      var big = r() < 0.5, h = big ? 70 + r() * 170 : 14 + r() * 40;
      ropePlant(big && r() < 0.5 ? crowd : front, x, ry, h, r, big);
    }
    return g;
  }

  function ropePlant(parent, x, ry, h, r, big) {
    var pg = K.el('g', { 'class': 'blade-sway' }, parent);
    pg.style.transformOrigin = x.toFixed(1) + 'px ' + ry + 'px';
    pg.style.animationDuration = (5 + r() * 4).toFixed(1) + 's';
    pg.style.animationDelay = (-r() * 8).toFixed(1) + 's';
    var lean = (r() - 0.5) * h * 0.35;
    if (!big) {
      var b0 = K.addBlade(pg, x, ry - 3, -Math.PI / 2 + lean / h, h, 4 + h * 0.12, Math.floor(r() * 999), (r() - 0.5) * 0.3);
      b0.classList.add('on'); b0.firstChild.style.animation = 'none';
      return;
    }
    var ns = 1 + Math.floor(r() * 3);
    for (var k = 0; k < ns; k++) {
      var hk = h * (1 - k * 0.18), lk = lean + (k - 1) * 6;
      var pts = K.stipePoints(x + (k - 1) * 1.5, ry - 4, x + lk, ry - hk, 3, r() * 6, 8);
      K.el('path', { d: K.pointsToPath(pts), stroke: K.colors.stipe, 'stroke-width': 1.4, fill: 'none' }, pg);
      var side = r() < 0.5 ? 1 : -1;
      for (var j = 3; j < pts.length - 2; j += 2 + Math.floor(r() * 2)) {
        var p = pts[j], f = 1 - (ry - p[1]) / hk;
        var ang = side > 0 ? -Math.PI * (0.36 + r() * 0.08) : -Math.PI * (0.64 - r() * 0.08);
        var bl = K.addBlade(pg, p[0], p[1], ang, 26 + 46 * f + r() * 14, 6 + 6 * f, Math.floor(r() * 999), side * 0.12);
        bl.classList.add('on'); bl.firstChild.style.animation = 'none';
        side = -side;
      }
      var tp = pts[pts.length - 1];
      K.addApical(pg, tp[0], tp[1], -Math.PI / 2 + (r() - 0.5) * 0.4, 12 + h * 0.05, r() < 0.5 ? 1 : -1);
    }
    var d = '';
    for (var i = 0; i < 6; i++) {
      var ex = x + (r() - 0.5) * 16;
      d += 'M' + x.toFixed(1) + ' ' + (ry - 9) + 'Q' + ((x + ex) / 2).toFixed(1) + ' ' + (ry - 4) + ' ' + ex.toFixed(1) + ' ' + (ry + (r() > 0.5 ? 4 : -3)) + ' ';
    }
    K.el('path', { d: d, stroke: K.colors.hapt, 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }, parent);
  }

  function growLane() {
    if (!stipes.length) return;
    var reached = laneH; /* the kelp is always shown complete */
    reached = Math.max(0, Math.min(laneH, reached));
    stipes.forEach(function (st) { st.path.style.strokeDashoffset = st.len * (1 - Math.min(1, reached / st.bot)); });
    blades.forEach(function (b) { b.g.classList.toggle('on', b.y < reached - 10); });
    holdfasts.forEach(function (h) { h.g.classList.toggle('on', reached >= h.y); });
  }

  /* water movement for the long kelp: only what is on screen is updated */
  var lastSway = 0;
  function swayLoop(now) {
    requestAnimationFrame(swayLoop);
    if (now - lastSway < 33 || document.hidden) return;
    lastSway = now;
    var t = now / 1000;
    var top = window.scrollY - laneTop - 250, bot = top + window.innerHeight + 500;
    if (top < 200) {
      canopyStipes.forEach(function (cs) {
        cs.path.setAttribute('d', dPath(cs.pts, function (p) { return swayC(p[0], cs.x0, t, cs.ph, cs.bot); }));
      });
      canopyBlades.forEach(function (b) {
        var o = swayC(b.x, b.x0, t, b.ph, b.bot);
        b.mv.setAttribute('transform', 'translate(' + o[0].toFixed(1) + ' ' + o[1].toFixed(1) + ')');
      });
    }
    stipes.forEach(function (st) {
      st.path.setAttribute('d', dPath(st.pts, function (p) { return [swayV(p[1], t, st.ph, st.bot), 0]; }));
    });
    blades.forEach(function (b) {
      if (b.y < top || b.y > bot) return;
      b.mv.setAttribute('transform', 'translate(' + swayV(b.y, t, b.ph, b.bot).toFixed(1) + ' 0)');
    });
  }

  /* ---------- surface canopy in the hero ---------- */
  function buildCanopy() {
    var host = document.getElementById('canopy');
    if (!K || !host) return;
    var r = K.rnd(2024);
    var plants = [
      { x: 150, dir: 1, o: .55 }, { x: 470, dir: -1, o: .85 }, { x: 700, dir: 1, o: .6 },
      { x: 1000, dir: -1, o: .85 }, { x: 1180, dir: 1, o: .6 }, { x: 1420, dir: -1, o: .8 }
    ];
    plants.forEach(function (pl, i) {
      var g = K.el('g', { 'class': 'sway' + (i % 3 === 1 ? ' b' : i % 3 === 2 ? ' c' : ''), opacity: pl.o }, host);
      var n = 3 + (i % 2);
      for (var k = 0; k < n; k++) {
        var x0 = pl.x + (k - n / 2) * 7, yc = 34 + k * 11 + r() * 8, R = 70 + r() * 50;
        var rise = K.stipePoints(x0, 440, x0 + pl.dir * (4 + k * 3), yc + R, 5, i + k * 1.3, 12);
        var arc = K.arcPoints(rise[rise.length - 1][0], yc + R, pl.dir, yc, R, 120 + r() * 160, i + k);
        K.el('path', { d: K.pointsToPath(rise.concat(arc.slice(1))), fill: 'none', stroke: K.colors.stipe, 'stroke-width': 2.4 - k * 0.3 }, g);
        var side = k % 2 ? -1 : 1;
        for (var j = 4 + k * 2; j < rise.length - 3; j += 4 + Math.floor(r() * 2)) {
          var p = rise[j];
          var ang = side > 0 ? -Math.PI * (0.33 + r() * 0.1) : -Math.PI * (0.67 - r() * 0.1);
          laneBlade(g, p[0], p[1], ang, 95 + r() * 40, 12 + r() * 4, Math.floor(r() * 999), side * (0.08 + r() * 0.14)).classList.add('on');
          side = -side;
        }
        for (var c = 6 + k; c < arc.length - 2; c += 3 + Math.floor(r() * 2)) {
          var q = arc[c], down = r() > 0.4;
          var a = pl.dir > 0 ? (down ? 0.25 + r() * 0.4 : 0.04 + r() * 0.12) : Math.PI - (down ? 0.25 + r() * 0.4 : 0.04 + r() * 0.12);
          laneBlade(g, q[0], q[1], a, 80 + r() * 50, 12 + r() * 4, Math.floor(r() * 999), (pl.dir > 0 ? 1 : -1) * (down ? 0.12 : 0)).classList.add('on');
        }
        var tip = arc[arc.length - 1];
        K.addApical(g, tip[0], tip[1], pl.dir > 0 ? 0.04 : Math.PI - 0.04, 54 + r() * 14, pl.dir > 0 ? 1 : -1);
      }
    });
  }
  buildCanopy();

  /* ---------- IMTA block diagram: square salmon pen and a submerged kelp grid ---------- */
  (function () {
    var host = document.getElementById('imtaBuild');
    if (!K || !host) return;
    /* oblique projection: the front face is drawn true to scale, depth recedes up and to the right */
    var S = 4.75, OX = 12, OY = 215, DK = 0.87, DS = 0.5;
    function P(x, y, z) { var d = 60 - y; return [OX + (x + d * DK) * S, OY - (d * DS + z) * S]; }
    function pt(a) { return a[0].toFixed(1) + ' ' + a[1].toFixed(1); }
    function poly(pts, attrs, parent) { attrs.d = 'M' + pts.map(function (q) { return pt(P(q[0], q[1], q[2])); }).join('L') + 'Z'; return K.el('path', attrs, parent || host); }
    function line(a, b, attrs, parent) { attrs.d = 'M' + pt(P(a[0], a[1], a[2])) + 'L' + pt(P(b[0], b[1], b[2])); attrs.fill = 'none'; return K.el('path', attrs, parent || host); }
    var X = 150, Y = 60, Z = -34;
    var r = K.rnd(7);

    /* back walls and seabed */
    poly([[0, 0, 0], [X, 0, 0], [X, 0, Z], [0, 0, Z]], { fill: 'url(#wBack)' });
    poly([[0, 0, 0], [0, Y, 0], [0, Y, Z], [0, 0, Z]], { fill: 'url(#wBack)' });
    poly([[0, 0, Z], [X, 0, Z], [X, Y, Z], [0, Y, Z]], { fill: '#2A3F3C' });
    for (var i = 0; i < 70; i++) { var sx = r() * X, sy = r() * Y; var q = P(sx, sy, Z); K.el('ellipse', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), rx: 2 + r() * 4, ry: 1 + r() * 1.5, fill: r() < 0.5 ? '#3A5048' : '#24352F' }, host); }

    /* kelp grid: ropes at depth, anchor lines to the seabed */
    var gx0 = 88, gx1 = 147, gz = -15, ys = [27, 31.8, 36.6, 41.4, 46.2, 51, 55.8], xs = [88, 102.75, 117.5, 132.25, 147];
    var grid = K.el('g', {}, host);
    [[gx0, ys[0]], [gx1, ys[0]], [gx0, ys[6]], [gx1, ys[6]]].forEach(function (c) {
      var ax = c[0] + (c[0] < 110 ? -8 : 4), ay = c[1] + (c[1] < 40 ? -6 : 3);
      line([c[0], c[1], gz], [ax, ay, Z], { stroke: '#8C9A92', 'stroke-width': 1, 'stroke-opacity': .7 }, grid);
    });
    xs.forEach(function (x) { line([x, ys[0], gz], [x, ys[6], gz], { stroke: '#B8A276', 'stroke-width': 1.6 }, grid); });
    ys.forEach(function (y) { line([gx0, y, gz], [gx1, y, gz], { stroke: '#B8A276', 'stroke-width': 1.8 }, grid); });

    /* salmon pen: back half of the net, fish, front half */
    var px0 = 3, px1 = 28, py0 = 3, py1 = 28, pz = -17;
    var net = K.el('g', {}, host);
    function mesh(face, parent, op) {
      for (var t = 0; t <= 1.0001; t += 1 / 13) {
        var a, b;
        if (face === 'back') { a = [px0 + (px1 - px0) * t, py0, 0]; b = [px0 + (px1 - px0) * t, py0, pz]; }
        if (face === 'left') { a = [px0, py0 + (py1 - py0) * t, 0]; b = [px0, py0 + (py1 - py0) * t, pz]; }
        if (face === 'front') { a = [px0 + (px1 - px0) * t, py1, 0]; b = [px0 + (px1 - px0) * t, py1, pz]; }
        if (face === 'right') { a = [px1, py0 + (py1 - py0) * t, 0]; b = [px1, py0 + (py1 - py0) * t, pz]; }
        if (face === 'bottom') { a = [px0 + (px1 - px0) * t, py0, pz]; b = [px0 + (px1 - px0) * t, py1, pz]; }
        line(a, b, { stroke: '#D7E2E1', 'stroke-width': .6, 'stroke-opacity': op }, parent);
        if (face === 'bottom') line([px0, py0 + (py1 - py0) * t, pz], [px1, py0 + (py1 - py0) * t, pz], { stroke: '#D7E2E1', 'stroke-width': .6, 'stroke-opacity': op }, parent);
      }
      for (var zz = 0; zz >= pz; zz -= 2.4) {
        if (face === 'back') line([px0, py0, zz], [px1, py0, zz], { stroke: '#D7E2E1', 'stroke-width': .5, 'stroke-opacity': op }, parent);
        if (face === 'left') line([px0, py0, zz], [px0, py1, zz], { stroke: '#D7E2E1', 'stroke-width': .5, 'stroke-opacity': op }, parent);
        if (face === 'front') line([px0, py1, zz], [px1, py1, zz], { stroke: '#D7E2E1', 'stroke-width': .5, 'stroke-opacity': op }, parent);
        if (face === 'right') line([px1, py0, zz], [px1, py1, zz], { stroke: '#D7E2E1', 'stroke-width': .5, 'stroke-opacity': op }, parent);
      }
    }
    poly([[px0, py0, 0], [px1, py0, 0], [px1, py0, pz], [px0, py0, pz]], { fill: 'rgba(14,42,51,.35)' }, net);
    poly([[px0, py0, 0], [px0, py1, 0], [px0, py1, pz], [px0, py0, pz]], { fill: 'rgba(14,42,51,.3)' }, net);
    mesh('back', net, .35); mesh('left', net, .35); mesh('bottom', net, .3);
    var fish = K.el('g', { 'class': 'school' }, net);
    for (i = 0; i < 26; i++) {
      var f = P(px0 + 2 + r() * (px1 - px0 - 4), py0 + 2 + r() * (py1 - py0 - 4), -2 - r() * 13);
      var L = 9 + r() * 5, dir = r() < 0.6 ? 1 : -1, sh = 0.55 + r() * 0.2;
      K.el('path', { d: 'M' + (f[0] - L * dir).toFixed(1) + ' ' + f[1].toFixed(1) + ' q ' + (L * dir) + ' ' + (-L * 0.35) + ' ' + (2 * L * dir) + ' 0 q ' + (-L * dir) + ' ' + (L * 0.35) + ' ' + (-2 * L * dir) + ' 0z M' + (f[0] - L * dir).toFixed(1) + ' ' + f[1].toFixed(1) + ' l ' + (-4 * dir) + ' -3 v 6z',
        fill: 'rgba(205,217,220,' + sh.toFixed(2) + ')' }, fish);
    }
    poly([[px0, py1, 0], [px1, py1, 0], [px1, py1, pz], [px0, py1, pz]], { fill: 'rgba(170,200,205,.08)' }, net);
    poly([[px1, py0, 0], [px1, py1, 0], [px1, py1, pz], [px1, py0, pz]], { fill: 'rgba(170,200,205,.06)' }, net);
    mesh('front', net, .55); mesh('right', net, .5);

    /* nutrient plume drifting from the pen to the kelp */
    var plume = K.el('g', { 'class': 'plume' }, host);
    var dv = P(58, 24, 0), d0 = P(0, 0, 0), dx = (dv[0] - d0[0]).toFixed(1), dy = (dv[1] - d0[1]).toFixed(1);
    for (i = 0; i < 90; i++) {
      var c = P(px1 + r() * 34, py0 + 6 + r() * (py1 - py0 + 4), -2 - r() * 14);
      var kind = r(), col = kind < 0.5 ? '#D9DC1C' : kind < 0.75 ? '#B0306F' : '#F6FAF9';
      var dot = K.el('circle', { cx: c[0].toFixed(1), cy: c[1].toFixed(1), r: (kind < 0.5 ? 3.2 : 2.6), fill: col }, plume);
      dot.style.setProperty('--dx', dx + 'px'); dot.style.setProperty('--dy', dy + 'px');
      dot.style.animationDuration = (7 + r() * 5).toFixed(1) + 's';
      dot.style.animationDelay = (-r() * 12).toFixed(1) + 's';
    }

    /* Macrocystis growing up from the grid toward the surface */
    var plants = [];
    ys.forEach(function (y) { for (var x = gx0 + 3; x < gx1 - 1; x += 5 + r() * 2) plants.push([x, y + (r() - 0.5) * 0.6]); });
    plants.sort(function (a, b) { return (a[1] - b[1]) || (b[0] - a[0]); });
    var kelp = K.el('g', {}, host);
    plants.forEach(function (pl) {
      var g = K.el('g', { 'class': 'blade-sway' }, kelp);
      var base = P(pl[0], pl[1], gz);
      g.style.transformOrigin = base[0].toFixed(1) + 'px ' + base[1].toFixed(1) + 'px';
      g.style.animationDuration = (5 + r() * 4).toFixed(1) + 's';
      g.style.animationDelay = (-r() * 8).toFixed(1) + 's';
      var ns = 2 + Math.floor(r() * 2);
      for (var k = 0; k < ns; k++) {
        var top = P(pl[0] + 2 + r() * 3, pl[1] + (r() - 0.5) * 2, -1 - r() * 2.5);
        var b0 = [base[0] + (k - 0.5) * 1.5, base[1]];
        var pts = [];
        for (var t = 0; t <= 1.0001; t += 0.07) pts.push([b0[0] + (top[0] - b0[0]) * t + Math.sin(t * 3 + pl[0]) * 2, b0[1] + (top[1] - b0[1]) * t]);
        K.el('path', { d: K.pointsToPath(pts), stroke: K.colors.stipe, 'stroke-width': 1.1, fill: 'none' }, g);
        var side = r() < 0.5 ? 1 : -1;
        for (var j = 2; j < pts.length - 1; j += 2 + Math.floor(r() * 2)) {
          var q2 = pts[j], ang = side > 0 ? -Math.PI * (0.3 + r() * 0.08) : -Math.PI * (0.62 - r() * 0.08);
          var bl = K.addBlade(g, q2[0], q2[1], ang, 18 + r() * 14, 4.2 + r() * 2, Math.floor(r() * 999), side * 0.15);
          bl.classList.add('on'); bl.firstChild.style.animation = 'none';
          side = -side;
        }
        var tp = pts[pts.length - 1];
        for (var c2 = 0; c2 < 3; c2++) {
          var fl = K.addBlade(g, tp[0], tp[1], -0.1 + c2 * 0.18, 14 + r() * 10, 3.5, Math.floor(r() * 999), 0.15);
          fl.classList.add('on'); fl.firstChild.style.animation = 'none';
        }
      }
    });

    /* buoys and droppers over the grid nodes */
    var buoys = K.el('g', {}, null);
    xs.forEach(function (x) { ys.forEach(function (y, yi) {
      if (yi % 2) return;
      line([x, y, gz], [x, y, 0], { stroke: '#9FB6B5', 'stroke-width': .8, 'stroke-opacity': .8 }, host);
      var b = P(x, y, 0.3);
      K.el('ellipse', { cx: b[0].toFixed(1), cy: (b[1] + 1).toFixed(1), rx: 5.5, ry: 3.6, fill: '#C9561F' }, buoys);
      K.el('ellipse', { cx: (b[0] - 1).toFixed(1), cy: (b[1] - 0.2).toFixed(1), rx: 2.6, ry: 1.3, fill: '#F3A06A' }, buoys);
    }); });

    /* water volume (front walls) and surface */
    poly([[0, Y, 0], [X, Y, 0], [X, Y, Z], [0, Y, Z]], { fill: 'url(#wFront)' });
    poly([[X, 0, 0], [X, Y, 0], [X, Y, Z], [X, 0, Z]], { fill: 'url(#wSide)' });
    poly([[0, 0, 0], [X, 0, 0], [X, Y, 0], [0, Y, 0]], { fill: '#A9C8C9', 'fill-opacity': .28 });
    for (i = 0; i < 14; i++) { var wy = 3 + i * 4.2; line([2 + (i % 3) * 6, wy, 0], [X - 4 - (i % 4) * 7, wy, 0], { stroke: '#EEF4F3', 'stroke-width': .7, 'stroke-opacity': .35, 'stroke-dasharray': '18 26' }); }
    line([0, Y, 0], [X, Y, 0], { stroke: '#EEF4F3', 'stroke-width': 1.6 });
    line([X, 0, 0], [X, Y, 0], { stroke: '#EEF4F3', 'stroke-width': 1.6 });
    line([0, Y, Z], [X, Y, Z], { stroke: '#0E2A33', 'stroke-width': 1.2 });
    line([X, Y, 0], [X, Y, Z], { stroke: '#0E2A33', 'stroke-width': 1 });
    host.appendChild(buoys);

    /* pen collar: square walkway with handrail */
    var collar = K.el('g', {}, host);
    var w = 1.6, zc = 0.6;
    var outer = [[px0 - w, py0 - w, zc], [px1 + w, py0 - w, zc], [px1 + w, py1 + w, zc], [px0 - w, py1 + w, zc]];
    var inner = [[px0 + w, py0 + w, zc], [px1 - w, py0 + w, zc], [px1 - w, py1 - w, zc], [px0 + w, py1 - w, zc]];
    poly([[px0 - w, py1 + w, zc], [px1 + w, py1 + w, zc], [px1 + w, py1 + w, -0.8], [px0 - w, py1 + w, -0.8]], { fill: '#26343A' }, collar);
    poly([[px1 + w, py0 - w, zc], [px1 + w, py1 + w, zc], [px1 + w, py1 + w, -0.8], [px1 + w, py0 - w, -0.8]], { fill: '#1C2A2F' }, collar);
    var dd = 'M' + outer.map(function (q) { return pt(P(q[0], q[1], q[2])); }).join('L') + 'Z M' + inner.slice().reverse().map(function (q) { return pt(P(q[0], q[1], q[2])); }).join('L') + 'Z';
    K.el('path', { d: dd, fill: '#5F6F73', 'fill-rule': 'evenodd' }, collar);
    var rail = [[px0 - w, py0 - w], [px1 + w, py0 - w], [px1 + w, py1 + w], [px0 - w, py1 + w], [px0 - w, py0 - w]];
    for (i = 0; i < 4; i++) {
      var A = rail[i], B = rail[i + 1];
      line([A[0], A[1], zc + 2.2], [B[0], B[1], zc + 2.2], { stroke: '#E9EEEE', 'stroke-width': 1.2 }, collar);
      for (var tt = 0; tt <= 1.0001; tt += 1 / 8) {
        var xx = A[0] + (B[0] - A[0]) * tt, yy = A[1] + (B[1] - A[1]) * tt;
        line([xx, yy, zc], [xx, yy, zc + 2.2], { stroke: '#E9EEEE', 'stroke-width': .9 }, collar);
      }
    }
    var tower = P((px0 + px1) / 2, (py0 + py1) / 2, 0);
    K.el('path', { d: 'M' + (tower[0] - 26) + ' ' + (tower[1] + 2) + ' L ' + tower[0].toFixed(1) + ' ' + (tower[1] - 30).toFixed(1) + ' L ' + (tower[0] + 26) + ' ' + (tower[1] + 2), stroke: '#E9EEEE', 'stroke-width': 1, fill: 'none', 'stroke-opacity': .6 }, collar);

    /* labels */
    function place(id, x, y, z, dy) { var e = document.getElementById(id); if (!e) return; var q = P(x, y, z); e.setAttribute('x', q[0].toFixed(0)); e.setAttribute('y', (q[1] + (dy || 0)).toFixed(0)); }
    place('lbPen', (px0 + px1) / 2, 0, 0, -16);
    place('lbFarm', (gx0 + gx1) / 2 - 8, 0, 0, -16);
    place('lbFlow', 62, Y, Z, -58);
    place('lbFlow2', 62, Y, Z, -30);
  })();

  /* ---------- realistic giant kelp in the biostimulant flow ---------- */
  (function () {
    var host = document.getElementById('flowKelp');
    if (!K || !host) return;
    var r = K.rnd(55);
    var pts = K.stipePoints(-4, 80, 6, -58, 4, 1.1, 6);
    K.el('path', { d: K.pointsToPath(pts), stroke: K.colors.stipe, 'stroke-width': 2.6, fill: 'none' }, host);
    var side = 1;
    for (var j = 3; j < pts.length - 3; j += 3) {
      var p = pts[j];
      var g = K.addBlade(host, p[0], p[1], side > 0 ? -Math.PI * 0.3 : -Math.PI * 0.7, 46 + r() * 14, 10 + r() * 3, Math.floor(r() * 999), side * 0.16);
      g.classList.add('on'); g.firstChild.style.animation = 'none';
      side = -side;
    }
    var tp = pts[pts.length - 1];
    K.addApical(host, tp[0], tp[1], -Math.PI / 2 + 0.25, 22, 1);
  })();

  /* ---------- fertile plant in the life cycle figure ---------- */
  (function () {
    var host = document.getElementById('sporo');
    if (!K || !host) return;
    var r = K.rnd(77);
    var pts = K.stipePoints(320, 420, 330, -20, 10, 0.8, 8);
    K.el('path', { d: K.pointsToPath(pts), fill: 'none', stroke: K.colors.stipe, 'stroke-width': 4 }, host);
    var side = 1;
    for (var y = 380; y > 0; y -= 46 + r() * 10) {
      var p = pts[Math.round((420 - y) / 440 * (pts.length - 1))];
      var fertile = y > 250;
      var ang = side > 0 ? -Math.PI * (0.3 + r() * 0.08) : -Math.PI * (0.7 - r() * 0.08);
      var g = K.addBlade(host, p[0], p[1], ang, fertile ? 120 : 150, fertile ? 22 : 18, Math.floor(r() * 999), side * 0.12);
      g.classList.add('on');
      if (fertile) {
        var dx = Math.cos(ang), dy = Math.sin(ang);
        for (var k = 0; k < 3; k++) {
          var t = 0.3 + k * 0.17, cx = p[0] + dx * (24 + 110 * t), cy = p[1] + dy * (24 + 110 * t);
          K.el('ellipse', { cx: cx.toFixed(1), cy: cy.toFixed(1), rx: 9 + r() * 5, ry: 4, fill: '#3B230C', 'fill-opacity': '.62', transform: 'rotate(' + (ang * 180 / Math.PI).toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')' }, g.firstChild);
        }
      }
      side = -side;
    }
  })();

  var ticking = false, swimT, depthBox = document.getElementById('depth');
  window.addEventListener('scroll', function () {
    depthBox.classList.add('swim');
    clearTimeout(swimT);
    swimT = setTimeout(function () { depthBox.classList.remove('swim'); }, 260);
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { updateDepth(); growLane(); ticking = false; });
  }, { passive: true });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { buildLane(); updateDepth(); }, 150); });
  window.addEventListener('load', function () { buildLane(); updateDepth(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { buildLane(); updateDepth(); });
  updateDepth();

  /* ---------- life cycle: two seed routes ---------- */
  var allTabs = Array.prototype.slice.call(document.querySelectorAll('.step-btn'));
  var routeBtns = Array.prototype.slice.call(document.querySelectorAll('.route-btn'));
  var tabs = [];
  function select(i, focus) {
    allTabs.forEach(function (t) { var on = t === tabs[i];
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
    if (focus) tabs[i].focus();
  }
  function setRoute(rt, keep) {
    var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
    tabs = allTabs.filter(function (t) { var r = t.dataset.route; return r === 'both' || r === rt; });
    allTabs.forEach(function (t) { t.hidden = tabs.indexOf(t) < 0; });
    tabs.forEach(function (t, i) { t.querySelector('.n').textContent = i + 1; });
    routeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.route === rt ? 'true' : 'false'); });
    var jv = document.getElementById('juvImg'); if (jv) jv.src = jv.dataset[rt];
    var idx = keep && cur ? tabs.indexOf(cur) : -1;
    select(idx >= 0 ? idx : (keep ? 0 : 2));
  }
  routeBtns.forEach(function (b) { b.addEventListener('click', function () { setRoute(b.dataset.route); }); });
  allTabs.forEach(function (t) {
    t.addEventListener('click', function () { select(tabs.indexOf(t)); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
    });
  });
  setRoute('car', true);

  /* ---------- timeline ---------- */
  var tl = document.getElementById('timeline');
  function tlStep() { var ev = tl.querySelector('.ev'); return ev ? ev.offsetWidth : 320; }
  document.getElementById('tlPrev').addEventListener('click', function () { tl.scrollBy({ left: -tlStep(), behavior: reduce ? 'auto' : 'smooth' }); });
  document.getElementById('tlNext').addEventListener('click', function () { tl.scrollBy({ left: tlStep(), behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- contact form ---------- */
  var form = document.getElementById('contactForm');
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = MSG[lang];
    var name = form.nombre.value.trim(), mail = form.email.value.trim(), body = form.mensaje.value.trim();
    if (!name || !mail || !body) { msg.textContent = t.missing; return; }
    if (form.action.indexOf('FORMSPREE_ID') !== -1) {
      var sub = encodeURIComponent('[Web] ' + form.tema.value + ' | ' + name);
      var txt = encodeURIComponent(body + '\n\n' + name + '\n' + (form.organizacion.value || '') + '\n' + mail);
      location.href = 'mailto:jinfante@patagoniaseaweeds.com?subject=' + sub + '&body=' + txt;
      return;
    }
    msg.textContent = t.sending;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (r.ok) { form.reset(); msg.textContent = t.ok; } else { msg.textContent = t.err; } })
      .catch(function () { msg.textContent = t.err; });
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
