import { NextResponse } from "next/server"

const VAULT_PDA = "CQmBrff4a9MouY4eQTAPKXKprtvfHZDNSkNCQhRR38tP"
const VAULT_PROGRAM = "JTX5uXTiZ1M3hJkjv5Cp5F8dr3Jc7nhJbQjCFmgEYA7"
const FOUNDER_WALLET = "FEUwuvXbbSYTCEhhqgAt2viTsEnromNNDsapoFvyfy3H"

export async function GET() {
  return NextResponse.json({
    name: "JTX Community Vault",
    description: "Donate SOL to the JTX Community Vault. Donors receive JTX token entitlements at $8/JTX and OPTX rewards at mainnet launch.",
    vault_program: VAULT_PROGRAM,
    vault_pda: VAULT_PDA,
    founder_wallet: FOUNDER_WALLET,
    accepted_tokens: [
      {
        symbol: "SOL",
        method: "On-chain via donate_sol instruction",
        instruction: "donate_sol",
        min_amount: 0.01,
        conversion: "$8 USDC = 1 JTX entitlement"
      },
      {
        symbol: "JTX",
        method: "SPL Token-2022 transfer to founder wallet",
        mint: "9XpJiKEYzq5yDo5pJzRfjSRMPL2yPfDQXgiN7uYtBhUj",
        program: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
      }
    ],
    agent_integration: {
      x402: {
        description: "Include x-payment: x402 header with SOL payment proof",
        endpoint: "https://astroknots.space/api/donate",
        method: "POST"
      },
      mpp: {
        description: "Micropayment Protocol via Tempo CLI",
        command: "tempo send SOL --to CQmBrff4a9MouY4eQTAPKXKprtvfHZDNSkNCQhRR38tP --amount <SOL_AMOUNT>",
      },
      tempo_cli: {
        description: "Tempo CLI direct vault donation",
        command: "tempo donate --vault JTX5uXTiZ1M3hJkjv5Cp5F8dr3Jc7nhJbQjCFmgEYA7 --amount <SOL_AMOUNT>"
      }
    },
    rewards: {
      jtx_price_usdc: 8.00,
      sol_price_est_usdc: 133.00,
      optx_multiplier_default: "1.0x",
      optx_multiplier_referred: "1.5x",
      nft_receipt: "Minted after vault period, representing JTX + OPTX entitlement"
    },
    links: {
      vault_ui: "https://astroknots.space",
      docs: "https://astroknots.space/docs",
      status: "https://astroknots.space/status",
      solscan: "https://solscan.io/account/CQmBrff4a9MouY4eQTAPKXKprtvfHZDNSkNCQhRR38tP",
      twitter: "https://x.com/jettoptx"
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, wallet, memo } = body

    if (!amount || !wallet) {
      return NextResponse.json(
        { error: "Missing required fields: amount (SOL), wallet (base58 pubkey)" },
        { status: 400 }
      )
    }

    if (typeof amount !== "number" || amount < 0.01) {
      return NextResponse.json(
        { error: "Minimum donation is 0.01 SOL" },
        { status: 400 }
      )
    }

    const lamports = Math.round(amount * 1e9)
    const usdcValue = amount * 133
    const jtxEntitled = usdcValue / 8

    return NextResponse.json({
      status: "ready",
      transaction: {
        program_id: VAULT_PROGRAM,
        instruction: "donate_sol",
        accounts: [
          { name: "donor_signer", pubkey: wallet, is_signer: true, is_writable: true },
          { name: "donor_pda", pubkey: "DERIVE: seeds=['donor', donor_wallet]", is_signer: false, is_writable: true },
          { name: "vault_config", pubkey: VAULT_PDA, is_signer: false, is_writable: true },
          { name: "system_program", pubkey: "11111111111111111111111111111111", is_signer: false, is_writable: false },
        ],
        data: {
          instruction: "donate_sol",
          lamports: lamports,
          referrer: null
        }
      },
      estimate: {
        sol_amount: amount,
        usdc_value: `$${usdcValue.toFixed(2)}`,
        jtx_entitled: `${jtxEntitled.toFixed(4)} JTX`,
        optx_reward: `${jtxEntitled.toFixed(4)} OPTX (at mainnet launch)`,
        nft_receipt: "Minted after vault period"
      },
      memo: memo || null
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Send JSON: { amount: number, wallet: string, memo?: string }" },
      { status: 400 }
    )
  }
}
