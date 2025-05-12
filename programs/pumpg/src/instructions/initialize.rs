use anchor_lang::prelude::*;
use crate::constants::*;
use crate::state::Global;
use crate::events::Initialized;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Global::INIT_SPACE,
        seeds = [GLOBAL],
        bump,
    )]
    pub global: Account<'info, Global>,
    #[account(
        mut,
        address = ADMIN
    )]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize_global(&mut self, bump: &InitializeBumps) -> Result<()> {
        self.global.set_inner(Global {
            initialized: true,
            authority: self.user.key(),
            fee_recipient: self.user.key(),
            initial_virtual_token_reserves: P * SCALE,
            initial_virtual_sol_reserves: R * LAMPORTS_PER_SOL,
            initial_real_token_reserves: BONDING_CURVE_SUPPLY,
            token_total_supply: TOTAL_SUPPLY,
            fee_basis_points: 100,
            bump: bump.global,
        });
        emit!(Initialized {
            authority: self.user.key(),
            fee_recipient: self.user.key(),
        });
        Ok(())
    }
}
