use anchor_lang::prelude::*;

#[event]
pub struct Initialized {
    pub authority: Pubkey,
    pub fee_recipient: Pubkey,
}

#[event]
pub struct ParamsSet {
    pub fee_recipient: Pubkey,
    pub initial_virtual_token_reserves: u64,
    pub initial_virtual_sol_reserves: u64,
    pub initial_real_token_reserves: u64,
    pub token_total_supply: u64,
    pub fee_basis_points: u64,
}

#[event]
pub struct TokenCreated {
    pub mint: Pubkey,
    pub bonding_curve: Pubkey,
    pub user: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[event]
pub struct TokenPurchased {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub sol_spent: u64,
    pub fee: u64,
}

#[event]
pub struct TokenSold {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub sol_received: u64,
    pub fee: u64,
}

#[event]
pub struct FundsWithdrawn {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub tokens_withdrawn: u64,
    pub sol_withdrawn: u64,
}

#[event]
pub struct BondingCurveCompleted {
    pub mint: Pubkey,
    pub user: Pubkey,
    pub tokens_withdrawn: u64,
    pub sol_withdrawn: u64,
}

