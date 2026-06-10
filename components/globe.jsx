// ──────────────────────────────────────────────────────────────
// TSGlobe — interactive 3D dotted globe for the homepage "Falls
// Short" section. A canvas-rendered point sphere (brand blues)
// auto-rotates and is drag-spinnable; golden question-mark coin
// markers sit on the surface, rotate with it, hide on the back
// hemisphere, and reveal a metric tooltip ("Displays Executed: ??")
// on hover. The ?? is the point — these are the numbers you can't
// see without TapScan.
// ──────────────────────────────────────────────────────────────
const { useRef: useGRef, useEffect: useGEffect } = React;

// Surface markers — lat/lon spread across the front-facing landmasses,
// each carrying one of the "unknown" metrics the section is about.
const GLOBE_MARKERS = [
  { lat: 44,  lon: -98,  label: "Merchandise Displays Activated" },
  { lat: 12,  lon: -66,  label: "Contest Sign-Ups" },
  { lat: -25, lon: -55,  label: "Video Views" },
  { lat: 52,  lon: 8,    label: "Print Ad Views" },
  { lat: 8,   lon: 22,   label: "Booth Engagements" },
  { lat: 30,  lon: 48,   label: "Commercial Engagements" },
  { lat: 22,  lon: 78,   label: "Product Returns Initiated" },
  { lat: 40,  lon: 108,  label: "Billboard Engagement" },
  { lat: -14, lon: 124,  label: "Forms Filled Out" },
];

function gFibSphere(n) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  return pts;
}

function gLLToVec(lat, lon) {
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

// Rotate a point by yaw (around Y) then tilt (around X).
function gRot(p, yaw, tilt) {
  const [x, y, z] = p;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const y2 = y1 * ct - z1 * st, z2 = y1 * st + z1 * ct;
  return [x1, y2, z2];
}

// Coarse continent mask. Each blob is an ellipse in (lon, lat) space
// {lon, lat, rx, ry}; their union approximates Earth's landmasses well
// enough to be recognizable on a stylized dotted globe. Longitude is
// compared with dateline wrapping so Asia/Alaska near ±180 still match.
const GLOBE_LAND = [
  // North America
  { lon: -100, lat: 48, rx: 30, ry: 20 }, { lon: -92, lat: 62, rx: 40, ry: 14 },
  { lon: -116, lat: 41, rx: 18, ry: 17 }, { lon: -150, lat: 63, rx: 14, ry: 9 },
  { lon: -88,  lat: 25, rx: 12, ry: 12 }, { lon: -80, lat: 17, rx: 8, ry: 7 },
  // Greenland
  { lon: -42, lat: 72, rx: 14, ry: 9 },
  // South America
  { lon: -62, lat: -12, rx: 16, ry: 16 }, { lon: -68, lat: -34, rx: 10, ry: 17 },
  { lon: -63, lat: 3,   rx: 13, ry: 9 },  { lon: -71, lat: -49, rx: 6, ry: 8 },
  // Africa
  { lon: 18, lat: 8, rx: 21, ry: 16 },  { lon: 24, lat: -14, rx: 17, ry: 18 },
  { lon: 14, lat: 28, rx: 22, ry: 11 }, { lon: 40, lat: -19, rx: 8, ry: 10 },
  // Europe
  { lon: 14, lat: 50, rx: 19, ry: 12 }, { lon: 30, lat: 56, rx: 17, ry: 11 },
  // Asia
  { lon: 92, lat: 52, rx: 56, ry: 24 }, { lon: 68, lat: 41, rx: 18, ry: 16 },
  { lon: 80, lat: 24, rx: 12, ry: 14 }, { lon: 104, lat: 16, rx: 14, ry: 11 },
  { lon: 122, lat: 32, rx: 16, ry: 14 }, { lon: 47, lat: 32, rx: 16, ry: 12 },
  { lon: 142, lat: 62, rx: 22, ry: 13 },
  // Australia
  { lon: 134, lat: -25, rx: 17, ry: 10 },
];

function gIsLand(lat, lon) {
  if (lat < -62) return true;               // Antarctica cap
  for (let i = 0; i < GLOBE_LAND.length; i++) {
    const b = GLOBE_LAND[i];
    let dLon = ((lon - b.lon + 540) % 360) - 180;
    const dLat = lat - b.lat;
    if ((dLon * dLon) / (b.rx * b.rx) + (dLat * dLat) / (b.ry * b.ry) <= 1) return true;
  }
  return false;
}

function TSGlobe() {
  const wrapRef = useGRef(null);
  const canvasRef = useGRef(null);
  const markerRefs = useGRef([]);
  const hideTimers = useGRef([]);
  const state = useGRef({
    yaw: -0.6, tilt: -0.32,
    spin: 0.26,            // auto-rotate speed (radians / second)
    dragging: false,
    lastX: 0, lastY: 0, vYaw: 0,
  });

  // Inject component CSS once.
  useGEffect(() => {
    if (document.getElementById("ts-globe-css")) return;
    const s = document.createElement("style");
    s.id = "ts-globe-css";
    s.textContent = `
      .ts-globe-wrap {
        position: relative; width: 100%; max-width: 440px;
        aspect-ratio: 1 / 1; margin: 0 auto;
        touch-action: none; cursor: grab;
        user-select: none;
      }
      .ts-globe-wrap[data-drag] { cursor: grabbing; }
      .ts-globe-wrap::before {
        content: ""; position: absolute; left: 50%; top: 50%;
        width: 86%; height: 86%; transform: translate(-50%, -50%);
        border-radius: 50%; z-index: 0; pointer-events: none;
        background: radial-gradient(circle at 38% 32%,
          rgba(105,118,231,0.22) 0%, rgba(105,118,231,0.10) 42%, rgba(105,118,231,0) 70%);
        filter: blur(6px);
      }
      .ts-globe-wrap::after {
        content: ""; position: absolute; left: 50%; bottom: 4%;
        width: 54%; height: 7%; transform: translateX(-50%);
        border-radius: 50%; z-index: 0; pointer-events: none;
        background: radial-gradient(closest-side, rgba(28,34,80,0.20), rgba(28,34,80,0));
      }
      .ts-globe-canvas { position: absolute; inset: 0; z-index: 1; display: block; width: 100%; height: 100%; }
      .ts-gm {
        position: absolute; left: 0; top: 0; z-index: 2;
        will-change: transform; pointer-events: auto;
      }
      .ts-gm-coin {
        position: relative; width: 38px; height: 38px; margin: -19px 0 0 -19px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 50% 50%, #fff 0 41%, rgba(255,255,255,0) 42%),
          linear-gradient(160deg, #FFCB6B 0%, #FFB855 46%, #E8941F 100%);
        box-shadow: 0 3px 8px rgba(20,16,4,0.30), inset 0 0 0 1.5px rgba(255,255,255,0.45);
        display: grid; place-items: center;
        transition: box-shadow 200ms ease, filter 200ms ease;
      }
      .ts-gm-coin::after {
        content: "?"; font-family: Montserrat, system-ui, sans-serif;
        font-weight: 900; font-size: 19px; color: #E8941F; line-height: 1;
        transform: translateY(0.5px);
      }
      .ts-gm:hover .ts-gm-coin, .ts-gm.is-active .ts-gm-coin {
        box-shadow: 0 0 0 4px rgba(255,184,85,0.30), 0 5px 14px rgba(20,16,4,0.36),
          inset 0 0 0 1.5px rgba(255,255,255,0.55);
        filter: brightness(1.04);
      }
      .ts-gm-tip {
        position: absolute; bottom: calc(100% + 11px); left: 50%;
        transform: translateX(-50%) translateY(4px);
        background: #1C2250; color: #fff;
        font-family: Montserrat, system-ui, sans-serif; font-weight: 700; font-size: 13px;
        letter-spacing: 0.01em; white-space: nowrap;
        padding: 9px 13px; border-radius: 9px;
        box-shadow: 0 10px 26px rgba(15,17,17,0.26);
        opacity: 0; pointer-events: none;
        transition: opacity 420ms ease, transform 420ms ease;
      }
      .ts-gm-tip::after {
        content: ""; position: absolute; top: 100%; left: 50%;
        transform: translateX(-50%); border: 6px solid transparent;
        border-top-color: #1C2250;
      }
      .ts-gm-tip b { color: #FFB855; margin-left: 6px; font-weight: 900; }
      .ts-gm:hover .ts-gm-tip, .ts-gm.is-active .ts-gm-tip { opacity: 1; transform: translateX(-50%) translateY(0); }
      @media (prefers-reduced-motion: reduce) {
        .ts-gm-tip { transition: none; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  useGEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    // Higher density so continents read clearly; precompute each dot's
    // land flag once from its lat/lon.
    const dots = gFibSphere(2600).map((p) => {
      const lat = Math.asin(Math.max(-1, Math.min(1, p[1]))) * 180 / Math.PI;
      const lon = Math.atan2(p[0], p[2]) * 180 / Math.PI;
      return { p, land: gIsLand(lat, lon) };
    });
    const reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Batched draw setup ────────────────────────────────────────
    // Quantize depth into B buckets so each frame issues ~2×B fillStyle +
    // fill() calls instead of one per dot. Parallel Float32 arrays + integer
    // index buckets mean zero per-frame allocation. Drawing back buckets
    // first also gives correct front-to-back layering for free.
    const N = dots.length;
    const TAU = Math.PI * 2;
    const B = 14;
    const sxA = new Float32Array(N), syA = new Float32Array(N);
    const landB = Array.from({ length: B }, () => []);
    const oceanB = Array.from({ length: B }, () => []);
    const landStyle = new Array(B), oceanStyle = new Array(B);
    const landR = new Float32Array(B), oceanR = new Float32Array(B);
    function buildStyles() {
      for (let b = 0; b < B; b++) {
        const f = (b + 0.5) / B;
        landR[b] = (1.05 + 1.7 * f) * dpr;
        landStyle[b] = "rgba(" + Math.round(50 + 55 * f) + "," + Math.round(64 + 64 * f) +
          "," + Math.round(168 + 63 * f) + "," + (0.40 + 0.60 * f).toFixed(3) + ")";
        oceanR[b] = (0.55 + 0.95 * f) * dpr;
        oceanStyle[b] = "rgba(" + Math.round(150 + 60 * f) + "," + Math.round(170 + 55 * f) +
          "," + Math.round(220 + 30 * f) + "," + (0.05 + 0.20 * f * f).toFixed(3) + ")";
      }
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssSize = 0, cx = 0, cy = 0, R = 0;
    function resize() {
      const rect = wrap.getBoundingClientRect();
      cssSize = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
      cx = canvas.width / 2;
      cy = canvas.width / 2;
      R = canvas.width * 0.40;
      buildStyles();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ── Drag-to-spin ──────────────────────────────────────────────
    const st = state.current;
    function onDown(e) {
      st.dragging = true; st.vYaw = 0;
      st.lastX = e.clientX; st.lastY = e.clientY;
      wrap.setAttribute("data-drag", "");
      wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.lastX = e.clientX; st.lastY = e.clientY;
      st.yaw += dx * 0.006;
      st.tilt = Math.max(-1.1, Math.min(1.1, st.tilt + dy * 0.004));
      st.vYaw = dx * 0.006;
    }
    function onUp(e) {
      st.dragging = false;
      wrap.removeAttribute("data-drag");
      try { wrap.releasePointerCapture && wrap.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);

    // ── Render loop ───────────────────────────────────────────────
    let raf;
    let last = performance.now();
    function frame(now) {
      // Time-based step so motion stays smooth and consistent regardless
      // of the display's refresh rate. dt is clamped so a backgrounded tab
      // resuming can't jump the globe.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Drag momentum decays, then the steady auto-spin takes over. Never
      // pauses on hover — only reduced-motion holds it still.
      if (!st.dragging) {
        if (Math.abs(st.vYaw) > 0.0004) {
          st.yaw += st.vYaw;
          st.vYaw *= Math.pow(0.93, dt * 60);
        } else if (!reduce) {
          st.yaw += st.spin * dt;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dotted Earth: project every dot (rotation inlined to avoid per-frame
      // array allocations) and sort it into a depth bucket.
      const cyaw = Math.cos(st.yaw), syaw = Math.sin(st.yaw);
      const ctilt = Math.cos(st.tilt), stilt = Math.sin(st.tilt);
      for (let i = 0; i < N; i++) {
        const p = dots[i].p;
        const px = p[0], py = p[1], pz = p[2];
        const x1 = px * cyaw + pz * syaw;
        const z1 = -px * syaw + pz * cyaw;
        const y2 = py * ctilt - z1 * stilt;
        const z2 = py * stilt + z1 * ctilt;
        const front = (z2 + 1) / 2;                 // 0 back … 1 front
        sxA[i] = cx + x1 * R;
        syA[i] = cy - y2 * R;
        let b = (front * B) | 0;
        if (b < 0) b = 0; else if (b >= B) b = B - 1;
        (dots[i].land ? landB : oceanB)[b].push(i);
      }

      // Ocean first (recedes), then land on top — bright brand-blue
      // continents. One fill() per bucket.
      for (let b = 0; b < B; b++) {
        const arr = oceanB[b], n = arr.length;
        if (n) {
          ctx.fillStyle = oceanStyle[b];
          const r = oceanR[b];
          ctx.beginPath();
          for (let k = 0; k < n; k++) { const i = arr[k], sx = sxA[i], sy = syA[i]; ctx.moveTo(sx + r, sy); ctx.arc(sx, sy, r, 0, TAU); }
          ctx.fill();
          arr.length = 0;
        }
      }
      for (let b = 0; b < B; b++) {
        const arr = landB[b], n = arr.length;
        if (n) {
          ctx.fillStyle = landStyle[b];
          const r = landR[b];
          ctx.beginPath();
          for (let k = 0; k < n; k++) { const i = arr[k], sx = sxA[i], sy = syA[i]; ctx.moveTo(sx + r, sy); ctx.arc(sx, sy, r, 0, TAU); }
          ctx.fill();
          arr.length = 0;
        }
      }

      // Markers — project, place DOM, hide on the far side.
      for (let i = 0; i < GLOBE_MARKERS.length; i++) {
        const el = markerRefs.current[i];
        if (!el) continue;
        const m = GLOBE_MARKERS[i];
        const [x, y, z] = gRot(gLLToVec(m.lat, m.lon), st.yaw, st.tilt);
        if (z <= 0.04) { el.style.display = "none"; continue; }
        const front = (z + 1) / 2;
        const px = (cx + x * R) / dpr;
        const py = (cy - y * R) / dpr;
        const scale = 0.74 + 0.30 * front;
        el.style.display = "block";
        el.style.transform = "translate3d(" + px.toFixed(2) + "px," + py.toFixed(2) + "px,0) scale(" + scale.toFixed(3) + ")";
        el.style.zIndex = String(2 + Math.round(front * 10));
        el.style.opacity = String(Math.min(1, (z - 0.04) / 0.16));
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      for (let i = 0; i < hideTimers.current.length; i++) clearTimeout(hideTimers.current[i]);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="ts-globe-wrap"
         role="img"
         aria-label="Interactive globe of unknown campaign metrics — displays executed, sign-ups, ad views and more.">
      <canvas ref={canvasRef} className="ts-globe-canvas"></canvas>
      {GLOBE_MARKERS.map((m, i) =>
        <div key={i} className="ts-gm"
             ref={(el) => markerRefs.current[i] = el}
             onMouseEnter={() => {
               clearTimeout(hideTimers.current[i]);
               const el = markerRefs.current[i];
               if (el) el.classList.add("is-active");
             }}
             onMouseLeave={() => {
               // Keep the tooltip up for 3s after the cursor leaves, then fade.
               clearTimeout(hideTimers.current[i]);
               hideTimers.current[i] = setTimeout(() => {
                 const el = markerRefs.current[i];
                 if (el) el.classList.remove("is-active");
               }, 3000);
             }}>
          <div className="ts-gm-tip">{m.label}:<b>??</b></div>
          <div className="ts-gm-coin"></div>
        </div>
      )}
    </div>
  );
}

window.TSGlobe = TSGlobe;
