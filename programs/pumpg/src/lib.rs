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

declare_id!("DADtiPM9Jgr53UWxVDUnA7WzBNFj5itGQ8ZamJpSnnGL");

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

    pub fn pause_contract(ctx: Context<PauseContract>) -> Result<()> {
        ctx.accounts.pause_contract()
    }

    pub fn unpause_contract(ctx: Context<UnPauseContract>) -> Result<()> {
        ctx.accounts.unpause_contract()
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

    // pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
    //     ctx.accounts.withdraw_funds()
    // }

    // pub fn transfer_and_wrap_sol(ctx: Context<TransferSol>) -> Result<()> {
    //     ctx.accounts.prepare_for_migration()
    // }

    // pub fn migrate(ctx: Context<CreateCpmmPool>) -> Result<()> {
    //     ctx.accounts.create_cpmm_pool()
    // }

    // pub fn migrate_sega(ctx: Context<InitialiseSegaPool>) -> Result<()> {
    //     ctx.accounts.create_sega_pool()
    // }

}
