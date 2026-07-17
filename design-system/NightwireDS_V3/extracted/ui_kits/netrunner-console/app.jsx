// NIGHTWIRE netrunner-console — app shell + screens (terminal/HUD lean).
const { Button, IconButton, Input, Select, Card, StatCard, HudPanel, Badge, Tag, Tabs, ProgressBar, Switch, Icon } = window.NightwireDesignSystem_f7f010;
const { NeonAreaChart, NeonBars, NeonDonut, Sparkline, Wireframe } = window;
const { useState } = React;

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'layout-dashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'activity' },
  { id: 'datastream', label: 'Datastream', icon: 'git-branch' },
  { id: 'ice', label: 'ICE', icon: 'shield' },
  { id: 'messages', label: 'Comms', icon: 'message-square' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

// Thin circuit-trace frame around the whole console (ref #4).
function CircuitFrame({ children }) {
  const node = (p) => <span style={{ position: 'absolute', width: 6, height: 6, background: 'var(--magenta-500)', boxShadow: '0 0 6px var(--magenta-500)', ...p }} />;
  const tick = (p) => <span style={{ position: 'absolute', background: 'rgba(255,45,149,.5)', ...p }} />;
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0, margin: 8, border: '1px solid rgba(255,45,149,.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {node({ top: -3, left: -3 })}{node({ top: -3, right: -3 })}{node({ bottom: -3, left: -3 })}{node({ bottom: -3, right: -3 })}
      {tick({ top: -1, left: '18%', width: 40, height: 2 })}{tick({ bottom: -1, right: '22%', width: 40, height: 2 })}
      {tick({ top: '30%', left: -1, width: 2, height: 30 })}{tick({ top: '55%', right: -1, width: 2, height: 30 })}
      {children}
    </div>
  );
}

function Wordmark({ small }) {
  return (
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: small ? 18 : 22, letterSpacing: '.04em', color: 'var(--frost-100)', textShadow: '2px 0 rgba(255,45,149,.7),-2px 0 rgba(0,240,255,.7)', lineHeight: 1 }}>
      NIGHTWIRE
    </div>
  );
}

function Sidebar({ active, onNav }) {
  return (
    <aside style={{ width: 214, flexShrink: 0, background: 'var(--void-800)', borderRight: '1px solid rgba(255,45,149,.28)', display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
      <div style={{ padding: '0 6px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grad-primary)', color: '#fff', clipPath: 'var(--clip-bevel-sm)' }}><Icon name="hexagon" size={17} /></span>
        <Wordmark small />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.28em', color: 'var(--text-muted)', padding: '0 6px 14px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>// NCPD/0023 · NODE 0x4F</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((n) => {
          const on = n.id === active;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase',
              color: on ? 'var(--magenta-400)' : 'var(--text-secondary)',
              background: on ? 'rgba(255,45,149,.10)' : 'transparent',
              borderLeft: on ? '2px solid var(--magenta-500)' : '2px solid transparent',
              boxShadow: on ? 'inset 0 0 20px -12px var(--magenta-500)' : 'none', position: 'relative',
            }}>
              <Icon name={n.icon} size={16} />{n.label}
              {on && <span style={{ marginLeft: 'auto', color: 'var(--magenta-500)', fontSize: 10 }}>◄</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <HudPanel variant="terminal" title="Deck" status="v3.0" accent="mint">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '.08em' }}>CHARGE · 78%</div>
          <ProgressBar value={78} accent="mint" height={5} />
        </HudPanel>
      </div>
    </aside>
  );
}

function TopBar({ onLogout }) {
  return (
    <header style={{ height: 54, flexShrink: 0, borderBottom: '1px solid rgba(255,45,149,.22)', background: 'var(--void-800)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mint-500)', letterSpacing: '.12em' }}>● LINK STABLE</span>
      <div style={{ flex: 1, maxWidth: 380, marginLeft: 8 }}>
        <Input placeholder="query the grid…" icon="terminal" />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>24.06.99</span>
        <div style={{ position: 'relative' }}>
          <IconButton name="bell" variant="ghost" />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 999, background: 'var(--magenta-500)', boxShadow: '0 0 6px var(--magenta-500)' }} />
        </div>
        <IconButton name="log-out" variant="ghost" title="Jack out" onClick={onLogout} />
        <span style={{ width: 32, height: 32, background: 'var(--grad-cyber)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, clipPath: 'var(--clip-bevel-sm)' }}>V</span>
      </div>
    </header>
  );
}

function LoginScreen({ onLogin }) {
  const [code, setCode] = useState('');
  return (
    <div className="nw-grid-bg nw-crt" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 90% at 50% 0,rgba(255,45,149,.12),#05060a 65%)' }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="nw-glitch" style={{ fontWeight: 700, fontSize: 40, letterSpacing: '.04em' }}>NIGHTWIRE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.3em', color: 'var(--magenta-500)', textTransform: 'uppercase', marginTop: 6 }}>Netrunner Console</div>
        </div>
        <HudPanel variant="terminal" title="Jack In" status="SECURE ██" accent="magenta" pulse>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '.1em' }}>> OPERATOR</div>
          <Input placeholder="V" icon="user" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '.1em' }}>> ACCESS CODE</div>
          <Input type="password" placeholder="••••••••" icon="key" value={code} onChange={(e) => setCode(e.target.value)} style={{ marginBottom: 18 }} />
          <Button variant="primary" onClick={onLogin} style={{ width: '100%' }} rightIcon={<Icon name="arrow-right" size={16} />}>Deploy</Button>
        </HudPanel>
        <div style={{ textAlign: 'center', marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '.1em' }}>NIGHT CITY GRID · 24.06.99 · NO LIMITS / NO RULES</div>
      </div>
    </div>
  );
}

const ORDERS = [
  { id: '#VX2891', item: 'Sandevistan MK.4', px: '$12,900', st: 'shipped', tone: 'mint' },
  { id: '#VX2884', item: 'Kiroshi Optics', px: '$3,400', st: 'pending', tone: 'amber' },
  { id: '#VX2877', item: 'Gorilla Arms', px: '$8,750', st: 'shipped', tone: 'mint' },
  { id: '#VX2871', item: 'Cyberdeck X-01', px: '$21,000', st: 'flagged', tone: 'red' },
  { id: '#VX2863', item: 'Berserk Mod', px: '$5,120', st: 'shipped', tone: 'mint' },
];

function DashboardScreen() {
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 22, letterSpacing: '.02em', color: 'var(--frost-100)' }}>Overview</h1>
        <Badge tone="magenta" glow>LIVE</Badge>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" leftIcon={<Icon name="calendar" size={14} />}>24h</Button>
          <Button variant="secondary" size="sm" hud leftIcon={<Icon name="download" size={14} />}>Export</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <StatCard label="Total revenue" value="$8.75M" delta="+12.5%" trend="up" icon="dollar-sign" accent="cyan" />
        <StatCard label="Active runners" value="24,512" delta="+4.2%" trend="up" icon="users" accent="magenta" />
        <StatCard label="New contracts" value="9,821" delta="+9.1%" trend="up" icon="file-text" accent="mint" />
        <StatCard label="Threat level" value="LOW" delta="-8.1%" trend="down" icon="shield" accent="violet" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 12 }}>
        <HudPanel variant="terminal" title="Traffic Overview" status="req · 24h" accent="cyan">
          <NeonAreaChart id="tr" data={[22, 30, 26, 40, 36, 52, 48, 60, 55, 72, 66, 84]} />
        </HudPanel>
        <HudPanel variant="terminal" title="Traffic Source" status="by channel" accent="magenta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <NeonDonut segments={[{ value: 44, color: 'var(--cyan-500)' }, { value: 30, color: 'var(--magenta-500)' }, { value: 16, color: 'var(--mint-500)' }, { value: 10, color: 'var(--violet-500)' }]} size={132} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--frost-100)' }}>12.5K</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.1em' }}>TOTAL</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              {[['Direct', '44%', 'var(--cyan-500)'], ['Grid', '30%', 'var(--magenta-500)'], ['Organic', '16%', 'var(--mint-500)'], ['Referral', '10%', 'var(--violet-500)']].map((r) => (
                <div key={r[0]} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', minWidth: 130 }}>
                  <span style={{ width: 8, height: 8, background: r[2] }} />{r[0]}<span style={{ marginLeft: 'auto', color: 'var(--text-primary)' }}>{r[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </HudPanel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 12 }}>
        <HudPanel variant="terminal" title="Recent Orders" status="cyberware mkt" accent="cyan">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '.1em' }}>
              <th style={{ padding: '6px 8px', fontWeight: 400 }}>ID</th><th style={{ padding: '6px 8px', fontWeight: 400 }}>Item</th><th style={{ padding: '6px 8px', fontWeight: 400 }}>Price</th><th style={{ padding: '6px 8px', fontWeight: 400 }}>Status</th>
            </tr></thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id} style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <td style={{ padding: '9px 8px', color: 'var(--cyan-400)' }}>{o.id}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--text-primary)' }}>{o.item}</td>
                  <td style={{ padding: '9px 8px' }}>{o.px}</td>
                  <td style={{ padding: '9px 8px' }}><Badge tone={o.tone}>{o.st}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </HudPanel>
        <HudPanel variant="terminal" title="System Status" status="realtime" accent="mint">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProgressBar value={38} label="SERVER LOAD" showValue accent="cyan" />
            <ProgressBar value={64} label="ICE INTEGRITY" showValue accent="mint" />
            <ProgressBar value={82} label="MEMORY" showValue accent="magenta" />
            <ProgressBar value={21} label="BANDWIDTH" showValue accent="violet" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '.06em' }}>AUTO-DEFEND</span>
              <Switch checked={true} onChange={() => {}} size="sm" />
            </div>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 style={{ fontSize: 22, color: 'var(--frost-100)' }}>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <HudPanel variant="terminal" title="Throughput" status="req/s" accent="cyan"><NeonAreaChart id="an1" data={[12, 18, 15, 28, 24, 33, 40, 38, 52, 60]} /></HudPanel>
        <HudPanel variant="terminal" title="Contracts Closed" status="per hour" accent="magenta"><NeonBars data={[8, 14, 10, 20, 16, 24, 30, 22, 28, 34, 26, 40]} /></HudPanel>
      </div>
      <HudPanel variant="terminal" title="Node Latency" status="ms · grid" accent="mint"><NeonAreaChart id="an2" color="var(--mint-500)" color2="var(--cyan-500)" data={[60, 40, 52, 30, 44, 22, 33, 18, 26, 14, 20, 12]} /></HudPanel>
    </div>
  );
}

const CONTRACTS = [
  { name: 'Corpse Alley', sub: '3 targets', tone: 'magenta' },
  { name: 'Sever the Link', sub: 'in progress', tone: 'cyan' },
  { name: 'Namo Thereni', sub: 'machine ghost', tone: 'cyan' },
  { name: 'Headers', sub: 'escort', tone: 'mint' },
  { name: 'Dog Inside', sub: 'malware breach', tone: 'magenta' },
  { name: 'Moongazed', sub: 'corpo intel', tone: 'violet' },
  { name: '321 Adexra ID', sub: 'phantom leak', tone: 'cyan' },
];

function TerminalScreen() {
  const [tab, setTab] = useState('decrypt');
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, color: 'var(--frost-100)' }}>Datastream</h1>
        <Badge tone="cyan">DECRYPTING</Badge>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '.1em' }}>SESSION 16::4/2</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 260px', gap: 12, alignItems: 'start' }}>

        <HudPanel variant="terminal" title="Contracts" status="ALL" accent="magenta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {CONTRACTS.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', background: i === 1 ? 'rgba(0,240,255,.08)' : 'transparent', borderLeft: i === 1 ? '2px solid var(--cyan-500)' : '2px solid transparent' }}>
                <span style={{ width: 7, height: 7, background: `var(--${c.tone}-500)`, boxShadow: `0 0 5px var(--${c.tone}-500)`, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: i === 1 ? 'var(--cyan-400)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </HudPanel>

        <HudPanel variant="terminal" title="Retire :: Detention" status="0x4F ++++" accent="cyan" pulse>
          <Tabs tabs={[{ value: 'decrypt', label: 'Decrypt' }, { value: 'archive', label: 'Archive' }, { value: 'trace', label: 'Trace' }]} value={tab} onChange={setTab} style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 12px' }}><span style={{ color: 'var(--cyan-400)' }}>&gt;</span> Safepointer boot sequence engaged. No handshake on the outer relay — routing through the cold node.</p>
            <p style={{ margin: '0 0 12px', color: 'var(--text-primary)' }}>Payload full, gain one bit to sync the deck. The last runner ran the ghost line; the trace decays in <span style={{ color: 'var(--magenta-400)' }}>94</span> cycles.</p>
            <p style={{ margin: '0 0 12px' }}>Decrypting the station core: <span style={{ color: 'var(--mint-500)' }}>OK</span> · fold the sigma keys to the firebridge and hold. Offer two vectors to the coprocessor before it locks.</p>
            <div style={{ background: 'var(--void-900)', border: '1px solid var(--border)', padding: '10px 12px', color: 'var(--mint-500)', fontSize: 11.5 }}>
              <div>0x00 &nbsp;init cold-node &nbsp;<span style={{ color: 'var(--text-muted)' }}>done</span></div>
              <div>0x01 &nbsp;spoof relay id &nbsp;<span style={{ color: 'var(--text-muted)' }}>done</span></div>
              <div>0x02 &nbsp;inject sigma &nbsp;<span style={{ color: 'var(--cyan-400)' }}>running…</span> <span style={{ color: 'var(--magenta-400)' }}>██▒▒</span></div>
            </div>
          </div>
        </HudPanel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <HudPanel variant="terminal" title="Plan Centre" status="RUN" accent="magenta">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <Button variant="secondary" size="sm" hud>Connect</Button>
              <Button variant="ghost" size="sm">Exit</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--mint-500)', letterSpacing: '.1em', marginBottom: 5 }}>SAFE</div><div style={{ border: '1px solid var(--border)' }}><Wireframe seed={2} h={92} /></div></div>
              <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--magenta-400)', letterSpacing: '.1em', marginBottom: 5 }}>BETA</div><div style={{ border: '1px solid var(--border)' }}><Wireframe seed={7} h={92} color="var(--magenta-500)" /></div></div>
            </div>
          </HudPanel>
          <HudPanel variant="terminal" title="Balance" status="NEG" accent="mint">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              <div><div style={{ color: 'var(--mint-500)' }}>€1,749</div><div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.1em' }}>EDDIES</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--magenta-400)' }}>€420</div><div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.1em' }}>DEBT</div></div>
            </div>
          </HudPanel>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ label, icon }) {
  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 22, color: 'var(--frost-100)', marginBottom: 14 }}>{label}</h1>
      <HudPanel variant="terminal" title={label} status="NO SIGNAL" accent="violet">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '30px 0', color: 'var(--text-muted)' }}>
          <Icon name={icon} size={40} color="var(--void-200)" />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em' }}>MODULE OFFLINE — reconnect to the grid.</div>
        </div>
      </HudPanel>
    </div>
  );
}

function ConsoleApp() {
  const [logged, setLogged] = useState(false);
  const [active, setActive] = useState('overview');
  if (!logged) return <LoginScreen onLogin={() => setLogged(true)} />;
  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--void-900)' }}>
      <Sidebar active={active} onNav={setActive} />
      <CircuitFrame>
        <TopBar onLogout={() => setLogged(false)} />
        <main className="nw-crt" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)' }}>
          {active === 'overview' && <DashboardScreen />}
          {active === 'analytics' && <AnalyticsScreen />}
          {active === 'datastream' && <TerminalScreen />}
          {active === 'ice' && <Placeholder label="ICE" icon="shield" />}
          {active === 'messages' && <Placeholder label="Comms" icon="message-square" />}
          {active === 'settings' && <Placeholder label="Settings" icon="settings" />}
        </main>
      </CircuitFrame>
    </div>
  );
}

window.ConsoleApp = ConsoleApp;
