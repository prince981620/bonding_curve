use anchor_lang::prelude::*;
use crate::state::Global;
use crate::GLOBAL;

#[derive(Accounts)]
pub struct UnPauseContract<'info> {
    #[account(
        mut,
        seeds = [GLOBAL], 
        bump=global.bump
    )]
    pub global: Account<'info, Global>,
    #[account(
        mut,
        address = global.authority,
    )]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> UnPauseContract<'info> {
    pub fn unpause_contract(
        &mut self,
    ) -> Result<()> {

        self.global.paused = false;
        Ok(())
    }
}