The core task unit — a "contract" card (V2 style: chamfered glass + faction-colour neon halo) with difficulty pips, issuing faction, XP/credit/reputation rewards and a "hack réussi" completion action.

```jsx
<ContractCard
  code="NX-0042"
  title="Breach the Arasaka subnet"
  description="Slip past the ICE and pull the ledger before the sweep."
  difficulty={4}
  faction={{ name: 'Voidrunners', color: '#c657ff' }}
  urgent xp={120} credits={340} rep={15}
  status="active"
  onComplete={() => markDone()}
/>
```

Status: `available` · `active` (faction-colour halo) · `complete` (dimmed, "● HACKED") · `locked`.
