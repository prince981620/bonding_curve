use anchor_lang::{prelude::*,
    system_program::{transfer, Transfer}
};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked}
};

use crate::{compute_s, errors::Errors, BondingCurve, Global, TokenSold, BONDING_CURVE, COMPLETION_LAMPORTS, CURVE_VAULT, GLOBAL};

#[derive(Accounts)]
pub struct Sell <'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL],
        bump = global.bump,
    )]
    pub global: Account<'info, Global>,

    #[account(
        mut,
        constraint = fee_recipient.key() == global.fee_recipient.key(),
    )]
    pub fee_recipient: SystemAccount<'info>,

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
        seeds = [CURVE_VAULT, bonding_curve.mint.key().as_ref()], // PDA seeds for the vault.
        bump = bonding_curve.vault_bump, // Bump seed for the vault PDA.
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
        token::authority = user,
        token::token_program = token_program    
    )]
    pub user_ata: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl <'info> Sell<'info> {
    pub fn sell_tokens(&mut self, amount: u64, min_sol_output: u64) -> Result<()> {

        require!(amount > 0 && amount <= u64::MAX, Errors::Overflow);

        require!(min_sol_output > 0 , Errors::Overflow);

        // check slippage
        // calculate the varient before and after swap
  
        let bonding_curve: &mut Account<'info, BondingCurve> = &mut self.bonding_curve;

        // if bonding_curve.complete {
        //     return Err(Errors::BondingCurveComplete.into());
        // }

        let t_current = bonding_curve.total_tokens_sold;
        let t_new = t_current.checked_sub(amount).ok_or(Errors::Underflow)?;
        let s_new = compute_s(t_new)?;
        let s_current = bonding_curve.total_lamports_spent;
        let delta_s = s_current.checked_sub(s_new).ok_or(Errors::Underflow)?;

        //  check if s_new is ever greater than s_current 
         
        // let delta_S128 = u128::try_from(delta_s).or(Err(Errors::Overflow))?;

        if delta_s < min_sol_output {
            return Err(Errors::TooLittleSolReceived.into());
        }

        // u128::try_from(delta_s) 

        // let fee_amount = (delta_s as u128 * self.global.fee_basis_points as u128 / 10_000)
        //     .try_into()
        //     .map_err(|_| Errors::InvalidCalculation)?;
        // let delta_s_after_fee = delta_s.checked_sub(fee_amount).ok_or(Errors::Underflow)?;

        let fee_amount = delta_s
            .checked_mul(self.global.fee_basis_points)
            .unwrap()
            .checked_div(10000_u64)
            .unwrap();

        self.send_token(amount)?;

        self.send_sol(delta_s, fee_amount)?;


        self.update_bonding_curve(delta_s, amount, s_new, t_new)?;

        

        emit!(TokenSold {
            mint: self.mint.key(),
            user: self.user.key(),
            amount,
            sol_received: delta_s,
            fee: fee_amount,
        });
        
        Ok(())
    }

    pub fn send_sol (&mut self, sol_amount: u64, platform_fee: u64) -> Result<()> {

        // let platform_fee = sol_amount
        //     .checked_mul(self.global.fee_basis_points)
        //     .unwrap()
        //     .checked_div(10000_u64)
        //     .unwrap();

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        let seeds = &[
            CURVE_VAULT,
            &self.mint.to_account_info().key.as_ref(),
            &[self.bonding_curve.vault_bump],
        ];  

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(ctx, sol_amount.checked_sub(platform_fee).unwrap())?;

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts: Transfer<'_> = Transfer {
            from: self.vault.to_account_info(),
            to: self.fee_recipient.to_account_info(),
        };

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts,signer_seeds);

        transfer(ctx, platform_fee)

    }

    pub fn send_token (&mut self, token_amount: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_account = TransferChecked {
            from: self.user_ata.to_account_info(),
            mint: self.mint.to_account_info(),
            to: self.bonding_curve_ata.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let ctx = CpiContext::new(cpi_program, cpi_account);

        transfer_checked(ctx, token_amount, 6)

    }

    pub fn update_bonding_curve(&mut self, delta_s_after_fee: u64, amount: u64, s_new: u64, t_new: u64) -> Result<()> {
        let bonding_curve = &mut self.bonding_curve;

        bonding_curve.set_inner(BondingCurve {
            mint: bonding_curve.mint,
            virtual_token_reserve: bonding_curve.virtual_token_reserve + amount,
            virtual_sol_reserve: bonding_curve.virtual_sol_reserve - delta_s_after_fee,
            real_token_reserve: bonding_curve.real_token_reserve + amount,
            real_sol_reserve: bonding_curve.real_sol_reserve - delta_s_after_fee,
            token_total_supply: bonding_curve.token_total_supply,
            complete: s_new >= COMPLETION_LAMPORTS,
            total_tokens_sold: t_new,
            total_lamports_spent: s_new,
            initializer: bonding_curve.initializer,
            bump: bonding_curve.bump,
            vault_bump: bonding_curve.vault_bump,
            _padding: [0; 7],
        });

        Ok(())
    }
}