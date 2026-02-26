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

### UI1

- `Setas`/D-pad: por padrao controlam o player no mapa.
- `B` (`X`/`Esc`/`Backspace` ou botao B touch): alterna o foco das setas entre `MAP` e `ILHA` (BAG/MON).
- `A` (`Z`/`Enter` ou botao A touch): confirma acao.
- Clique/touch no canvas do mundo e no menu nao gera navegacao.
- `WASD` e atalhos numericos nao sao usados na UI1.

### UI2

- `Setas`/D-pad: navega UI (`hold` no D-pad repete direcao).
- `WASD`: move player no grid do mundo.
- `A`: `Z` ou `Enter`.
- `B`: `X` ou `Esc`.
- Mobile hardening (UI2):
- Zoom por gesto/double-tap bloqueado.
- App estatico sem scroll/overscroll.
- Sem selecao de texto nos controles touch.
- Controles em uma linha com cluster `A/B` diagonal (A na ponta direita).
- Touch/click:
- Botoes na shell (D-pad + A/B).
- Clique na area do mundo para mover por direcao.
- Tabs `MAP/BAG/MON` clicaveis na propria tela.

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
