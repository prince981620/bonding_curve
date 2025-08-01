// use anchor_lang::{prelude::*,
//     system_program::{transfer, Transfer}
// };

// use anchor_spl::{
//     associated_token::AssociatedToken,
//     token::{sync_native, Mint, SyncNative, Token, TokenAccount, transfer_checked, TransferChecked}
// };

// use crate::{errors::Errors, BondingCurve, Global, BONDING_CURVE, CURVE_VAULT, GLOBAL, MIGRATION_FEE, WSOL_ID};

// #[derive(Accounts)]
// pub struct TransferSol  <'info> {
//     #[account(mut)]
//     pub authority: Signer<'info>,

//     #[account(
//         seeds = [GLOBAL],
//         bump = global.bump,
//         has_one = authority,
//         has_one = fee_recipient,
//         constraint = matches!(global.paused, false) @ Errors::ContractPaused,
//     )]
//     pub global: Account<'info, Global>,

//     #[account(mut)]
//     pub fee_recipient: SystemAccount<'info>,

//     #[account(
//         mut,
//         seeds = [BONDING_CURVE, bonding_curve.mint.key().as_ref()],
//         bump = bonding_curve.bump,
//         constraint = bonding_curve.complete @ Errors::BondingCurveNotComplete,
//     )]
//     pub bonding_curve: Account<'info, BondingCurve>,

//     #[account(
//         mut,
//         seeds = [CURVE_VAULT, bonding_curve.mint.key().as_ref()],
//         bump = bonding_curve.vault_bump, 
//     )]
//     pub vault: SystemAccount<'info>,

//     #[account(
//         mut,
//         associated_token::mint = mint,
//         associated_token::authority = bonding_curve,
//     )]
//     pub bonding_curve_ata: Account<'info, TokenAccount>,

//     #[account(
//         mut,
//         token::mint = wsol_mint,
//         token::authority = authority,
//         token::token_program = token_program    
//     )]
//     pub user_wsol_ata: Account<'info, TokenAccount>, // make this bonding curve wsol ata later

//     #[account(
//         mut,
//         token::mint = mint,
//         token::authority = authority,
//         token::token_program = token_program    
//     )]
//     pub user_ata: Account<'info, TokenAccount>,

//     #[account(
//         mut,
//         address = WSOL_ID
//     )]
//     pub wsol_mint: Box<Account<'info, Mint>>,

//     pub mint: Account<'info, Mint>,

//     pub token_program: Program<'info, Token>,
//     pub associated_token_program: Program<'info, AssociatedToken>,
//     pub system_program: Program<'info, System>,
// }

// impl <'info> TransferSol <'info> {

//     pub fn prepare_for_migration(&mut self) -> Result<()> {
//         self.withdraw_token()?;
//         self.transfer_and_wrap_sol()?;

//         Ok(())
//     }

//     pub fn withdraw_token (&mut self) -> Result<()> {

//         let remaining_token = self.bonding_curve_ata.amount;

//         let cpi_program = self.token_program.to_account_info();

//         let cpi_account = TransferChecked {
//             from: self.bonding_curve_ata.to_account_info(),
//             mint: self.mint.to_account_info(),
//             to: self.user_ata.to_account_info(),
//             authority: self.bonding_curve.to_account_info(),
//         };

//         let seeds = &[
//             BONDING_CURVE,
//             &self.mint.to_account_info().key.as_ref(),
//             &[self.bonding_curve.bump],
//         ];

//         let signer_seeds = &[&seeds[..]];

//         let ctx = CpiContext::new_with_signer(cpi_program, cpi_account, signer_seeds);

//         transfer_checked(ctx, remaining_token, 6)

//     }


//     pub fn transfer_and_wrap_sol (&mut self) -> Result<()> {

//         // let platform_fee = 6_000_000_000; // 6 SOL

//         let remaining_sol = self.vault.get_lamports();

//         // let user_share = LAMPORTS_PER_SOL.checked_div(2).ok_or(Errors::Underflow)?;

//         let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

//         let cpi_accounts = Transfer {
//             from: self.vault.to_account_info(),
//             to: self.user_wsol_ata.to_account_info(),
//         };

//         let seeds = &[
//             CURVE_VAULT,
//             &self.bonding_curve.mint.as_ref(),
//             &[self.bonding_curve.vault_bump],
//         ];

//         let signer_seeds = &[&seeds[..]];

//         let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

//         transfer(ctx, remaining_sol.checked_sub(MIGRATION_FEE).ok_or(Errors::Underflow)?)?;

//         let sync_ctx = CpiContext::new(
//             self.token_program.to_account_info(),
//             SyncNative {
//                 account: self.user_wsol_ata.to_account_info()
//             },
//         );

//         sync_native(sync_ctx)?;

//         let cpi_program: AccountInfo<'_> = self.system_program.to_account_info();

//         let cpi_accounts = Transfer {
//             from: self.vault.to_account_info(),
//             to: self.fee_recipient.to_account_info(),
//         };

//         let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

//         transfer(ctx, MIGRATION_FEE)

//     }

// }