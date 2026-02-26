# Prototipo Game Boy UI1/UI2

Prototipo offline em `Bun + Vite + JavaScript` com tela logica fixa `160x144`, mundo `16x16` e UI baseada em tiles `8x8`.

## Rodar

```bash
bun install
bun run dev
```

Abra:

- `http://localhost:5173/ui1.html`
- `http://localhost:5173/ui2.html`

Cada rota inicia estado limpo (refresh/reset por interface).

## Controles

- `Setas`: navega UI.
- `WASD`: move player no grid do mundo.
- `Z` ou `Enter`: botao A.
- `X` ou `Esc`: botao B.
- Touch/click:
- Botões na shell (D-pad + A/B).
- Clique na area do mundo para mover por direcao.
- UI2: tabs `MAP/BAG/MON` clicaveis na propria tela.

## Validacao

```bash
bun run test
bun run build
```

## Deploy (GitHub Pages)

1. Em `Settings > Pages`, selecione `Source: GitHub Actions`.
2. Faça push na `main` (ou rode manualmente o workflow `Deploy to GitHub Pages`).
3. O workflow faz `bun run build` e publica `dist/`.

Rotas publicadas:

- `https://the-protolab.github.io/vibimon-uiux/ui1.html`
- `https://the-protolab.github.io/vibimon-uiux/ui2.html`
