use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("JTX5uXTiZ1M3hJkjv5Cp5F8dr3Jc7nhJbQjCFmgEYA7");

/// JTX Fundraiser Vault Program — astroknots.space
///
/// Collects SOL contributions toward a 5,874 SOL goal for Raydium pool
/// creation. Contributors earn OPTX reward credits at phased multiplier
/// rates (Phase 1: 2x = 200 OPTX/SOL, Phase 2: 1x = 100 OPTX/SOL).
///
/// If the goal is not reached by the deadline, contributors can reclaim
/// their SOL via the refund instruction. Once the goal is reached, the
/// authority can withdraw SOL to fund Raydium pool creation.
///
/// Deploy (devnet):  anchor build && anchor deploy --provider.cluster devnet
/// Deploy (mainnet): anchor build && anchor deploy --provider.cluster mainnet
/// RPC (mainnet): Use Helius — set ANCHOR_PROVIDER_URL=https://mainnet.helius-rpc.com/?api-key=<YOUR_HELIUS_KEY>
/// RPC (devnet):  https://devnet.helius-rpc.com/?api-key=<YOUR_HELIUS_KEY>

/* ─── Constants ─── */

/// Fundraiser target: 5,874 SOL in lamports
pub const SOL_GOAL: u64 = 5_874 * 1_000_000_000; // LAMPORTS_PER_SOL = 1e9

/// Phase 1 multiplier: 200 OPTX per SOL (2x rate)
pub const PHASE_1_MULTIPLIER: u64 = 200;

/// Phase 2 multiplier: 100 OPTX per SOL (1x rate)
pub const PHASE_2_MULTIPLIER: u64 = 100;

/// OPTX token decimals (6 decimals → 1 OPTX = 1_000_000 base units)
pub const OPTX_DECIMALS: u64 = 1_000_000;

/// Minimum contribution: 0.01 SOL
pub const MIN_CONTRIBUTION: u64 = 10_000_000; // 0.01 SOL

/// Maximum contribution per wallet: 500 SOL (whale protection)
pub const MAX_CONTRIBUTION: u64 = 500 * 1_000_000_000;

#[program]
pub mod jtx_vault {
    use super::*;

    /// Initialize the vault with fundraiser configuration.
    ///
    /// Creates a vault PDA that holds SOL contributions. The vault account
    /// itself acts as the SOL escrow — lamports are held directly on the
    /// vault PDA via system_program::transfer.
    ///
    /// # Arguments
    /// * `phase1_end` - Unix timestamp when Phase 1 (2x multiplier) ends
    /// * `phase2_end` - Unix timestamp when Phase 2 (1x multiplier) ends / fundraiser deadline
    /// * `refund_enabled` - Whether refunds are enabled from the start
    pub fn initialize(
        ctx: Context<Initialize>,
        phase1_end: i64,
        phase2_end: i64,
        refund_enabled: bool,
    ) -> Result<()> {
        let clock = Clock::get()?;

        // Phase boundaries must be in the future and ordered correctly
        require!(
            phase1_end > clock.unix_timestamp,
            VaultError::InvalidPhaseTimestamp
        );
        require!(
            phase2_end > phase1_end,
            VaultError::InvalidPhaseTimestamp
        );

        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.sol_goal = SOL_GOAL;
        vault.total_raised = 0;
        vault.total_contributors = 0;
        vault.phase1_end = phase1_end;
        vault.phase2_end = phase2_end;
        vault.phase1_multiplier = PHASE_1_MULTIPLIER;
        vault.phase2_multiplier = PHASE_2_MULTIPLIER;
        vault.refund_enabled = refund_enabled;
        vault.pool_launched = false;
        vault.vault_closed = false;
        vault.bump = ctx.bumps.vault;

        msg!(
            "JTX Vault initialized. Authority: {}. Goal: {} SOL. Phase1 end: {}. Phase2 end: {}.",
            vault.authority,
            vault.sol_goal / 1_000_000_000,
            vault.phase1_end,
            vault.phase2_end
        );

        Ok(())
    }

    /// Contribute SOL to the vault.
    ///
    /// Transfers SOL from the contributor's wallet into the vault PDA.
    /// Records the contribution in a per-contributor PDA account and
    /// calculates OPTX rewards based on the current phase multiplier.
    ///
    /// Seeds for contributor PDA: ["contributor", vault_pubkey, wallet_pubkey]
    ///
    /// # Arguments
    /// * `amount` - SOL amount to contribute in lamports
    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let clock = Clock::get()?;

        // Vault must be active (not closed, not past deadline)
        require!(!vault.vault_closed, VaultError::VaultClosed);
        require!(!vault.pool_launched, VaultError::PoolAlreadyLaunched);
        require!(
            clock.unix_timestamp <= vault.phase2_end,
            VaultError::FundraiserEnded
        );

        // Enforce contribution bounds
        require!(amount >= MIN_CONTRIBUTION, VaultError::ContributionTooSmall);

        let contributor = &ctx.accounts.contributor;
        let new_total = contributor
            .total_deposited
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;
        require!(new_total <= MAX_CONTRIBUTION, VaultError::ContributionTooLarge);

        // Determine phase and multiplier
        let (phase, multiplier) = if clock.unix_timestamp <= vault.phase1_end {
            (1u8, vault.phase1_multiplier)
        } else {
            (2u8, vault.phase2_multiplier)
        };

        // Calculate OPTX reward for this contribution:
        // optx_earned = (amount_in_lamports / LAMPORTS_PER_SOL) * multiplier * OPTX_DECIMALS
        // Reordered to avoid truncation: (amount * multiplier * OPTX_DECIMALS) / LAMPORTS_PER_SOL
        let optx_earned = amount
            .checked_mul(multiplier)
            .ok_or(VaultError::Overflow)?
            .checked_mul(OPTX_DECIMALS)
            .ok_or(VaultError::Overflow)?
            .checked_div(1_000_000_000) // LAMPORTS_PER_SOL
            .ok_or(VaultError::Overflow)?;

        // Transfer SOL from contributor to vault PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update contributor record
        let contributor = &mut ctx.accounts.contributor;
        let is_new = contributor.total_deposited == 0;
        contributor.wallet = ctx.accounts.payer.key();
        contributor.vault = ctx.accounts.vault.key();
        contributor.total_deposited = new_total;
        contributor.optx_earned = contributor
            .optx_earned
            .checked_add(optx_earned)
            .ok_or(VaultError::Overflow)?;
        contributor.last_contribution = clock.unix_timestamp;
        contributor.contribution_count = contributor
            .contribution_count
            .checked_add(1)
            .ok_or(VaultError::Overflow)?;
        contributor.refunded = false;

        // Update vault totals
        let vault = &mut ctx.accounts.vault;
        vault.total_raised = vault
            .total_raised
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;
        if is_new {
            vault.total_contributors = vault
                .total_contributors
                .checked_add(1)
                .ok_or(VaultError::Overflow)?;
        }

        msg!(
            "Contribution: {} lamports from {}. Phase {}. OPTX earned: {}. Total raised: {}.",
            amount,
            ctx.accounts.payer.key(),
            phase,
            optx_earned,
            vault.total_raised
        );

        // Emit contribution event
        emit!(ContributionEvent {
            contributor: ctx.accounts.payer.key(),
            vault: vault.key(),
            amount,
            phase,
            optx_earned,
            total_deposited: new_total,
            total_raised: vault.total_raised,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Refund SOL to a contributor.
    ///
    /// If the fundraiser goal is not reached by the deadline (phase2_end),
    /// any contributor can reclaim their full SOL deposit. The refund is
    /// sent from the vault PDA back to the contributor's wallet.
    ///
    /// Refund is allowed when:
    /// 1. `refund_enabled` is true, OR
    /// 2. The fundraiser deadline has passed AND the goal was not met
    ///
    /// The pool must not have been launched (funds already withdrawn).
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        let contributor = &ctx.accounts.contributor;
        let clock = Clock::get()?;

        // Cannot refund after pool launch (funds already sent to Raydium)
        require!(!vault.pool_launched, VaultError::PoolAlreadyLaunched);

        // Check refund eligibility
        let deadline_passed = clock.unix_timestamp > vault.phase2_end;
        let goal_not_met = vault.total_raised < vault.sol_goal;
        let admin_enabled = vault.refund_enabled;

        require!(
            admin_enabled || (deadline_passed && goal_not_met),
            VaultError::RefundNotAvailable
        );

        // Cannot double-refund
        require!(!contributor.refunded, VaultError::AlreadyRefunded);

        let refund_amount = contributor.total_deposited;
        require!(refund_amount > 0, VaultError::NothingToRefund);

        // Transfer SOL back from vault PDA to contributor
        // Using vault PDA as signer with seeds
        let vault_key = vault.key();
        let bump = vault.bump;
        let seeds: &[&[u8]] = &[b"jtx_vault", vault_key.as_ref(), &[bump]];

        // For PDA-held lamports, we debit the vault directly
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .vault
            .to_account_info()
            .lamports()
            .checked_sub(refund_amount)
            .ok_or(VaultError::InsufficientFunds)?;

        **ctx.accounts.payer.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .payer
            .to_account_info()
            .lamports()
            .checked_add(refund_amount)
            .ok_or(VaultError::Overflow)?;

        // Mark contributor as refunded (replay protection)
        let contributor = &mut ctx.accounts.contributor;
        contributor.refunded = true;

        // Decrease vault totals
        let vault = &mut ctx.accounts.vault;
        vault.total_raised = vault
            .total_raised
            .checked_sub(refund_amount)
            .ok_or(VaultError::Overflow)?;

        msg!(
            "Refund: {} lamports to {}. Remaining: {}.",
            refund_amount,
            ctx.accounts.payer.key(),
            vault.total_raised
        );

        emit!(RefundEvent {
            contributor: ctx.accounts.payer.key(),
            vault: vault.key(),
            amount: refund_amount,
            timestamp: clock.unix_timestamp,
        });

        // Suppress unused variable warning — seeds kept for documentation
        // of the PDA derivation path used in lamport manipulation above.
        let _ = seeds;

        Ok(())
    }

    /// Withdraw vault SOL to fund Raydium pool creation.
    ///
    /// Admin-only instruction. Only callable when:
    /// 1. Total raised >= SOL goal (5,874 SOL)
    /// 2. Pool has not already been launched
    /// 3. Vault is not closed
    ///
    /// Sends all collected SOL to a designated pool funding wallet.
    pub fn launch_pool(ctx: Context<LaunchPool>) -> Result<()> {
        let vault = &ctx.accounts.vault;

        require!(!vault.pool_launched, VaultError::PoolAlreadyLaunched);
        require!(!vault.vault_closed, VaultError::VaultClosed);
        require!(
            vault.total_raised >= vault.sol_goal,
            VaultError::GoalNotReached
        );

        let withdraw_amount = vault.total_raised;

        // Transfer all SOL from vault PDA to pool funding wallet
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? = ctx
            .accounts
            .vault
            .to_account_info()
            .lamports()
            .checked_sub(withdraw_amount)
            .ok_or(VaultError::InsufficientFunds)?;

        **ctx
            .accounts
            .pool_wallet
            .to_account_info()
            .try_borrow_mut_lamports()? = ctx
            .accounts
            .pool_wallet
            .to_account_info()
            .lamports()
            .checked_add(withdraw_amount)
            .ok_or(VaultError::Overflow)?;

        // Mark pool as launched (prevents further contributions and refunds)
        let vault = &mut ctx.accounts.vault;
        vault.pool_launched = true;

        let clock = Clock::get()?;

        msg!(
            "Pool launched! {} lamports withdrawn to {}. Total contributors: {}.",
            withdraw_amount,
            ctx.accounts.pool_wallet.key(),
            vault.total_contributors
        );

        emit!(PoolLaunchEvent {
            vault: vault.key(),
            pool_wallet: ctx.accounts.pool_wallet.key(),
            total_raised: withdraw_amount,
            total_contributors: vault.total_contributors,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Close the vault and reclaim rent.
    ///
    /// Admin-only cleanup instruction. Only callable after the pool has
    /// been launched. Closes the vault PDA and returns rent-exempt SOL
    /// to the authority.
    pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.pool_launched, VaultError::PoolNotLaunched);
        require!(!vault.vault_closed, VaultError::VaultClosed);

        vault.vault_closed = true;

        msg!(
            "Vault closed by authority {}.",
            ctx.accounts.authority.key()
        );

        Ok(())
    }

    /// Admin toggle: enable or disable refunds.
    ///
    /// Allows the authority to manually enable refunds (e.g., if the
    /// fundraiser is cancelled early) or disable them.
    pub fn set_refund_enabled(ctx: Context<AdminAction>, enabled: bool) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.refund_enabled = enabled;

        msg!("Refund enabled set to: {}.", enabled);
        Ok(())
    }
}

/* ─── Account Contexts ─── */

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + VaultConfig::INIT_SPACE,
        seeds = [b"jtx_vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(
        mut,
        seeds = [b"jtx_vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, VaultConfig>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + Contributor::INIT_SPACE,
        seeds = [b"contributor", vault.key().as_ref(), payer.key().as_ref()],
        bump
    )]
    pub contributor: Account<'info, Contributor>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(
        mut,
        seeds = [b"jtx_vault", vault.authority.as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, VaultConfig>,

    #[account(
        mut,
        seeds = [b"contributor", vault.key().as_ref(), payer.key().as_ref()],
        bump,
        has_one = wallet @ VaultError::UnauthorizedRefund,
    )]
    pub contributor: Account<'info, Contributor>,

    /// CHECK: The original contributor wallet — validated via contributor.wallet == payer.key()
    /// and the PDA seeds which bind this account to the contributor record.
    #[account(mut, constraint = payer.key() == contributor.wallet @ VaultError::UnauthorizedRefund)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LaunchPool<'info> {
    #[account(
        mut,
        seeds = [b"jtx_vault", vault.authority.as_ref()],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized
    )]
    pub vault: Account<'info, VaultConfig>,

    pub authority: Signer<'info>,

    /// CHECK: Destination wallet for Raydium pool funding. Validated by
    /// admin intent — the authority signs this transaction knowingly.
    #[account(mut)]
    pub pool_wallet: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(
        mut,
        seeds = [b"jtx_vault", vault.authority.as_ref()],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized,
        close = authority
    )]
    pub vault: Account<'info, VaultConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        mut,
        seeds = [b"jtx_vault", vault.authority.as_ref()],
        bump = vault.bump,
        has_one = authority @ VaultError::Unauthorized
    )]
    pub vault: Account<'info, VaultConfig>,

    pub authority: Signer<'info>,
}

/* ─── State Accounts ─── */

/// Global vault configuration — one per fundraiser.
///
/// PDA seeds: ["jtx_vault", authority_pubkey]
#[account]
#[derive(InitSpace)]
pub struct VaultConfig {
    /// Admin authority (can launch pool, close vault, toggle refunds)
    pub authority: Pubkey,
    /// SOL fundraiser goal in lamports (5,874 SOL)
    pub sol_goal: u64,
    /// Total SOL raised in lamports
    pub total_raised: u64,
    /// Number of unique contributors
    pub total_contributors: u64,
    /// Unix timestamp: end of Phase 1 (2x multiplier)
    pub phase1_end: i64,
    /// Unix timestamp: end of Phase 2 / fundraiser deadline
    pub phase2_end: i64,
    /// OPTX per SOL in Phase 1 (200 = 2x)
    pub phase1_multiplier: u64,
    /// OPTX per SOL in Phase 2 (100 = 1x)
    pub phase2_multiplier: u64,
    /// Whether refunds are currently enabled
    pub refund_enabled: bool,
    /// Whether pool has been launched (funds withdrawn)
    pub pool_launched: bool,
    /// Whether vault has been closed
    pub vault_closed: bool,
    /// PDA bump seed
    pub bump: u8,
}

/// Per-contributor record tracking deposits and OPTX rewards.
///
/// PDA seeds: ["contributor", vault_pubkey, wallet_pubkey]
#[account]
#[derive(InitSpace)]
pub struct Contributor {
    /// Contributor's wallet pubkey
    pub wallet: Pubkey,
    /// Vault this contribution belongs to
    pub vault: Pubkey,
    /// Total SOL deposited in lamports (cumulative across contributions)
    pub total_deposited: u64,
    /// Total OPTX earned in base units (6 decimals)
    pub optx_earned: u64,
    /// Number of individual contributions
    pub contribution_count: u32,
    /// Unix timestamp of last contribution
    pub last_contribution: i64,
    /// Whether this contributor has been refunded
    pub refunded: bool,
}

/* ─── Events ─── */

#[event]
pub struct ContributionEvent {
    pub contributor: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub phase: u8,
    pub optx_earned: u64,
    pub total_deposited: u64,
    pub total_raised: u64,
    pub timestamp: i64,
}

#[event]
pub struct RefundEvent {
    pub contributor: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PoolLaunchEvent {
    pub vault: Pubkey,
    pub pool_wallet: Pubkey,
    pub total_raised: u64,
    pub total_contributors: u64,
    pub timestamp: i64,
}

/* ─── Errors ─── */

#[error_code]
pub enum VaultError {
    #[msg("Phase timestamps must be in the future and Phase 2 must end after Phase 1")]
    InvalidPhaseTimestamp,
    #[msg("Fundraiser has ended — no more contributions accepted")]
    FundraiserEnded,
    #[msg("Contribution below minimum (0.01 SOL)")]
    ContributionTooSmall,
    #[msg("Contribution would exceed maximum per-wallet limit (500 SOL)")]
    ContributionTooLarge,
    #[msg("Refund not available — goal may have been met or deadline not passed")]
    RefundNotAvailable,
    #[msg("Contributor has already been refunded")]
    AlreadyRefunded,
    #[msg("Nothing to refund — zero deposit")]
    NothingToRefund,
    #[msg("Unauthorized — only the vault authority can perform this action")]
    Unauthorized,
    #[msg("Refund wallet does not match contributor record")]
    UnauthorizedRefund,
    #[msg("Pool has already been launched")]
    PoolAlreadyLaunched,
    #[msg("Pool has not been launched yet")]
    PoolNotLaunched,
    #[msg("SOL goal has not been reached")]
    GoalNotReached,
    #[msg("Vault is closed")]
    VaultClosed,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
    #[msg("Arithmetic overflow")]
    Overflow,
}
