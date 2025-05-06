use anchor_lang::prelude::*;
use crate::errors::Errors;
use crate::state::Global;
use crate::events::ParamsSet;

#[derive(Accounts)]
pub struct SetParams<'info> {
    #[account(mut, seeds = [b"global"], bump=global.bump)]
    pub global: Account<'info, Global>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> SetParams<'info> {
    pub fn set_parameters(
        &mut self,
        fee_recipient: Pubkey,
        initial_virtual_token_reserves: u64,
        initial_virtual_sol_reserves: u64,
        initial_real_token_reserves: u64,
        token_total_supply: u64,
        fee_basis_points: u64,
    ) -> Result<()> {

        //  
        let global = &mut self.global;

        if *self.user.key != global.authority {
            return Err(Errors::NotAuthorized.into());
        }

        self.global.fee_recipient = fee_recipient;
        self.global.initial_virtual_token_reserves = initial_virtual_token_reserves;
        self.global.initial_virtual_sol_reserves = initial_virtual_sol_reserves;
        self.global.initial_real_token_reserves = initial_real_token_reserves;
        self.global.token_total_supply = token_total_supply;

        // global.set_inner(Global {
        //     initialized: global.initialized,
        //     authority: global.authority,
        //     fee_recipient,
        //     initial_virtual_token_reserves,
        //     initial_virtual_sol_reserves,
        //     initial_real_token_reserves,
        //     token_total_supply,
        //     fee_basis_points,

        // });

        emit!(ParamsSet {
            fee_recipient,
            initial_virtual_token_reserves,
            initial_virtual_sol_reserves,
            initial_real_token_reserves,
            token_total_supply,
            fee_basis_points,
        });
        Ok(())
    }
}