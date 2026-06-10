// ──────────────────────────────────────────────────────────────
// TSDashViz — abstract "live dashboard" illustration for the homepage
// "Dynamic Connection" section. A white card holding a line/area chart,
// a bar cluster, and a donut ring — all shape, no numbers. At rest it
// shows a settled, complete state; hovering replays a coordinated build
// (line draws on, bars grow, ring sweeps) with a light sweep + glow.
// ──────────────────────────────────────────────────────────────
const { useState: useDVState } = React;

// Single source for the line + area geometry so the stroke and its fill
// stay aligned. viewBox 0 0 320 140.
const DV_LINE = "M0,98 C38,66 68,74 104,56 C146,35 172,82 208,60 C250,35 286,26 320,44";
const DV_AREA = DV_LINE + " L320,140 L0,140 Z";
const DV_BARS = [0.46, 0.66, 0.52, 0.82, 0.44, 0.7, 0.58];

function TSDashViz() {
  const [live, setLive] = useDVState(false);

  React.useEffect(() => {
    if (document.getElementById("ts-dashviz-css")) return;
    const s = document.createElement("style");
    s.id = "ts-dashviz-css";
    s.textContent = `
      .ts-dv {
        position: relative; width: 100%; max-width: 460px; margin: 0 auto;
        --dv-blue: #2F3886; --dv-blue2: #6976E7; --dv-amber: #FFB855; --dv-ink: #1C2250;
        background: #fff; border: 1px solid #E6E8F7; border-radius: 20px;
        padding: 22px; box-sizing: border-box;
        box-shadow: 0 18px 44px -22px rgba(28,34,80,0.34);
        transition: transform 320ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 320ms cubic-bezier(0.2,0.8,0.2,1);
        cursor: pointer; user-select: none;
        display: flex; flex-direction: column; gap: 14px;
      }
      .ts-dv:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -24px rgba(28,34,80,0.42); }

      .ts-dv-tabs { display: flex; align-items: center; gap: 8px; }
      .ts-dv-pill { height: 9px; border-radius: 999px; background: #E9EBF8; }
      .ts-dv-pill.w1 { width: 56px; } .ts-dv-pill.w2 { width: 34px; } .ts-dv-pill.w3 { width: 22px; }
      .ts-dv-pill.lead { background: linear-gradient(90deg, var(--dv-blue2), var(--dv-blue)); width: 64px; height: 11px; }
      .ts-dv-pill.dot { width: 11px; height: 11px; margin-left: auto; background: var(--dv-amber); }

      .ts-dv-panel {
        position: relative; background: #F6F7FE; border: 1px solid #E9EBF8;
        border-radius: 13px; padding: 12px; overflow: hidden;
      }
      .ts-dv-area-wrap { height: 150px; }
      .ts-dv-bottom { display: grid; grid-template-columns: 1.45fr 1fr; gap: 12px; }
      .ts-dv svg { display: block; width: 100%; height: 100%; overflow: visible; }

      /* Line + area */
      .ts-dv-grid line { stroke: #DfE2F4; stroke-width: 1; }
      .ts-dv-line { fill: none; stroke: url(#dvLineGrad); stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; }
      .ts-dv-area { fill: url(#dvAreaGrad); }
      .ts-dv-end {
        fill: var(--dv-amber); stroke: #fff; stroke-width: 2;
        animation: dvPulse 2.4s ease-in-out infinite;
      }
      @keyframes dvPulse { 0%,100% { r: 4.4px; } 50% { r: 6px; } }

      /* Bars */
      .ts-dv-bar { transform-origin: bottom; transform-box: fill-box; }

      /* Donut */
      .ts-dv-ring { fill: none; stroke-width: 13; stroke-linecap: round; }

      /* Sweep highlight */
      .ts-dv-sweep {
        position: absolute; inset: 0; pointer-events: none; opacity: 0;
        background: linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 62%);
        transform: translateX(-120%);
      }

      /* ── Hover replay ─────────────────────────────────────────── */
      .ts-dv.is-live .ts-dv-line { animation: dvDraw 1.05s cubic-bezier(0.4,0,0.2,1) both; }
      .ts-dv.is-live .ts-dv-area { animation: dvArea 1.05s cubic-bezier(0.4,0,0.2,1) both; }
      .ts-dv.is-live .ts-dv-bar { animation: dvBar 0.8s cubic-bezier(0.2,0.85,0.3,1) both; }
      .ts-dv.is-live .ts-dv-ring { animation: dvRing 1s cubic-bezier(0.4,0,0.2,1) both; }
      .ts-dv.is-live .ts-dv-sweep { animation: dvSweep 1.05s cubic-bezier(0.4,0,0.2,1) both; }

      @keyframes dvDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
      @keyframes dvArea { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
      @keyframes dvBar { from { transform: scaleY(0.04); } to { transform: scaleY(1); } }
      @keyframes dvRing { from { stroke-dashoffset: var(--dv-len); } to { stroke-dashoffset: var(--dv-off); } }
      @keyframes dvSweep {
        0% { opacity: 0; transform: translateX(-120%); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: translateX(120%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .ts-dv.is-live .ts-dv-line, .ts-dv.is-live .ts-dv-area,
        .ts-dv.is-live .ts-dv-bar, .ts-dv.is-live .ts-dv-ring,
        .ts-dv.is-live .ts-dv-sweep, .ts-dv-end { animation: none; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  // Toggle the class off→on so the CSS animations restart on every hover.
  const replay = () => { setLive(false); requestAnimationFrame(() => setLive(true)); };

  // Donut segments — fractions of the ring (with small gaps), drawn with
  // pathLength=1 so dash math is uniform. Each is rotated to its start.
  const segs = [
    { frac: 0.46, color: "var(--dv-blue)" },
    { frac: 0.30, color: "var(--dv-blue2)" },
    { frac: 0.24, color: "var(--dv-amber)" },
  ];
  let acc = 0;

  return (
    <div className={"ts-dv" + (live ? " is-live" : "")}
         onMouseEnter={replay}
         onMouseLeave={() => setLive(false)}
         role="img"
         aria-label="Abstract live analytics dashboard with a trend line, bar chart, and donut ring.">
      {/* faux toolbar */}
      <div className="ts-dv-tabs">
        <span className="ts-dv-pill lead"></span>
        <span className="ts-dv-pill w2"></span>
        <span className="ts-dv-pill w3"></span>
        <span className="ts-dv-pill dot"></span>
      </div>

      {/* area + line */}
      <div className="ts-dv-panel ts-dv-area-wrap">
        <svg viewBox="0 0 320 140" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="dvLineGrad" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#6976E7" />
              <stop offset="1" stopColor="#2F3886" />
            </linearGradient>
            <linearGradient id="dvAreaGrad" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#6976E7" stopOpacity="0.30" />
              <stop offset="1" stopColor="#6976E7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="ts-dv-grid">
            <line x1="0" y1="46" x2="320" y2="46" />
            <line x1="0" y1="93" x2="320" y2="93" />
          </g>
          <path className="ts-dv-area" d={DV_AREA} />
          <path className="ts-dv-line" d={DV_LINE} pathLength="1"
                style={{ strokeDasharray: 1 }} />
          <circle className="ts-dv-end" cx="320" cy="44" r="4.4" />
        </svg>
        <div className="ts-dv-sweep"></div>
      </div>

      {/* bars + donut */}
      <div className="ts-dv-bottom">
        <div className="ts-dv-panel" style={{ height: 118 }}>
          <svg viewBox="0 0 200 96" preserveAspectRatio="none" aria-hidden="true">
            {DV_BARS.map((h, i) => {
              const bw = 18, gap = (200 - DV_BARS.length * bw) / (DV_BARS.length + 1);
              const x = gap + i * (bw + gap);
              const ht = 12 + h * 76;
              const accent = i === 3;
              return (
                <rect key={i} className="ts-dv-bar"
                      x={x} y={96 - ht} width={bw} height={ht} rx="5"
                      fill={accent ? "var(--dv-amber)" : "url(#dvLineGrad)"}
                      style={{ animationDelay: (i * 70) + "ms" }} />
              );
            })}
          </svg>
        </div>
        <div className="ts-dv-panel" style={{ height: 118, display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 120 96" aria-hidden="true">
            <circle cx="60" cy="48" r="30" fill="none" stroke="#EAECF8" strokeWidth="13" />
            {segs.map((s, i) => {
              const C = 2 * Math.PI * 30;          // ring circumference
              const start = acc; acc += s.frac;
              const dash = s.frac * C - 6;         // small gap between segments
              return (
                <circle key={i} className="ts-dv-ring"
                        cx="60" cy="48" r="30" stroke={s.color}
                        strokeDasharray={dash + " " + C}
                        transform={"rotate(" + (start * 360 - 90) + " 60 48)"}
                        style={{ "--dv-len": dash, "--dv-off": 0, animationDelay: (i * 130) + "ms" }} />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

window.TSDashViz = TSDashViz;
