# Agent.OS

**Autonomous Trading Intelligence — a cinematic Web3 landing page + multi-chain paper-trading dashboard, on-chain from deploy to terminate.**

Built for the Bitget hackathon. Every agent action — deploy, open trade, close trade, pause, terminate — is a real signed transaction against a vault contract you deploy yourself across four EVM testnets.

---

## What this is

Two experiences glued together:

1. **The landing page** — a six-phase scroll-driven 3D film. A gold chrome mannequin assembles out of a glowing zigzag box, walks through doorways, sits at a desk, fuses with a trading rig. React Three Fiber + Drei + Framer Motion, sequenced against a sticky scroll container.
2. **The dashboard** (`/dashboard`) — institutional dark-mode trading cockpit: 3D agent viewport, reasoning terminal, lightweight-charts SMC view, positions ledger, config sidebar, emergency control strip. Backed by a mock engine that emits the exact WebSocket payload shapes a real backend would, so the panels are wire-ready.

A user's wallet signs every state change. The vault never moves funds anywhere except back to the depositor.

---

## Stack

| Layer        | Choice                                                   |
|--------------|----------------------------------------------------------|
| Framework    | Next.js 16 (App Router) + React 19                       |
| 3D           | React Three Fiber, Drei, Three.js                        |
| Motion       | Framer Motion, GSAP                                      |
| Charts       | lightweight-charts (TradingView)                         |
| Web3         | wagmi v3 + viem, WalletConnect v2, injected connectors   |
| Contract     | Solidity 0.8.24 (`contracts/AgentVault.sol`)             |
| Styling      | Tailwind CSS, Bebas Neue + DM Mono                       |
| State        | React Query, custom reducer (`useDashboardState`)        |

Supported testnets: **Ethereum Sepolia, Base Sepolia, BNB Testnet, Morph Holesky.**

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the landing page, or jump straight to http://localhost:3000/dashboard.

### Environment variables (`.env.local`)

```env
# WalletConnect — optional. Without it, injected-only (MetaMask / Rabby).
NEXT_PUBLIC_WC_PROJECT_ID=

# Vault addresses per chain — fill in after deploying AgentVault.sol.
# Leave at 0x000…000 to disable that chain's Deploy button.
NEXT_PUBLIC_VAULT_SEPOLIA=
NEXT_PUBLIC_VAULT_BASE_SEPOLIA=
NEXT_PUBLIC_VAULT_BSC_TESTNET=
NEXT_PUBLIC_VAULT_MORPH_HOLESKY=

# Optional RPC overrides (public defaults used otherwise).
NEXT_PUBLIC_SEPOLIA_RPC=
NEXT_PUBLIC_BASE_SEPOLIA_RPC=
NEXT_PUBLIC_BSC_TESTNET_RPC=
NEXT_PUBLIC_MORPH_HOLESKY_RPC=
```

### Deploying the vault

Full 3-minute Remix guide: [`contracts/DEPLOY.md`](contracts/DEPLOY.md). TL;DR — paste `AgentVault.sol` into Remix, compile with 0.8.24, deploy with MetaMask on each target chain, paste the resulting addresses into `.env.local`, restart `npm run dev`.

---

## Landing page — the six phases

`src/lib/phases.ts` defines the scroll script. Each phase is one viewport-height of scroll; the inner stage is sticky, so 3D state stays pinned while phase progress drives the model.

| #   | Phase       | What happens                                                                 |
|-----|-------------|------------------------------------------------------------------------------|
| 0   | `intro`     | Big AGENT.OS wordmark. Glowing zigzag box drifts in dark void.               |
| 1   | `morph`     | Box snaps to center, shatters, gold chrome mannequin assembles from shards.  |
| 2   | `data`      | Mannequin turns. Massive desktop / live candles materialize.                 |
| 3   | `shadows`   | Door blackout. Mannequin seated, obscured. Mood shift.                       |
| 4   | `fusion`    | Mannequin + chair + screens fuse. Reasoning terminal types live data feed.   |
| 5   | `cta`       | Single button: **Get Started →** routes to `/dashboard`.                     |

A persistent "Skip intro →" link in the corner bails straight to the dashboard. Scroll position is restored on return visits.

---

## Dashboard — the cockpit

```
┌──────────────────────────────────────────────────────────────────────┐
│  HeaderBar — brand · status · wallet + on-chain equity               │
├────────────────────────┬──────────────────────────┬──────────────────┤
│                        │  ReasoningTerminal       │                  │
│  AgentViewport (3D)    ├──────────────────────────┤  ConfigSidebar   │
│                        │  SMCChart (TV-style)     │  asset / risk    │
│                        │                          │  / max DD        │
├────────────────────────┴──────────────────────────┴──────────────────┤
│  PositionsLedger — open trades, PnL, SL/TP/Liq                       │
├──────────────────────────────────────────────────────────────────────┤
│  ControlStrip — Deploy · Pause · Resume · Close All · Terminate      │
└──────────────────────────────────────────────────────────────────────┘
```

Lifecycle (`useDashboardState`):

- **idle** — sidebar configurable, agent sits idle, no feeds.
- **active** — Deploy pressed, mock feeds running, agent typing, vault session open.
- **paused** — perception halts, existing trades stay open, PnL frozen.
- **terminated** — kill switch, feeds stop, vault refunds deposit.

The mock engine (`useMockEngine`) emits Vol.2-spec WebSocket payloads on `setInterval`, so swapping in a real Socket.io backend is a no-op for the panels.

---

## On-chain mapping

| Dashboard action       | Vault call                                          | Popups (USDC / ETH) |
|------------------------|-----------------------------------------------------|---------------------|
| Deploy Agent           | `deploy(asset, amount, riskBps, maxDdBps)`          | 2 / 1               |
| Open Trade             | `openTrade(symbol, side, size, entry, sl, tp)`      | 1 / 1               |
| Close Trade            | `closeTrade(id, exitPrice, pnl, reason)`            | 1 / 1               |
| Pause Perception       | `pause()`                                           | 1 / 1               |
| Resume Perception      | `resume()`                                          | 1 / 1               |
| Terminate Agent        | `terminate()` (closes all open trades + refunds)    | 1 / 1               |
| Withdraw (post-term)   | `withdraw()`                                        | 1 / 1               |

USDC needs `approve(vault, amount)` before the first deploy on each chain — that's the second popup. After that, single-tx flow.

The vault enforces:
- One active session per address.
- Owner cannot pull funds. Only the depositor can `terminate()` or `withdraw()`.
- Direct ETH sends are rejected — `deploy()` is the only entry point.
- Paper PnL is informational; the contract refunds the original deposit on terminate.

---

## Project layout

```
contracts/
  AgentVault.sol         Solidity 0.8.24 — session vault + trade ledger
  DEPLOY.md              Remix walkthrough for all four testnets
src/
  app/
    page.tsx             Landing page — scroll-driven phase orchestrator
    dashboard/page.tsx   Dashboard entry (Web3Provider + DashboardProvider)
    layout.tsx, globals.css
  components/
    PhaseStage.tsx, HeroBox.tsx, Mannequin.tsx, DoorTransition.tsx,
    Terminal.tsx, ThoughtCloud.tsx, ZigzagBox.tsx, Staircase.tsx, …
    dashboard/
      DashboardShell.tsx   4-row grid layout
      AgentViewport.tsx    3D cockpit canvas
      ReasoningTerminal.tsx, SMCChart.tsx, PositionsLedger.tsx,
      ConfigSidebar.tsx, ControlStrip.tsx, HeaderBar.tsx,
      TickerStream.tsx, WalletHub.tsx
  hooks/
    useAgentOS.ts          Scroll phase + persistence hooks
    dashboard/
      useDashboardState.ts Reducer + context (lifecycle, logs, positions)
      useMockEngine.ts     setInterval feed simulator (Vol.2 payloads)
      useVaultActions.ts   wagmi writes against AgentVault
      useWalletAssets.ts   live on-chain ETH + USDC balances
  lib/
    phases.ts              6-phase script
    wagmi.ts               Multi-chain config + per-chain asset registry
    vaultAbi.ts            AgentVault ABI
    journey.ts, clips.ts   Scroll-keyframe utilities
  providers/Web3Provider.tsx
```

---

## Design system

| Token        | Value                              |
|--------------|------------------------------------|
| Background   | `#000` / `surface-0`               |
| Accent       | `#c8ff00` (acid green)             |
| Gold (chrome)| `#c8920a`, `#d4a017`, `#f5c842`    |
| Danger       | `#ff3c3c`                          |
| Safe         | `#3cff88`                          |
| Display font | Bebas Neue                         |
| Mono font    | DM Mono                            |

---

## Scripts

```bash
npm run dev      # next dev — http://localhost:3000
npm run build    # production build
npm run start    # serve the built app
```

---

## Notes

- Dashboard is `dynamic({ ssr: false })` — `window.ethereum`, lightweight-charts, and R3F all need the browser.
- Morph Holesky has no canonical USDC yet, so USDC trades are disabled there until one ships.
- BSC testnet USDC uses 18 decimals on some faucets — verify with the faucet you use before depositing.
