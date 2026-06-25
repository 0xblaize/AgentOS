# AgentVault — Base Sepolia Deploy Guide (≈ 3 min)

v1 of Agent.OS ships with **Base Sepolia only**. Other testnets are commented
out in `src/lib/wagmi.ts` — uncomment if you want to bring them back later.

## Steps

1. Open https://remix.ethereum.org
2. Create `AgentVault.sol` and paste the contents of `contracts/AgentVault.sol`.
3. **Compiler tab** → Solidity **0.8.24**, EVM **default**, optimization on,
   runs 200 → **Compile**.
4. **Deploy & Run tab**:
   - Environment: **Injected Provider — MetaMask**.
   - Switch MetaMask to **Base Sepolia (chain id 84532)**. If not in your
     network list yet: https://chainlist.org/chain/84532 → Add to MetaMask.
   - Account: any funded Base Sepolia account.
   - Contract: `AgentVault`.
   - Click **Deploy**, approve the MetaMask tx.
5. Copy the deployed contract address.

## Paste the address in `.env.local`

At the project root:

```
NEXT_PUBLIC_VAULT_BASE_SEPOLIA=0x...
```

Restart the dev server (`npm run dev`) so Next.js picks up the env var.

## Faucets you'll need

- **Base Sepolia ETH (for gas)** — https://www.alchemy.com/faucets/base-sepolia
- **Base Sepolia USDC** — https://faucet.circle.com (pick Base Sepolia)
  - Token address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals)

## How signatures actually work end-to-end

Every dashboard action triggers a vault tx:

| Dashboard action     | Vault call                                        |
|----------------------|---------------------------------------------------|
| Deploy Agent (ETH)   | `deploy(0x0, amount, riskBps, maxDdBps)` (payable)|
| Deploy Agent (USDC)  | `approve(vault, amount)` then `deploy(...)`       |
| Open Trade           | `openTrade(symbol, side, size, entry, sl, tp)`    |
| Close Trade          | `closeTrade(id, exitPrice, pnl, reason)`          |
| Pause Perception     | `pause()`                                         |
| Resume Perception    | `resume()`                                        |
| Terminate Agent      | `terminate()` (closes all open trades + refunds)  |
| Withdraw (post-term) | `withdraw()`                                      |

ERC20 path is two popups on the first deploy; allowance is reused after that
until the user terminates and starts a new session.

## Optional: verify on BaseScan

For judging credit, after deploying:

1. Go to your contract page on https://sepolia.basescan.org
2. **Contract → Verify and Publish** → Single file, Solidity 0.8.24, MIT.
3. Paste the source from `contracts/AgentVault.sol`. No constructor args.
