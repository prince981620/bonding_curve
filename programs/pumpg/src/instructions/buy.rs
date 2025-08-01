use anchor_lang::{prelude::*,
    system_program::{transfer, Transfer}
};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked}
};

use crate::{compute_s_in, errors::Errors, BondingCurve, Global, TokenPurchased, BONDING_CURVE, COMPLETION_LAMPORTS, CURVE_VAULT, GLOBAL};

#[derive(Accounts)]
pub struct Buy <'info> {
    
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [GLOBAL],
        bump = global.bump,
        constraint = matches!(global.paused, false) @ Errors::ContractPaused,
    )]
    pub global: Account<'info, Global>,

    #[account(
        mut,
        constraint = fee_recipient.key() == global.fee_recipient.key(),
    )]
    pub fee_recipient: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [CURVE_VAULT, bonding_curve.mint.key().as_ref()], // PDA seeds for the vault.
        bump = bonding_curve.vault_bump, // Bump seed for the vault PDA.
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [BONDING_CURVE, bonding_curve.mint.key().as_ref()],
        bump = bonding_curve.bump,
        has_one = mint,
        constraint = matches!(bonding_curve.complete, false) @ Errors::BondingCurveComplete,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = bonding_curve,
    )]
    pub bonding_curve_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = user,
        token::token_program = token_program    
    )]
    pub user_ata: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl <'info> Buy <'info> {
    pub fn buy_tokens(&mut self, amount: u64, max_sol_cost: u64) -> Result<()> {
        //  check remaining allowed input must be under the max sol cost

        require!(amount > 0 && amount <= u64::MAX, Errors::Underflow); // use forever

        require!(amount <= self.bonding_curve.real_token_reserve, Errors::InsufficientTokens); // use forever

        require!(max_sol_cost > 0 , Errors::Underflow);

        
        let mut t_new = amount;

        if amount >= self.bonding_curve.real_token_reserve {
            t_new = self.bonding_curve.real_token_reserve;
        }

        let s_in: u64 = compute_s_in(self.bonding_curve.virtual_token_reserve, self.bonding_curve.virtual_sol_reserve, t_new)?;


        let fee_amount = s_in
            .checked_mul(self.global.fee_basis_points)
            .ok_or(Errors::Overflow)?
            .checked_div(10000_u64)
            .ok_or(Errors::Overflow)?;

        if s_in.checked_add(fee_amount).ok_or(Errors::Overflow)? > max_sol_cost {
            return Err(Errors::TooMuchSolRequired.into());
        }


        self.send_sol(s_in, fee_amount)?;

        self.send_token(t_new)?;

        if self.bonding_curve.real_sol_reserve > COMPLETION_LAMPORTS {
            self.bonding_curve.complete = true;
        }

        self.update_bonding_curve(s_in, t_new)?;

        
        emit!(TokenPurchased {
            mint: self.mint.key(),
            user: self.user.key(),
            amount,
            sol_spent: s_in,
            fee: fee_amount,
        });
        
        Ok(())
    }

    pub fn send_sol (&mut self, sol_amount: u64,platform_fee: u64) -> Result<()> {

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.vault.to_account_info(),
        };

        let ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(ctx, sol_amount)?;

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.fee_recipient.to_account_info(),
        };

        let ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(ctx, platform_fee)

    }

    pub fn send_token (&mut self, token_amount: u64) -> Result<()> {

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

        transfer_checked(ctx, token_amount, 6)

    }

    pub fn update_bonding_curve(&mut self, s_in: u64, amount: u64) -> Result<()> {
        //  update v reserves

        self.bonding_curve.virtual_token_reserve = self.bonding_curve.virtual_token_reserve.checked_sub(amount).ok_or(Errors::Underflow)?;
        self.bonding_curve.virtual_sol_reserve = self.bonding_curve.virtual_sol_reserve.checked_add(s_in).ok_or(Errors::Overflow)?;
        
        // update real reserves

        self.bonding_curve.real_token_reserve = self.bonding_curve.real_token_reserve.checked_sub(amount).ok_or(Errors::Underflow)?;
        self.bonding_curve.real_sol_reserve = self.bonding_curve.real_sol_reserve.checked_add(s_in).ok_or(Errors::Overflow)?;
        
        // check and update bonding curve

        if self.bonding_curve.real_token_reserve <= 0 {
            self.bonding_curve.complete = true ;
        }


        Ok(())
    }

}