// NIGHTWIRE netrunner-console — neon SVG charts (self-contained, no deps).
// Exports NeonAreaChart, NeonBars, NeonDonut, Sparkline to window.

function polyPoints(data, w, h, pad) {
  const max = Math.max(...data) * 1.15 || 1;
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  return data.map((v, i) => [pad + i * step, h - pad - ((v - min) / span) * (h - pad * 2)]);
}

function NeonAreaChart({ data = [], w = 560, h = 200, color = 'var(--cyan-500)', color2 = 'var(--magenta-500)', id = 'a' }) {
  const pad = 16;
  const pts = polyPoints(data, w, h, pad);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${line} ${w - pad},${h - pad} ${pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`stroke-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="rgba(137,155,180,.10)" strokeWidth="1" />
      ))}
      <polygon points={area} fill={`url(#fill-${id})`} />
      <polyline points={line} fill="none" stroke={`url(#stroke-${id})`} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,.5))' }} />
      {pts.map((p, i) => i === pts.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color2} style={{ filter: 'drop-shadow(0 0 6px var(--magenta-500))' }} />)}
    </svg>
  );
}

function NeonBars({ data = [], w = 560, h = 200, color = 'var(--magenta-500)' }) {
  const pad = 16;
  const max = Math.max(...data) * 1.1 || 1;
  const bw = (w - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - pad * 2);
        return <rect key={i} x={pad + i * bw + bw * 0.18} y={h - pad - bh} width={bw * 0.64} height={bh} fill={color} opacity={0.55 + 0.45 * (v / max)} rx="1" style={{ filter: 'drop-shadow(0 0 4px rgba(255,45,149,.5))' }} />;
      })}
    </svg>
  );
}

function NeonDonut({ segments = [], size = 150, thickness = 18 }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--void-500)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const el = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 4px ${s.color})` }} />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

function Sparkline({ data = [], w = 90, h = 28, color = 'var(--mint-500)' }) {
  const pts = polyPoints(data, w, h, 3).map((p) => p.join(',')).join(' ');
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

// Cyan wireframe diagram (ref #4 "safe/beta" boxes) — grid + random node graph.
function Wireframe({ w = 180, h = 120, color = 'var(--cyan-500)', seed = 1 }) {
  const rand = (n) => { let x = Math.sin(seed * 999 + n * 37) * 10000; return x - Math.floor(x); };
  const nodes = Array.from({ length: 7 }, (_, i) => [12 + rand(i) * (w - 24), 12 + rand(i + 20) * (h - 24)]);
  const edges = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [3, 6], [1, 5]];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
      <defs><pattern id={`wg${seed}`} width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0V14" fill="none" stroke="rgba(0,240,255,.10)" strokeWidth="1" /></pattern></defs>
      <rect x="0" y="0" width={w} height={h} fill={`url(#wg${seed})`} />
      {edges.map((e, i) => <line key={i} x1={nodes[e[0]][0]} y1={nodes[e[0]][1]} x2={nodes[e[1]][0]} y2={nodes[e[1]][1]} stroke={color} strokeWidth="1" opacity=".7" />)}
      {nodes.map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={i === 0 ? 4 : 2.5} fill={color} style={{ filter: 'drop-shadow(0 0 4px var(--cyan-500))' }} />)}
    </svg>
  );
}

Object.assign(window, { NeonAreaChart, NeonBars, NeonDonut, Sparkline, Wireframe });
