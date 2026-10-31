/* Procedural Macrocystis pyrifera: stipes, pneumatocysts, rugose serrated blades, haptera */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = {
    stipe: '#5E4519', blade: '#A07A2C', bladeHi: '#D6B862', rib: 'rgba(70,46,10,.28)',
    float: '#7E5F23', floatHi: '#E0C477', hapt: '#5E4520', haptHi: '#8C7243'
  };

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function f1(n) { return n.toFixed(1); }

  /* one blade: long, thin, wavy, with fine marginal spines and faint rugae */
  function bladeShape(bx, by, ang, len, wid, seed, bend) {
    var N = 56, dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    var L = [], R = [], ribs = [], mids = [];
    var r = rnd(seed * 7 + 3), norm = Math.pow(0.3, 0.42) * Math.pow(0.7, 1.0);
    var ph = r() * 6.28, wav = 0.03 + r() * 0.03;
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var off = bend * len * t * t + wav * len * Math.sin(t * Math.PI * 2.2 + ph) * t;
      var cx = bx + dx * len * t + nx * off;
      var cy = by + dy * len * t + ny * off;
      var w = wid * Math.pow(t + 0.02, 0.42) * Math.pow(1 - t, 1.0) / norm;
      w *= 1 + 0.12 * Math.sin(t * 34 + seed) + 0.06 * Math.sin(t * 71 + seed * 3);
      var sp = (t > 0.12 && t < 0.9 && i % 4 === 0 && r() < 0.7) ? 0.4 + r() * 0.5 : 0;
      var sp2 = (t > 0.12 && t < 0.9 && i % 4 === 2 && r() < 0.7) ? 0.4 + r() * 0.5 : 0;
      L.push([cx + nx * (w / 2 + sp), cy + ny * (w / 2 + sp)]);
      R.push([cx - nx * (w / 2 + sp2), cy - ny * (w / 2 + sp2)]);
      mids.push([cx, cy, w]);
      /* occasional short, irregular wrinkles that start at an edge: Macrocystis has no midrib */
      if (i > 8 && i < N - 8 && r() < 0.16) {
        var s1 = r() < 0.5 ? 1 : -1, a0 = w * (0.46 - r() * 0.06), a1 = w * (0.05 + r() * 0.25) * (r() < 0.5 ? 1 : -1), sw = 1.5 + r() * 2.5;
        ribs.push('M' + f1(cx + s1 * nx * a0) + ' ' + f1(cy + s1 * ny * a0) + ' Q' + f1(cx + s1 * nx * (a0 + a1) / 2 + dx * sw) + ' ' + f1(cy + s1 * ny * (a0 + a1) / 2 + dy * sw) + ' ' + f1(cx + s1 * nx * a1) + ' ' + f1(cy + s1 * ny * a1));
      }
    }
    /* soft sheen patches placed off-centre at random, never along the axis */
    var hiD = '';
    for (var p = 0; p < 2; p++) {
      var j0 = Math.floor(N * (0.12 + r() * 0.45)), j1 = Math.min(N - 6, j0 + Math.floor(N * (0.12 + r() * 0.18)));
      var c0 = (r() - 0.5) * 0.5, sw2 = 0.12 + r() * 0.12, A = [], B = [];
      for (var q = j0; q <= j1; q++) {
        var u = (q - j0) / Math.max(1, j1 - j0), m = mids[q], k2 = Math.sin(Math.PI * u);
        var cc = c0 + 0.08 * Math.sin(u * 5 + p), hw = sw2 * k2;
        A.push([m[0] + nx * m[2] * (cc + hw), m[1] + ny * m[2] * (cc + hw)]);
        B.push([m[0] + nx * m[2] * (cc - hw), m[1] + ny * m[2] * (cc - hw)]);
      }
      if (A.length > 2) hiD += poly(A, B);
    }
    function poly(a, b) {
      var d = 'M' + f1(a[0][0]) + ' ' + f1(a[0][1]);
      for (var j = 1; j < a.length; j++) d += 'L' + f1(a[j][0]) + ' ' + f1(a[j][1]);
      for (j = b.length - 1; j >= 0; j--) d += 'L' + f1(b[j][0]) + ' ' + f1(b[j][1]);
      return d + 'Z';
    }
    return { body: poly(L, R), hi: hiD, ribs: ribs.join(' ') };
  }

  /* blade attached to a stipe point through a short stalk and a pneumatocyst */
  function addBlade(parent, sx, sy, ang, len, wid, seed, bend) {
    var dx = Math.cos(ang), dy = Math.sin(ang);
    var outer = el('g', { 'class': 'blade-g' }, parent);
    outer.style.transformOrigin = f1(sx) + 'px ' + f1(sy) + 'px';
    var inner = el('g', { 'class': 'blade-sway' }, outer);
    inner.style.transformOrigin = f1(sx) + 'px ' + f1(sy) + 'px';
    inner.style.animationDuration = (5 + (seed % 5)) + 's';
    inner.style.animationDelay = (-(seed % 7)) + 's';
    var px = sx + dx * 4, py = sy + dy * 4;           // end of stalk
    var fx = px + dx * 8, fy = py + dy * 8;           // pneumatocyst centre
    var bx = fx + dx * 5, by = fy + dy * 5;           // blade base, overlapping the float
    el('path', { d: 'M' + f1(sx) + ' ' + f1(sy) + 'L' + f1(px) + ' ' + f1(py), stroke: C.stipe, 'stroke-width': 1.5, fill: 'none' }, inner);
    var s = bladeShape(bx, by, ang, len, wid, seed, bend);
    el('path', { d: s.body, fill: C.blade, 'fill-opacity': '.86' }, inner);
    el('path', { d: s.hi, fill: C.bladeHi, 'fill-opacity': '.22' }, inner);
    el('path', { d: s.ribs, stroke: C.rib, 'stroke-width': '.7', fill: 'none' }, inner);
    var deg = ang * 180 / Math.PI;
    var tr = 'rotate(' + f1(deg) + ' ' + f1(fx) + ' ' + f1(fy) + ')';
    el('path', { d: 'M' + f1(fx - 8) + ' ' + f1(fy) + ' C' + f1(fx - 6) + ' ' + f1(fy - 5) + ' ' + f1(fx + 3) + ' ' + f1(fy - 5.5) + ' ' + f1(fx + 7) + ' ' + f1(fy - 2) +
      ' L' + f1(fx + 9) + ' ' + f1(fy) + ' L' + f1(fx + 7) + ' ' + f1(fy + 2) + ' C' + f1(fx + 3) + ' ' + f1(fy + 5.5) + ' ' + f1(fx - 6) + ' ' + f1(fy + 5) + ' ' + f1(fx - 8) + ' ' + f1(fy) + 'Z',
      fill: C.float, transform: tr }, inner);
    el('ellipse', { cx: f1(fx - 1), cy: f1(fy - 1.8), rx: 3.6, ry: 1.2, fill: C.floatHi, 'fill-opacity': '.65', transform: tr }, inner);
    return outer;
  }

  /* holdfast: conical tangle of branching haptera */
  function addHoldfast(parent, x, y, width, height, seed) {
    var r = rnd(seed || 7), g = el('g', { 'class': 'holdfast' }, parent);
    el('ellipse', { cx: x + 6, cy: y + 4, rx: width * 0.75, ry: 11, fill: '#24434B' }, g);
    var d = '', dh = '';
    for (var i = 0; i < 34; i++) {
      var sx = x + (r() - 0.5) * 8, sy = y - height + r() * height * 0.35;
      var ex = x + (r() - 0.5) * width, ey = y - r() * 4;
      var mx = (sx + ex) / 2 + (r() - 0.5) * 18, my = (sy + ey) / 2 + (r() - 0.5) * 8;
      d += 'M' + f1(sx) + ' ' + f1(sy) + 'Q' + f1(mx) + ' ' + f1(my) + ' ' + f1(ex) + ' ' + f1(ey) + ' ';
      if (r() > 0.4) {
        var bx = ex + (r() - 0.5) * 22, by = y + 1;
        dh += 'M' + f1((mx + ex) / 2) + ' ' + f1((my + ey) / 2) + 'Q' + f1((mx + bx) / 2) + ' ' + f1(ey) + ' ' + f1(bx) + ' ' + f1(by) + ' ';
      }
    }
    el('path', { d: d, stroke: C.hapt, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('path', { d: dh, stroke: C.haptHi, 'stroke-width': 1.5, fill: 'none', 'stroke-linecap': 'round' }, g);
    return g;
  }

  /* stipe as a gently twisting polyline, returns points */
  function stipePoints(x0, y0, x1, y1, amp, seed, step) {
    var pts = [], n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / (step || 12)));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      var dd = Math.abs(y1 - y0) * t;
      pts.push([x0 + (x1 - x0) * t + Math.sin(dd / 230 + seed) * amp + Math.sin(dd / 71 + seed * 2) * amp * 0.25, y0 + (y1 - y0) * t]);
    }
    return pts;
  }
  function pointsToPath(pts) {
    var d = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]);
    for (var i = 1; i < pts.length; i++) d += 'L' + f1(pts[i][0]) + ' ' + f1(pts[i][1]);
    return d;
  }

  /* growing tip: graded pneumatocysts and young blades fanning off one side,
     ending in the broad apical scimitar blade (the stipe never ends bare) */
  function addApical(parent, x, y, ang, size, side) {
    side = side || 1;
    var g = el('g', {}, parent);
    var n = 8, Lr = size * 1.15, dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy * side, ny = dx * side;
    var rachis = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      rachis.push([x + dx * Lr * t - nx * size * 0.18 * t * t, y + dy * Lr * t - ny * size * 0.18 * t * t]);
    }
    /* young blades first so the floats sit on top */
    for (i = 0; i < n; i++) {
      var p = rachis[i], k = i / n;
      var ba = ang + side * (0.38 + k * 0.22);
      var fx = p[0] + Math.cos(ba) * (6 - k * 3), fy = p[1] + Math.sin(ba) * (6 - k * 3);
      var len = size * (1.7 - k * 1.1), wid = size * (0.12 - k * 0.06);
      var sh = bladeShape(fx, fy, ba, len, wid, 31 + i * 7, -side * (0.18 + k * 0.12));
      el('path', { d: sh.body, fill: C.blade, 'fill-opacity': '.88' }, g);
      el('path', { d: sh.hi, fill: C.bladeHi, 'fill-opacity': '.3' }, g);
    }
    el('path', { d: pointsToPath(rachis), stroke: C.stipe, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, g);
    for (i = 0; i < n; i++) {
      var q = rachis[i], kk = i / n, fa = ang + side * (0.38 + kk * 0.22);
      var cx = q[0] + Math.cos(fa) * (4 - kk * 2), cy = q[1] + Math.sin(fa) * (4 - kk * 2);
      var rx = 6.5 * (1 - kk * 0.8), ry = 3.8 * (1 - kk * 0.75);
      var tr = 'rotate(' + f1(fa * 180 / Math.PI) + ' ' + f1(cx) + ' ' + f1(cy) + ')';
      el('ellipse', { cx: f1(cx), cy: f1(cy), rx: f1(rx), ry: f1(ry), fill: C.float, transform: tr }, g);
      el('ellipse', { cx: f1(cx - 0.6), cy: f1(cy - ry * 0.4), rx: f1(rx * 0.45), ry: f1(ry * 0.3), fill: C.floatHi, 'fill-opacity': '.6', transform: tr }, g);
    }
    /* terminal scimitar: broad, sickle shaped, curving back toward the young blades */
    var e = rachis[n], R = size * 0.42, sweep = 2.7, N2 = 40, Lp = [], Rp = [];
    var cxs = e[0] + nx * R, cys = e[1] + ny * R;            // centre of the sickle arc
    var a0 = Math.atan2(e[1] - cys, e[0] - cxs);
    for (i = 0; i <= N2; i++) {
      var tt = i / N2, th = a0 + side * sweep * tt;
      var rr = R * (1 - 0.25 * tt);
      var px = cxs + Math.cos(th) * rr, py = cys + Math.sin(th) * rr;
      var ux = Math.cos(th), uy = Math.sin(th);
      var w = size * 0.24 * Math.pow(Math.sin(Math.PI * Math.min(1, tt * 1.05)), 0.7) * (tt < 0.08 ? tt / 0.08 : 1);
      var tooth = (i % 3 === 0 && tt > 0.1 && tt < 0.9) ? 0.8 : 0;
      Lp.push([px + ux * (w * 0.75 + tooth), py + uy * (w * 0.75 + tooth)]);
      Rp.push([px - ux * w * 0.25, py - uy * w * 0.25]);
    }
    var dd = 'M' + f1(Lp[0][0]) + ' ' + f1(Lp[0][1]);
    for (i = 1; i < Lp.length; i++) dd += 'L' + f1(Lp[i][0]) + ' ' + f1(Lp[i][1]);
    for (i = Rp.length - 1; i >= 0; i--) dd += 'L' + f1(Rp[i][0]) + ' ' + f1(Rp[i][1]);
    el('path', { d: dd + 'Z', fill: C.blade, 'fill-opacity': '.92' }, g);
    var hl = 'M' + f1(Lp[4][0]) + ' ' + f1(Lp[4][1]);
    for (i = 5; i < N2 - 4; i++) hl += 'L' + f1((Lp[i][0] * 0.35 + Rp[i][0] * 0.65)) + ' ' + f1((Lp[i][1] * 0.35 + Rp[i][1] * 0.65));
    el('path', { d: hl, stroke: C.bladeHi, 'stroke-opacity': '.25', 'stroke-width': size * 0.035, fill: 'none', 'stroke-linecap': 'round' }, g);
    return g;
  }

  /* smooth bend from a rising stipe into a floating canopy (no right angles) */
  function arcPoints(x0, y0, dir, yc, R, run, seed) {
    var pts = [], n = 16;
    var P1 = [x0, y0 - (y0 - yc) * 0.72], P2 = [x0 + dir * R * 0.5, yc], P3 = [x0 + dir * R * 1.35, yc];
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t;
      pts.push([u * u * u * x0 + 3 * u * u * t * P1[0] + 3 * u * t * t * P2[0] + t * t * t * P3[0],
                u * u * u * y0 + 3 * u * u * t * P1[1] + 3 * u * t * t * P2[1] + t * t * t * P3[1]]);
    }
    for (var d = 14; d <= run; d += 12) {
      var x = P3[0] + dir * d;
      pts.push([x, yc + Math.sin(x / 90 + seed) * 3 + Math.sin(x / 31 + seed * 2) * 1.2]);
    }
    return pts;
  }


  /* sporophylls: a dense skirt of long, smooth, ribbon-like blades on short branched stalks just above the holdfast,
     without pneumatocysts, splaying outward and drooping like a fountain, with darker sorus patches */
  /* sporophylls: dense basal skirt of smooth, wavy, slightly serrated ribbons with dark sori */
  function sporoRibbon(sx, sy, ang, len, wid, grav, wav, ph, r, floor) {
    var N = 34, pts = [], vx = Math.cos(ang), vy = Math.sin(ang), x = sx, y = sy, ds = len / N;
    for (var i = 0; i <= N; i++) {
      pts.push({ x: x, y: y, vx: vx, vy: vy });
      vy += grav * ds; var m = Math.sqrt(vx * vx + vy * vy); vx /= m; vy /= m;
      x += vx * ds; y += vy * ds;
      if (y > floor - 3) { y = floor - 3 - r() * 2; if (vy > 0) { vy = 0.08; vx = vx < 0 ? -1 : 1; } }
    }
    var L = [], R = [], mid = [];
    for (i = 0; i <= N; i++) {
      var t = i / N, p = pts[i], nx = -p.vy, ny = p.vx;
      var off = wav * Math.sin(t * Math.PI * 2.2 + ph) * Math.min(1, t * 3);
      var cx = p.x + nx * off, cy = p.y + ny * off;
      var prof = t < 0.08 ? 0.18 + t / 0.08 * 0.82 : t > 0.8 ? Math.sqrt(Math.max(0, (1 - t) / 0.2)) : 1;
      var tw = 0.45 + 0.55 * Math.abs(Math.cos(t * Math.PI * 1.7 + ph * 0.7));
      var w = wid * prof * tw * 0.5;
      var sL = (i % 2 ? 0.7 : -0.2) * (0.4 + r() * 0.6), sR = (i % 2 ? -0.2 : 0.7) * (0.4 + r() * 0.6);
      L.push([cx + nx * (w + sL), cy + ny * (w + sL)]);
      R.push([cx - nx * (w + sR), cy - ny * (w + sR)]);
      mid.push({ x: cx, y: cy, nx: nx, ny: ny, w: w, tw: tw });
    }
    function poly(A, B) {
      var d = 'M' + f1(A[0][0]) + ' ' + f1(A[0][1]);
      for (var j = 1; j < A.length; j++) d += 'L' + f1(A[j][0]) + ' ' + f1(A[j][1]);
      for (j = B.length - 1; j >= 0; j--) d += 'L' + f1(B[j][0]) + ' ' + f1(B[j][1]);
      return d + 'Z';
    }
    function strip(t0, t1, fa, fb, jit) {
      var A = [], B = [];
      var j0 = Math.round(t0 * N), j1 = Math.round(t1 * N), sp = r() * 6;
      for (var j = j0; j <= j1; j++) {
        var u = (j - j0) / Math.max(1, j1 - j0);
        var m = mid[j], e = jit ? Math.pow(Math.sin(Math.PI * u), 0.45) * (0.8 + 0.2 * Math.sin(j * 0.9 + sp)) : 1;
        A.push([m.x + m.nx * m.w * fa * e, m.y + m.ny * m.w * fa * e]);
        B.push([m.x + m.nx * m.w * fb * e, m.y + m.ny * m.w * fb * e]);
      }
      return A.length > 1 ? poly(A, B) : '';
    }
    var folds = [];
    for (i = 2; i < N - 1; i++) if (mid[i].tw < 0.55 && mid[i - 1].tw >= mid[i].tw && mid[i + 1].tw >= mid[i].tw) folds.push(mid[i]);
    return { body: poly(L, R), strip: strip, folds: folds };
  }

  function addSporophylls(parent, x, y, seed) {
    var r = rnd(seed || 5), g = el('g', { 'class': 'sporophylls' }, parent);
    var tones = ['#5B4317', '#6E5120', '#7F5F28', '#8E6C30', '#9C7A39'];
    /* short dichotomous stalks fan out just above the holdfast; each carries a bunch of ribbons */
    var stalks = [];
    for (var s = 0; s < 10; s++) {
      var side = s % 2 ? 1 : -1, a = -Math.PI / 2 + side * (0.15 + r() * 0.9);
      var sl = 8 + r() * 16;
      stalks.push({ x0: x + (r() - 0.5) * 10, y0: y - 16, a: a, l: sl, side: side, z: r() });
    }
    stalks.sort(function (p, q) { return p.z - q.z; });
    stalks.forEach(function (st, si) {
      var ex = st.x0 + Math.cos(st.a) * st.l, ey = st.y0 + Math.sin(st.a) * st.l;
      var sg = el('g', { 'class': 'sporo-sway', style: 'transform-origin:' + f1(st.x0) + 'px ' + f1(st.y0) + 'px;animation-duration:' + (5 + r() * 3).toFixed(1) + 's;animation-delay:-' + (r() * 6).toFixed(1) + 's' }, g);
      el('path', { d: 'M' + f1(st.x0) + ' ' + f1(st.y0) + 'Q' + f1((st.x0 + ex) / 2 + st.side * 2) + ' ' + f1((st.y0 + ey) / 2) + ' ' + f1(ex) + ' ' + f1(ey), stroke: '#4B3510', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none' }, sg);
      var nb = 4 + Math.floor(r() * 3);
      for (var b = 0; b < nb; b++) {
        var depth = (si + r()) / stalks.length;
        var up = 0.25 + r() * 1.05;
        var ang = st.side > 0 ? -up : Math.PI + up;
        if (r() < 0.25) ang = -Math.PI / 2 + st.side * r() * 0.35;
        var len = 85 + r() * 110, wid = 10 + r() * 9;
        var rb = sporoRibbon(ex, ey, ang, len, wid, 0.008 + r() * 0.010, 2 + r() * 4, r() * 6.28, r, y + 26);
        var col = tones[Math.min(4, Math.floor(depth * 3 + r() * 2.2))];
        var bg = el('g', { opacity: (0.78 + depth * 0.22).toFixed(2) }, sg);
        el('path', { d: rb.body, fill: col, stroke: 'rgba(40,26,6,.45)', 'stroke-width': '.5' }, bg);
        el('path', { d: rb.strip(0.06, 0.92, 0.15, 0.85, false), fill: '#C9A458', 'fill-opacity': (0.10 + r() * 0.12).toFixed(2) }, bg);
        if (r() < 0.7) {
          var t0 = 0.15 + r() * 0.2, t1 = Math.min(0.85, t0 + 0.25 + r() * 0.35);
          el('path', { d: rb.strip(t0, t1, -0.7, 0.7, true), fill: '#3A2406', 'fill-opacity': (0.45 + r() * 0.25).toFixed(2) }, bg);
        }
        rb.folds.forEach(function (m) {
          el('path', { d: 'M' + f1(m.x + m.nx * m.w) + ' ' + f1(m.y + m.ny * m.w) + 'L' + f1(m.x - m.nx * m.w) + ' ' + f1(m.y - m.ny * m.w), stroke: 'rgba(30,18,4,.45)', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, bg);
        });
      }
    });
    return g;
  }

  window.PSWKelp = { addSporophylls: addSporophylls, arcPoints: arcPoints, el: el, rnd: rnd, colors: C, addBlade: addBlade, addHoldfast: addHoldfast, addApical: addApical, stipePoints: stipePoints, pointsToPath: pointsToPath };
})();
