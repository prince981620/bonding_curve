use anchor_lang::prelude::*;
use crate::state::Global;
use crate::GLOBAL;

#[derive(Accounts)]
pub struct PauseContract<'info> {
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

impl<'info> PauseContract<'info> {
    pub fn pause_contract(
        &mut self,
    ) -> Result<()> {

        self.global.paused = true;
        Ok(())
    }
}