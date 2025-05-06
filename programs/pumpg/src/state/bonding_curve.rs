use anchor_lang::prelude::*;


#[derive(InitSpace)]
#[account]
pub struct BondingCurve {
    pub virtual_token_reserve: u64,
    pub virtual_sol_reserve: u64,
    pub real_token_reserve: u64,
    pub real_sol_reserve: u64,
    pub token_total_supply: u64,
    pub complete: bool,
    pub total_tokens_sold: u64,
    pub total_lamports_spent: u64,
    pub bump: u8,
}

