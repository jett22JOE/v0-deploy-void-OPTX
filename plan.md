# JTX Community Vault v2 — Implementation Plan

**Owner**: JOE (autonomous agent, ERC-8004)
**Jetson Path**: ~/joe-core/plan.md
**Created**: 2026-02-19
**Status**: ACTIVE — Phase 1 Fundraising

---

## Mission

Deploy the JTX Community Vault as a fully on-chain Anchor program that:
- Accepts **SOL from humans** + **x402 USDC from AI agents**
- Tracks OPTX multiplier eligibility per donor PDA
- Auto-launches Raydium CPMM pool when goal is hit
- Charges agents for acquiring real human users for JETT gaze auth DePIN
- JOE operates autonomously 24/7 from Jetson Orin Nano

**Unlock Condition**: Vault goes PUBLIC when DePIN JETT auth (gaze vector gestures in DOJO) works correctly and OPTX goes live on mainnet.

---

## Timeline (4 Weeks)

### Week 0 — NOW (Feb 19, 2026)
- [x] Clone poof vault UI into Next.js (vault.jettoptics.ai)
- [x] GeckoTerminal JTX/SOL chart embed
- [x] Two-phase fundraising UI (Phase 1: 2x OPTX, Phase 2: 1x)
- [x] Mission Leaders + Mission Log (empty state)
- [x] Contribute SOL form with preset amounts
- [x] Share on X after donation (OPTX recruitment)
- [x] Admin terminal (founder wallet gated)
- [x] Dark/light mode toggle
- [x] Sticky footer with social links + UTC clock
- [ ] Devnet notice modal (vault is in development)
- [ ] Security audit (Alchemy-grade checklist)
- [ ] Deploy to Vercel (vault.jettoptics.ai)

### Week 1 (Feb 24 - Mar 2)
**Anchor Program: `jett_vault`**
- [ ] Scaffold program in JTX-CSTB.TRUST.DEPIN repo
- [ ] Define accounts: VaultConfig, Donor, AgentAcquisition, AgentLedger
- [ ] Implement `initialize_vault` (founder only)
- [ ] Implement `donate_sol` (permissionless, OPTX multiplier tracking)
- [ ] Implement `donate_usdc_agent` (agent x402 flow)
- [ ] Implement `link_attestation` (CPI to existing trust protocol)
- [ ] Deploy to devnet, run LiteSVM tests

### Week 2 (Mar 3 - Mar 9)
**Raydium + Oracle Integration**
- [ ] Implement `check_and_launch` (CPI Pyth oracle + Raydium CPMM)
- [ ] Implement `trigger_refunds` + `claim_refund`
- [ ] Implement `update_phase` (Phase 1→2 at timestamp)
- [ ] Implement `set_paused` + `close_vault`
- [ ] x402 agent payment route on JOE WS server (jettoptx.dev/x402)
- [ ] Pyth SOL/USD price feed integration
- [ ] Conway Terminal agent API endpoints

### Week 3 (Mar 10 - Mar 16)
**Frontend + Agent Economy**
- [ ] Dual currency toggle (SOL / USDC) on vault form
- [ ] Agent acquisition card ("Recruit users for JETT DePIN")
- [ ] Attestation status badge per donor
- [ ] Agent leaderboard (top agents by users acquired)
- [ ] Real-time vault state via WebSocket from Jetson
- [ ] Conway Terminal (jettoptx.dev) status dashboard
- [ ] Wire donate button to actual program instruction

### Week 4 (Mar 17 - Mar 23)
**Audit + Mainnet Prep**
- [ ] Full security audit (overflow, reentrancy, PDA validation)
- [ ] Semgrep + Bandit scan on backend
- [ ] Anchor verify + deterministic builds
- [ ] Mainnet deployment (founder signs initialize_vault)
- [ ] JOE autonomous cron loop (5-min intervals)
- [ ] Remove devnet notice modal
- [ ] OPTX airdrop portal prep (Q1 2027)

---

## Smart Contract Architecture

### Program: `jett_vault`
**Framework**: Anchor 0.30.1, Solana 1.18+

### PDAs
| PDA | Seeds | Purpose |
|-----|-------|---------|
| `vault_config` | `["vault_config"]` | Global singleton — goal, raised, phase, status |
| `donor` | `["donor", donor_pubkey]` | Per human/agent — contributions, multiplier, attested |
| `agent_acquisition` | `["agent_acq", agent, user]` | Links agent payment to acquired human |
| `agent_ledger` | `["agent_ledger", agent]` | Aggregates agent USDC + users acquired |

### Instructions (11)
| # | Instruction | Signer | Purpose |
|---|------------|--------|---------|
| 1 | `initialize_vault` | Founder | Create vault, set goal, phase deadlines |
| 2 | `donate_sol` | Permissionless | Humans send SOL, get OPTX multiplier |
| 3 | `donate_usdc_agent` | Agent wallet | Agents pay USDC for user acquisition |
| 4 | `link_attestation` | JOE | Cross-program verify gaze attestation |
| 5 | `check_and_launch` | JOE | CPI Pyth oracle + Raydium CPMM pool |
| 6 | `trigger_refunds` | JOE | If deadline passed & goal not met |
| 7 | `claim_refund` | Permissionless | Humans claim proportional SOL refund |
| 8 | `update_phase` | JOE | Phase 1→2 transition at timestamp |
| 9 | `set_paused` | Founder | Emergency pause |
| 10 | `close_vault` | JOE | Post-deadline cleanup |
| 11 | `migrate_from_legacy` | Founder | Transfer from existing vault PDA |

### JOE Autonomous Operations (Jetson Cron)
Every 5 minutes JOE checks:
1. Clock vs phase deadlines → `update_phase`
2. `raised_sol >= goal` → `check_and_launch`
3. Deadline passed + !launched → `trigger_refunds`
4. New donors with attestation → `link_attestation`
5. Log to SpacetimeDB via HEDGEHOG MCP

### x402 Agent Payment Flow
```
Agent → HTTP 402 → JOE x402 handler (jettoptx.dev/x402)
  → Agent sends USDC to JOE wallet
  → JOE verifies on-chain
  → JOE prepares donate_usdc_agent instruction
  → Creates agent_acquisition PDA
  → Updates agent_ledger + VaultConfig.raised_usdc
  → No refund (service fee for acquiring human users)
```

### Integration with JTX-CSTB Trust Protocol
- Existing program: `79nQsecDspUWxvAMyJvK36EUty4yEoP5ssLvHZuNiugF`
- `link_attestation` CPI reads Attestation PDA from trust protocol
- Attested donors (gaze-verified humans) get bonus OPTX multiplier
- OPTX minting via existing `mint_optx` instruction

---

## Key Addresses
| Asset | Address |
|-------|---------|
| JTX Mint | `9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj` |
| JOE Wallet | `EFvgELE1Hb4PC5tbPTAe8v1uEDGee8nwYBMCU42bZRGk` |
| Founder Wallet | `FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H` |
| Existing Vault PDA | `3XZViWWRXEpQPkF3R1CBHuxqvuYgDW5fWPvbVHkCgGqq` |
| Trust Program | `79nQsecDspUWxvAMyJvK36EUty4yEoP5ssLvHZuNiugF` |
| CompuStable ID | `A9xMH53...` |

## Domains
| Domain | Purpose | Infra |
|--------|---------|-------|
| vault.jettoptics.ai | Public vault frontend | Vercel |
| jettoptics.ai | Main site | Vercel |
| jettoptx.dev | JOE agent API (x402, status) | Conway → Tailscale → Jetson |
| astro.knots.sol | SNS Web3 mask for vault | Solana Name Service |

## Fundraising Parameters
| Parameter | Value |
|-----------|-------|
| SOL Goal | 5,874 SOL |
| Dollar Goal | ~$781,242 (at $133/SOL) |
| JTX Target Price | $8.00 |
| JTX for Pool | 97,680 JTX |
| Phase 1 | Now → March 31 (2x OPTX) |
| Phase 2 | April 1 → June 30 (1x OPTX) |
| OPTX Airdrop | Q1 2027 |
| JettChat Beta | Q3 2026 |

---

**JOE: Execute this plan autonomously. Report progress to SpacetimeDB. Escalate only for founder-signed instructions.**
