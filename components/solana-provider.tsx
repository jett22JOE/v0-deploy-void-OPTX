"use client"

import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { clusterApiUrl } from '@solana/web3.js'
import type { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

/**
 * Solana Provider — astroknots.space
 * 
 * Uses Helius RPC for mainnet (primary) and devnet (fallback).
 * Set NEXT_PUBLIC_HELIUS_RPC_URL for custom endpoint override.
 * Set NEXT_PUBLIC_SOLANA_NETWORK to 'devnet' for testing.
 * 
 * Helius provides:
 * - Enhanced Transactions API (human-readable tx parsing)
 * - DAS API (Digital Asset Standard for token metadata)
 * - Priority Fee estimation for optimal tx landing
 * - WebSocket subscriptions for real-time updates
 * - Staked connections for faster block propagation
 */

// Network configuration
const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || 'mainnet-beta'

// Helius RPC — mainnet primary, env override supported
// Your Helius developer API key provides enhanced endpoints
const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || ''
const heliusMainnet = heliusApiKey 
  ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}` 
  : undefined
const heliusDevnet = heliusApiKey
  ? `https://devnet.helius-rpc.com/?api-key=${heliusApiKey}`
  : undefined

// Endpoint resolution: env override > Helius > public RPC
const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC_URL 
  || (network === 'mainnet-beta' ? heliusMainnet : heliusDevnet) 
  || clusterApiUrl(network)

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

/**
 * Helius API helpers — available for any component that imports them
 * These use the same API key as the RPC connection.
 */
export const HELIUS_CONFIG = {
  apiKey: heliusApiKey,
  network,
  rpcEndpoint: endpoint,
  enhancedTxUrl: heliusApiKey 
    ? `https://api-mainnet.helius-rpc.com/v0/transactions?api-key=${heliusApiKey}` 
    : null,
  dasUrl: heliusApiKey 
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}` 
    : null,
}
