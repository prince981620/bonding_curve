use anchor_lang::{prelude::*,
    system_program::{transfer, Transfer}
};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked}
};

use crate::{bonding_curve, compute_S, errors::Errors, BondingCurve, Global, TokenPurchased, COMPLETION_LAMPORTS};

#[derive(Accounts)]
pub struct Buy <'info> {
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

impl <'info> Buy <'info> {
    pub fn buy_tokens(&mut self, amount: u64, max_sol_cost: u64) -> Result<()> {
        let bonding_curve: &mut Account<'info, BondingCurve> = &mut self.bonding_curve;
        if bonding_curve.complete {
            return Err(Errors::BondingCurveComplete.into());
        }
        
        if self.fee_recipient.key() != self.global.fee_recipient.key() {
            return Err(Errors::InvalidFeeAccount.into());
        }

        let T_current = bonding_curve.total_tokens_sold;
        let T_new = T_current.checked_add(amount).ok_or(Errors::Overflow)?;
        if T_new > bonding_curve.real_token_reserve {
            return Err(Errors::InsufficientTokens.into());
        }

        let S_new = compute_S(T_new)?;
        let S_current = bonding_curve.total_lamports_spent;
        let delta_S = S_new.checked_sub(S_current).ok_or(Errors::Underflow)?;
        if delta_S > max_sol_cost {
            return Err(Errors::TooMuchSolRequired.into());
        }

        let fee_amount = (delta_S as u128 * self.global.fee_basis_points as u128 / 10_000)
            .try_into()
            .map_err(|_| Errors::InvalidCalculation)?;
        let delta_S_after_fee = delta_S.checked_sub(fee_amount).ok_or(Errors::Underflow)?;

        self.send_sol(max_sol_cost)?;

        self.send_token(amount)?;

        self.update_bonding_curve(delta_S_after_fee, amount, S_new, T_new)?;

        
        emit!(TokenPurchased {
            mint: self.mint.key(),
            user: self.user.key(),
            amount,
            sol_spent: delta_S,
            fee: fee_amount,
        });
        
        // let bonding_curve = &mut self.bonding_curve;

        // let current_virtual_sol_reserve = bonding_curve.virtual_sol_reserve;
        // let current_virtual_token_reserve = bonding_curve.virtual_token_reserve;
        // let current_real_sol_reserve = bonding_curve.real_sol_reserve;
        // let current_real_token_reserve = bonding_curve.real_token_reserve;
        // let token_total_supply = bonding_curve.token_total_supply;
        
        Ok(())
    }

    pub fn send_sol (&mut self, sol_amount: u64) -> Result<()> {
        let platform_fee = sol_amount
            .checked_mul(self.global.fee_basis_points)
            .unwrap()
            .checked_div(10000_u64)
            .unwrap();

        let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.bonding_curve.to_account_info(),
        };

        let ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(ctx, sol_amount.checked_sub(platform_fee).unwrap())?;

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
            &b"bonding-curve"[..],
            &self.mint.key().to_bytes()[..],
            &[self.bonding_curve.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_account, signer_seeds);

        transfer_checked(ctx, token_amount, 6)

    }

    pub fn update_bonding_curve(&mut self, delta_S_after_fee: u64, amount: u64, S_new: u64, T_new: u64) -> Result<()> {
        let bonding_curve = &mut self.bonding_curve;

        bonding_curve.set_inner(BondingCurve {
            virtual_token_reserve: bonding_curve.virtual_token_reserve - amount,
            virtual_sol_reserve: bonding_curve.virtual_sol_reserve + delta_S_after_fee,
            real_token_reserve: bonding_curve.real_token_reserve - amount,
            real_sol_reserve: bonding_curve.real_sol_reserve + delta_S_after_fee,
            token_total_supply: bonding_curve.token_total_supply,
            complete: S_new >= COMPLETION_LAMPORTS,
            total_tokens_sold: T_new,
            total_lamports_spent: S_new,
            initializer: bonding_curve.initializer,
            bump: bonding_curve.bump,
            _padding: [0; 7],
        });

        Ok(())
    }

    // pub fn update_bonding_curve(&mut self, sol_amount: u64, token_amount: u64) -> Result<()> {
    //     let bonding_curve = &mut self.bonding_curve;



    //     /*
    //         pub virtual_token_reserve: u64,
    //         pub virtual_sol_reserve: u64,
    //         pub real_token_reserve: u64,
    //         pub real_sol_reserve: u64,
    //         pub token_total_supply: u64,
    //         pub complete: bool,
    //         pub total_tokens_sold: u64,
    //         pub total_lamports_spent: u64,
    //         pub bump: u8,
    //      */

    //     // update virtual reserves

    //     bonding_curve.virtual_token_reserve = bonding_curve
    //         .virtual_token_reserve
    //         .checked_add(token_amount)
    //         .unwrap();

    //     bonding_curve.virtual_sol_reserve = bonding_curve
    //         .virtual_sol_reserve
    //         .checked_add(sol_amount)
    //         .unwrap();

    //     // update real reserves
    //     bonding_curve.real_token_reserve = bonding_curve
    //         .real_token_reserve
    //         .checked_add(token_amount)
    //         .unwrap();

    //     bonding_curve.real_sol_reserve = bonding_curve
    //         .real_sol_reserve
    //         .checked_add(sol_amount)
    //         .unwrap();

    //     // update total supply 

    //     bonding_curve.token_total_supply = bonding_curve
    //         .token_total_supply
    //         .checked_sub(token_amount)
    //         .unwrap();

    //     // update total tokens sold
    //     bonding_curve.total_tokens_sold = bonding_curve
    //         .total_tokens_sold
    //         .checked_add(token_amount)
    //         .unwrap();

    //     // update total lamports spent
    //     bonding_curve.total_lamports_spent = bonding_curve
    //         .total_lamports_spent
    //         .checked_add(sol_amount)
    //         .unwrap();

    //     Ok(())

    // }

}