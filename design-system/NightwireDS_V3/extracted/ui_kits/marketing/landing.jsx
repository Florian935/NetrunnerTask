// NIGHTWIRE marketing — landing page (V3: full terminal + CRT + glitch). Exports LandingPage.
const { Button, IconButton, Badge, Tag, Card, HudPanel, StatCard, ProgressBar, Input, Icon } = window.NightwireDesignSystem_f7f010;

function Nav() {
  const links = ['Product', 'Modules', 'Grid', 'Pricing', 'Docs'];
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 26, padding: '14px 40px', background: 'rgba(8,11,18,.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,45,149,.28)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grad-primary)', clipPath: 'var(--clip-bevel-sm)', color: '#fff' }}><Icon name="hexagon" size={17} /></span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '.04em', color: 'var(--frost-100)', textShadow: '1.5px 0 rgba(255,45,149,.6),-1.5px 0 rgba(0,240,255,.6)' }}>NIGHTWIRE</span>
      </div>
      <div style={{ display: 'flex', gap: 22, marginLeft: 18 }}>
        {links.map((l) => <a key={l} href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', textDecoration: 'none' }}>{l}</a>)}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Sign in</a>
        <Button variant="primary" size="sm">Jack in</Button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="nw-grid-bg nw-crt" style={{ position: 'relative', padding: '90px 40px 70px', textAlign: 'center', background: 'radial-gradient(120% 80% at 50% -10%,rgba(255,45,149,.16),transparent 55%),radial-gradient(90% 60% at 50% 120%,rgba(0,240,255,.12),transparent 60%)', overflow: 'hidden' }}>
      <div style={{ display: 'inline-flex', marginBottom: 22 }}><Badge tone="mint" glow>● SYSTEM ONLINE · v3.0</Badge></div>
      <h1 className="nw-glitch" style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: '.01em', maxWidth: 900, margin: '0 auto', fontWeight: 700 }}>BUILD FOR THE FUTURE</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 19, color: 'var(--text-secondary)', maxWidth: 560, margin: '20px auto 0', lineHeight: 1.5 }}>The neon-on-void interface system for netrunners. Ship dashboards, consoles and HUDs that look like they were pulled straight off the grid.</p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 30 }}>
        <Button variant="primary" size="lg" rightIcon={<Icon name="arrow-right" size={18} />}>Deploy now</Button>
        <Button variant="secondary" size="lg" hud leftIcon={<Icon name="play" size={16} />}>Watch demo</Button>
      </div>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 44, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '.06em' }}>
        {['NCPD', 'ARASAKA', 'MILITECH', 'KANG TAO', 'ZETATECH'].map((c) => <span key={c}>{c}</span>)}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: 'layout-dashboard', title: 'HUD Panels', accent: 'cyan', body: 'Beveled frames with glowing neon edges, hatch stripes and mono status readouts — the signature look, out of the box.' },
  { icon: 'zap', title: 'Instant Motion', accent: 'magenta', body: 'Snappy, mechanical transitions with pulsing glow on every active element. No bounce, no lag.' },
  { icon: 'shield', title: 'ICE-Grade Tokens', accent: 'mint', body: 'A full token system: neon palette, gradients, glows, CRT textures and type — themed and consistent across every surface.' },
];

function Features() {
  return (
    <section style={{ padding: '70px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.3em', color: 'var(--cyan-500)', textTransform: 'uppercase' }}>// Modules</div>
        <h2 style={{ fontSize: 38, color: 'var(--frost-100)', marginTop: 8 }}>Everything on the grid</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {FEATURES.map((f) => (
          <HudPanel key={f.title} variant="terminal" title={f.title} status="+++" accent={f.accent}>
            <span style={{ display: 'inline-flex', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', color: `var(--${f.accent}-500)`, background: `color-mix(in srgb, var(--${f.accent}-500) 12%, transparent)`, border: `1px solid color-mix(in srgb, var(--${f.accent}-500) 35%, transparent)`, marginBottom: 14, clipPath: 'var(--clip-bevel-sm)', boxShadow: `0 0 14px -4px var(--${f.accent}-500)` }}>
              <Icon name={f.icon} size={22} />
            </span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{f.body}</p>
          </HudPanel>
        ))}
      </div>
    </section>
  );
}

function StatBand() {
  return (
    <section style={{ padding: '10px 40px 60px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard label="Runners" value="128K" delta="+18%" icon="users" accent="cyan" />
        <StatCard label="Uptime" value="99.99%" delta="+0.1%" icon="activity" accent="mint" />
        <StatCard label="Modules" value="21" delta="+3" icon="boxes" accent="magenta" />
        <StatCard label="Nodes" value="2,048" delta="+96" icon="server" accent="violet" />
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section style={{ padding: '30px 40px 70px', maxWidth: 1120, margin: '0 auto' }}>
      <HudPanel variant="terminal" title="Live Console" status="24.06.99 · SECURE" accent="cyan" pulse>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.1em', marginBottom: 10 }}>&gt; THROUGHPUT · REQ/S</div>
            <svg viewBox="0 0 480 140" width="100%" preserveAspectRatio="none">
              <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cyan-500)" stopOpacity=".35"/><stop offset="100%" stopColor="var(--cyan-500)" stopOpacity="0"/></linearGradient></defs>
              <polygon points="0,110 48,90 96,98 144,64 192,74 240,44 288,52 336,28 384,36 432,16 480,22 480,140 0,140" fill="url(#mg)"/>
              <polyline points="0,110 48,90 96,98 144,64 192,74 240,44 288,52 336,28 384,36 432,16 480,22" fill="none" stroke="var(--cyan-500)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,.6))' }}/>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
            <ProgressBar value={72} label="CPU LOAD" showValue accent="magenta" />
            <ProgressBar value={54} label="ICE INTEGRITY" showValue accent="mint" />
            <ProgressBar value={88} label="BANDWIDTH" showValue accent="cyan" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Tag tone="cyan" icon="cpu">netrunner</Tag><Tag tone="magenta">#eddies</Tag><Tag tone="mint">encrypted</Tag></div>
          </div>
        </div>
      </HudPanel>
    </section>
  );
}

const PLANS = [
  { name: 'Street', price: '$0', tag: null, accent: 'cyan', feats: ['1 operator', 'Core components', 'Community grid', 'Lucide icons'], cta: 'Start free', variant: 'secondary' },
  { name: 'Runner', price: '$49', tag: 'POPULAR', accent: 'magenta', feats: ['Unlimited operators', 'All modules + HUD kit', 'Priority sync', 'Custom tokens', 'ICE support'], cta: 'Jack in', variant: 'primary' },
  { name: 'Corpo', price: 'Custom', tag: null, accent: 'violet', feats: ['SSO + audit log', 'On-prem grid', 'Dedicated node', 'SLA 99.99%'], cta: 'Contact', variant: 'secondary' },
];

function Pricing() {
  return (
    <section style={{ padding: '60px 40px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.3em', color: 'var(--magenta-500)', textTransform: 'uppercase' }}>// Access tiers</div>
        <h2 style={{ fontSize: 38, color: 'var(--frost-100)', marginTop: 8 }}>Pick your rig</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, alignItems: 'start' }}>
        {PLANS.map((p) => {
          const popular = p.name === 'Runner';
          return (
            <HudPanel key={p.name} variant="terminal" title={p.name} status={popular ? 'POPULAR' : '///'} accent={p.accent} pulse={popular} style={popular ? { transform: 'scale(1.03)' } : {}}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '4px 0 18px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 44, color: 'var(--frost-100)' }}>{p.price}</span>
                {p.price !== 'Custom' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>/mo</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {p.feats.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Icon name="check" size={15} color={`var(--${p.accent}-500)`} />{f}
                  </div>
                ))}
              </div>
              <Button variant={p.variant} style={{ width: '100%' }}>{p.cta}</Button>
            </HudPanel>
          );
        })}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ padding: '30px 40px 80px', maxWidth: 1120, margin: '0 auto' }}>
      <div className="nw-crt" style={{ position: 'relative', textAlign: 'center', padding: '56px 30px', background: 'var(--grad-surface)', border: '1px solid rgba(255,45,149,.4)', clipPath: 'var(--clip-bevel-md)', overflow: 'hidden' }}>
        <div className="nw-grid-bg" style={{ position: 'absolute', inset: 0, opacity: .5 }} />
        <div style={{ position: 'relative' }}>
          <h2 className="nw-glitch" style={{ fontSize: 44, fontWeight: 700 }}>READY TO BREACH?</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-secondary)', maxWidth: 460, margin: '14px auto 26px' }}>Jack into NIGHTWIRE and ship your first console tonight.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 420, margin: '0 auto' }}>
            <Input placeholder="operator@grid.net" icon="mail" style={{ flex: 1 }} />
            <Button variant="primary">Deploy</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = { Product: ['Components', 'HUD kit', 'Tokens', 'Changelog'], Grid: ['Status', 'Nodes', 'Security', 'API'], Company: ['About', 'Careers', 'Contact'] };
  return (
    <footer style={{ borderTop: '1px solid rgba(255,45,149,.22)', padding: '40px 40px 30px', background: 'var(--void-800)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 30 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '.04em', color: 'var(--frost-100)', textShadow: '1.5px 0 rgba(255,45,149,.6),-1.5px 0 rgba(0,240,255,.6)' }}>NIGHTWIRE</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 10, letterSpacing: '.06em', maxWidth: 220 }}>Neon-on-void interface system. Built for the future · NCPD/0023</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <IconButton name="github" variant="ghost" size="sm" /><IconButton name="twitter" variant="ghost" size="sm" /><IconButton name="rss" variant="ghost" size="sm" />
          </div>
        </div>
        {Object.entries(cols).map(([h, items]) => (
          <div key={h}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cyan-500)', marginBottom: 12 }}>// {h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {items.map((i) => <a key={i} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>{i}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1120, margin: '26px auto 0', paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.06em' }}>
        <span>© 2077 NIGHTWIRE SYSTEMS</span><span>NO LIMITS / NO RULES</span>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100%' }}>
      <Nav /><Hero /><Features /><StatBand /><Showcase /><Pricing /><CTA /><Footer />
    </div>
  );
}

window.LandingPage = LandingPage;
