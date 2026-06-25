# AgentVault — Remix Deploy Guide (3-minute sprint per chain)

You need to deploy `AgentVault.sol` on every testnet you want to support. The
addresses go into `.env.local` so the dashboard knows where to send signed txs.

## Steps (do this for each chain)

1. Open https://remix.ethereum.org
2. Create a new file `AgentVault.sol` and paste the contents of this folder's
   `AgentVault.sol` into it.
3. Compiler tab: select **0.8.24**, EVM version **default**, optimization on,
   runs 200. Hit **Compile**.
4. Deploy & Run tab:
   - Environment: **Injected Provider — MetaMask**
   - Switch MetaMask to the target testnet (see chain list below).
   - Account: any funded testnet account.
   - Contract: `AgentVault`.
   - Click **Deploy**. Approve the MetaMask tx.
5. Copy the deployed contract address.

## Where to paste the address

In `.env.local` at the project root:

```
NEXT_PUBLIC_VAULT_SEPOLIA=0x...
NEXT_PUBLIC_VAULT_BASE_SEPOLIA=0x...
NEXT_PUBLIC_VAULT_BSC_TESTNET=0x...
NEXT_PUBLIC_VAULT_MORPH_HOLESKY=0x...
```

Restart the dev server (`npm run dev`) so Next.js picks up the env vars.

## Chain quick-reference

| Chain            | ID       | Faucet                                              |
|------------------|----------|-----------------------------------------------------|
| Ethereum Sepolia | 11155111 | https://sepoliafaucet.com                           |
| Base Sepolia     | 84532    | https://www.alchemy.com/faucets/base-sepolia        |
| BNB Testnet      | 97       | https://testnet.bnbchain.org/faucet-smart           |
| Morph Holesky    | 2810     | https://bridge-holesky.morphl2.io/                  |

## USDC test tokens

To trade with USDC you also need testnet USDC in your wallet:

- **Sepolia USDC** — `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
  faucet: https://faucet.circle.com (choose Ethereum Sepolia)
- **Base Sepolia USDC** — `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
  faucet: https://faucet.circle.com (choose Base Sepolia)
- **BSC Testnet USDC** — `0x64544969ed7EBf5f083679233325356EbE738930`
  (mint via the BscScan write-contract tab, or use the BNB testnet faucet)
- **Morph Holesky USDC** — no canonical address; USDC trades disabled there.

## How signatures actually work end-to-end

Every dashboard action triggers a vault tx:

| Dashboard action     | Vault call                                        |
|----------------------|---------------------------------------------------|
| Deploy Agent         | `deploy(asset, amount, riskBps, maxDdBps)`        |
| Open Trade           | `openTrade(symbol, side, size, entry, sl, tp)`    |
| Close Trade          | `closeTrade(id, exitPrice, pnl, reason)`          |
| Pause Perception     | `pause()`                                         |
| Resume Perception    | `resume()`                                        |
| Terminate Agent      | `terminate()` (closes all open trades + refunds)  |
| Withdraw (post-term) | `withdraw()`                                      |

ERC20 path (USDC): the dashboard first triggers an `approve(vault, amount)` tx
on the USDC contract, then `deploy(...)`. That's two MetaMask popups for the
first deploy on each chain. Native ETH path: one popup.

## Verifying (optional, after demo)

For credit/judging, verify on the relevant explorer (Etherscan/BscScan):

1. Go to the deployed contract page.
2. Contract → Verify and Publish → Single file, Solidity 0.8.24, MIT.
3. Paste the source. No constructor args (the contract has none).
