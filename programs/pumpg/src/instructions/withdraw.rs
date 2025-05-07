use anchor_lang::{prelude::*,
    system_program::{transfer, Transfer}
};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked}
};

use crate::{bonding_curve, compute_S, errors::Errors, BondingCurve, FundsWithdrawn, Global, TokenSold, COMPLETION_LAMPORTS};

#[derive(Accounts)]
pub struct Withdraw  <'info> {
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global"],
        bump = global.bump,
    )]
    pub global: Account<'info, Global>,

    /// CHECK: we explicitly verify below in `buy_tokens()` that
    /// the provided key equals `global.fee_recipient`
    #[account(
        mut,
    )]
    pub fee_recipient: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"bonding-curve", mint.key().as_ref()],
        bump = bonding_curve.bump,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub bonding_curve_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_ata: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl <'info> Withdraw <'info> {
    pub fn withdraw_funds(&mut self) -> Result<()> {

        let bonding_curve = &mut self.bonding_curve;
        
        if !bonding_curve.complete {
            return Err(Errors::BondingCurveNotComplete.into());
        }
        if *self.user.key != self.global.authority {
            return Err(Errors::NotAuthorized.into());
        }

        let remaining_tokens = self.bonding_curve_ata.amount;

        let remaining_sol = self.bonding_curve.get_lamports();

        emit!(FundsWithdrawn {
            mint: self.mint.key(),
            user: self.user.key(),
            tokens_withdrawn: remaining_tokens,
            sol_withdrawn: remaining_sol,
        });

        Ok(())
    }

    pub fn withdraw_sol (&mut self) -> Result<()> {
        let sol_amount = self.bonding_curve.get_lamports();

        let platform_fee = 6_000_000_000; // 6 SOL

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.bonding_curve.to_account_info(),
            to: self.user.to_account_info(),
        };

        let seeds = &[
            &b"bonding-curve"[..],
            &self.mint.key().to_bytes()[..],
            &[self.bonding_curve.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(ctx, sol_amount.checked_sub(platform_fee).unwrap())?;

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.bonding_curve.to_account_info(),
            to: self.fee_recipient.to_account_info(),
        };

        let seeds = &[
            &b"bonding-curve"[..],
            &self.mint.key().to_bytes()[..],
            &[self.bonding_curve.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts,signer_seeds);

        transfer(ctx, platform_fee)

    }

    pub fn withdraw_token (&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_account = TransferChecked {
            from: self.bonding_curve_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.user_ata.to_account_info(),
            authority: self.bonding_curve.to_account_info(),
        };

        let seeds = &[
            &b"bonding-curve"[..],
            &self.mint.key().to_bytes()[..],
            &[self.bonding_curve.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_account, signer_seeds);

        transfer_checked(ctx, self.bonding_curve_ata.amount, 6)

    }


}