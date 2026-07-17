Progress gauge for level, faction reputation and streaks. Glowing gradient fill, mono readout.

```jsx
<ProgressBar variant="xp" value={340} max={500} label="XP → LVL 13" />
<ProgressBar variant="rep" value={72} max={100} label="Voidrunners rep" />
<ProgressBar variant="streak" value={9} max={30} valueLabel="9-day streak" />
```

Variants: `xp` `rep` `credits` `streak` `level` `danger`. Sizes `sm` `md` `lg`.
