pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod events;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use events::*;
pub use utils::*;

declare_id!("3cNHnRg5bF6ahpkMfwzAV6tFtjeQWywt53M5cGaU3eA4");

#[program]
pub mod pumpg {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>,) -> Result<()> {
        ctx.accounts.initialize_global(
            &ctx.bumps,
        )
    }

    pub fn set_params(
        ctx: Context<SetParams>,
        fee_recipient: Option<Pubkey>,
        initial_virtual_token_reserves: Option<u64>,
        initial_virtual_sol_reserves: Option<u64>,
        initial_real_token_reserves: Option<u64>,
        token_total_supply: Option<u64>,
        fee_basis_points: Option<u64>,
    ) -> Result<()> {
        ctx.accounts.set_parameters(
            fee_recipient, 
            initial_virtual_token_reserves,
            initial_virtual_sol_reserves,
            initial_real_token_reserves,
            token_total_supply,
            fee_basis_points,
        )
    }

    pub fn create(ctx: Context<Create>,name: String, symbol: String, uri: String) -> Result<()> {
        ctx.accounts.create_token(
            name,
            symbol,
            uri,
            ctx.bumps.bonding_curve,
            ctx.bumps.vault
        )
    } 

    pub fn buy(ctx: Context<Buy>, amount: u64, max_sol_cost: u64) -> Result<()> {
        ctx.accounts.buy_tokens(amount, max_sol_cost)
    } 


    pub fn sell(ctx: Context<Sell>, amount: u64, min_sol_output: u64) -> Result<()> {
        ctx.accounts.sell_tokens(amount, min_sol_output)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        ctx.accounts.withdraw_funds()
    }


}
