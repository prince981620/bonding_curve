use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Token, Mint, TokenAccount},
};

use anchor_lang::declare_program;

declare_program!(sega_cp_swap);
use sega_cp_swap::{
    cpi,
    program::SegaCpSwap,
    accounts::AmmConfig
};

use crate::{errors::Errors, BondingCurve, Global, BONDING_CURVE, DEFAULT_DECIMALS, GLOBAL, OBSERVATION_SEED, POOL_LP_MINT_SEED, POOL_SEED, POOL_VAULT_SEED, WSOL_ID};


#[derive(Accounts)]
pub struct InitialiseSegaPool <'info> {
    pub cp_swap_program: Program <'info, SegaCpSwap>,

    #[account(
        mut,
        address = global.authority,
    )]
    pub authority: Signer<'info>, // creator

    #[account(
        mint::decimals = DEFAULT_DECIMALS,
        mint::token_program = token_program,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        address = WSOL_ID,
        mint::decimals = 9,
        mint::token_program = token_program,
    )]
    pub base_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = base_mint,
        associated_token::authority  = authority,
    )]
    pub creator_base_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = authority,
        token::token_program = token_program    
    )]
    pub creater_token_ata: Account<'info, TokenAccount>, // token ata

    pub amm_config: Box<Account<'info, AmmConfig>>,

    /// CHECK: pool vault and lp mint authority
    #[account(
        seeds = [
            raydium_cpmm_cpi::AUTH_SEED.as_bytes(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub radium_authority: UncheckedAccount<'info>,
    
    /// CHECK: Initialize an account to store the pool state, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_SEED.as_bytes(),
            amm_config.key().as_ref(),
            base_mint.key().as_ref(),
            mint.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub pool_state: UncheckedAccount<'info>,

    /// CHECK: pool lp mint, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_LP_MINT_SEED.as_bytes(),
            pool_state.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub lp_mint: UncheckedAccount<'info>,

    /// CHECK: creator lp ATA token account, init by cp-swap
    #[account(mut)]
    pub creator_lp_token: UncheckedAccount<'info>,

    /// CHECK: Token_0 vault for the pool, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            base_mint.key().as_ref()
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub token_0_vault: UncheckedAccount<'info>,
    
    /// CHECK: Token_1 vault for the pool, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            mint.key().as_ref()
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub token_1_vault: UncheckedAccount<'info>,

    #[account(
        mut,
        address= raydium_cpmm_cpi::create_pool_fee_reveiver::id(),
    )]
    pub create_pool_fee: Box<Account<'info, TokenAccount>>,

    /// CHECK: an account to store oracle observations, init by cp-swap
     #[account(
        mut,
        seeds = [
            OBSERVATION_SEED.as_bytes(),
            pool_state.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub observation_state: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [GLOBAL],
        bump = global.bump,
        has_one = authority,
    )]
    pub global: Account<'info, Global>,

    #[account(
        mut,
        seeds = [BONDING_CURVE, bonding_curve.mint.key().as_ref()],
        bump = bonding_curve.bump,
        has_one = mint,
        constraint = bonding_curve.complete @ Errors::BondingCurveNotComplete,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
    

}

impl <'info> InitialiseSegaPool <'info> {
    pub fn create_sega_pool(&mut self) -> Result<()> {
        let init_amount_0 = self.creator_base_ata.amount;
        let init_amount_1 = self.creater_token_ata.amount;
        let open_time = Clock::get()?.unix_timestamp as u64;

        let accounts = cpi::accounts::Initialize{
            creator: self.authority.to_account_info(),
            amm_config: self.amm_config.to_account_info(),
            authority: self.radium_authority.to_account_info(),
            pool_state: self.pool_state.to_account_info(),
            token_0_mint: self.base_mint.to_account_info(),
            token_1_mint: self.mint.to_account_info(),
            lp_mint: self.lp_mint.to_account_info(),
            creator_token_0: self.creator_base_ata.to_account_info(),
            creator_token_1: self.creater_token_ata.to_account_info(),
            creator_lp_token: self.creator_lp_token.to_account_info(),
            token_0_vault: self.token_0_vault.to_account_info(),
            token_1_vault: self.token_1_vault.to_account_info(),
            create_pool_fee: self.create_pool_fee.to_account_info(),
            observation_state: self.observation_state.to_account_info(),
            token_program: self.token_program.to_account_info(),
            token_0_program: self.token_program.to_account_info(),
            token_1_program: self.token_program.to_account_info(),
            associated_token_program: self.associated_token_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            self.cp_swap_program.to_account_info(),
            accounts,
        );

        cpi::initialize(cpi_context, init_amount_0, init_amount_1, open_time)
        
    }
    
}