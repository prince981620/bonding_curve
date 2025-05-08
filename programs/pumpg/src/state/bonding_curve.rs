use anchor_lang::prelude::*;


#[account]
pub struct BondingCurve {
    pub mint: Pubkey,
    pub virtual_token_reserve: u64,
    pub virtual_sol_reserve: u64,
    pub real_token_reserve: u64,
    pub real_sol_reserve: u64,
    pub token_total_supply: u64,
    pub complete: bool,
    pub total_tokens_sold: u64,
    pub total_lamports_spent: u64,
    pub initializer: Pubkey,
    pub bump: u8,
    pub _padding: [u8; 7],
}

impl BondingCurve {
    pub const INIT_SPACE: usize = 8 + 8 + 8 + 8 + 8 + 1 + 8 + 8 + 32 + 1 + 7;
}
