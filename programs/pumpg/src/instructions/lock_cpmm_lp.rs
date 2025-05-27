// use anchor_lang::prelude::*;

// use anchor_spl::token::Mint;
// use raydium_locking_cpi::{cpi, program::RaydiumLiquidityLocking, states::LOCKED_LIQUIDITY_SEED};

// use raydium_cpmm_cpi::{
//     program::RaydiumCpmm,
//     states::{AmmConfig, OBSERVATION_SEED, POOL_LP_MINT_SEED, POOL_SEED, POOL_VAULT_SEED},
// };


// use crate::{DEFAULT_DECIMALS, LOCK_CPMM_AUTHORITY, WSOL_ID};

// #[derive(Accounts)]
// pub struct LockCpmmLiquidity<'info> {
//     pub cp_swap_program: Program<'info, RaydiumCpmm>,

//     pub lock_cpmm_program: Program<'info, RaydiumLiquidityLocking>,

//     #[account(mut)]
//     pub creator: Signer<'info>,

//     /// Which config does this pool belong to.
//     pub amm_config: Box<Account<'info, AmmConfig>>,

//     /// CHECK
//     #[account(address = LOCK_CPMM_AUTHORITY)]
//     pub authority: UncheckedAccount<'info>,

//     /// CHECK
//     pub liquidity_owner: UncheckedAccount<'info>,

//     /// CHECK
//     pub fee_nft_owner: UncheckedAccount<'info>,

//     #[account(mut)]
//     pub fee_nft_mint: Signer<'info>,

//     /// CHECK
//     pub fee_nft_account: UncheckedAccount<'info>,

//     /// CHECK: Initialize an account to store the pool state, init by cp-swap
//     #[account(
//         mut,
//         seeds = [
//             POOL_SEED.as_bytes(),
//             amm_config.key().as_ref(),
//             base_mint.key().as_ref(),
//             mint.key().as_ref(),
//         ],
//         seeds::program = cp_swap_program.key(),
//         bump,
//     )]
//     pub pool_state: UncheckedAccount<'info>,

//     #[account(
//         mint::decimals = DEFAULT_DECIMALS,
//         mint::token_program = token_program,
//     )]
//     pub mint: Account<'info, Mint>,

//     #[account(
//         mut,
//         address = WSOL_ID,
//         mint::decimals = 9,
//         mint::token_program = token_program,
//     )]
//     pub base_mint: Account<'info, Mint>,

//     ///CHECK
//     #[account(
//         mut,
//         seeds = [
//             LOCKED_LIQUIDITY_SEED.as_bytes(),
//             fee_nft_mint.key().as_ref(),
//         ],
//         seeds::program = cp_swap_program.key(),
//         bump,
//     )]
//     pub locked_liquidity: UncheckedAccount<'info>,

    


// }