use anchor_lang::{prelude::*,
    system_program::{transfer, Transfer}
};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked}
};

use crate::{bonding_curve, compute_s, errors::Errors, BondingCurve, FundsWithdrawn, Global, TokenSold, BONDING_CURVE, COMPLETION_LAMPORTS, CURVE_VAULT, GLOBAL, MIGRATION_FEE};

#[derive(Accounts)]
pub struct Withdraw  <'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL],
        bump = global.bump,
        has_one = authority,
        has_one = fee_recipient,
    )]
    pub global: Account<'info, Global>,

    #[account(mut)]
    pub fee_recipient: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [BONDING_CURVE, bonding_curve.mint.key().as_ref()],
        bump = bonding_curve.bump,
        has_one = mint,
        constraint = bonding_curve.complete @ Errors::BondingCurveNotComplete,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        mut,
        seeds = [CURVE_VAULT, bonding_curve.mint.key().as_ref()],
        bump = bonding_curve.vault_bump, 
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = bonding_curve,
    )]
    pub bonding_curve_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = authority,
        token::token_program = token_program    
    )]
    pub user_ata: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl <'info> Withdraw <'info> {
    pub fn withdraw_funds(&mut self) -> Result<()> {

        

        let remaining_tokens = self.bonding_curve_ata.amount;

        let remaining_sol = self.vault.get_lamports();

        self.withdraw_token(remaining_tokens)?;

        self.withdraw_sol(remaining_sol)?;

        emit!(FundsWithdrawn {
            mint: self.mint.key(),
            user: self.authority.key(),
            tokens_withdrawn: remaining_tokens,
            sol_withdrawn: remaining_sol,
        });

        Ok(())
    }

    pub fn withdraw_sol (&mut self, remaining_sol:u64) -> Result<()> {

        // let platform_fee = 6_000_000_000; // 6 SOL

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.authority.to_account_info(),
        };

        let seeds = &[
            CURVE_VAULT,
            &self.mint.to_account_info().key.as_ref(),
            &[self.bonding_curve.vault_bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(ctx, remaining_sol.checked_sub(MIGRATION_FEE).ok_or(Errors::Underflow)?)?;

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.fee_recipient.to_account_info(),
        };

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(ctx, MIGRATION_FEE)

    }

    pub fn withdraw_token (&mut self, remaining_token: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_account = TransferChecked {
            from: self.bonding_curve_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.user_ata.to_account_info(),
            authority: self.bonding_curve.to_account_info(),
        };

        let seeds = &[
            BONDING_CURVE,
            &self.mint.to_account_info().key.as_ref(),
            &[self.bonding_curve.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_account, signer_seeds);

        transfer_checked(ctx, remaining_token, 6)

    }


}