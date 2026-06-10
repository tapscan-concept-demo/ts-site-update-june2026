// ──────────────────────────────────────────────────────────────
// TSTouchpointViz — interactive illustration for the homepage
// "Dynamic Connection" section. Hovering a touchpoint pill reveals
// the matching icon with a crossfade; idle shows a phone + QR.
//
// Style: soft matte "clay" 3D. Each form is shaded with a reusable
// radial gradient (light from top-left), lifted with a gloss
// highlight, and grounded with a soft drop-shadow filter — a chunky,
// friendly, modern 2026 look. Gradients/filter live once in TP_DEFS.
// ──────────────────────────────────────────────────────────────

const TP_BLUE = "#2F3886", TP_AMBER = "#FFB855"; // kept for external reference

// Shared clay gradients, gloss + soft shadow — defined once.
const TP_DEFS = (
  <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <radialGradient id="clayBlue" cx="0.35" cy="0.27" r="0.9">
        <stop offset="0" stopColor="#B7CFF7" />
        <stop offset="0.5" stopColor="#7CA1EB" />
        <stop offset="1" stopColor="#5780D8" />
      </radialGradient>
      <radialGradient id="claySky" cx="0.35" cy="0.27" r="0.9">
        <stop offset="0" stopColor="#DCE9FC" />
        <stop offset="0.6" stopColor="#AECAF5" />
        <stop offset="1" stopColor="#8DB1EF" />
      </radialGradient>
      <radialGradient id="clayAmber" cx="0.35" cy="0.27" r="0.9">
        <stop offset="0" stopColor="#FFE0A6" />
        <stop offset="0.55" stopColor="#FBB154" />
        <stop offset="1" stopColor="#ED972C" />
      </radialGradient>
      <radialGradient id="clayCream" cx="0.35" cy="0.27" r="0.95">
        <stop offset="0" stopColor="#FFF9EE" />
        <stop offset="0.7" stopColor="#F8E9CE" />
        <stop offset="1" stopColor="#EBD3A8" />
      </radialGradient>
      <radialGradient id="clayTeal" cx="0.35" cy="0.27" r="0.9">
        <stop offset="0" stopColor="#B0ECE1" />
        <stop offset="0.6" stopColor="#64C8B9" />
        <stop offset="1" stopColor="#46AD9E" />
      </radialGradient>
      <radialGradient id="clayGloss" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <filter id="claySh" x="-35%" y="-30%" width="170%" height="165%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#2B3C6B" floodOpacity="0.22" />
      </filter>
    </defs>
  </svg>
);

const TP_ICONS = {
  // Retail shelf unit with puffy products in two recesses.
  "Merchandise Displays": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="38" y="32" width="84" height="94" rx="19" fill="url(#clayBlue)" />
        <rect x="48" y="43" width="64" height="31" rx="10" fill="url(#clayCream)" />
        <rect x="48" y="83" width="64" height="31" rx="10" fill="url(#clayCream)" />
        <rect x="55" y="49" width="21" height="20" rx="6" fill="url(#clayAmber)" />
        <rect x="80" y="47" width="25" height="22" rx="7" fill="url(#claySky)" />
        <rect x="55" y="89" width="25" height="20" rx="7" fill="url(#clayTeal)" />
        <rect x="84" y="87" width="21" height="22" rx="6" fill="url(#clayAmber)" />
        <ellipse cx="62" cy="44" rx="22" ry="11" fill="url(#clayGloss)" opacity="0.45" />
      </g>
    </svg>
  ),

  // Hanging store sign with a chunky wayfinding arrow.
  "In Store Signage": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="38" y="24" width="84" height="11" rx="5.5" fill="url(#claySky)" />
        <rect x="59" y="33" width="7" height="16" rx="3.5" fill="url(#clayCream)" />
        <rect x="94" y="33" width="7" height="16" rx="3.5" fill="url(#clayCream)" />
        <rect x="38" y="46" width="84" height="68" rx="20" fill="url(#clayBlue)" />
        <circle cx="80" cy="80" r="23" fill="url(#clayCream)" />
        <path d="M69 80 h17" fill="none" stroke="url(#clayAmber)" strokeWidth="8" strokeLinecap="round" />
        <path d="M80 70 l11 10 -11 10" fill="none" stroke="url(#clayAmber)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="60" cy="58" rx="22" ry="11" fill="url(#clayGloss)" opacity="0.4" />
      </g>
    </svg>
  ),

  // Isometric 3D parcel (clay cube) with an amber shipping label.
  "Product Packaging": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)" strokeLinejoin="round" strokeLinecap="round">
        <path d="M44 60 L80 81 L80 119 L44 98 Z" fill="#E9D2A4" stroke="#E9D2A4" strokeWidth="11" />
        <path d="M116 60 L80 81 L80 119 L116 98 Z" fill="#DCC393" stroke="#DCC393" strokeWidth="11" />
        <path d="M80 41 L116 60 L80 81 L44 60 Z" fill="#FBEFD3" stroke="#FBEFD3" strokeWidth="11" />
        <path d="M90 86 L104 79 L104 95 L90 102 Z" fill="url(#clayAmber)" />
        <ellipse cx="70" cy="56" rx="15" ry="7" fill="url(#clayGloss)" opacity="0.55" />
      </g>
    </svg>
  ),

  // Billboard panel with imagery + headline on twin posts.
  "Billboards": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="52" y="84" width="10" height="46" rx="5" fill="url(#claySky)" />
        <rect x="98" y="84" width="10" height="46" rx="5" fill="url(#claySky)" />
        <rect x="26" y="30" width="108" height="64" rx="18" fill="url(#clayBlue)" />
        <rect x="36" y="40" width="42" height="44" rx="11" fill="url(#clayCream)" />
        <circle cx="50" cy="54" r="7" fill="url(#clayAmber)" />
        <path d="M38 82 l11 -13 7 8 9 -11 13 16 z" fill="url(#clayTeal)" />
        <rect x="86" y="44" width="40" height="9" rx="4.5" fill="url(#clayAmber)" />
        <rect x="86" y="59" width="40" height="7" rx="3.5" fill="url(#claySky)" />
        <rect x="86" y="71" width="28" height="7" rx="3.5" fill="url(#claySky)" />
        <ellipse cx="56" cy="42" rx="24" ry="11" fill="url(#clayGloss)" opacity="0.42" />
      </g>
    </svg>
  ),

  // Phone with a big amber like-heart.
  "Social Media Advertising": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="49" y="20" width="62" height="120" rx="21" fill="url(#clayBlue)" />
        <rect x="57" y="30" width="46" height="100" rx="15" fill="url(#clayCream)" />
        <path d="M80 110 C71 95 57 93 57 79 C57 69 66 64 73 69 C77 72 80 77 80 77 C80 77 83 72 87 69 C94 64 103 69 103 79 C103 93 89 95 80 110 Z" fill="url(#clayAmber)" />
        <ellipse cx="71" cy="44" rx="14" ry="8" fill="url(#clayGloss)" opacity="0.5" />
      </g>
    </svg>
  ),

  // Television with a play button and broadcast waves.
  "Broadcast Advertising": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <path d="M95 39 a17 17 0 0 1 26 0" fill="none" stroke="url(#clayAmber)" strokeWidth="7" strokeLinecap="round" />
        <path d="M86 30 a30 30 0 0 1 44 0" fill="none" stroke="url(#claySky)" strokeWidth="7" strokeLinecap="round" />
        <rect x="26" y="48" width="100" height="70" rx="20" fill="url(#clayBlue)" />
        <rect x="36" y="58" width="80" height="50" rx="13" fill="url(#clayCream)" />
        <circle cx="76" cy="83" r="16" fill="url(#clayAmber)" />
        <path d="M71 75 l14 8 -14 8 z" fill="#fff" />
        <rect x="48" y="116" width="11" height="16" rx="5" fill="url(#claySky)" />
        <rect x="93" y="116" width="11" height="16" rx="5" fill="url(#claySky)" />
        <ellipse cx="52" cy="60" rx="22" ry="10" fill="url(#clayGloss)" opacity="0.4" />
      </g>
    </svg>
  ),

  // Newspaper front page: masthead, hero image, columns.
  "Print Media": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="48" y="32" width="68" height="98" rx="15" fill="url(#claySky)" transform="rotate(6 82 80)" />
        <rect x="42" y="28" width="72" height="100" rx="17" fill="url(#clayCream)" />
        <rect x="52" y="38" width="52" height="14" rx="6" fill="url(#clayBlue)" />
        <rect x="52" y="58" width="34" height="28" rx="9" fill="url(#clayAmber)" />
        <rect x="92" y="60" width="14" height="6" rx="3" fill="url(#claySky)" />
        <rect x="92" y="70" width="14" height="5" rx="2.5" fill="url(#claySky)" />
        <rect x="92" y="79" width="12" height="5" rx="2.5" fill="url(#claySky)" />
        <rect x="52" y="94" width="54" height="6" rx="3" fill="url(#claySky)" />
        <rect x="52" y="105" width="54" height="6" rx="3" fill="url(#claySky)" />
        <rect x="52" y="116" width="38" height="6" rx="3" fill="url(#claySky)" />
        <ellipse cx="60" cy="40" rx="20" ry="9" fill="url(#clayGloss)" opacity="0.45" />
      </g>
    </svg>
  ),

  // Trade-show booth: scalloped awning, branded wall, screen, counter.
  "Trade Show Booths": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="40" y="56" width="80" height="60" rx="14" fill="url(#clayCream)" />
        <rect x="48" y="66" width="38" height="28" rx="9" fill="url(#claySky)" />
        <circle cx="100" cy="80" r="11" fill="url(#clayAmber)" />
        <rect x="32" y="98" width="96" height="28" rx="13" fill="url(#clayBlue)" />
        <rect x="30" y="40" width="100" height="16" rx="8" fill="url(#clayAmber)" />
        <path d="M30 56 a10 10 0 0 0 20 0 z" fill="url(#clayCream)" />
        <path d="M50 56 a10 10 0 0 0 20 0 z" fill="url(#clayAmber)" />
        <path d="M70 56 a10 10 0 0 0 20 0 z" fill="url(#clayCream)" />
        <path d="M90 56 a10 10 0 0 0 20 0 z" fill="url(#clayAmber)" />
        <path d="M110 56 a10 10 0 0 0 20 0 z" fill="url(#clayCream)" />
        <ellipse cx="56" cy="46" rx="22" ry="7" fill="url(#clayGloss)" opacity="0.4" />
      </g>
    </svg>
  ),

  // Support booklet / manual with a cover image and amber bookmark.
  "Support Material": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <rect x="44" y="36" width="60" height="86" rx="14" fill="url(#claySky)" transform="rotate(-8 74 79)" />
        <rect x="50" y="34" width="62" height="88" rx="16" fill="url(#clayCream)" />
        <rect x="58" y="44" width="46" height="30" rx="10" fill="url(#clayBlue)" />
        <circle cx="70" cy="59" r="7" fill="url(#clayAmber)" />
        <rect x="58" y="84" width="46" height="6" rx="3" fill="url(#claySky)" />
        <rect x="58" y="95" width="46" height="6" rx="3" fill="url(#claySky)" />
        <rect x="58" y="106" width="30" height="6" rx="3" fill="url(#claySky)" />
        <path d="M91 34 h15 v27 l-7.5 -6 -7.5 6 z" fill="url(#clayAmber)" />
        <ellipse cx="66" cy="44" rx="18" ry="9" fill="url(#clayGloss)" opacity="0.4" />
      </g>
    </svg>
  ),

  // Puffy sparkle burst for custom / other solutions.
  "& More Custom Solutions": (
    <svg viewBox="0 0 160 160" aria-hidden="true">
      <g filter="url(#claySh)">
        <path d="M80 28 C86 63 97 74 132 80 C97 86 86 97 80 132 C74 97 63 86 28 80 C63 74 74 63 80 28 Z" fill="url(#clayAmber)" />
        <path d="M118 44 C120 57 123 60 136 62 C123 64 120 67 118 80 C116 67 113 64 100 62 C113 60 116 57 118 44 Z" fill="url(#claySky)" />
        <path d="M44 102 C45 110 47 112 55 113 C47 114 45 116 44 124 C43 116 41 114 33 113 C41 112 43 110 44 102 Z" fill="url(#clayTeal)" />
        <ellipse cx="68" cy="62" rx="16" ry="10" fill="url(#clayGloss)" opacity="0.5" />
      </g>
    </svg>
  ),
};

// Idle: a clay smartphone with a QR code on screen.
const TP_IDLE = (
  <svg viewBox="0 0 160 160" aria-hidden="true">
    <g filter="url(#claySh)">
      <rect x="48" y="16" width="64" height="128" rx="21" fill="url(#clayBlue)" />
      <rect x="56" y="27" width="48" height="106" rx="15" fill="url(#clayCream)" />
      <g>
        <rect x="63" y="54" width="13" height="13" rx="4" fill="url(#claySky)" />
        <rect x="66.5" y="57.5" width="6" height="6" rx="2" fill="url(#clayCream)" />
        <rect x="84" y="54" width="13" height="13" rx="4" fill="url(#claySky)" />
        <rect x="87.5" y="57.5" width="6" height="6" rx="2" fill="url(#clayCream)" />
        <rect x="63" y="75" width="13" height="13" rx="4" fill="url(#claySky)" />
        <rect x="66.5" y="78.5" width="6" height="6" rx="2" fill="url(#clayCream)" />
      </g>
      <g fill="url(#claySky)">
        <rect x="80" y="54" width="5" height="5" rx="1.5" />
        <rect x="80" y="62" width="5" height="5" rx="1.5" />
        <rect x="92" y="75" width="5" height="5" rx="1.5" />
      </g>
      <g fill="url(#clayAmber)">
        <rect x="84" y="75" width="5" height="5" rx="1.5" />
        <rect x="84" y="83" width="5" height="5" rx="1.5" />
        <rect x="92" y="83" width="5" height="5" rx="1.5" />
        <rect x="80" y="83" width="5" height="5" rx="1.5" />
      </g>
      <rect x="62" y="100" width="36" height="6" rx="3" fill="url(#clayAmber)" />
      <ellipse cx="68" cy="36" rx="14" ry="8" fill="url(#clayGloss)" opacity="0.5" />
    </g>
  </svg>
);

// Static stylesheet — rendered inline so the hidden base state applies
// on first paint (avoids a frozen 1→0 transition in throttled tabs).
const TP_CSS = `
  .ts-tp {
    position: relative; width: 100%; max-width: 460px; margin: 0 auto; height: 100%;
    background: #fff; border: 1px solid #E6E8F7; border-radius: 20px; padding: 22px;
    box-shadow: 0 18px 44px -22px rgba(28,34,80,0.34);
    display: flex; flex-direction: column; box-sizing: border-box;
  }
  .ts-tp-stage {
    position: relative; width: 100%; flex: 1; min-height: 240px;
    background: #fff; border-radius: 14px; overflow: hidden;
  }
  .ts-tp-layer {
    position: absolute; inset: 0; display: grid; place-items: center;
    opacity: 0; visibility: hidden; transform: scale(0.92) translateY(8px);
    transition: opacity 360ms cubic-bezier(0.2,0.8,0.2,1), transform 360ms cubic-bezier(0.2,0.8,0.2,1), visibility 0s linear 360ms;
  }
  .ts-tp-layer.show {
    opacity: 1; visibility: visible; transform: none;
    transition: opacity 360ms cubic-bezier(0.2,0.8,0.2,1), transform 360ms cubic-bezier(0.2,0.8,0.2,1), visibility 0s;
  }
  .ts-tp-layer svg { width: 72%; height: 72%; display: block; overflow: visible; }
  @media (prefers-reduced-motion: reduce) {
    .ts-tp-layer { transition: opacity 120ms linear, visibility 0s linear 120ms; transform: none; }
    .ts-tp-layer.show { transition: opacity 120ms linear, visibility 0s; transform: none; }
  }
`;

function TSTouchpointViz({ active }) {
  const labels = Object.keys(TP_ICONS);
  const isIdle = !active || !TP_ICONS[active];

  return (
    <div className="ts-tp" role="img"
         aria-label={isIdle ? "Touchpoint illustration — hover a tag to preview it." : (active + " illustration.")}>
      <style>{TP_CSS}</style>
      {TP_DEFS}
      <div className="ts-tp-stage">
        <div className={"ts-tp-layer" + (isIdle ? " show" : "")}>{TP_IDLE}</div>
        {labels.map((label) =>
          <div key={label} className={"ts-tp-layer" + (active === label ? " show" : "")}>
            {TP_ICONS[label]}
          </div>
        )}
      </div>
    </div>
  );
}

window.TSTouchpointViz = TSTouchpointViz;
