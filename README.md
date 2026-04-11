# urbanyellow

Portfolio photo — série *urbanyellow*, 24 images.
Stack : Node + Express + EJS + Tailwind (CDN) + GSAP + ScrollTrigger.

## Installation

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Modes d'affichage

- **Index** (par défaut) — masonry + lightbox.
- **Parcours** — 3 panels snap, grille 4×2, reveal façon Codrops grid-to-preview :
  hover sur une tuile → clip-path en croix qui se rétracte, les 8 tuiles
  fadent vers leurs coins, l'image native s'affiche en `object-contain`
  sur fond sombre du côté du curseur. Debounce 100 ms.

Le mode **Parcours** est désactivé sur mobile (< 768px) et avec
`prefers-reduced-motion: reduce` — Index est forcé.

## Raccourcis

- `G` → mode Index
- `P` → mode Parcours
- `←` `→` `Esc` dans la lightbox
