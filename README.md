# Helicopters Radar SP — Frontend

Aplicação React que exibe helicópteros em tempo real sobre São Paulo num mapa Leaflet, com trilha de posições, histórico por data e detecção de pousos em helipontos.

---

## Fluxo de dados

```
GET /aircrafts (a cada 5 s)
        │
        ▼
useAircrafts → Aircraft[]
        │
        ├──► AircraftMarker (Leaflet)
        │      ├─ posição animada via requestAnimationFrame lerp
        │      └─ ícone recriado apenas ao mudar heading ou tracking
        │
        ├──► useTrackPath
        │      ├─ ao selecionar ICAO: busca rota histórica do dia
        │      └─ a cada poll: appenda posição atual (cap 2 000 pts)
        │
        └──► useHelipads
               ├─ carrega public/helipads.json (uma vez)
               └─ detecta pousos: ≤ 350 m de raio, altitude < 300 m
```

---

## Hooks

| Hook | Frequência | Responsabilidade |
|---|---|---|
| `useAircrafts` | 5 s | Polling live; AbortController + timeout 8 s; expõe `error` |
| `useTracking` | — | Qual ICAO está sendo seguido no mapa (toggle por clique) |
| `useTrackPath` | por poll | Rota histórica na seleção + posições ao vivo no polling |
| `useHistoryRoute` | one-shot | Rota de um ICAO via "mostrar histórico" na sidebar |
| `useHelipads` | por poll | Carga de helipads.json + detecção de pousos por proximidade |
| `useTodayAircrafts` | 30 s | Lista de voos do dia para a sidebar |
| `useDateAircrafts` | one-shot | Voos de uma data escolhida no date picker |

---

## Animação de posição

`AircraftMarker` usa dois mecanismos paralelos para não conflitar com o react-leaflet:

- **Posição**: `stablePos.current` é passado como prop fixa ao `<Marker>` e nunca muda após o mount. O movimento acontece via `marker.setLatLng()` dentro de um loop `requestAnimationFrame` que interpola linearmente (`lerp`) entre a posição anterior e a nova ao longo dos 5 s do poll.
- **Heading / tracking**: o ícone é recriado via `marker.setIcon()` apenas quando `ac.track` ou `tracked` mudam — não a cada poll.

---

## Ícone SVG

`makeHelicopterIcon` retorna um `L.DivIcon` com SVG inline. O rotor principal gira via `<animateTransform>` SMIL, independente do `rotate()` CSS do wrapper `.ac-body` que representa o heading ADS-B. Vermelho = não seguido, azul = seguido (com anel pontilhado animado).

---

## Detecção de pousos (`useHelipads`)

A cada atualização de `aircrafts`, o hook verifica cada heliponto: se uma aeronave estiver a ≤ 350 m de distância e abaixo de 300 m de altitude, o contador `landings` é incrementado. Um `Map` em `landedRef` garante que cada aeronave é contada uma única vez por heliponto durante a sessão.

---

## Sidebar

Três abas gerenciadas em `HelicopterList`:

| Aba | Dados | Hook |
|---|---|---|
| Ao vivo | Aeronaves do poll atual | `aircrafts` prop |
| Histórico | Voos por data + export PDF | `useDateAircrafts` |
| Helipontos | Lista de helipontos + contadores de pouso | `helipads` prop |

O export PDF usa `jsPDF` + `jspdf-autotable`, chamando `GET /aircrafts/export?date=` antes de gerar o arquivo.

---

## Polylines

Rotas e trilhas são renderizadas com duas `<Polyline>` sobrepostas: uma preta espessa (sombra) e uma colorida fina, para garantir visibilidade sobre o mapa claro do OpenStreetMap.

---

## Conexão com a API

`src/config.ts` exporta `API_BASE = import.meta.env.VITE_API_URL ?? ''`. Em dev, o proxy do Vite (`vite.config.ts`) encaminha `/aircrafts` para `localhost:3000`, então o valor vazio funciona sem configuração. Em produção, defina `VITE_API_URL` com a origem do backend.

---

## Comandos

```bash
npm run dev        # Vite dev server em :5173
npm run build      # tsc + vite build
npm test           # vitest run (passagem única)
npm run test:watch # vitest em modo watch
npx vitest run src/__tests__/useAircrafts.test.ts  # arquivo específico
```

---

## Testes

Os testes evitam montar o mapa Leaflet (pesado em DOM). `AircraftMarker.test.tsx` testa o algoritmo de lerp e o comportamento do RAF diretamente. `useAircrafts.test.ts` usa `vi.useFakeTimers()` e fetch stubado para cobrir polling, cancelamento e estados de erro.
