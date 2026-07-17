Labelled text input, terminal-styled. Focus glows cyan; `error` turns it red.

```jsx
<TextField label="Handle" placeholder="ghost_in_the_wire" required />
<TextField label="Access key" type="password" error="Invalid credentials" />
```

Props: `label`, `required`, `leadingIcon`, `trailingIcon`, `error`, `hint`, `disabled`, plus native input attrs.
